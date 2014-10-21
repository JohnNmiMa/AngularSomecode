viewsModule.config(['$httpProvider', '$routeProvider',
            function($httpProvider,   $routeProvider) {

    $httpProvider.interceptors.push('authenticationInterceptor');

    $routeProvider.when("/", {
        templateUrl : "./static/signedout/signedout.html",
        controller : 'SignedoutCtrl'
    })
    .when("/user", {
        templateUrl : "./static/user/user.html",
        controller : 'UserCtrl',
        resolve : {
            topics: ['snippetUser', function (snippetUser) {
                return snippetUser();
            }]
        }
    })
    .when("/signin/:oauthprovider", {
        templateUrl : "./static/signedin/signin.html",
        controller : 'SigninCtrl'
    });
}]);

