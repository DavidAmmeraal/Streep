var mongoose = require('mongoose');
var fs = require('fs');
var Creation = require('../models/creation');
var AdmZip = require('adm-zip');

var waitingForSTL = {};

exports.add = function(req, res){
    var creationProps = req.body.creation;
    var creation = new Creation(creationProps);
    console.log(creation);
    creation.save(function(err) {
        if (err) console.log(err);
        res.send({'creationId': creation.id});
    });
}

exports.receiveSTL = function(){
    return function(req, res){
        var creationID = req.params.creationID;

        console.log("creationID:" + creationID);
        if(req.body.stl){
            if(req.body.name != "length"){
                waitingForSTL[creationID]['parts'].push(req.body);
                waitingForSTL[creationID].callback();
            }
            res.send({'ok': true});
        }else if(req.body.amount){
            waitingForSTL[creationID] = {};
            waitingForSTL[creationID]['parts'] = [];
            waitingForSTL[creationID]['amount'] = req.body.amount;
            waitingForSTL[creationID]['callback'] = function(){
                if(waitingForSTL[creationID]['parts'].length == waitingForSTL[creationID]['amount']){
                    var zip = new AdmZip();
                    for(var i = 0; i < waitingForSTL[creationID]['parts'].length; i++){
                        var part = waitingForSTL[creationID]['parts'][i];
                        zip.addFile(part.name + ".stl", new Buffer(part.stl), "Part for STREEP glasses");
                    }
                    var buffer = zip.toBuffer();

                    var fileName = 'creations/' + creationID + '.zip';
                    var localName = '/home/streep/apps/Streep/' + fileName;
                    fs.writeFileSync(localName, buffer);
                    res.send({'finished': true});
                }
            }
            res.send({'ok': true});
        }

    }
};