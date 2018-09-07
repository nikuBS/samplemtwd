var gulp       = require('gulp'),
    gutil      = require('gulp-util'),
    uglify     = require('gulp-uglify'),
    concat     = require('gulp-concat'),
    webserver  = require('gulp-webserver'),
    livereload = require('gulp-livereload'),
    rename     = require('gulp-rename'),
    base64     = require('gulp-base64');


var appNames = ['home', 'myt', 'recharge', 'payment', 'customer', 'auth']; // search
// for docker (dev env)
var dist = 'src/server/public/cdn/';
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
    'node_modules/jquery-ui-dist/jquery-ui.min.js',
    'node_modules/jquery-ui-touch-punch/jquery.ui.touch-punch.min.js',
    'node_modules/underscore/underscore-min.js',
    'node_modules/handlebars/dist/handlebars.min.js',
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
    'src/client_old/configs/**/*.js',
    'src/client_old/types/**/*.js',
    'src/client_old/polyfill/**/*.js',
    'src/client_old/plugins/**/*.js',
    'src/client_old/utils/**/*.js',
    'src/client_old/services/**/*.js',
    'src/client_old/component/**/*.js',
    'src/client_old/common/**/*.js'])
    .pipe(concat('util.js'))
    .pipe(gulp.dest(dist + 'js'))
    .pipe(uglify())
    .on('error', function (err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(rename('util.min.js'))
    .pipe(gulp.dest(dist + 'js'));
});

appNames.map(function (app, index) {
  gulp.task('js-' + app, function () {
    return gulp.src('src/client_old/app/0' + index + '.' + app + '/**/*.js')
      .pipe(concat(app + '.js'))
      .pipe(gulp.dest(dist + 'js'))
      .pipe(uglify())
      .on('error', function (err) {
        gutil.log(gutil.colors.red('[Error]'), err.toString());
      })
      .pipe(rename(app + '.min.js'))
      .pipe(gulp.dest(dist + 'js'));
  });
});

gulp.task('css-vendor', function () {
  return gulp.src([
    'node_modules/slick-carousel/slick/slick.css'])
    .pipe(concat('vendor.css'))
    .pipe(gulp.dest(dist + 'css'));
});

gulp.task('js-rb', function () {
  return gulp.src('src/client_old/right-brain/js/script.min.js')
    .pipe(gulp.dest(dist + 'js'));
});

// gulp.task('js-rb', function () {
//   return gulp.src([
//     'src/client_old/right-brain/js/$vars.js',
//     'src/client_old/right-brain/js/common.js',
//     'src/client_old/right-brain/js/components.js',
//     'src/client_old/right-brain/js/widgets.js'
//   ])
//     .pipe(concat('script.min.js'))
//     .pipe(gulp.dest(dist + 'js'));
// });

// for sprint3
// gulp.task('js-rb-sprint3', function () {
//   return gulp.src('src/client_old/right-brain/js-sprint3/**/*.js')
//     .pipe(concat('ui-sprint3.js'))
//     .pipe(gulp.dest(dist + 'js'))
//     .pipe(uglify())
//     .on('error', function (err) {
//       gutil.log(gutil.colors.red('[Error]'), err.toString());
//     })
//     .pipe(rename('ui-sprint3.min.js'))
//     .pipe(gulp.dest(dist + 'js'));
// });

gulp.task('css-rb', function () {
  return gulp.src(['src/client_old/right-brain/css/**/*.css', '!src/client_old/right-brain/css/**/*.min.css'])
    .pipe(base64({
      baseDir: 'src/client_old/right-brain/',
      extensions: ['svg', 'png', /\.jpg#datauri$/i],
      maxImageSize: 10 * 1024 * 1024, // bytes
      debug: true
    }))
    .pipe(concat('style.min.css'))
    // .pipe(uglify())
    .pipe(gulp.dest(dist + 'css'));
});

gulp.task('img', function () {
  return gulp.src('src/client_old/right-brain/img/dummy/**/*')
    .pipe(gulp.dest(dist + 'img/dummy'));
});

gulp.task('hbs', function () {
  return gulp.src('src/client_old/right-brain/hbs/**/*')
    .pipe(gulp.dest(dist + 'hbs'));
});

gulp.task('resource', function () {
  return gulp.src('src/client_old/right-brain/resource/**/*')
    .pipe(gulp.dest(dist + 'resource'));
});


gulp.task('watch', function () {
  livereload.listen();
  gulp.watch('src/client_old/**/*.hbs', ['hbs']);
  gulp.watch('src/client_old/**/*.js', ['js', 'js-rb']);
  gulp.watch('src/client_old/**/*.css', ['css-vendor', 'css-rb']);
  gulp.watch('dist/**').on('change', livereload.changed);
});

gulp.task('js-app', appNames.map(function (app) {
  return 'js-' + app;
}));
gulp.task('js', ['js-util', 'js-app']);
gulp.task('vendor', ['js-vendor', 'css-vendor']);
gulp.task('rb', ['js-rb', 'css-rb', 'img', 'hbs']);
gulp.task('default', ['server', 'vendor', 'js', 'rb', 'resource', 'watch']);
gulp.task('build', ['vendor', 'js', 'rb', 'resource']);