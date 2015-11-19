if (Meteor.isServer) {
  JsonRoutes.ErrorMiddleware.use(
    '/handle-error',
    RestMiddleware.handleErrorAsJson
  );

  JsonRoutes.add('get', 'handle-error', function () {
    var error = new Meteor.Error('not-found', 'Not Found');
    error.statusCode = 404;
    throw error;
  });
} else { // Meteor.isClient
  testAsyncMulti('Middleware - JSON Error Handling - ' +
    'handle standard Connect error with JSON response', [
    function (test, waitFor) {
      HTTP.get(Meteor.absoluteUrl('/handle-error'),
        waitFor(function (err, resp) {
          test.equal(resp.statusCode, 404);
          test.equal(resp.data.error, 'not-found');
          test.equal(resp.data.reason, 'Not Found');
        }));
    },
  ]);
}
