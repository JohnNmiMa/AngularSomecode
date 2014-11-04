// Use to create a custom bootstrap-ui tooltip or popover trigger
//someCodeApp.config(['$tooltipProvider', function($tooltipProvider) {
//    $tooltipProvider.setTriggers({'show':'hide'});
//}])

someCodeApp.directive('topicPanel', [function() {
    return {
        restrict: 'E',
        replace: true,
        scope: true,
        templateUrl: './static/components/topicpanel/topicpanel.html',
        controller: function ($scope, $element, $attrs, displayTopicSnippets, snippetService) {
            $scope.TopicPanelDirectiveCtrlScope = "TopicPanelDirectiveCtrlScope";
            $scope.isAddingTopic = false;
            $scope.isEditingTopic = false;
            $scope.isEditingTopicName = false;
            $scope.selectedTopicId = undefined;
            $scope.editedTopicId = undefined;
            $scope.topics = snippetService.topics.topics;
            $scope.$on('updateTopics', function(event) {
                $scope.topics = snippetService.topics.topics;
            });

            // Click on a topic to display snippets in the topic
            $scope.selectTopic = function(topic) {
                var topicName = topic.name;
                if ($scope.isAddingTopic === false) {
                    if ($scope.isEditingTopic === true) {
                        if (topicName != "General" && topicName != "Welcome") {
                            // Edit the topic name
                            //$scope.isEditingTopicName = true;
                            setIsEditingTopicName(true);
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

            $scope.initiateTopicDelete = function(topic) {
                // Popup modal to prompt user to see if topic should really be deleted
                $scope.$broadcast('topicDeleteEvent', topic);
            }

            // Click on the topic add control to add a new topic
            $scope.topicAdd = function() {
                if ($scope.isEditingTopic === false) {
                    $scope.isAddingTopic = !$scope.isAddingTopic;
                    $scope.$broadcast('topicAddEvent', $scope.isAddingTopic);
                }
            };

            // Click on top topic edit control to edit a topic name
            $scope.topicEdit = function() {
                if ($scope.isAddingTopic === false) {
                    $scope.isEditingTopic = !$scope.isEditingTopic;
                    if ($scope.isEditingTopic === false) {
                        //$scope.isEditingTopicName = false;
                        setIsEditingTopicName(false);
                        $scope.editedTopicId = undefined;
                    }
                    $scope.$broadcast('topicEditEvent', $scope.isEditingTopic);
                }
            };

            function setIsEditingTopicName(isEditing) {
                $scope.isEditingTopicName = isEditing;
            }
            this.setIsEditingTopicName = function(isEditing) {
                setIsEditingTopicName(isEditing);
            }
        },
        link: function (scope, element, attrs, topicPanelCtrl) {
        }
    }
}])

.directive('topic', [function() {
    return {
        require: '?^topicPanel',
        restrict: 'E',
        replace: true,
        templateUrl: './static/components/topicpanel/topic.html',
        link: function(scope, element, attrs, topicPanelCtrl) {
            scope.editSymbol = (scope.topic.name === "General" || scope.topic.name === "Welcome") ?
                'fa-circle' : 'fa-minus-circle';
            scope.invisibleClass = (scope.topic.name === "General" || scope.topic.name === "Welcome") ?
                'invisible' : "";
        }
    }
}])


.directive('topicAddForm', ['snippetService', 'createTopic', function(snippetService, createTopic) {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: './static/components/topicpanel/topicAddForm.html',
        controller: function($scope, $element, $attrs, createTopic, snippetService) {
            $('#topicAddNameField').popover({
                container:'body', trigger:'manual', toggle:'popover', placement:'right',
                content:"This name already exists. Please type another name."});

            $scope.TopicAddFormDirectiveScope = "TopicAddFormDirectiveScope";
            $scope.$on('topicAddEvent', function(event, isAdding) {
                if (isAdding === false) {
                    triggerTopicAddPopover(false);
                    resetForm();
                }
            });

            function triggerTopicAddPopover(trigger) {
                if (trigger) {
                    if($scope.topicAddForm.$error.validateTopicAddName) {
                        $('#topicAddNameField').popover('show');
                    }
                } else {
                    $('#topicAddNameField').popover('hide');
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


.directive('topicEditForm', ['snippetService', 'editTopic', function(snippetService, editTopic) {
    return {
        restrict: 'E',
        require: ['topicEditForm', '?^topicPanel'],
        replace: true,
        scope: true,   // there's one of these forms for each topic
        templateUrl: './static/components/topicpanel/topicEditForm.html',
        controller: function ($scope, $element, $attrs, editTopic) {
            var inputElement = $element.find('input');
            inputElement.popover({
                container:'body', trigger:'manual', toggle:'popover', placement:'right',
                content:"This name already exists. Please type another name."});

            $scope.TopicEditFormDirectiveScope = "TopicEditFormDirectiveScope";
            $scope.topicEditString = $scope.topic.name;
            $scope.$on('topicEditEvent', function(event, isEditing) {
                if (isEditing === false) {
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
        link: function(scope, element, attrs, controllers) {
            var topicEditFormCtrl = controllers[0],
                topicPanelCtrl = controllers[1];

            scope.topicEditSubmit = function() {
                if (scope.topicEditForm.$valid) {
                    editTopic(scope.topic.id, scope.topicEditString).then(function(editedTopic) {
                        snippetService.editTopic(editedTopic, scope);
                        topicEditFormCtrl.resetForm(editedTopic);
                        topicPanelCtrl.setIsEditingTopicName(false);
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
}]);
