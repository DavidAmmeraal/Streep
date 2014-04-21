define([], function(){
    var Session = function(id){
        console.log("new Session(" + id + ")");
        this.id = id;
    }

    Session.prototype.id = null;

    return Session;
});