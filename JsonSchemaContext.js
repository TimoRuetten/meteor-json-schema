
JsonSchemaContext = class {
  constructor(mjs) {
    this._mjs = mjs;

    this._depsAny = new Tracker.Dependency();
    this._depsField = {};

    this._reset();
  }
  _reset() {
    this._invalidKeys = []; // all keys in dot notation which have problems: ['person.name', 'address']
    this._validationErrors = []; // a cleaned version of errors
    this._validationError = false; // original jsonschema error
    this._isValid = false; // true|false of validation result of the last doc
    this._lastDoc = false; // the last doc which was validated
    this._validations = 0; // num of validations in this context
    return null;
  }
  label() {
    return this._mjs.label.apply(this._mjs, _.toArray(arguments));
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

    this._validations++;

    this._validationError = validation;
    this._isValid = validation.valid;
    this._lastDoc = validation.instance;
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

    return this._validationErrors;
  }

  getDoc() {
    return this._lastDoc;
  }

};
