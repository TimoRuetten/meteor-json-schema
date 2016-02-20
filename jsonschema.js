
JsonSchema = class JsonSchema {
  constructor(schema, opt) {
    this.opt = _.extend({}, {
      validator: 'default'
    }, opt);

    this._contexts = {};

    this.Validator = JsonSchemaUtility.Validator(this.opt.validator);

    this.schema = schema;
    this.compositedSchema = this._compositedSchema(schema);

    // Adding the schema to the scope of schemas when it provides a id
    if (schema.id) {
      this.Validator.addSchema(schema, schema.id);
    }

  }
  _compositedSchema(schemaObject) {

    if (schemaObject.$ref) {
      let referencedSchema = this.Validator.schemas[schemaObject.$ref];
      delete schemaObject.$ref;
      schemaObject = _.extend({}, schemaObject, referencedSchema);
    }
    _.each(schemaObject.properties, (schemaField, schemaProperty)=>{
      schemaObject.properties[schemaProperty] = this._compositedSchema(schemaField);
    });

    return schemaObject;
  }

  /**
  * getSchema() returns a cleaned schema for the given field.
  * You can request also a nested schema
  * If the field is not set you will get the hole schema
  */
  getSchema(field) {
    if (!field) return this.compositedSchema;
    /**
      Todo:
      possibility for arrays
    */
    return _.reduce(field.split('.'), function(obj, key){
      if (obj.$ref) {
        obj = this.Validator.schemas[obj.$ref];
      }
      if (!obj) return null;
      if (!obj.properties || !obj.properties[key]) return null;
      return obj.properties[key];
    }, this.compositedSchema);
  }


  context(key) {
    key = key || '_default';
    if (!this._contexts[key]) {
      this._contexts[key] = new JsonSchemaContext(this);
    }
    return this._contexts[key];
  }

  validate(doc) {
    if (!_.isObject(doc) || !doc) doc = {};

    const validation = this.Validator.validate(doc, this.schema);
    return new JsonSchemaValidation(validation);

  }

  label(field) {
    const label = this.getSchema(field).label;
    if (_.isFunction(label)) return label();
    return label || field;
  }

  getKeys() {
    // this will return all possible keys like person, person.name, address, address.street, address.city...
    return ['name'];
  }


  // Do not use yet!
  _attachTo(collection) {
    if (!(collection instanceof Meteor.Collection)) {
      throw new Meteor.Error(400, 'You must attach a valid Meteor.Collection instance.');
    }
    if (!collection._mjs) {
      collection.attachJsonSchema(this);
    }
    return this;
  }

};
