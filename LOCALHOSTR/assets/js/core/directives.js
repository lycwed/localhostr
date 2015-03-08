'use strict';

app

.directive('inputTagger', [
  function() {
    return {
      require: '^model',
      restrict: 'E',
      scope: {
        placeholder: '@',
        collection: '=',
        model: '@collection'
      },
      transclude: true,
      templateUrl: APP_FOLDER + '/directives/input-tagger.html',
      controller: function($scope) {

        $scope.isEmpty = function() {
          return (! angular.isDefined($scope.collection) || $scope.collection.length === 0);
        };

        $scope.deleteTag = function($index) {
          $scope.collection.splice($index, 1);
        };

        $scope.addTag = function() {
          if ($scope.tag !== undefined && $scope.tag !== '') {
            $scope.collection.push($scope.tag);
            delete $scope.tag;
          }
        };
      }
    };
  }
])

.directive('searchResults', [
  function() {
    return {
      require: ['^model', '^translate'],
      restrict: 'E',
      scope: {
        path: '=',
        loading: '=',
        collection: '='
      },
      transclude: true,
      templateUrl: APP_FOLDER + '/directives/search-results.html',
      controller: ['$scope', '$state', function ($scope, $state) {
        $scope.open = function(item) {
          var itemPath = decodeURIComponent(item.path);
          $state.transitionTo('app.projects', { 'path': itemPath }, { location: true, inherite: true, notify: false });
          $scope.$emit('change:path', itemPath);
        };
      }]
    };
  }
])

.directive('messagesHandler', [
  function() {
    return {
      restrict: 'E',
      transclude: true,
      scope: {
        fullscreen: '=',
        errorsMessages: '=errors',
        successMessages: '=success',
      },
      templateUrl: APP_FOLDER + '/directives/messages-handler.html',
      link: function($scope) {
        var checkMessages = function(type) {
          if (Object.keys($scope.messages).length > 0) {
            $scope.hasMessages = true;
          } else {
            $scope.hasMessages = false;
            $scope[type + 'Messages'] = {};
          }
        };

        $scope.isError = function() {
          return $scope.errorsMessages !== undefined;
        };

        $scope.isSuccess = function() {
          return $scope.successMessages !== undefined;
        };

        $scope.isFullScreen = function() {
          return $scope.fullscreen;
        };

        $scope.hasMessages = false;
        $scope.messages = {};

        $scope.$watchCollection('errorsMessages', function(value) {
          if (value !== undefined) {
            $scope.messages = value;
            checkMessages('errors');
          }
        });

        $scope.$watchCollection('successMessages', function(value) {
          if (value !== undefined) {
            $scope.messages = value;
            checkMessages('success');
            var container = document.querySelector('body');
            angular.element(container).css({scrollTop: '0px'});
          }
        });
      }
    };
  }
])

.directive('sendByEmail', [
  function() {
    return {
      restrict: 'E',
      scope: {
        text: '@',
        title: '@',
        subject: '@',
        body: '@',
      },
      transclude: true,
      templateUrl: APP_FOLDER + '/directives/send-by-email.html',
      controller: ['$scope', '$window', function ($scope, $window) {
        $scope.send = function() {
          var email = prompt($scope.title);
          if (email !== '' && email !== null) {
            $window.location = "mailto:" + email + "?subject=" + encodeURIComponent($scope.subject) + "&body=" + encodeURIComponent($scope.body);
          }
        }
      }]
    };
  }
])

.directive('requireData', [
  function() {
    return function($scope, $element, $attr) {
      var name = $attr.requireData;
      var input = angular.element($element[0].children);
      $scope.$watch('$root.errors.' + name, function(value) {
        if (value !== undefined) {
          input.bind('focus', function() {
            angular.element($element).removeClass('error');
          });
          input.bind('blur', function() {
            if (input.val() === '') {
              angular.element($element).addClass('error');
            } else {
              delete $scope.$parent.errors[name];
              $scope.$apply();
            }
          });
          $element.addClass('error');
        } else {
          $element.removeClass('error');
        }
      });
    };
  }
])

.directive('draggable', ['$document',
  function($document) {
    return function($scope, $element) {
      var startX = 0, startY = 0, x = 0, y = 0;

      $element.css({
       position: 'relative',
       border: '1px solid red',
       backgroundColor: 'lightgrey',
       cursor: 'pointer'
      });

      $element.on('mousedown', function(event) {
        // Prevent default dragging of selected content
        event.preventDefault();
        startX = event.pageX - x;
        startY = event.pageY - y;
        $document.on('mousemove', mousemove);
        $document.on('mouseup', mouseup);
      });

      function mousemove(event) {
        y = event.pageY - startY;
        x = event.pageX - startX;
        $element.css({
          top: y + 'px',
          left:  x + 'px'
        });
      }

      function mouseup() {
        $document.off('mousemove', mousemove);
        $document.off('mouseup', mouseup);
      }
    };
  }
])

;
