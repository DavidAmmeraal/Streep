var mongoose = require('mongoose');
var Pattern = require('./pattern');

var schema = new mongoose.Schema({
    name: String
});

var model = mongoose.model("Glass", schema);
module.exports = model;