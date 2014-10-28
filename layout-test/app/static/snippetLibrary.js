angular.module('snippetLibrary', [])

//.constant('API_PREFIX', 'http://api.geonames.org')

.service('snippetService', function() {
    var snippets = {};

    return {
        // Getters and setters
        get snippets()      { return snippets; },
        set snippets(snips) { snippets = snips; }
    }
});

