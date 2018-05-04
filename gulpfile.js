var gulp       = require('gulp'),
    gutil      = require('gulp-util'),
    uglify     = require('gulp-uglify'),
    cssmin     = require('gulp-css'),
    concat     = require('gulp-concat'),
    webserver  = require('gulp-webserver'),
    livereload = require('gulp-livereload'),
    rename     = require('gulp-rename');

gulp.task('server', function () {
  return gulp.src('dist/')
    .pipe(webserver({
      host: '0.0.0.0',
      port: 3001,
      livereload: true,
      auto: false
    }));
});

gulp.task('vendor', function () {
  return gulp.src([
    'node_modules/jquery/dist/jquery.min.js',
    'node_modules/underscore/underscore-min.js'])
    .on('error', function (err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest('dist/js'));

});

gulp.task('js-util', function () {
  return gulp.src([
    'src/client/configs/**/*.js',
    'src/client/plugins/**/*.js',
    'src/client/services/**/*.js',
    'src/client/types/**/*.js'])
    .pipe(concat('util.js'))
    .pipe(gulp.dest('dist/js'))
    .pipe(uglify())
    .on('error', function (err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(rename('util.min.js'))
    .pipe(gulp.dest('dist/js'));
});

gulp.task('js-common', function () {
  return gulp.src('src/client/common/**/*.js')
    .pipe(concat('common.js'))
    .pipe(gulp.dest('dist/js'))
    .pipe(uglify())
    .on('error', function (err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(rename('common.min.js'))
    .pipe(gulp.dest('dist/js'));
});

gulp.task('js-bill', function () {
  return gulp.src([
    'src/client/app/bill/js/models/**/*.js',
    'src/client/app/bill/js/views/**/*.js'])
    .pipe(concat('bill.js'))
    .pipe(gulp.dest('dist/js'))
    .pipe(uglify())
    .on('error', function (err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(rename('bill.min.js'))
    .pipe(gulp.dest('dist/js'));
});

gulp.task('js-customer', function () {
  return gulp.src([
    'src/client/app/customer/js/models/**/*.js',
    'src/client/app/customer/js/views/**/*.js'])
    .pipe(concat('customer.js'))
    .pipe(gulp.dest('dist/js'))
    .pipe(uglify())
    .on('error', function (err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(rename('customer.min.js'))
    .pipe(gulp.dest('dist/js'));
});

gulp.task('js-data', function () {
  return gulp.src([
    'src/client/app/data/js/models/**/*.js',
    'src/client/app/data/js/views/**/*.js'])
    .pipe(concat('data.js'))
    .pipe(gulp.dest('dist/js'))
    .pipe(uglify())
    .on('error', function (err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(rename('data.min.js'))
    .pipe(gulp.dest('dist/js'));
});

gulp.task('js-direct', function () {
  return gulp.src([
    'src/client/app/direct/js/models/**/*.js',
    'src/client/app/direct/js/views/**/*.js'])
    .pipe(concat('direct.js'))
    .pipe(gulp.dest('dist/js'))
    .pipe(uglify())
    .on('error', function (err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(rename('direct.min.js'))
    .pipe(gulp.dest('dist/js'));
});

gulp.task('js-etc', function () {
  return gulp.src([
    'src/client/app/etc/js/models/**/*.js',
    'src/client/app/etc/js/views/**/*.js'])
    .pipe(concat('etc.js'))
    .pipe(gulp.dest('dist/js'))
    .pipe(uglify())
    .on('error', function (err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(rename('etc.min.js'))
    .pipe(gulp.dest('dist/js'));
});

gulp.task('js-event', function () {
  return gulp.src([
    'src/client/app/event/js/models/**/*.js',
    'src/client/app/event/js/views/**/*.js'])
    .pipe(concat('event.js'))
    .pipe(gulp.dest('dist/js'))
    .pipe(uglify())
    .on('error', function (err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(rename('event.min.js'))
    .pipe(gulp.dest('dist/js'));
});

gulp.task('js-home', function () {
  return gulp.src([
    'src/client/app/home/js/models/**/*.js',
    'src/client/app/home/js/views/**/*.js'])
    .pipe(concat('home.js'))
    .pipe(gulp.dest('dist/js'))
    .pipe(uglify())
    .on('error', function (err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(rename('home.min.js'))
    .pipe(gulp.dest('dist/js'));
});

gulp.task('js-membership', function () {
  return gulp.src([
    'src/client/app/membership/js/models/**/*.js',
    'src/client/app/membership/js/views/**/*.js'])
    .pipe(concat('membership.js'))
    .pipe(gulp.dest('dist/js'))
    .pipe(uglify())
    .on('error', function (err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(rename('membership.min.js'))
    .pipe(gulp.dest('dist/js'));
});

gulp.task('js-myt', function () {
  return gulp.src([
    'src/client/app/myt/js/models/**/*.js',
    'src/client/app/myt/js/views/**/*.js'])
    .pipe(concat('product.js'))
    .pipe(gulp.dest('dist/js'))
    .pipe(uglify())
    .on('error', function (err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(rename('product.min.js'))
    .pipe(gulp.dest('dist/js'));
});

gulp.task('js-product', function () {
  return gulp.src([
    'src/client/app/product/js/models/**/*.js',
    'src/client/app/product/js/views/**/*.js'])
    .pipe(concat('product.js'))
    .pipe(gulp.dest('dist/js'))
    .pipe(uglify())
    .on('error', function (err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(rename('product.min.js'))
    .pipe(gulp.dest('dist/js'));
});

gulp.task('js-roaming', function () {
  return gulp.src([
    'src/client/app/roaming/js/models/**/*.js',
    'src/client/app/roaming/js/views/**/*.js'])
    .pipe(concat('roaming.js'))
    .pipe(gulp.dest('dist/js'))
    .pipe(uglify())
    .on('error', function (err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(rename('roaming.min.js'))
    .pipe(gulp.dest('dist/js'));
});

gulp.task('js-search', function () {
  return gulp.src([
    'src/client/app/search/js/models/**/*.js',
    'src/client/app/search/js/views/**/*.js'])
    .pipe(concat('search.js'))
    .pipe(gulp.dest('dist/js'))
    .pipe(uglify())
    .on('error', function (err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(rename('search.min.js'))
    .pipe(gulp.dest('dist/js'));
});

gulp.task('js-user', function () {
  return gulp.src([
    'src/client/app/user/js/models/**/*.js',
    'src/client/app/user/js/views/**/*.js'])
    .pipe(concat('user.js'))
    .pipe(gulp.dest('dist/js'))
    .pipe(uglify())
    .on('error', function (err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(rename('user.min.js'))
    .pipe(gulp.dest('dist/js'));
});

gulp.task('watch', function () {
  livereload.listen();
  gulp.watch('src/client/**/*.js', ['js']);
  gulp.watch('src/client/**/*.css', ['css']);
  gulp.watch('dist/**').on('change', livereload.changed);
});

gulp.task('js', ['js-util', 'js-common', 'js-bill', 'js-customer', 'js-data', 'js-direct', 'js-etc', 'js-event',
  'js-home', 'js-membership', 'js-myt', 'js-product', 'js-roaming', 'js-search', 'js-user']);
gulp.task('default', ['server', 'vendor', 'js', 'watch']);
gulp.task('build', ['vendor', 'js']);