'use strict';

app

.factory('WebService', ['$http', '$q', 'API', function ($http, $q, API) {
  var _request = function (method, service, options, data, url) {
    var deferred = $q.defer();

    options = (options !== undefined) ? options : {};
    options.service = service;

    var query = '';
    var queries = [];
    for (var i in options) {
      if (options.hasOwnProperty(i)) {
        queries.push(encodeURIComponent(i) + '=' + encodeURIComponent(options[i]));
      }
    }

    if (queries.length > 0) {
      query = '?' + queries.join('&');
    }

    return $http({
      'method': method,
      'url': url + query,
      'data': data
    })
    .success(function (data) {
      deferred.resolve(data);
    })
    .error(function (data) {
      deferred.reject(data);
    });
  };
  var _service = {
    post: function(service, data) {
      return _request('POST', service, {}, data, API.url);
    },
    get: function(service, options) {
      return _request('GET', service, options, {}, API.url);
    },
    put: function(service, data, options) {
      return _request('PUT', service, options, data, API.url);
    },
    delete: function(service, data) {
      return _request('DELETE', service, {}, data, API.url);
    },
  };
  return _service;
}])

.factory('AppResource', ['WebService', function (WebService) {
  return {
    get: function(service, options) {
      return WebService.get(service, options);
    },
    update: function(service, data) {
      return WebService.put(service, data);
    },
    search: function(value) {
      return WebService.put('search', {
        value: value
      });
    }
  };
}])

;
