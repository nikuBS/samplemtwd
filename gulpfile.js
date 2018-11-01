var gulp       = require('gulp'),
    gutil      = require('gulp-util'),
    uglify     = require('gulp-uglify'),
    concat     = require('gulp-concat'),
    webserver  = require('gulp-webserver'),
    livereload = require('gulp-livereload'),
    rename     = require('gulp-rename'),
    // base64     = require('gulp-base64'),
    rev        = require('gulp-rev'),
    sort       = require('gulp-sort'),
    extend     = require('gulp-extend'),
    shell      = require('gulp-shell'),
    clean      = require('gulp-clean'),
    remoteSrc  = require('gulp-remote-src'),
    jeditor    = require('gulp-json-editor'),
    options    = require('gulp-options');


var oldAppNames = ['home', 'myt', 'recharge', 'payment', 'customer', 'common'];
var appNames = ['common', 'main', 'myt-data', 'myt-fare', 'myt-join', 'product', 'benefit', 'membership', 'customer', 'tevent'];
// for docker (dev env)
var dist_tmp = 'src/server/public/cdn/';
var dist = 'dist/';

var config = 'src/server/config';
var manifest = {};
var version = options.get('ver');
var manifestFile = 'manifest.' + version + '.json';
var manifestTemp = 'manifest.json';

gulp.task('pre-clean', function () {
  return gulp.src(dist)
    .pipe(clean());
});

gulp.task('pre-clean-tmp', function () {
  return gulp.src(dist_tmp)
    .pipe(clean());
});

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
    'node_modules/moment/min/moment.min.js',
    'node_modules/jsbarcode/dist/JsBarcode.all.min.js'])
    .on('error', function (err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest(dist_tmp + 'js'))
    .pipe(gulp.dest(dist + 'js'));


});

gulp.task('js-util', function () {
  return gulp.src([
    'src/client/configs/**/*.js',
    'src/client/types/**/*.js',
    'src/client/polyfill/**/*.js',
    'src/client/plugins/**/*.js',
    'src/client/utils/**/*.js',
    'src/client/services/**/*.js',
    'src/client/component/**/*.js',
    'src/client/common/**/*.js'])
    .pipe(concat('util.js'))
    .pipe(gulp.dest(dist_tmp + 'js'))
    .pipe(gulp.dest(dist + 'js'))
    .pipe(uglify())
    .on('error', function (err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(rename('util.min.js'))
    .pipe(rev())
    .pipe(gulp.dest(dist_tmp + 'js'))
    .pipe(gulp.dest(dist + 'js'))
    .pipe(rev.manifest(dist + 'tmp/util-manifest.json'))
    .pipe(gulp.dest('.'));
});

gulp.task('js-util-client', function () {
  return gulp.src([
    'src/client/configs/**/*.js',
    'src/client/types/**/*.js',
    'src/client/polyfill/**/*.js',
    'src/client/plugins/**/*.js',
    'src/client/utils/**/*.js',
    'src/client/services/**/*.js',
    'src/client/component/**/*.js',
    'src/client/common/**/*.js'])
    .pipe(concat('util.js'))
    .pipe(gulp.dest(dist_tmp + 'js'))
    .pipe(gulp.dest(dist + 'js'))
    .pipe(uglify())
    .on('error', function (err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(rename(manifest['util.min.js']))
    .on('error', function (err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
      console.log(manifest);
    })
    .pipe(gulp.dest(dist_tmp + 'js'))
    .pipe(gulp.dest(dist + 'js'));
});

gulp.task('js-xtractor', function() {
  return gulp.src([
    'src/client/xtractor/xtractor_script.js',
    'src/client/xtractor/xtractor_api.js'
  ])
    .pipe(concat('xtractor.js'))
    .pipe(gulp.dest(dist_tmp + 'js'))
    .pipe(gulp.dest(dist + 'js'))
    .pipe(uglify())
    .on('error', function (err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(rename('xtractor.min.js'))
    .pipe(rev())
    .pipe(gulp.dest(dist_tmp + 'js'))
    .pipe(gulp.dest(dist + 'js'))
    .pipe(rev.manifest(dist + 'tmp/xtractor-manifest.json'))
    .pipe(gulp.dest('.'));
});

gulp.task('js-xtractor-client', function() {
  return gulp.src([
    'src/client/xtractor/xtractor_script.js',
    'src/client/xtractor/xtractor_api.js'
  ])
  .pipe(concat('xtractor.js'))
  .pipe(gulp.dest(dist_tmp + 'js'))
  .pipe(gulp.dest(dist + 'js'))
  .pipe(uglify())
  .on('error', function (err) {
    gutil.log(gutil.colors.red('[Error]'), err.toString());
  })
  .pipe(rename(manifest['xtractor.min.js']))
  .on('error', function (err) {
    gutil.log(gutil.colors.red('[Error]'), err.toString());
    console.log(manifest);
  })
  .pipe(gulp.dest(dist_tmp + 'js'))
  .pipe(gulp.dest(dist + 'js'));
});

oldAppNames.map(function (app, index) {
  gulp.task('js-old' + app, function () {
    return gulp.src('src/client/app/90' + index + '.' + app + '/**/*.js')
      .pipe(sort())
      .pipe(concat(app + 'old.js'))
      .pipe(gulp.dest(dist_tmp + 'js'))
      .pipe(gulp.dest(dist + 'js'))
      .pipe(uglify())
      .on('error', function (err) {
        gutil.log(gutil.colors.red('[Error]'), err.toString());
      })
      .pipe(rename(app + 'old.min.js'))
      .pipe(rev())
      .pipe(gulp.dest(dist_tmp + 'js'))
      .pipe(gulp.dest(dist + 'js'))
      .pipe(rev.manifest(dist + 'tmp/' + app + 'old-manifest.json', {
        merge: true
      }))
      .pipe(gulp.dest('.'));
  });
});

appNames.map(function (app, index) {
  gulp.task('js-' + app, function () {
    return gulp.src('src/client/app/0' + index + '.' + app + '/**/*.js')
      .pipe(sort())
      .pipe(concat(app + '.js'))
      .pipe(gulp.dest(dist_tmp + 'js'))
      .pipe(gulp.dest(dist + 'js'))
      .pipe(uglify())
      .on('error', function (err) {
        gutil.log(gutil.colors.red('[Error]'), err.toString());
      })
      .pipe(rename(app + '.min.js'))
      .pipe(rev())
      .pipe(gulp.dest(dist_tmp + 'js'))
      .pipe(gulp.dest(dist + 'js'))
      .pipe(rev.manifest(dist + 'tmp/' + app + '-manifest.json', {
        merge: true
      }))
      .pipe(gulp.dest('.'));
  });
});

appNames.map(function (app, index) {
  gulp.task('js-' + app + '-client', function () {
    return gulp.src('src/client/app/0' + index + '.' + app + '/**/*.js')
      .pipe(sort())
      .pipe(concat(app + '.js'))
      .pipe(gulp.dest(dist_tmp + 'js'))
      .pipe(gulp.dest(dist + 'js'))
      .pipe(uglify())
      .on('error', function (err) {
        gutil.log(gutil.colors.red('[Error]'), err.toString());
      })
      .pipe(rename(manifest[app + '.min.js']))
      .pipe(gulp.dest(dist_tmp + 'js'))
      .pipe(gulp.dest(dist + 'js'));
  });
});

gulp.task('css-vendor', function () {
  return gulp.src([
    'node_modules/slick-carousel/slick/slick.css'])
    .pipe(concat('vendor.css'))
    .pipe(gulp.dest(dist_tmp + 'css'))
    .pipe(gulp.dest(dist + 'css'));
});

// gulp.task('js-rb', function () {
//   return gulp.src('src/client/right-brain/js/script.min.js')
//     .pipe(gulp.dest(dist + 'js'));
// });

gulp.task('js-rb', function () {
  return gulp.src([
    'src/client/right-brain/js/**/*.js', '!src/client/right-brain/js/**/*.min.js'
  ])
    .pipe(concat('script.js'))
    .pipe(gulp.dest(dist_tmp + 'js'))
    .pipe(gulp.dest(dist + 'js'))
    .pipe(uglify())
    .on('error', function (err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(rename('script.min.js'))
    .pipe(rev())
    .pipe(gulp.dest(dist_tmp + 'js'))
    .pipe(gulp.dest(dist + 'js'))
    .pipe(rev.manifest(dist + 'tmp/js-manifest.json', {
      merge: true
    }))
    .pipe(gulp.dest('.'));
});

gulp.task('css-rb', function () {
  return gulp.src([
    'src/client/right-brain/css/**/common.css',
    'src/client/right-brain/css/**/layout.css',
    'src/client/right-brain/css/**/widgets.css',
    'src/client/right-brain/css/**/components.css',
    'src/client/right-brain/css/**/m_product.css',
    '!src/client/right-brain/css/**/*.min.css'])
  // .pipe(base64({
  //   baseDir: 'src/client/right-brain/',
  //   extensions: ['svg', 'png', /\.jpg#datauri$/i],
  //   maxImageSize: 10 * 1024 * 1024, // bytes
  //   debug: true
  // }))
    .pipe(concat('style.css'))
    // .pipe(imagehash())
    // .pipe(uglify())
    .pipe(gulp.dest(dist_tmp + 'css'))
    .pipe(gulp.dest(dist + 'css'))
    .on('error', function (err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(rename('style.min.css'))
    .pipe(rev())
    .pipe(gulp.dest(dist_tmp + 'css'))
    .pipe(gulp.dest(dist + 'css'))
    .pipe(rev.manifest(dist + 'tmp/css-manifest.json', {
      merge: true
    }))
    .pipe(gulp.dest('.'));
});

gulp.task('img', function () {
  return gulp.src('src/client/right-brain/img/**/*')
    .pipe(gulp.dest(dist_tmp + 'img'))
    .pipe(gulp.dest(dist + 'img'));
});

gulp.task('hbs', function () {
  return gulp.src('src/client/right-brain/hbs/**/*')
    .pipe(gulp.dest(dist_tmp + 'hbs'))
    .pipe(gulp.dest(dist + 'hbs'));
});

gulp.task('font', function () {
  return gulp.src('src/client/right-brain/font/**/*')
    .pipe(gulp.dest(dist_tmp + 'font'))
    .pipe(gulp.dest(dist + 'font'));
});

gulp.task('resource', function () {
  return gulp.src('src/client/right-brain/resource/**/*')
    .pipe(gulp.dest(dist_tmp + 'resource'))
    .pipe(gulp.dest(dist + 'resource'));
});

gulp.task('manifest', function () {
  return gulp.src([dist + 'tmp/*.json'])
    .pipe(extend(manifestFile))
    .pipe(gulp.dest(dist));
});

gulp.task('manifest-temp', function () {
  return gulp.src([dist + 'tmp/*.json'])
    .pipe(extend(manifestTemp))
    .pipe(gulp.dest(dist))
    .pipe(gulp.dest(dist_tmp))
    .pipe(gulp.dest(config));
});

gulp.task('cab', function () {
  return gulp.src('src/client/right-brain/cab/**/*')
    .pipe(gulp.dest(dist_tmp + 'cab'))
    .pipe(gulp.dest(dist + 'cab'));
});

gulp.task('post-clean', function () {
  return gulp.src(dist + 'tmp')
    .pipe(clean());
});

gulp.task('watch', function () {
  livereload.listen();
  gulp.watch('src/client/**/*.hbs', ['hbs']);
  gulp.watch('src/client/**/*.js', ['client-build']);
  gulp.watch('src/client/**/*.css', ['css-vendor', 'css-rb']);
  gulp.watch('dist/**').on('change', livereload.changed);
});

gulp.task('get-manifest', function () {
  return remoteSrc('manifest.json', {
    base: 'http://localhost:3001/'
  })
    .on('error', function (err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(jeditor(function (json) {
      manifest = json;
    }));
});


gulp.task('js-old-app', oldAppNames.map(function (app) {
  return 'js-old' + app;
}));
gulp.task('js-app', appNames.map(function (app) {
  return 'js-' + app;
}));
gulp.task('js-app-client', appNames.map(function (app) {
  return 'js-' + app + '-client';
}));
gulp.task('js', ['js-util', 'js-xtractor', 'js-old-app', 'js-app']);
gulp.task('js-client', ['js-util-client', 'js-xtractor-client', 'js-app-client']);
gulp.task('vendor', ['js-vendor', 'css-vendor']);
gulp.task('rb', ['js-rb', 'css-rb', 'img', 'hbs', 'font']);

gulp.task('task', ['vendor', 'js', 'rb', 'resource', 'cab']);
gulp.task('run', ['server', 'watch']);

gulp.task('default', shell.task([
  'gulp pre-clean --ver=' + version,
  'gulp pre-clean-tmp --ver=' + version,
  'gulp task --ver=' + version,
  'gulp manifest --ver=' + version,
  'gulp manifest-temp --ver=' + version,
  'gulp post-clean --ver=' + version,
  'gulp run --ver=' + version
]));

gulp.task('build', shell.task([
  'gulp pre-clean --ver=' + version,
  'gulp pre-clean-tmp --ver=' + version,
  'gulp task --ver=' + version,
  'gulp manifest --ver=' + version,
  'gulp manifest-temp --ver=' + version,
  'gulp post-clean --ver=' + version
]));

gulp.task('client-build', ['get-manifest'], function () {
  gulp.start('js-client');
});