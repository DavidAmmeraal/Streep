exports.renderer = function(req, res){
    res.render('renderer', { title: 'Express' });
}

exports.command = function(socket){
    return function(req, res){
        console.log(socket);
        res.send({'hoi': 'hoi'});
    }
}