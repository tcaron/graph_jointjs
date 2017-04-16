'use strict';

angular.module('artisStudio.model', ['ngRoute'])

  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/model/:id', {
      templateUrl: 'views/models/model.html',
      controller: 'ModelCtrl',
      access: {
        requiredLogin: true
      }
    });
  }])

  .controller('ModelCtrl', ['$scope', '$rootScope', '$routeParams', 'DataFactory', '$location', 'Joint', 'ModalService',
    '$http', '$document', 'Notification', 'localStorageService',
    function ($scope, $rootScope, $routeParams, DataFactory, $location, Joint, ModalService, $http, $document,
              Notification, localStorageService) {
      var model_id = $routeParams.id;

      $scope.model = null;
      $scope.selected = null;
      DataFactory.getData('model/' + model_id).then(function (data) {
        $scope.model = data.data;
        DataFactory.getData('dynamics/' + $scope.model.project._id).then(function (data2) {
          $scope.dynamics = data2.data.dynamics;
        });
      });

      $scope.save = function (model_id) {
        ModalService.showModal({
          templateUrl: 'saveModal.html',
          controller: "SaveModalController"
        }).then(function (modal) {
          modal.element.modal();
          modal.close.then(function (result) {
            if (result) {
              $http.put($rootScope.urlBase + '/api/v1/model/' + model_id, {
                model: $document[0].graph.model()
              }).success(function (data) {
                Notification.success({message: 'Model updated.', delay: 8000});
              }).error(function (data) {
                Notification.error({message: data.message, title: 'Error ' + data.status, delay: 8000});
              });
            }
          });
        });
      };

      $scope.atomic = function (model) {
        $scope.selected = model;
        ModalService.showModal({
          templateUrl: 'atomicModal.html',
          controller: "AtomicModalController",
          inputs: {
            root: $scope.model,
            model: model
          }
        }).then(function (modal) {
          modal.element.modal();
          modal.close.then(function (result) {
            modal.closed.then(function () {
              var element = $scope.dynamics.find(function (value) {
                return value.name === result
              });

              /*              if (element) {

               } else {

               } */
              localStorageService.set("dynamics", result);
              $location.path("/models/dynamics");
            });
          });
        });
      };

      $scope.classes = function () {
        var definition = JSON.parse($scope.model.definition);

        ModalService.showModal({
          templateUrl: 'classesModal.html',
          controller: "ClassesModalController",
          inputs: {
            classes: definition.classes
          }
        }).then(function (modal) {
          modal.element.modal();
          modal.close.then(function (result) {
            modal.closed.then(function () {
              localStorageService.set("class", result.class_name);
              $location.path("/class/" + model_id);
            });
          });
        });
      };

    }])

  .directive('modelgraph', ['$window', '$document', '$timeout', '$q', 'Joint',
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
                var definition = JSON.parse(data.definition);

                $document[0].graph = new Graph(element[0], definition.structure, definition.classes, definition.project,
                  definition.experiment);
              }
            }
          });
        }
      }
    }]
  )

  .controller('SaveModalController', function ($scope, close) {
    $scope.close = function (result) {
      close(result, 500);
    };
  })

  .controller('AtomicModalController', function ($scope, close, root, model) {
    $scope.root = root;
    $scope.model = model;

    $scope.close = function (result) {
      close(result, 500);
    };

    $scope.edit_dynamics = function () {
      close({
        name: $scope.model.dynamics,
        definition: JSON.parse($scope.root.definition).dynamics[$scope.model.dynamics]
      }, 500);
    };

  })

  .controller('ClassesModalController', function ($scope, close, classes) {
    $scope.classes = [];
    for (var c in classes) {
      $scope.classes.push(c);
    }

    $scope.close = function (result) {
      close(result, 500);
    };

    $scope.edit = function (class_name) {
      close({
        class_name: class_name
      }, 500);
    }
  });