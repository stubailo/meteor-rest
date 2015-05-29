var SUCCESS_STATUS_CODE = 200;

if (Meteor.isServer) {
  JsonRoutes.Middleware.use(JsonRoutes.Middleware.parseBearerToken);

  JsonRoutes.add("get", "parse-bearer-token", function (req, res) {
    JsonRoutes.sendResult(res, 200, req.authToken);
  });

  JsonRoutes.add("post", "parse-bearer-token", function (req, res) {
    JsonRoutes.sendResult(res, 200, req.authToken);
  });
}
else { // Meteor.isClient
  var token = 'testToken';

  testAsyncMulti("Middleware - Bearer Token Parser - parse valid headers", [
    function (test, waitFor) {
      HTTP.get (Meteor.absoluteUrl ('/parse-bearer-token'), {
        headers: {authorization: 'Bearer ' + token}
      }, waitFor (function (err, resp) {
        test.equal (err, null);
        test.equal (resp.statusCode, SUCCESS_STATUS_CODE);
        test.equal (resp.data, token);
      }));
    }
  ]);

  testAsyncMulti('Middleware - Bearer Token Parser - parse valid query access_token', [
    function (test, waitFor) {
      HTTP.get (Meteor.absoluteUrl ('/parse-bearer-token'), {
        query: 'access_token=' + token
      }, waitFor(function (err, resp) {
        test.equal (err, null);
        test.equal (resp.statusCode, SUCCESS_STATUS_CODE);
        test.equal (resp.data, token);
      }));
    }
  ]);

  testAsyncMulti('Middleware - Bearer Token Parser - parse valid post body access_token', [
    function (test, waitFor) {
      HTTP.post (Meteor.absoluteUrl ('/parse-bearer-token'), {
        data: {access_token: token}
      }, waitFor(function (err, resp) {
        test.equal (err, null);
        test.equal (resp.statusCode, SUCCESS_STATUS_CODE);
        test.equal (resp.data, token);
      }));
    }
  ]);

  testAsyncMulti('Middleware - Bearer Token Parser - parse valid query bearer_token', [
    function (test, waitFor) {
      HTTP.get (Meteor.absoluteUrl ('/parse-bearer-token'), {
        query: 'bearer_token=' + token
      }, waitFor(function (err, resp) {
        test.equal (err, null);
        test.equal (resp.statusCode, SUCCESS_STATUS_CODE);
        test.equal (resp.data, token);
      }));
    }
  ]);

  testAsyncMulti('Middleware - Bearer Token Parser - parse valid post body bearer_token', [
    function (test, waitFor) {
      HTTP.post (Meteor.absoluteUrl ('/parse-bearer-token'), {
        headers: {'Content-Type': 'application/json'},
        data: {bearer_token: token}
      }, waitFor(function (err, resp) {
        test.equal (err, null);
        test.equal (resp.statusCode, SUCCESS_STATUS_CODE);
        test.equal (resp.data, token);
      }));
    }
  ]);
}
