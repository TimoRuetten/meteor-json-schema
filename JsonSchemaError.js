/**
* Missing Error keys:
*
*
*
*
*/
JsonSchemaErrorMessages = {
  required: '${label} is required.',
  integer() {
    return '${label} must be an integer';
  }
};

/**
* JsonSchemaError
* This will return a prepared error Object with all required error messages which can be reactive
* Also we are able to threw a prepared JsonSchemaError for oiur Collections
*/

JsonSchemaError = class {
  /**
  * new JsonSchemaError(errorObject);
  * @param errorObject Error object from JsonSchema.
  */
  constructor(errorObject) {
    this.code = 400;
    this.reason = 'Invalid Validation';
    this.details = [
      'Invalid key for 1',
      'Invalid key for 2'
    ];
  }
  threw() {
    let {code, reason, details} = this;
    return new Meteor.Error(code, reason, details);
  }
};
