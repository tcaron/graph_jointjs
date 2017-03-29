'use strict';

angular.module('artisStudio.project', ['ngRoute'])

  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/project/:id/:name', {
      templateUrl: 'views/projects/project.html',
      controller: 'ProjectCtrl',
      access: {
        requiredLogin: true
      }
    });
  }])

  .controller('ProjectCtrl', ['$scope', '$rootScope', '$routeParams', 'DataFactory', '$location',
    function ($scope, $rootScope, $routeParams, DataFactory, $location) {
      var project_id = $routeParams.id;
      var project_name = $routeParams.name;

      $scope.models = [];
      $scope.resources = [];
      $scope.project = project_name;
      $scope.item = "models";
      DataFactory.getData('models/' + project_id).then(function (data) {
        $scope.workspace = data.data.workspace;
        $scope.project = data.data.project;
        $scope.models = data.data.models;
      });
      DataFactory.getData('resources/' + project_id).then(function (data) {
        $scope.resources = data.data.resources;
      });

      $scope.edit_model = function (model_id) {
        $location.path("/model/" + model_id);
      };

      $scope.import_model = function () {
        $location.path("/models/import/" + project_id + "/" + project_name);
      };

      $scope.edit_resource_definition = function (resource_id) {
        $location.path("/resource/definition/" + resource_id);
      };

      $scope.edit_resource = function (resource_id) {
        $location.path("/resource/" + resource_id);
      };

      $scope.import_resource = function () {
        $location.path("/resources/import/" + project_id + "/" + project_name);
      };

    }]);