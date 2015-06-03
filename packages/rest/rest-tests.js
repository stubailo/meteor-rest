/* global JsonRoutes:false - from simple:json-routes package */
/* global HTTP:false - from http package */
/* global testAsyncMulti:false - from test-helpers package */

if (Meteor.isServer) {
  JsonRoutes.Middleware.use(JsonRoutes.Middleware.parseBearerToken);
  JsonRoutes.Middleware.use(JsonRoutes.Middleware.authenticateMeteorUserByToken);

  var Widgets = new Mongo.Collection("widgets");

  Meteor.publish("widgets", function () {
    return Widgets.find();
  });

  var Doodles = new Mongo.Collection("doodles");

  Meteor.methods({
    "reset-db": function () {
      Widgets.remove({});

      _.each(_.range(10), function (index) {
        Widgets.insert({
          index: index
        });
      });

      Doodles.remove({});

      _.each(_.range(10), function (index) {
        Doodles.insert({
          index: index
        });
      });
    }
  });

  Meteor.publish("doodles-and-widgets", function () {
    return [
      Widgets.find(),
      Doodles.find()
    ];
  });

  Meteor.publish("widgets-manual", function () {
    var self = this;

    Widgets.find().forEach(function (widget) {
      self.added("widgets", widget._id, widget);
    });

    self.ready();
  });

  Meteor.publish("widgets-custom-url", function () {
    return Widgets.find();
  }, {
    url: "i-love-widgets",
    httpMethod: "post"
  });

  Meteor.publish("widgets-above-index", function (index) {
    return Widgets.find({index: {$gt: parseInt(index, 10)}});
  }, {
    url: "widgets-with-index-above/:0"
  });

  Meteor.publish("widgets-above-index-custom-args", function (index) {
    return Widgets.find({index: {$gt: parseInt(index, 10)}});
  }, {
    getArgsFromRequest: function (request) {
      return [ parseInt(request.query.index, 10) ];
    }
  });

  Meteor.publish("widgets-authorized", function () {
    if (this.userId) {
      return Widgets.find();
    } else {
      this.ready();
    }
  });

  Meteor.methods({
    "return-five": function () {
      return 5;
    }
  });

  Meteor.method("return-five-auth", function () {
    if (this.userId) {
      return 5;
    } else {
      return 0;
    }
  });

  Meteor.method("add-all-arguments", function (a, b, c) {
    return a + b + c;
  });

  Meteor.method("add-arguments-from-url", function (a, b) {
    return a + b;
  }, {
    url: "/add-arguments-from-url/:a/:b",
    getArgsFromRequest: function (request) {
      var a = request.params.a;
      var b = request.params.b;

      return [ parseInt(a, 10), parseInt(b, 10) ];
    },
    httpMethod: "get"
  });

  Tinytest.add("Simple REST - routes exist for mutator methods", function (test) {
    var mutatorMethodPaths = [
      "/widgets",
      "/widgets/:_id",
      "/doodles",
      "/doodles/:_id"
    ];

    _.each(mutatorMethodPaths, function (path) {
      test.isTrue(!! _.findWhere(JsonRoutes.routes, {path: path}));
    });
  });

  Widgets.allow({
    insert: function () {
      return true;
    },
    update: function () {
      return true;
    },
    remove: function () {
      return false;
    }
  });
} else {
  // Using Meteor HTTP
  testAsyncMulti("Simple REST - getting a publication", [
    function (test, waitFor) {
      HTTP.post("/methods/reset-db", waitFor(function () {}));
    },
    function (test, waitFor) {
      HTTP.get("/publications/widgets", waitFor(function (err, res) {
        test.equal(err, null);
        test.equal(_.size(res.data.widgets), 10);
      }));
    },
    function (test, waitFor) {
      HTTP.get("/publications/widgets-manual", waitFor(function (err, res) {
        test.equal(err, null);
        test.equal(_.size(res.data.widgets), 10);
      }));
    }
  ]);

  testAsyncMulti("Simple REST - getting a publication with multiple cursors", [
    function (test, waitFor) {
      HTTP.get("/publications/doodles-and-widgets", waitFor(function (err, res) {
        test.equal(err, null);
        test.equal(_.size(res.data.widgets), 10);
        test.equal(_.size(res.data.doodles), 10);
      }));
    }
  ]);

  testAsyncMulti("Simple REST - getting a publication with custom URL", [
    function (test, waitFor) {
      HTTP.post("/i-love-widgets", waitFor(function (err, res) {
        test.equal(err, null);
        test.equal(_.size(res.data.widgets), 10);
      }));
    }
  ]);

  testAsyncMulti("Simple REST - getting a publication with URL arguments", [
    function (test, waitFor) {
      HTTP.get("/widgets-with-index-above/4", waitFor(function (err, res) {
        test.equal(err, null);
        test.equal(_.size(res.data.widgets), 5);
      }));
    }
  ]);

  testAsyncMulti("Simple REST - getting a publication with query arguments", [
    function (test, waitFor) {
      HTTP.get("/publications/widgets-above-index-custom-args?index=4",
        waitFor(function (err, res) {
          test.equal(err, null);
          test.equal(_.size(res.data.widgets), 5);
        }));
    }
  ]);

  var token;
  testAsyncMulti("Simple REST - getting a publication with authorization", [
    function (test, waitFor) {
      Meteor.call("clearUsers", waitFor(function () {}));
    },
    function (test, waitFor) {
      HTTP.post("/users/register", { data: {
        username: "test",
        email: "test@test.com",
        password: "test"
      }}, waitFor(function (err, res) {
        test.equal(err, null);
        test.isTrue(Match.test(res.data, {
          id: String,
          token: String,
          tokenExpires: String
        }));

        token = res.data.token;
      }));
    },
    function (test, waitFor) {
      HTTP.get("/publications/widgets-authorized", {
        headers: { Authorization: "Bearer " + token }
      }, waitFor(function (err, res) {
        test.equal(err, null);
        test.equal(_.size(res.data.widgets), 10);
      }));
    }
  ]);

  testAsyncMulti("Simple REST - calling method", [
    function (test, waitFor) {
      HTTP.post("/methods/return-five", waitFor(function (err, res) {
        test.equal(err, null);
        test.equal(res.data, 5);
      }));
    }
  ]);

  testAsyncMulti("Simple REST - calling method with auth", [
    function (test, waitFor) {
      HTTP.post("/methods/return-five-auth", {
        headers: { Authorization: "Bearer " + token }
      }, waitFor(function (err, res) {
        test.equal(err, null);
        test.equal(res.data, 5);
      }));
    }
  ]);

  var widgets = [];
  testAsyncMulti("Simple REST - mutator methods", [
    function (test, waitFor) {
      HTTP.post("/widgets", { data: [{
        index: 10
      }] }, waitFor(function (err) {
        test.equal(err, null);
      }));
    },
    function (test, waitFor) {
      HTTP.get("/publications/widgets", waitFor(function (err, res) {
        test.equal(err, null);
        test.equal(_.size(res.data.widgets), 11);
        widgets = res.data.widgets;
      }));
    },
    function (test, waitFor) {
      var _id = _.values(widgets)[0]._id;
      HTTP.call("patch", "/widgets/" + _id, {
        data: { specialKey: "Over 9000!" }
      }, waitFor(function (err) {
        test.equal(err, null);
      }));
    },
    function (test, waitFor) {
      HTTP.get("/publications/widgets", waitFor(function (err, res) {
        test.equal(err, null);

        // Make sure our special key was saved
        test.isTrue(_.findWhere(res.data.widgets,
          { specialKey: "Over 9000!" }));
      }));
    },
    function (test, waitFor) {
      HTTP.del("/widgets/" + _.values(widgets)[0]._id, waitFor(function (err) {
        test.equal(err.response.data.reason, "Access denied");
      }));
    }
  ]);

  // Some tests with JQuery as well
  testAsyncMulti("Simple REST - calling method with JQuery", [
    function (test, waitFor) {
      $.ajax({
        method: "post",
        url: "/methods/add-all-arguments",
        data: JSON.stringify([1, 2, 3]),
        contentType: "application/json",
        success: waitFor(function (data) {
          test.equal(data, 6);
        })
      });
    }
  ]);

  // Some tests with JQuery as well
  testAsyncMulti("Simple REST - calling method with JQuery with custom getArgsFromRequest", [
    function (test, waitFor) {
      $.ajax({
        method: "get",
        url: "/add-arguments-from-url/2/3",
        success: waitFor(function (data) {
          test.equal(data, 5);
        })
      });
    }
  ]);

  testAsyncMulti("Simple REST - getting publication with JQuery", [
    function (test, waitFor) {
      $.get("/publications/widgets", waitFor(function (data) {
        test.equal(data.widgets.length, 11);
      }));
    }
  ]);
}
