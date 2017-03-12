'use strict';

angular.module('artisStudio.login', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/login', {
    templateUrl: 'views/login/login.html',
    controller: 'LoginCtrl',
    access: {
      requiredLogin: false
    }
  });
}])

.controller('LoginCtrl', [function() {

}]);