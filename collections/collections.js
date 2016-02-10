/**
* We want to add our schemas to our collections
*
*
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

      /**
        If insert:
        - get the doc
        - validate with the given schema this._mjs.validate(args[0]);

        If update:
        - get the doc
        - validate just the given fields in update

      */
      let failed = false;
      if (failed && method == 'insert') return this._makeNewID();

    }


    return mongoMethod.apply(this, args);
  };


});
