
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
    return this.Validator.validate(doc, this.schema);
  }

  label(field) {
    /**
      Todo:
      add reactive support
    */
    return this.getSchema(field).label || false;
  }

  getKeys() {
    // this will return all possible keys like person, person.name, address, address.street, address.city...
    return false;
  }
};


JsonSchemaContext = class {
  constructor(mjs) {
    this._mjs = mjs;
    // create a Dependency() for any change
    this._depsAny = new Tracker.Dependency();

    // Variables for error handling ?
    this.invalidKeys = []; // all keys in dot notation which have problems: ['person.name', 'address']
    this.validationErrors = []; // a cleaned version of errors
    this._validationError = false; // original jsonschema error


  }

  isValid() {
    this._depsAny.depend();
    return null;
  }
  getErrors() {
    // reactive
    return null;
  }
  getErrorFor(field) {
    return null;
  }
  isFieldValid(field) {
    if (!this._depsField[field]) {
      this._depsField[field] = new Tracker.Dependency();
    }
    this._depsField[field].depend();
    return null;
  }

  validate(doc) {
    // not reactive
    const validation = this._mjs.validate(doc);
    return null;
  }
  validateExisting() {
    // like validate for update -> validats only given properties
    return null;
  }

  getDoc() {
    // returns the last validated doc
    return null;
  }
};
