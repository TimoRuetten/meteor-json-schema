
JsonSchemaContext = class {
  constructor(mjs) {
    this._mjs = mjs;

    this._depsAny = new Tracker.Dependency();
    this._depsField = {};

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

  isFieldValid(field) {
    if (!this._depsField[field]) {
      this._depsField[field] = new Tracker.Dependency();
    }
    this._depsField[field].depend();
    return _.indexOf(this._lastValidation.invalidKeys, field) === -1;
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
