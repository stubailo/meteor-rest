# Change log

## Unreleased 

#### Added
- Bearer token parsing and auth middleware automatically inserted into the 
  Connect middleware stack
  - Add dependency on `simple:rest-bearer-token-parser` and 
    `simple:authenticate-user-by-token` (middleware packages)
  - _Note: This functionality was moved from simple:rest, since it's outside its 
    scope_
  - _Known issue: Middleware is added on all routes (user should have control 
    over which routes middleware is applied, and at the very least it should be 
    restricted to API routes)_
    
#### Changed
- Use the latest version of `simple:json-routes` (1.0.3)


## 1.0.3

#### Fixed
- Fix bug where logging into accounts with no email would log into the wrong
  account.