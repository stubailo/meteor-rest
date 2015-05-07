Package.describe({
  name: 'simple:json-routes',
  version: '1.0.3',
  // Brief, one-line summary of the package.
  summary: 'The simplest way to define server-side routes that return JSON',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/stubailo/meteor-rest',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Npm.depends({
  connect: "2.11.0",
  "connect-route": "0.1.5"
});

Package.onUse(function(api) {
  api.export("JsonRoutes");
  api.versionsFrom('1.0');
  api.addFiles('json-routes.js', "server");

  api.use([
    "webapp",
    "underscore"
  ], "server");
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('test-helpers');
  api.use('simple:json-routes');
  api.addFiles('json-routes-tests.js');
});
