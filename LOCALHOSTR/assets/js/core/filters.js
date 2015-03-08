'use strict';

app

.filter('arrayToString', [function() {
  return function(items, separator) {
    var str = '';
    if (typeof items === 'object') {
      str = items.join(separator);
    }
    return str;
  };
}])

.filter('stringToArray', [function() {
  return function(str, separator) {
    var items = [];
    if (typeof str === 'string') {
      items = str.split(separator);
    }
    return items;
  };
}])

.filter('objectKeys', [function() {
  return function(items) {
    var keys = [];
    for (var key in items) {
      if (items.hasOwnProperty(key)) {
        keys.push(key);
      }
    }
    return keys;
  };
}])

.filter('objectValues', [function() {
  return function(items) {
    var values = [];
    for (var key in items) {
      if (items.hasOwnProperty(key)) {
        values.push(items[key]);
      }
    }
    return values;
  };
}])

.filter('readableFileSize', [function() {
  return function(bytes) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) {
      return '0 Bytes';
    }
    var value = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, value), 2) + ' ' + sizes[value];
  };
}])

;
