viewsModule.config(['$routeProvider',
            function($routeProvider) {
    $routeProvider.when("/", {
        templateUrl : "./home/home.html",
        controller : 'HomeCtrl'
    })
    .when("/view1", {
        redirectTo : function() {
            return "/view1/default";
        }
    })
    .when("/view1/:param", {
        templateUrl : "./view1/view1.html",
        controller : 'View1Ctrl',
        resolve : {
            ctrlParam1 : ['appLibHello', function(appLibHello) {
                return appLibHello();
            }],
            ctrlParam2 : ['$route',
               function($route) {
                return $route.current.params.param;
            }]
        }
    });
}]);

