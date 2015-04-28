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
