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
        controller: ['$scope', '$element', '$attrs', 'snippetLibraryService', 'topicService',
             function($scope,   $element,   $attrs,   snippetLibraryService,   topicService) {
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
        }],
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
        controller: ['$scope', '$element', '$attrs',
             function($scope,   $element,   $attrs) {
            var snippetUsage = $attrs.snippetUsage;

            $scope.SnippetDirectiveController = "SnippetDirectiveController";
            $scope.isEditing = false;
            $scope.isAdding = false;
            $scope.isPreviewing = false;
            $scope.lineWrapping = false;
            $scope.lineNumbers = true;
            if (snippetUsage === 'forAdding') {
                $scope.lineNumbers = false;
            }
            $scope.layout = snippetBar.snippetLayout;

            $scope.languages = CodeMirror.modeInfo;
            if (snippetUsage === 'forAdding') {
                $scope.language = null;
            } else {
                $scope.language = $.grep($scope.languages, function(e){ return e.name === $scope.snip.language; })[0];
            }
        }],
        link: function(scope, element, attrs, snippetCtrl) {
            var snippetUsage = attrs.snippetUsage,
                cmElement = element.find('.CodeMirror'),
                cmScrollElement = element.find('.CodeMirror-scroll'),
                snippetDeleteDialog = element.find('.snippetDeleteDialog'),
                tmpSnippetModel = {},
                addSnippetModel = {title:"", code:"", description:"", language:"NotChosen", access:false, creator_id:oauth.userid()},
                textDecorationNoneStyle = {'text-decoration':'none'},
                textDecorationLineThroughStyle = {'text-decoration':'line-through'};

            scope.isScrolling = true;
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
                    if (scope.language !== tmpSnippetModel.language) {
                        scope.language = $.grep(scope.languages, function(e){
                            return e.name === tmpSnippetModel.language;
                        })[0];
                    }
                    scope.snip = tmpSnippetModel;
                    tmpSnippetModel = {};
                    scope.isEditing = false;
                    scope.codeEditorOptions.readOnly = 'nocursor';
                    cmElement.removeClass('isEditing');
                }
                scope.isPreviewing = false;
            };
            scope.snippetSave = function(snippet) {
                var topicName = "General",
                    selectedTopic = topicService.selectedTopic;

                // At minimum a snippet title is required
                if (snippet.title === "") {
                    return;
                }

                if (scope.language === undefined || scope.language === null || scope.language.name === 'NotChosen') {
                    // If no language was chosen, just set the language to "NotChosen" in the backend DB
                    snippet.language = 'NotChosen';
                } else {
                    snippet.language = scope.language.name;
                }

                if (scope.isAdding) {
                    if (selectedTopic !== undefined) {
                        topicName = selectedTopic.name;
                    }
                    createSnippet(snippet, topicName).then(function(results) {
                        snippetLibraryService.addSnippet(results, topicName, scope);
                        angular.copy(addSnippetModel, scope.snip);
                        snippetBar.isAddingSnippet = false;
                        scope.language = null;
                    });
                } else  if (scope.isEditing) {
                    editSnippet(snippet).then(function(result) {
                        snippetLibraryService.editSnippet(result, scope);
                        scope.isEditing = false;
                    });
                }
                scope.isPreviewing = false;
            };
            scope.initiateSnippetDelete = function(snippet) {
                // Popup modal to prompt user to see if snippet should really be deleted
                scope.$broadcast('snippetDeleteEvent', snippet);
            };
            scope.snippetDelete = function(snippet) {
                var topicName = topicService.selectedTopic ? topicService.selectedTopic.name : undefined;
                deleteSnippet(snippet).then(function(results) {
                    snippetLibraryService.deleteSnippet(results.id, topicName, scope);
                    scope.snippetPopupVisible = false;
                    scope.isEditing = false;
                    // Hide the snippet delete dialog
                    snippetDeleteDialog.modal('hide');
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
                scope.isScrolling = !scope.isScrolling;
                scope.scrollStrikeStyle =
                    scope.isScrolling ? textDecorationNoneStyle : textDecorationLineThroughStyle;
                if (scope.isScrolling) {
                    // Set CodeMirror scroll element to scroll in window of max-height = 400px
                    cmScrollElement.css({
                        'overflow':'auto',
                        'max-height':'400px'
                    });
                } else {
                    // Set CodeMirror scroll element to expand to code size
                    cmScrollElement.css({
                        'overflow-x':'auto',
                        'overflow-y':'hidden',
                        'height':'auto',
                        'max-height':'none'
                    });
                }
                scope.refreshIt = !scope.refreshIt;
            };

            scope.togglePreview = function() {
                scope.isPreviewing = !scope.isPreviewing;
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

.directive('snippetDeleteDialog', [function() {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: './static/components/snippetpanel/snippetDeleteDialog.html',
        link: function(scope, element, attrs) {
            var deleteButton = element.find('.snippetDoDelete');

            // Configure the snippet delete modal dialog
            element.modal({backdrop:'static', keyboard:false, show:false});

            scope.$on('snippetDeleteEvent', function(event, snippet) {
                // Show the snippet delete dialog
                element.modal('show');
                deleteButton.focus();
            });
        }
    }
}])

.directive('snippetFormBar', ['snippetService', 'snippetBarService',
                      function(snippetService,   snippetBar) {
    return {
        require: '?^snippet',
        restrict: 'E',
        replace: true,
        templateUrl: './static/components/snippetpanel/snippetFormBar.html',
        link: function(scope, element, attrs) {
            scope.toggleSnippetAccess = function(snippet) {
                snippet.access = !snippet.access;
            }
        }
    }
}])

.directive('snippetForm', ['snippetService', 'snippetBarService',
                   function(snippetService,   snippetBar) {
    return {
        require: ['?^snippetPanel', '?^snippet'],
        restrict: 'E',
        replace: true,
        templateUrl: './static/components/snippetpanel/snippetForm.html',
        controller: ['$scope', '$element', '$attrs',
             function($scope,   $element,   $attrs) {
            var codeMirrorEditor = {},
                codeMirrorDocument = {},
                codeMode = null;

            // The codemirror editor options must be done in a controller
            // (won't work in the link function)
            if ($scope.language !== null && $scope.language !== undefined) {
                codeMode = $scope.language.mode;
            }
            $scope.codeEditorOptions = {
                lineWrapping : $scope.lineWrapping,
                indentUnit: 4,
                lineNumbers: $scope.lineNumbers,
                readOnly: 'nocursor',
                mode: codeMode
            };

            $scope.$watch('language', function(language) {
                if (language === undefined || language === null) return;
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

            $scope.isSnippetDescriptionVisible = function(snippet) {
                // Don't show the description if the layout is titles-only
                if ($scope.layout === 'titlesonly') {
                    return false;
                }

                // Always show the description if editing or adding a snippet
                if ($scope.isEditing || $scope.isAdding) {
                    return true;
                }

                // Don't show if there is both the description and code text are empty
                if (snippet.description === "" && snippet.code === "") {
                    return false;
                }

                // Don't show if there is no description and the layout is row orientation
                if (snippet.description === "" && $scope.layout === 'row') {
                    return false;
                }
                return true;
            };

            $scope.isSnippetCodeVisible = function(snippet) {
                // Don't show the code if the layout is titles-only
                if ($scope.layout === 'titlesonly') {
                    return false;
                }

                // Always show the code if editing or adding a snippet
                if ($scope.isEditing || $scope.isAdding) {
                    return true;
                }

                // Don't show if there is code text is empty
                if (snippet.code === "") {
                    return false;
                }
                return true;
            }
        }],
        link: function(scope, element, attrs, controllers) {
            var snippetPanelCtrl = controllers[0],
                snippetCtrl = controllers[1],
            textareaElement = angular.element(element.find('.snippetDescription textarea')[0]);

            textareaElement.textareaAutoSize();
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
