'use strict';

var app = angular.module('localhostr', ['ui.router', 'ngMaterial', 'pascalprecht.translate']);

app

.config(['$stateProvider', '$urlRouterProvider',
  function ($stateProvider, $urlRouterProvider) {

    $urlRouterProvider
      .when('', '/projects')
      .when('/projects', '/projects/all')
      .otherwise('/projects');

    $stateProvider
      .state('projects', {
        url: '/projects/:path',
        views: {
          'interface': {
            templateUrl: 'templates/app/projects.html',
            controller: 'ProjectsCtrl'
          },
          'options@projects': {
            templateUrl: 'templates/app/modules/options.html',
            controller: 'OptionsCtrl'
          },
          'breadcrumb@projects': {
            templateUrl: 'templates/app/modules/breadcrumb.html',
            controller: 'BreadcrumbCtrl'
          }
        }
      })
      .state('installer', {
        url: '/installer',
        resolve: {
          Installer: function(AppResource) {
            return AppResource.get('installer');
          },
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

    $translateProvider.preferredLanguage('fr_FR');

    // $translateProvider.uses('fr_FR');
  }
])

;
