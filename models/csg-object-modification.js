var mongoose = require('mongoose');
var CSGObject = require('./csg-object');

var schema = new mongoose.Schema({
    type: 'string',
    readable: 'string',
    objects: [CSGObject.schema]
});
module.exports = mongoose.model('CSGObjectModification', schema);