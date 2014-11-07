viewsModule.controller('UserCtrl', ['$scope', 'topics', 'snippetService',
                            function($scope,   topics,   snippetService) {
    $scope.UserCtrlScope = "UserCtrlScope";

    $scope.snippets = {};
    snippetService.setTopics(topics, $scope);
    $scope.$on('updateSnippets', function(event) {
        $scope.snippets = snippetService.snippets;
    })
}]);
