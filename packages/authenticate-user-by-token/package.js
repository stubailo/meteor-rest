Package.describe({
  name: 'simple:authenticate-user-by-token',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: 'Authenticate user via auth token',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.0');

  api.use([
    'accounts-base@1.2.0',
    'simple:json-routes@1.0.3'
  ], 'server');

  api.addFiles('auth.js', 'server');
});

Package.onTest(function(api) {
  api.use([
    'check',
    'http',
    'simple:authenticate-user-by-token',
    'simple:json-routes@1.0.3',
    'simple:rest-accounts-password@1.0.1',
    'test-helpers',
    'tinytest'
  ]);

  api.addFiles('auth_tests.js');
});
