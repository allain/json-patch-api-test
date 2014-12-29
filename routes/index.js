var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', {
    title: 'json-patch-api test',
    host: 'http://' + req.host + ':3000'
  });
});

module.exports = router;
