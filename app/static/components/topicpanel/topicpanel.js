// Use to create a custom bootstrap-ui tooltip or popover trigger
//someCodeApp.config(['$tooltipProvider', function($tooltipProvider) {
//    $tooltipProvider.setTriggers({'show':'hide'});
//}])


someCodeApp.service('topicService', [function() {
    var topicPanelScope = undefined,
        isTopicPanelVisibleDefault = true,
        topicPanelWidthDefault = "20%",
        snippetPanelWidthDefault = "80%",
        isAddingTopic = false,
        isEditingTopic = false,
        isEditingTopicName = false,
        selectedTopic = undefined,
        editedTopicId = undefined;

    var changed = function() {
        if (topicPanelScope != undefined) {
            topicPanelScope.$broadcast('topicPanelModelChanged');
        }
    };
    var register = function(scope) {
        topicPanelScope = scope;
    };

    return {
        // Getters and setters
        get isTopicPanelVisible()                 {
            if(localStorage['isTopicPanelVisible'] === undefined) {
                localStorage['isTopicPanelVisible'] = isTopicPanelVisibleDefault;
            }
            return localStorage['isTopicPanelVisible'] === 'true' ? true : false;
        },
        set isTopicPanelVisible(bool)   { localStorage['isTopicPanelVisible'] = bool; changed(); },
        get isAddingTopic()             { return isAddingTopic; },
        set isAddingTopic(bool)         { isAddingTopic = bool; changed(); },
        get isEditingTopic()            { return isEditingTopic; },
        set isEditingTopic(bool)        { isEditingTopic = bool; changed(); },
        get isEditingTopicName()        { return isEditingTopicName; },
        set isEditingTopicName(bool)    { isEditingTopicName = bool; changed(); },
        get selectedTopic()             { return selectedTopic; },
        set selectedTopic(topic)        { selectedTopic = topic; changed(); },
        get editedTopicId()             { return editedTopicId; },
        set editedTopicId(id)           { editedTopicId = id; changed(); },
        get topicPanelWidth()           {
            if (localStorage['topicPanelWidth'] === undefined) {
                localStorage['topicPanelWidth'] = topicPanelWidthDefault;
            }
            return localStorage['topicPanelWidth'];
        },
        set topicPanelWidth(widthStr)   { localStorage['topicPanelWidth'] = widthStr; },
        get snippetPanelWidth()         {
            if (localStorage['snippetPanelWidth'] === undefined) {
                localStorage['snippetPanelWidth'] = snippetPanelWidthDefault;
            }
            return localStorage['snippetPanelWidth'];
        },
        set snippetPanelWidth(widthStr) { localStorage['snippetPanelWidth'] = widthStr; },

        // Public functions
        register:register
    }
}])


.directive('topicPanel', ['topicService',
                  function(topicService) {
    return {
        restrict: 'E',
        replace: true,
        scope: true,
        templateUrl: './static/components/topicpanel/topicpanel.html',
        controller: ['$scope', '$element', '$attrs', 'topicService', 'displayTopicSnippets', 'snippetLibraryService',
            function ($scope,   $element,   $attrs,   topicService,   displayTopicSnippets,   snippetLibraryService) {
            $scope.TopicPanelDirectiveCtrlScope = "TopicPanelDirectiveCtrlScope";

            // The topics model
            $scope.topics = snippetLibraryService.topics.topics;
            $scope.$on('updateTopics', function(event) {
                $scope.topics = snippetLibraryService.topics.topics;
            });


            // A topic name was selected. This means different things depending upon
            // the state of the topicPanel.
            $scope.selectTopic = function(topic) {
                var topicName = topic.name;
                if (topicService.isAddingTopic === false) {
                    if (topicService.isEditingTopic === true) {
                        if (topicName != "General" && topicName != "Welcome") {
                            // Edit the topic name
                            topicService.editedTopicId = topic.id;
                            topicService.isEditingTopicName = true;
                        }
                    } else {
                        // Display topic snippets
                        displayTopicSnippets(topicName).then(function(results) {
                            snippetLibraryService.setSnippets(results, $scope);
                            $scope.$emit('updateTopicString', topicName);
                        });
                        topicService.selectedTopic = topic;
                    }
                }
            };

            // topicDelete icon was clicked
            $scope.initiateTopicDelete = function(topic) {
                // Popup modal to prompt user to see if topic should really be deleted
                $scope.$broadcast('topicDeleteEvent', topic);
            }

            // Click on the topic add control to add a new topic
            $scope.topicAdd = function() {
                if (topicService.isEditingTopic === false) {
                    topicService.isAddingTopic = !topicService.isAddingTopic;
                }
            };

            // Click on top topic edit control to edit a topic name
            $scope.topicEdit = function() {
                if (topicService.isAddingTopic === false) {
                    topicService.isEditingTopic = !topicService.isEditingTopic;
                    if (topicService.isEditingTopic === false) {
                        topicService.isEditingTopicName = false;
                    }
                }
            };
        }],
        link: function (scope, element, attrs) {
            // The topicPanel model
            topicService.register(scope);
            scope.$on('topicPanelModelChanged', function() {
                modelChanged();
            });
            function modelChanged() {
                // update scope
                scope.isVisible = topicService.isTopicPanelVisible;
                if (topicService.isTopicPanelVisible) {
                    setSnippetPanelWidth(topicService.snippetPanelWidth);
                } else {
                    setSnippetPanelWidth("100%");
                }
                scope.isAddingTopic = topicService.isAddingTopic;
                scope.isEditingTopic = topicService.isEditingTopic;
                scope.isEditingTopicName = topicService.isEditingTopicName;
                if (topicService.selectedTopic !== undefined) {
                    scope.selectedTopicId = topicService.selectedTopic.id;
                }
                scope.editedTopicId = topicService.editedTopicId;
            }
            modelChanged(); // Init scope

            function setSnippetPanelWidth(width) {
                $('#snippetPanel').css({
                    'width': width
                });
            }
        }
    }
}])

.directive('topic', [function() {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: './static/components/topicpanel/topic.html',
        link: function(scope, element, attrs) {
            scope.editSymbol = (scope.topic.name === "General" || scope.topic.name === "Welcome") ?
                'fa-circle' : 'fa-minus-circle';
            scope.invisibleClass = (scope.topic.name === "General" || scope.topic.name === "Welcome") ?
                'invisible' : "";
        }
    }
}])


.directive('topicAddForm', ['topicService', 'snippetLibraryService', 'createTopic',
                    function(topicService,   snippetLibraryService,   createTopic) {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: './static/components/topicpanel/topicAddForm.html',
        controller: ['$scope', '$element', '$attrs',
             function($scope,   $element, $attrs) {
            var inputElement = $element.find('input');
            inputElement.popover({
                container:'body', trigger:'manual', toggle:'popover', placement:'right',
                content:"This name already exists. Please type another name."});

            $scope.TopicAddFormDirectiveScope = "TopicAddFormDirectiveScope";
            $scope.$on('topicPanelModelChanged', function() {
                if (topicService.isAddingTopic === false) {
                    triggerTopicAddPopover(false);
                    resetForm();
                }
            });

            function triggerTopicAddPopover(trigger) {
                if (trigger) {
                    if($scope.topicAddForm.$error.validateTopicAddName) {
                        inputElement.popover('show');
                    }
                } else {
                    inputElement.popover('hide');
                }
            }

            function resetForm() {
                $scope.topicAddString = "";
                $scope.topicAddForm.$setPristine();
            }

            this.triggerTopicAddPopover = function(trigger) {
                triggerTopicAddPopover(trigger);
            };
            this.resetForm = function() {
                resetForm();
            };
        }],
        link: function (scope, element, attrs, topicAddFormCtrl) {
            scope.topicAddSubmit = function() {
                if (scope.topicAddForm.$valid) {
                    createTopic(scope.topicAddString).then(function(newTopic) {
                        snippetLibraryService.addTopic(newTopic, scope);
                        topicAddFormCtrl.resetForm();
                    });
                } else {
                    topicAddFormCtrl.triggerTopicAddPopover(true);
                    // Use to trigger custom bootstrap-ui tooltips or popovers
                    //if(scope.topicAddForm.$error.validateTopicName) {
                    //    $timeout(function () {
                    //        $('#topicAddNameField').trigger('show');
                    //    }, 0)
                    //}
                }
            };

        }
    }
}])


.directive('topicEditForm', ['topicService', 'snippetLibraryService', 'editTopic',
                     function(topicService,   snippetLibraryService,   editTopic) {
    return {
        restrict: 'E',
        replace: true,
        scope: true,   // there's one of these forms for each topic
        templateUrl: './static/components/topicpanel/topicEditForm.html',
        controller: ['$scope', '$element', '$attrs',
            function ($scope,   $element,   $attrs) {
            var inputElement = $element.find('input');

            inputElement.popover({
                container:'body', trigger:'manual', toggle:'popover', placement:'right',
                content:"This name already exists. Please type another name."});

            $scope.TopicEditFormDirectiveScope = "TopicEditFormDirectiveScope";
            $scope.topicEditString = $scope.topic.name;
            $scope.$on('topicPanelModelChanged', function() {
                if (topicService.isEditingTopic === false) {
                    resetForm($scope.topic);
                    triggerTopicEditPopover(false);
                }
            });

            function triggerTopicEditPopover(trigger) {
                if (trigger) {
                    if($scope.topicEditForm.$error.validateTopicEditName) {
                        inputElement.popover('show');
                    }
                } else {
                    inputElement.popover('hide');
                }
            }

            function resetForm(topic) {
                $scope.topicEditString = topic.name;
                $scope.topicEditForm.$setPristine();
            }

            this.triggerTopicEditPopover = function(trigger) {
                triggerTopicEditPopover(trigger);
            };
            this.resetForm = function(topic) {
                resetForm(topic);
            };
        }],
        link: function(scope, element, attrs, topicEditFormCtrl) {
            scope.topicEditSubmit = function() {
                if (scope.topicEditForm.$valid) {
                    editTopic(scope.topic.id, scope.topicEditString).then(function(editedTopic) {
                        snippetLibraryService.editTopic(editedTopic, scope);
                        topicEditFormCtrl.resetForm(editedTopic);
                        topicService.isEditingTopicName = false;
                    });
                } else {
                    topicEditFormCtrl.triggerTopicEditPopover(true);
                }
            };
        }
    }
}])


.directive('topicDeleteDialog', ['snippetLibraryService',
                         function(snippetLibraryService) {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: './static/components/topicpanel/topicDeleteDialog.html',
        controller: ['$scope', '$element', '$attrs', 'deleteTopic',
             function($scope,   $element,   $attrs,   deleteTopic) {
            var topicToDelete = undefined;

            // Setup the topic delete modal dialog
            $element.modal({backdrop:'static', keyboard:false, show:false});

            $scope.$on('topicDeleteEvent', function(event, topic) {
                topicToDelete = topic;
                $('#topicDeleteDialog').modal('show');
                $('#topicDoDelete').focus();
            });

            $scope.doTopicDelete = function() {
                if (topicToDelete) {
                    deleteTopic(topicToDelete.id).then(function(results) {
                        snippetLibraryService.deleteTopic(results.id, $scope);
                    });
                    topicToDelete = undefined;
                }
                $('#topicDeleteDialog').modal('hide');
            }
        }]
    }
}])

.factory('topicNameValidatorService', ['snippetLibraryService',
                               function(snippetLibraryService) {
    return function(attrs, ngModelCtrl, topicName) {
        // Return false (don't validate) if the topicName already exists
        // We don't want to add or edit a topic if it is already in the list of topics
        var topics = [];

        if (topicName != undefined) {
            topics = snippetLibraryService.topics.topics;
            for (var topic in topics) {
                if (topicName.toLowerCase() === topics[topic].name.toLowerCase()) {
                    return false;
                }
            }
        }
        return true;
    }
}])

.directive('validateTopicName', ['topicNameValidatorService',
                         function(topicNameValidatorService) {
    return {
        restrict: 'A',
        require: ['ngModel', '?^topicAddForm', '?^topicEditForm'],
        link: function(scope, element, attrs, controllers) {
            var ngModelCtrl = controllers[0],
                topicAddFormCtrl = controllers[1],
                topicEditFormCtrl = controllers[2];

            if (attrs.name === 'topicAddName') {
                ngModelCtrl.$validators.validateTopicAddName = function(modelValue, viewValue) {
                    var status = topicNameValidatorService(attrs, ngModelCtrl, modelValue);
                    topicAddFormCtrl.triggerTopicAddPopover(false);
                    return status;
                };
            } else if (attrs.name === 'topicEditName') {
                ngModelCtrl.$validators.validateTopicEditName = function(modelValue, viewValue) {
                    var status = topicNameValidatorService(attrs, ngModelCtrl, modelValue);
                    topicEditFormCtrl.triggerTopicEditPopover(false);
                    return status;
                };
            }
        }
    }
}])

.directive('topicPanelResizeSelector', ['$document', 'topicService',
                                function($document,   topicService) {
    return {
        restrict: 'E',
        templateUrl: './static/components/topicpanel/topicPanelResizeSelector.html',
        link: function(scope, element, attrs) {
            var startX = 0;
            element.on('mousedown', function(event) {
                event.preventDefault();
                $document.on('mousemove', mousemove);
                $document.on('mouseup', mouseup);

                startX = event.pageX;
            });

            function mousemove(event) {
                var x = event.pageX,
                    dx = x - startX,
                    resizerMin = parseFloat(attrs.resizerMin),
                    resizerMax = parseFloat(attrs.resizerMax) / 100,
                    topicPanelWidth = parseFloat($('#topicPanel').css("width")),
                    //snippetPanelWidth = parseFloat($('#snippetPanel').css("width")),
                    snippetBlockWidth = parseFloat($('#snippetBlock').width()),
                    newTopicPanelWidth = topicPanelWidth + dx,
                    newTopicPanelWidthPercent = newTopicPanelWidth / snippetBlockWidth;

                if (resizerMin > newTopicPanelWidth) {
                    newTopicPanelWidth = resizerMin;
                    newTopicPanelWidthPercent = newTopicPanelWidth / snippetBlockWidth;
                }
                if (resizerMax < newTopicPanelWidthPercent) {
                    newTopicPanelWidth = resizerMax * snippetBlockWidth;
                    newTopicPanelWidthPercent = resizerMax;
                }

                /*
                console.log("topicPanelWidth = " + topicPanelWidth +
                            ": snippetPanelWidth = " + snippetPanelWidth +
                            ": newTopicPanelWidth = " + newTopicPanelWidth +
                            ": snippetBlockWidth = " + snippetBlockWidth +
                            ": newTopicPanelWidthPercent = " + newTopicPanelWidthPercent);
                console.log('mousemove: x = ' + x + ": dx = " + dx);
                 */

                setComponentsWidth(newTopicPanelWidth + 'px', (snippetBlockWidth - newTopicPanelWidth) + 'px');
                //setComponentsWidth((newTopicPanelWidthPercent * 100) + '%', ((1 - newTopicPanelWidthPercent) * 100) + '%');

                startX = x;
            }

            function mouseup() {
                $document.unbind('mousemove', mousemove);
                $document.unbind('mouseup', mouseup);
            }

            function setComponentsWidth(topicPanelWidth, snippetPanelWidth) {
                // Adjust the topicPanel's width
                $('#topicPanel').css({
                    'width': topicPanelWidth
                });
                topicService.topicPanelWidth = topicPanelWidth;

                // Adjust the snippetPanel's width
                $('#snippetPanel').css({
                    'width': snippetPanelWidth
                });
                topicService.snippetPanelWidth = snippetPanelWidth;
            }
        }
    }
}])


.directive('topicPanelSizer', ['oauthLibrary', 'topicService',
                       function(oauth,          topicService) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            // The topic panel doesn't exist when logged out
            var hasTopicPanel = oauth.isAuthenticated();

            function setComponentsWidth(topicPanelWidth) {
                if(hasTopicPanel) {
                    // Adjust the topicPanel's width
                    scope.topicPanelStyle = {'width': topicPanelWidth};
                    topicService.topicPanelWidth = topicPanelWidth;
                }
            }
            setComponentsWidth(topicService.topicPanelWidth);
        }
    }
}]);
