someCodeApp.controller('HeaderCtrl', ['$scope', 'oauthLibrary', 'snippetSearch', 'snippetLibraryService', 'topicService',
                              function($scope,   oauth,          snippetSearch,   snippetLibraryService,   topicService) {
    $scope.HeaderCtrlScope = "HeaderCtrlScope";
    $scope.personalSnippetCount = 0;
    $scope.publicSnippetCount = 0;

    $scope.$watch(
        function() {
            return oauth.isAuthenticated();
        },
        function(newVal, oldVal) {
            $scope.searchAccess = oauth.isAuthenticated() ? 'personal' : 'public';
        }
    );

    $scope.$on('updateSnippets', function(event) {
        var counts = snippetLibraryService.snippetCounters;
        $scope.personalSnippetCount = counts.personal_count;
        $scope.publicSnippetCount = counts.public_count;
    });

    $scope.searchSubmit = function() {
        snippetSearch($scope.searchAccess, $scope.searchString).then(function(results) {
            snippetLibraryService.setSnippets(results, $scope);
            topicService.selectedTopic = undefined;
            $scope.$emit('updateSearchString', $scope.searchString);
            $scope.searchString = "";
        });
    }
}])

.directive('snippetSearch', [function() {
    return {
        restrict: 'E',
        templateUrl: 'static/components/header/snippetSearch.html',
        transclude: false,
        controller: ['$scope', '$element', '$attrs',
             function($scope,   $element,   $attrs) {
            // $scope is HeaderCtrl's scope
            $scope.computeLayout = function() {
                if ($scope.isSignedIn) {
                    return {'min-width': '290px'};
                } else {
                    return {'min-width': '220px'};
                }
            };

            $scope.setSearchAccess = function(access) {
                $scope.searchAccess = access;
            };
        }],
        link: function (scope, element, attrs) {
            var searchField = element.find('#snippetSearchField');
            scope.focused = false;
            scope.placeholderText = scope.isSignedIn ? "Search private snippets" : "Search public snippets";

            searchField.on('click', function() {
                scope.$apply(function() {
                    scope.focused = true;
                })
            });
            searchField.on('blur', function() {
                scope.$apply(function() {
                    scope.focused = false;
                })
            });
        }
    }
}])

// The 'searchSizer' attribute directive will attempt to keep the
// search input width at a percentage of the page width. This
// will allow for more room to provide search input on
// larger windows.
.directive('searchSizer', [function() {
    return {
        link: function($scope, $element, $attrs) {
            var widthPct = 25;

            $(window).on('resize', function() {
                $scope.$apply(function () {
                    computeSearchInputWidth();
                })
            });
            function computeSearchInputWidth() {
                $element.width(window.innerWidth * widthPct/100);
            }
            computeSearchInputWidth();
        }
    }
}]);
