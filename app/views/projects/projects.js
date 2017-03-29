'use strict';

angular.module('artisStudio.projects', ['ngRoute'])

  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/projects/:id/:name', {
      templateUrl: 'views/projects/projects.html',
      controller: 'ProjectsCtrl',
      access: {
        requiredLogin: true
      }
    });
  }])

  .controller('ProjectsCtrl', ['$scope', '$rootScope', '$routeParams', 'DataFactory', '$location', 'ModalService', '$http', 'Notification',
    function ($scope, $rootScope, $routeParams, DataFactory, $location, ModalService, $http, Notification) {
      var workspace_id = $routeParams.id;
      var workspace_name = $routeParams.name;

      $scope.projects = [];
      $scope.workspace = workspace_name;
      loadProjects($scope, DataFactory, workspace_id);
      $scope.create = function () {
        ModalService.showModal({
          templateUrl: 'createProjectModal.html',
          controller: "CreateProjectModalController"
        }).then(function (modal) {
          modal.element.modal();
          modal.close.then(function (result) {
            if (result.result) {
              $http.post($rootScope.urlBase + '/api/v1/project/' + workspace_id, {
                name: result.name
              }).success(function (data) {
                DataFactory.getData('projects/' + workspace_id).then(function (data) {
                  $scope.workspace = data.data.workspace;
                  $scope.projects = data.data.projects;
                });
                Notification.success({message: 'Project created.', delay: 8000});
              }).error(function (data) {
                Notification.error({message: data.message, title: 'Error ' + data.status, delay: 8000});
              });
            }
          });
        });
      };

      $scope.models = function (project_id, project_name) {
        $location.path("/project/" + project_id + "/" + project_name);
      };

      $scope.remove = function (project_id, project_name) {
        ModalService.showModal({
          templateUrl: 'removeProjectModal.html',
          controller: "RemoveProjectModalController",
          inputs: {
            name: project_name
          }
        }).then(function (modal) {
          modal.element.modal();
          modal.close.then(function (result) {
            if (result === "Remove") {
              DataFactory.deleteData('project/' + project_id).then(function (data) {
                loadProjects($scope, DataFactory, workspace_id);
              });
            }
          });
        });
      };

    }])

  .controller('CreateProjectModalController', function ($scope, close) {
    $scope.name = "";
    $scope.close = function (result) {
      close({
        result: result,
        name: $scope.name
      }, 500);
    };
  })

  .controller('RemoveProjectModalController', function ($scope, close, name) {
    $scope.name = name;
    $scope.close = function (result) {
      close(result, 500);
    };
  });

var loadProjects = function ($scope, DataFactory, workspace_id) {
  DataFactory.getData('projects/' + workspace_id).then(function (data) {
    $scope.workspace = data.data.workspace;
    $scope.projects = data.data.projects;
  });
};