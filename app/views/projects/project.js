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

  .controller('ProjectCtrl', ['$scope', '$rootScope', '$routeParams', 'DataFactory', '$location', 'ModalService', '$http',
      'Notification',
    function ($scope, $rootScope, $routeParams, DataFactory, $location, ModalService, $http, Notification) {
      var project_id = $routeParams.id;
      var project_name = $routeParams.name;

      $scope.models = [];
      $scope.resources = [];
      $scope.project = project_name;
      $scope.item = "models";

      load_models($scope, DataFactory, project_id);
      load_resources($scope, DataFactory, project_id);

      $scope.edit_model = function (model_id) {
        $location.path("/model/" + model_id);
      };

      $scope.import_model = function () {
        $location.path("/models/import/" + project_id + "/" + project_name);
      };

      $scope.edit_resource_definition = function (resource_id) {
        DataFactory.getData('resourcetypes/').then(function (data) {
          var resource_types = data.data;

          DataFactory.getData('resource/' + resource_id).then(function (data) {
            var resource = data.data;

            if (is_type(resource.type, "c++ file", resource_types) ||
              is_type(resource.type, "cmake file", resource_types) ||
              is_type(resource.type, "text file", resource_types)) {
              $location.path("/resource/definition/text/" + resource_id);
            } else if (is_type(resource.type, "devs diagram", resource_types)) {
              $location.path("/resource/definition/devs/" + resource_id);
            }
          });
        });
      };

      $scope.edit_resource = function (resource_id) {
        $location.path("/resource/" + resource_id);
      };

      $scope.import_resource = function () {
        $location.path("/resources/import/" + project_id + "/" + project_name);
      };

      $scope.remove_model = function (model_id, model_name) {
        ModalService.showModal({
          templateUrl: 'removeModelModal.html',
          controller: "RemoveModelModalController",
          inputs: {
            name: model_name
          }
        }).then(function (modal) {
          modal.element.modal();
          modal.close.then(function (result) {
            if (result === "Remove") {
              DataFactory.deleteData('model/' + model_id).then(function (data) {
                load_models($scope, DataFactory, project_id);
                load_resources($scope, DataFactory, project_id);
              });
            }
          });
        });
      };

      $scope.create_resource = function () {
        DataFactory.getData('resourcetypes/').then(function (data) {
          ModalService.showModal({
            templateUrl: 'createResourceModal.html',
            controller: "CreateResourceModalController",
            inputs: {
              types: data.data
            }
          }).then(function (modal) {
            modal.element.modal();
            modal.close.then(function (result) {
              if (result.result) {
                $http.post($rootScope.urlBase + '/api/v1/resource/' + project_id, {
                  name: result.name,
                  type_id: result.type
                }).success(function (data) {
                  load_models($scope, DataFactory, project_id);
                  load_resources($scope, DataFactory, project_id);
                  Notification.success({message: 'Resource created.', delay: 8000});
                }).error(function (data) {
                  Notification.error({message: data.message, title: 'Error ' + data.status, delay: 8000});
                });
              }
            });
          });
        });
      };

      $scope.remove_resource = function (resource_id, resource_name) {
        ModalService.showModal({
          templateUrl: 'removeResourceModal.html',
          controller: "RemoveResourceModalController",
          inputs: {
            name: resource_name
          }
        }).then(function (modal) {
          modal.element.modal();
          modal.close.then(function (result) {
            if (result === "Remove") {
              DataFactory.deleteData('resource/' + resource_id).then(function (data) {
                load_models($scope, DataFactory, project_id);
                load_resources($scope, DataFactory, project_id);
              });
            }
          });
        });
      };

    }])

  .controller('RemoveModelModalController', function ($scope, close, name) {
    $scope.name = name;
    $scope.close = function (result) {
      close(result, 500);
    };
  })

  .controller('RemoveResourceModalController', function ($scope, close, name) {
    $scope.name = name;
    $scope.close = function (result) {
      close(result, 500);
    };
  })

  .controller('CreateResourceModalController', function ($scope, close, types) {
    $scope.name = "";
    $scope.resourceTypes = types;
    $scope.close = function (result) {
      close({
        result: result,
        name: $scope.name,
        type: $scope.selectedResourceTypeId
      }, 500);
    };
  });

var search_type_name = function (types, id) {
  var found = false;
  var index = 0;

  while (!found && index < types.length) {
    if (types[index]._id === id) {
      found = true;
    } else {
      ++index;
    }
  }
  return found ? types[index].name : "<none>";
};

var load_models = function($scope, DataFactory, project_id) {
  DataFactory.getData('models/' + project_id).then(function (data) {
    $scope.workspace = data.data.workspace;
    $scope.project = data.data.project;
    $scope.models = data.data.models;
  });
};

var load_resources = function ($scope, DataFactory, project_id) {
  DataFactory.getData('resources/' + project_id).then(function (data) {
    $scope.resources = data.data.resources;
    DataFactory.getData('resourcetypes/').then(function (data) {
      $scope.resourceTypes = data.data;
      $scope.resources.forEach(function (resource) {
        var properties = JSON.parse(resource.properties);

        resource.type_name = search_type_name($scope.resourceTypes, resource.type);
        if (properties.path) {
          resource.path = properties.path;
        }
      });
    });
  });
};

var is_type = function(resource_type, type, types)
{
  var found = false;
  var index = 0;

  while (!found && index < types.length) {
    if (types[index].name === type) {
      found = true;
    } else {
      ++index;
    }
  }
  return found ? resource_type === types[index]._id : false;
};