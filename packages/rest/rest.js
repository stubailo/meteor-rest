var oldPublish = Meteor.publish;

Meteor.publish = function (name, handler, options) {
  options = options || {};

  var httpOptionKeys = [
    "url"
  ];

  var httpOptions = _.pick(options, httpOptionKeys);
  var ddpOptions = _.omit(options, httpOptionKeys);

  // Register DDP publication
  oldPublish(name, handler, ddpOptions);

  var httpName = httpOptions["url"] || "publications/" + name;

  JsonRoutes.add("get", httpName, function (req, res) {
    var token = getTokenFromRequest(req);
    var userId;
    if (token) {
      userId = getUserIdFromToken(token);
    }

    var httpSubscription = new HttpSubscription({
      request: req,
      userId: userId
    });

    httpSubscription.on("ready", function (response) {
      JsonRoutes.sendResult(res, 200, response);
    });

    httpSubscription.on("error", function (error) {
      JsonRoutes.sendResult(res, 500, error);
    });

    var handlerArgs = getArgsFromRequest(req);

    var handlerReturn = handler.apply(httpSubscription, handlerArgs);

    // Fast track for publishing cursors - we don't even need livequery here,
    // just making a normal DB query
    if (handlerReturn && handlerReturn._publishCursor) {
      try {
        httpPublishCursor(handlerReturn, httpSubscription);
        httpSubscription.ready();
      } catch (e) {
        httpSubscription.error(e);
      }
    } else if (handlerReturn && _.isArray(handlerReturn)) {
      // We don't need to run the checks to see if the cursors overlap and stuff
      // because calling Meteor.publish will do that for us :]
      try {
        _.each(handlerReturn, function (cursor) {
          httpPublishCursor(cursor, httpSubscription);
        });

        httpSubscription.ready();
      } catch (e) {
        httpSubscription.error(e);
      }
    }
  });
};

var oldMethods = Object.getPrototypeOf(Meteor.server).methods;
Meteor.method = function (name, handler, options) {
  options = options || {};
  var methodMap = {};
  methodMap[name] = handler;
  oldMethods.call(Meteor.server, methodMap);

  if (name[0] !== "/") {
    name = "/" + name;
  }

  var autoName = "methods" + name;
  var httpName = options.url || autoName;

  JsonRoutes.add("options", httpName, function (req, res) {
    JsonRoutes.sendResult(res, 200);
  });

  JsonRoutes.add("post", httpName, function (req, res) {
    var token = getTokenFromRequest(req);
    var userId;
    if (token) {
      userId = getUserIdFromToken(token);
    }

    // XXX replace with a real one?
    var methodInvocation = {
      userId: userId
    };

    var handlerArgs = getArgsFromRequest(req);

    try {
      var handlerReturn = handler.apply(methodInvocation, handlerArgs);
      JsonRoutes.sendResult(res, 200, handlerReturn);
    } catch (error) {
      var errorJson;
      if (error instanceof Meteor.Error) {
        errorJson = {
          error: error.error,
          reason: error.reason,
          details: error.details
        };
      } else {
        console.log("Internal server error in " + httpName, error, error.stack);
        errorJson = {
          error: "internal-server-error",
          reason: "Internal server error"
        };
      }
      JsonRoutes.sendResult(res, 500, errorJson);
    }
  });
};

Meteor.methods = Object.getPrototypeOf(Meteor.server).methods = function (methodMap) {
  _.each(methodMap, function (handler, name) {
    Meteor.method(name, handler);
  });
};

function getTokenFromRequest(req) {
  if (req.headers.authorization) {
    return req.headers.authorization.split(" ")[1];
  }

  return null;
}

function httpPublishCursor(cursor, subscription) {
  _.each(cursor.fetch(), function (document) {
    subscription.added(cursor._cursorDescription.collectionName,
      document._id, document);
  });
}

function getArgsFromRequest(methodScope) {
  var args = [];
  if (methodScope.method === "POST") {
    // by default, the request body is an array which is the arguments
    args = EJSON.fromJSONValue(methodScope.body);
  }

  _.each(methodScope.params, function (value, name) {
    var parsed = parseInt(name, 10);

    if (_.isNaN(parsed)) {
      throw new Error("REST publish doesn't support parameters whose names aren't integers.");
    }

    args[parsed] = value;
  });

  return args;
}

function hashToken(unhashedToken) {
  check(unhashedToken, String);

  // The Accounts._hashStampedToken function has a questionable API where
  // it actually takes an object of which it only uses one property, so don't
  // give it any more properties than it needs.
  var hashStampedTokenArg = { token: unhashedToken };
  var hashStampedTokenReturn = Accounts._hashStampedToken(hashStampedTokenArg);
  check(hashStampedTokenReturn, {
    hashedToken: String
  });

  // Accounts._hashStampedToken also returns an object, get rid of it and just
  // get the one property we want.
  return hashStampedTokenReturn.hashedToken;
}

function getUserIdFromToken(token) {
  var user = Meteor.users.findOne({
    "services.resume.loginTokens.hashedToken": hashToken(token)
  });

  if (user) {
    return user._id;
  } else {
    return null;
  }
}
