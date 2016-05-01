'use strict';

app.controller('ApplicationCtrl', ['$scope', '$translate', '$state', 'Installer', 'APP',
  function ($scope, $translate, $state, Installer, APP) {

    // $scope.$root.$on('$stateNotFound', function(event, unfoundState, fromState, fromParams){
    //   console.log(event, unfoundState, fromState, fromParams);
    // });

    // $scope.$root.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error){
    //   console.log(event, toState, toParams, fromState, fromParams, error);
    // });

    // $scope.$root.$on('$viewContentLoading', function(event, viewConfig){
    //   console.log(event, viewConfig);
    // });

    // $scope.$root.$on('viewContentLoaded', function(){
    //   console.log('view loaded');
    // });

    $scope.data = {
      ipAddr: APP.ipAddr
    };

    if (Installer.data.status === 'success') {
      var language = Installer.data.response.app.language;
      $translate.use(language);
    }
  }
]);

app.controller('InstallerCtrl', ['$scope', '$rootScope', '$state', 'Installer', 'Form', 'AppResource',
    function ($scope, $rootScope, $state, Installer, Form, AppResource) {
        $scope.data = {};
        $scope.fields = {
            app: {
                language: { required: false, label:'USER_LANGUAGE', value: "" },
                ignores: { required: false, label:'PATH_TO_IGNORE', value: [] }
            },
            research: {
                chars: { required: true, label:'DISPLAY_MIN_CHARS', value: 1 },
                time: { required: true, label:'DISPLAY_MIN_TIME', value: 400 }
            },
            menu: {
                php_my_admin: {
                    href: { required: false, label:'PHP_MY_ADMIN_LINK', value: "" }
                }
            }
        };

        $scope.cancel = function() {
            $state.go('projects');
        };

        $scope.isInstalled = function() {
            return Installer.data.response.app.installed;
        };

        $scope.submit = function() {
            var form = Form.validate($scope.fields, $scope.data);
            form.values.languages = $scope.data.languages;
            if (form.isValid) {
                AppResource.update('installer', form.values).then(function() {
                    $state.reload();
                    $rootScope.success = [
                        {
                            content: 'FORM_UPDATE_SUCCESS',
                            options: {}
                        }
                    ];
                }, function() {
                    $rootScope.errors = [
                        {
                            content: 'FORM_UPDATE_FAILED',
                            options: {}
                        }
                    ];
                });
            } else {
                $rootScope.errors = form.errors;
            }
        };

        if (Installer.status === 200) {
            $scope.data.languages = Installer.data.response.languages;
            Form.setData($scope.data, $scope.fields, Installer.data.response);
        }
    }
]);

app.controller('PhpInfoCtrl', ['$scope', '$timeout', 'Installer',
    function ($scope, $timeout, Installer) {
        $scope.data = {};
        $scope.stylesUrl = 'assets/css/php-infos.css';

        var installer = Installer.data.response;
        if (installer && installer.app) {
            $scope.data.phpInfoUrl = installer.app.php_infos_url;

            $timeout(function() {
                $scope.show = true;
            }, 400);
        }
    }
]);

app.controller('ProjectsCtrl', ['$scope', '$window', '$state', '$timeout', 'AppResource', 'Installer',
    function ($scope, $window, $state, $timeout, AppResource, Installer) {
        var timer = null;
        var path = ($state.params.path.indexOf('undefined') >= 0 || $state.params.path === 'all') ? '' : $state.params.path;
        var searching = false;
        var research = Installer.data.response.research;
        var results = [];
        var changePath = function(path) {
            $scope.togglePopover(null);

            if (path !== '') {
                $scope.loading.inProgress = true;
                var urls = [];
                var paths = path.split('/');
                var separator = encodeURIComponent('/');
                var realPaths = [];

                for (var i = 0; i < paths.length; i++) {
                    if (paths.hasOwnProperty(i) && paths[i] !== '') {
                        urls.push(paths[i]);
                        realPaths.push({
                            name: paths[i],
                            path: urls.join(separator)
                        });
                    }
                }
            }

            AppResource.get('projects', { path: path }).then(function(service) {
                var projects = service.data.response;
                if (projects.length > 0) {
                    $scope.data.breadcrumb = realPaths;
                    $scope.data.projects = projects;
                }
                window.scrollTo(0, document.querySelector('#breadcrumb').offsetTop - 20);
                $scope.loading.inProgress = false;
            });
        };

        $scope.popover = null;
        $scope.loading = {
            inProgress: true
        };
        $scope.data = {
            projects: [],
            research: {},
            options: Installer.data.response.menu,
            breadcrumb: [],
            path: path
        };

        $scope.isSearching = function() {
            return searching;
        };
        $scope.togglePopover = function(name) {
            $scope.popover = ($scope.popover !== name) ? name : null;
            if ($scope.popover) {
                $timeout(function() {
                    document.getElementById('inputSearch').focus();
                }, 500);
            } else {
                searching = false;
                $scope.data.search = '';
            }
        };
        $scope.isEmpty = function() {
            return ($scope.data.breadcrumb === undefined || $scope.data.breadcrumb.length === 0);
        };
        $scope.open = function(item) {
            var itemPath = decodeURIComponent(item.path);
            $state.transitionTo('app.projects', { 'path': itemPath }, { location: true, inherite: true, notify: false });
            $scope.$broadcast('change:path', itemPath);
        };

        $scope.$on('change:path', function(event, path) {
            changePath(path);
        });

        $scope.$watch('data.search', function(value) {
            $timeout.cancel(timer);
            if (value && value.length >= parseInt(research.chars)) {
                searching = true;
                $scope.data.research.results = [];
                $scope.data.research.results_nb = '...';
                $scope.loading.inProgress = true;

                timer = $timeout(function() {
                    var options = value.split(' ');
                    var params = {
                        'path': path,
                        'value': options[0],
                        'start': 0,
                        'case': 0,
                        'folders': 0,
                        'files': 0
                    };

                    if (options.length > 1) {

                        if (options.indexOf('-a') > -1) {
                            params.path = '';
                        }
                        if (options.indexOf('-s') > -1) {
                            params.start = 1;
                        }

                        if (options.indexOf('-i') > -1) {
                            params.case = 1;
                        }

                        if (options.indexOf('-f') > -1) {
                            params.files = 1;
                        }

                        if (options.indexOf('-d') > -1) {
                            params.folders = 1;
                        }
                    }

                    AppResource.get('search', params).then(function(service) {
                        $scope.loading.inProgress = false;
                        results = service.data.response;
                        $scope.data.research.results = angular.copy(results);
                        $scope.data.research.results_nb = service.data.response.length;
                        $scope.loading.inProgress = false;
                        return;
                    });
                }, parseInt(research.time));
            } else {
                searching = false;
                $scope.loading.inProgress = false;
                $scope.data.research.results = angular.copy(results);
            }
        });
        changePath(path);
    }
]);
