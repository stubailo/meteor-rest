/**
 * Parses bearer token from the incoming request
 *
 * Accepts tokens passed via the standard headers, URL query parameters, or
 * request body (whichever is found first, in that order).
 *
 * Stores the token in req.authToken for later middleware.
 *
 * The header signature is: "Authorization: Bearer <token>".
 *
 * The query signature is: "?access_token=<token>"
 *
 * @middleware
 */
JsonRoutes.Middleware.parseBearerToken = function (req, res, next) {
  req.authToken = parseHeaders(req) || parseQuery(req);
  next();
};

/**
 * Parses bearer token from the Authorization header
 *
 * @param req {Object} The incoming Connect request
 * @returns {String} The bearer token
 * @private
 */
function parseHeaders(req) {
  if (req.headers && req.headers.authorization) {
    var parts = req.headers.authorization.split(' ');

    if (parts.length === 2) {
      var scheme = parts[0];
      var credentials = parts[1];

      if (/^Bearer$/i.test(scheme)) {
        return credentials;
      }
    }
  }
}

/**
 * Parses bearer token from URL query parameters
 *
 * @param req {Object} The incoming Connect request
 * @returns {String} The bearer token
 */
function parseQuery(req) {
  // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
  if (req.query && req.query.access_token) {
    return req.query.access_token;
  }

  // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
}
