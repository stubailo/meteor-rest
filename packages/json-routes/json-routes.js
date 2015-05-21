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
      try {
        handler(req, res, next);
      } catch (err) {
        JsonRoutes.sendResult(res, null, err);
      }
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

// Convert `Error` objects to JSON representations
JsonRoutes._errorToJson = function (data) {
  if (!data) {
    return data;
  }

  // If an error has a `jsonResponse` property, we
  // send that. This allows packages to check whether
  // JsonRoutes package is used and if so, to include
  // a specific error response body with the errors they throw.
  if (data instanceof Meteor.Error) {
    return data.jsonResponse || {
      error: data.error,
      reason: data.reason,
      details: data.details
    };
  } else if (data.sanitizedError instanceof Meteor.Error) {
    return data.sanitizedError.jsonResponse || {
      error: data.sanitizedError.error,
      reason: data.sanitizedError.reason,
      details: data.sanitizedError.details
    };
  } else if (data instanceof Error) {
    return data.jsonResponse || {
      error: "internal-server-error",
      reason: "Internal server error"
    };
  }

  // Data was not an error
  return data;
};

var setStatusCode = function (res, code, data) {
  if (!data) {
    res.statusCode = code || 200;
    return;
  }

  // If an error has a `statusCode` property, we
  // use that. This allows packages to check whether
  // JsonRoutes package is used and if so, to include
  // a specific error status code with the errors they throw.
  if (data instanceof Meteor.Error) {
    res.statusCode = data.statusCode || 400;
  } else if (data.sanitizedError instanceof Meteor.Error) {
    res.statusCode = data.sanitizedError.statusCode || data.statusCode || 400;
  } else if (data instanceof Error) {
    res.statusCode = data.statusCode || 500;
  } else {
    res.statusCode = code || 200;
  }
};

/**
 * Sets the response headers, status code, and body, and ends it. The JSON response will be pretty printed if NODE_ENV is `development`.
 * @param {Object}   res  Response object
 * @param {Number}   code HTTP status code. If `json` argument is an `Error` object, this will be overwritten based on the error.
 * @param {Object|Array|null|undefined|Error} data The object to stringify as the response. If `null`, the response will be "null". If `undefined`, there will be no response body. If an `Error` type, a JSON representation of the error details will be sent.
 */
JsonRoutes.sendResult = function (res, code, data) {
  // Set headers on response
  setHeaders(res);
  // Set status code on response
  setStatusCode(res, code, data);

  // Convert `Error` objects to JSON representations
  var json = JsonRoutes._errorToJson(data);

  // Set response body
  if (json !== undefined) {
    var shouldPrettyPrint = (process.env.NODE_ENV === 'development');
    var spacer = shouldPrettyPrint ? 2 : null;
    res.setHeader("Content-type", "application/json");
    res.write(JSON.stringify(json, null, spacer));
  }

  // Send the response
  res.end();
};
