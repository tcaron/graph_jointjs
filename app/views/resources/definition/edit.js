'use strict';

angular.module('artisStudio.resourceEdit', ['ngRoute'])

  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/resource/definition/:id', {
      templateUrl: 'views/resources/definition/edit.html',
      controller: 'ResourceEditCtrl',
      access: {
        requiredLogin: true
      }
    });
  }])

  .controller('ResourceEditCtrl', ['$scope', '$rootScope', '$routeParams', 'DataFactory', '$location', '$http', 'Notification',
    function ($scope, $rootScope, $routeParams, DataFactory, $location, $http, Notification) {
      var resource_id = $routeParams.id;

      $scope.resource = {};
      $scope.cpp = false;
      DataFactory.getData('resourcetypes/').then(function (data) {
        $scope.resourceTypes = data.data;
        if (resource_id !== '-1') {
          DataFactory.getData('resource/' + resource_id).then(function (data) {
            $scope.resource = data.data;
            $scope.old_resource = $scope.resource;
            DataFactory.getData('project/' + $scope.resource.project).then(function (data) {
              $scope.project = data.data;
              if (searchCppId($scope.resourceTypes) === $scope.resource.type ||
                searchCmakeId($scope.resourceTypes) === $scope.resource.type) {
                $scope.cpp = true;
                $scope.definition = $scope.resource.definition;
                $scope.options = {
                  lineNumbers: true,
                  mode: searchCppId($scope.resourceTypes) === $scope.resource.type ? "text/x-c++src" : "text/x-cmake",
                  matchBrackets: true,
                  keyMap: "emacs",
                  theme: 'ambiance'
                };
              }
            });
          });
        }
      });

      $scope.save = function (resource_id) {
        $http.put($rootScope.urlBase + '/api/v1/resource/' + $scope.resource._id, {definition: $scope.definition}).success(
          function (data) {
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

var searchCmakeId = function(types)
{
  var found = false;
  var index = 0;

  while (!found && index < types.length) {
    if (types[index].name === "cmake file") {
      found = true;
    } else {
      ++index;
    }
  }
  return found ? types[index]._id : -1;
};

var searchTextId = function(types)
{
  var found = false;
  var index = 0;

  while (!found && index < types.length) {
    if (types[index].name === "text file") {
      found = true;
    } else {
      ++index;
    }
  }
  return found ? types[index]._id : -1;
};