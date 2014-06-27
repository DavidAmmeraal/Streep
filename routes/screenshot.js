exports.save = function(req, res){
    var dataStr = req.body.data;
    var fs = require('fs');
    var regex = /^data:.+\/(.+);base64,(.*)$/;

    var matches = dataStr.match(regex);
    var ext = matches[1];
    var data = matches[2];
    var buffer = new Buffer(data, 'base64');
    var uuid = require('node-uuid');
    var fileName = 'images/screenshots/' + uuid.v1() + '.' + ext;
    var localName = '/home/streep/apps/Streep/public/' + fileName;
    fs.writeFileSync(localName, buffer);
    var fullUrl = "http://renderer.streep.nl" + '/' + fileName;
    res.send(JSON.stringify({screenshot: fullUrl}));
};