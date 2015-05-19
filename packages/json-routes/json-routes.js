var Fiber = Npm.require("fibers");
var connect = Npm.require('connect');
var connectRoute = Npm.require('connect-route');

JsonRoutes = {};

WebApp.rawConnectHandlers.use(connect.bodyParser());
WebApp.rawConnectHandlers.use(connect.query());

JsonRoutes.middleWare = connect();
WebApp.rawConnectHandlers.use(JsonRoutes.middleWare);

// List of all defined JSON API endpoints
JsonRoutes.routes = [];

// Save reference to router for later
var connectRouter;

// Register as a middleware
WebApp.rawConnectHandlers.use(connectRoute(function (router) {
  connectRouter = router;
}));

JsonRoutes.add = function (method, path, handler) {
  // Make sure path starts with a slash
  if (path[0] !== "/") {
    path = "/" + path;
  }

  // Add to list of known endpoints
  JsonRoutes.routes.push({
    method: method,
    path: path
  });

  connectRouter[method](path, function (req, res, next) {
    Fiber(function () {
      handler(req, res, next);
    }).run();
  });
};

var responseHeaders = {
  "Cache-Control": "no-store",
  "Pragma": "no-cache"
};

JsonRoutes.setResponseHeaders = function (headers) {
  responseHeaders = headers;
};

var setHeaders = function (res) {
  _.each(responseHeaders, function (value, key) {
    res.setHeader(key, value);
  });
};

var defaultConfig = {
  prettyPrintResponses: false
};

var config = defaultConfig;
JsonRoutes.config = function (userConfig) {
  config = _.extend({}, defaultConfig, userConfig);
};

/**
 * Sets the response headers, status code, and body, and ends it. The JSON response will be pretty printed if NODE_ENV is `development` or if you have configured `prettyPrintResponses: true`.
 * @param {Object}   res  Response object
 * @param {Number}   code HTTP status code. If `json` argument is an `Error` object, this will be overwritten based on the error.
 * @param {Object|Array|null|undefined|Error} json The object to stringify as the response. If `null`, the response will be "null". If `undefined`, there will be no response body. If an `Error` type, a JSON representation of the error details will be sent.
 */
JsonRoutes.sendResult = function (res, code, json) {
  setHeaders(res);

  // Convert `Error` objects to JSON representations
  if (json) {
    if (json instanceof Meteor.Error) {
      json = {
        error: json.error,
        reason: json.reason,
        details: json.details
      };
      code = _.isNumber(json.error) ? json.error : 400;
    } else if (json.sanitizedError instanceof Meteor.Error) {
      json = {
        error: json.sanitizedError.error,
        reason: json.sanitizedError.reason,
        details: json.sanitizedError.details
      };
      code = _.isNumber(json.error) ? json.error : 400;
    } else if (json instanceof Error) {
      json = {
        error: "internal-server-error",
        reason: "Internal server error"
      };
      code = 500;
    }
  }

  // Set status code on response
  res.statusCode = code;

  // Set response body
  if (json !== undefined) {
    var shouldPrettyPrint = (config.prettyPrintResponses || process.env.NODE_ENV === 'development');
    var spacer = shouldPrettyPrint ? 2 : null;
    res.setHeader("Content-type", "application/json");
    res.write(JSON.stringify(json, null, spacer));
  }

  // Send the response
  res.end();
};
