myApp.factory('UserPreferences', function ($rootScope, $http, localStorageService) {

    var loaded = false;
    var userPreferences = {};
    var justGotFromApi = true;

    $rootScope.preferences = localStorageService.get("preferences");

    $rootScope.$watch(function () {
      return $rootScope.preferences;
    }, function () {
      if (loaded) {
        localStorageService.set("preferences", $rootScope.preferences);
        if (!justGotFromApi) {
          userPreferences.savePreferences();
        } else {
          justGotFromApi = false;
        }
      }
    }, true);

    userPreferences.loadPreferences = function () {
      if (!loaded) {
        loaded = true;
        var urlBase = $rootScope.urlBase + '/api/v1/';
        var user = localStorageService.get("user");
        $http.get(urlBase + 'user/' + user.id + '/preferences').then(function (data) {
          if (data.data["preferences"] !== null) {
            justGotFromApi = true;
            $rootScope.preferences = data.data["preferences"];

          } else {
            $rootScope.preferences = {};
          }
        }, function (error) {
        });
      }
    };

    userPreferences.savePreferences = function () {
      var urlBase = $rootScope.urlBase + '/api/v1/';
      var user = localStorageService.get("user");
      $http.put(urlBase + 'user/' + user.id + '/preferences', {preferences: $rootScope.preferences}).then(function (data) {
      }, function (error) {
      });
    };

    return userPreferences;
  }
);