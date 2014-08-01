var AdmZip = require('adm-zip');
var mongoose = require('mongoose');
var extend = require('extend');

var Frame = require('../models/frame');
var Front = require('../models/front');
var Glasses = require('../models/glasses');
var ObjectId = require('mongoose').Types.ObjectId;

var publicPath = "/home/streep/apps/Streep/public";

var imageFolder =  "/images";
var imagePath = publicPath + imageFolder;
var objectFolder = "/3dmodels/glasses";
var objectPath = publicPath + objectFolder;
var textureFolder = "textures/glasses";
var texturePath = imagePath + "/" + textureFolder;

var baseObject = {
    "material" : "MeshLambertMaterial"
};

var getFrames = function(callback){
    var query = Frame.find();
    query.exec(function(err, results){
        var options = {
            path: 'fronts',
            model: 'Front'
        };
        Frame.populate(results, options, function(err, frames){
            callback(frames);
        });
    });
};


exports.admin = function(req, res){
    res.render('glasses-admin', { title: 'Manage glasses'});
};

exports.upload = function(req, res){
    console.log("glasses.upload()");
    var zip = new AdmZip(req.files.glasses.path);
    var zipEntries = zip.getEntries();

    //Get the file entry of the config file
    var configFileEntry = zipEntries.filter(function(entry){
        console.log(entry.entryName);
        return entry.entryName == "glasses/glasses.json";
    })[0];


    console.log(configFileEntry);
    //Parse the text of the config file into a JSON object;
    var configFile = JSON.parse(zip.readAsText(configFileEntry.entryName));

    for(var i = 0; i < zipEntries.length; i++){
        var entry = zipEntries[i];
        if(entry.entryName.indexOf(".png") != -1){
            console.log("moving: " + entry.entryName + " to "  + texturePath);
            zip.extractEntryTo(entry.entryName, texturePath, false, true);
        }
    }

    Glasses.remove().exec(function(){
        console.log("Glasses are removed!");
        //Lets start parsing the frames.
        getFrames(function(frames){
            for(var i = 0; i < frames.length; i++){
                var frame = frames[i];
                var frameFileSelector = frame.fileselector;
                for(var c = 0; c < frame.fronts.length; c++){
                    var front = frame.fronts[c];
                    front.glasses = [];
                    var fileSelector = frameFileSelector + "_" + front.fileselector;
                    console.log("fileSelector: " + fileSelector);
                    zip.extractEntryTo( "glasses/" + fileSelector + ".js", objectPath, false, true);

                    for(var s = 0; s < configFile.textures.length; s++){
                        var configObject = configFile.textures[s];

                        extend(configObject, baseObject);
                        configObject.src = objectFolder + "/" + fileSelector + ".js";
                        var newGlasses = new Glasses(configObject);
                        newGlasses.save((
                            function(glasses, front){
                                return function(err){
                                    front.glasses.push(glasses.id);

                                    if(front.glasses.length == configFile.textures.length){
                                        Front.update({ "_id": front._id }, { glasses: front.glasses }, function (err, numberAffected, raw) {
                                            if (err) return handleError(err);
                                            console.log('The number of updated documents was %d', numberAffected);
                                            console.log('The raw response from Mongo was ', raw);
                                            res.send({"ok": "OK"});
                                        });
                                    }
                                }
                            }
                        )(newGlasses, front));
                    }
                }
            }
        });
    });
};