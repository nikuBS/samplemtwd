var gulp       = require('gulp'),
    gutil      = require('gulp-util'),
    uglify     = require('gulp-uglify'),
    cleanCSS   = require('gulp-clean-css'),
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
    options    = require('gulp-options'),
    plumber    = require('gulp-plumber'),
    logger     = require('gulp-logger');


var oldAppNames = ['test'];
var appNames = ['common', 'main', 'myt-data', 'myt-fare', 'myt-join', 'product', 'benefit', 'membership', 'customer', 'tevent'];
var dist = 'dist/';

var manifest = {};
var version = options.get('ver');
// var manifestFile = 'manifest.json';
var manifestFile = version !== 'undefined' ? 'manifest.' + version + '.json' : 'manifest.json';
var manifest_dist = 'src/server/';

gulp.task('pre-clean', function () {
  return gulp.src(dist)
    .pipe(clean());
});

gulp.task('server', function () {
  return gulp.src(dist)
    .pipe(webserver({
      host: '0.0.0.0',
      port: 3001,
      livereload: true,
      auto: false,
      middleware: function (req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', '*');
        next();
      }
    }));
});

gulp.task('js-vendor', function () {
  return gulp.src([
    'node_modules/jquery/dist/jquery.min.js',
    'node_modules/underscore/underscore-min.js',
    'node_modules/handlebars/dist/handlebars.min.js',
    'node_modules/slick-carousel/slick/slick.min.js',
    'node_modules/moment/min/moment.min.js',
    'node_modules/moment/locale/ko.js',
    'node_modules/jsbarcode/dist/JsBarcode.all.min.js'])
    .on('error', function (err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest(dist + 'js'));
    // .pipe(rev())
    // .pipe(gulp.dest(dist + 'js'))
    // .pipe(rev.manifest(dist + 'tmp/vendor-manifest.json'))
    // .pipe(gulp.dest('.'));
});

gulp.task('js-vendor-ex', function () {
  return gulp.src([
    'node_modules/jquery-ui-dist/jquery-ui.min.js',
    'node_modules/jquery-ui-touch-punch/jquery.ui.touch-punch.min.js'])
    .on('error', function (err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(concat('vendor-ex.js'))
    .pipe(gulp.dest(dist + 'js'))
    .pipe(rev())
    .pipe(gulp.dest(dist + 'js'))
    .pipe(rev.manifest(dist + 'tmp/vendor-ex-manifest.json'))
    .pipe(gulp.dest('.'));
});

gulp.task('js-component', function () {
  return gulp.src([
    'src/client/component/**/*.js',
    'src/client/common/**/*.js'])
    // .pipe(plumber())
    .pipe(sort())
    .pipe(logger({
      before: 'Starting sort js-component',
      after: 'Complete sort js-component',
      showChange: true
    }))
    .pipe(concat('component.js'))
    .pipe(gulp.dest(dist + 'js'))
    .pipe(uglify())
    .on('error', function (err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(rename('component.min.js'))
    .pipe(rev())
    .pipe(logger({
      before: 'Starting hash js-component',
      after: 'Complete hash js-component',
      showChange: true
    }))
    .pipe(gulp.dest(dist + 'js'))
    .pipe(rev.manifest(dist + 'tmp/component-manifest.json'))
    .pipe(gulp.dest('.'));
});

gulp.task('js-util', function () {
  return gulp.src([
    'src/client/configs/**/*.js',
    'src/client/types/**/*.js',
    'src/client/utils/**/*.js',
    'src/client/services/**/*.js' ])
    // .pipe(plumber())
    .pipe(sort())
    .pipe(logger({
      before: 'Starting sort js-util',
      after: 'Complete sort js-util',
      showChange: true
    }))
    .pipe(concat('util.js'))
    .pipe(gulp.dest(dist + 'js'))
    .pipe(uglify())
    .on('error', function (err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(rename('util.min.js'))
    .pipe(rev())
    .pipe(logger({
      before: 'Starting hash js-util',
      after: 'Complete hash js-util',
      showChange: true
    }))
    .pipe(gulp.dest(dist + 'js'))
    .pipe(rev.manifest(dist + 'tmp/util-manifest.json'))
    .pipe(gulp.dest('.'));
});

gulp.task('js-component-client', function () {
  return gulp.src([
    'src/client/component/**/*.js',
    'src/client/common/**/*.js'])
    // .pipe(plumber())
    .pipe(sort())
    .pipe(concat('component.js'))
    .pipe(gulp.dest(dist + 'js'))
    .pipe(uglify())
    .on('error', function (err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(rename(manifest['component.min.js']))
    .on('error', function (err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(gulp.dest(dist + 'js'));
});


gulp.task('js-util-client', function () {
  return gulp.src([
    'src/client/configs/**/*.js',
    'src/client/types/**/*.js',
    'src/client/utils/**/*.js',
    'src/client/services/**/*.js' ])
    // .pipe(plumber())
    .pipe(sort())
    .pipe(concat('util.js'))
    .pipe(gulp.dest(dist + 'js'))
    .pipe(uglify())
    .on('error', function (err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(rename(manifest['util.min.js']))
    .on('error', function (err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(gulp.dest(dist + 'js'));
});

oldAppNames.map(function (app, index) {
  gulp.task('js-old' + app, function () {
    return gulp.src('src/client/app/90' + index + '.' + app + '/**/*.js')
      // .pipe(plumber())
      .pipe(sort())
      .pipe(concat(app + 'old.js'))
      .pipe(gulp.dest(dist + 'js'))
      .pipe(uglify())
      .on('error', function (err) {
        gutil.log(gutil.colors.red('[Error]'), err.toString());
      })
      .pipe(rename(app + 'old.min.js'))
      .pipe(rev())
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
      // .pipe(plumber())
      .pipe(sort())
      .pipe(logger({
        before: 'Starting sort ' + app,
        after: 'Complete sort ' + app,
        showChange: true
      }))
      .pipe(concat(app + '.js'))
      .pipe(gulp.dest(dist + 'js'))
      .pipe(uglify())
      .on('error', function (err) {
        gutil.log(gutil.colors.red('[Error]'), err.toString());
      })
      .pipe(rename(app + '.min.js'))
      .pipe(rev())
      .pipe(logger({
        before: 'Starting hash ' + app,
        after: 'Complete hash ' + app,
        showChange: true
      }))
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
      // .pipe(plumber())
      .pipe(sort())
      .pipe(concat(app + '.js'))
      .pipe(gulp.dest(dist + 'js'))
      .pipe(uglify())
      .on('error', function (err) {
        gutil.log(gutil.colors.red('[Error]'), err.toString());
      })
      .pipe(rename(manifest[app + '.min.js']))
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
  return gulp.src([
    'src/client/web-contents/js/**/*.js', '!src/client/web-contents/js/**/*.min.js'
  ])
    // .pipe(plumber())
    .pipe(sort())
    .pipe(logger({
      before: 'Starting sort js-rb',
      after: 'Complete sort js-rb',
      showChange: true
    }))
    .pipe(concat('script.js'))
    .pipe(gulp.dest(dist + 'js'))
    .pipe(uglify())
    .on('error', function (err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(rename('script.min.js'))
    .pipe(rev())
    .pipe(logger({
      before: 'Starting  hash js-rb',
      after: 'Complete hash js-rb',
      showChange: true
    }))
    .pipe(gulp.dest(dist + 'js'))
    .pipe(rev.manifest(dist + 'tmp/js-manifest.json', {
      merge: true
    }))
    .pipe(gulp.dest('.'));
});

gulp.task('css-rb', function () {
  return gulp.src([
    'src/client/web-contents/css/common.css',
    'src/client/web-contents/css/layout.css',
    'src/client/web-contents/css/widgets.css',
    'src/client/web-contents/css/components.css',
    'src/client/web-contents/css/m_product.css'])
  // .pipe(base64({
  //   baseDir: 'src/client/web-contents/',
  //   extensions: ['svg', 'png', /\.jpg#datauri$/i],
  //   maxImageSize: 10 * 1024 * 1024, // bytes
  //   debug: true
  // }))
    .pipe(concat('style.css'))
    // .pipe(imagehash())
    .pipe(cleanCSS())
    .pipe(gulp.dest(dist + 'css'))
    .on('error', function (err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(rename('style.min.css'))
    .pipe(rev())
    .pipe(logger({
      before: 'Starting hash css-rb',
      after: 'Complete hash css-rb',
      showChange: true
    }))
    .pipe(gulp.dest(dist + 'css'))
    .pipe(rev.manifest(dist + 'tmp/css-manifest.json', {
      merge: true
    }))
    .pipe(gulp.dest('.'));
});

gulp.task('css-main', function () {
  return gulp.src([
    'src/client/web-contents/css/common.css',
    'src/client/web-contents/css/layout.css',
    'src/client/web-contents/css/widgets.css',
    'src/client/web-contents/css/jsk.css',
    'src/client/web-contents/css/main.css'])
  // .pipe(base64({
  //   baseDir: 'src/client/web-contents/',
  //   extensions: ['svg', 'png', /\.jpg#datauri$/i],
  //   maxImageSize: 10 * 1024 * 1024, // bytes
  //   debug: true
  // }))
    .pipe(concat('mainstyle.css'))
    // .pipe(imagehash())
    .pipe(cleanCSS())
    .pipe(gulp.dest(dist + 'css'))
    .on('error', function (err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(rename('mainstyle.min.css'))
    .pipe(rev())
    .pipe(logger({
      before: 'Starting hash css-main',
      after: 'Complete hash css-main',
      showChange: true
    }))
    .pipe(gulp.dest(dist + 'css'))
    .pipe(rev.manifest(dist + 'tmp/css-main-manifest.json', {
      merge: true
    }))
    .pipe(gulp.dest('.'));
});

gulp.task('css-idpt', function() {
  return gulp.src([
    'src/client/web-contents/css/idpt-service-mobile.css'])
    .pipe(concat('style-idpt.css'))
    // .pipe(imagehash())
    .pipe(cleanCSS())
    .pipe(gulp.dest(dist + 'css'))
    .on('error', function (err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(rename('style-idpt.min.css'))
    .pipe(rev())
    .pipe(logger({
      before: 'Starting hash css-idpt',
      after: 'Complete hash css-idpt',
      showChange: true
    }))
    .pipe(gulp.dest(dist + 'css'))
    .pipe(rev.manifest(dist + 'tmp/css-idpt-manifest.json', {
      merge: true
    }))
    .pipe(gulp.dest('.'));
});

gulp.task('img', function () {
  return gulp.src('src/client/web-contents/img/**/*')
    .pipe(gulp.dest(dist + 'img'));
});

gulp.task('hbs', function () {
  return gulp.src('src/client/web-contents/hbs/**/*')
    .pipe(gulp.dest(dist + 'hbs'));
});

gulp.task('font', function () {
  return gulp.src('src/client/web-contents/font/**/*')
    .pipe(gulp.dest(dist + 'font'));
});

gulp.task('manifest', function () {
  return gulp.src([dist + 'tmp/*.json'])
    .pipe(extend(manifestFile))
    .pipe(gulp.dest(manifest_dist))
    .pipe(gulp.dest(dist));
});

gulp.task('cab', function () {
  return gulp.src('src/client/web-contents/cab/**/*')
    .pipe(gulp.dest(dist + 'cab'));
});

gulp.task('hbs-front', function () {
  return gulp.src('src/client/web-hbs/**/*')
    .pipe(gulp.dest(dist + 'hbs'));
});

gulp.task('mp4', function () {
  return gulp.src('src/client/web-contents/mp4/**/*')
  .pipe(gulp.dest(dist + 'mp4'));
});

gulp.task('post-clean', function () {
  return gulp.src(dist + 'tmp')
    .pipe(clean());
});

gulp.task('watch', function () {
  livereload.listen();
  gulp.watch('src/client/**/*.hbs', { interval: 500 }, ['hbs-front']);
  gulp.watch('src/client/**/*.js', { interval: 500 }, ['client-build']);
  gulp.watch('dist/**', { interval: 500 }).on('change', livereload.changed);
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
gulp.task('js', ['js-util', 'js-component', 'js-old-app', 'js-app']);
gulp.task('js-client', ['js-util-client', 'js-component-client', 'js-app-client']);
gulp.task('vendor', ['js-vendor', 'js-vendor-ex', 'css-vendor']);
gulp.task('rb', ['js-rb', 'css-rb', 'css-main', 'css-idpt', 'img', 'hbs', 'font', 'mp4']);

gulp.task('task', ['vendor', 'js', 'rb', 'cab']);
gulp.task('run', ['server', 'watch']);

gulp.task('default', shell.task([
  'gulp pre-clean --ver=' + version,
  'gulp task --ver=' + version,
  'gulp hbs-front --ver=' + version,
  'gulp manifest --ver=' + version,
  'gulp post-clean --ver=' + version,
  'gulp run --ver=' + version
]));

gulp.task('build', shell.task([
  'gulp pre-clean --ver=' + version,
  'gulp task --ver=' + version,
  'gulp hbs-front --ver=' + version,
  'gulp manifest --ver=' + version,
  'gulp post-clean --ver=' + version
]));

gulp.task('client-build', ['get-manifest'], function () {
  gulp.start('js-client');
});