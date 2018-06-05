var gulp       = require('gulp'),
    gutil      = require('gulp-util'),
    uglify     = require('gulp-uglify'),
    cssmin     = require('gulp-css'),
    concat     = require('gulp-concat'),
    webserver  = require('gulp-webserver'),
    livereload = require('gulp-livereload'),
    rename     = require('gulp-rename');


var appNames = ['bill', 'customer', 'data', 'direct', 'etc', 'event', 'home', 'membership', 'myt', 'product', 'roaming', 'search', 'user'];
// for docker (dev env)
var dist     = 'src/server/public/cdn/';
// var dist     = 'dist/';

gulp.task('server', function () {
  return gulp.src(dist)
    .pipe(webserver({
      host: '0.0.0.0',
      port: 3001,
      livereload: true,
      auto: false
    }));
});

gulp.task('js-vendor', function () {
  return gulp.src([
    'node_modules/jquery/dist/jquery.min.js',
    'node_modules/underscore/underscore-min.js',
    'node_modules/slick-carousel/slick/slick.min.js',
    'node_modules/moment/min/moment.min.js'])
    .on('error', function (err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest(dist + 'js'));

});

gulp.task('js-util', function () {
  return gulp.src([
    'src/client/configs/**/*.js',
    'src/client/types/**/*.js',
    'src/client/polyfill/**/*.js',
    'src/client/plugins/**/*.js',
    'src/client/services/**/*.js',
    'src/client/utils/**/*.js'])
    .pipe(concat('util.js'))
    .pipe(gulp.dest(dist + 'js'))
    .pipe(uglify())
    .on('error', function (err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(rename('util.min.js'))
    .pipe(gulp.dest(dist + 'js'));
});

gulp.task('js-common', function () {
  return gulp.src('src/client/common/**/*.js')
    .pipe(concat('common.js'))
    .pipe(gulp.dest(dist + 'js'))
    .pipe(uglify())
    .on('error', function (err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(rename('common.min.js'))
    .pipe(gulp.dest(dist + 'js'));
});

gulp.task('js-ui', function () {
  return gulp.src('src/client/ui/**/*.js')
    .pipe(concat('ui.js'))
    .pipe(gulp.dest(dist + 'js'))
    .pipe(uglify())
    .on('error', function (err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(rename('ui.min.js'))
    .pipe(gulp.dest(dist + 'js'));
});

gulp.task('css-vendor', function () {
  return gulp.src([
    'node_modules/slick-carousel/slick/slick.css'])
    .pipe(concat('vendor.css'))
    .pipe(gulp.dest(dist + 'css'));
});

gulp.task('css-common', function () {
  return gulp.src('src/client/common/css/**/*.css')
    .pipe(concat('common.css'))
    .pipe(gulp.dest(dist + 'css'))
    .pipe(cssmin())
    .pipe(rename('common.min.css'))
    .pipe(gulp.dest(dist + 'css'));
});

appNames.map((app) => {
  gulp.task('js-' + app, function () {
    return gulp.src('src/client/app/' + app + '/js/**/*.js')
      .pipe(concat(app + '.js'))
      .pipe(gulp.dest(dist + 'js'))
      .pipe(uglify())
      .on('error', function (err) {
        gutil.log(gutil.colors.red('[Error]'), err.toString());
      })
      .pipe(rename(app + '.min.js'))
      .pipe(gulp.dest(dist + 'js'));
  });

  gulp.task('css-' + app, function () {
    return gulp.src('src/client/app/home/css/**/*.css')
      .pipe(concat(app + '.css'))
      .pipe(gulp.dest(dist + 'css'))
      .pipe(cssmin())
      .pipe(rename(app + '.min.css'))
      .pipe(gulp.dest(dist + 'css'));
  });
});

gulp.task('watch', function () {
  livereload.listen();
  gulp.watch('src/client/**/*.js', ['js']);
  gulp.watch('src/client/**/*.css', ['css']);
  gulp.watch('dist/**').on('change', livereload.changed);
});

gulp.task('js-app', appNames.map((app) => 'js-' + app));
gulp.task('js', ['js-util', 'js-common', 'js-ui', 'js-app']);
gulp.task('css-app', appNames.map((app) => 'css-' + app));
gulp.task('css', ['css-common', 'css-app']);
gulp.task('vendor', ['js-vendor', 'css-vendor']);
gulp.task('default', ['server', 'vendor', 'js', 'css', 'watch']);
gulp.task('build', ['vendor', 'js', 'css']);