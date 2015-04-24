var Fiber = Npm.require("fibers");
var connect = Npm.require('connect');
var connectRoute = Npm.require('connect-route');

JsonRoutes = {};

WebApp.rawConnectHandlers.use(connect.bodyParser());
WebApp.rawConnectHandlers.use(connect.query());

_.each(["get", "post"], function (method) {
  JsonRoutes[method] = function (path, handler) {
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