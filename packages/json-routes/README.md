# simple:json-routes

<https://atmospherejs.com/simple/json-routes>

The simplest bare-bones way to define server-side JSON API endpoints, without
any extra functionality. Based on [connect-route].

## Example

```js
JsonRoutes.add("get", "/posts/:id", function (req, res, next) {
  var id = req.params.id;

  JsonRoutes.sendResult(res, 200, Posts.findOne(id));
});
```

## API

### JsonRoutes.add(method, path, handler)

Add a server-side route that returns JSON.

- `method` - The HTTP method that this route should accept: `"get"`, `"post"`,
  etc. See the full list [here][connect-route L4]. The method name is
  case-insensitive, so `'get'` and `'GET'` are both acceptable.
- `path` - The path, possibly with parameters prefixed with a `:`. See the
  example.
- `handler(request, response, next)` - A handler function for this route.
  `request` is a Node request object, `response` is a Node response object,
  `next` is a callback to call to let the next middleware handle this route. You
  don't need to use this normally.

### JsonRoutes.sendResult(response, code, data)

Return data fom a route.

- `response` - Required. The Node response object you got as an argument to your handler function.
- `code` - Optional. The status code to send. `200` for OK, `500` for internal error, etc. Default is 200.
- `data` - Optional. The data you want to send back. This is serialized to JSON with content type `application/json`. If `undefined`, there will be no response body.

### Errors

We recommend that you simply throw an Error or Meteor.Error from your handler function. You can then attach error handling middleware that converts those errors to JSON and sends the response. Here's how to do it with our default error middleware:

```js
JsonRoutes.ErrorMiddleware.use(
  '/widgets',
  RestMiddleware.handleErrorAsJson
);

JsonRoutes.add('get', 'widgets', function () {
  var error = new Meteor.Error('not-found', 'Not Found');
  error.statusCode = 404;
  throw error;
});
```

### JsonRoutes.setResponseHeaders(headerObj)

Set the headers used by `JsonRoutes.sendResult` for the response. Default value is:

```js
{
  "Cache-Control": "no-store",
  "Pragma": "no-cache"
}
```

## Adding Middleware

If you want to insert connect middleware and ensure that it runs before your
REST route is hit, use `JsonRoutes.Middleware`.

```js
JsonRoutes.Middleware.use(function (req, res, next) {
  console.log(req.body);
  next();
});
```

## Creating Middleware Packages

Once you've created an awesome piece of reusable middleware and you're ready to
share it with the world, you should make it a Meteor package so it can be easily
configured in any JSON Routes API. There are only two simple requirements.
Actually, they're just very strong recommendations. Nothing will explode if you
don't follow these guidelines, but doing so should promote a much cleaner
middleware ecosystem.

Each middleware package should define a single middleware function and add it
to `RestMiddleware` namespace:

```js
RestMiddleware.someMiddlewareFunc = function (req, res, next) {
  // Do some awesome middleware stuff here
};

RestMiddleware.someMiddlewareErrorFunc = function (err, req, res, next) {
  // Do some awesome middleware error handling here
};
```

Alternatively, you could publish a pure NodeJS middleware package to NPM, and you will be able to require it and use it in your Meteor package or app.

### Auth Middleware

- By convention, any middleware you create that parses the request to find an authentication token should then save that token on `req.authToken`. See `simple:rest-bearer-token-parser` for an example.
- By convention, any middleware you create that determines a user ID should save that ID on `req.userId`. See `simple:authenticate-user-by-token` for an example.

## Change Log

#### 1.0.4

- Allow case-insensitive method names to be passed as the first param to `JsonRoutes.add()` (e.g., `JsonRoutes.add('get',...)` and `JsonRoutes.add('GET',...)` are both acceptable)
- Add `JsonRoutes.sendError` with automatic parsing of error objects.
- Catch handler errors and automatically send a response. Look for `statusCode` and `data` properties on thrown errors.
- Add `JsonRoutes.Middleware` to eventually replace `JsonRoutes.middleWare` (since 'middleware' is one word)
- Fix Connect middleware deprecation error https://github.com/stubailo/meteor-rest/issues/18

#### 1.0.3

Add `JsonRoutes.middleWare` for adding middleware to the stack

[connect-route]: https://github.com/baryshev/connect-route
[connect-route L4]: https://github.com/baryshev/connect-route/blob/06f92e07dc8e4690f7f788df39b37b5db4b06f90/lib/connect-route.js#L4
