## One-step JSON API for your publications and methods

```sh
meteor add simple:rest
```

Add this package to get an automatic JSON HTTP API for all of your Meteor app's publications and methods. It works with all of your existing security rules and authentication. This can be useful for many things:

- Build a simple native mobile app on top of your Meteor app's data
- Expose an API for other people to get data
- Integrate with other frameworks and platforms without having to integrate a DDP client

Keep in mind that this package is _literally_ calling your Meteor methods and publications. This means if you have any nice packages that do roles, authentication, permissions, etc. for your app, those packages should still work just fine over HTTP.

For a lot of examples of how to define and call methods and publications, see
the [unit tests in this package](rest-tests.js).

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

#### Options for Meteor.publish added by this package

- `url`: Set a custom URL, which can contain parameters. The parameters are in the form `:argument-number`, so in this case `:0` means that segment of the URL will be passed as the first argument. Note that URL arguments are _always_ strings, so you might need to parse to get an integer if you are expecting one.
- `httpMethod`: Pick the HTTP method that must be used when calling this endpoint. The default is `"get"`.

```js
Meteor.publish("widgets-above-index", function (index) {
  return Widgets.find({index: {$gt: parseInt(index, 10)}});
}, {
  url: "widgets-with-index-above/:0",
  httpMethod: "post"
});
```

Call the above publication with:

```http
POST /widgets-with-index-above/4
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

#### Passing options about a method

To pass options about your method's HTTP endpoint, you can use an alternate method definition syntax that comes from this package – `Meteor.method` — that takes an options object as its last argument:

```js
Meteor.method("return-five", function () {
  return 5;
}, options);
```

You can also pass options without using the other syntax by calling `SimpleRest.setMethodOptions` _before_ the Method definition:

```js
SimpleRest.setMethodOptions('return-five', options);

Meteor.methods({
  'return-five': function () {
    return 5;
  }
});
```

#### Available options

- `url`: Define a custom URL for this method.
- `getArgsFromRequest`: A function that accepts a [Node `request` object](https://nodejs.org/api/http.html#http_http_incomingmessage) and returns an array which will be passed as arguments to your method. If this option is not passed, `simple:rest` expects that the request body is a JSON array that maps to the method arguments, or a single JSON object that is passed as the only argument to the method.
- `httpMethod`: Set the HTTP method which must be used when calling this API endpoint. The default is `"post"`.

```js
Meteor.method("add-numbers", function (a, b) {
  return a + b;
}, {
  url: "add-numbers",
  getArgsFromRequest: function (request) {
    // Let's say we want this function to accept a form-encoded request with
    // fields named `a` and `b`.
    var content = request.body;

    // Since form enconding doesn't distinguish numbers and strings, we need
    // to parse it manually
    return [ parseInt(content.a, 10), parseInt(content.b, 10) ];
  }
})
```

#### Setting HTTP status code

By default, successful method requests will respond with status code 200 and errors will respond with status code 400. To override this in your method:

```js
this.setHttpStatusCode(201);
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

### Choosing Which Collections Should Have Endpoints

By default all collections get endpoints automatically.

To specify only certain collections, in your server code before you define any collections:

```js
SimpleRest.configure({
  collections: ['widgets', 'doodles']
});
```

Where the strings must match the collection name string you pass to the `Mongo.Collection` constructor.

For no collection endpoints:

```js
SimpleRest.configure({
  collections: []
});
```

### Using ObjectIDs

If any of your collections use ObjectIDs instead of string IDs, tell simple:rest about them and everything will work fine:

```js
SimpleRest.configure({
  objectIdCollections: ['widgets', 'doodles']
});
```

Where the strings must match the collection name string you pass to the `Mongo.Collection` constructor.

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

### Error Handling

We recommend that you add our default error handler like so:

```js
JsonRoutes.ErrorMiddleware.use(RestMiddleware.handleErrorAsJson);
```

This will convert any `Meteor.Error`s that your methods throw to useful JSON responses.

You can set `error.statusCode` before you throw the error if you want a particular status code returned.

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

## Change Log

#### 1.1.0

- Add `SimpleRest.setMethodOptions` to enable `mdg:validated-method` mixin.

#### 1.0.0

- Move auth functionality to separate middleware packages:
  - rest-bearer-token-parser: Parse a standard bearer token
  - authenticate-user-by-token: Authenticate a `Meteor.user` via auth token

#### 0.2.3

- Add `httpMethod` option to `Meteor.method` and `Meteor.publish`. With it, you
can make a method callable via `GET` or a publication via `POST`, or anything
else.

#### 0.2.2

- Add `getArgsFromRequest` option to `Meteor.method` and `Meteor.publish`.
- Improved error handling to better match DDP error handling

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

Initial publicized release.
