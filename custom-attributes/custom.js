
const ValidatorResult = jsonschema.ValidatorResult;

JsonSchemaUtility.validatorCustomProperty('custom', function (value, schema, options, ctx) {
  if (!_.isFunction(schema.custom)) return 'The custom attribute must be a valid function.';
  let result = new ValidatorResult(value, schema, options, ctx);

  const bindObject = {
    value,
    schema
  };

  let error = schema.custom.bind(bindObject)();
  if (error) {
    result.addError({
      name: 'custom',
      message: error
    });
  }
  return result;
});
