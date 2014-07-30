var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/blog', function(req, res) {
  res.render('index', { title: 'Express' });
});
router.get('/addpost', function(req, res) {
  res.render('addpost', { title: 'Express' });
});
router.post('/addpost', function(req, res) {
  res.render('addpost', { title: 'Express' });
});
module.exports = router;
