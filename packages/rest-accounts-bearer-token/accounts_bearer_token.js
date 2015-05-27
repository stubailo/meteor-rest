var Fiber = Npm.require("fibers");

// Add the authorized user ID, if any, to the request
JsonRoutes.middleWare.use(function (req, res, next) {
  Fiber(function () {
    var userId = getUserIdFromRequest(req);
    if (userId) {
      req.userId = userId;
    }
    next();
  }).run();
});

// Get the user ID from the standard bearer token authorization header
function getUserIdFromRequest(req) {
  if (! _.has(Package, "accounts-base")) {
    return null;
  }

  // Looks like "Authorization: Bearer <token>"
  var token = req.headers.authorization &&
    req.headers.authorization.split(" ")[1];

  if (! token) {
    return null;
  }

  // Check token expiration
  var tokenExpires = Package["accounts-base"].Accounts._tokenExpiration(token.when);
  if (new Date() >= tokenExpires) {
    throw new Meteor.Error("token-expired", "Your login token has expired. Please log in again.");
  }

  var user = Meteor.users.findOne({
    "services.resume.loginTokens.hashedToken": hashToken(token)
  });

  if (user) {
    return user._id;
  } else {
    return null;
  }
}

function hashToken(unhashedToken) {
  check(unhashedToken, String);

  // The Accounts._hashStampedToken function has a questionable API where
  // it actually takes an object of which it only uses one property, so don't
  // give it any more properties than it needs.
  var hashStampedTokenArg = { token: unhashedToken };
  var hashStampedTokenReturn = Package["accounts-base"].Accounts._hashStampedToken(hashStampedTokenArg);
  check(hashStampedTokenReturn, {
    hashedToken: String
  });

  // Accounts._hashStampedToken also returns an object, get rid of it and just
  // get the one property we want.
  return hashStampedTokenReturn.hashedToken;
}