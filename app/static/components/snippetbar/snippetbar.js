someCodeApp.service('snippetBarService', [function() {
    //! In snippetBarService
    var snippetBarScope = undefined,
        isAddingSnippet = false,
        snippetLayoutDefault = "row";

    var changed = function() {
        if (snippetBarScope != undefined) {
            snippetBarScope.$emit('snippetBarModelChangedEvent');
        }
    };
    var register = function(scope) {
        snippetBarScope = scope;
    };

    return {
        // Getters and setters
        get isAddingSnippet() { return isAddingSnippet; },
        set isAddingSnippet(bool)  { isAddingSnippet = bool; changed(); },
        get snippetLayout() {
            if(localStorage['snippetLayout'] === undefined) {
                localStorage['snippetLayout'] = snippetLayoutDefault;
            }
            return  localStorage['snippetLayout'];
        },
        set snippetLayout(layout) { localStorage['snippetLayout'] = layout; changed(); },

        // Public functions
        register:register
    }
}])

.directive('snippetBar', ['topicService', 'snippetBarService',
                  function(topicService,   snippetBar) {
    return {
        restrict: 'E',
        scope: true,
        templateUrl: './static/components/snippetbar/snippetbar.html',
        link: function(scope, element, attrs) {
            scope.SnippetBarDirectiveScope = "SnippetBarDirectiveScope";

            snippetBar.register(scope);
            scope.$on('snippetBarModelChanged', function() {
                modelChanged();
            });
            function modelChanged() {
                scope.isAddingSnippet = snippetBar.isAddingSnippet;
            }
            modelChanged();

            if (topicService.isTopicPanelVisible) {
                scope.isToggled = true;
            }
            scope.toggleTopicPanel = function() {
                topicService.isTopicPanelVisible = !topicService.isTopicPanelVisible;
                scope.isToggled = !scope.isToggled;
            };

            scope.topicOrSearchString = "";
            scope.$on('topicOrSearchString', function(event, searchStr) {
                scope.topicOrSearchString = searchStr;
            });

            scope.snippetAdd = function() {
                if (snippetBar.isAddingSnippet === false) {
                    snippetBar.isAddingSnippet = !snippetBar.isAddingSnippet;
                }
            };

            scope.setLayout = function(layout) {
                snippetBar.snippetLayout = layout;
            };
            scope.getLayout = function() {
                return snippetBar.snippetLayout;
            }
        }
    }
}]);

