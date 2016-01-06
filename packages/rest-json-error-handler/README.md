# simple:rest-json-error-handler

SimpleRest error middleware for converting thrown Meteor.Errors to JSON and sending the response.

## Usage

Handle errors from all routes:

```js
JsonRoutes.ErrorMiddleware.use(RestMiddleware.handleErrorAsJson);
```

Handle errors from one route:

```js
JsonRoutes.ErrorMiddleware.use(
  '/handle-error',
  RestMiddleware.handleErrorAsJson
);
```

## Example

```js
JsonRoutes.ErrorMiddleware.use(
  '/handle-error',
  RestMiddleware.handleErrorAsJson
);

JsonRoutes.add('get', 'handle-error', function () {
  var error = new Meteor.Error('not-found', 'Not Found');
  error.statusCode = 404;
  throw error;
});
```
