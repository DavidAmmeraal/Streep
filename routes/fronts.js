var mongoose = require('mongoose');
var Front = require('../models/front');
var url = require('url');

/*
 * GET parent components.
 */
exports.all = function(req, res){
    var urlParts = url.parse(req.url, true);
    var urlQuery = urlParts.query;
    var query = Front.find().skip(urlQuery['skip']).limit(urlQuery['limit']).populate('legs');
    query.exec(function(err, results){
        err ? console.log(err) : res.send(JSON.stringify(results));
    });
};

exports.findById = function(req, res){
    Front.findById(req.params.id, function(err, result){
        err ? res.send(err) : res.send(JSON.stringify(result));
    });
};