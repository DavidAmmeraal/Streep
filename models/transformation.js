var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    type: String,
    implementation: {}
});
module.exports = mongoose.model('Transformation', schema);