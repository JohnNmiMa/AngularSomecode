viewsModule.controller('SignedoutCtrl', ['$scope', '$sce', 'snippetService',
                                 function($scope,   $sce,   snippetService) {
    $scope.SignedOutCtrlScope = "SignedOutCtrlScope";

    $scope.snippets = {};
    $scope.$on('updateSnippets', function(event) {
        $scope.snippets = snippetService.snippets;
    })
}]);

