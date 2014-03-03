var mongoose = require('mongoose');
var Frame = require('../models/frame');
var url = require('url');

/*
 * GET parent components.
 */
exports.all = function(req, res){
    var urlParts = url.parse(req.url, true);
    var urlQuery = urlParts.query;
    var query = Frame.find().skip(urlQuery['skip']).limit(urlQuery['limit']);
    query.exec(function(err, results){
        err ? console.log(err) : res.send(JSON.stringify(results));
    });
};

exports.findById = function(req, res){
    Frame.findById(req.params.id, function(err, result){
        err ? res.send(err) : res.send(JSON.stringify(result));
    });
};

exports.chooseFrame = function(req, res){
    res.render('choose-frame', { title: 'Please choose your frame!' });
}

exports.editFrame = function(req, res){
    res.render('edit-frame', { title: 'Edit your frame'});
}

exports.editMenu = function(req, res){

}