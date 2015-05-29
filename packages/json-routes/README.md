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

- `response` - the Node response object you got as an argument to your handler 
  function.
- `code` - the status code to send. `200` for OK, `500` for internal error, etc.
- `data` - the data you want to send back, will be sent as serialized JSON with 
  content type `application/json`.

### JsonRoutes.setResponseHeaders(headerObj)

Set the headers returned by `JsonRoutes.sendResult`. Default value is:

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
to the `JsonRoutes.Middleware` namespace:

```js
JsonRoutes.Middleware.someMiddlewareFunc = function (req, res, next) {
  // Do some awesome middleware stuff here
};
```

## Change log

#### Unreleased

- Add `JsonRoutes.Middleware` to eventually replace `JsonRoutes.middleWare` 
  (since 'middleware' is one word)
- Allow case-insensitive method names to be passed as the first param to 
  `JsonRoutes.add()` (e.g., `JsonRoutes.add('get',...)` and 
  `JsonRoutes.add('GET',...)` are both acceptable)

#### 1.0.3

Add `JsonRoutes.middleWare` for adding middleware to the stack

[connect-route]: https://github.com/baryshev/connect-route
[connect-route L4]: https://github.com/baryshev/connect-route/blob/06f92e07dc8e4690f7f788df39b37b5db4b06f90/lib/connect-route.js#L4