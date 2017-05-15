'use strict';

angular.module('artisStudio.login', ['ngRoute'])

  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/login', {
      templateUrl: 'views/login/login.html',
      controller: 'LoginCtrl',
      access: {
        requiredLogin: false
      }
    });
  }])

  .controller('LoginCtrl', ['$scope', '$location', 'UserAuthFactory', 'AuthenticationFactory', 'localStorageService',
    function ($scope, $location, UserAuthFactory, AuthenticationFactory, localStorageService) {
      $scope.user = {
        username: '',
        password: ''
      };

      $scope.login = function () {
        var username = $scope.user.username,
          password = $scope.user.password;

        if (username !== undefined && password !== undefined) {
          UserAuthFactory.login(username, password).success(function (data) {
            AuthenticationFactory.isLogged = true;
            AuthenticationFactory.user = data.user;
            localStorageService.set('token', data.token);
            localStorageService.set('user', data.user);
            if (data.user.roles.length === 0) {
              AuthenticationFactory.userRole = "none";
              localStorageService.set('userRole', "none");
            } else if (data.user.roles.length === 1) {
              AuthenticationFactory.userRole = data.user.roles[0].roleName;
              localStorageService.set('userRole', data.user.roles[0].roleName);
            }
            $location.path("/");
          }).error(function (status) {
            alert('Oops something went wrong!');
          });
        } else {
          alert('Invalid credentials');
        }
      };
    }]);