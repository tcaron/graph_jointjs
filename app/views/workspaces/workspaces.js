'use strict';

angular.module('artisStudio.workspaces', ['ngRoute'])

  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/workspaces', {
      templateUrl: 'views/workspaces/workspaces.html',
      controller: 'WorkspacesCtrl',
      access: {
        requiredLogin: true
      }
    });
  }])

  .controller('WorkspacesCtrl', ['$scope', '$rootScope', 'DataFactory', '$location',
    function ($scope, $rootScope, DataFactory, $location) {
      $scope.workspaces = [];

      DataFactory.getData('workspaces').then(function (data) {
        $scope.workspaces = data.data;
      });

      $scope.create = function () {
        $location.path("workspace/-1");
      };

      $scope.edit = function (workspace_id) {
        $location.path("workspace/" + workspace_id);
      };

      $scope.projects = function (workspace_id, workspace_name) {
        $location.path("projects/" + workspace_id + "/" + workspace_name);
      };
    }]);