var EventEmitter = Npm.require('events').EventEmitter;

// This file describes something like Subscription in
// meteor/meteor/packages/ddp/livedata_server.js, but instead of sending
// over a socket it puts together an HTTP response
HttpSubscription = function (options) {
  // Object where the keys are collection names, and then the keys are _ids
  this.responseData = {};

  this.connection = new HttpConnection(options.request);
  this.userId = options.userId;
};

// So that we can listen to ready event in a reasonable way
Meteor._inherits(HttpSubscription, EventEmitter);

_.extend(HttpSubscription.prototype, {
  added: function (collection, id, fields) {
    var self = this;

    check(collection, String);
    if (id instanceof Mongo.Collection.ObjectID) id = id + '';
    check(id, String);

    self._ensureCollectionInRes(collection);

    // Make sure to ignore the _id in fields
    var addedDocument = _.extend({_id: id}, _.omit(fields, '_id'));
    self.responseData[collection][id] = addedDocument;
  },

  changed: function (collection, id, fields) {
    var self = this;

    check(collection, String);
    if (id instanceof Mongo.Collection.ObjectID) id = id + '';
    check(id, String);

    self._ensureCollectionInRes(collection);

    var existingDocument = this.responseData[collection][id];
    var fieldsNoId = _.omit(fields, '_id');
    _.extend(existingDocument, fieldsNoId);

    // Delete all keys that were undefined in fields (except _id)
    _.each(fields, function (value, key) {
      if (value === undefined) {
        delete existingDocument[key];
      }
    });
  },

  removed: function (collection, id) {
    var self = this;

    check(collection, String);
    if (id instanceof Mongo.Collection.ObjectID) id = id + '';
    check(id, String);

    self._ensureCollectionInRes(collection);

    delete self.responseData[collection][id];

    if (_.isEmpty(self.responseData[collection])) {
      delete self.responseData[collection];
    }
  },

  ready: function () {
    this.emit('ready', this._generateResponse());
  },

  onStop: function () {
    // no-op in HTTP
  },

  error: function (error) {
    throw error;
  },

  _ensureCollectionInRes: function (collection) {
    this.responseData[collection] = this.responseData[collection] || {};
  },

  _generateResponse: function () {
    var output = {};

    _.each(this.responseData, function (documents, collectionName) {
      output[collectionName] = _.values(documents);
    });

    return output;
  },
});
