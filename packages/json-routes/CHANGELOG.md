# Change log

## Unreleased

- Allow case-insensitive method names to be passed as the first param to `JsonRoutes.add()` (e.g., `JsonRoutes.add('get',...)` and `JsonRoutes.add('GET',...)` are both acceptable)
- Add `JsonRoutes.sendError` with automatic parsing of error objects.
- Catch handler errors and automatically send a response. Look for `statusCode` and `data` properties on thrown errors.
- Add `JsonRoutes.Middleware` to eventually replace `JsonRoutes.middleWare` (since 'middleware' is one word)


## 1.0.3

Add `JsonRoutes.middleWare` for adding middleware to the stack

