const path = require('path');
const gulp = require('gulp');
const sass = require('gulp-sass');
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');
const cleanCSS = require('gulp-clean-css');
const uglify = require('gulp-uglifyes');
const gulpif = require('gulp-if');
const htmlmin = require('gulp-htmlmin');
const size = require('gulp-size');
const gutil = require('gulp-util');
const gzip = require('gulp-gzip');
const pug = require('gulp-pug');
const connect = require('gulp-connect');
const del = require('del');
const moduleImporter = require('sass-module-importer');


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
gulp.task('sass', () => {
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
gulp.task('sass:watch', gulp.series('sass', done => {
  gulp.watch(config.scssFiles, gulp.series('sass'));
  done()
}));


// Minify and compress html
gulp.task('html', () => {
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
gulp.task('html:watch', gulp.series('html', done => {
  gulp.watch(config.pugFiles, gulp.series('html'));
  done();
}));


gulp.task('images', () => {
  return gulp.src(config.images)
    .pipe(gulp.dest(config.distFolder + '/assets/images/'))
});

gulp.task('images:watch', gulp.series('images', done => {
  gulp.watch(config.images, gulp.series('images'));
  done();
}));

gulp.task('scripts', () => {
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

gulp.task('scripts:watch', gulp.series('scripts', done => {
  gulp.watch(config.jsFiles, gulp.series('scripts'));
  done()
}));

gulp.task('clean', () => del('./dist/*'));

const buildTasks = [
  'clean',
  'sass',
  'html',
  'images',
  'scripts'
]
// Full build task
gulp.task('build', async done =>  {
  // change this to gulp.series from gulp 4.0 onwards
  // see https://github.com/OverZealous/run-sequence

  prod = true;

  await gulp.series(...buildTasks)();

  done()
});

gulp.task('webserver', done => {
  connect.server({
    root: 'dist',
    port: 8090,
    livereload: true
  });
  done()
});

const watchTasks = [
  'clean',
  'images:watch',
  'sass:watch',
  'html:watch',
  'scripts:watch'
]
// Combine all watch tasks for development
gulp.task('watch:all', gulp.series(...watchTasks));

gulp.task('default', gulp.series('webserver', 'watch:all'));
