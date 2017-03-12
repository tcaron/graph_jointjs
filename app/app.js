'use strict';

// Declare app level module which depends on views, and components
angular.module('artisStudio', [
  'ngRoute', 'ngLocale', 'gettext', 'tmh.dynamicLocale', 'LocalStorageModule',
  'artisStudio.home', 'artisStudio.login', 'artisStudio.header', 'artisStudio.footer', 'artisStudio.version'
])

  .config(['$locationProvider', '$routeProvider', function ($locationProvider, $routeProvider) {
    $locationProvider.hashPrefix('!');

    $routeProvider.otherwise({redirectTo: '/login'});
  }])

  .config(function (tmhDynamicLocaleProvider) {
    tmhDynamicLocaleProvider.localeLocationPattern('/bower_components/angular-i18n/angular-locale_{{locale}}.js');
  })

  .config(function ($logProvider) {
    $logProvider.debugEnabled(false);
  })

//  .config(function ($locationProvider) {
//    $locationProvider.html5Mode({
//      enabled: true
//    })
//  })

.run(function ($rootScope, $window, $location, gettextCatalog, localStorageService, tmhDynamicLocale) {
  $rootScope.urlBase = 'http://localhost:8000';
  $rootScope.timezone = 'Europe/Paris';

  if(localStorageService.get('local')){
    gettextCatalog.setCurrentLanguage(localStorageService.get('local'));
    tmhDynamicLocale.set(localStorageService.get('local'));
  }  else {
    gettextCatalog.setCurrentLanguage('fr');
  }
  gettextCatalog.debug = true;
});