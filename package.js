Package.describe({
  name: 'timoruetten:json-schema',
  version: '0.0.1',
  summary: 'Adds jsonschema to Meteor. More information at http://json-schema.org/',
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
  api.use(['cosmos:browserify@0.9.3'], 'client');

  api.addFiles(['packages/jsonschema.browserify.js'], 'client');
  api.addFiles(['packages/jsonschema.js'], 'server');

  api.addFiles([
    'jsonschema-custom.js',
    'jsonschema.js'
  ]);

  api.export('JsonSchema', ['client', 'server']);
});
