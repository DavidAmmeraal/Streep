var mongoose = require('mongoose');
var ParentComponent = require('../models/parent-component');
/*
 * GET parent components.
 */

exports.list = function(req, res){
    var query = ParentComponent.find();
    query.exec(function (err, components) {
        if(err){
            console.log(err);
        }else{
            res.send(JSON.stringify(components));
        }
    });
};