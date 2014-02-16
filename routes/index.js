
/*
 * GET home page.
 */
var mongoose = require('mongoose');
mongoose.connect('localhost', 'streep');

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};