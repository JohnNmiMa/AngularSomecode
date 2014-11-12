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
                    return topicService.isTopicPanelVisible;
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
            $scope.$on('snippetBarModelChanged', function() {
                $scope.layout = snippetBar.snippetLayout;
            });
            this.setLayout = function(snippetLayout) {
                $scope.layout = snippetLayout;
            };

            $scope.isSnippetOwnedByCurrentUser = function(creatorId) {
                return oauthLibrary.userid() == creatorId;
            };

            $scope.getTrustedHtml = function(htmlStr) {
                return $sce.trustAsHtml(htmlStr);
            };

            $scope.snippetPopupVisible = false;
            $scope.showSnippetPopup = function() {
                if (!$scope.isEditing) {
                    $scope.snippetPopupVisible = true;
                }
            };
            $scope.hideSnippetPopup = function() {
                $scope.snippetPopupVisible = false;
            };

            this.snippetEdit = function(snippet) {
                $scope.isEditing = true;
                $scope.snippetPopupVisible = false;
            };
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

            scope.layout = snippetBar.snippetLayout;
            scope.$on('snippetBarModelChanged', function() {
                scope.layout = snippetBar.snippetLayout;
            });

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
}])


.directive('snippetPanelSizer', ['oauthLibrary', 'topicService',
                         function(oauth,          topicService) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                // The topic panel doesn't exist when logged out
                var hasTopicPanel = oauth.isAuthenticated();

                $(window).on('resize', function() {
                    scope.$apply(function () {
                        updateSnippetBlockComponentSizes();
                    })
                });

                function  updateSnippetBlockComponentSizes() {
                    var snippetBlockWidth = parseFloat($('#snippetBlock').width()),
                        topicPanelWidth = parseFloat(topicService.topicPanelWidth),
                        snippetPanelWidth = snippetBlockWidth - topicPanelWidth;

                    /*
                     console.log("snippetBlockWidth = " + snippetBlockWidth +
                     ": topicPanelWidth = " + topicPanelWidth +
                     ": snippetPanelWidth = " + snippetPanelWidth);
                     */

                    setWidth(snippetPanelWidth + 'px');
                }

                function setWidth(snippetPanelWidth) {
                    if(hasTopicPanel) {
                        // Adjust the snippetPanel's width
                        if (topicService.isTopicPanelVisible) {
                            scope.snippetPanelStyle = {'width': snippetPanelWidth};
                        } else {
                            scope.snippetPanelStyle = {'width': "100%"};
                        }
                        topicService.snippetPanelWidth = snippetPanelWidth;
                    } else {
                        // There is no topicPanel, so make the snippetPanel 100% wide
                        scope.snippetPanelStyle = {'width': "100%"};
                    }

                }
                updateSnippetBlockComponentSizes();

                function resizeOnScrollbarHack() {
                    // Demo: http://jsfiddle.net/pFaSx/

                    // Create an invisible iframe
                    var iframe = document.createElement('iframe');
                    iframe.id = "hacky-scrollbar-resize-listener";
                    iframe.style.cssText = 'height: 0; background-color: transparent; margin: 0; padding: 0; overflow: hidden; border-width: 0; position: absolute; width: 100%;';

                    // Register our event when the iframe loads
                    iframe.onload = function() {
                        // The trick here is that because this iframe has 100% width
                        // it should fire a window resize event when anything causes it to
                        // resize (even scrollbars on the outer document)
                        iframe.contentWindow.addEventListener('resize', function() {
                            try {
                                console.log("In iframe resizer!");
                                //var evt = document.createEvent('UIEvents');
                                //evt.initUIEvent('resize', true, false, window, 0);
                                //window.dispatchEvent(evt);
                                updateSnippetBlockComponentSizes();
                            } catch(e) {}
                        });
                    };

                    // Stick the iframe somewhere out of the way
                    document.body.appendChild(iframe);
                }
                //resizeOnScrollbarHack();
            }
        }
    }]);
