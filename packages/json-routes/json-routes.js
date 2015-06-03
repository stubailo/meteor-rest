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
      try {
        handler(req, res, next);
      } catch (err) {
        JsonRoutes.sendError(res, getStatusCodeFromError(err), err);
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

/**
 * Convert `Error` objects to plain response objects suitable
 * for serialization.
 *
 * @param {Any} [error] Should be a Meteor.Error or Error object. If anything
 *   else is passed or this argument isn't provided, a generic
 *   "internal-server-error" object is returned
 */
JsonRoutes._errorToJson = function (error) {
  if (error instanceof Meteor.Error) {
    return buildErrorResponse(error);
  } else if (error && error.sanitizedError instanceof Meteor.Error) {
    return buildErrorResponse(error.sanitizedError);
  } else {
    return {
      error: 'internal-server-error',
      reason: 'Internal server error'
    };
  }
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

/**
 * Sets the response headers, status code, and body, and ends it.
 * The JSON response will be pretty printed if NODE_ENV is `development`.
 *
 * @param {Object} res Response object
 * @param {Number} code The status code to send. Default is 500.
 * @param {Error|Meteor.Error} error The error object to stringify as
 *   the response. A JSON representation of the error details will be
 *   sent. You can set `error.data` or `error.sanitizedError.data` to
 *   some extra data to be serialized and sent with the response.
 */
JsonRoutes.sendError = function (res, code, error) {
  // Set headers on response
  setHeaders(res);

  // If no error passed in, use the default empty error
  error = error || new Error();

  // Set status code on response
  res.statusCode = code || 500;

  // Convert `Error` objects to JSON representations
  var json = JsonRoutes._errorToJson(error);

  // Set response body
  writeJsonToBody(res, json);

  // Send the response
  res.end();
};

function setHeaders(res) {
  _.each(responseHeaders, function (value, key) {
    res.setHeader(key, value);
  });
}

function getStatusCodeFromError(error) {
  // Bail out if no error passed in
  if (! error) {
    return 500;
  }

  // If an error or sanitizedError has a `statusCode` property, we use that.
  // This allows packages to check whether JsonRoutes package is used and if so,
  // to include a specific error status code with the errors they throw.
  if (error.sanitizedError && error.sanitizedError.statusCode) {
    return error.sanitizedError.statusCode;
  }

  if (error.statusCode) {
    return error.statusCode;
  }

  // At this point, we know the error doesn't have any attached error code
  if (error instanceof Meteor.Error ||
    (error.sanitizedError instanceof Meteor.Error)) {
      // If we at least put in some effort to throw a user-facing Meteor.Error,
      // the default code should be less severe
      return 400;
  }

  // Most pessimistic case: internal server error 500
  return 500;
}

function buildErrorResponse(errObj) {
  // If an error has a `data` property, we
  // send that. This allows packages to include
  // extra client-safe data with the errors they throw.
  var fields = ['error', 'reason', 'details', 'data'];
  return _.pick(errObj, fields);
}

function writeJsonToBody(res, json) {
  if (json !== undefined) {
    var shouldPrettyPrint = (process.env.NODE_ENV === 'development');
    var spacer = shouldPrettyPrint ? 2 : null;
    res.setHeader("Content-type", "application/json");
    res.write(JSON.stringify(json, null, spacer));
  }
}
