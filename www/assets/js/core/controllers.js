'use strict';

app.controller('ApplicationCtrl', ['$scope',
  function ($scope) {

    $scope.$root.$on('$stateNotFound', function(event, unfoundState, fromState, fromParams){
      console.log(event, unfoundState, fromState, fromParams);
    });

    $scope.$root.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error){
      console.log(event, toState, toParams, fromState, fromParams, error);
    });

    $scope.$root.$on('$viewContentLoading', function(event, viewConfig){
      console.log(event, viewConfig);
    });

    $scope.$root.$on('viewContentLoaded', function(){
      console.log('view loaded');
    });
  }
]);

app.controller('BreadcrumbCtrl', ['$scope', '$state',
    function ($scope, $state) {
        var realPaths = [];

        if ($state.params.path !== 'all') {
            var urls = [];
            var paths = $state.params.path.split('/');
            var separator = encodeURIComponent('/');

            for (var i = 0; i < paths.length; i++) {
                if (paths.hasOwnProperty(i)) {
                    urls.push(paths[i]);
                    realPaths.push({
                        name: paths[i],
                        path: urls.join(separator)
                    });
                }
            }
        }

        $scope.data = {
            breadcrumb: realPaths
        };

        $scope.isEmpty = function() {
            return ($scope.data.breadcrumb.length === 0);
        }
    }
]);

app.controller('InstallerCtrl', ['$scope', '$rootScope', '$state', 'Installer', 'Form', 'AppResource',
    function ($scope, $rootScope, $state, Installer, Form, AppResource) {
        $scope.data = {};
        $scope.fields = {
            app: {
                ignores: { required: false, label:'PATH_TO_IGNORE', value: [] }
            },
            research: {
                chars: { required: true, label:'DISPLAY_MIN_CHARS', value: 1 },
                time: { required: true, label:'DISPLAY_MIN_TIME', value: 400 }
            },
            menu: {
                php_my_admin: {
                    href: { required: true, label:'PHP_MY_ADMIN_LINK', value: "" }
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
            console.log(form);
            if (form.isValid) {
                AppResource.update('installer', form.values).then(function() {
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
            Form.setData($scope.data, $scope.fields, Installer.data.response);
            console.log($scope.data);
        }
    }
]);

app.controller('OptionsCtrl', ['$scope', '$state',
    function ($scope, $state) {
        // console.log($scope, $state);
    }
]);

app.controller('PhpInfoCtrl', ['$scope', 'PhpInfo',
    function ($scope, PhpInfo) {
        $scope.data = {};
        if (PhpInfo.data.response !== '') {
            $scope.data.content = PhpInfo.data.response;
        }
    }
]);

app.controller('ProjectsCtrl', ['$scope', '$state', 'AppResource',
    function ($scope, $state, AppResource) {
        $scope.loaded = false;

        var options = ($state.params.path === 'all') ? {} : {
            path: $state.params.path
        };

        AppResource.get('projects', options).then(function(service) {
            var projects = service.data.response;
            if (projects.length > 0) {
                $scope.data = {
                    projects: projects
                };
            } else {
                if ($state.params.path === 'all') {
                    $state.go('installer');
                }
            }
            $scope.loaded = true;
        });

        $scope.open = function(item) {
            $state.go('projects', { path: item.path });
        };
    }
]);
