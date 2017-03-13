'use strict';

angular.module('artisStudio.workspace', ['ngRoute'])

  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/workspace/:id', {
      templateUrl: 'views/workspaces/workspace.html',
      controller: 'WorkspaceCtrl',
      access: {
        requiredLogin: true
      }
    });
  }])

  .controller('WorkspaceCtrl', ['$scope', '$rootScope', '$routeParams', 'DataFactory', '$location', '$http', 'Notification', 'AuthenticationFactory',
    function ($scope, $rootScope, $routeParams, DataFactory, $location, $http, Notification, AuthenticationFactory) {
      var workspace_id = $routeParams.id;
      $scope.workspace = {};
      $scope.new = true;
      if (workspace_id !== '-1') {
        DataFactory.getData('workspace/' + workspace_id).then(function (data) {
          $scope.workspace = data.data;
          $scope.old_workspace = $scope.workspace;
          $scope.new = false;
        });
      }

      $scope.create = function () {
        $http.post($rootScope.urlBase + '/api/v1/workspace/' + AuthenticationFactory.user.id, {
          name: $scope.workspace.name
        }).success(function (data) {
          Notification.success({message: 'Workspace created.', delay: 8000});
          $location.path('/workspaces/');
        }).error(function (data) {
          Notification.error({message: data.message, title: 'Error ' + data.status, delay: 8000});
        });
      };

      $scope.update = function () {
        $http.put($rootScope.urlBase + '/api/v1/workspace/' + $scope.workspace._id, {
          name: $scope.workspace.name
        }).success(function (data) {
          Notification.success({message: 'Workspace updated.', delay: 8000});
          $location.path('/workspaces/');
        }).error(function (data) {
          Notification.error({message: data.message, title: 'Error ' + data.status, delay: 8000});
        });
      };

    }]);