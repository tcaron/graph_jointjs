'use strict';

angular.module('artisStudio.model', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/model/:id', {
    templateUrl: 'views/models/model.html',
    controller: 'ModelCtrl',
    access: {
      requiredLogin: true
    }
  });
}])

.controller('ModelCtrl', ['$scope', '$rootScope', '$routeParams', 'DataFactory', '$location', 'Joint',
  function($scope, $rootScope, $routeParams, DataFactory, $location, Joint) {
    var model_id = $routeParams.id;

    $scope.model = null;
    DataFactory.getData('model/' + model_id).then(function (data) {
      $scope.model = data.data;
    });

}])

.directive('graph', ['$window', '$document', '$timeout', '$q', 'Joint',
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
              $document[0].graph = new Graph(element[0], data.workspace_name, data.project_name, data.name, data.definition);
            }
          }
        });
      }
    }
  }]
);
