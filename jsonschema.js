
const lodash = _;

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
    return this._keys;
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
  _cleanJsonschemaObject(context, doc, field, fieldPath) {
    let cleanedObject = {};
    if (context && context.properties) {
      _.each(context.properties, (fieldValue, fieldProperty)=>{
        let _fieldPath =(((fieldPath) ? fieldPath + '.':((field) ? field + '.':'')) + fieldProperty);
        let _context = context.properties[fieldProperty];
        cleanedObject[fieldProperty] = this._cleanJsonschemaObject(_context, doc, fieldProperty, _fieldPath);
      });
    } else {
      let value = fieldPath ? lodash.get(doc, fieldPath, null):doc;
      if (_.isNull(value) || _.isUndefined(value)) {
        value = this.getDefaultValue(fieldPath) || null;
      }
      return value;
    }

    return cleanedObject;
  }

  clean(doc, opt) {
    opt = _.extend({
      removeInvalid: false,
      setDefaultValueFallbackOnError: true,
    }, opt);

    let cleanedObject = this._cleanJsonschemaObject(this.schema, doc, null, null);
    this.getKeys().map(function(key){
      let v = lodash.get(cleanedObject, key, null);
      if (_.isNull(v) || _.isUndefined(v)) {
        lodash.unset(cleanedObject, key);
      }
    });

    if (opt.removeInvalid) {
      let validation = this.validate(cleanedObject);
      _.each(validation.invalidKeys, (invalidKey)=>{
        // do we have a defaultValue for fallback ?
        let defaultValue = null;
        if (opt.setDefaultValueFallbackOnError) {
          defaultValue = this.getDefaultValue(invalidKey);
        }
        if (!_.isNull(defaultValue) && !_.isUndefined(defaultValue)) {
          lodash.set(cleanedObject, invalidKey, defaultValue);
        } else {
          lodash.unset(cleanedObject, invalidKey);
        }
      });
    }

    return cleanedObject;
  }

};
