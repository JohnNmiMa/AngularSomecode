viewsModule.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when("/", {
        templateUrl : "./static/signedout/signedout.html",
        controller : 'SignedoutCtrl'
    })
    .when("/signin/:oauthprovider", {
        templateUrl : "./static/signedin/signedin.html",
        controller : 'SignedinCtrl',
        resolve : {
            oauthProvider : ['$route', function($route) {
                return $route.current.params.oauthprovider;
            }]
        }
    })
    .when("/logout", {
        templateUrl : "./static/signedout/signedout.html",
        controller : 'SignedoutCtrl',
        resolve: {
            data : ['snippetLogout', '$location', function(snippetLogout, $location) {
                snippetLogout();
                $location.path('/');
                return;
            }]
        }
    });
}]);

