var express = require('express');
var jiff = require('jiff');
var debug = require('debug')('api-test');

var mongojs = require('mongojs');

var db = mongojs('localhost/api-test', ['docs']);

var router = express.Router();

function objectHash(obj) {
  return obj.id || obj._id || obj.hash || JSON.stringify(obj);
}

var apiDoc;

function loadDoc(cb) {
  if (apiDoc !== undefined) return cb(null, apiDoc);

  return db.docs.findOne({name: 'test1'}, function(err, doc) {
    if (err) return cb(err);

    if (doc) {
      apiDoc = doc;
      return cb(null, apiDoc);
    }

    db.docs.insert({name: 'test1', data: {}, patches: []}, function(err, inserted) {
      if (err) return cb(err);

      apiDoc = inserted;
      cb(null, apiDoc);
    });
  });
}



router.get('/', function(req, res) {
  loadDoc(function(err, apiDoc) {
    if (err) {
      return res.status(500).json(err);
    }
    var patches = apiDoc.patches;
    var lastPatch = patches.length ? patches[patches.length - 1].ts : 0;
    res.set('X-Last-Patch', lastPatch);
    res.json(apiDoc.data);
  });
});

router.get('/patches', function(req, res) {
  loadDoc(function(err, apiDoc) {
    if (err) {
      return res.status(500).json(err);
    }

    console.log(apiDoc);

    res.json(apiDoc.patches);
  });
});

router.put('/', function(req, res) {
  loadDoc(function(err, apiDoc) {
    if (err) {
      return res.status(500).json(err);
    }

    // clone data
    var newData = req.body;
    var diff = jiff.diff(apiDoc.data, newData, objectHash);
    if (diff.length) {
      var patch = [Date.now(), diff];
      apiDoc.patches.push(patch);
      apiDoc.data = newData;
      res.json(diff);

      db.docs.update({name: 'test1'}, {$set: {data: newData}, $push: {patches: patch}}, function(err) {
        console.log(err);
      });
    } else {
      res.status(204).send('No Change');
    }
  });
});

module.exports = router;
