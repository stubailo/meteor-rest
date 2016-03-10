Package.describe({
  name: 'simple:rest',
  version: '1.1.1',

  // Brief, one-line summary of the package.
  summary: 'The easiest way to add a REST API to your Meteor app',

  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/stubailo/meteor-rest/blob/master/packages/rest/',

  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md',
});

Package.onUse(function (api) {
  api.versionsFrom('1.1.0.2');

  api.use([
    'check',
    'ddp',
    'ejson',
    'meteor',
    'mongo',
    'simple:json-routes@2.1.0',
    'underscore',
    'webapp',
  ], 'server');

  api.use([
    'accounts-base',
  ], 'server', {weak: true});

  api.addFiles([
    'http-connection.js',
    'http-subscription.js',
    'rest.js',
    'list-api.js',
  ], 'server');

  api.export('SimpleRest');
});

Package.onTest(function (api) {
  api.use([
    'check',
    'http',
    'jquery',
    'mongo',
    'random',
    'simple:json-routes',
    'simple:rest',
    'simple:rest-accounts-password',
    'simple:rest-json-error-handler',
    'test-helpers',
    'tinytest',
    'underscore',
  ]);

  api.addFiles('rest-tests.js');
});
