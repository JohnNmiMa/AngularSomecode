someCodeApp.controller('SnippetBarCtrl', ['$scope', 'topicService', 'snippetBarService',
                                  function($scope,   topicService,   snippetBar) {
    $scope.SnippetBarCtrlScope = "SnippetBarCtrlScope";
    $scope.topicOrSearchString = "";
    $scope.$on('topicOrSearchString', function(event, searchStr) {
        $scope.topicOrSearchString = searchStr;
    });
    $scope.toggleTopicPanel = function() {
        topicService.isVisible = !topicService.isVisible;
    };
    $scope.setLayout = function(layout) {
        snippetBar.snippetLayout = layout;
        $scope.$emit('snippetLayoutChange', layout);
    };
    $scope.getLayout = function() {
        return snippetBar.snippetLayout;
    }
}])

.service('snippetBarService', function() {
    var snippetLayout = "column";

    return {
        // Getters and setters
        get snippetLayout()       { return snippetLayout; },
        set snippetLayout(layout) { snippetLayout = layout; }
    }
});
