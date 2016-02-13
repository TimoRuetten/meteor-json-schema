Handlebars.registerHelper('isFieldValid', function(field, context) {
  if (!(context instanceof JsonSchemaContext)) {
    console.log('This is not a valid JsonSchemaContext:', context);
    return null;
  }
  return context.isFieldValid(field);
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
