var mongoose = require('mongoose');
var Legs = require('./legs');
var Nose = require('./nose');
var Glass = require('./glass');

var schema = new mongoose.Schema({
    name: String,
    noses: [{type: mongoose.Schema.Types.ObjectId, ref: 'Nose'}],
    legs: [{type: mongoose.Schema.Types.ObjectId, ref: 'Legs'}],
    glasses: [{type: mongoose.Schema.Types.ObjectId, ref: 'Glass'}]
});

var model = mongoose.model("Front", schema);
module.exports = model;