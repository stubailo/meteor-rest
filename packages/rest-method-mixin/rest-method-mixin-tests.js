new ValidatedMethod({
  name: 'validated-method',
  mixins: [RestMethodMixin],
  validate: null,
  run() {
    return 5;
  },
  restOptions: {
    url: '/validated-method-custom-url'
  }
});

if (Meteor.isClient) {
  testAsyncMulti('RestMethodMixin - restOptions', [
    function (test, waitFor) {
      HTTP.post('/validated-method-custom-url', waitFor(function (err, res) {
        test.equal(err, null);
        test.equal(res.data, 5);
      }));
    },
  ]);
}
