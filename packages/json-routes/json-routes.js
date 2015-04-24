var Fiber = Npm.require("fibers");
var connect = Npm.require('connect');
var connectRoute = Npm.require('connect-route');

JsonRoutes = {};

WebApp.rawConnectHandlers.use(connect.bodyParser());
WebApp.rawConnectHandlers.use(connect.query());

// List of all defined JSON API endpoints
JsonRoutes.routes = [];

_.each(["get", "post"], function (method) {
  JsonRoutes[method] = function (path, handler) {
    // Make sure path starts with a slash
    if (path[0] !== "/") {
      path = "/" + path;
    }

    // Add to list of known endpoints
    JsonRoutes.routes.push({
      method: method,
      path: path
    });

    // Register as a middleware
    WebApp.rawConnectHandlers.use(connectRoute(function (router) {
      router[method](path, function (req, res, next) {
        Fiber(function () {
          handler(req, res, next);
        }).run();
      });
    }));
  };
});

JsonRoutes.setNoCacheHeaders = function (res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Pragma', 'no-cache');
};

JsonRoutes.sendResult = function (res, code, json) {
  JsonRoutes.setNoCacheHeaders(res);
  res.statusCode = code;

  if (json !== undefined) {
    res.setHeader("Content-type", "application/json");
    res.write(JSON.stringify(json));
  }

  res.end();
};