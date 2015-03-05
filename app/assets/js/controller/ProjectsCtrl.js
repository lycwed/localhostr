'use strict';

app.controller('ProjectsCtrl', ['$scope', '$state', '$timeout', 'AppResource', 'Installer',
    function ($scope, $state, $timeout, AppResource, Installer) {
        var timer = null;
        var path = ($state.params.path === 'all') ? '' : $state.params.path;
        var realPaths = [];
        var searching = false;
        var research = Installer.data.response.research;
        var options = (path === '') ? {} : {
            'path': path
        };

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

        $scope.popover = null;
        $scope.loading = {
            inProgress: false
        };
        $scope.data = {
            projects: [],
            research: {},
            options: Installer.data.response.menu,
            breadcrumb: realPaths
        };

        AppResource.get('projects', options).then(function(service) {
            var projects = service.data.response;
            if (projects.length > 0) {
                $scope.data.projects = projects;
            } else {
                if ($state.params.path === 'all') {
                    $state.go('installer');
                }
            }
            $scope.loading.finish = true;
        });

        $scope.isSearching = function() {
            return searching;
        };
        $scope.togglePopover = function(name) {
            $scope.popover = ($scope.popover !== name) ? name : null;
            if ($scope.popover) {
                $timeout(function() {
                    angular.element(document.querySelector('#inputSearch')).focus();
                }, 500);
            }
        };
        $scope.isEmpty = function() {
            return ($scope.data.breadcrumb.length === 0);
        };

        $scope.$watch('data.search', function(value) {
            $timeout.cancel(timer);
            if (value && value.length >= parseInt(research.chars)) {
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
                        searching = true;
                        $scope.loading.inProgress = false;
                        $scope.data.research.results = service.data.response;
                        $scope.data.research.results_nb = service.data.response.length;
                        return;
                    });
                }, parseInt(research.time));
            } else {
                searching = false;
                $scope.loading.inProgress = false;
            }
        });
    }
]);
