angular.module('snippetLibrary', [])

//.constant('API_PREFIX', 'http://api.geonames.org')

.service('snippetService', function() {
    var snippets = {},
        topics = [];

    var setTopics = function(topicList, scope) {
        topics = topicList;
        scope.$emit('updateTopicsEvent');
    };
    var addTopic = function(newTopic, scope) {
        topics.topics.push(newTopic);
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
        addTopic:addTopic,
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
            defer.resolve(angular.fromJson(reply));
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


.factory('createTopic', ['$http', '$q', 'snippetService',
                 function($http,   $q,   snippetService) {
    return function(topicName) {
        var defer = $q.defer(),
            path = "/topic/" + topicName;

        if (!isDuplicateTopic(topicName)) {
            $http.post(path)
            .success(function(reply) {
                defer.resolve(angular.fromJson(reply));
            })
            .error(function(data, status, headers, config) {
                var error = {
                    html : data,
                    statusCode : status,
                    url : config.url
                };
                defer.reject(error);
            });
        } else {
            defer.reject({html:"<p>Error: Duplicate Topic Name</p>", statusCode:400, url:path});
        }

        return defer.promise;
    };

    function isDuplicateTopic(topicName) {
        var topics = snippetService.topics.topics;
        for (var topic in topics) {
            if (topicName.toLowerCase() === topics[topic].name.toLowerCase()) {
                return true;
            }
        }
        return false;
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

