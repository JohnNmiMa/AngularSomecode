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
            $scope.topics = snippetService.topics.topics;

            // Click on a topic to display snippets in the topic
            $scope.selectTopic = function(topicName) {
                console.log("Clicked topic " + topicName);
                displayTopicSnippets(topicName).then(function(results) {
                    snippetService.setSnippets(results, $scope);
                    $scope.$emit('updateTopicString', topicName);
                });
            };

            // Click on the topic add control to add a new topic
            $scope.topicAdd = function() {
                $scope.$broadcast('topicAddEvent');
            };

            // Click on top topic edit control to edit a topic name
            $scope.isEditingTopic = false;
            $scope.topicEdit = function() {
                $scope.isEditingTopic = !$scope.isEditingTopic;
            };
            $scope.topicEditSubmit = function() {
                console.log("At topicEditSubmit: " + $scope.topicEditString);
            };

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

.directive('topicAddForm', ['snippetService', function(snippetService) {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: './static/components/topicpanel/topicAddForm.html',
        controller: function($scope, $element, $attrs, createTopic, snippetService) {
            $('#topicNameField').popover({
                container:'body', trigger:'manual', toggle:'popover', placement:'right',
                content:"This name already exists. Please type another name."});

            $scope.TopicAddFormDirectiveScope = "TopicAddFormDirectiveScope";
            $scope.isAddingTopic = false;
            $scope.$on('topicAddEvent', function(event) {
                $scope.isAddingTopic = !$scope.isAddingTopic;
                if ($scope.isAddingTopic === false) {
                    triggerTopicAddPopover(false);
                    resetForm();
                }
            });

            $scope.topicAddSubmit = function() {
                if ($scope.topicForm.$valid) {
                    createTopic($scope.topicAddString).then(function(newTopic) {
                        snippetService.addTopic(newTopic, $scope);
                        resetForm();
                    });
                } else {
                    triggerTopicAddPopover(true);
                    // Use to trigger custom bootstrap-ui tooltips or popovers
                    //if($scope.topicForm.$error.validateTopicName) {
                    //    $timeout(function () {
                    //        $('#topicNameField').trigger('show');
                    //    }, 0)
                    //}
                }
            };

            function resetForm() {
                $scope.topicAddString = "";
                $scope.topicForm.$setPristine();
            }

            function triggerTopicAddPopover(trigger) {
                if (trigger) {
                    if($scope.topicForm.$error.validateTopicName) {
                        $('#topicNameField').popover('show');
                    }
                } else {
                    $('#topicNameField').popover('hide');
                }
            }

            this.triggerTopicAddPopover = function(trigger) {
                triggerTopicAddPopover(trigger);
            }
        },
        link: function (scope, element, attrs) {
        }
    }
}])

.factory('topicNameValidatorService', ['snippetService', function(snippetService) {
    return function(attrs, ngModelCtrl, topicName) {
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
        require: ['ngModel', '?^topicAddForm'],
        link: function(scope, element, attrs, controllers) {
            ngModelCtrl = controllers[0];
            topicAddFormCtrl = controllers[1];

            ngModelCtrl.$validators.validateTopicName = function(modelValue, viewValue) {
                var status = topicNameValidatorService(attrs, ngModelCtrl, modelValue);
                topicAddFormCtrl.triggerTopicAddPopover(false);
                return status;
            };
        }
    }
}]);
