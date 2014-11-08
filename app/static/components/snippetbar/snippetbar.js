someCodeApp.service('snippetBarService', function() {
    var snippetLayout = "column";

    return {
        // Getters and setters
        get snippetLayout()       { return snippetLayout; },
        set snippetLayout(layout) { snippetLayout = layout; }
    }
})

.directive('snippetBar', ['topicService', 'snippetBarService', 'snippetService',
                  function(topicService,   snippetBar,          snippetService) {
    return {
        restrict: 'E',
        templateUrl: './static/components/snippetbar/snippetbar.html',
        link: function(scope, element, attrs) {
            scope.SnippetBarDirectiveScope = "SnippetBarDirectiveScope";
            if (topicService.isVisible) {
                scope.isToggled = true;
            }
            scope.topicOrSearchString = "";
            scope.$on('topicOrSearchString', function(event, searchStr) {
                scope.topicOrSearchString = searchStr;
            });
            scope.toggleTopicPanel = function() {
                topicService.isVisible = !topicService.isVisible;
                scope.isToggled = !scope.isToggled;
            };
            scope.snippetAdd = function() {
                snippetService.isAddingSnippet = !snippetService.isAddingSnippet;
            };
            scope.setLayout = function(layout) {
                snippetBar.snippetLayout = layout;
                scope.$emit('snippetLayoutChange', layout);
            };
            scope.getLayout = function() {
                return snippetBar.snippetLayout;
            }
        }
    }
}]);

