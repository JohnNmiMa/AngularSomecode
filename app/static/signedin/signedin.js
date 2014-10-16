viewsModule.controller('SignedinCtrl', ['$scope', 'userSession', 'userName',
                                function($scope,   userSession,   userName) {
    userSession.loggedIn = true;
    userSession.userName = userName;
}]);
