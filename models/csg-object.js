var mongoose = require('mongoose');

var Transformation = require('./transformation');

var schema = new mongoose.Schema({
    name: String,
    readable: String,
    src: String,
    transformations: [Transformation.schema]
});
module.exports = mongoose.model('CSGObject', schema);