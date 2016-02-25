/**
* Missing Error keys:
*
*
*
*
*/


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
        * TODO: We have to add more and useful informations for this error.
        * example 1: When dependencie failed the information we got is not very helpful
        * Also we need to access the prop
        */

        let argument = (_.isArray(error.argument) && error.argument.length === 1) ? error.argument.shift():error.argument;
        let errorObject = {
          key: fieldProperty,
          type: error.name,
          value: error.instance,
          schema: error.schema,
          argument,
          _jsonschemaErrorObject: error
        };

        this.details.push(errorObject);
      });

    }

  }

  _createErrorMessage(error) {
    // by error
    return key;
  }

  _getError() {
    if (this.valid) return null;
    let {reason, details} = this;
    return new Meteor.Error(400, reason, details);
  }
};
