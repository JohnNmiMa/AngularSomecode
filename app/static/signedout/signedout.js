viewsModule.controller('SignedoutCtrl', ['$scope', '$sce', 'snippetLibraryService',
                                 function($scope,   $sce,   snippetLibraryService) {
    $scope.SignedOutCtrlScope = "SignedOutCtrlScope";
    snippetLibraryService.setSnippets([], $scope);
}]);

