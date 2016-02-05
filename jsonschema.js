
JsonSchema = class JsonSchema {
  constructor(schema, opt) {
    this.opt = _.extend({}, {}, opt);
    this.schema = schema;
    /**
      Adding the schema to the scope of schemas when it provides a id
    */
    if (schema.id) {
      Validator.addSchema(schema, schema.id);
    }
  }

  validate(doc) {
    return Validator.validate(doc, this.schema);
  }
};
