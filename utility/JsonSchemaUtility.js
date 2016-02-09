

JsonSchemaUtility = {
  _customProperties: {

  },
  _validators: {},
  Validator(key) {
    if (!key) key = 'default';
    if (!this._validators[key]) {
      this._validators[key] = new jsonschema.Validator();
      _.each(this._customProperties, (validation, property)=>{
        this._validators[key].attributes[property] = validation;
      });
    }
    return this._validators[key];
  },
  validatorCustomProperties(key, property) {
    this._customProperties[key] = property;
    /**
      TODO:
      Assign the new Property to existing validators
    */
  }
};
