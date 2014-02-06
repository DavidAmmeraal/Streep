var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    axis: String,
    amount: Number
});
module.exports = mongoose.model('Rotate', schema);