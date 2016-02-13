Package.describe({
  name: 'timoruetten:json-schema',
  version: '0.0.6',
  summary: 'jsonschema Wrapper for Meteor with some functionality. In Development - do not use yet.',
  git: 'https://github.com/TimoRuetten/meteor-json-schema.git',
  documentation: 'README.md'
});

Npm.depends({
  "jsonschema":"1.0.3"
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.1');
  api.use('ecmascript');
  api.use('underscore');
  api.use([
    'cosmos:browserify@0.9.3',
    'ui'
  ], 'client');

  api.addFiles([
    'packages/jsonschema.browserify.js',
    'template-helpers.js'
  ], 'client');
  api.addFiles(['packages/jsonschema.js'], 'server');

  api.addFiles([
    'utility/JsonSchemaUtility.js',
    'custom-attributes/custom.js',
    'JsonSchema.js',
    'JsonSchemaContext.js'
  ]);

  api.export(['JsonSchemaUtility', 'JsonSchema'], ['client', 'server']);
});
