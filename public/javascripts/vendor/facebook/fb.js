define(['facebook'], function(){
    FB.init({
        appId: 252866621564945,
        status     : true,
        xfbml      : true
    });
    FB.getLoginStatus(function(response) {
        console.log(response);
    });
});