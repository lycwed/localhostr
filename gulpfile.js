var gulp    = require('gulp');
var sass    = require('gulp-sass');
var inject  = require('gulp-inject');
var concat  = require('gulp-concat');
var minCss  = require('gulp-minify-css');
var rename  = require('gulp-rename');
var jshint  = require('gulp-jshint');
var conUtil = require('gulp-concat-util');
var flatten = require('gulp-flatten');
var filesort = require('gulp-angular-filesort');

var paths = {
  scss: ['./app/assets/css/frmk/*.scss', './app/assets/css/*.scss'],
  js: './app/assets/js/**/*.js'
};

// JS

gulp.task('jshint', function() {
  return gulp.src(paths.js)
             .pipe(jshint())
             .pipe(jshint.reporter('default'));
});

gulp.task('lib_js', function() {
  return gulp.src('./bower_components/angular/angular.min.js')
             .pipe(gulp.dest('./app/assets/js/lib/'));

  return gulp.src('./bower_components/**/*.min.js.map')
             .pipe(flatten())
             .pipe(gulp.dest('./app/assets/js/lib/'));

  return gulp.src('./bower_components/**/angular*.min.js')
             .pipe(flatten())
             .pipe(gulp.dest('./app/assets/js/lib/'));
});


// SCSS / CSS

gulp.task('sass', function() {
  return gulp.src('./app/assets/css/frmk/*.scss')
             .pipe(sass())
             .pipe(concat({
               path: '_styles.css'
             }))
             .pipe(gulp.dest('./tmp/css/'));
});

gulp.task('css', ['sass'], function() {
  setTimeout(function(){
    return gulp.src('./tmp/css/_styles.css')
               .pipe(concat({
                 path: 'styles.css'
               }))
               .pipe(minCss())
               .pipe(gulp.dest('./app/assets/css/'));
  }, 400);
});


// COMPILE APP

gulp.task('app', ['jshint', 'lib_js', 'css'], function() {
  injectToIndex('app');
});


// COMPILE WWW

gulp.task('min_ctrls', function() {
  var process = function() {
    return conUtil('controllers.js', {
      process: function(src) {
        return (src.trim() + '\n').replace(/(^|\n)[ \t]*('use strict'|"use strict");?\s*/g, '$1');
      }
    })
  };

  return gulp.src('./app/assets/js/controller/*.js')
             .pipe(process())
             .pipe(conUtil.header('\'use strict\';\n\n'))
             .pipe(gulp.dest('./www/assets/js/core/'));
});

gulp.task('default', ['min_ctrls', 'sass'], function() {

  // copy js to lib
  gulp.src('./app/assets/js/lib/*.*')
             .pipe(gulp.dest('./www/assets/js/lib/'));

  // copy js to core
  gulp.src('./app/assets/js/core/*.js')
             .pipe(gulp.dest('./www/assets/js/core/'));

  // copy images
  gulp.src('./app/assets/images/**/*.*')
             .pipe(gulp.dest('./www/assets/images/'));

  // copy fonts
  gulp.src('./app/assets/fonts/**/*.*')
             .pipe(gulp.dest('./www/assets/fonts/'));

  // copy css
  gulp.src('./tmp/css/*.css')
             .pipe(concat({
               path: 'styles.min.css'
             }))
             .pipe(gulp.dest('./www/assets/css/'));

  // copy locales
  gulp.src('./app/locales/*.json')
             .pipe(gulp.dest('./www/locales/'));

  // copy templates
  gulp.src('./app/templates/**/*.*')
             .pipe(gulp.dest('./www/templates/'));

  // copy core
  gulp.src('./app/core/**/*.php')
             .pipe(gulp.dest('./www/core/'));

  // copy index
  gulp.src('./app/default.json')
             .pipe(rename({
               name: "config.json"
             }))
             .pipe(gulp.dest('./www/'));

  // copy index
  gulp.src('./app/index.php')
             .pipe(rename({
               prefix: "_"
             }))
             .pipe(gulp.dest('./www/'));

  injectToIndex('www');
});

function getRelPath(scope, path) {
  return path.replace('/' + scope, '.');
};

function injectToIndex(scope) {
  setTimeout(function() {
    // inject css, lib js, core js
    return gulp.src('./' + scope + '/templates/index.html')
               .pipe(inject(gulp.src('./' + scope + '/assets/css/*.css', {read: false}), {
                 transform: function (filePath) {
                   return '<link rel="stylesheet" href="' + getRelPath(scope, filePath) + '">';
                 }
               }))
               .pipe(inject(gulp.src('./' + scope + '/assets/js/lib/*.js', {read: false}).pipe(filesort()), {
                 name: 'lib',
                 transform: function (filePath) {
                   return '<script src="' + getRelPath(scope, filePath) + '"></script>';
                 }
               }))
               .pipe(inject(gulp.src([
                 './' + scope + '/assets/js/core/*.js',
                 './' + scope + '/assets/js/controller/*.js'
                 ], {read: false}), {
                 name: 'core',
                 transform: function (filePath) {
                   return '<script src="' + getRelPath(scope, filePath) + '"></script>';
                 }
               }))
               .pipe(gulp.dest('./' + scope + '/templates/'));
  }, 1000);
}

gulp.task('dev', ['jshint', 'lib_js', 'css'], function() {
  injectToIndex('app');
  gulp.watch(paths.scss, ['app']);
  gulp.watch(paths.js, ['app']);
});
