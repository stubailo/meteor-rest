Package.describe({
  name: 'simple:rest',
  version: '0.2.3',
  // Brief, one-line summary of the package.
  summary: 'The easiest way to add a REST API to your Meteor app',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/stubailo/meteor-rest/blob/master/packages/rest/',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.2');

  api.use([
    "underscore",
    "ddp",
    "meteor",
    "webapp",
    "check",
    "simple:json-routes@1.0.1",
    "ejson",
    "mongo"
  ], "server");

  api.use([
    "accounts-base"
  ], "server", {weak: true});

  api.addFiles([
    'http-connection.js',
    'http-subscription.js',
    'rest.js',
    'list-api.js'
  ], "server");
});

Package.onTest(function(api) {
  api.use("simple:rest-accounts-password");
  api.use("underscore");
  api.use("test-helpers");
  api.use("mongo");
  api.use("random");
  api.use("check");
  api.use("jquery");
  api.imply("http");
  api.use('tinytest');
  api.use('simple:rest');
  api.use('simple:json-routes');
  api.addFiles('rest-tests.js');
});
