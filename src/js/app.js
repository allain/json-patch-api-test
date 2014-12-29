var templates = require('./templates.js');
var dom = require('dom');

var JsonPatchApiClient = require('json-patch-api-client');

var store = new JsonPatchApiClient(io, 'store1');
store.on('change', function(doc) {
  dom('#app').text(templates.test({
    json: JSON.stringify(doc, undefined, 2)
  }));
});
