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
    var localName = '/home/streep/app/Streep/public/' + fileName;
    fs.writeFileSync(localName, buffer);
    var fullUrl = req.protocol + '://' + req.get('host') + '/' + fileName;
    console.log(fullUrl);
    res.send(JSON.stringify({screenshot: fullUrl}));
};