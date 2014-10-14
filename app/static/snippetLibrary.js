angular.module('snippetLibrary', [])

//.constant('API_PREFIX', 'http://api.geonames.org')

.factory('snippetSignin', ['$http', '$q',
                   function($http,   $q) {
    return function(oauthProvider) {
        var defer = $q.defer(),
            config = {
                method: 'GET',
                withCredentials: true,
                url: "/signin/" + oauthProvider,
                headers: {
                    'Access-Control-Expose-Headers': 'Origin',
                    'Origin':'http://jmsomecode.herokuapp.com:5000'
                }
            }
            //path = "/signin/" + oauthProvider + "?callback=JSON_CALLBACK";

        //$http.jsonp(path)
        //$http.get(path, {withCredentials: true})
        $http(config)
        .success(function(result) {
            defer.resolve(result);
        })
        .error(function(data, status, headers, config) {
            var error = {
                html : data,
                statusCode : status,
                url : config.url
            };
            defer.reject(error);
        });

        return defer.promise;
    }
}])

.factory('snippetLogout', ['$http', '$q',
                   function($http,   $q) {
    return function() {
        var defer = $q.defer(),
            path = "/logout";

        $http.get(path)
        .success(function(data) {
            defer.resolve(data);
        })
        .error(function(data, status, headers, config) {
            var error = {
                html : data,
                statusCode : status,
                url : config.url
            };
            defer.reject(error);
        });

        return defer.promise;
    }
}]);

