'use strict';

angular.module('artisStudio.resource', ['ngRoute'])

  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/resource/:id', {
      templateUrl: 'views/resources/resource.html',
      controller: 'ResourceCtrl',
      access: {
        requiredLogin: true
      }
    });
  }])

  .controller('ResourceCtrl', ['$scope', '$rootScope', '$routeParams', 'DataFactory', '$location', 'Joint', 'ModalService',
    '$http', '$document', 'Notification', 'localStorageService',
    function ($scope, $rootScope, $routeParams, DataFactory, $location, Joint, ModalService, $http, $document,
              Notification, localStorageService) {
      var resource_id = $routeParams.id;

      $scope.resource = {};
      $scope.new = true;
      $scope.cpp = false;
      $scope.resourceTypes = [];
      $scope.selectedResourceTypeId = null;
      $scope.resource_path = "";
      DataFactory.getData('resourcetypes/').then(function (data) {
        $scope.resourceTypes = data.data;
        if (resource_id !== '-1') {
          DataFactory.getData('resource/' + resource_id).then(function (data) {
            $scope.resource = data.data;
            $scope.old_resource = $scope.resource;
            $scope.new = false;
            $scope.selectedResourceTypeId = $scope.resource.type;
            if (searchCppId($scope.resourceTypes) === $scope.resource.type) {
              $scope.cpp = true;
              $scope.resource_path = JSON.parse($scope.resource.properties).path;
            }
          });
        }
      });

      $scope.create = function () {
        $http.post($rootScope.urlBase + '/api/v1/resource/' + AuthenticationFactory.user.id, {
          name: $scope.resource.name
        }).success(function (data) {
          Notification.success({message: 'Resource created.', delay: 8000});
          DataFactory.getData('project/' + $scope.resource.project).then(function (data) {
            $location.path('/project/' + data.data._id + '/' + data.data.name);
          });
        }).error(function (data) {
          Notification.error({message: data.message, title: 'Error ' + data.status, delay: 8000});
        });
      };

      $scope.update = function () {
        var new_resource;

        if ($scope.selectedResourceTypeId === searchCppId($scope.resourceTypes)) {
          new_resource = {
            name: $scope.resource.name,
            type: $scope.selectedResourceTypeId,
            properties: {
              path: $scope.resource_path
            }
          };
        } else {
          // TODO
        }
        $http.put($rootScope.urlBase + '/api/v1/resource/' + $scope.resource._id, new_resource).success(function (data) {
          Notification.success({message: 'Resource updated.', delay: 8000});
          DataFactory.getData('project/' + $scope.resource.project).then(function (data) {
            $location.path('/project/' + data.data._id + '/' + data.data.name);
          });
        }).error(function (data) {
          Notification.error({message: data.message, title: 'Error ' + data.status, delay: 8000});
        });
      };

    }]);

var searchCppId = function(types)
{
  var found = false;
  var index = 0;

  while (!found && index < types.length) {
    if (types[index].name === "c++ file") {
      found = true;
    } else {
      ++index;
    }
  }
  return found ? types[index]._id : -1;
};