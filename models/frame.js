var mongoose = require('mongoose');
var JSONComponent = require('./json-component');

var schema = new mongoose.Schema({
    name: String,
    focusPosition: {
        x: Number,
        y: Number,
        z: Number
    },
    children: [JSONComponent.schema]
});

var model = mongoose.model("Frame", schema);
module.exports = model;