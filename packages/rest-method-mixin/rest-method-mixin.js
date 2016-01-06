RestMethodMixin = function (options) {
  if (!options.restOptions) {
    throw new Error("Must pass 'restOptions' when using RestMethodMixin.");
  }

  if (Meteor.isServer) {
    SimpleRest.setMethodOptions(options.name, options.restOptions);
  }

  return options;
};
