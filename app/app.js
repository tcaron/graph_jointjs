'use strict';

// Declare app level module which depends on views, and components
var myApp = angular.module('artisStudio', [
  'ngRoute', 'ngLocale', 'gettext', 'ui-notification', 'tmh.dynamicLocale', 'LocalStorageModule', 'ngProgress',
  'angularModalService', 'angularFileUpload', 'ui.codemirror',
  'artisStudio.home', 'artisStudio.login', 'artisStudio.header', 'artisStudio.footer', 'artisStudio.version',
  'artisStudio.workspace', 'artisStudio.workspaces', 'artisStudio.projects', 'artisStudio.project', 'artisStudio.importModels',
  'artisStudio.importResources','artisStudio.model', 'artisStudio.dynamics'
])

  .config(['$locationProvider', '$routeProvider', '$httpProvider',
    function ($locationProvider, $routeProvider, $httpProvider) {
//      $locationProvider.hashPrefix('!');
      $httpProvider.interceptors.push('TokenInterceptor');
      $routeProvider.otherwise({redirectTo: '/login'});
    }])

  .config(function (tmhDynamicLocaleProvider) {
    tmhDynamicLocaleProvider.localeLocationPattern('/bower_components/angular-i18n/angular-locale_{{locale}}.js');
  })

  .config(function ($logProvider) {
    $logProvider.debugEnabled(false);
  })

  .config(function (localStorageServiceProvider) {
    localStorageServiceProvider
      .setPrefix('artis-studio');
  })

  //  .config(function ($locationProvider) {
  //    $locationProvider.html5Mode({
  //      enabled: true
  //    })
  //  })

  .run(function ($rootScope, $window, $location, AuthenticationFactory, gettextCatalog, localStorageService,
                 tmhDynamicLocale, UserAuthFactory, UserPreferences) {
    $rootScope.urlBase = 'http://localhost:3000';
    $rootScope.timezone = 'Europe/Paris';

    // when the page refreshes, check if the user is already logged in
    AuthenticationFactory.check();
    $rootScope.$on("$routeChangeStart", function (event, nextRoute, currentRoute) {
      if ((nextRoute.access && nextRoute.access.requiredLogin) && !AuthenticationFactory.isLogged) {
        $location.path("/login");
      } else {
        if (AuthenticationFactory.isLogged) {
          if (!localStorageService.get("user")) $window.location.reload();
          // check if user object exists else fetch it. This is incase of a page refresh
          if (!AuthenticationFactory.user) AuthenticationFactory.user = localStorageService.get("user");
          if (!AuthenticationFactory.userRole) AuthenticationFactory.userRole = localStorageService.get("userRole");
        }
      }
    });
    $rootScope.$on('$routeChangeSuccess', function (event, nextRoute, currentRoute) {
      $rootScope.showMenu = AuthenticationFactory.isLogged;
      if (AuthenticationFactory.isLogged) {
        $rootScope.user = AuthenticationFactory.user;
        $rootScope.role = AuthenticationFactory.userRole;
        UserPreferences.loadPreferences();
      }
// if the user is already logged in, take him to the home page
      if (AuthenticationFactory.isLogged == true && $location.path() == '/login') {
        $location.path('/');
      }
    });

    if (localStorageService.get('local')) {
      gettextCatalog.setCurrentLanguage(localStorageService.get('local'));
      tmhDynamicLocale.set(localStorageService.get('local'));
    } else {
      gettextCatalog.setCurrentLanguage('fr');
    }
    gettextCatalog.debug = true;
  });