viewsModule.controller('SignedoutCtrl', ['$scope', 'userSession',
                                 function($scope,   userSession) {
//    console.log("Goodby " + data.user + ", come back again soon!");
    userSession.loggedIn = false;
}]);

