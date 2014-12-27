var debug = require('debug')('api-test:store');
var jiff = require('jiff');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/api-test');

var Snapshot = require('../models/snapshot.js');
var Patch = require('../models/patch.js');

var mongojs = require('mongojs');

var db = mongojs('localhost/api-test', ['docs', 'patches']);

function objectHash(obj) {
  return obj.id || obj._id || obj.hash || JSON.stringify(obj);
}

var stores = {};

module.exports = function(io) {
  return function(name) {
    var store = stores[name];
    if (!store) {
      store = stores[name] = new Store(name, io);
    }
    return store;
  };
};

function Store(name, io) {
  var snapshot;

  var patchesIO = io.of('/patches/' + name);

  this.snapshot = function(cb) {
    if (snapshot !== undefined) return cb(null, snapshot);

    Snapshot.findOne({name: name}, processSnapshot);

    function processSnapshot(err, snapshotDoc) {
      if (err) return cb(err);

      debug(snapshotDoc);

      snapshot = snapshotDoc;
      if (snapshot) return cb(null, snapshot);

      debug('inserting new doc %s', name);

      new Snapshot({
        name: name,
        doc: {}
      }).save(handleInserted);
    }

    function handleInserted(err) {
      if (err) return cb(err);

      Snapshot.findOne({name: name}, processSnapshot);
    }
  };

  this.update = function(updatedDoc, cb) {
    var now = Date.now();
    var diff;

    this.snapshot(processUpdate);

    function processUpdate(err, snapshot) {
      if (err) return cb(err);

      diff = jiff.diff(snapshot.doc || {}, updatedDoc, objectHash);

      if (diff.length === 0) {
        return cb(null, []);
      } else {
        new Patch({name: name, ts: now, diff: diff}).save(updateSnapshotDoc);
      }
    }

    function updateSnapshotDoc(err, savedPatch) {
      if (err) return cb(err);

      patchesIO.emit('patch', {
        ts: savedPatch.ts,
        diff: savedPatch.diff
      });

      snapshot.doc = updatedDoc;
      snapshot.ts = now;
      snapshot.save(buildResponse);
    }

    function buildResponse(err) {
      if (err) return cb(err);

      cb(err, diff);
    }
  };

  this.patches = function(after, cb) {
    Patch.find({name: name, ts: {$gt: after}}).sort('ts').find(function(err, patches) {
      if (err) return cb(err);

      var result = [];

      patches.forEach(function(patch) {
        result = result.concat({
          ts: patch.ts,
          diff: patch.diff
        });
      });

      cb(null, result);
    });
  };


}
