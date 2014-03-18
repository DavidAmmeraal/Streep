var mongoose = require('mongoose');
var Legs = require('./legs');
var Nose = require('./nose');

var schema = new mongoose.Schema({
    name: String,
    noses: [{type: mongoose.Schema.Types.ObjectId, ref: 'Nose'}],
    legs: [{type: mongoose.Schema.Types.ObjectId, ref: 'Legs'}]
});

var model = mongoose.model("Front", schema);
module.exports = model;