viewsModule.controller('UserCtrl', ['$scope', 'topics', 'snippetService',
                            function($scope,   topics,   snippetService) {
    console.log("In the User controller");
    $scope.snippets = {};
//    $scope.$watch(function() {
//        console.log("Go get a list of snippets from the snippet service!!!");
//        $scope.snippets = snippetService.snippets;
//    })
    $scope.$on('updateSnippets', function(event, snippets) {
        $scope.snippets = snippets;
    })
}]);
