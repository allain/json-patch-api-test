var gulp = require('gulp');
var browserify = require('gulp-browserify');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var watch = require('gulp-watch');

// Basic usage
gulp.task('scripts', function() {
  // Single entry point to browserify
  gulp.src('public/js/app.js')
  .pipe(browserify({
    insertGlobals : true,
    debug : !gulp.env.production
  }))
  .pipe(concat('bundle.js'))
  //.pipe(uglify())
  .pipe(gulp.dest('./public/'));
});

gulp.task('watch', function() {
  watch('public/js/**/*.js', function () {
    gulp.start('scripts');
  });
});
