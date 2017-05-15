'use strict';

angular.module('artisStudio.importModels', ['ngRoute'])

  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/models/import/:id/:name', {
      templateUrl: 'views/models/import/import.html',
      controller: 'ImportModelsCtrl',
      access: {
        requiredLogin: true
      }
    });
  }])

  .controller('ImportModelsCtrl', ['$scope', '$rootScope', '$routeParams', 'DataFactory', '$location',
    'FileUploader', 'localStorageService',
    function ($scope, $rootScope, $routeParams, DataFactory, $location, FileUploader, localStorageService) {
      var project_id = $routeParams.id;
      var project_name = $routeParams.name;
      var uploader = $scope.uploader = new FileUploader({
        url: $rootScope.urlBase + '/api/v1/project/import/model/' + project_id,
        headers: {'X-Access-Token': localStorageService.get("token")}
      });

      $scope.project = {
        _id: project_id,
        name: project_name
      };

      // FILTERS
      // a sync filter
      uploader.filters.push({
        name: 'syncFilter',
        fn: function(item /*{File|FileLikeObject}*/, options) {
          return this.queue.length < 10;
        }
      });

      // an async filter
      uploader.filters.push({
        name: 'asyncFilter',
        fn: function(item /*{File|FileLikeObject}*/, options, deferred) {
          setTimeout(deferred.resolve, 1e3);
        }
      });

      uploader.onCompleteAll = function() {
        $location.path("/project/" + project_id + "/" + project_name);
      };

    }]);