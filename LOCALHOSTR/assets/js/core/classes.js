'use strict';

app

.factory('FormChecker', ['$filter', function ($filter) {
  var _form,
      _errors,
      _values,
      _isValid;

  var _verify = function(fieldValues, submitValues, values) {
    for (var name in fieldValues) {
      if (fieldValues.hasOwnProperty(name) && submitValues.hasOwnProperty(name)) {
        if (! angular.isDefined(fieldValues[name].value)) {
          values[name] = {};
          _verify(fieldValues[name], submitValues[name], values[name]);
          continue;

        } else if (fieldValues[name].required === true) {
          var hasError = false;

          if (typeof fieldValues[name].value === 'object') {
            if (fieldValues[name].value.toString() === submitValues[name].toString()) {
              hasError = true;
            }

          } else if (fieldValues[name].value === submitValues[name]) {
            hasError = true;
          }

          if (hasError) {
            _isValid = false;
            var error = {
              content: 'IS_REQUIRED',
              options: {}
            };
            error = (! angular.isDefined(fieldValues[name].error)) ? error : fieldValues[name].error;
            error.options.label = $filter('translate')(fieldValues[name].label);
            _errors[name] = error;
          }
        }

        values[name] = submitValues[name];
      }
    }
  };

  return {
    setData: function(scopeData, fieldValues, storedData) {
      for (var name in fieldValues) {
        if (fieldValues.hasOwnProperty(name) && storedData.hasOwnProperty(name)) {
          scopeData[name] = storedData[name];
        }
      }
    },
    validate: function(fieldValues, submitValues) {
      _errors = {};
      _values = {};
      _isValid = true;
      _verify(fieldValues, submitValues, _values, _errors);

      _form = {
        errors: _errors,
        values: _values,
        isValid: _isValid,
      };

      return _form;
    }
  };
}])

;
