JsonRoutes.Middleware.use(JsonRoutes.Middleware.authenticateMeteorUserByToken);
JsonRoutes.Middleware.use(JsonRoutes.Middleware.parseBearerToken);

JsonRoutes.add('options', '/users/login', function (req, res) {
  JsonRoutes.sendResult(res, 200);
});

JsonRoutes.add('post', '/users/login', function (req, res) {
  var options = req.body;

  var user;
  if (options.hasOwnProperty('email')) {
    check(options, {
      email: String,
      password: String,
    });
    user = Meteor.users.findOne({ 'emails.address': options.email });
  } else {
    check(options, {
      username: String,
      password: String,
    });
    user = Meteor.users.findOne({ username: options.username });
  }

  if (!user) {
    throw new Meteor.Error('not-found',
      'User with that username or email address not found.');
  }

  var result = Accounts._checkPassword(user, options.password);
  check(result, {
    userId: String,
    error: Match.Optional(Meteor.Error),
  });

  if (result.error) {
    throw result.error;
  }

  var stampedLoginToken = Accounts._generateStampedLoginToken();
  check(stampedLoginToken, {
    token: String,
    when: Date,
  });

  Accounts._insertLoginToken(result.userId, stampedLoginToken);

  var tokenExpiration = Accounts._tokenExpiration(stampedLoginToken.when);
  check(tokenExpiration, Date);

  JsonRoutes.sendResult(res, 200, {
    id: result.userId,
    token: stampedLoginToken.token,
    tokenExpires: tokenExpiration,
  });

});

JsonRoutes.add('options', '/users/register', function (req, res) {
  JsonRoutes.sendResult(res, 200);
});

JsonRoutes.add('post', '/users/register', function (req, res) {
  var options = req.body;

  check(options, {
    username: Match.Optional(String),
    email: Match.Optional(String),
    password: String,
  });

  var userId = Accounts.createUser(
    _.pick(options, 'username', 'email', 'password'));

  // Log in the new user and send back a token
  var stampedLoginToken = Accounts._generateStampedLoginToken();
  check(stampedLoginToken, {
    token: String,
    when: Date,
  });

  // This adds the token to the user
  Accounts._insertLoginToken(userId, stampedLoginToken);

  var tokenExpiration = Accounts._tokenExpiration(stampedLoginToken.when);
  check(tokenExpiration, Date);

  // Return the same things the login method returns
  JsonRoutes.sendResult(res, 200, {
    token: stampedLoginToken.token,
    tokenExpires: tokenExpiration,
    id: userId,
  });
});
