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


var watching = false;
var base = 'src/';

var config = {
  scssFile: base + 'assets/scss/style.scss',
  cssFiles: [
    base + 'assets/scss/style.css'
  ],
  jsFiles: [
    base + 'assets/js/script.js'
  ],
  pugFiles: [
    base + 'index.pug'
  ],
  distFolder: './dist'
};

// Compile scss file
gulp.task('sass', function() {
  return gulp.src(config.scssFile)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(concat('style.css'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(path.dirname(config.scssFile)));
});

// Watch version of the scss compilation
gulp.task('sass:watch', function() {
  watching = true;
  gulp.watch(config.scssFile, ['sass']);
});

// Concatenate, minify and compress css assets, with sourcemaps
gulp.task('compress:css', function() {
  var bef = size({title: 'all.css'});
  var aft = size({title: 'all.min.css.gz'});
  return gulp.src(config.cssFiles)
    .pipe(gulpif(!watching, bef))
    .pipe(sourcemaps.init())
    .pipe(cleanCSS({
      relativeTo: config.distFolder,
      target: config.distFolder,
      advanced: !watching
    }))
    .pipe(concat('all.min.css'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(config.distFolder))
    .pipe(gulpif(!watching, gzip()))
    .pipe(gulpif(!watching, aft))
    .pipe(gulp.dest(config.distFolder))
    .on('finish', function() {
      if (!watching) {
        gutil.log('CSS Compression: ' + Math.round((bef.size - aft.size) / bef.size * 100) + '%');
      }
    });
});

// Watch version of css compression
gulp.task('compress:css:watch', function() {
  watching = true;
  gulp.watch(config.cssFiles, ['compress:css']);
});

// Minify and compress html
gulp.task('compress:html', function() {
  var bef = size({title: 'index.html'});
  var aft = size({title: 'index.min.html.gz'});
  return gulp.src(config.pugFiles)
    .pipe(pug({}))
    .pipe(gulpif(!watching, bef))
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(rename(function(path) {
      path.basename += '.min';
    }))
    .pipe(gulp.dest(config.distFolder))
    .pipe(gulpif(!watching, gzip()))
    .pipe(gulpif(!watching, aft))
    .pipe(gulp.dest(config.distFolder))
    .on('finish', function() {
      if (!watching) {
        gutil.log('HTML Compression: ' + Math.round((bef.size - aft.size) / bef.size * 100) + '%');
      }
    });
});


// Full build task
gulp.task('build', function(cb) {
  // change this to gulp.series from gulp 4.0 onwards
  // see https://github.com/OverZealous/run-sequence
  runSequence(/*'sass', 'compress:css', */'compress:html', cb);
});


// Combine all watch tasks for development
gulp.task('watch:all', ['sass:watch', 'compress:css:watch']);
