/**
* Missing Error keys:
*
*
*
*
*/
JsonSchemaErrorMessages = {
  required: '${label} is required.',
  type: '[label] must be a [argument].',
  _type() {
    let {label, argument} = this;
    return `${label} must be a ${argument}`;
  },
  __type() {
    if (this.argument == 'integer') {
      return 'No integer - no fun!';
    }
    return 'Type Error.';
  },
  integer() {
    return '${label} must be an integer';
  }
};

/**
* JsonSchemaError
* This will return a prepared error Object with all required error messages which can be reactive
* Also we are able to threw a prepared JsonSchemaError for oiur Collections
*/

JsonSchemaValidation = class {
  /**
  * new JsonSchemaError(errorObject);
  * @param ValidatorResult object from jsonschema.
  */
  constructor(ValidatorResult) {

    this.invalidKeys = [];
    this.details = [];
    this._ValidatorResult = ValidatorResult;
    this.valid = ValidatorResult.valid;


    if (!this.valid) {

      this.reason = 'Invalid Validation';

      let propertyPathDepth = 0;
      if (ValidatorResult.instance) {
        propertyPathDepth = ValidatorResult.propertyPath.split('.').length;
        if (propertyPathDepth < 0) propertyPathDepth = 0;
      }
      ValidatorResult.errors.map((error)=>{
        let fieldProperty = error.property;
        // Remove the propertyPath if necessery
        if (propertyPathDepth) {
          fieldProperty = fieldProperty.split('.');
          fieldProperty.splice(0, propertyPathDepth);
          fieldProperty = fieldProperty.join('.');
        }
        // Simple add the property key to _invalidKeys array
        this.invalidKeys.push(fieldProperty);



        /**
        * This is heavy under construction and not working yet!
        */
        let errorMessage = '[label] ' + error.message;
        let customMessage = JsonSchemaErrorMessages[error.name];
        const bindObject = {
          label: 'Placeholder'
        };
        if (customMessage) {
          errorMessage = _.isFunction(customMessage) ? customMessage.bind(bindObject)():customMessage;
        }




        this.details.push(errorMessage);
      });

    }

  }

  _createErrorMessage(error) {
    // by error
    return key;
  }

  threw() {
    if (this.valid) return null;
    let {reason, details} = this;
    return new Meteor.Error(400, reason, details);
  }
};
