
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
Mongo.Collection.prototype.simulateModifier = function (obj, opt, query) {
  if (!this._mjs || !(this._mjs instanceof JsonSchema)) {
    throw new Meteor.Error(400, 'You are not able to simulate a modifier without attached a schema');
  }

  let defaultDoc = false;
  //const defaultDoc = query ? this.findOne(query):{};

  if (query) {
    if (opt.multi) {
      /**
      * TODO: Add support for multi update
      */
    } else {
      // get doc with findOne
      defaultDoc = this.findOne(query) || {};
    }
  }
  if (!defaultDoc) {
    // use a "prefilled" version of this._mjs
    defaultDoc = {};//this._mjs.prefill();
  }
  /**
  * TODO:
  * Maybe the collection is not published to the client so we have to
  * to make a fallback if we dont get a document back so we are
  * not able to validate it correctly - OR we are not able to get
  * the full document (because of its publish options)
  * --> So: What to do there ? We have to check.
  */
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
        if (Meteor.isServer) {
          const query = args[0];
          const update = args[1];
          const opt = (_.isFunction(args[2]) ? {}:args[2]) || {};

          let doc = this.simulateModifier(update, opt, query);
          let validation = this._mjs.validate(doc);
          if (!validation.valid) {
            /**
            * TODO:
            * Get the "new" JsonSchemaError object and cancel the method/threw the error
            */
            throw new Meteor.Error(400, 'The Validation failed');
          }
        }

      }
    }

    return mongoMethod.apply(this, args);
  };


});
