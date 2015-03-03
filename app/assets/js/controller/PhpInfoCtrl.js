'use strict';

app.controller('PhpInfoCtrl', ['$scope', 'PhpInfo',
    function ($scope, PhpInfo) {
        $scope.data = {};
        if (PhpInfo.data.response !== '') {
            $scope.data.content = PhpInfo.data.response;
        }
    }
]);
