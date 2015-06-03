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

### JsonRoutes.sendError(response, code, error)

Return an error response from a route.

- `response` - Required. The Node response object you got as an argument to your handler function.
- `code` - Optional. The status code to send. Default is 500.
- `error` - Optional. An `Error` or `Meteor.Error` object. A JSON representation of the error details will be sent. You can set `error.data` or `error.sanitizedError.data` to some extra data to be serialized and sent with the response.

### JsonRoutes.setResponseHeaders(headerObj)

Set the headers used by `JsonRoutes.sendResult` for the response. Default value is:

```js
{
  "Cache-Control": "no-store",
  "Pragma": "no-cache"
}
```

## Adding middlewares

If you want to insert connect middleware and ensure that it runs before your 
REST route is hit, use `JsonRoutes.middleWare`.

```js
JsonRoutes.middleWare.use(function (req, res, next) {
  console.log(req.body);
  next();
});
```

## Change log

#### Unreleased

- Allow case-insensitive method names to be passed as the first param to `JsonRoutes.add()` (e.g., `JsonRoutes.add('get',...)` and `JsonRoutes.add('GET',...)` are both acceptable)
- Add `JsonRoutes.sendError` with automatic parsing of error objects.
- Catch handler errors and automatically send a response. Look for `statusCode` and `data` properties on thrown errors.

#### 1.0.3

Add `JsonRoutes.middleWare`

[connect-route]: https://github.com/baryshev/connect-route
[connect-route L4]: https://github.com/baryshev/connect-route/blob/06f92e07dc8e4690f7f788df39b37b5db4b06f90/lib/connect-route.js#L4