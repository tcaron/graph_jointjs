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

.controller('HeaderCtrl', [function() {

}]);