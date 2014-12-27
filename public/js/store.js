module.exports = Store;

var xhr = require('xhr');
var jiff = require('jiff');
var debug = require('debug')('Store');

debug('hello world');

function Store(name, initialDoc, initialTimestamp) {
  var patches = io('/patches/' + name).connect();
  var state;

  var storedJSON = localStorage.getItem('store-' + name);
  if (storedJSON) {
    debug('store loaded from localStorage: %s', name);
    state = JSON.parse(storedJSON);
    pullPatches(function(err) {
      console.log('patches pulled');

      patches.on('patch', function(patch){
        applyPatches([patch]);
      });
    });
  } else {
    state = {
      doc: initialDoc || {},
      ts: initialTimestamp ? initialTimesatmp : 0
    };

    xhr({
      uri: '/api/' + name,
      headers: {
        "Accept": "application/json"
      }
    }, function (err, resp, body) {
      if (err) return console.error(err);
      if (resp.statusCode !== 200) return console.error(resp);

      state.doc = JSON.parse(body);
      state.ts = parseInt(resp.headers['x-last-patch'], 10);

      localStorage.setItem('store-' + name, JSON.stringify(state));
    });
  }

  function pullPatches(cb) {
    xhr({
      uri: '/api/' + name + '/patches?after=' + state.ts
    }, processPullResponse);

    function processPullResponse(err, resp, body) {
      if (err) {
        return cb(err);
      }

      if (resp.statusCode !== 200) {
        return cb(resp);
      }

      var patches = JSON.parse(body);
      applyPatches(patches);
      cb();
    }
  }

  function applyPatches(patches) {
    if (!patches.length) return;

    var patched = state.doc;
    var ts = 0;
    patches.forEach(function(patch) {
      patched = jiff.patch(patch.diff, patched);
      ts = patch.ts;
    });

    state.doc = patched;
    state.ts = ts;

    localStorage.setItem('store-' + name, JSON.stringify(state));
  }
}
