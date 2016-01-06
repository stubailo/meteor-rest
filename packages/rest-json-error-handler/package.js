Package.describe({
  name: 'simple:rest-json-error-handler',
  version: '1.0.0',

  // Brief, one-line summary of the package.
  summary: 'middleware for handling standard Connect errors',

  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/stubailo/meteor-rest',

  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md',
});

Package.onUse(function (api) {
  api.versionsFrom('1.0');
  api.use('simple:json-routes@2.0.0');
  api.addFiles('json_error_handler.js', 'server');
});

Package.onTest(function (api) {
  api.use([
    'http',
    'simple:json-routes@2.0.0',
    'simple:rest-json-error-handler',
    'test-helpers',
    'tinytest',
  ]);

  api.addFiles('json_error_handler_tests.js');
});
