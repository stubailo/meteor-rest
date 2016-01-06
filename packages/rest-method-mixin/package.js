Package.describe({
  name: 'simple:rest-method-mixin',
  version: '1.0.0',
  // Brief, one-line summary of the package.
  summary: 'Mixin for simple:rest with ValidatedMethod',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/stubailo/meteor-rest',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.1');
  api.use('ecmascript');
  api.use('simple:rest@1.1.0');
  api.addFiles('rest-method-mixin.js');
  api.export('RestMethodMixin');
});

Package.onTest(function(api) {
  api.use([
    'ecmascript',
    'tinytest',
    'simple:rest-method-mixin',
    'mdg:validated-method@1.0.0',
    'test-helpers',
    'http'
  ]);
  api.addFiles('rest-method-mixin-tests.js');
});
