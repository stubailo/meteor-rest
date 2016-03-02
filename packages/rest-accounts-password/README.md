## Log in and register password accounts over HTTP

```sh
meteor add simple:rest-accounts-password
```

If you have `accounts-password` in your app, and you want to be able to use it over HTTP, this is the package for you. Call these APIs to get an access token, and pass that token to API methods you defined with [`simple:rest`](https://github.com/stubailo/meteor-rest/blob/master/packages/rest/README.md#authentication) to call methods and publications that require login.

Make sure to serve your app over HTTPS if you are using this for login, otherwise people can hijack your passwords. Try the [`force-ssl` package](https://atmospherejs.com/meteor/force-ssl).

### POST /users/login, POST /users/register

The login and registration endpoints take the same inputs. Pass an object with the following properties:

- `username`
- `email`
- `password`

`password` is required, and you must have at least one of `username` or `email`.

#### Responses

Both login and registration have the same response format.

```js
// successful response, with HTTP code 200
{
  token: "string",
  tokenExpires: "ISO encoded date string",
  id: "user id"
}

// error response, with HTTP code 500
{
  error: "error-code",
  reason: "Human readable error string"
}
```

### Authentication

After adding this package, API endpoints accept a standard bearer token header (Based on [RFC 6750](http://tools.ietf.org/html/rfc6750#section-2.1) and [OAuth Bearer](http://self-issued.info/docs/draft-ietf-oauth-v2-bearer.html#authz-header)).

```http
Authorization: Bearer <token>
```

Here is how you could use Meteor's `http` package to call a method as a logged in user. Inside the method, the current user can be accessed the exact same way as in a normal method call, through `this.userId`.

```js
HTTP.post("/methods/return-five-auth", {
  headers: { Authorization: "Bearer " + token }
}, function (err, res) {
  console.log(res.data); // 5
});
```

### Change log

#### 1.1.1

- Change order of middleware, and add error middleware

#### 1.1.0

- Add token parsing and auth middleware into the middleware stack
  - This functionality was moved from simple:rest, since it's outside its scope
  - _Known issue: Middleware is added on all routes (user should have control
    over which routes middleware is applied, and at the very least it should be
    restricted to API routes)_
- Use the latest version of `simple:json-routes` (1.0.3)

#### 1.0.3

- Fixed bug where logging into accounts with no email would log into the wrong
account.
