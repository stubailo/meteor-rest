if (Meteor.isServer) {
  var Widgets = new Mongo.Collection("widgets");

  Widgets.remove({});

  _.each(_.range(10), function (index) {
    Widgets.insert({
      item: index
    });
  });

  Meteor.publish("widgets", function () {
    return Widgets.find();
  });

  var Doodles = new Mongo.Collection("doodles");

  Doodles.remove({});

  _.each(_.range(10), function (index) {
    Doodles.insert({
      item: index
    });
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
} else {
  testAsyncMulti("getting a publication", [
    function (test, expect) {
      var done = expect();

      HTTP.get("/publications/widgets", function (err, res) {
        test.equal(_.size(res.data.widgets), 10);
        done();
      });
    },
    function (test, expect) {
      var done = expect();

      HTTP.get("/publications/widgets-manual", function (err, res) {
        test.equal(_.size(res.data.widgets), 10);
        done();
      });
    }
  ]);

  testAsyncMulti("getting a publication with multiple cursors", [
    function (test, expect) {
      var done = expect();

      HTTP.get("/publications/doodles-and-widgets", function (err, res) {
        test.equal(_.size(res.data.widgets), 10);
        test.equal(_.size(res.data.doodles), 10);
        done();
      });
    }
  ]);

  testAsyncMulti("getting a publication with custom URL", [
    function (test, expect) {
      var done = expect();

      HTTP.get("/i-love-widgets", function (err, res) {
        test.equal(_.size(res.data.widgets), 10);
        done();
      });
    }
  ]);
}