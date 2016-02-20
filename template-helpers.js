/**
  This will be excluded to another package
*/
Handlebars.registerHelper('isKeyValid', function(key, context) {
  if (!(context instanceof JsonSchemaContext)) {
    console.log('This is not a valid JsonSchemaContext:', context);
    return null;
  }
  return context.isKeyValid(key);
});
Handlebars.registerHelper('isValid', function(context) {
  if (!(context instanceof JsonSchemaContext)) {
    console.log('This is not a valid JsonSchemaContext:', context);
    return null;
  }
  return context.isValid();
});
Handlebars.registerHelper('label', function(field, mjs) {
  if ((!(mjs instanceof JsonSchema)) && (!(mjs instanceof JsonSchemaContext))) {
    console.log('This is not a valid JsonSchema or JsonSchemaContext:', mjs);
    return null;
  }
  return mjs.label(field);
});
