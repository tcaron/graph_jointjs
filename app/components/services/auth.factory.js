myApp.factory('AuthenticationFactory', function (localStorageService) {
  var auth = {
    isLogged: false,
    check: function () {
      if (localStorageService.get("token") && localStorageService.get("user")) {
        this.isLogged = true;
      } else {
        this.isLogged = false;
        delete this.user;
      }
    }
  };
  return auth;
});

myApp.factory('UserAuthFactory', function ($rootScope, $location, $http, AuthenticationFactory, localStorageService) {
  return {
    login: function (username, password) {
      return $http.post($rootScope.urlBase + '/login', {
        username: username,
        password: password
      });
    },
    logout: function () {
      if (AuthenticationFactory.isLogged) {
        AuthenticationFactory.isLogged = false;
        delete AuthenticationFactory.user;
        delete AuthenticationFactory.userRole;
        localStorageService.clearAll();
        $location.path("/login");
      }

    }
  }
});

myApp.factory('TokenInterceptor', function ($q, localStorageService) {
  return {
    request: function (config) {
      config.headers = config.headers || {};
      if (localStorageService.get("token")) {
        config.headers['X-Access-Token'] = localStorageService.get("token");
        config.headers['Content-Type'] = "application/json";
      }
      return config || $q.when(config);
    },
    response: function (response) {
      return response || $q.when(response);
    }
  };
});
