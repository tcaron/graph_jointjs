myApp.factory('Joint', ['$window', '$q', '$rootScope', '$document',
  function ($window, $q, $rootScope, $document) {
    var d = $q.defer(),
      service = {
        local: function () {
          var local = $rootScope.local;
          if(local == "fr"){
            return {
              lang: {}
            }
          }
          else {
            return {
              lang: {}
            }
          }
        },
        joint: function () {
          return d.promise;
        }
      };

    function onScriptLoad() {
      $rootScope.$apply(function() { d.resolve($window.Joint); });
    }

    var scriptTag = $document[0].createElement('script');
    scriptTag.type = 'text/javascript';
    scriptTag.async = false;
    scriptTag.src = 'bower_components/joint/dist/joint.min.js';
    scriptTag.onreadystatechange = function () {
      if (this.readyState == 'complete') onScriptLoad();
    };
    scriptTag.onload = onScriptLoad;

    var s = $document[0].getElementsByTagName('body')[0];
    s.appendChild(scriptTag);

    // import devs shapes
    scriptTag = $document[0].createElement('script');
    scriptTag.type = 'text/javascript';
    scriptTag.async = false;
    scriptTag.src = 'bower_components/joint/dist/joint.shapes.devs.min.js';
    scriptTag.onreadystatechange = function () {
      if (this.readyState == 'complete') onScriptLoad();
    };
    scriptTag.onload = onScriptLoad;

    // import devs graph class
    s = $document[0].getElementsByTagName('body')[0];
    s.appendChild(scriptTag);

    // import devs shapes
    scriptTag = $document[0].createElement('script');
    scriptTag.type = 'text/javascript';
    scriptTag.async = false;
    scriptTag.src = 'components/scripts/devs.js';
    scriptTag.onreadystatechange = function () {
      if (this.readyState == 'complete') onScriptLoad();
    };
    scriptTag.onload = onScriptLoad;

    s = $document[0].getElementsByTagName('body')[0];
    s.appendChild(scriptTag);

    return service;
  }]);