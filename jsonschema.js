
const compositeSchema = function (schemaObject, parent) {
  if (!parent) parent = [];
  if (schemaObject.$ref) {
    let referencedSchema = this.Validator.schemas[schemaObject.$ref];
    delete schemaObject.$ref;
    schemaObject = _.extend({}, schemaObject, referencedSchema);
  }
  _.each(schemaObject.properties, (schemaField, schemaProperty)=>{
    let newParent = _.clone(parent);
    newParent.push(schemaProperty);
    this._keys.push(newParent.join('.'));
    schemaObject.properties[schemaProperty] = compositeSchema.call(this, schemaField, newParent);
  });

  return schemaObject;
};

const cleanJsonschema = function (schema, doc, opt) {
  let cleanedDoc = {};

  if (schema.properties) {
    _.each(schema.properties, function(properties, field){
      cleanedDoc[field] = cleanJsonschema(properties, doc, opt);
    });
  } else {
    return schema.defaultValue || null;
  }


  return cleanedDoc;

};

JsonSchema = class JsonSchema {
  constructor(schema, opt) {
    this.opt = _.extend({}, {
      validator: 'default'
    }, opt);

    this._contexts = {};
    this._keys = [];

    this.Validator = JsonSchemaUtility.Validator(this.opt.validator);

    this.schema = schema;
    this.compositedSchema = compositeSchema.call(this, schema);

    // Adding the schema to the scope of schemas when it provides a id
    if (schema.id) {
      this.Validator.addSchema(schema, schema.id);
    }

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

  getDefaultValue(field) {
    let schema = this.getSchema(field);
    if (!schema) return;
    if (typeof(schema.defaultValue) == 'undefined') return;
    if (_.isFunction(schema.defaultValue)) {
      return schema.defaultValue.call({});
    }
    return schema.defaultValue;
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
    return this._keys;
  }
  getChildKeys(key) {
    // TODO: Add the depth argument
    return null;
  }

  attachTo(collection) {
    if (!(collection instanceof Meteor.Collection)) {
      throw new Meteor.Error(400, 'You must attach a valid Meteor.Collection instance.');
    }
    if (!collection._mjs) {
      collection.attachJsonSchema(this);
    }
    return this;
  }

  clean(doc, opt) {
    let cleanedDoc = {};
    opt = _.extend({}, opt);
    cleanedDoc = cleanJsonschema(this.schema, doc, opt);
    return cleanedDoc;
  }

};
