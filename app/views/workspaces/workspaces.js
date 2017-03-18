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

  .controller('WorkspacesCtrl', ['$scope', '$rootScope', 'DataFactory', '$location', 'ModalService', '$http', 'Notification',
    function ($scope, $rootScope, DataFactory, $location, ModalService, $http, Notification) {
      $scope.workspaces = [];

      DataFactory.getData('workspaces').then(function (data) {
        $scope.workspaces = data.data;
      });

      $scope.create = function () {
        ModalService.showModal({
          templateUrl: 'createWorkspaceModal.html',
          controller: "CreateWorkspaceModalController"
        }).then(function (modal) {
          modal.element.modal();
          modal.close.then(function (result) {
            if (result.result) {
              $http.post($rootScope.urlBase + '/api/v1/workspace/' + $rootScope.user.id, {
                name: result.name
              }).success(function (data) {
                DataFactory.getData('workspaces').then(function (data) {
                  $scope.workspaces = data.data;
                });
                Notification.success({message: 'Workspace created.', delay: 8000});
              }).error(function (data) {
                Notification.error({message: data.message, title: 'Error ' + data.status, delay: 8000});
              });
            }
          });
        });
      };

      $scope.edit = function (workspace_id) {
        $location.path("workspace/" + workspace_id);
      };

      $scope.projects = function (workspace_id, workspace_name) {
        $location.path("projects/" + workspace_id + "/" + workspace_name);
      };
    }])

  .controller('CreateWorkspaceModalController', function ($scope, close) {
    $scope.name = "";
    $scope.close = function (result) {
      close({
        result: result,
        name: $scope.name
      }, 500);
    };
  });