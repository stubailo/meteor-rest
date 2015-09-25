Package.describe({
  name: 'simple:rest-bearer-token-parser',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: 'Parse standard bearer token via request headers, query params ' +
           'or body (REST middleware)',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/stubailo/meteor-rest',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.0');
  api.use('check');
  api.use('simple:json-routes@1.0.3');
  api.addFiles('bearer_token_parser.js', 'server');
});

Package.onTest(function(api) {
  api.use('simple:rest-bearer-token-parser');
  api.use('tinytest');
  api.use("test-helpers");
  api.use('http');
  api.use('simple:json-routes@1.0.3');
  api.use('simple:rest-accounts-password@1.0.1');
  api.addFiles('bearer_token_parser_tests.js');
});
