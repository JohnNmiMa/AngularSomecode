viewsModule.controller('SignedoutCtrl', ['$scope', '$sce', 'snippetLibraryService',
                                 function($scope,   $sce,   snippetLibraryService) {
    $scope.SignedOutCtrlScope = "SignedOutCtrlScope";
    snippetLibraryService.setSnippets([], $scope);
}])

.directive('publicCounter', ['snippetLibraryService',
                     function(snippetService) {
     return {
         restrict: 'A',
         link: function(scope, element, attrs) {
             snippetService.snippetCounters = {personal_count:0, public_count:attrs.publicCounter};
         }
     }
}]);

