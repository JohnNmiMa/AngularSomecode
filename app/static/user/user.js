viewsModule.controller('UserCtrl', ['$scope', 'topics', 'snippetLibraryService',
                            function($scope,   topics,   snippetLibraryService) {
    $scope.UserCtrlScope = "UserCtrlScope";

    snippetLibraryService.setTopics(topics, $scope);
}]);
