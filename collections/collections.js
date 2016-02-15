
const _Collection = new Meteor.Collection(null);

function simulateCollectionUpdate (modifier, opt, defaultDoc) {
  if (!defaultDoc || !_.isObject(defaultDoc)) defaultDoc = {};

  let _id = _Collection.insert(defaultDoc);
  _Collection.update({
    _id
  }, modifier, opt);
  let doc = _Collection.findOne(_id);
  _Collection.remove({
    _id
  });
  delete doc._id;
  return doc;
}

/**
  This will simulate a update on a collection based on the schema
*/
Mongo.Collection.prototype.simulateModifier = function (obj, opt, _id) {
  if (!this._mjs || !(this._mjs instanceof JsonSchema)) {
    throw new Meteor.Error(400, 'You are not able to simulate a modifier without attached a schema');
  }
  const defaultDoc = _id ? {}:{};
  return simulateCollectionUpdate(obj, opt, defaultDoc);
};

/**
* We want to add our schemas to our collections
*/

Mongo.Collection.prototype.attachJsonSchema = function(schema, opt) {
  this._mjs = schema;
  opt = _.extend({}, {

  }, opt);
};

const manipulateMongoMethods = ['insert', 'update'];

manipulateMongoMethods.map(function(method) {
  let mongoMethod = Mongo.Collection.prototype[method];

  Mongo.Collection.prototype[method] = function(...args) {
    if (this._mjs) {
      if (method == 'insert') {
        const doc = args[0];
        if (doc) {
          let validation = this._mjs.validate(doc);
          if (!validation.valid) {
            /**
            * TODO:
            * Get the "new" JsonSchemaError object and cancel the method/threw the error
            */
            throw new Meteor.Error(400, 'The Validation failed');
          }
        }
      } else if (method == 'update') {
        const doc = args[1];

      }
    }

    return mongoMethod.apply(this, args);
  };


});
