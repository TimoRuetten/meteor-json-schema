

Validator.attributes.custom = function (value, schema, options, ctx) {
  if (!_.isFunction(schema.custom)) return 'The custom attribute must be a valid function.';
  const bindObject = {
    value,
    schema
  };
  return schema.custom.bind(bindObject)();
};
