
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
    return ['name'];
  }
};


JsonSchemaContext = class {
  constructor(mjs) {
    this._mjs = mjs;
    // create a Dependency() for any change
    this._depsAny = new Tracker.Dependency();
    this._depsField = {};
    // Variables for error handling ?
    this._invalidKeys = []; // all keys in dot notation which have problems: ['person.name', 'address']
    this._validationErrors = []; // a cleaned version of errors
    this._validationError = false; // original jsonschema error
    this._isValid = false;
    this._lastDoc = false;
  }

  isValid() {
    this._depsAny.depend();
    return this._isValid;
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
    return _.indexOf(this._invalidKeys, field) === -1;
  }

  validate(doc) {
    const validation = this._mjs.validate(doc);

    this._validationError = validation;
    this._isValid = validation.valid;
    this.lastDoc = validation.instance;
    /**
    * checking the validation error to fill the invalid keys and validationErrors
    */
    this._invalidKeys = [];
    this._validationErrors = [];

    let propertyPathDepth = 0;
    if (validation.instance) {
      propertyPathDepth = validation.propertyPath.split('.').length;
      if (propertyPathDepth < 0) propertyPathDepth = 0;
    }

    this._validationError.errors.map((error)=>{
      let fieldProperty = error.property;
      // Remove the propertyPath if necessery
      if (propertyPathDepth) {
        fieldProperty = fieldProperty.split('.');
        fieldProperty.splice(0, propertyPathDepth);
        fieldProperty = fieldProperty.join('.');
      }
      // Simple add the property key to _invalidKeys array
      this._invalidKeys.push(fieldProperty);

      /**
      * TODO: Create a rly helpful Error Object!
      * Here we need also our custom error messages key we need to return
      * The returned key can be used to return a reactive error message
      */

      this._validationErrors.push(_.extend(
        error,
        {
          property: fieldProperty
        }
      ));

    });


    this._depsAny.changed();

    // Does a created field Dependency changed ?
    _.each(this._depsField, fieldDep => fieldDep.changed());

    return this._validationError;
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
