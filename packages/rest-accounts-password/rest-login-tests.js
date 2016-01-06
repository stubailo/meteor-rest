if (Meteor.isServer) {
  Meteor.methods({
    clearUsers: function () {
      if (Meteor.users.find().count() > 100) {
        throw new Error('a lot of users. are you running this in prod??');
      }

      Meteor.users.remove({});
    },

    getUser: function (username) {
      return Meteor.users.findOne({username: username});
    },
  });
} else {
  var loginEndpoint = '/users/login';
  var registerEndpoint = '/users/register';
  var userId;

  testAsyncMulti('REST Accounts Password - register and login over HTTP', [
    function (test, waitFor) {
      Meteor.call('clearUsers', waitFor(function () {}));
    },

    // Test a bunch of invalid registration inputs
    function (test, waitFor) {
      var testErrorReason = function (data, errorMsg) {
        var callback = waitFor(function (err) {
          test.equal(err.response.data.reason, errorMsg);
        });

        HTTP.post(registerEndpoint, {
          data: data,
        }, callback);
      };

      testErrorReason({}, 'Match failed');
    },

    function (test, waitFor) {
      HTTP.post(registerEndpoint, { data: {
        username: 'newuser',
        password: 'test',
        email: 'newuser@example.com',
      }, }, waitFor(function (err, res) {
        if (err) { throw err; }

        userId = res.data.id;

        // Make sure results have the right shape
        check(res.data, {
          token: String,
          tokenExpires: String,
          id: String,
        });
      }));
    },

    function (test, waitFor) {
      Meteor.loginWithPassword('newuser', 'test', waitFor(function (err) {
        // Make sure there is no error
        test.equal(err, undefined);

        // Make sure we logged into the right user
        test.equal(Meteor.userId(), userId);
      }));
    },

    function (test, waitFor) {
      HTTP.post(loginEndpoint, { data: {
        username: 'newuser',
        password: 'test',
      }, }, waitFor(function (err, res) {
        // Make sure there is no error
        test.equal(err, null);

        // Make sure we logged into the right user
        test.equal(res.data.id, userId);
      }));
    },

    // Test bug fix in #21
    // The issue was if you had two accounts with empty emails, the first would
    // always be selected.
    function (test, waitFor) {
      HTTP.post(registerEndpoint, { data: {
        username: 'seconduser',
        password: 'test',
      }, }, waitFor(function (err) {
        if (err) { throw err; }
      }));
    },

    function (test, waitFor) {
      HTTP.post(registerEndpoint, { data: {
        username: 'thirduser',
        password: 'test',
      }, }, waitFor(function (err, res) {
        if (err) { throw err; }

        userId = res.data.id;
      }));
    },

    function (test, waitFor) {
      HTTP.post(loginEndpoint, { data: {
        username: 'thirduser',
        password: 'test',
      }, }, waitFor(function (err, res) {
        // Make sure there is no error
        test.equal(err, null);

        // Make sure we logged into the right user
        test.equal(res.data.id, userId);
      }));
    },

    // Test registering with an existing username or email
    function (test, waitFor) {

      // Existing username
      HTTP.post(registerEndpoint, { data: {
        username: 'newuser',
        password: 'test',
        email: 'newuser2@example.com',
      }, }, waitFor(function (err) {
        test.equal(err.response.data.reason, 'Username already exists.');
      }));

      // Existing email
      HTTP.post(registerEndpoint, { data: {
        username: 'newuser2',
        password: 'test',
        email: 'newuser@example.com',
      }, }, waitFor(function (err) {
        test.equal(err.response.data.reason, 'Email already exists.');
      }));
    },

    // Make sure we can register with no username, like accounts-password allows
    function (test, waitFor) {
      HTTP.post(registerEndpoint, { data: {
        password: 'test',
        email: 'newusernopassword@example.com',
      }, }, waitFor(function (err, res) {
        if (err) { throw err; }

        // Make sure results have the right shape
        check(res.data, {
          token: String,
          tokenExpires: String,
          id: String,
        });
      }));
    },

    // Make sure we can register with no email, like accounts-password allows
    function (test, waitFor) {
      HTTP.post(registerEndpoint, { data: {
        username: 'newusernoemail',
        password: 'test',
      }, }, waitFor(function (err, res) {
        if (err) { throw err; }

        // Make sure results have the right shape
        check(res.data, {
          token: String,
          tokenExpires: String,
          id: String,
        });
      }));
    },

    // Make sure we need an email or a username
    function (test, waitFor) {
      HTTP.post(registerEndpoint, { data: {
        password: 'test',
      }, }, waitFor(function (err) {
        test.equal(err.response.data.reason, 'Need to set a username or email');
      }));
    },
  ]);
}
