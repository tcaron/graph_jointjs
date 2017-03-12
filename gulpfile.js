var gulp = require('gulp');
var connect = require('gulp-connect');
var gettext = require('gulp-angular-gettext');
var install = require("gulp-install");

var paths = {
  app: 'app',
  src: ['app/*.html', 'app/views/*.html', 'app/styles/*.css', 'app/scripts/*.js']
};

gulp.task('pot', function () {
  return gulp.src(['app/views/**/*.html', 'app/scripts/**/*.js'])
      .pipe(gettext.extract('template.pot', {
      }))
      .pipe(gulp.dest('po/'));
});

gulp.task('translations', function () {
  return gulp.src('po/**/*.po')
      .pipe(gettext.compile({
        format: 'javascript'
      }))
      .pipe(gulp.dest('app/scripts/translations/'));
});