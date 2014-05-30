
/*
 * GET home page.
 */

var app = require('../app');

app.get('/', function(req, res) {
  res.render('index', { title: 'To Dos' });
});

require('./user');
