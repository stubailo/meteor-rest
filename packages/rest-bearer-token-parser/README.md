# simple:rest-accounts-bearer-token

SimpleRest middleware for parsing a standard bearer token from an HTTP request

### Middleware Name

This middleware can be accessed as: 

**`JsonRoutes.Middleware.parseBearerToken`**

### Request Properties Required

- None

### Request Properties Modified

- `request.authToken`
  - _String_
  - The parsed bearer token, or `null` if none is found

## Usage

Accepts tokens passed via the standard header or URL query parameter (whichever is found first, in that order).

The header signature is: `Authorization: Bearer <token>`

The query signature is: `?access_token=<token>`