viewsModule.config(['$routeProvider', function($routeProvider) {

    $routeProvider.when("/", {
        templateUrl : "./static/signedout/signedout.html",
        controller : 'SignedoutCtrl'
    })
    .when("/signin/:oauthprovider", {
        templateUrl : "./static/signedin/signedin.html",
        controller : 'SignedinCtrl',
        resolve : {
            userName : ['snippetSignin', '$location', '$route', '$q', function(snippetSignin, $location, $route, $q) {
                var oauthProvider = $route.current.params.oauthprovider,
                    defer = $q.defer();

                snippetSignin(oauthProvider).then(function(result) {
                    //return result;
                    defer.resolve(result);
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
}]);

