'use strict';

angular.module('artisStudio.header', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/header', {
    templateUrl: 'header/header.html',
    controller: 'HeaderCtrl',
    access: {
      requiredLogin: true
    }
  });
}])

.controller('HeaderCtrl', ['$scope', '$location', 'UserAuthFactory',
  function($scope, $location, UserAuthFactory) {
    $scope.isActive = function (routes) {
      if(Array.isArray(routes)){
        var isMatch = false;

        routes.forEach(function (route) {
          if (($location.path() + "/").startsWith(route + "/")) {
            isMatch = true;
          }
        });
        return isMatch;
      }
      return ($location.path() + "/").startsWith(routes + "/");
    };

    $scope.logout = function () {
      UserAuthFactory.logout();
    };
}]);