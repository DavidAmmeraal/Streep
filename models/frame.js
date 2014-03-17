var mongoose = require('mongoose');
var front = require('./front');

/*
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
*/
var schema = new mongoose.Schema({
   name: String,
   fronts: [{type: mongoose.Schema.Types.ObjectId, ref: 'Front'}]
});

var model = mongoose.model("Frame", schema);
module.exports = model;