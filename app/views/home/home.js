'use strict';

angular.module('artisStudio.home', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/home', {
    templateUrl: 'views/home/home.html',
    controller: 'HomeCtrl',
    access: {
      requiredLogin: true
    }
  });
}])

.controller('HomeCtrl', [function() {

}]);