var mongoose = require('mongoose');

var Modification = require('./modification');

var schema = new mongoose.Schema({
    name: String,
    modifications: [Modification.schema],
    position: {
        x: Number,
        y: Number,
        z: Number
    }
});
module.exports = mongoose.model('Connector', schema);