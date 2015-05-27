/* global JsonRoutes:false - from simple:json-routes package */
/* global HTTP:false - from http package */
/* global testAsyncMulti:false - from test-helpers package */

if (Meteor.isServer) {
  JsonRoutes.add("get", "accounts-bearer-token", function (req, res) {
    JsonRoutes.sendResult(res, 200, req.userId);
  });
}
else { // Meteor.isClient
  var token;
  var userId;
  testAsyncMulti("Bearer Token Middleware - " +
                 "should set req.userId using standard bearer token", [
    function (test, expect) {
      Meteor.call("clearUsers", expect(function () {}));
    },
    function (test, expect) {
      HTTP.post("/users/register", { data: {
        username: "test",
        email: "test@test.com",
        password: "test"
      }}, expect(function (err, res) {
        test.equal(err, null);
        test.isTrue(Match.test(res.data, {
          id: String,
          token: String,
          tokenExpires: String
        }));

        token = res.data.token;
        userId = res.data.id;
      }));
    },
    function (test, expect) {
      // Test custom endpoint
      HTTP.get("/accounts-bearer-token", {
        headers: { Authorization: "Bearer " + token }
      }, expect(function (err, res) {
        test.equal(err, null);
        test.equal(res.data, userId);
      }));
    }
  ]);
}
