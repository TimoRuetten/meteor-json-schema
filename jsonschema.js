
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
      possibility for arrays
    */
    return _.reduce(field.split('.'), function(obj, key){
      if (obj.$ref) {
        obj = Validator.schemas[obj.$ref];
      }
      if (!obj) return null;
      if (!obj.properties || !obj.properties[key]) return null;
      return obj.properties[key];
    }, this.schema);
  }

  validate(doc) {
    return Validator.validate(doc, this.schema);
  }

  label(field) {
    /**
      Todo:
      add reactive support
    */
    return this.getSchema(field).label || false;
  }
};
