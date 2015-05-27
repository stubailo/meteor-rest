// This package is also tested in the `simple:rest` package.
if (Meteor.isServer) {
  JsonRoutes.add("GET", "case-insensitive-method-1", function (req, res) {
    JsonRoutes.sendResult(res, 200, true);
  });
  JsonRoutes.add("Get", "case-insensitive-method-2", function (req, res) {
    JsonRoutes.sendResult(res, 200, true);
  });
  JsonRoutes.add("get", "case-insensitive-method-3", function (req, res) {
    JsonRoutes.sendResult(res, 200, true);
  });
}
else { // Meteor.isClient
  testAsyncMulti("JSON Routes - should support case-insensitive HTTP method types", [
    function (test, expect) {
      HTTP.get("/case-insensitive-method-1", expect(function (err, res) {
        test.equal(err, null);
        test.equal(res.data, true);
      }));
    },
    function (test, expect) {
      HTTP.get("/case-insensitive-method-2", expect(function (err, res) {
        test.equal(err, null);
        test.equal(res.data, true);
      }));
    },
    function (test, expect) {
      HTTP.get("/case-insensitive-method-3", expect(function (err, res) {
        test.equal(err, null);
        test.equal(res.data, true);
      }));
    }
  ]);
}