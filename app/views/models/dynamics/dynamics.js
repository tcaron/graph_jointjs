'use strict';

angular.module('artisStudio.dynamics', ['ngRoute'])

  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/models/dynamics', {
      templateUrl: 'views/models/dynamics/dynamics.html',
      controller: 'DynamicsCtrl',
      access: {
        requiredLogin: true
      }
    });
  }])

  .controller('DynamicsCtrl', ['$scope', '$rootScope', '$routeParams', 'DataFactory', '$location', 'localStorageService',
    function ($scope, $rootScope, $routeParams, DataFactory, $location, localStorageService) {
      var dynamics = localStorageService.get("dynamics");

      $scope.name = dynamics.name;
      $scope.options = {
        lineNumbers: true,
        mode: "text/x-c++src",
        matchBrackets: true,
        keyMap: "emacs",
        theme: 'ambiance'
      };

    }]);