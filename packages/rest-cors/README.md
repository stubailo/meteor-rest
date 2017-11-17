# simple:rest-cors

SimpleRestCors middleware for automatically allowing all CORS headers

And responding with a request's `origin` as allowed.

See [this fetch issue](https://github.com/whatwg/fetch/issues/251) for information on it,
in short, allow `*` is not enough, you have to allow the specific origin.

## Usage

Automatically allow CORS for every request from all routes:

```js
JsonRoutes.Middleware.use(JsonRoutes.Middleware.handleCors);
```

Handle CORS from one route:

```js
JsonRoutes.Middleware.use(
  '/handle-whatever',
  JsonRoutes.Middleware.handleCors
);
```

## Example

```js
JsonRoutes.Middleware.use(
  '/handle-whatever',
  RestMiddleware.handleCors
);

JsonRoutes.add('get', 'handle-whatever', function () {
  JsonRoutes.sendResult(res, { data: { msg: 'ok' } });
});
```

## Usage from client

```
fetch('http://localhost:3000/handle-whatever', {
    method: 'post',
    body: JSON.stringify({test:1})
  }).then(function(response) {
    return response.json();
  }).then(function(data) {
    console.log('Resp:', data);
  }).catch(function(e) {
    console.error(e);
  });
```
