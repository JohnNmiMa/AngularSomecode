viewsModule.controller('SnippetsCtrl', ['$scope',
                                function($scope) {
    $scope.SnippetsCtrlScope = "SnippetsCtrlScope";
}])

.directive('snippet', function() {
    return {
        restrict: 'E',
        scope: true,
        templateUrl: './static/components/snippets/snippets.html',
        controller: function($scope, $sce, $element, $attrs, oauthLibrary, snippetBarService) {
            $scope.SnippetDirectiveScope = "SnippetDirectiveScope";
            $scope.getTrustedHtml = function(htmlStr) {
                var layout = snippetBarService.snippetLayout;
                if (layout === 'titlesonly') {
                    return "";
                } else {
                    return $sce.trustAsHtml(htmlStr);
                }
            };
            $scope.isPublicSnippet = function(snippetAccess) {
                return snippetAccess;
            };
            $scope.isSnippetOwnedByCurrentUser = function(creatorId) {
                return oauthLibrary.isAuthenticated() ? true : false;
            }
            $scope.layout = function() {
                return snippetBarService.snippetLayout;
            }
        },
        link: function($scope, element, attrs) {
            $scope.owned = false;
        }
    }
});
