viewsModule.config(['$routeProvider', '$authProvider',
            function($routeProvider,   $authProvider) {

    $routeProvider.when("/", {
        templateUrl : "./static/signedout/signedout.html",
        controller : 'SignedoutCtrl'
    })
    .when("/signin/:oauthprovider", {
        templateUrl : "./static/signedin/signedin.html",
        controller : 'SignedinCtrl',
        resolve : {
            userName : ['$auth', '$location', '$route', '$q', function($auth, $location, $route, $q) {
                var oauthProvider = $route.current.params.oauthprovider,
                    defer = $q.defer();

                $auth.authenticate(oauthProvider).then(function(result) {
                    //return result;
                    defer.resolve(result.data.username);
                }, function(error) {
                    console.log(error.url + " failed with status error " + error.statusCode);
                    $location.path('/');
                    defer.reject(error);
                    return;
                });

                return defer.promise;
            }]
        }
    })
    .when("/logout", {
//        templateUrl : "./static/signedout/signedout.html",
//        controller : 'SignedoutCtrl',
        resolve: {
            data : ['snippetLogout', '$location', function(snippetLogout, $location) {
                snippetLogout().then(function() {
                    $location.path('/');
                    return;
                }, function(error) {
                    console.log(error.url + " failed with status error " + error.statusCode);
                    return;
                });
            }]
        }
    });

    $authProvider.facebook({
        url: '/signin/facebook_authorized',
        clientId: '493837160742216'
    });

    $authProvider.google({
        url: '/signin/google_authorized',
        clientId: '548449261611.apps.googleusercontent.com'
    });

    $authProvider.github({
        clientId: '0ba2600b1dbdb756688b'
    });

    $authProvider.linkedin({
        clientId: '77cw786yignpzj'
    });

    $authProvider.twitter({
        url: '/signin/twitter_authorized',
    });
}]);

