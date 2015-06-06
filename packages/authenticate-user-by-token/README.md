# simple:authenticate-user-by-token

SimpleRest middleware for validating a Meteor.user's login token

## Middleware Name

This middleware can be accessed as: 

**`JsonRoutes.Middleware.authenticateMeteorUserByToken`**

### Request Properties Required

- `request.authToken`
  - _String_
  - A valid login token for a `Meteor.user` account (requires `accounts-base`)

### Request Properties Modified

- `request.userId`
  - _String_
  - If the `request.authToken` is found in a user account, sets this to the ID of the authenticated user. Otherwise, `null`. 

## Usage

Simply add this layer of middleware after any token parsing middleware, and voila!

For example: 

```js
JsonRoutes.Middleware.use('/auth', JsonRoutes.Middleware.parseBearerToken);
JsonRoutes.Middleware.use('/auth', JsonRoutes.Middleware.authenticateMeteorUserByToken);

JsonRoutes.add('GET', 'auth/test', function (request, response) {
  // The authenticated user's ID will be set by this middleware
  var userId = request.userId;
});