angular.module('appLibrary', [])

.constant('API_PREFIX', 'http://api.geonames.org')

.factory('appLibHello', ['$http', '$q', 'API_PREFIX',
            function($http,   $q,   API_PREFIX) {
    var data = ['Hello from appLibrary appLibHello'];
    return function() {
        var defer = $q.defer(),
            path = "/countryInfoJSON?username=jettagozoom";

        if (data.length == 0) {
            $http.get(API_PREFIX + path)
            .success(function(data) {
                defer.resolve(data);
            })
        } else {
            defer.resolve(data);
        }

        return defer.promise;
    }
}]);

