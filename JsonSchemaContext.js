
JsonSchemaContext = class {
  constructor(mjs) {
    this._mjs = mjs;

    this._depsAny = new Tracker.Dependency();
    this._depsKey = {};

    this._reset();
  }
  _reset() {
    this._lastValidation = {};
    this._lastDoc = false; // the last doc which was validated
    this._validations = 0; // num of validations in this context
    return null;
  }
  label() {
    return this._mjs.label.apply(this._mjs, _.toArray(arguments));
  }
  isValid() {
    this._depsAny.depend();
    return this._lastValidation.valid;
  }

  getErrors() {
    // reactive
    return null;
  }

  getErrorFor(field) {
    return null;
  }

  isKeyValid(key) {
    if (!this._depsKey[key]) {
      this._depsKey[key] = new Tracker.Dependency();
    }
    this._depsKey[key].depend();
    return _.indexOf(this._lastValidation.invalidKeys, key) === -1;
  }

  validate(doc) {
    const validation = this._mjs.validate(doc);
    this._lastValidation = validation;
    this._validations++;
    this._lastDoc = validation.doc;

    this._depsAny.changed();
    _.each(this._depsField, fieldDep => fieldDep.changed());

    return validation;
  }

  getDoc() {
    return this._lastDoc;
  }

};
