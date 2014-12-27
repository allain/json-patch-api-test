var express = require('express');
var jiff = require('jiff');
var debug = require('debug')('api-test');

module.exports = function(app, io) {
  var stores = require('../lib/store.js')(io);

  app.get('/api/:name', function(req, res) {
    var store = stores(req.params.name);

    store.snapshot(function(err, snapshot) {
      if (err) {
        return res.status(500).json(err);
      }

      res.set('X-Last-Patch', snapshot.ts || 0);
      res.json(snapshot.doc || {});
    });
  });

  app.get('/api/:name/patches', function(req, res) {
    var store = stores(req.params.name);

    store.patches(parseInt(req.query.after || '0', 10), function(err, patches) {
      if (err) {
        return res.status(500).json(err);
      }

      res.json(patches);
    });
  });

  app.put('/api/:name', function(req, res) {
    var store = stores(req.params.name);

    store.update(req.body, function(err, diff) {
      if (err) {
        return res.status(500).json(err);
      }

      if (diff.length) {
        res.json(diff);
      } else {
        res.status(204).send('No Change');
      }
    });
  });
};
