//var $ = require('jquery');

var Store = require('./store.js');
var store = new Store('test');
var Handlebars = require('handlebars');
var templates = require('./templates.js');

store.on('change', function(doc) {  
  document.getElementById('app').innerText = templates.test({
    json: JSON.stringify(doc)
  });
});
