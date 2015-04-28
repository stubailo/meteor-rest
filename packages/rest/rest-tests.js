if (Meteor.isServer) {
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
    url: "i-love-widgets"
  });

  Meteor.publish("widgets-above-index", function (index) {
    return Widgets.find({index: {$gt: parseInt(index, 10)}});
  }, {
    url: "widgets-with-index-above/:0"
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

  Tinytest.add("routes exist for mutator methods", function (test) {
    var mutatorMethodPaths = [
      "/methods/widgets/insert",
      "/methods/widgets/update",
      "/methods/widgets/remove",
      "/methods/doodles/insert",
      "/methods/doodles/update",
      "/methods/doodles/remove",
    ];

    _.each(mutatorMethodPaths, function (path) {
      test.isTrue(!! _.findWhere(JsonRoutes.routes, {path: path}));
    });
  });

  Widgets.allow({
    insert: function () {
      return true;
    },
    remove: function () {
      return false;
    }
  });
} else {
  // Using Meteor HTTP
  testAsyncMulti("getting a publication", [
    function (test, expect) {
      HTTP.post("/methods/reset-db", expect(function () {}));
    },
    function (test, expect) {
      HTTP.get("/publications/widgets", expect(function (err, res) {
        test.equal(err, null);
        test.equal(_.size(res.data.widgets), 10);
      }));
    },
    function (test, expect) {
      HTTP.get("/publications/widgets-manual", expect(function (err, res) {
        test.equal(err, null);
        test.equal(_.size(res.data.widgets), 10);
      }));
    }
  ]);

  testAsyncMulti("getting a publication with multiple cursors", [
    function (test, expect) {
      HTTP.get("/publications/doodles-and-widgets", expect(function (err, res) {
        test.equal(err, null);
        test.equal(_.size(res.data.widgets), 10);
        test.equal(_.size(res.data.doodles), 10);
      }));
    }
  ]);

  testAsyncMulti("getting a publication with custom URL", [
    function (test, expect) {
      HTTP.get("/i-love-widgets", expect(function (err, res) {
        test.equal(err, null);
        test.equal(_.size(res.data.widgets), 10);
      }));
    }
  ]);

  testAsyncMulti("getting a publication with URL arguments", [
    function (test, expect) {
      HTTP.get("/widgets-with-index-above/4", expect(function (err, res) {
        test.equal(err, null);
        test.equal(_.size(res.data.widgets), 5);
      }));
    }
  ]);

  var token;
  testAsyncMulti("getting a publication with authorization", [
    function (test, expect) {
      Meteor.call("clearUsers", expect(function () {}));
    },
    function (test, expect) {
      HTTP.post("/users/register", { data: {
        username: "test",
        email: "test@test.com",
        password: "test"
      }}, expect(function (err, res) {
        test.equal(err, null);
        test.isTrue(Match.test(res.data, {
          id: String,
          token: String,
          tokenExpires: String
        }));

        token = res.data.token;
      }));
    },
    function (test, expect) {
      HTTP.get("/publications/widgets-authorized", {
        headers: { Authorization: "Bearer " + token }
      }, expect(function (err, res) {
        test.equal(err, null);
        test.equal(_.size(res.data.widgets), 10);
      }));
    }
  ]);

  testAsyncMulti("calling method", [
    function (test, expect) {
      HTTP.post("/methods/return-five", expect(function (err, res) {
        test.equal(err, null);
        test.equal(res.data, 5);
      }));
    }
  ]);

  testAsyncMulti("calling method with auth", [
    function (test, expect) {
      HTTP.post("/methods/return-five-auth", {
        headers: { Authorization: "Bearer " + token }
      }, expect(function (err, res) {
        test.equal(err, null);
        test.equal(res.data, 5);
      }));
    }
  ]);

  var widgets = [];
  testAsyncMulti("mutator methods", [
    function (test, expect) {
      HTTP.post("/methods/widgets/insert", { data: [{
        index: 10
      }] }, expect(function (err, res) {
        test.equal(err, null);
      }));
    },
    function (test, expect) {
      HTTP.get("/publications/widgets", expect(function (err, res) {
        test.equal(err, null);
        test.equal(_.size(res.data.widgets), 11);
        widgets = res.data.widgets;
      }));
    },
    function (test, expect) {
      HTTP.post("/methods/widgets/remove", { data: [{
        _id: _.values(widgets)[0]._id
      }] }, expect(function (err) {
        test.equal(err.response.data.reason, "Access denied");
      }));
    }
  ]);

  // Some tests with JQuery as well
  testAsyncMulti("calling method with JQuery", [
    function (test, expect) {
      $.ajax({
        method: "post",
        url: "/methods/add-all-arguments",
        data: JSON.stringify([1, 2, 3]),
        contentType: "application/json",
        success: expect(function (data) {
          test.equal(data, 6);
        })
      });
    }
  ]);

  testAsyncMulti("getting publication with JQuery", [
    function (test, expect) {
      $.get("/publications/widgets", expect(function (data) {
        test.equal(data.widgets.length, 11);
      }));
    }
  ]);
}
