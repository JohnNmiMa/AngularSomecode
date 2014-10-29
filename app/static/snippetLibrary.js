angular.module('snippetLibrary', [])

//.constant('API_PREFIX', 'http://api.geonames.org')

.service('snippetService', function() {
    var snippets = {},
        topics = {};

    var setTopics = function(topicList, scope) {
        topics = topicList;
        scope.$emit('updateTopicsEvent');
    };
    var setSnippets = function(snippetList, scope) {
        snippets = snippetList;
        scope.$emit('updateSnippetsEvent');
    };

    return {
        // Getters and setters
        get snippets()      { return snippets; },
        get topics()        { return topics; },

        // Public functions
        setTopics:setTopics,
        setSnippets:setSnippets
    }
})


.factory('snippetUser', ['$http', '$q',
                   function($http,   $q) {
    return function() {
        var defer = $q.defer(),
            path = "/topics";

        $http.get(path)
        .success(function(reply) {
            defer.resolve(reply);
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


.factory('snippetSearch', ['$http', '$q',
                   function($http,   $q) {
    return function(searchAccess, searchStr) {
        var defer = $q.defer(),
            path = "/snippets/search/" + searchAccess,
            config = {
                params: {
                    search: searchStr
                }
            }

        $http.get(path, config)
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
}])


.factory('displayTopicSnippets', ['$http', '$q',
                   function($http,   $q) {
    return function(topicName) {
        var defer = $q.defer(),
            path = "/snippets/" + topicName;

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

