// Use to create a custom bootstrap-ui tooltip or popover trigger
//someCodeApp.config(['$tooltipProvider', function($tooltipProvider) {
//    $tooltipProvider.setTriggers({'show':'hide'});
//}])


someCodeApp.service('topicService', function() {
    var topicPanelScope = undefined,
        isAddingTopic = false,
        isEditingTopic = false,
        isEditingTopicName = false,
        selectedTopicId = undefined,
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
        get isAddingTopic()          { return isAddingTopic; },
        set isAddingTopic(bool)      { isAddingTopic = bool; changed(); },
        get isEditingTopic()         { return isEditingTopic; },
        set isEditingTopic(bool)     { isEditingTopic = bool; changed(); },
        get isEditingTopicName()     { return isEditingTopicName; },
        set isEditingTopicName(bool) { isEditingTopicName = bool; changed(); },
        get selectedTopicId()        { return selectedTopicId; },
        set selectedTopicId(id)      { selectedTopicId = id; changed(); },
        get editedTopicId()          { return editedTopicId; },
        set editedTopicId(id)        { editedTopicId = id; changed(); },

        // Public functions
        register:register
    }
})


.directive('topicPanel', [function() {
    return {
        restrict: 'E',
        replace: true,
        scope: true,
        templateUrl: './static/components/topicpanel/topicpanel.html',
        controller: function ($scope, $element, $attrs, topicService, displayTopicSnippets, snippetService) {
            $scope.TopicPanelDirectiveCtrlScope = "TopicPanelDirectiveCtrlScope";

            // The topics model
            $scope.topics = snippetService.topics.topics;
            $scope.$on('updateTopics', function(event) {
                $scope.topics = snippetService.topics.topics;
            });

            // The topicPanel model
            topicService.register($scope);
            $scope.$on('topicPanelModelChanged', function() {
                modelChanged();
            });
            function modelChanged() {
                // update scope
                $scope.isAddingTopic = topicService.isAddingTopic;
                $scope.isEditingTopic = topicService.isEditingTopic;
                $scope.isEditingTopicName = topicService.isEditingTopicName;
                $scope.selectedTopicId = topicService.selectedTopicId;
                $scope.editedTopicId = topicService.editedTopicId;
            }
            modelChanged(); // Init scope

            // A topic name was selected. This means different things depending upon
            // the state of the topicPanel.
            $scope.selectTopic = function(topic) {
                var topicName = topic.name;
                if (topicService.isAddingTopic === false) {
                    if (topicService.isEditingTopic === true) {
                        if (topicName != "General" && topicName != "Welcome") {
                            // Edit the topic name
                            topicService.isEditingTopicName = true;
                            $scope.editedTopicId = topic.id;
                        }
                    } else {
                        // Display topic snippets
                        displayTopicSnippets(topicName).then(function(results) {
                            snippetService.setSnippets(results, $scope);
                            $scope.$emit('updateTopicString', topicName);
                        });
                        $scope.selectedTopicId = topic.id;
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
                    topicService.isAddingTopic = !$scope.isAddingTopic;
                }
            };

            // Click on top topic edit control to edit a topic name
            $scope.topicEdit = function() {
                if (topicService.isAddingTopic === false) {
                    topicService.isEditingTopic = !$scope.isEditingTopic;
                    if (topicService.isEditingTopic === false) {
                        topicService.isEditingTopicName = false;
                        $scope.editedTopicId = undefined;
                    }
                }
            };
        },
        link: function (scope, element, attrs) {
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


.directive('topicAddForm', ['topicService', 'snippetService', 'createTopic',
                    function(topicService,   snippetService,   createTopic) {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: './static/components/topicpanel/topicAddForm.html',
        controller: function($scope, $element, $attrs) {
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
            }
            this.resetForm = function() {
                resetForm();
            };
        },
        link: function (scope, element, attrs, topicAddFormCtrl) {
            scope.topicAddSubmit = function() {
                if (scope.topicAddForm.$valid) {
                    createTopic(scope.topicAddString).then(function(newTopic) {
                        snippetService.addTopic(newTopic, scope);
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


.directive('topicEditForm', ['topicService', 'snippetService', 'editTopic',
                     function(topicService,   snippetService,   editTopic) {
    return {
        restrict: 'E',
        replace: true,
        scope: true,   // there's one of these forms for each topic
        templateUrl: './static/components/topicpanel/topicEditForm.html',
        controller: function ($scope, $element, $attrs) {
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
        },
        link: function(scope, element, attrs, topicEditFormCtrl) {
            scope.topicEditSubmit = function() {
                if (scope.topicEditForm.$valid) {
                    editTopic(scope.topic.id, scope.topicEditString).then(function(editedTopic) {
                        snippetService.editTopic(editedTopic, scope);
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


.directive('topicDeleteDialog', ['snippetService', function(snippetService) {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: './static/components/topicpanel/topicDeleteDialog.html',
        controller: function($scope, $element, $attrs, deleteTopic) {
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
                        snippetService.deleteTopic(results.id, $scope);
                    });
                    topicToDelete = undefined;
                }
                $('#topicDeleteDialog').modal('hide');
            }
        }
    }
}])

.factory('topicNameValidatorService', ['snippetService', function(snippetService) {
    return function(attrs, ngModelCtrl, topicName) {
        // Return false (don't validate) if the topicName already exists
        // We don't want to add or edit a topic if it is already in the list of topics
        var topics = [];

        if (topicName != undefined) {
            topics = snippetService.topics.topics;
            for (var topic in topics) {
                if (topicName.toLowerCase() === topics[topic].name.toLowerCase()) {
                    return false;
                }
            }
        }
        return true;
    }
}])

.directive('validateTopicName', ['topicNameValidatorService', function(topicNameValidatorService) {
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

.directive('topicPanelResizeSelector', [function() {
    return {
        restrict: 'E',
        templateUrl: './static/components/topicpanel/topicPanelResizeSelector.html'
    }
}]);
