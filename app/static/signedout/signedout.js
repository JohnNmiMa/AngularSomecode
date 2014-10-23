viewsModule.controller('SignedoutCtrl', ['$scope', '$sce', 'snippetService',
                                 function($scope,   $sce,   snippetService) {
    $scope.SignedOutCtrlScope = "SignedOutCtrlScope";
    $scope.snippets = {};
    $scope.$watch(function() {
        $scope.snippets = snippetService.snippets;
    })
}]);

