Package.describe({
  name: 'timoruetten:json-schema',
  version: '0.0.9',
  summary: 'Jsonschema validation for MeteorJS with MongoDB Collection attachment',
  git: 'https://github.com/TimoRuetten/meteor-json-schema.git',
  documentation: 'README.md'
});

Npm.depends({
  "jsonschema":"1.0.3"
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.1');
  api.use('ecmascript');
  api.use([
    'cosmos:browserify@0.9.3',
    'ui'
  ], 'client');
  /*api.use([
    'erasaur:meteor-lodash'
  ]);*/
  api.use('mongo');

  api.addFiles([
    'packages/jsonschema.browserify.js',
    'template-helpers.js'
  ], 'client');

  api.addFiles(['packages/jsonschema.js'], 'server');

  api.addFiles([
    'libraries/lodash.js',
    'collections/collections.js',
    'utility/JsonSchemaUtility.js',
    'custom-attributes/custom.js',
    'JsonSchema.js',
    'JsonSchemaContext.js',
    'JsonSchemaValidation.js'
  ], ['client', 'server']);

  api.export([
    'JsonSchemaUtility',
    'JsonSchema',
    'JsonSchemaValidation',
    'JsonSchemaErrorMessages'
  ], ['client', 'server']);
});
