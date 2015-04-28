Work in progress, please do not use right now

## One-step JSON API for your publications and methods

When you add this package, with exactly 0 code you get a default HTTP API that returns JSON for your publications and methods.

- [Publications](#publications)
- [Methods](#methods)

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

## Notes

### Authentication

Based on <http://tools.ietf.org/html/rfc6750#section-2.1> and <http://self-issued.info/docs/draft-ietf-oauth-v2-bearer.html#authz-header>

HTTP header: `Authorization: Bearer <token>`
