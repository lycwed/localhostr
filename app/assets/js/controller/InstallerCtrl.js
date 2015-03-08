'use strict';

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
