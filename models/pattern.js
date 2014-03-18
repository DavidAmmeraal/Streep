var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    name: String
});

var model = mongoose.model("Pattern", schema);
module.exports = model;