# simple:rest-method-mixin

A mixin for [`mdg:validated-method`](https://atmospherejs.com/mdg/validated-method) to configure the HTTP endpoint for that Method when using [`simple:rest`](https://github.com/stubailo/meteor-rest/blob/master/packages/rest/README.md).

Use it like this:

```js
const method = new ValidatedMethod({
  name: 'method',
  mixins: [RestMethodMixin],
  validate: ...,
  restOptions: {
    url: '/my-custom-url',
    // any other options
  },
  run() {
    return 5;
  }
});
```

This mixin just calls `SimpleRest.setMethodOptions` with the `restOptions` passed in.
