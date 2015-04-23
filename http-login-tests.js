if (Meteor.isServer) {
  Meteor.methods({
    clearUsers: function () {
      if (Meteor.users.find().count() > 100) {
        throw new Error("a lot of users. are you running this in prod??");
      }

      Meteor.users.remove({});
    },
    getUser: function (username) {
      return Meteor.users.findOne({username: username});
    },
    getLogs: function () {
      return logs;
    }
  });
} else {
  var registerEndpoint = '/users/register';
  var userId;

  testAsyncMulti("users - register over HTTP", [
    function (test, expect) {
      Meteor.call("clearUsers", expect(function () {}));
    },

    // Test a bunch of invalid registration inputs
    function (test, expect) {
      var testErrorReason = function (data, errorMsg) {
        var callback = expect(function (err) {
          test.equal(err.response.data.reason, errorMsg);
        });

        HTTP.post(registerEndpoint, {
          data: data
        }, callback);
      };

      testErrorReason({}, "Match failed");
    },

    // First, test registration without session
    function (test, expect) {
      HTTP.post(registerEndpoint, { data: {
        username: "newuser",
        password: "test",
        email: "newuser@example.com"
      } }, expect(function (err, res) {
        if (err) { throw err; }

        userId = res.data.id;

        // Make sure results have the right shape
        check(res.data, {
          token: String,
          tokenExpires: String,
          id: String
        });
      }));
    },
    function (test, expect) {
      Meteor.loginWithPassword("newuser", "test", expect(function (err) {
        // Make sure there is no error
        test.equal(err, undefined);

        // Make sure we logged into the right user
        test.equal(Meteor.userId(), userId);
      }));
    },

    // Test registering with an existing username or email
    function (test, expect) {

      // Existing username
      HTTP.post(registerEndpoint, { data: {
        username: "newuser",
        password: "test",
        email: "newuser2@example.com"
      } }, expect(function (err) {
        test.equal(err.response.data.reason, "Username already exists.");
      }));

      // Existing email
      HTTP.post(registerEndpoint, { data: {
        username: "newuser2",
        password: "test",
        email: "newuser@example.com"
      } }, expect(function (err) {
        test.equal(err.response.data.reason, "Email already exists.");
      }));
    }
  ]);
}