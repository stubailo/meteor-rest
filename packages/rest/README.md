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

For a lot of examples of how to define and call methods and publications, see
the [unit tests in this package](rest-tests.js).

## Change log

#### Unreleased

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
