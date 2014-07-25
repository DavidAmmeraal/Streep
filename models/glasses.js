var mongoose = require('mongoose');
var schema = new mongoose.Schema({
    name: String,
    img: String,
    material: String,
    color: String,
    opacity: Number,
    priceExtra: Number,
    texture: String,
    src: String,
    title: String,
    description: String,
    reflective: Boolean,
    order: Number
});

var model = mongoose.model("Glasses", schema, "glasses");
module.exports = model;