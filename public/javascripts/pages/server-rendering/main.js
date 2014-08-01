require(['./renderer'], function(Renderer){

    //Get the session ID from the URL
    var urlSplits = document.URL.split("/");
    var id = urlSplits[urlSplits.length - 1];

    var renderTarget = $('.renderTarget');
    renderTarget.width(1280);
    renderTarget.height(1024);

    var renderer = new Renderer({
        container: renderTarget
    });


    var socket = io.connect('http://localhost');
    socket.emit('ready', {'sessionID': id});
    socket.on('command', function(data){
        if(data.sessionID == id){
            renderer.handleCommand(data).then(function(data){
                socket.emit('commandDone', data);
            })
        }
    });
});