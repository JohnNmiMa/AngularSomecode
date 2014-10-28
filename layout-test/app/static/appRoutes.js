viewsModule.config(['$httpProvider', '$routeProvider',
            function($httpProvider,   $routeProvider) {

    $routeProvider.when("/", {
        templateUrl : "./static/signedout/signedout.html",
        controller : 'SignedoutCtrl'
    });
}]);

