layoutApp.controller('SnippetBarCtrl', ['$scope', 'snippetBarService',
                                function($scope,   snippetBar) {
    $scope.SnippetBarCtrlScope = "SnippetBarCtrlScope";
    $scope.topicOrSearchString = "";
    $scope.$on('topicOrSearchString', function(event, searchStr) {
        $scope.topicOrSearchString = searchStr;
    });
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
