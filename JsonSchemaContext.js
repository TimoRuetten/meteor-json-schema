

JsonSchemaErrorMessages = {
  required() {
    return `${this.label} [${this.key}] is required.`;
  },
  type() {
    return `${this.label} [${this.key}] must be a ${this.argument}.`;
  },
  not() {
    return `${this.label} [${this.key}] is not allowed to be a ${this.argument}.`;
  },
  disallow() {
    return `${this.label} [${this.key}] is not allowed to be a ${this.argument}.`;
  },
  additionalProperties() {
    return `${this.label} [${this.key}] does not allow additional properties.`;
  },
  patternProperties: 'Object properties pattern dismatch',
  pattern() {
    return `${this.label} [${this.key}] dismatch by pattern ${this.argument}.`;
  },
  format() {
    return `${this.label} [${this.key}] format dismatch: ${this.argument}.`;
  },
  minProperties() {
    return `${this.label} [${this.key}] needs ${this.argument} or more properties.`;
  },
  maxProperties() {
    return `${this.label} [${this.key}] needs ${this.argument} or less properties.`;
  },
  items() {
    return `${this.label} [${this.key}] items dismatch: ${this.argument}.`;
  },
  uniqueItems() {
    return `${this.label} [${this.key}] does only allowe unique items.`;
  },
  minimum() {
    if (this.schema.maximum) {
      return `${this.label} [${this.key}] needs to be ${this.argument} to ${this.schema.maximum}`;
    }
    return `${this.label} [${this.key}] needs to be ${this.argument} or more.`;
  },
  maximum() {
    if (this.schema.minimum) {
      return `${this.label} [${this.key}] needs to be ${this.schema.minimum} to ${this.argument}`;
    }
    return `${this.label} [${this.key}] needs to be ${this.argument} or less.`;
  },
  minLength() {
    return `${this.label} [${this.key}] needs to be ${this.argument} letters or more.`;
  },
  maxLength() {
    return `${this.label} [${this.key}] needs to be ${this.argument} letters or less.`;
  },
  divisibleBy() {
    return `${this.label} [${this.key}] needs to be divisible by ${this.argument}.`;
  },
  multipleOf() {
    return `${this.label} [${this.key}] needs to be multiple by ${this.argument}.`;
  },
  dependencies() {
    return `${this.label} [${this.key}] needs dependencies: ${this.argument}.`;
  },
  custom() {
    return `${this.label} [${this.key}] custom validation failed!`;
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
    this._lastDoc = false;
    this._validations = 0;
    return null;
  }
  _createErrorMessage(key) {
    let errorObject = _.findWhere(this._lastValidation.details, {key});
    if (!errorObject) return '[No Message]';

    let errorMessage = JsonSchemaErrorMessages[errorObject.type];
    if (!errorMessage) errorMessage = JsonSchemaErrorMessages.__noMessage || 'No Error Message defined.';

    let message = errorMessage;
    if (_.isFunction(message)) {
      message = errorMessage.call(_.extend(errorObject, {
        label: this.label(errorObject.key)
      }));
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
    return this._lastValidation.details;
  }

  getErrorFor(field) {
    /**
    * TODO: Here we need to return a reactive function
    */
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
