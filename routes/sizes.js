var mongoose = require('mongoose');
var Size = require('../models/size');
var url = require('url');

/*
 * GET parent components.
 */
exports.all = function(req, res){
    var urlParts = url.parse(req.url, true);
    var urlQuery = urlParts.query;
    var query = Size.find().skip(urlQuery['skip']).limit(urlQuery['limit']);
    query.exec(function(err, results){
        err ? console.log(err) : res.send(JSON.stringify(results));
    });
};

exports.findById = function(req, res){
    console.log("ID:" + req.params.id);
    Size.findById(req.params.id, function(err, result){
        err ? res.send(err) : res.send(JSON.stringify(result));
    });
};