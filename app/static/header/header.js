someCodeApp.controller('HeaderCtrl', ['$scope', 'userSession', 'oauthLogin',
                              function($scope,   userSession,   oauthLogin) {
    $scope.isSignedIn = userSession.loggedIn = false;
    $scope.$watch(function() {
        return userSession.loggedIn;
    },
    function(newVal, oldVal) {
        $scope.isSignedIn = newVal;
        $scope.username = userSession.userName;
        if ($scope.isSignedIn == true) {
            $scope.hideSignin();
        }
    });

    $scope.showSignin = function() {
        $('.signinModal').modal('show');
    };
    $scope.hideSignin = function() {
        $('.signinModal').modal('hide');
    };

    $scope.login = function(provider) {
        if (provider == 'facebook') {
            oauthLogin(provider).then(function(response) {
                userSession.loggedIn = true;
                userSession.userName = response.data.username;
            });
        }
    }
}])

.directive('snippetSearch', function() {
    return {
        restrict: 'E',
        templateUrl: 'static/header/snippetSearch.html',
        transclude: false,
        controller: function($scope, $element, $attrs) {
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
