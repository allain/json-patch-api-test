var $ = require('jquery');

var Store = require('./store.js');


var store = new Store('test');
store.on('change', function(doc) {
  $('#app').text(JSON.stringify(doc));
});
