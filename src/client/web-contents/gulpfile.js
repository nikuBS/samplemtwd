// test comment
var gulp       = require('gulp'),
    gutil      = require('gulp-util'),
    uglify     = require('gulp-uglify'),
    concat     = require('gulp-concat'),
    rename     = require('gulp-rename'),
    // base64     = require('gulp-base64'),
    rev        = require('gulp-rev'),
    extend     = require('gulp-extend'),
    shell      = require('gulp-shell'),
    clean      = require('gulp-clean'),
    remoteSrc  = require('gulp-remote-src'),
    jeditor    = require('gulp-json-editor'),
    options    = require('gulp-options');

var dist = 'dist/';

var version = options.get('ver');
var manifestFile = 'manifest.' + version + '.json';
var manifestDev = 'manifest.dev.json';

gulp.task('test', function () {
  return 'success';
});

gulp.task('pre-clean', function () {
  return gulp.src(dist)
    .pipe(clean());
});

gulp.task('js-rb', function () {
  return gulp.src([
    'js/**/*.js', '!js/**/*.min.js'
  ])
    .pipe(concat('script.js'))
    // .pipe(gulp.dest(dist_tmp + 'js'))
    .pipe(gulp.dest(dist + 'js'))
    .pipe(uglify())
    .on('error', function (err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(rename('script.min.js'))
    .pipe(rev())
    // .pipe(gulp.dest(dist_tmp + 'js'))
    .pipe(gulp.dest(dist + 'js'))
    .pipe(rev.manifest(dist + 'tmp/js-manifest.json', {
      merge: true
    }))
    .pipe(gulp.dest('.'));
});

gulp.task('css-rb', function () {
  return gulp.src([
    'css/**/common.css',
    'css/**/layout.css',
    'css/**/widgets.css',
    'css/**/components.css',
    'css/**/m_product.css',
    '!css/**/*.min.css'])
  // .pipe(base64({
  //   baseDir: '',
  //   extensions: ['svg', 'png', /\.jpg#datauri$/i],
  //   maxImageSize: 10 * 1024 * 1024, // bytes
  //   debug: true
  // }))
    .pipe(concat('style.css'))
    // .pipe(imagehash())
    // .pipe(uglify())
    // .pipe(gulp.dest(dist_tmp + 'css'))
    .pipe(gulp.dest(dist + 'css'))
    .on('error', function (err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(rename('style.min.css'))
    .pipe(rev())
    // .pipe(gulp.dest(dist_tmp + 'css'))
    .pipe(gulp.dest(dist + 'css'))
    .pipe(rev.manifest(dist + 'tmp/css-manifest.json', {
      merge: true
    }))
    .pipe(gulp.dest('.'));
});

gulp.task('css-copy', function() {
  return gulp.src([
    'css/**/idpt-reset-mobile.css',
    'css/**/idpt-service-mobile.css',
    'css/**/m_product.css'
  ]).pipe(gulp.dest(dist + 'css'));
});

gulp.task('img', function () {
  return gulp.src('img/**/*')
  // .pipe(gulp.dest(dist_tmp + 'img'))
    .pipe(gulp.dest(dist + 'img'));
});

gulp.task('hbs', function () {
  return gulp.src('hbs/**/*')
  // .pipe(gulp.dest(dist_tmp + 'hbs'))
    .pipe(gulp.dest(dist + 'hbs'));
});

gulp.task('font', function () {
  return gulp.src('font/**/*')
  // .pipe(gulp.dest(dist_tmp + 'font'))
    .pipe(gulp.dest(dist + 'font'));
});

gulp.task('resource', function () {
  return gulp.src('resource/**/*')
  // .pipe(gulp.dest(dist_tmp + 'resource'))
    .pipe(gulp.dest(dist + 'resource'));
});

gulp.task('manifest', function () {
  return gulp.src([dist + 'tmp/*.json'])
    .pipe(extend(manifestFile))
    .pipe(gulp.dest(dist));
});

gulp.task('manifest-dev', function () {
  return gulp.src([dist + 'tmp/*.json'])
    .pipe(extend(manifestDev))
    // .pipe(gulp.dest(dist_tmp))
    .pipe(gulp.dest(dist));
});

gulp.task('cab', function () {
  return gulp.src('cab/**/*')
  // .pipe(gulp.dest(dist_tmp + 'cab'))
    .pipe(gulp.dest(dist + 'cab'));
});

gulp.task('post-clean', function () {
  return gulp.src(dist + 'tmp')
    .pipe(clean());
});

gulp.task('get-manifest', function () {
  return remoteSrc('manifest.dev.json', {
    base: 'http://localhost:3001/'
  })
    .on('error', function (err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(jeditor(function (json) {
      manifest = json;
    }));
});

gulp.task('rb', ['js-rb', 'css-rb', 'css-copy', 'img', 'hbs', 'font']);

gulp.task('task', ['rb', 'resource', 'cab']);

gulp.task('default', shell.task([
  'gulp pre-clean --ver=' + version,
  // 'gulp pre-clean-tmp --ver=' + version,
  'gulp task --ver=' + version,
  'gulp manifest-dev --ver=' + version,
  'gulp post-clean --ver=' + version
]));

gulp.task('build', shell.task([
  'gulp pre-clean --ver=' + version,
  // 'gulp pre-clean-tmp --ver=' + version,
  'gulp task --ver=' + version,
  'gulp manifest --ver=' + version,
  'gulp manifest-dev --ver=' + version,
  'gulp post-clean --ver=' + version
]));

gulp.task('client-build', ['get-manifest'], function () {
  gulp.start('js-client');
});
