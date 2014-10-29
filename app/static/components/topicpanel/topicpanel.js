someCodeApp.controller('TopicPanelCtrl', ['$scope', 'snippetService',
                                  function($scope,   snippetService) {
    $scope.TopicPanelCtrlScope = "TopicPanelCtrlScope";
    $scope.topics = snippetService.topics.topics;
    $scope.$on('topicsUpdate', function(event) {
        $scope.topics = snippetService.getTopics();
    });
}])

.directive('topicPanel', function() {
    return {
        restrict: 'E',
        replace: true,
        scope: true,
        templateUrl: './static/components/topicpanel/topicpanel.html',
        controller: function ($scope, $element, $attrs, displayTopicSnippets, snippetService) {
            $scope.isAddingTopic = false;
            $scope.topicAdd = function() {
                $scope.isAddingTopic = !$scope.isAddingTopic;
            };
            $scope.topicAddSubmit = function() {
                console.log("At topicAddSubmit: " + $scope.topicAddString);
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
                    console.log("At selectTopic: received results");
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
});
