var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    frame: {
        name: String,
        basePrice: Number
    },
    nose: {
        name: String,
        priceExtra: Number,
        color: String
    },
    dateCreated: {type: Date, default: Date.now},
    glasses: {
        name: String,
        color: String,
        priceExtra: Number,
        opacity: Number
    },
    legs: {
        color: String
    }
});

var model = mongoose.model("Creation", schema);
module.exports = model;