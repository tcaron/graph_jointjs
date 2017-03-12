'use strict';

angular.module('artisStudio.version', [
  'artisStudio.version.interpolate-filter',
  'artisStudio.version.version-directive'
])

.value('version', '0.1');
