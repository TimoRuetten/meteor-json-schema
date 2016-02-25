
const _Collection = new Meteor.Collection(null);

const simulateCollectionUpdate = function (modifier, opt, defaultDoc) {
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
};

/**
* Define deny rules
*/
const defineDenyRules = function (collection) {

  collection.deny({
    insert() {
      return false;
    },
    update() {
      return false;
    }
  });
  return null;
};

/**
  This will simulate a update on a collection based on the schema
*/
Mongo.Collection.prototype.simulateModifier = function (obj, opt, findOne) {
  if (!this._mjs || !(this._mjs instanceof JsonSchema)) {
    throw new Meteor.Error(400, 'You are not able to simulate a modifier without attached a schema');
  }
  const defaultDoc = findOne ? this.findOne(findOne):{};
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
    console.log('Called a mongo method ... server:', Meteor.isServer);
    if (this._mjs) {
      if (method == 'insert') {
        const doc = args[0];
        if (doc) {
          let validation = this._mjs.validate(doc);
          if (!validation.valid) {
            return validation._getError();
          }
        }
      } else if (Meteor.isServer && method == 'update') {
        const query = args[0] || {};
        const doc   = args[1] || {};
        const opt   = args[2] || {};

        if (opt.multi) {
          console.log('Attention: MULTI UPDATE VALIDATIONS NOT POSSIBLE YET');
        } else {
          let updatedDoc = this.simulateModifier(doc, opt, query);
          let validation = this._mjs.validate(updatedDoc);
          if (!validation.valid) {
            return validation._getError();
          }
        }

      }
    }

    return mongoMethod.apply(this, args);
  };


});
