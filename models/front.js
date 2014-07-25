var mongoose = require('mongoose');
var Legs = require('./legs');
var Nose = require('./nose');
var Glass = require('./glass');

var schema = new mongoose.Schema({
    name: String,
    fileselector: String,
    noses: [{type: mongoose.Schema.Types.ObjectId, ref: 'Nose'}],
    legs: [{type: mongoose.Schema.Types.ObjectId, ref: 'Legs'}],
    glasses: [{type: mongoose.Schema.Types.ObjectId, ref: 'Glasses'}]
});

var model = mongoose.model("Front", schema);
module.exports = model;