var mongoose = require('mongoose');
var Transformation = require('./transformation')

var schema = new mongoose.Schema({
    name: String,
    type: String,
    readable: String,
    transformations: [Transformation.schema],
    depth: Number
});
module.exports = mongoose.model('CSGTextModification', schema);