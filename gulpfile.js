var path = require('path');
var gulp = require('gulp');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var cleanCSS = require('gulp-clean-css');
var uglify = require('gulp-uglify');
var gulpif = require('gulp-if');
var rename = require('gulp-rename');
var htmlmin = require('gulp-htmlmin');
var size = require('gulp-size');
var gutil = require('gulp-util');
var gzip = require('gulp-gzip');
var runSequence = require('run-sequence');
var pug = require('gulp-pug');
var connect = require('gulp-connect');
var clean = require('gulp-clean');


var prod = false;
var base = 'src/';

var config = {
  scssFile: base + 'assets/scss/main.scss',
  cssFiles: [
    base + 'assets/scss/style.css'
  ],
  jsFiles: [
    base + 'assets/js/script.js'
  ],
  pugFiles: [
    base + '**/*.pug'
  ],
  index: base + 'index.pug',
  distFolder: './dist'
};

// Compile scss file
gulp.task('sass', function() {
  var bef = size({title: 'all.css'});
  var aft = size({title: 'all.min.css.gz'});

  return gulp.src(config.scssFile)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(gulpif(prod, bef))
    .pipe(cleanCSS({
      relativeTo: config.distFolder,
      target: config.distFolder,
      advanced: prod
    }))
    .pipe(concat('all.min.css'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(config.distFolder))
    .pipe(gulpif(prod, gzip()))
    .pipe(gulpif(prod, aft))
    .pipe(gulp.dest(config.distFolder))
    .pipe(gulpif(!prod, connect.reload()))
    .on('finish', function() {
      if (prod) {
        gutil.log('CSS Compression: ' + Math.round((bef.size - aft.size) / bef.size * 100) + '%');
      }
    });
});

// Watch version of the scss compilation
gulp.task('sass:watch', ['sass'], function() {
  gulp.watch(config.scssFile, ['sass']);
});


// Minify and compress html
gulp.task('html', function() {
  var bef = size({title: 'index.html'});
  var aft = size({title: 'index.html.gz'});
  return gulp.src(config.index)
    .pipe(pug({}))
    .pipe(gulpif(prod, bef))
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest(config.distFolder))
    .pipe(gulpif(prod, gzip()))
    .pipe(gulpif(prod, aft))
    .pipe(gulp.dest(config.distFolder))
    .pipe(gulpif(!prod, connect.reload()))
    .on('finish', function() {
      if (prod) {
        gutil.log('HTML Compression: ' + Math.round((bef.size - aft.size) / bef.size * 100) + '%');
      }
    });
});

// Watch version of html compression
gulp.task('html:watch', ['html'], function() {
  gulp.watch(config.pugFiles, ['html']);
});

gulp.task('clean', function () {
  return gulp.src('dist/**/*.*', {read: false})
    .pipe(clean());
});


// Full build task
gulp.task('build', function(cb) {
  // change this to gulp.series from gulp 4.0 onwards
  // see https://github.com/OverZealous/run-sequence

  prod = true;

  runSequence('clean', 'sass', 'html', cb);
});

gulp.task('webserver', function() {
  connect.server({
    root: 'dist',
    livereload: true
  });
});


// // Combine all watch tasks for development
gulp.task('watch:all', function(cb) {
  runSequence('clean', 'sass:watch', 'html:watch', cb);
});

gulp.task('default', ['webserver', 'watch:all']);
