//var $ = require('jquery');

var Store = require('./store.js');
var store = new Store('test');
var Handlebars = require('handlebars');
var templates = require('./templates.js');
var dom = require('dom');

store.on('change', function(doc) {
  dom('#app').text(templates.test({
    json: JSON.stringify(doc)
  }));
});
