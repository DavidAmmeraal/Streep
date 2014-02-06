var mongoose = require('mongoose');
var Connector = require('./connector');

var schema = new mongoose.Schema({
    name: String,
    src: String,
    focusPosition: {
        x: Number,
        y: Number,
        z: Number
    },
    connectors: [Connector.schema],
    material: String
});

module.exports = mongoose.model("JSONComponent", schema);