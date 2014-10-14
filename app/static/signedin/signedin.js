viewsModule.controller('SignedinCtrl', ['$scope', 'userSession', 'userName',
                                function($scope,   userSession,   userName) {
//    console.log("OAuth Provider = " + oauthProvider);
    $scope.SignedinCtrlModel = true;
    userSession.loggedIn = true;
    userSession.userName = userName;
}]);
