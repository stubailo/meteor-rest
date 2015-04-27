// publish all API methods
Meteor.publish("api-routes", function () {
  var self = this;
  _.each(JsonRoutes.routes, function (route) {
    self.added("api-routes", route.method + " " + route.path, route);
  });
  self.ready();
});
