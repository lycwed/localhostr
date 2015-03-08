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
