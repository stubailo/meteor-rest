# Change log

## Unreleased

- Move auth functionality to separate middleware packages:
  - rest-bearer-token-parser: Parse a standard bearer token
  - authenticate-user-by-token: Authenticate a `Meteor.user` via auth token

## 0.2.3

- Add `httpMethod` option to `Meteor.method` and `Meteor.publish`. With it, you
can make a method callable via `GET` or a publication via `POST`, or anything
else.

## 0.2.2

- Add `getArgsFromRequest` option to `Meteor.method` and `Meteor.publish`.
- Improved error handling to better match DDP error handling

## 0.2.1

Start checking for token expirations.

## 0.2.0

Changed api for insert/update/remove to be more RESTful. Now you call it with:

```http
POST /collection
PATCH /collection/:_id
DELETE /collection/:_id
```

## 0.1.2

Initial publicized release.