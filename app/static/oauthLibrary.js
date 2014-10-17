angular.module('oauthLibrary', [])

.constant('oauthLibrary.config', {
    appUri: 'http://somecode.herokuapp.com:5000/',
    providers: {
        facebook: {
            authorizationEndpoint: 'https://www.facebook.com/dialog/oauth',
            redirectUri: '/signin/facebook_authorized',
            clientId: '369725386526622',
            popupOptions: { width: 481, height: 269 }
        },
        google: {
            authorizationEndpoint: 'https://accounts.google.com/o/oauth2/auth',
            redirectUri: '/signin/google_authorized',
            clientId: '759451918691-6hb8d2up7algbjirfni465bcn743cjjb.apps.googleusercontent.com',
            scope: ['profile', 'email'],
            scopePrefix: 'openid',
            scopeDelimiter: ' ',
            requiredUrlParams: ['scope'],
            optionalUrlParams: ['display'],
            display: 'popup',
            type: '2.0',
            popupOptions: { width: 452, height: 633 }
        },
        twitter: {
            redirectUri: '/signin/twitter_authorized',
            clientId: '',
            type: '1.0',
            popupOptions: { width: 495, height: 645 }
        }
    }
})

.factory('oauthLogin', [ 'oauthLibrary.config', 'oauthLibrary.tokenService', 'oauthLibrary.popup', '$http', '$q',
                 function(oauthconfig,           tokenService,                popup,                $http,   $q) {

    return function(provider) {
        console.log("At oauthLibrary.login() - do OAuth login for " + provider);
        var defer = $q.defer(),
            providerConfig = oauthconfig.providers[provider],
            url = buildUrl(provider);

        popup(url, providerConfig.popupOptions)
        .then(function(oauthData) {
            exchangeForToken(oauthData, {})
            .then(function(response) {
                tokenService.saveToken(response, defer, false);
                //defer.resolve(response);
            })
            .then(null, function(error) {
                defer.reject(error);
            });
        })
        .then(null, function(error) {
            defer.reject(error);
        });
        console.log("  the url is " + url);

        function exchangeForToken(oauthData, userData) {
            var data = angular.extend({}, userData, {
                code: oauthData.code,
                clientId: providerConfig.clientId,
                redirectUri: oauthconfig.appUri
            });
            return $http.post(providerConfig.redirectUri, data);
        }

        function buildUrl(provider) {
            var providerConfig = oauthconfig.providers[provider],
                qs = "";

            if (provider === 'facebook') {
                qs =  "response_type=code";
                qs += "&client_id=" + providerConfig.clientId;
                qs += "&redirect_uri=" + encodeURIComponent(oauthconfig.appUri);
                qs += "&display=popup&scope=email"
            } else if (provider === 'google') {

            } else if (provider === 'facebook') {

            }
            return [providerConfig.authorizationEndpoint, qs].join('?');
        }

        return defer.promise;
    };
}])


.factory('oauthLibrary.tokenService', ['$q', '$window', '$location', 'oauthLibrary.config',
                               function($q,   $window,   $location,   config) {
    var tokenService = {};

    tokenService.saveToken = function(response, deferred, isLinking) {
        var token = response.data[config.tokenName],
            tokenName = config.tokenPrefix ? config.tokenPrefix + '_' + config.tokenName : config.tokenName;

        if (!token) {
            throw new Error('Expecting a token named "' + config.tokenName + '" but instead got: ' + JSON.stringify(response.data));
        }

        $window.localStorage[tokenName] = token;
        if (config.loginRedirect && !isLinking) {
            $location.path(config.loginRedirect);
        }
        deferred.resolve(response);
    };

    tokenService.isAuthenticated = function() {
        var tokenName = config.tokenPrefix ? config.tokenPrefix + '_' + config.tokenName : config.tokenName,
            token = $window.localStorage[tokenName];

        if (token) {
            var base64Url = token.split('.')[1];
            var base64 = base64Url.replace('-', '+').replace('_', '/');
            var exp = JSON.parse($window.atob(base64)).exp;
            return Math.round(new Date().getTime() / 1000) <= exp;
        }

        return false;
    };

    tokenService.logout = function() {
        var deferred = $q.defer(),
            tokenName = config.tokenPrefix ? config.tokenPrefix + '_' + config.tokenName : config.tokenName;

        delete $window.localStorage[tokenName];
        if (config.logoutRedirect) {
            $location.path(config.logoutRedirect);
        }
        deferred.resolve();

        return deferred.promise;
    };

    function intercept (url) {
        if (url.indexOf($window.location.origin) === 0) {
            return true;
        }
        if (url.indexOf('http://') !== 0 && url.indexOf('https://') !== 0) {
            return true;
        }
        return false;
    }

    tokenService.requestFilter = config.requestFilter = (config.requestFilter || function(httpConfig) {
        return intercept(httpConfig.url);
    });

    tokenService.responseFilter = config.responseFilter = (config.responseFilter || function(response) {
        return intercept(response.config.url);
    });

    return tokenService;
}])

.factory('oauthLibrary.popup', ['$q', '$interval', '$window', '$location', 'oauthLibrary.utils',
    function($q,   $interval,   $window,   $location,   utils) {

    return function(url, options) {
        var deferred = $q.defer(),
            polling = null,
            optionsString = stringifyOptions(prepareOptions(options || {})),
            popupWindow = window.open(url, '_blank', optionsString);

        if (popupWindow && popupWindow.focus) {
            popupWindow.focus();
        }
        pollPopup(deferred);

        function pollPopup(deferred) {
            polling = $interval(function() {
                try {
                    if (popupWindow.document.domain === document.domain && popupWindow.location.search) {
                        var params = popupWindow.location.search.substring(1).replace(/\/$/, '');
                        var qs = Object.keys($location.search()).length ? $location.search() : utils.parseQueryString(params);

                        if (qs.oauth_token && qs.oauth_verifier) {
                            deferred.resolve({ oauth_token: qs.oauth_token, oauth_verifier: qs.oauth_verifier });
                        } else if (qs.code) {
                            deferred.resolve({ code: qs.code });
                        } else if (qs.error) {
                            deferred.reject({ error: qs.error });
                        }
                        popupWindow.close();
                        $interval.cancel(polling);
                    }
                } catch (error) {}

                if (popupWindow.closed) {
                    $interval.cancel(polling);
                    deferred.reject({ data: 'Authorization Failed' });
                }
            }, 35);
        }

        function prepareOptions(options) {
            var width = options.width || 500;
            var height = options.height || 500;
            return angular.extend({
                width: width,
                height: height,
                left: $window.screenX + (($window.outerWidth - width) / 2),
                top: $window.screenY + (($window.outerHeight - height) / 2.5)
            }, options);
        }

        function stringifyOptions(options) {
            var parts = [];
            angular.forEach(options, function(value, key) {
                parts.push(key + '=' + value);
            });
            return parts.join(',');
        }

        return deferred.promise;
    };
}])

.service('oauthLibrary.utils', function() {
    this.parseQueryString = function(keyValue) {
        var obj = {}, key, value;
        angular.forEach((keyValue || '').split('&'), function(keyValue) {
            if (keyValue) {
                value = keyValue.split('=');
                key = decodeURIComponent(value[0]);
                obj[key] = angular.isDefined(value[1]) ? decodeURIComponent(value[1]) : true;
            }
        });
        return obj;
    };
});
