var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    name: String
});

var model = mongoose.model("Nose", schema);
module.exports = model;