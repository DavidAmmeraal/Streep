var mongoose = require('mongoose');
var Pattern = require('./pattern');

var schema = new mongoose.Schema({
    name: String,
    patterns: [{type: mongoose.Schema.Types.ObjectId, ref: 'Pattern'}]
});

var model = mongoose.model("Legs", schema);
module.exports = model;