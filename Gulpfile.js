var gulp = require('gulp');
var browserify = require('gulp-browserify');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var watch = require('gulp-watch');
var wrap  = require('gulp-wrap');
var declare = require('gulp-declare');
var handlebars = require('gulp-handlebars');

gulp.task('scripts', function() {
  // Single entry point to browserify
  gulp.src('src/js/app.js')
  .pipe(browserify({
    insertGlobals : true,
    debug : !gulp.env.production
  }))
  .pipe(concat('bundle.js'))
  //.pipe(uglify())
  .pipe(gulp.dest('./public/js/'));
});

gulp.task('templates', function(){
  gulp.src('src/templates/**/*.hbs')
  .pipe(handlebars())
  .pipe(wrap('Handlebars.template(<%=contents%>)'))
  // Declare template functions as properties and sub-properties of exports
  .pipe(declare({
    root: 'exports',
    noRedeclare: true, // Avoid duplicate declarations
    processName: function(filePath) {
      // Allow nesting based on path using gulp-declare's processNameByPath()
      // You can remove this option completely if you aren't using nested folders
      // Drop the templates/ folder from the namespace path by removing it from the filePath
      return declare.processNameByPath(filePath.replace('src/templates/', ''));
    }
  }))
  .pipe(concat('templates.js'))
  // Add the Handlebars module in the final output
  .pipe(wrap('var Handlebars = require("handlebars");\n <%= contents %>'))
  // Write the output into the templates folder
  .pipe(gulp.dest('src/js/'));
});

gulp.task('watch', function() {
  watch('src/js/**/*.js', function () {
    gulp.start('scripts');
  });

  watch('src/templates/**/*.hbs', function () {
    gulp.start('templates');
  });
});
