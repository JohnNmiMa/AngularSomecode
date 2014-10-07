var someCodeApp = angular.module('SomeCodeApp', ['someCodeViews', 'ngRoute'])

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

.factory('userSession', function() {
    return {
        loggedIn: false
    }
})

.controller('SomeCodeCtrl', ['$scope', 'userSession', function($scope, userSession) {
    $scope.SomeCodeCtrlModel = true;
}]);