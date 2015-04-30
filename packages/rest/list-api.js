// publish all API methods
Meteor.publish("api-routes", function () {
  var self = this;

  // Deduplicate routes across paths
  paths = {};

  _.each(JsonRoutes.routes, function (route) {
    pathInfo = paths[route.path] || { methods: [] };

    pathInfo.methods.push(route.method);

    paths[route.path] = pathInfo;
  });

  _.each(paths, function (pathInfo, path) {
    self.added("api-routes", path, pathInfo);
  });

  self.ready();
});
