Package.describe({
  name: 'simple:rest-accounts-password',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: 'Get a login token to use with simple:rest',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/stubailo/meteor-rest',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.2');
  api.addFiles('rest-login.js', "server");
  api.use('accounts-password');
  api.use('simple:json-routes');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('simple:rest-accounts-password');
  api.use('test-helpers');
  api.addFiles('rest-login-tests.js');
});
