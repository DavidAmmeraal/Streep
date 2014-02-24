requirejs.config({
    //By default load any module IDs from js/lib
    baseUrl: 'javascripts',
    //except, if the module ID starts with "app",
    //load it from the js/app directory. paths
    //config is relative to the baseUrl, and
    //never includes a ".js" extension since
    //the paths config could be for a directory.
    paths: {
        text: 'vendor/text'
    }
});

require(
    [
        'views/frame-chooser'
    ],
    function(
        FrameChooser
    ){
        var frameChooser = new FrameChooser({
            el: document.getElementById('frames')
        });
    }
);