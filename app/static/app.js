var someCodeApp = angular.module('SomeCodeApp', ['someCodeViews', 'ngRoute', 'ui.bootstrap'])

.run(['$rootScope', '$location', '$route', '$timeout', function ($rootScope, $location, $route, $timeout) {
    $rootScope.$on('$routeChangeStart', function () {
        // Don't do loading animation if going home
        if ($location.$$path != "" && $location.$$path != "/") {
            $rootScope.isLoading=true;
        }
    });
    $rootScope.$on('$routeChangeSuccess', function () {
        $timeout(function () {
            $rootScope.isLoading=false;
        }, 500);
    });
    $rootScope.$on('updateTopicsEvent', function(event) {
        $rootScope.$broadcast('updateTopics');
    });
    $rootScope.$on('updateSearchString', function(event, searchStr) {
        $rootScope.$broadcast('topicOrSearchString', ('\"' + searchStr + '\" search'));
    });
    $rootScope.$on('updateTopicString', function(event, topicStr) {
        $rootScope.$broadcast('topicOrSearchString', ('\"' + topicStr + '\" topic'));
    });
    $rootScope.$on('snippetLayoutChange', function(event, layout) {
        $rootScope.$broadcast('snippetLayout', layout);
    });
    $rootScope.$on('updateSnippetsEvent', function(event) {
        $rootScope.$broadcast('updateSnippets');
    });
}])

.config(['$locationProvider', '$routeProvider', function ($locationProvider, $routeProvider) {
    $locationProvider.hashPrefix('!');
    $routeProvider.otherwise({
        redirectTo: '/'
    });
}])

.controller('SomeCodeCtrl', ['$scope', '$location', 'oauthLibrary', 'snippetLogout',
                     function($scope,   $location,   oauth,          snippetLogout) {
    $scope.SomeCodeCtrlScope = "SomeCodeCtrlScope";
    $scope.$watch(function() {
        return $scope.isAuthenticated();
    },
    function(newVal, oldVal) {
        if (newVal) {
            $scope.username = oauth.username();
            $scope.hideSignin();
        }
    });

    $scope.showSignin = function() {
        $('.signinModal').modal('show');
    };

    $scope.hideSignin = function() {
        $('.signinModal').modal('hide');
    };

    $scope.authenticate = function(provider) {
        oauth.authenticate(provider).then(function(response) {
            $location.path('/user');
        });
    };

    $scope.isAuthenticated = function(provider) {
        return oauth.isAuthenticated();
    };

    $scope.logout = function() {
        snippetLogout().then(function(response) {
            //oauth.logout();
        }, function(error) {
            console.log(error.url + " failed with status error " + error.statusCode);
        })
            .finally(function() {
                oauth.logout();
                $location.path('/');
            });
    };
}])


.directive('snippetBlockSizer', ['oauthLibrary', 'topicService',
                         function(oauth,          topicService) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            // The topic panel doesn't exist when logged out
            var hasTopicPanel = oauth.isAuthenticated();

            $(window).on('resize', function() {
                scope.$apply(function () {
                    console.log("Here in the topicPanel sizeit");
                    updateSnippetBlockComponentSizes();
                })
            });

            function  updateSnippetBlockComponentSizes() {
                var snippetBlockWidth = parseFloat($('#snippetBlock').width()),
                    topicPanelWidth = parseFloat($('#topicPanel').css("width"));
                    snippetPanelWidth = snippetBlockWidth - topicPanelWidth,
                    topicPanelWidthPercent = topicPanelWidth / snippetBlockWidth;

                /*
                console.log("snippetBlockWidth = " + snippetBlockWidth +
                            ": topicPanelWidth = " + topicPanelWidth +
                            ": snippetPanelWidth = " + snippetPanelWidth);
                */

                setComponentsWidth(topicPanelWidth + 'px', snippetPanelWidth + 'px');
                //setComponentsWidth(topicPanelWidth + 'px', ((1 - topicPanelWidthPercent) * 100) + '%');
            }

            function setComponentsWidth(topicPanelWidth, snippetPanelWidth) {
                if(hasTopicPanel) {
                    // Adjust the topicPanel's width
                    scope.topicPanelStyle = {'width': topicPanelWidth};
                    topicService.topicPanelWidth = topicPanelWidth;

                    // Adjust the snippetPanel's width
                    if (topicService.isVisible) {
                        scope.snippetPanelStyle = {'width': snippetPanelWidth};
                    }
                    topicService.snippetPanelWidth = snippetPanelWidth;
                } else {
                    // There is no topicPanel, so make the snippetPanel 100% wide
                    scope.snippetPanelStyle = {'width': "100%"};
                }

            }
            setComponentsWidth(topicService.topicPanelWidth, topicService.snippetPanelWidth);

            function resizeOnScrollbarHack() {
                // Demo: http://jsfiddle.net/pFaSx/

                // Create an invisible iframe
                var iframe = document.createElement('iframe');
                iframe.id = "hacky-scrollbar-resize-listener";
                iframe.style.cssText = 'height: 0; background-color: transparent; margin: 0; padding: 0; overflow: hidden; border-width: 0; position: absolute; width: 100%;';

                // Register our event when the iframe loads
                iframe.onload = function() {
                    // The trick here is that because this iframe has 100% width
                    // it should fire a window resize event when anything causes it to
                    // resize (even scrollbars on the outer document)
                    iframe.contentWindow.addEventListener('resize', function() {
                        try {
                            console.log("In iframe resizer!");
                            //var evt = document.createEvent('UIEvents');
                            //evt.initUIEvent('resize', true, false, window, 0);
                            //window.dispatchEvent(evt);
                            updateSnippetBlockComponentSizes();
                        } catch(e) {}
                    });
                };

                // Stick the iframe somewhere out of the way
                document.body.appendChild(iframe);
            }
            //resizeOnScrollbarHack();
        }
    }
}]);
