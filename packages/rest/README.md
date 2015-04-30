Current status: pre-1.0 preview release - it's stable, but might not have all of the features you need. [Leave feedback in this Hackpad.](https://meteor.hackpad.com/Meteor-Hack-Week-REST-APIs-with-Meteor-XK2NNXqhUvj)

## One-step JSON API for your publications and methods

```sh
meteor add simple:rest
```

Add this package to get an automatic JSON HTTP API for all of your Meteor app's publications and methods. It works with all of your existing security rules and authentication. This can be useful for many things:

- Build a simple native mobile app on top of your Meteor app's data
- Expose an API for other people to get data
- Integrate with other frameworks and platforms without having to integrate a DDP client

Keep in mind that this package is _literally_ calling your Meteor methods and publications. This means if you have any nice packages that do roles, authentication, permissions, etc. for your app, those packages should still work just fine over HTTP.

### Table of contents

1. Using the API
  1. [Publications](#publications)
  2. [Methods](#methods)
  3. [Collection insert/update/remove](#collection-methods)
  4. [Example code with JQuery](#example-code-with-jquery)
2. Additional tools
  1. [Listing all API methods](#listing-all-api-methods)
  2. [Cross origin requests](#cross-origin-requests)
  3. [Authentication](#authentication)
  4. [Logging in over HTTP](#logging-in-over-http)
3. [Change log](#change-log)

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
Don't worry, they follow the exact same security rules as in your Meteor DDP app, and allow/deny still works perfectly.

#### Inserting into a collection
```http
POST /<collection-name>
```

The body of the request should be a JSON-serialized document to insert into the database.

#### Updating a document in a collection

```http
PATCH /<collection-name>/<_id>
```

The body of the request should be a JSON-serialized set of fields to update in the document.

#### Deleting a document from a collection

```http
DELETE /<collection-name>/<_id>
```

No request body is necessary for deletion, it just deletes the document with the specified `_id`.

### Example code with JQuery

Here is how you might call your shiny new HTTP API using JQuery. Note that you must set `contentType` to `"application/json"`, because by default JQuery uses form serialization rather than JSON serialization.

```js
// Calling a method
$.ajax({
  method: "post",
  url: "/methods/add-all-arguments",
  data: JSON.stringify([1, 2, 3]),
  contentType: "application/json",
  success: function (data) {
    console.log(data); // 6
  }
});

// Getting data from a publication
$.get("/publications/widgets", function (data) {
  console.log(data.widgets.length); // 11
});
```

### Listing all API methods

This package defines a special publication that publishes a list of all of your app's API methods. Call it like this:

```http
GET /publications/api-routes
```

The result looks like:

```js
{ "api-routes": [
  {
    "_id": "/users/login",
    "methods": [
      "options",
      "post"
    ],
    "path": "/users/login"
  },
  {
    "_id": "/users/register",
    "methods": [
      "options",
      "post"
    ],
    "path": "/users/register"
  },
  {
    "_id": "/publications/api-routes",
    "methods": [
      "get"
    ],
    "path": "/publications/api-routes"
  },
  {
    "_id": "/widgets",
    "methods": [
      "options",
      "post"
    ],
    "path": "/widgets"
  },
  {
    "_id": "/widgets/:_id",
    "methods": [
      "options",
      "patch",
      "options",
      "delete"
    ],
    "path": "/widgets/:_id"
  },
  ...
] }
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

API endpoints generated with this package accept a standard bearer token header (Based on [RFC 6750](http://tools.ietf.org/html/rfc6750#section-2.1) and [OAuth Bearer](http://self-issued.info/docs/draft-ietf-oauth-v2-bearer.html#authz-header)).

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

This package allows you to authenticate API calls using a token, but does not provide methods to get that token over HTTP. Use the following packages to log in over HTTP:

- [`simple:rest-accounts-password`](https://github.com/stubailo/meteor-rest/blob/master/packages/rest-accounts-password/README.md)
- More coming soon for login with Facebook, Google, etc

## Change log

#### 0.2.1

Start checking for token expirations.

#### 0.2.0

Changed api for insert/update/remove to be more RESTful. Now you call it with:

```http
POST /collection
PATCH /collection/:_id
DELETE /collection/:_id
```

#### 0.1.2

Initial publicized release.g
