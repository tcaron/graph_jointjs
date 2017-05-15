'use strict';

angular.module('artisStudio.class', ['ngRoute'])

  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/class/:id', {
      templateUrl: 'views/classes/class.html',
      controller: 'ClassCtrl',
      access: {
        requiredLogin: true
      }
    });
  }])

  .controller('ClassCtrl', ['$scope', '$rootScope', '$routeParams', 'DataFactory', '$location', 'Joint', 'ModalService',
    '$http', '$document', 'Notification', 'localStorageService',
    function ($scope, $rootScope, $routeParams, DataFactory, $location, Joint, ModalService, $http, $document,
              Notification, localStorageService) {
      var model_id = $routeParams.id;
      var class_name = localStorageService.get("class");

      $scope.model = null;
      DataFactory.getData('model/' + model_id).then(function (data) {
        var definition = JSON.parse(data.data.definition);

        $scope.model = {
          model: definition,
          class_name: class_name
        };
      });
    }])

  .directive('classgraph', ['$window', '$document', '$timeout', '$q', 'Joint',
    function ($window, $document, $timeout, $q, Joint) {
      return {
        restrict: 'EA',
        scope: {
          name: '=',
          data: '=',
          label: '@',
          onClick: '&'
        },
        link: function (scope, element, attrs) {
          Joint.joint().then(function (joint) {
            scope.$watch('data', function (newData) {
              scope.render(newData);
            }, true);
            scope.render = function (data) {
              if (data) {
                var definition = data.model;

                $document[0].graph = new Graph(element[0], definition.classes[data.class_name], definition.classes, definition.project,
                  definition.experiment);
              }
            }
          });
        }
      }
    }]
  );