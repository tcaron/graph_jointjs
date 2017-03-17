'use strict';

angular.module('artisStudio.models', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/models/:id/:name', {
    templateUrl: 'views/models/models.html',
    controller: 'ModelsCtrl',
    access: {
      requiredLogin: true
    }
  });
}])

.controller('ModelsCtrl', ['$scope', '$rootScope', '$routeParams', 'DataFactory', '$location',
  function($scope, $rootScope, $routeParams, DataFactory, $location) {
    var project_id = $routeParams.id;
    var project_name = $routeParams.name;

    $scope.models = [];
    $scope.project = project_name;
    DataFactory.getData('models/' + project_id).then(function (data) {
      $scope.workspace = data.data.workspace;
      $scope.project = data.data.project;
      $scope.models = data.data.models;
    });

    $scope.edit = function (model_id) {
      $location.path("/model/" + model_id);
    };
}]);