var mongoose = require('mongoose');
var ModificationSchema = require('./csg-object-modification');

module.exports = mongoose.Schema({
    name: String,
    modifications: [ModificationSchema],
    position: {x: Number, y: Number, z: Number},
});