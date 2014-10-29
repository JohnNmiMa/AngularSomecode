var someCodeApp = angular.module('SomeCodeApp', ['someCodeViews', 'ngRoute'])

.run(['$rootScope', '$location', '$route', '$timeout', function ($rootScope, $location, $route, $timeout) {
    $rootScope.$on('$routeChangeStart', function () {
        // Don't do loading animation if going home
        if ($location.$$path != "" && $location.$$path != "/") {
            $rootScope.isLoading=true;
        }
    });
    $rootScope.$on('$routeChangeSuccess', function () {
        $timeout(function () {
            $rootScope.isLoading=false;
        }, 500);
    });
    $rootScope.$on('updateTopicsEvent', function(event) {
        $rootScope.$broadcast('updateTopics');
    });
    $rootScope.$on('updateSearchString', function(event, searchStr) {
        $rootScope.$broadcast('topicOrSearchString', ('\"' + searchStr + '\" search'));
    });
    $rootScope.$on('updateTopicString', function(event, topicStr) {
        $rootScope.$broadcast('topicOrSearchString', ('\"' + topicStr + '\" topic'));
    });
    $rootScope.$on('snippetLayoutChange', function(event, layout) {
        $rootScope.$broadcast('snippetLayout', layout);
    });
    $rootScope.$on('updateSnippetsEvent', function(event) {
        $rootScope.$broadcast('updateSnippets');
    });
}])

.config(['$locationProvider', '$routeProvider', function ($locationProvider, $routeProvider) {
    $locationProvider.hashPrefix('!');
    $routeProvider.otherwise({
        redirectTo: '/'
    });
}])

.controller('SomeCodeCtrl', ['$scope', '$location', 'oauthLibrary', 'snippetLogout',
                     function($scope,   $location,   oauth,          snippetLogout) {
    $scope.SomeCodeCtrlScope = "SomeCodeCtrlScope";
    $scope.$watch(function() {
        return $scope.isAuthenticated();
    },
    function(newVal, oldVal) {
        if (newVal) {
            $scope.username = oauth.username();
            $scope.hideSignin();
        }
    });

    $scope.showSignin = function() {
        $('.signinModal').modal('show');
    };

    $scope.hideSignin = function() {
        $('.signinModal').modal('hide');
    };

    $scope.authenticate = function(provider) {
        oauth.authenticate(provider).then(function(response) {
            $location.path('/user');
        });
    };

    $scope.isAuthenticated = function(provider) {
        return oauth.isAuthenticated();
    };

    $scope.logout = function() {
        snippetLogout().then(function(response) {
            oauth.logout();
        }, function(error) {
            console.log(error.url + " failed with status error " + error.statusCode);
        })
            .finally(function() {
                $location.path('/');
            });
    };
}]);