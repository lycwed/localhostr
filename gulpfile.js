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
var bowerFiles = require('main-bower-files');

var compileFolder = 'LOCALHOSTR';
var paths = {
  scss: ['./app/assets/css/frmk/*.scss', './app/assets/css/*.scss'],
  js: './app/assets/js/**/*.js',
  icons: {
    'Icon-60.png': {
      rel: "icon",
      type: "image/png",
      sizes: "60x60"
    },
    'Icon-60@2x.png': {
      rel: "apple-touch-icon",
      type: "image/png",
      sizes: "120x120"
    }
  }
};

// JS

gulp.task('jshint', function() {
  return gulp.src(paths.js)
             .pipe(jshint())
             .pipe(jshint.reporter('default'));
});

gulp.task('lib_js', function() {
  return gulp.src(bowerFiles())
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
             .pipe(gulp.dest('./' + compileFolder + '/assets/js/core/'));
});

gulp.task('compile', ['min_ctrls', 'sass'], function() {

  // copy js to lib
  gulp.src('./app/assets/js/lib/*.*')
             .pipe(gulp.dest('./' + compileFolder + '/assets/js/lib/'));

  // copy js to core
  gulp.src('./app/assets/js/core/*.js')
             .pipe(gulp.dest('./' + compileFolder + '/assets/js/core/'));

  // copy images
  gulp.src('./app/assets/images/**/Icon-6*.png')
             .pipe(gulp.dest('./' + compileFolder + '/assets/images/'));

  // copy fonts
  gulp.src('./app/assets/fonts/**/*.*')
             .pipe(gulp.dest('./' + compileFolder + '/assets/fonts/'));

  // copy css
  gulp.src('./tmp/css/*.css')
             .pipe(concat({
               path: 'styles.min.css'
             }))
             .pipe(gulp.dest('./' + compileFolder + '/assets/css/'));

  // copy locales
  gulp.src('./app/locales/*.json')
             .pipe(gulp.dest('./' + compileFolder + '/locales/'));

  // copy templates
  gulp.src('./app/directives/**/*.*')
             .pipe(gulp.dest('./' + compileFolder + '/directives/'));

  // copy templates
  gulp.src('./app/templates/**/*.*')
             .pipe(gulp.dest('./' + compileFolder + '/templates/'));

  // copy core
  gulp.src('./app/core/**/*.php')
             .pipe(gulp.dest('./' + compileFolder + '/core/'));

  // copy index
  gulp.src('./app/default.json')
             .pipe(rename({
               basename: "config"
             }))
             .pipe(gulp.dest('./' + compileFolder + '/'));

  // copy index
  gulp.src('./app/index.php')
             .pipe(gulp.dest('./' + compileFolder + '/'));

  injectToIndex(compileFolder);
});

function getRelPath(scope, path) {
  return (scope !== compileFolder) ? path.replace('/' + scope, '.') : '.' + path;
};

function injectToIndex(scope) {
  setTimeout(function() {
    // inject css, lib js, core js
    return gulp.src('./' + scope + '/templates/index.phtml')
               .pipe(inject(gulp.src('./' + scope + '/assets/css/*.css', {read: false}), {
                  transform: function (filePath) {
                    return '<link rel="stylesheet" href="' + getRelPath(scope, filePath) + '">';
                  }
               }))
               .pipe(inject(gulp.src('./' + scope + '/assets/js/lib/*.js').pipe(filesort()), {
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
               .pipe(inject(gulp.src([
                  './' + scope + '/assets/images/icons/Icon-6*.png'
                  ], {read: false}), {
                  name: 'icons',
                  transform: function (filePath) {
                    var file = filePath.split('/').pop();
                    if (paths.icons.hasOwnProperty(file)) {
                      var infos = paths.icons[file];
                      return '<link rel="' + infos.rel + '" type="' + infos.type + '" sizes="' + infos.sizes + '" href="' + getRelPath(scope, filePath) + '"/>';
                    }
                  }
               }))
               .pipe(gulp.dest('./' + scope + '/templates/'));
  }, 1000);
}

gulp.task('default', ['jshint', 'lib_js', 'css'], function() {
  injectToIndex('app');
});

gulp.task('watch', ['app'], function() {
  gulp.watch(paths.scss, ['app']);
  gulp.watch(paths.js, ['app']);
});
