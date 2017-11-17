if (Meteor.isServer) {
  JsonRoutes.Middleware.use(
    '/handle-whatever',
    JsonRoutes.Middleware.handleCors
  );

  JsonRoutes.add('get', 'handle-whatever', function () {
    JsonRoutes.sendResult(res, { data: { msg: 'ok' } });
  });
} else { // Meteor.isClient
  testAsyncMulti('Middleware - CORS Handling - ' +
    'handle standard CORS headers', [
    function (test, waitFor) {
      HTTP.get(Meteor.absoluteUrl('/handle-whatever'),
        waitFor(function (err, resp) {
          test.equal(resp.statusCode, 200);
          test.equal(resp.headers['Access-Control-Allow-Origin'], origin);
          test.equal(resp.headers['Access-Control-Allow-Methods'], 'GET, PUT, POST, DELETE, OPTIONS');
          test.equal(resp.headers['Access-Control-Allow-Headers'], 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Requested-With');
          test.equal(resp.headers['Access-Control-Allow-Credentials'], 'true');
        }));
    },
  ]);
}
