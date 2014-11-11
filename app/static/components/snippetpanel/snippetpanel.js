viewsModule.service('snippetService', [function() {
    var snippetPanelScope = undefined;

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

        // Public function
        register:register
    }
}])

.directive('snippetPanel', ['snippetBarService',
                    function(snippetBar) {
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
            scope.$on('snippetBarModelChanged', function() {
                scope.isAddingSnippet = snippetBar.isAddingSnippet;
            });
        }
    }
}])

.directive('snippet', ['$sce', 'snippetBarService',
               function($sce,   snippetBar) {
    return {
        restrict: 'E',
        scope: true,
        templateUrl: './static/components/snippetpanel/snippet.html',
        controller: function($scope, $element, $attrs, oauthLibrary) {
            $scope.layout = snippetBar.snippetLayout;
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

.directive('snippetForm', ['snippetService', 'snippetBarService',
                   function(snippetService,   snippetBar) {
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
                    return snippetBar.snippetLayout;
                },
                function(newVar, oldVar) {
                    scope.layout = newVar;
                }
            )

            scope.snippetCancel = function(snippet) {
                if (snippet === undefined) {
                    // We must be cancelling a snippet add
                    snippetBar.isAddingSnippet = !snippetBar.isAddingSnippet;
                } else {
                    // We must be cancelling a snippet edit
                    snippetCtrl.snippetCancelEditing(snippet);
                }
            }
        }
    }
}]);

