someCodeApp.controller('HeaderCtrl', ['$scope', 'oauthLibrary', 'snippetSearch', 'snippetService',
                              function($scope,   oauth,          snippetSearch,   snippetService) {
    $scope.HeaderCtrlScope = "HeaderCtrlScope";
    $scope.searchSubmit = function() {
        console.log($scope.searchString);
        var searchAccess = oauth.isAuthenticated() ? 'private' : 'public';
        snippetSearch(searchAccess, $scope.searchString).then(function(results) {
            snippetService.setSnippets(results, $scope);
            $scope.$emit('updateSearchString', $scope.searchString);
            $scope.searchString = "";
        });
    }
}])

.directive('snippetSearch', function() {
    return {
        restrict: 'E',
        templateUrl: 'static/components/header/snippetSearch.html',
        transclude: false,
        controller: function($scope, $element, $attrs) {
            // $scope is HeaderCtrl's scope
            $scope.computeLayout = function() {
                if ($scope.isSignedIn) {
                    return {'min-width':'290px'};
                } else {
                    return {'min-width':'220px'};
                }
            }
        },
        link: function ($scope, element, attrs, snippetSearchController) {
            var searchField = element.find('#snippetSearchField');
            $scope.focused = false;
            $scope.placeholderText = $scope.isSignedIn ? "Search private snippets" : "Search public snippets";

            searchField.on('click', function() {
                $scope.$apply(function() {
                    $scope.focused = true;
                })
            });
            searchField.on('blur', function() {
                $scope.$apply(function() {
                    $scope.focused = false;
                })
            });
        }
    }
})

// The 'searchSizer' attribute directive will attempt to keep the
// search input width at a percentage of the page width. This
// will allow for more room to provide search input on
// larger windows.
.directive('searchSizer', function() {
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
});
