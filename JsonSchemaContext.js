

JsonSchemaErrorMessages = {
  required() {
    return `${this.label} [${this.key}] is required.`;
  },
  type() {
    return `${this.label} [${this.key}] must be a ${this.argument}.`;
  }
};


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
  _createErrorMessage(key) {
    let errorObject = _.findWhere(this._lastValidation.details, {key});
    if (!errorObject) return '[No Message]';

    let errorMessage = JsonSchemaErrorMessages[errorObject.type];
    if (!errorMessage) errorMessage = JsonSchemaErrorMessages.__noMessage || 'No Error Message defined.';

    let message = errorMessage;
    if (_.isFunction(message)) {
      message = errorMessage.call({
        key: errorObject.key,
        argument: errorObject.argument,
        label:this.label(errorObject.key)
      });
    }

    return message;
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
    this._depsAny.depend();
    // TODO: We have to make the error messages also reactive when its a function
    return this._lastValidation.details;
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
    this._lastValidation.details.map((error)=>{
      error.message = this._createErrorMessage(error.key);
      return error;
    });
    this._validations++;

    this._depsAny.changed();
    _.each(this._depsKey, fieldDep => fieldDep.changed());

    return validation;
  }


};
