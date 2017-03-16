'use strict';

angular.module('artisStudio.footer', ['ngRoute'])

  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/footer', {
      templateUrl: 'footer/footer.html',
      controller: 'FooterCtrl',
      access: {
        requiredLogin: true
      }
    });
  }])

  .controller('FooterCtrl', ['$scope', '$rootScope', '$location', 'gettextCatalog', 'tmhDynamicLocale', 'localStorageService',
    function ($scope, $rootScope, $location, gettextCatalog, tmhDynamicLocale, localStorageService) {
      $rootScope.local = gettextCatalog.getCurrentLanguage();
      $scope.setLocale = function (local) {
        gettextCatalog.setCurrentLanguage(local);
        $scope.currentLanguage = local;
        $rootScope.local = local;
        localStorageService.set("local", local);
        tmhDynamicLocale.set(local);
      };
    }
  ]);