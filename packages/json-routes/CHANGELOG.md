# Change log

## Unreleased

#### Added
- `JsonRoutes.sendError`: automatic parsing of error objects.
- Add `JsonRoutes.Middleware` to eventually replace `JsonRoutes.middleWare` 
  (since "middleware" is one word)

#### Changed
- Allow case-insensitive method names to be passed as the first param to 
  `JsonRoutes.add()` (e.g., `JsonRoutes.add('get',...)` and `JsonRoutes.add
  ('GET',...)` are now both acceptable)
- Catch handler errors and automatically send a response. Look for `statusCode` 
  and `data` properties on thrown errors.


## 1.0.3 - 2015-05-07

- Add `JsonRoutes.middleWare` for adding middleware to the stack