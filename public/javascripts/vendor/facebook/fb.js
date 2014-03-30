define(['facebook'], function(){
    FB.init({
        appId      : '252866621564945'
    });
    FB.getLoginStatus(function(response) {
        console.log(response);
    });
});