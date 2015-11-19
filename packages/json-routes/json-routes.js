/* global JsonRoutes:true */

var Fiber = Npm.require('fibers');
var connect = Npm.require('connect');
var connectRoute = Npm.require('connect-route');

JsonRoutes = {};

WebApp.connectHandlers.use(connect.urlencoded());
WebApp.connectHandlers.use(connect.json());
WebApp.connectHandlers.use(connect.query());

// Handler for adding middleware before an endpoint (JsonRoutes.middleWare
// is just for legacy reasons). Also serves as a namespace for middleware
// packages to declare their middleware functions.
JsonRoutes.Middleware = JsonRoutes.middleWare = connect();
WebApp.connectHandlers.use(JsonRoutes.Middleware);

// List of all defined JSON API endpoints
JsonRoutes.routes = [];

// Save reference to router for later
var connectRouter;

// Register as a middleware
WebApp.connectHandlers.use(connectRoute(function (router) {
  connectRouter = router;
}));

// Error middleware must be added last, to catch errors from prior middleware.
// That's why we cache them and then add after startup.
var errorMiddlewares = [];
JsonRoutes.ErrorMiddleware = {
  use: function () {
    errorMiddlewares.push(arguments);
  },
};

Meteor.startup(function () {
  _.each(errorMiddlewares, function (errorMiddleware) {
    WebApp.connectHandlers.use.apply(WebApp.connectHandlers, errorMiddleware);
  });

  errorMiddlewares = [];
});

JsonRoutes.add = function (method, path, handler) {
  // Make sure path starts with a slash
  if (path[0] !== '/') {
    path = '/' + path;
  }

  // Add to list of known endpoints
  JsonRoutes.routes.push({
    method: method,
    path: path,
  });

  connectRouter[method.toLowerCase()](path, function (req, res, next) {
    // Set headers on response
    setHeaders(res);
    Fiber(function () {
      try {
        handler(req, res, next);
      } catch (error) {
        next(error);
      }
    }).run();
  });
};

var responseHeaders = {
  'Cache-Control': 'no-store',
  Pragma: 'no-cache',
};

JsonRoutes.setResponseHeaders = function (headers) {
  responseHeaders = headers;
};

/**
 * Sets the response headers, status code, and body, and ends it.
 * The JSON response will be pretty printed if NODE_ENV is `development`.
 *
 * @param {Object} res Response object
 * @param {Number} code HTTP status code.
 * @param {Object|Array|null|undefined} data The object to stringify as
 *   the response. If `null`, the response will be "null". If
 *   `undefined`, there will be no response body.
 */
JsonRoutes.sendResult = function (res, code, data) {
  // Set headers on response
  setHeaders(res);

  // Set status code on response
  res.statusCode = code || 200;

  // Set response body
  writeJsonToBody(res, data);

  // Send the response
  res.end();
};

function setHeaders(res) {
  _.each(responseHeaders, function (value, key) {
    res.setHeader(key, value);
  });
}

function writeJsonToBody(res, json) {
  if (json !== undefined) {
    var shouldPrettyPrint = (process.env.NODE_ENV === 'development');
    var spacer = shouldPrettyPrint ? 2 : null;
    res.setHeader('Content-type', 'application/json');
    res.write(JSON.stringify(json, null, spacer));
  }
}
