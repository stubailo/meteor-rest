## One-step JSON API for your publications and methods

Add this package to get a JSON HTTP API for all of your Meteor app's publications and methods. This can be useful for many things:

- Build a simple native mobile app on top of your Meteor app's data
- Expose an API for other people to get data
- Integrate with other frameworks and platforms without having to integrate a DDP client

### Table of contents

1. Using the API
  1. [Publications](#publications)
  2. [Methods](#methods)
  3. [Collection insert/update/remove](#collectionmethods)
2. Additional tools
  1. [Listing all API methods](#listingallapimethods)
  2. [Cross origin requests](#crossoriginrequests)
  3. [Authentication](#authentication)
  4. [Logging in over HTTP](#logginginoverhttp)

### Publications

By default, publications are accessible via an HTTP `GET` request at the URL:

```http
GET /publications/<publication-name>
```

The response is an object where the keys are the collections in the publication, and each collection has an array of documents. Note that a publication can publish from many collections at once.

```js
{
  collectionName: [
    { _id: "xxx", otherData: "here" },
    { _id: "yyy", otherData: "here" }
  ]
}
```

You can pass an option to `Meteor.publish` to set a custom URL, which can contain parameters. The parameters are in the form `:argument-number`, so in this case `:0` means that segment of the URL will be passed as the first argument. Note that the arguments are _always_ strings, so you might need to parse to get an integer if you are expecting one.

```js
Meteor.publish("widgets-above-index", function (index) {
  return Widgets.find({index: {$gt: parseInt(index, 10)}});
}, {
  url: "widgets-with-index-above/:0"
});
```

Call the above API with:

```http
GET /widgets-with-index-above/4
```

### Methods

By default, methods are accessible with a `POST` request at the following URL:

```http
POST /methods/<method-name>
```

Arguments are passed as JSON or query-encoded data in the message body. Since the arguments are positional, the arguments are in array form. Here's an example of how you can call a method using Meteor's `http` package:

```js
HTTP.post("/methods/addNumbers", {
  data: [2, 2]
}, function (err, res) {
  console.log(res); // 4
});
```

You can pass a custom URL to a method by using an alternate method definition syntax that comes from this package, `Meteor.method`:

```js
Meteor.method("return-five", function () {
  return 5;
}, {
  url: "return-five"
});
```

Then you can call this method with:

```http
POST /return-five
```

### Collection methods

The default Meteor collection methods (insert, update, and remove) are also automatically exposed when this package is added. 
Don't worry, they follow the exact same security rules as in your Meteor DDP app, and allow/deny still works perfectly. Call them like this:

```http
POST /methods/<collection-name>/insert
POST /methods/<collection-name>/update
POST /methods/<collection-name>/remove
```

Pass arguments the same way as descibed in [methods](#methods) above.

### Listing all API methods

This package defines a special publication that publishes a list of all of your app's API methods. Call it like this:

```http
GET /publications/api-routes
```

The result looks like:

```js
{
  "api-routes": [
    {
      "_id": "get /publications/api-routes",
      "method": "get",
      "path": "/publications/api-routes"
    },
    {
      "_id": "options /users/login",
      "method": "options",
      "path": "/users/login"
    },
    {
      "_id": "post /users/login",
      "method": "post",
      "path": "/users/login"
    },
    {
      "_id": "options /users/register",
      "method": "options",
      "path": "/users/register"
    },
    {
      "_id": "post /users/register",
      "method": "post",
      "path": "/users/register"
    },
    {
      "_id": "options /methods/lists/insert",
      "method": "options",
      "path": "/methods/lists/insert"
    },
    ...
  ]
}
```

> Note that this package also generates `OPTIONS` endpoints for all of your methods. This is to allow you to enable cross-origin requests if you choose to, by returning an `Access-Control-Allow-Origin` header. More on that below. 

### Cross-origin requests

If you would like to use your API from the client side of a different app, you need to return a special header. You can do this by hooking into a method on the `simple:json-routes` package, like so:

```js
// Enable cross origin requests for all endpoints
JsonRoutes.setResponseHeaders({
  "Cache-Control": "no-store",
  "Pragma": "no-cache",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PUT, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With"
});
```

### Authentication

API endpoints generated with this package accept a standard bearer token header (Based on [RFC 6750](http://tools.ietf.org/html/rfc6750#section-2.1) and [OAuth Bearer](http://self-issued.info/docs/draft-ietf-oauth-v2-bearer.html#authz-header).

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

### Logging in over HTTP

This package allows you to authenticate API calls using a token, but does not provide methods to get that token over HTTP. For that, use the other packages in this repository, for example `simple:rest-accounts-password`.

## Notes

### Authentication



HTTP header: `Authorization: Bearer <token>`
