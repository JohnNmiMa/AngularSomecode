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
    var editTopic = function(editedTopic, scope) {
        for (topic in topics.topics) {
            if (topics.topics[topic].id === editedTopic.id) {
                topics.topics[topic].name = editedTopic.name;
                break;
            }
        }
        scope.$emit('updateTopicsEvent');
    };
    var deleteTopic = function(deletedTopicId, scope) {
        topics.topics = topics.topics.filter(function(e) {return (e.id != Number(deletedTopicId))});
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
        editTopic:editTopic,
        deleteTopic:deleteTopic,
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


.factory('createTopic', ['$http', '$q',
                 function($http,   $q) {
    return function(topicName) {
        var defer = $q.defer(),
            path = "/topic/" + topicName;

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

        return defer.promise;
    }
}])


.factory('editTopic', ['$http', '$q',
                 function($http,   $q) {
    return function(topicId, topicName) {
        var defer = $q.defer(),
            path = "/topic/" + topicId,
            data = topicName;

        $http.put(path, data)
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


.factory('deleteTopic', ['$http', '$q',
                 function($http,   $q) {
    return function(topicId) {
        var defer = $q.defer(),
            path = "/topic/" + topicId;

        $http.delete(path)
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

