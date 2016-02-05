
JsonSchema = class JsonSchema {
  constructor(schema, opt) {
    this.opt = _.extend({}, {}, opt);
    this.schema = schema;
    
    // Adding the schema to the scope of schemas when it provides a id
    if (schema.id) {
      Validator.addSchema(schema, schema.id);
    }
  }

  getSchema(field) {
    if (!field) return this.schema;
    /**
      Todo:
      possibility to return the schema of a nested field
    */
  }

  validate(doc) {
    return Validator.validate(doc, this.schema);
  }

  label(field) {
    /**
      Todo:
      add reactive support
    */
    return this.getSchema().properties[field].label;
  }
};
