var mongoose = require('mongoose');
var Legs = require('./legs');

var schema = new mongoose.Schema({
    name: String,
    legs: [{type: mongoose.Schema.Types.ObjectId, ref: 'Legs'}]
});

var model = mongoose.model("Front", schema);
module.exports = model;