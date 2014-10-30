someCodeApp.controller('TopicPanelCtrl', ['$scope', 'snippetService',
                                  function($scope,   snippetService) {
    $scope.TopicPanelCtrlScope = "TopicPanelCtrlScope";
    $scope.topics = snippetService.topics.topics;
}])

.directive('topicPanel', function() {
    return {
        restrict: 'E',
        replace: true,
        scope: true,
        templateUrl: './static/components/topicpanel/topicpanel.html',
        controller: function ($scope, $element, $attrs, displayTopicSnippets, createTopic, snippetService) {
            $scope.isAddingTopic = false;
            $scope.topicAdd = function() {
                $scope.isAddingTopic = !$scope.isAddingTopic;
            };
            $scope.topicAddSubmit = function() {
                if ($scope.topicForm.$valid) {
                    console.log("topicForm is valid");
                    console.log("At topicAddSubmit: " + $scope.topicAddString);
                    createTopic($scope.topicAddString).then(function(newTopic) {
                        console.log("At topicAddSubmit: received results");
                        snippetService.addTopic(newTopic, $scope);
                        $scope.topicAddString = "";
                        $scope.topicForm.$setPristine();
                        $scope.isAddingTopic = false;
                    });
                } else {
                    // Show the duplicateTopic popover
                }
            };

            $scope.isEditingTopic = false;
            $scope.topicEdit = function() {
                $scope.isEditingTopic = !$scope.isEditingTopic;
            };
            $scope.topicEditSubmit = function() {
                console.log("At topicEditSubmit: " + $scope.topicEditString);
            };
            $scope.selectTopic = function(topicName) {
                console.log("Clicked topic " + topicName);
                displayTopicSnippets(topicName).then(function(results) {
                    snippetService.setSnippets(results, $scope);
                    $scope.$emit('updateTopicString', topicName);
                });
            }

        },
        link: function (scope, element, attrs, topicPanelCtrl) {
        }
    }
})

.directive('topic', function() {
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
})

.factory('topicNameValidatorService', ['snippetService', function(snippetService) {
    return function(attrs, ngModelCtrl, topicName) {
        var topics = snippetService.topics.topics;

        if (topicName == undefined) {
            return false;
        } else {
            for (var topic in topics) {
                if (topicName.toLowerCase() === topics[topic].name.toLowerCase()) {
                    return false;
                }
            }
        }
        return true;
    }
}])

.directive('topicName', ['topicNameValidatorService', function(topicNameValidatorService) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, element, attrs, ngModelCtrl) {
            ngModelCtrl.$validators.topicName = function(modelValue, viewValue) {
                return topicNameValidatorService(attrs, ngModelCtrl, modelValue);
            };
        }
    }
}]);
