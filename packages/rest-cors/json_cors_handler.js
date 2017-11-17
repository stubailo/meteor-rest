/**
 * Handle CORS for any request
 *
 * @middleware
 */
// eslint-disable-next-line
JsonRoutes.Middleware.handleCors = function (request, response, next) { // jshint ignore:line
  const origin = (request.headers && request.headers.origin) || '*';
  const newHeaders = {
    CORSTEST: origin,
    'Cache-Control': 'no-store',
    Pragma: 'no-cache',
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'PUT, GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
  };
  if (!response.headers) response.headers = {};
  Object.keys(newHeaders).forEach(k => {
    if (!response.headers[k]) {
      response.headers[k] = newHeaders[k];
      response.setHeader(k, newHeaders[k]);
    }
  });
  next();
};
