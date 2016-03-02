if (Meteor.isServer) {
  JsonRoutes.add('get', 'accounts-auth-user', function (req, res) {
    JsonRoutes.sendResult(res, {data: req.userId});
  });
} else { // Meteor.isClient
  var token;
  var userId;

  testAsyncMulti('Middleware - Authenticate User By Token - set req.userId', [
    function (test, waitFor) {
      Meteor.call('clearUsers', waitFor(function () {
      }));
    },

    function (test, waitFor) {
      HTTP.post('/users/register', {
        data: {
          username: 'test',
          email: 'test@test.com',
          password: 'test',
        },
      }, waitFor(function (err, res) {
        test.equal(err, null);
        test.isTrue(Match.test(res.data, {
          id: String,
          token: String,
          tokenExpires: String,
        }));

        token = res.data.token;
        userId = res.data.id;
      }));
    },

    function (test, waitFor) {
      HTTP.get('/accounts-auth-user', {
        headers: {Authorization: 'Bearer ' + token},
      }, waitFor(function (err, res) {
        test.equal(err, null);
        test.equal(res.data, userId);
      }));
    },
  ]);
}
