require(['./renderer'], function(Renderer){
    var renderTarget = $('.renderTarget');
    renderTarget.width(1280);
    renderTarget.height(1024);
    var renderer = new Renderer({
        container: renderTarget
    });
    var socket = io.connect('http://localhost');
    socket.on('command', function(data){
        renderer.handleCommand(data).then(function(data){
            socket.emit('commandDone', data);
        })
    })
});