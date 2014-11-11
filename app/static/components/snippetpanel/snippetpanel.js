viewsModule.service('snippetService', [function() {
    var snippetPanelScope = undefined,
        isAddingSnippet = false;

    var changed = function() {
        if (snippetPanelScope != undefined) {
            snippetPanelScope.$broadcast('snippetPanelModelChanged');
        }
    };
    var register = function(scope) {
        snippetPanelScope = scope;
    };

    return {
        // getters/setters
        get isAddingSnippet()      { return isAddingSnippet; },
        set isAddingSnippet(bool)  { isAddingSnippet = bool; changed(); },

        // Public function
        register:register
    }
}])

.directive('snippetPanel', ['snippetService', function(snippetService) {
    return {
        restrict: 'E',
        replace: true,
        scope: true,
        templateUrl: './static/components/snippetpanel/snippetpanel.html',
        controller: function($scope, $element, $attrs, snippetLibraryService, topicService) {
            $scope.SnippetPanelDirectiveCtrlScope = "SnippetPanelDirectiveCtrlScope";
            $scope.$watch(
                function() {
                    var topicPanelExists = $('#topicPanel').length;
                    if (!topicPanelExists) return false;
                    return topicService.isVisible;
                },
                function(newVal, oldVal) {
                    $scope.isFullScreen = newVal;
                }
            );

            // The snippets model
            $scope.snippets = {};
            $scope.$on('updateSnippets', function(event) {
                $scope.snippets = snippetLibraryService.snippets;
            });
        },
        link: function(scope, element, attrs, snippetCtrl) {
            snippetService.register(scope);
            scope.$on('snippetPanelModelChanged', function() {
                modelChanged();
            });
            function modelChanged() {
                scope.isAddingSnippet = snippetService.isAddingSnippet;
            }
            modelChanged();
        }
    }
}])

.directive('snippet', ['$sce', 'snippetBarService',
               function($sce,   snippetBarService) {
    return {
        restrict: 'E',
        scope: true,
        templateUrl: './static/components/snippetpanel/snippet.html',
        controller: function($scope, $element, $attrs, oauthLibrary) {
            $scope.layout = snippetBarService.snippetLayout;
            $scope.snippetPopupVisible = false;

            $scope.$on('snippetLayout', function(event, snippetLayout) {
                $scope.layout = snippetLayout;
            });

            $scope.isSnippetOwnedByCurrentUser = function(creatorId) {
                return oauthLibrary.userid() == creatorId;
            };
            $scope.getTrustedHtml = function(htmlStr) {
                return $sce.trustAsHtml(htmlStr);
            };
            $scope.showSnippetPopup = function() {
                if (!$scope.isEditing) {
                    $scope.snippetPopupVisible = true;
                }
            };
            $scope.hideSnippetPopup = function() {
                $scope.snippetPopupVisible = false;
            };

            this.setLayout = function(snippetLayout) {
                $scope.layout = snippetLayout;
            }
            this.snippetEdit = function(snippet) {
                $scope.isEditing = true;
                $scope.snippetPopupVisible = false;
            }
            this.snippetCancelEditing = function(snippet) {
                $scope.isEditing = false;
            }
        },
        link: function(scope, element, attrs, snippetCtrl) {
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

.directive('snippetAdd', [function() {
    return {
        require: '?^snippet',
        restrict: 'E',
        replace: true,
        scope: true,
        templateUrl: './static/components/snippetpanel/snippetAddForm.html'
    }
}])

.directive('snippetForm', ['snippetService', 'snippetBarService', function(snippetService, snippetBarService) {
    return {
        require: ['?^snippetPanel', '?^snippet'],
        restrict: 'E',
        replace: true,
        scope: true,
        templateUrl: './static/components/snippetpanel/snippetForm.html',
        link: function(scope, element, attrs, controllers) {
            var snippetPanelCtrl = controllers[0];
            var snippetCtrl = controllers[1];

            scope.$watch(
                function() {
                    return snippetBarService.snippetLayout;
                },
                function(newVar, oldVar) {
                    scope.layout = newVar;
                }
            )

            scope.snippetCancel = function(snippet) {
                if (snippet === undefined) {
                    // We must be cancelling a snippet add
                    snippetService.isAddingSnippet = !snippetService.isAddingSnippet;
                } else {
                    // We must be cancelling a snippet edit
                    snippetCtrl.snippetCancelEditing(snippet);
                }
            }
        }
    }
}]);

