angular.module('snippetLibrary', [])

.service('snippetLibraryService', [function() {
    var snippets = [],
        topics = [],
        snippetCounters = {personal_count:0, public_count:0};

    var setTopics = function(topicList, scope) {
        topics = topicList;
        scope.$emit('updateTopicsEvent');
    };
    var addTopic = function(newTopic, scope) {
        topics.push(newTopic);
        scope.$emit('updateTopicsEvent');
    };
    var editTopic = function(editedTopic, scope) {
        for (topic in topics) {
            if (topics[topic].id === editedTopic.id) {
                topics[topic].name = editedTopic.name;
                break;
            }
        }
        scope.$emit('updateTopicsEvent');
    };
    var deleteTopic = function(deletedTopic, scope) {
        topics = topics.filter(function(e) {return (e.id != Number(deletedTopic.id))});
        updateTopicCount("General", deletedTopic.new_general_snippets);
        scope.$emit('updateTopicsEvent');
    };

    var setSnippets = function(snippetList, scope) {
        snippets = snippetList;
        scope.$emit('updateSnippetsEvent');
    };
    var addSnippet = function(snippet, scope) {
        snippets.unshift(snippet);
        updateTopicCount(snippet.topic, 1);
        scope.$emit('updateSnippetsEvent');
    };
    var editSnippet = function(snippet, scope) {
        scope.$emit('updateSnippetsEvent');
    };
    var deleteSnippet = function(deletedSnippet, scope) {
        snippets = snippets.filter(function(e) {return (e.id != Number(deletedSnippet.id))});
        updateTopicCount(deletedSnippet.topic, -1);
        scope.$emit('updateSnippetsEvent');
    };
    function updateTopicCount(topicName, count) {
        for (topic in topics) {
            t = topics[topic];
            if (t.name === topicName) {
                t.count += count;
                break;
            }
        }
    }
    var setSnippetCounters = function(counts) {
        snippetCounters = counts;
    };

    return {
        // Getters and setters
        get snippets()                { return snippets; },
        get topics()                  { return topics; },
        get snippetCounters()         { return snippetCounters; },
        set snippetCounters(counters) { setSnippetCounters(counters); },

        // Public functions
        setTopics:setTopics,
        addTopic:addTopic,
        editTopic:editTopic,
        deleteTopic:deleteTopic,
        setSnippets:setSnippets,
        addSnippet:addSnippet,
        editSnippet:editSnippet,
        deleteSnippet:deleteSnippet
    }
}])


.factory('snippetUser', ['$http', '$q', 'snippetLibraryService',
                 function($http,   $q,   snippetService) {
    return function() {
        var defer = $q.defer(),
            path = "/topics";

        $http.get(path)
        .success(function(reply) {
            snippetService.snippetCounters = reply.snippet_counts;
            delete reply.snippet_counts;
            defer.resolve(angular.fromJson(reply.topics));
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


.factory('createSnippet', ['$http', '$q', 'snippetLibraryService',
                   function($http,   $q,   snippetService) {
    return function(snippet, topic) {
        var defer = $q.defer(),
            path = "/snippets/" + topic,
            data = angular.toJson(snippet);

        $http.post(path, data)
            .success(function(reply) {
                snippetService.snippetCounters = reply.snippet_counts;
                delete reply.snippet_counts;
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


.factory('editSnippet', ['$http', '$q', 'snippetLibraryService',
                 function($http,   $q,   snippetService) {
    return function(snippet) {
        var defer = $q.defer(),
            path = "/snippets/" + snippet.id,
            data = angular.toJson(snippet);

        $http.put(path, data)
            .success(function(reply) {
                snippetService.snippetCounters = reply.snippet_counts;
                delete reply.snippet_counts;
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


.factory('deleteSnippet', ['$http', '$q', 'snippetLibraryService',
                   function($http,   $q,   snippetService ) {
    return function(snippet) {
        var defer = $q.defer(),
            path = "/snippets/" + snippet.id;

        $http.delete(path)
            .success(function(reply) {
                snippetService.snippetCounters = reply.snippet_counts;
                delete reply.snippet_counts;
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

