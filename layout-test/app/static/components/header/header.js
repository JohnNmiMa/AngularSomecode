snippetResults = {
    0: {
        access: true,
        id:1,
        creator_id: 1,
        title: "Snippet 1",
        code: "Some code for Snippet 1",
        description: "A description for Snippet 1"
    },
    1: {
        access: true,
        id:2,
        creator_id: 1,
        title: "Snippet 2",
        code: "Some code for Snippet 2",
        description: "A description for Snippet 2"
    },
    2: {
        access: true,
        id:3,
        creator_id: 1,
        title: "Snippet 3",
        code: "Some code for Snippet 3",
        description: "A description for Snippet 3"
    },
    3: {
        access: true,
        id:4,
        creator_id: 1,
        title: "Snippet 4",
        code: "Some code for Snippet 4",
        description: "A description for Snippet 4"
    }
};

layoutApp.controller('HeaderCtrl', ['$scope', 'snippetService',
                            function($scope,   snippetService) {
    $scope.HeaderCtrlScope = "HeaderCtrlScope";
    $scope.searchSubmit = function() {
        console.log($scope.searchString);
        var searchAccess = 'public',
            results = snippetResults;

        $scope.$emit('updateSearchString', $scope.searchString);
        $scope.$emit('updateSnippetsEvent', results);
        $scope.searchString = "";
        snippetService.snippets = results;
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
})
