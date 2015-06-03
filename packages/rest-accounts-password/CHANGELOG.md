# Change log

## Unreleased 

- Add token parsing and auth middleware into the middleware stack
  - This functionality was moved from simple:rest, since it's outside its scope
  - _Known issue: Middleware is added on all routes (user should have control 
    over which routes middleware is applied, and at the very least it should be 
    restricted to API routes)_
- Use the latest version of `simple:json-routes` (1.0.3)

## 1.0.3

- Fixed bug where logging into accounts with no email would log into the wrong
account.