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
            $scope.snippets = snippetLibraryService.snippets;
            $scope.$on('updateSnippets', function(event) {
                $scope.snippets = snippetLibraryService.snippets;
            });
        },
        link: function(scope, element, attrs, snippetCtrl) {
            scope.$on('snippetBarModelChangedEvent', function(event) {
                scope.$broadcast('snippetBarModelChanged');
            });
        }
    }
}])

.directive('snippet', ['$sce', 'snippetBarService', 'oauthLibrary', 'createSnippet', 'editSnippet', 'deleteSnippet', 'snippetLibraryService', 'topicService',
               function($sce,   snippetBar,          oauth,          createSnippet,   editSnippet,   deleteSnippet,   snippetLibraryService,   topicService) {
    return {
        restrict: 'E',
        scope: true,
        templateUrl: './static/components/snippetpanel/snippet.html',
        controller: function($scope, $element, $attrs) {
            var snippetUsage = $attrs.snippetUsage;

            $scope.SnippetDirectiveController = "SnippetDirectiveController";
            $scope.isEditing = false;
            $scope.isAdding = false;
            $scope.lineWrapping = false;
            $scope.lineNumbers = true;
            if (snippetUsage === 'forAdding') {
                $scope.lineNumbers = false;
            }
            $scope.layout = snippetBar.snippetLayout;

            $scope.languages = CodeMirror.modeInfo;
            if (snippetUsage === 'forAdding') {
                $scope.language = {name:'JavaScript', mode:'javascript'};
            } else {
                if ($scope.snip.language === 'bogus') {
                    $scope.snip.language = 'JavaScript';
                }
                $scope.language = $.grep($scope.languages, function(e){ return e.name === $scope.snip.language; })[0];
            }
        },
        link: function(scope, element, attrs, snippetCtrl) {
            var snippetUsage = attrs.snippetUsage,
                cmElement = element.find('.CodeMirror'),
                cmScrollElement = element.find('.CodeMirror-scroll'),
                tmpSnippetModel = {},
                addSnippetModel = {title:"", code:"", description:"", language:"JavaScript", creator_id:oauth.userid()},
                scrolling = true,
                textDecorationNoneStyle = {'text-decoration':'none'},
                textDecorationLineThroughStyle = {'text-decoration':'line-through'};

            scope.refreshIt = true;
            scope.scrollStrikeStyle = textDecorationNoneStyle;
            scope.wrapStrikeStyle = textDecorationLineThroughStyle;
            scope.lineNumberStrikeStyle = textDecorationNoneStyle;

            if (snippetUsage === 'forAdding') {
                scope.snip = {};
                angular.copy(addSnippetModel, scope.snip);
            }

            scope.isSnippetOwnedByCurrentUser = function(creatorId) {
                return oauth.userid() == creatorId;
            };

            scope.getTrustedHtml = function(htmlStr) {
                return $sce.trustAsHtml(htmlStr);
            };

            scope.snippetPopupVisible = false;
            scope.showSnippetPopup = function() {
                scope.snippetPopupVisible = true;
            };
            scope.hideSnippetPopup = function() {
                scope.snippetPopupVisible = false;
            };

            scope.setLayout = function(layout) {
                scope.layout = layout;
            };
            scope.$on('snippetBarModelChanged', function() {
                scope.layout = snippetBar.snippetLayout;
                if (snippetUsage === 'forAdding') {
                    scope.isAdding = snippetBar.isAddingSnippet;
                    if (scope.isAdding) {
                        scope.refreshIt = !scope.refreshIt;
                        scope.codeEditorOptions.readOnly = false;
                    } else {
                        scope.codeEditorOptions.readOnly = 'nocursor';
                    }
                }
            });

            scope.snippetEdit = function(snippet) {
                angular.copy(snippet, tmpSnippetModel);
                scope.isEditing = true;
                scope.snippetPopupVisible = false;
                scope.codeEditorOptions.readOnly = false;
                cmElement.addClass('isEditing');
            };
            scope.snippetCancel = function(snippet) {
                if (scope.isAdding) {
                    // We must be cancelling a snippet add
                    angular.copy(addSnippetModel, scope.snip);
                    snippetBar.isAddingSnippet = false;
                } else  if (scope.isEditing) {
                    // We must be cancelling a snippet edit
                    scope.snip = tmpSnippetModel;
                    tmpSnippetModel = {};
                    scope.isEditing = false;
                    scope.codeEditorOptions.readOnly = 'nocursor';
                    cmElement.removeClass('isEditing');
                }
            };
            scope.snippetSave = function(snippet) {
                var topicName = "General",
                    selectedTopic = topicService.selectedTopic;

                snippet.language = scope.language.name;
                if (scope.isAdding) {
                    if (selectedTopic !== undefined) {
                        topicName = selectedTopic.name;
                    }
                    createSnippet(snippet, topicName).then(function(results) {
                        snippetLibraryService.addSnippet(results, topicName, scope);
                        angular.copy(addSnippetModel, scope.snip);
                        snippetBar.isAddingSnippet = false;
                    });
                } else  if (scope.isEditing) {
                    editSnippet(snippet).then(function(result) {
                        scope.isEditing = false;
                    });
                }
            };
            scope.snippetDelete = function(snippet) {
                var topicName = topicService.selectedTopic ? topicService.selectedTopic.name : undefined;
                deleteSnippet(snippet).then(function(results) {
                    snippetLibraryService.deleteSnippet(results.id, topicName, scope);
                    scope.snippetPopupVisible = false;
                    scope.isEditing = false;
                });
            };

            scope.toggleLineWrap = function() {
                scope.lineWrapping = !scope.lineWrapping;
                scope.wrapStrikeStyle =
                    scope.lineWrapping ? textDecorationNoneStyle : textDecorationLineThroughStyle;
                if (scope.lineWrapping) {
                    scope.codeEditorOptions.lineWrapping = true;
                } else {
                    scope.codeEditorOptions.lineWrapping = false;
                }
            };

            scope.toggleLineNumbers = function() {
                scope.lineNumbers = !scope.lineNumbers;
                scope.codeEditorOptions.lineNumbers = scope.lineNumbers;
                scope.lineNumberStrikeStyle =
                    scope.lineNumbers ? textDecorationNoneStyle : textDecorationLineThroughStyle;
            };

            scope.toggleScroll = function() {
                scrolling = !scrolling;
                scope.scrollStrikeStyle =
                    scrolling ? textDecorationNoneStyle : textDecorationLineThroughStyle;
                if (scrolling) {
                    // Set CodeMirror scroll element to scroll in window of max-height = 400px
                    cmScrollElement.css({
                        'overflow':'auto',
                        'max-height':'400px'
                    })
                } else {
                    // Set CodeMirror scroll element to expand to code size
                    cmScrollElement.css({
                        'overflow-x':'auto',
                        'overflow-y':'hidden',
                        'height':'auto',
                        'max-height':'none'
                    })
                }
                scope.refreshIt = !scope.refreshIt;
            };
        }
    }
}])

.directive('snippetPopup', [function() {
    return {
        require: '?^snippet',
        restrict: 'E',
        templateUrl: './static/components/snippetpanel/snippetPopup.html'
    }
}])

.directive('snippetFormBar', ['snippetService', 'snippetBarService',
                      function(snippetService,   snippetBar) {
    return {
        require: '?^snippet',
        restrict: 'E',
        replace: true,
        templateUrl: './static/components/snippetpanel/snippetFormBar.html'
    }
}])

.directive('snippetForm', ['snippetService', 'snippetBarService',
                   function(snippetService,   snippetBar) {
    return {
        require: ['?^snippetPanel', '?^snippet'],
        restrict: 'E',
        replace: true,
        templateUrl: './static/components/snippetpanel/snippetForm.html',
        controller: function($scope, $element, $attrs) {
            var codeMirrorEditor = {},
                codeMirrorDocument = {};

            // The codemirror editor options must be done in a controller
            // (won't work in the link function)
            $scope.codeEditorOptions = {
                lineWrapping : $scope.lineWrapping,
                indentUnit: 4,
                lineNumbers: $scope.lineNumbers,
                readOnly: 'nocursor',
                mode: $scope.language.mode
            };

            $scope.$watch('language', function(language) {
                if (language === undefined) return;
                $scope.codeEditorOptions.mode = language.mode;
                // This uses the CodeMirror loadmode.js module to
                // lazy load the proper language mode module. This is way cool,
                // as you don't need to add all of the codemirror/mode/*/*.js mode files
                // in <script> tags. There ~85 of them.
                CodeMirror.autoLoadMode(codeMirrorEditor, language.mode);
            });

            $scope.codeTextAreaLoaded = function(editor) {
                codeMirrorEditor = editor;
                codeMirrorDocument = editor.getDoc();

                // Set the CodeMirror lazy loader to load modules from here
                CodeMirror.modeURL = "./static/bower_components/codemirror/mode/%N/%N.js";
            };
        },
        link: function(scope, element, attrs, controllers) {
            var snippetPanelCtrl = controllers[0],
                snippetCtrl = controllers[1];
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
