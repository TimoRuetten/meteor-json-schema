
JsonSchema = class JsonSchema {
  constructor(schema, opt) {
    this.opt = _.extend({}, {}, opt);
    this.schema = schema;
  }

  validate(doc) {
    return Validator.validate(doc, this.schema);
  }
};
