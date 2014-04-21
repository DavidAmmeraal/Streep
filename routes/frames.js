var mongoose = require('mongoose');
var Frame = require('../models/frame');
var Legs = require('../models/legs');
var url = require('url');

/*
 * GET parent components.
 */
exports.all = function(req, res){
    var urlParts = url.parse(req.url, true);
    var urlQuery = urlParts.query;
    var query = Frame.find().skip(urlQuery['skip']).limit(urlQuery['limit']);
    var depth = urlQuery['depth'];
    query.exec(function(err, results){
        if (err) return res.json(500);

        if(depth > 0){
            var options = {
                path: 'fronts',
                model: 'Front'
            };

            Frame.populate(results, options, function(err, frames){
                if(err) return res.json(500);
                results = frames;
                if(depth > 1){
                    var options = {
                        path: 'fronts.legs',
                        model: 'Legs'
                    };
                    Frame.populate(results, options, function(err, frames){
                       if(err) return res.json(500);
                        results = frames;
                        res.send(JSON.stringify(results));
                    });
                }else{
                   res.send(JSON.stringify(results));
                }
            });
        }else{
           res.send(JSON.stringify(results));
        }

    });
};

exports.findById = function(req, res){
    var urlParts = url.parse(req.url, true);
    var urlQuery = urlParts.query;
    var depth = urlQuery['depth'];
    Frame.findById(req.params.id, function(err, result){
        if (err) return res.json(500);
        if(depth > 0){
            var options = {
                path: 'fronts',
                model: 'Front'
            };

            Frame.populate(result, options, function(err, frame){
                if(err) return res.json(500);
                result = frame;
                if(depth > 1){
                    var options = {
                        path: 'fronts.legs',
                        model: 'Legs'
                    };
                    Frame.populate(result, options, function(err, frame){
                        if(err) return res.json(500);
                        result = frame;
                        var options = {
                            path: 'fronts.noses',
                            model: 'Nose'
                        }
                        Frame.populate(result, options, function(err, frame){
                            if(err) return res.json(500);
                            result = frame;
                            var options = {
                                path: 'fronts.glasses',
                                model: 'Glass'
                            }

                            Frame.populate(result, options, function(err, frame){
                                if(err) return res.json(500);
                                result = frame;

                                if(depth > 2){
                                    var options = {
                                        path: 'fronts.legs.patterns',
                                        model: 'Pattern'
                                    }
                                    Frame.populate(result, options, function(err, frame){
                                        if(err) return res.json(500);
                                        result = frame;
                                        res.send(JSON.stringify(result));
                                    });
                                }else{
                                    res.send(JSON.stringify(result));
                                }
                            });
                        });

                    });
                }else{
                    res.send(JSON.stringify(result));
                }
            });
        }else{
            res.send(JSON.stringify(result));
        }
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