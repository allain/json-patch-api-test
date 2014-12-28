//var $ = require('jquery');

var Store = require('./store.js');
var templates = require('./templates.js');

var store = new Store('test');
store.on('change', function(doc) {
  document.getElementById('app').innerText = JSON.stringify(doc);
});
