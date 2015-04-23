var Future = Npm.require("fibers/future");

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

  var httpHandler = function () {
    this.setContentType('application/json');

    var httpSubscription = new HttpSubscription({
      request: this.request
    });

    console.log("got request!");

    var fut = new Future();

    httpSubscription.on("ready", function (response) {
      fut.return(response);
    });

    var handlerArgs = getArgsFromRequest(this);
    var res = handler.apply(httpSubscription, handlerArgs);

    // Fast track for publishing cursors - we don't even need livequery here,
    // just making a normal DB query
    if (res && res._publishCursor) {
      try {
        httpPublishCursor(res, httpSubscription);
        httpSubscription.ready();
      } catch (e) {
        httpSubscription.error(e);
      }
    } else if (res && _.isArray(res)) {
      // We don't need to run the checks to see if the cursors overlap and stuff
      // because calling Meteor.publish will do that for us :]
      try {
        _.each(res, function (cursor) {
          httpPublishCursor(cursor, httpSubscription);
        });

        httpSubscription.ready();
      } catch (e) {
        httpSubscription.error(e);
      }
    }

    return fut.wait();
  };

  var methodObj = {};
  methodObj[httpName] = {
    get: httpHandler
  };

  HTTP.methods(methodObj);
};

function httpPublishCursor(cursor, subscription) {
  _.each(cursor.fetch(), function (document) {
    subscription.added(cursor._cursorDescription.collectionName,
      document._id, document);
  });
}

function getArgsFromRequest(methodScope) {
  var args = [];

  _.each(methodScope.params, function (value, name) {
    var parsed = parseInt(name, 10);

    if (_.isNaN(parsed)) {
      throw new Error("REST publish doesn't support parameters whose names aren't integers.");
    }

    args[parsed] = value;
  });

  return args;
}
