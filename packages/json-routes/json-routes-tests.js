const methodNames = ['GET', 'Get', 'get'];
const argFormats = ['1.0', '1.1'];

// This package is also tested in the `simple:rest` package.
argFormats.forEach((argFormat) => {
  if (Meteor.isServer) {
    methodNames.forEach((methodName) => {
      JsonRoutes.add(methodName,
        `case-insensitive-method-${methodName}-${argFormat}`,
        (req, res) => {
          if (argFormat === '1.1') {
            JsonRoutes.sendResult(res, {data: true});
          } else {
            JsonRoutes.sendResult(res, 200, true);
          }
        });
    });
  } else {
    // Meteor.isClient
    testAsyncMulti(`JSON Routes - case-insensitive HTTP methods ${argFormat}`,
      methodNames.map((methodName) => {
        return (test, expect) => {
          HTTP.get(`/case-insensitive-method-${methodName}-${argFormat}`,
            expect((err, res) => {
              test.equal(err, null);
              test.equal(res.data, true);
            }));
        };
      }));
  }
});
