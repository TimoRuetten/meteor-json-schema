# Meteor Json Schema
Simple wrapper for ```jsonschema``` for Meteor with some extras to work better with it.

This package is currently in development so most features are missing.

Please visit [npm jsonschema site](https://www.npmjs.com/package/jsonschema) for more information about jsonschema.

After you have installed the package you are able to access the ```JsonSchema``` object on **server** and **client**.


## Add a new schema

Simply add a new Schema with the JsonSchema Object. 

```javascript
var myNewSchema = new JsonSchema({
	"id": "/NameSchema",
	"type": "object",
	"properties": {
		"name": {
			"type": "string"
		}	
	}
 });
```

Now you have access to the ```.validate(value)``` method.



This method will return a jsonschema validation object. You can simply check if the validation was successful by checking the property ```valid```. 


Example:

```javascript
myNewSchema.validate({
	name: "TimoRuetten"
}).valid; // true

myNewSchema.validate({
	name: {
		prop: "value"
	}
}).valid; //false
```

## Schema Attributes

Basicly you have access to all default jsonschema attributes for your schema.

### Custom

You are able to add a custom validation for a field. Currently you are not able to add a Async validation.

The custom validation is a function which returns nothing if the validation is successful and returns a string or a valid jsonschema error if the validation failed.

Example:


```javascript
{
	"key": {
    	type: 'string',
    	custom: function () {
  			if (this.value != "insecureKey") return "Wrong Key!"
  		}
  	}
}
```

We will bind some information for you in your custom function. These properties you are able to access:

* **this.value**: Representing the value of the current field you are validating
* **this.schema**: Representing the schema object of the field you are validating

### Label

You can add a label property to your fields. These labels will be later available for error messages and are be accesable from everywhere - for example when you are creating a form based on a schema.

Example:

```javascript
Person = new JsonSchema({
  id: '/Person',
  type: 'Object',
  label: 'Information about you',
  properties: {
    name: {
      type: 'string',
      label: 'Your Name'
    },
    address: {
      $ref: '/Address',
      label: 'Your Adress'
    }
  },
  required: ['name', 'address']
});
```

## The Future

* acess other fields in custom validation
* support for collections
* async support for custom validation
* way to access the Validator to customize
* add reactive support for label