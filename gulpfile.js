var path = require('path');
var gulp = require('gulp');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var cleanCSS = require('gulp-clean-css');
var uglify = require('gulp-uglifyes');
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
var moduleImporter = require('sass-module-importer');


var prod = false;
const BASE_URL = 'src/';

var config = {
  scssFile: BASE_URL + 'assets/scss/index.scss',
  scssFiles: BASE_URL + 'assets/scss/*.scss',
  cssFiles: [
    BASE_URL + 'assets/scss/style.css'
  ],
  jsFiles: [
    BASE_URL + 'assets/js/main.js'
  ],
  images: [
    BASE_URL + 'assets/images/**/*.*'
  ],
  pugFiles: [
    BASE_URL + '**/*.pug'
  ],
  index: BASE_URL + 'index.pug',
  distFolder: './dist'
};

// Compile scss file
gulp.task('sass', function sass() {
  var bef = size({title: 'all.css'});
  var aft = size({title: 'all.min.css.gz'});

  return gulp.src(config.scssFile)
    .pipe(sourcemaps.init())
    .pipe(sass({ importer: moduleImporter() }).on('error', sass.logError))
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
gulp.task('sass:watch', gulp.series('sass', function watchSass() {
  gulp.watch(config.scssFiles, ['sass']);
}));


// Minify and compress html
gulp.task('html', function html() {
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
gulp.task('html:watch', gulp.series('html', function watchHtml() {
  gulp.watch(config.pugFiles, gulp.series('html'));
}));


gulp.task('images', function images() {
  return gulp.src(config.images)
    .pipe(gulp.dest(config.distFolder + '/assets/images/'))
});

gulp.task('images:watch', gulp.series('images', function watchImages() {
  gulp.watch(config.images, gulp.series('images'));
}));

gulp.task('scripts', function scripts() {
  return gulp.src(config.jsFiles)
  .pipe(sourcemaps.init())
  .pipe(gulpif(prod, uglify()))
  .on('error', function (err) { gutil.log(gutil.colors.red('[Error]'), err.toString()); })
  .pipe(sourcemaps.write('.'))
  .pipe(gulp.dest(config.distFolder))  
  .pipe(gulpif(prod, gzip()))
  .pipe(gulpif(!prod, connect.reload()))    
  .pipe(gulp.dest(config.distFolder))
});

gulp.task('scripts:watch', gulp.series('scripts', function watchScripts() {
  gulp.watch(config.jsFiles, gulp.series('scripts'));
}));

gulp.task('clean', function clean(cb) {
  return gulp.src('dist', {read: false})
    .pipe(clean());
    cb();
});

const buildTasks = [
  'clean',
  'sass',
  'html',
  'images',
  'scripts'
]
// Full build task
gulp.task('build', function build(cb) {
  // change this to gulp.series from gulp 4.0 onwards
  // see https://github.com/OverZealous/run-sequence

  prod = true;

  runSequence(...buildTasks, cb);
});

gulp.task('webserver', function webserver() {
  connect.server({
    root: 'dist',
    port: 8090,
    livereload: true
  });
});

const watchTasks = [
  'clean',
  'images:watch',
  'sass:watch',
  'html:watch',
  'scripts:watch'
]
// Combine all watch tasks for development
gulp.task('watch:all', function watchAll(cb) {
  runSequence(...watchTasks, cb);
});

gulp.task('default', gulp.series('webserver', 'watch:all'));
