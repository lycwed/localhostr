'use strict';

var app = angular.module('localhostr', ['ui.router', 'pascalprecht.translate']);

app

.config(['$stateProvider', '$urlRouterProvider',
  function ($stateProvider, $urlRouterProvider) {

    $urlRouterProvider
      .when('/app/projects/', '/app/projects/all')
      .otherwise('/app/projects/all');

    $stateProvider
      .state('app', {
        abstract: true,
        url: '/app',
        resolve: {
          Installer: function(AppResource) {
            return AppResource.get('installer');
          }
        },
        views: {
          'app': {
            templateUrl: 'templates/app.html',
            controller: 'ApplicationCtrl'
          }
        }
      })
      .state('app.projects', {
        url: '/projects/:path',
        views: {
          'interface': {
            templateUrl: 'templates/app/projects.html',
            controller: 'ProjectsCtrl'
          },
          'breadcrumb@app.projects': {
            templateUrl: 'templates/app/modules/breadcrumb.html',
          },
          'options@app.projects': {
            templateUrl: 'templates/app/modules/options.html',
          }
        }
      })
      .state('app.installer', {
        url: '/installer',
        resolve: {
          Form: function(FormChecker) {
            return FormChecker;
          }
        },
        views: {
          'interface': {
            templateUrl: 'templates/app/installer.html',
            controller: 'InstallerCtrl'
          }
        }
      })
      .state('phpinfo', {
        url: '/phpinfo',
        resolve: {
          PhpInfo: function(AppResource) {
            return AppResource.get('phpinfo');
          }
        },
        views: {
          'interface': {
            templateUrl: 'templates/app/phpinfo.html',
            controller: 'PhpInfoCtrl'
          }
        }
      })
      ;
  }
])

.config(['$translateProvider',
  function ($translateProvider) {
    $translateProvider.useStaticFilesLoader({
      'prefix': 'locales/',
      'suffix': '.json'
    });

    $translateProvider.preferredLanguage('en_US');
  }
])

;
