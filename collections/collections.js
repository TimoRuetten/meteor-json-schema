/**
* We want to add our schemas to our collections
*/


Mongo.Collection.prototype.attachJsonSchema = function(schema, opt) {
  this._mjs = schema;
  opt = _.extend({}, {

  }, opt);
};


const manipulateMongoMethods = ['insert', 'update'];

manipulateMongoMethods.map(function(method){
  let mongoMethod = Mongo.Collection.prototype[method];

  Mongo.Collection.prototype[method] = function(...args) {

    if (this._mjs) {

      const doc = (method == 'insert') ? args[0]:false;

      if (doc) {
        let validation = this._mjs.validate(doc);
        if (!validation.valid) {
          // Trigger a error
          throw new Meteor.Error(400, 'The Validation failed');
        }
      }
    }

    return mongoMethod.apply(this, args);
  };


});
