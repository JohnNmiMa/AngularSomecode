viewsModule.service('snippetService', [function() {

}])

.directive('snippetPanel', [function() {
    return {
        restrict: 'E',
        replace: true,
        scope: true,
        templateUrl: './static/components/snippetpanel/snippetpanel.html',
        controller: function($scope, $element, $attrs, snippetService, snippetLibraryService) {
            $scope.SnippetPanelDirectiveCtrlScope = "SnippetPanelDirectiveCtrlScope";

            // The snippets model
            $scope.snippets = {};
            $scope.$on('updateSnippets', function(event) {
                $scope.snippets = snippetLibraryService.snippets;
            })
        }
    }
}])

.directive('snippet', ['$sce', 'snippetBarService', 'oauthLibrary',
               function($sce,   snippetBarService,   oauth) {
    return {
        restrict: 'E',
        scope: true,
        templateUrl: './static/components/snippetpanel/snippet.html',
        controller: function($scope, $element, $attrs) {
            $scope.layout = snippetBarService.snippetLayout;

            $scope.$on('snippetLayout', function(event, snippetLayout) {
                $scope.layout = snippetLayout;
            });
            this.setLayout = function(snippetLayout) {
                $scope.layout = snippetLayout;
            }
            this.snippetEdit = function(snippet) {
                $scope.isEditing = true;
                console.log("Edit snippet " + snippet.id);
            }
        },
        link: function(scope, element, attrs, snippetCtrl) {
            scope.snippetPopupVisible = false;
            scope.isPublicSnippet = function(snippetAccess) {
                return snippetAccess;
            };
            scope.isSnippetOwnedByCurrentUser = function(creatorId) {
                return oauth.isAuthenticated() ? true : false;
            };
            scope.getTrustedHtml = function(htmlStr) {
                return $sce.trustAsHtml(htmlStr);
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

.directive('snippetPopup', [function() {
    return {
        require: '?^snippet',
        restrict: 'E',
        scope: true,
        templateUrl: './static/components/snippetpanel/snippetPopup.html',
        controller: function($scope, $element, $attrs) {
        },
        link: function(scope, element, attrs, snippetCtrl) {
            scope.setLayout = function(layout) {
                snippetCtrl.setLayout(layout);
            };

            scope.snippetEdit = function(snippet) {
                snippetCtrl.snippetEdit(snippet)
            }
        }
    }
}])

.directive('snippetEditForm', [
                       function() {
    return {
        restrict: 'E',
        replace: true,
        scope: true,   // there's one of these forms for each topic
        templateUrl: './static/components/snippetpanel/snippetEditForm.html'
    }
}]);

