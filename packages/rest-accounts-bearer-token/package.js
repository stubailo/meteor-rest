Package.describe({
  name: 'simple:rest-accounts-bearer-token',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: 'Authorize user via standard bearer token',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/stubailo/meteor-rest',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.0');
  api.use('simple:json-routes');

  api.use([
    'accounts-base'
  ], 'server', {weak: true});

  api.addFiles('accounts_bearer_token.js', 'server');
});

Package.onTest(function(api) {
  api.use('simple:rest-accounts-bearer-token');
  api.use('tinytest');
  api.use("test-helpers");
  api.use('http');
  api.use('simple:json-routes');
  api.addFiles('accounts_bearer_token_tests.js');
});
