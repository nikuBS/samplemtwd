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
    plumber    = require('gulp-plumber');


var oldAppNames = ['test'];
var appNames = ['common', 'main', 'myt-data', 'myt-fare', 'myt-join', 'product', 'benefit', 'membership', 'customer', 'tevent'];
var dist = 'dist/';

var manifest = {};
var manifestFile = 'manifest.json';
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

gulp.task('js-jquery-vendor', function () {
  return gulp.src([
    'node_modules/jquery/dist/jquery.min.js' ])
    .on('error', function (err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(concat('jquery-vendor.js'))
    .pipe(gulp.dest(dist + 'js'));
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
    'node_modules/moment/locale/ko.js',
    'node_modules/jsbarcode/dist/JsBarcode.all.min.js'])
    .on('error', function (err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest(dist + 'js'));
});

gulp.task('js-component', function () {
  return gulp.src([
    'src/client/component/**/*.js',
    'src/client/common/**/*.js'])
    .pipe(concat('component.js'))
    .pipe(gulp.dest(dist + 'js'))
    .pipe(uglify())
    .on('error', function (err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(rename('component.min.js'))
    .pipe(rev())
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
    .pipe(concat('util.js'))
    .pipe(gulp.dest(dist + 'js'))
    .pipe(uglify())
    .on('error', function (err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(rename('util.min.js'))
    .pipe(rev())
    .pipe(gulp.dest(dist + 'js'))
    .pipe(rev.manifest(dist + 'tmp/util-manifest.json'))
    .pipe(gulp.dest('.'));
});

gulp.task('js-component-client', function () {
  return gulp.src([
    'src/client/component/**/*.js',
    'src/client/common/**/*.js'])
    .pipe(concat('component.js'))
    .pipe(gulp.dest(dist + 'js'))
    .pipe(uglify())
    .on('error', function (err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(rename(manifest['component.min.js']))
    .on('error', function (err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
      console.log(manifest);
    })
    .pipe(gulp.dest(dist + 'js'));
});


gulp.task('js-util-client', function () {
  return gulp.src([
    'src/client/configs/**/*.js',
    'src/client/types/**/*.js',
    'src/client/utils/**/*.js',
    'src/client/services/**/*.js' ])
    .pipe(concat('util.js'))
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
    .pipe(gulp.dest(dist + 'js'));
});

oldAppNames.map(function (app, index) {
  gulp.task('js-old' + app, function () {
    return gulp.src('src/client/app/90' + index + '.' + app + '/**/*.js')
      .pipe(plumber())
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
      .pipe(plumber())
      .pipe(sort())
      .pipe(concat(app + '.js'))
      .pipe(gulp.dest(dist + 'js'))
      .pipe(uglify())
      .on('error', function (err) {
        gutil.log(gutil.colors.red('[Error]'), err.toString());
      })
      .pipe(rename(app + '.min.js'))
      .pipe(rev())
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
      .pipe(plumber())
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
    .pipe(concat('script.js'))
    .pipe(gulp.dest(dist + 'js'))
    .pipe(uglify())
    .on('error', function (err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(rename('script.min.js'))
    .pipe(rev())
    .pipe(gulp.dest(dist + 'js'))
    .pipe(rev.manifest(dist + 'tmp/js-manifest.json', {
      merge: true
    }))
    .pipe(gulp.dest('.'));
});

gulp.task('css-rb', function () {
  return gulp.src([
    'src/client/right-brain/css/**/*.css',
    '!src/client/right-brain/css/**/*.min.css'])
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
    .pipe(gulp.dest(dist + 'css'))
    .pipe(rev.manifest(dist + 'tmp/css-manifest.json', {
      merge: true
    }))
    .pipe(gulp.dest('.'));
});

gulp.task('css-idpt', function() {
  return gulp.src([
    'src/client/right-brain/css/**/idpt-reset-mobile.css',
    'src/client/right-brain/css/**/idpt-service-mobile.css'])
    .pipe(concat('style-idpt.css'))
    // .pipe(imagehash())
    .pipe(cleanCSS())
    // .pipe(gulp.dest(dist_tmp + 'css'))
    .pipe(gulp.dest(dist + 'css'))
    .on('error', function (err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(rename('style-idpt.min.css'))
    .pipe(rev())
    // .pipe(gulp.dest(dist_tmp + 'css'))
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

gulp.task('post-clean', function () {
  return gulp.src(dist + 'tmp')
    .pipe(clean());
});

gulp.task('watch', function () {
  livereload.listen();
  gulp.watch('src/client/**/*.hbs', { interval: 500 }, ['hbs']);
  gulp.watch('src/client/**/*.js', { interval: 500 }, ['client-build']);
  gulp.watch('src/client/**/*.css', { interval: 500 }, ['css-vendor', 'css-rb']);
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
gulp.task('vendor', ['js-jquery-vendor', 'js-vendor', 'css-vendor']);
gulp.task('rb', ['js-rb', 'css-rb', 'css-idpt', 'img', 'hbs', 'font']);

gulp.task('task', ['vendor', 'js', 'rb', 'cab']);
gulp.task('run', ['server', 'watch']);

gulp.task('default', shell.task([
  'gulp pre-clean',
  'gulp task',
  'gulp hbs-front',
  'gulp manifest',
  'gulp post-clean',
  'gulp run'
]));

gulp.task('build', shell.task([
  'gulp pre-clean',
  'gulp task',
  'gulp hbs-front',
  'gulp manifest',
  'gulp post-clean'
]));

gulp.task('client-build', ['get-manifest'], function () {
  gulp.start('js-client');
});