
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
const defineDenyRules = function () {
  if (!this._mjs) return null;
  let self = this;

  this.deny({
    insert(uId, doc) {
      let validation = self._mjs.validate(doc);
      if (!validation.valid) {
        throw validation._getError();
      }
      return !validation.valid;
    },
    update(uId, doc, fields, modifier) {
      // We do not need to call simulateModifier because we can use the fetched doc
      let updatedDoc = simulateCollectionUpdate(modifier, {}, doc);
      let validation = self._mjs.validate(updatedDoc);
      if (!validation.valid) {
        throw validation._getError();
      }
      return !validation.valid;
    }
    // fetch: [] will be added later for performance - we will add all relevant keys from database
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
  defineDenyRules.call(this);
};
