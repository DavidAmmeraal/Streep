define([], function () {
    var KeyboardListener = function (options) {
        var self = this;
        this.viewer = null;
        $.extend(this, options);

        var overFlowTimeout = null;
        var direction = null;

        var initialize = function () {
            listenToKeys();
        };

        var goLeft = function (duration) {
            if(!overFlowTimeout || direction == 'right' || !direction){
                if(overFlowTimeout){
                    clearTimeout(overFlowTimeout);
                }
                overFlowTimeout = setTimeout(function(){
                    clearTimeout(overFlowTimeout);
                    overFlowTimeout = null;
                }, duration);
                direction = 'left';
                self.viewer.rotate(-20, duration);
            }
        };

        var goRight = function (duration) {
            if(!overFlowTimeout || !direction || direction == 'left' || !direction){
                if(overFlowTimeout){
                    clearTimeout(overFlowTimeout);
                }
                overFlowTimeout = setTimeout(function(){
                    clearTimeout(overFlowTimeout);
                    overFlowTimeout = null;
                }, duration);
                direction = 'right';
                self.viewer.rotate(20, duration);
            }
        }


        function listenToKeys() {
            console.log("listen to keys!");
            $(document).on('keydown', function (event) {
                switch (event.keyCode) {
                    case 37:
                        event.preventDefault();
                        goLeft(200);
                        break;
                    case 38:
                        event.preventDefault();
                        break;
                    case 39:
                        event.preventDefault();
                        goRight(200);
                        break;
                    case 40:
                        event.preventDefault();
                        break;
                }
            });
        }

        initialize();
    };
    return KeyboardListener;
});