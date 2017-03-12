myApp.factory('DataFactory', function ($rootScope, $http, $location, Notification, ngProgressFactory, UserAuthFactory) {
  /** https://docs.angularjs.org/guide/providers **/
  var urlBase = $rootScope.urlBase + '/api/v1/';
  var _dataFactory = {};

  _dataFactory.getData = function (query, errorRedirect, params) {

    if(!$rootScope.progressbar) {
      $rootScope.progressbar = ngProgressFactory.createInstance();
      $rootScope.progressbar.setColor('#7ECF7E');
      $rootScope.progressbar.setHeight('3px');
    }

    $rootScope.progressbar.set(0);
    $rootScope.progressbar.start();
    return $http({
        url: urlBase + query,
        method: "GET",
        params: params
    }).success(function (data) {
        if (data === null) {
          redirection(errorRedirect);
        }
        $rootScope.progressbar.complete();
        return data;
      }).error(function (data) {
        $rootScope.progressbar.complete();
        switch(data.status) {
          case 403 :
            Notification.error({message: data.message, title: 'Erreur ' + data.status, delay: 8000});
            redirection("/");
            break;
          case 400 :
            UserAuthFactory.logout();
            break;
          default:
            Notification.error({message: data.message, title: 'Erreur ' + data.status, delay: 8000});
            redirection(errorRedirect);
        }
      });
  };

  _dataFactory.deleteData = function (query, redirect, errorRedirect) {
    return $http.delete(urlBase + query)
      .success(function (data) {
        Notification.success({message: data.message, title: 'Success', delay: 8000});
        redirection(redirect);
      }).error(function (data) {
        Notification.error({message: data.message, title: 'Erreur ' + data.status, delay: 8000});
        redirection(errorRedirect);
      });
  };

  var redirection = function (redirect) {
    if (typeof redirect === 'string' || redirect instanceof String) {
      $location.path(redirect);
    }
  };

  return _dataFactory;
});