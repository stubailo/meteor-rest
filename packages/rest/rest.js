SimpleRest = {};

// Can be used to limit which collections get endpoints:
// {
//   collections: ['widgets', 'doodles']
// }
// By default all do. Use empty array for none.
//
// Also:
//    objectIdCollections: ['widgets', 'doodles']
SimpleRest._config = {};
SimpleRest.configure = function (config) {
  return _.extend(SimpleRest._config, config);
};

SimpleRest._methodOptions = {};

// Set options for a particular DDP method that will later be defined
SimpleRest.setMethodOptions = function (name, options) {
  check(name, String);

  // Throw an error if the Method is already defined - too late to pass
  // options
  if (_.has(Meteor.server.method_handlers, name)) {
    throw new Error('Must pass options before Method is defined: ' +
      name);
  }

  options = options || {};

  _.defaults(options, {
    url: 'methods/' + name,
    getArgsFromRequest: defaultGetArgsFromRequest,
    httpMethod: 'post',
  });

  SimpleRest._methodOptions[name] = options;
};

var oldPublish = Meteor.publish;
Meteor.publish = function (name, handler, options) {
  options = options || {};

  var httpOptionKeys = [
    'url',
    'getArgsFromRequest',
    'httpMethod',
  ];

  var httpOptions = _.pick(options, httpOptionKeys);
  var ddpOptions = _.omit(options, httpOptionKeys);

  // Register DDP publication
  oldPublish(name, handler, ddpOptions);

  _.defaults(httpOptions, {
    url: 'publications/' + name,
    getArgsFromRequest: defaultGetArgsFromRequest,
    httpMethod: 'get',
  });

  JsonRoutes.add(httpOptions.httpMethod, httpOptions.url, function (req, res) {
    var userId = req.userId || null;

    var httpSubscription = new HttpSubscription({
      request: req,
      userId: userId,
    });

    httpSubscription.on('ready', function (response) {
      JsonRoutes.sendResult(res, {data: response});
    });

    var handlerArgs = httpOptions.getArgsFromRequest(req);

    var handlerReturn = handler.apply(httpSubscription, handlerArgs);

    // Fast track for publishing cursors - we don't even need livequery here,
    // just making a normal DB query
    if (handlerReturn && handlerReturn._publishCursor) {
      httpPublishCursor(handlerReturn, httpSubscription);
      httpSubscription.ready();
    } else if (handlerReturn && _.isArray(handlerReturn)) {
      // We don't need to run the checks to see if
      // the cursors overlap and stuff
      // because calling Meteor.publish will do that for us :]
      _.each(handlerReturn, function (cursor) {
        httpPublishCursor(cursor, httpSubscription);
      });

      httpSubscription.ready();
    }
  });
};

var oldMethods = Object.getPrototypeOf(Meteor.server).methods;
Meteor.method = function (name, handler, options) {
  if (!SimpleRest._methodOptions[name]) {
    SimpleRest.setMethodOptions(name, options);
  } else if (options) {
    throw Error('Options already passed via setMethodOptions.');
  }

  var methodMap = {};
  methodMap[name] = handler;
  oldMethods.call(Meteor.server, methodMap);

  // This is a default collection mutation method, do some special things to
  // make it more RESTful
  if (insideDefineMutationMethods) {
    var collectionName = name.split('/')[1];

    if (_.isArray(SimpleRest._config.collections) &&
       !_.contains(SimpleRest._config.collections, collectionName)) return;

    var isObjectId = false;
    if (_.isArray(SimpleRest._config.objectIdCollections) &&
       _.contains(SimpleRest._config.objectIdCollections, collectionName)) {
      isObjectId = true;
    }

    var modifier = name.split('/')[2];

    var collectionUrl = '/' + collectionName;
    var itemUrl = '/' + collectionName + '/:_id';

    if (modifier === 'insert') {
      // Post the entire new document
      addHTTPMethod(name, handler, {
        httpMethod: 'post',
        url: collectionUrl,
      });
    } else if (modifier === 'update') {
      // PATCH means you submit an incomplete document, to update the fields
      // you have passed
      addHTTPMethod(name, handler, {
        url: itemUrl,
        httpMethod: 'patch',
        getArgsFromRequest: function (req) {
          var id = req.params._id;
          if (isObjectId) id = new Mongo.ObjectID(id);
          return [{ _id: id }, { $set: req.body }];
        },
      });

      // We don't have PUT because allow/deny doesn't let you replace documents
      // you can define it manually if you want
    } else if (modifier === 'remove') {
      // Can only remove a single document by the _id
      addHTTPMethod(name, handler, {
        url: itemUrl,
        httpMethod: 'delete',
        getArgsFromRequest: function (req) {
          var id = req.params._id;
          if (isObjectId) id = new Mongo.ObjectID(id);
          return [{ _id: id }];
        },
      });
    }

    return;
  }

  addHTTPMethod(name, handler, options);
};

// Monkey patch _defineMutationMethods so that we can treat them specially
// inside Meteor.method
var insideDefineMutationMethods = false;
var oldDMM = Mongo.Collection.prototype._defineMutationMethods;
Mongo.Collection.prototype._defineMutationMethods = function () {
  insideDefineMutationMethods = true;
  oldDMM.apply(this, arguments);
  insideDefineMutationMethods = false;
};

Meteor.methods = Object.getPrototypeOf(Meteor.server).methods =
  function (methodMap) {
    _.each(methodMap, function (handler, name) {
      Meteor.method(name, handler);
    });
  };

function addHTTPMethod(methodName, handler, options) {
  options = options || SimpleRest._methodOptions[methodName] || {};

  options = _.defaults(options, {
    getArgsFromRequest: defaultGetArgsFromRequest,
  });

  JsonRoutes.add('options', options.url, function (req, res) {
    JsonRoutes.sendResult(res);
  });

  JsonRoutes.add(options.httpMethod, options.url, function (req, res) {
    var userId = req.userId || null;
    var statusCode = 200;

    var invocation = new DDPCommon.MethodInvocation({
      isSimulation: false,
      userId: userId,
      setUserId: function () {
        throw Error('setUserId not implemented in this ' +
                      'version of simple:rest');
      },
      unblock: function () {
      },
      setHttpStatusCode: function (code) {
        statusCode = code;
      },
      connection: {},
    });
    var result = DDP._CurrentInvocation.withValue(invocation, function () {
      var handlerArgs = options.getArgsFromRequest(req);
      return handler.apply(invocation, handlerArgs);
    });
    JsonRoutes.sendResult(res, {
      code: statusCode,
      data: result,
    });
  });
}

function httpPublishCursor(cursor, subscription) {
  _.each(cursor.fetch(), function (document) {
    subscription.added(cursor._cursorDescription.collectionName,
      document._id, document);
  });
}

function defaultGetArgsFromRequest(req) {
  var args = [];
  if (req.method === 'POST') {
    // by default, the request body is an array which is the arguments
    args = EJSON.fromJSONValue(req.body);

    // If it's an object, pass the entire object as the only argument
    if (!_.isArray(args)) {
      args = [args];
    }
  }

  _.each(req.params, function (value, name) {
    var parsed = parseInt(name, 10);

    if (_.isNaN(parsed)) {
      throw new Error('REST publish doesn\'t support parameters ' +
                      'whose names aren\'t integers.');
    }

    args[parsed] = value;
  });

  return args;
}
