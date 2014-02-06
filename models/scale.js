var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    x: Number,
    y: Number,
    z: Number
});
module.exports = mongoose.model('Scale', schema);