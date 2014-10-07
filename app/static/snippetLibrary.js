angular.module('snippetLibrary', [])

//.constant('API_PREFIX', 'http://api.geonames.org')

.factory('snippetLogout', ['$http', '$q',
                   function($http,   $q) {
    return function() {
       var defer = $q.defer(),
           path = "/logout";

       $http.get(path)
       .success(function(data) {
           defer.resolve(data);
       });

       return defer.promise;
    }
}]);

