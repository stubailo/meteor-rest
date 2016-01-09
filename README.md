# REST for Meteor [![Build Status](https://travis-ci.org/stubailo/meteor-rest.svg)](https://travis-ci.org/stubailo/meteor-rest)

A set of packages that makes it easy to make your Meteor app's data accessible over HTTP. Easily integrate your Meteor backend into a native mobile app or query your data from your Rails or PHP app.

## Packages

- [simple:json-routes](https://github.com/stubailo/meteor-rest/tree/master/packages/json-routes) - the simplest way to define a server-side route in your Meteor app, with no external dependencies.
- [simple:rest-json-error-handler](https://github.com/stubailo/meteor-rest/blob/master/packages/rest-json-error-handler/README.md) - middleware for handling standard Meteor.Error errors
- [simple:rest](https://github.com/stubailo/meteor-rest/blob/master/packages/rest/README.md) - just add the package, and all of your Meteor methods and publications will become accessible over HTTP.
- [simple:rest-accounts-password](https://github.com/stubailo/meteor-rest/blob/master/packages/rest-accounts-password/README.md) - add this package to enable password login over HTTP.
- [simple:authenticate-user-by-token](https://github.com/stubailo/meteor-rest/blob/master/packages/authenticate-user-by-token/README.md) - authenticate user via auth token
- [simple:rest-bearer-token-parser](https://github.com/stubailo/meteor-rest/blob/master/packages/rest-bearer-token-parser/README.md) - parse standard bearer token via request headers, query params, or body
- [simple:rest-method-mixin](https://github.com/stubailo/meteor-rest/blob/master/packages/rest-method-mixin/README.md) - add REST options to methods defined using [ValidatedMethod](https://github.com/meteor/validated-method)

## Planned

- `simple:rest-accounts-facebook`, etc - OAuth login packages for HTTP
- Static file management, authentication
- Integration with [Restivus](https://github.com/kahmali/meteor-restivus) for custom API needs
