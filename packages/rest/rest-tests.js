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

  Meteor.method("status-code", function () {
    this.setStatusCode(222);
  });

  Meteor.method("throws-error", function () {
    throw new Error('Bad');
  });

  Meteor.method("throws-meteor-error", function () {
    throw new Meteor.Error('foo-bar', 'Foo');
  });

  Meteor.method("throws-sanitized-error", function () {
    var error = new Error('Bad');
    error.sanitizedError = new Meteor.Error('foo-bar', 'Foo');
    throw error;
  });

  Meteor.method("throws-error-custom", function () {
    var error = new Error('Bad');
    error.jsonResponse = {ding: 'dong'};
    error.statusCode = 499;
    throw error;
  });

  Meteor.method("throws-meteor-error-custom", function () {
    var error = new Meteor.Error('foo-bar', 'Foo');
    error.jsonResponse = {ding: 'dong'};
    error.statusCode = 499;
    throw error;
  });

  Meteor.method("throws-sanitized-error-custom", function () {
    var error = new Error('Bad');
    error.jsonResponse = {ding: 'ding'};
    error.statusCode = 999;
    error.sanitizedError = new Meteor.Error('foo-bar', 'Foo');
    error.sanitizedError.jsonResponse = {ding: 'dong'};
    error.sanitizedError.statusCode = 499;
    throw error;
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
  })

  Tinytest.add("routes exist for mutator methods", function (test) {
    var mutatorMethodPaths = [
      "/widgets",
      "/widgets/:_id",
      "/doodles",
      "/doodles/:_id",
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
      HTTP.post("/i-love-widgets", expect(function (err, res) {
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

  testAsyncMulti("getting a publication with query arguments", [
    function (test, expect) {
      HTTP.get("/publications/widgets-above-index-custom-args?index=4",
        expect(function (err, res) {
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

  testAsyncMulti("calling method with wrong auth", [
    function (test, expect) {
      HTTP.post("/methods/return-five-auth", {
        headers: { Authorization: "Bearer foo" }
      }, expect(function (err, res) {
        test.equal(err, null);
        test.equal(res.data, 0);
      }));
    }
  ]);

  testAsyncMulti("method error", [
    function (test, expect) {
      HTTP.post("/methods/throws-error", expect(function (err, res) {
        test.isTrue(!!err);
        test.equal(res.data.error, "internal-server-error");
        test.equal(res.statusCode, 500);
      }));
    }
  ]);

  testAsyncMulti("method meteor error", [
    function (test, expect) {
      HTTP.post("/methods/throws-meteor-error", expect(function (err, res) {
        test.isTrue(!!err);
        test.equal(res.data.reason, "Foo");
        test.equal(res.statusCode, 400);
      }));
    }
  ]);

  testAsyncMulti("method error with meteor error", [
    function (test, expect) {
      HTTP.post("/methods/throws-sanitized-error", expect(function (err, res) {
        test.isTrue(!!err);
        test.equal(res.data.reason, "Foo");
        test.equal(res.statusCode, 400);
      }));
    }
  ]);

  testAsyncMulti("method error custom", [
    function (test, expect) {
      HTTP.post("/methods/throws-error-custom", expect(function (err, res) {
        test.isTrue(!!err);
        test.equal(res.data.ding, "dong");
        test.equal(res.statusCode, 499);
      }));
    }
  ]);

  testAsyncMulti("method meteor error custom", [
    function (test, expect) {
      HTTP.post("/methods/throws-meteor-error-custom", expect(function (err, res) {
        test.isTrue(!!err);
        test.equal(res.data.ding, "dong");
        test.equal(res.statusCode, 499);
      }));
    }
  ]);

  testAsyncMulti("method error with meteor error custom", [
    function (test, expect) {
      HTTP.post("/methods/throws-sanitized-error-custom", expect(function (err, res) {
        test.isTrue(!!err);
        test.equal(res.data.ding, "dong");
        test.equal(res.statusCode, 499);
      }));
    }
  ]);

  testAsyncMulti("method status code", [
    function (test, expect) {
      HTTP.post("/methods/status-code", expect(function (err, res) {
        test.isFalse(!!err);
        test.equal(res.statusCode, 222);
      }));
    }
  ]);

  var widgets = [];
  testAsyncMulti("mutator methods", [
    function (test, expect) {
      HTTP.post("/widgets", { data: [{
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
      var _id = _.values(widgets)[0]._id;
      HTTP.call("patch", "/widgets/" + _id, {
        data: { specialKey: "Over 9000!" }
      }, expect(function (err) {
        test.equal(err, null);
      }));
    },
    function (test, expect) {
      HTTP.get("/publications/widgets", expect(function (err, res) {
        test.equal(err, null);

        // Make sure our special key was saved
        test.isTrue(_.findWhere(res.data.widgets,
          { specialKey: "Over 9000!" }));
      }));
    },
    function (test, expect) {
      HTTP.del("/widgets/" + _.values(widgets)[0]._id, expect(function (err) {
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

  // Some tests with JQuery as well
  testAsyncMulti("calling method with JQuery with custom getArgsFromRequest", [
    function (test, expect) {
      $.ajax({
        method: "get",
        url: "/add-arguments-from-url/2/3",
        success: expect(function (data) {
          test.equal(data, 5);
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
