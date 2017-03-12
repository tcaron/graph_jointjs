'use strict';

angular.module('artisStudio.footer', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/footer', {
    templateUrl: 'footer/footer.html',
    controller: 'FooterCtrl',
    access: {
      requiredLogin: true
    }
  });
}])

.controller('FooterCtrl', [function() {

}]);