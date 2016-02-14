
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

    let validationObject = {
      invalidKeys: [],
      errors: [],
      _jsonSchemaError: validation,
      valid: validation.valid,
      doc
    };



    let propertyPathDepth = 0;
    if (validation.instance) {
      propertyPathDepth = validation.propertyPath.split('.').length;
      if (propertyPathDepth < 0) propertyPathDepth = 0;
    }

    validation.errors.map((error)=>{
      let fieldProperty = error.property;
      // Remove the propertyPath if necessery
      if (propertyPathDepth) {
        fieldProperty = fieldProperty.split('.');
        fieldProperty.splice(0, propertyPathDepth);
        fieldProperty = fieldProperty.join('.');
      }
      // Simple add the property key to _invalidKeys array
      validationObject.invalidKeys.push(fieldProperty);

      /**
      * TODO: Create a rly helpful Error Object!
      * Here we need also our custom error messages key we need to return
      * The returned key can be used to return a reactive error message
      */

      validationObject.errors.push(_.extend(
        error,
        {
          property: fieldProperty
        }
      ));

    });

    return validationObject;
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

  attachTo(collection, opt) {
    collection.attachJsonSchema(this, opt);
  }
};
