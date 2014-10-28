var layoutApp = angular.module('LayoutApp', ['someCodeViews', 'ngRoute'])

.run(['$rootScope', function($rootScope) {
    $rootScope.$on('updateSearchString', function(event, searchStr) {
        $rootScope.$broadcast('topicOrSearchString', ('\"' + searchStr + '\" search'));
    });
    $rootScope.$on('snippetLayoutChange', function(event, layout) {
        $rootScope.$broadcast('snippetLayout', layout);
    });
    $rootScope.$on('updateSnippetsEvent', function(event, snippets) {
        $rootScope.$broadcast('updateSnippets', snippets);
    });
}])

.config(['$locationProvider', '$routeProvider', function ($locationProvider, $routeProvider) {
    $locationProvider.hashPrefix('!');
    $routeProvider.otherwise({
        redirectTo: '/'
    });
}])

.controller('LayoutCtrl', ['$scope', function($scope) {
    $scope.LayoutCtrlScope = "LayoutCtrlScope";
}]);