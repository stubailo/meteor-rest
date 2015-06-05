# Change log

## Unreleased

#### Changed
- Stop checking for token expiration during authentication (actually, it never 
  worked as advertised)
- Move auth functionality to separate middleware packages:
  - simple:rest-bearer-token-parser: Parse a standard bearer token
  - simple:authenticate-user-by-token: Authenticate a `Meteor.user` via auth 
    token


## 0.2.3 - 2015-05-17

#### Added
- Add `httpMethod` option to `Meteor.method` and `Meteor.publish`. With it, you 
  can make a method callable via `GET` or a publication via `POST`, or anything 
  else.


## 0.2.2 - 2015-05-07

#### Added
- Add `getArgsFromRequest` option to `Meteor.method` and `Meteor.publish`

#### Changed
- Improve error handling to better match DDP error handling


## 0.2.1 - 2015-04-30

#### Changed
- Start checking for token expiration during authentication


## 0.2.0 - 2015-04-30

#### Changed
- API for insert/update/remove is now more RESTful. Call it with:
```http
POST /collection
PATCH /collection/:_id
DELETE /collection/:_id
```


## 0.1.2 - 2015-04-28

- Initial publicized release
