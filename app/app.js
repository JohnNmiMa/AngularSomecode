angular.module('appExample', ['appViews', 'ngRoute'])

//.run(function($rootScope, $location, $route, $timeout) {
.run(['$rootScope', '$location', '$route', '$timeout', function($rootScope, $location, $route, $timeout) {
    $rootScope.$on('$routeChangeStart', function() {
        // Don't do loading animation if going home
        if ($location.$$path != "" && $location.$$path != "/") {
            $rootScope.isLoading = true;
        }
    });
    $rootScope.$on('$routeChangeSuccess', function() {
        $timeout(function() {
            $rootScope.isLoading = false;
        }, 500);
    });
}])

.config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
    $locationProvider.hashPrefix('!');
    $routeProvider.otherwise({
        redirectTo : '/'
    });
}])

.controller('CncCtrl', ['$scope',
                function($scope) {
}]);