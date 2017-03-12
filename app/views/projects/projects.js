'use strict';

angular.module('artisStudio.projects', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/projects/:id/:name', {
    templateUrl: 'views/projects/projects.html',
    controller: 'ProjectsCtrl',
    access: {
      requiredLogin: true
    }
  });
}])

.controller('ProjectsCtrl', ['$scope', '$rootScope', '$routeParams', 'DataFactory', '$location',
  function($scope, $rootScope, $routeParams, DataFactory, $location) {
    var workspace_id = $routeParams.id;
    var workspace_name = $routeParams.name;

    $scope.projects = [];
    $scope.workspace = workspace_name;
    DataFactory.getData('projects/' + workspace_id).then(function (data) {
      $scope.projects = data.data;
    });

    $scope.models = function (project_id, project_name) {
      $location.path("/models/" + project_id + "/" + project_name);
    };
}]);