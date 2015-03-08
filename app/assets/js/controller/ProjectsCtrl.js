'use strict';

app.controller('ProjectsCtrl', ['$scope', '$window', '$state', '$timeout', 'AppResource', 'Installer',
    function ($scope, $window, $state, $timeout, AppResource, Installer) {
        var timer = null;
        var path = ($state.params.path === 'all') ? '' : $state.params.path;
        var searching = false;
        var research = Installer.data.response.research;
        var changePath = function(path) {
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
                        if (options.indexOf('-s') > -1) {
                            params.start = 1;
                        }

                        if (options.indexOf('-i') > -1) {
                            params.case = 1;
                        }

                        if (options.indexOf('-f') > -1) {
                            params.files = 1;
                        }

                        if (options.indexOf('-fd') > -1) {
                            params.folders = 1;
                        }
                    }

                    AppResource.get('search', params).then(function(service) {
                        $scope.loading.inProgress = false;
                        $scope.data.research.results = service.data.response;
                        $scope.data.research.results_nb = service.data.response.length;
                        $scope.loading.inProgress = false;
                        return;
                    });
                }, parseInt(research.time));
            } else {
                searching = false;
            }
        });
        changePath(path);
    }
]);
