viewsModule.controller('SignedoutCtrl', ['$scope', 'userSession',
                                 function($scope,   userSession) {
    userSession.loggedIn = false;
}]);

