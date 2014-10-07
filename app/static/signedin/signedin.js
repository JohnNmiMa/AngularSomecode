viewsModule.controller('SignedinCtrl', ['$scope', 'userSession', 'oauthProvider',
                                function($scope,   userSession,   oauthProvider) {
    console.log("OAuth Provider = " + oauthProvider);
    $scope.SignedinCtrlModel = true;
    userSession.loggedIn = true;
}]);
