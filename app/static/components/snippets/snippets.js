viewsModule.controller('SnippetsCtrl', ['$scope',
                                function($scope) {
    $scope.SnippetsCtrlScope = "SnippetsCtrlScope";
}])

.directive('snippet', ['$sce', 'snippetBarService', 'oauthLibrary',
               function($sce,   snippetBarService,   oauth) {
    return {
        restrict: 'E',
        scope: true,
        templateUrl: './static/components/snippets/snippets.html',
        link: function(scope, element, attrs) {
            console.log("In snippet directive link");
            scope.snippetPopupVisible = false;
            scope.isPublicSnippet = function(snippetAccess) {
                return snippetAccess;
            };
            scope.isSnippetOwnedByCurrentUser = function(creatorId) {
                return oauth.isAuthenticated() ? true : false;
            };
            scope.layout = function() {
                return snippetBarService.snippetLayout;
            };
            scope.getTrustedHtml = function(htmlStr) {
                var layout = snippetBarService.snippetLayout;
                if (layout === 'titlesonly') {
                    return "";
                } else {
                    return $sce.trustAsHtml(htmlStr);
                }
            };
            scope.showSnippetPopup = function() {
                scope.snippetPopupVisible = true;
            };
            scope.hideSnippetPopup = function() {
                scope.snippetPopupVisible = false;
            };
        }
    }
}])

.directive('snippetPopup', function() {
    return {
        restrict: 'E',
        templateUrl: './static/components/snippets/snippetPopup.html'
    }
});
