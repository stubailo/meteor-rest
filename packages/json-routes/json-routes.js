/* global JsonRoutes:true */

var Fiber = Npm.require("fibers");
var connect = Npm.require('connect');
var connectRoute = Npm.require('connect-route');

JsonRoutes = {};

WebApp.rawConnectHandlers.use(connect.bodyParser());
WebApp.rawConnectHandlers.use(connect.query());

// Handler for adding middleware before an endpoint (JsonRoutes.middleWare
// is just for legacy reasons). Also serves as a namespace for middleware
// packages to declare their middleware functions.
JsonRoutes.Middleware = JsonRoutes.middleWare = connect();
WebApp.rawConnectHandlers.use(JsonRoutes.Middleware);

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

  connectRouter[method.toLowerCase()](path, function (req, res, next) {
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

JsonRoutes.sendResult = function (res, code, json) {
  setHeaders(res);
  res.statusCode = code;

  if (json !== undefined) {
    var spacer = process.env.NODE_ENV === 'development' ? 2 : null;
    res.setHeader("Content-type", "application/json");
    res.write(JSON.stringify(json, null, spacer));
  }

  res.end();
};
