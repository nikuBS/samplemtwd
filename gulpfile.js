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
var appNames_en = ['common', 'main', 'myt-data', 'myt-fare', 'myt-join', 'product', 'benefit', 'membership', 'customer', 'tevent'];
var dist = 'dist/';

var manifest = {};
var manifest_en = {};

var version = options.get('ver');
// var manifestFile = 'manifest.json';
var manifestFile = version !== 'undefined' ? 'manifest.' + version + '.json' : 'manifest.json';
var manifestFile_en = version !== 'undefined' ? 'manifest_en.' + version + '.json' : 'manifest_en.json';
var manifest_dist = 'src/server/';
gutil.log(gutil.colors.red('[version]'), version);

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

gulp.task('json-chatbot-1', function () {
  return gulp.src([
    'src/client/web-contents/js/chatbot_1.json'
  ])
    .on('error', function (err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(concat('chatbot_1.json'))
    .pipe(gulp.dest(dist + 'js'));
});

gulp.task('json-chatbot-2', function () {
  return gulp.src([
    'src/client/web-contents/js/intro_start.json'
  ])
    .on('error', function (err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(concat('intro_start.json'))
    .pipe(gulp.dest(dist + 'js'));
});
gulp.task('json-chatbot-3', function () {
  return gulp.src([
    'src/client/web-contents/js/chatbot_mask_purple.json'
  ])
    .on('error', function (err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(concat('chatbot_mask_purple.json'))
    .pipe(gulp.dest(dist + 'js'));
});
gulp.task('json-chatbot-4', function () {
  return gulp.src([
    'src/client/web-contents/js/chatbot_santa_purple.json'
  ])
    .on('error', function (err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(concat('chatbot_santa_purple.json'))
    .pipe(gulp.dest(dist + 'js'));
});
gulp.task('json-chatbot-5', function () {
  return gulp.src([
    'src/client/web-contents/js/chatbot_mask_blue.json'
  ])
    .on('error', function (err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(concat('chatbot_mask_blue.json'))
    .pipe(gulp.dest(dist + 'js'));
});
gulp.task('json-chatbot-6', function () {
  return gulp.src([
    'src/client/web-contents/js/chatbot_santa_blue.json'
  ])
    .on('error', function (err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(concat('chatbot_santa_blue.json'))
    .pipe(gulp.dest(dist + 'js'));
});
gulp.task('json-chatbot-7', function () {
  return gulp.src([
    'src/client/web-contents/js/chatbot_mask_red.json'
  ])
    .on('error', function (err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(concat('chatbot_mask_red.json'))
    .pipe(gulp.dest(dist + 'js'));
});
gulp.task('json-chatbot-8', function () {
  return gulp.src([
    'src/client/web-contents/js/chatbot_santa_red.json'
  ])
    .on('error', function (err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(concat('chatbot_santa_red.json'))
    .pipe(gulp.dest(dist + 'js'));
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

//영문
gulp.task('en_js-component', function () {
  return gulp.src([
    'src/client/component_en/**/*.js',
    'src/client/common_en/**/*.js'
    ])
    // .pipe(plumber())
    .pipe(sort())
    .pipe(logger({
      before: 'Starting sort js-component',
      after: 'Complete sort js-component',
      showChange: true
    }))
    .pipe(concat('component_en.js'))
    .pipe(gulp.dest(dist + 'js'))
    .pipe(uglify())
    .on('error', function (err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(rename('component_en.min.js'))
    .pipe(rev())
    .pipe(logger({
      before: 'Starting hash en_js-component',
      after: 'Complete hash en_js-component',
      showChange: true
    }))
    .pipe(gulp.dest(dist + 'js'))
    .pipe(rev.manifest(dist + 'tmp_en/component-manifest.json'))
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
//영문
gulp.task('en_js-util', function () {
  return gulp.src([
    'src/client/configs/**/*.js',
    'src/client/types_en/**/*.js',
    'src/client/utils_en/**/*.js',
    'src/client/services_en/**/*.js' ])
    // .pipe(plumber())
    .pipe(sort())
    .pipe(logger({
      before: 'Starting sort js-util',
      after: 'Complete sort js-util',
      showChange: true
    }))
    .pipe(concat('util_en.js'))
    .pipe(gulp.dest(dist + 'js'))
    .pipe(uglify())
    .on('error', function (err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(rename('util_en.min.js'))
    .pipe(rev())
    .pipe(logger({
      before: 'Starting hash en_js-util',
      after: 'Complete hash en_js-util',
      showChange: true
    }))
    .pipe(gulp.dest(dist + 'js'))
    .pipe(rev.manifest(dist + 'tmp_en/util-manifest.json'))
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
//영문
gulp.task('en_js-component-client', function () {
  return gulp.src([
    'src/client/component_en/**/*.js',
    'src/client/common_en/**/*.js'])
    // .pipe(plumber())
    .pipe(sort())
    .pipe(concat('component_en.js'))
    .pipe(gulp.dest(dist + 'js'))
    .pipe(uglify())
    .on('error', function (err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(rename(manifest_en['component_en.min.js']))
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
//영문
gulp.task('en_js-util-client', function () {
  return gulp.src([
    'src/client/configs/**/*.js',
    'src/client/types_en/**/*.js',
    'src/client/utils_en/**/*.js',
    'src/client/services_en/**/*.js' ])
    // .pipe(plumber())
    .pipe(sort())
    .pipe(concat('util_en.js'))
    .pipe(gulp.dest(dist + 'js'))
    .pipe(uglify())
    .on('error', function (err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(rename(manifest_en['util_en.min.js']))
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
//영문
appNames_en.map(function (app_en, index_en) {
  gulp.task('en_js-' + app_en, function () {
    return gulp.src('src/client/app_en/0' + index_en + '.' + app_en + '/**/*.js')
      // .pipe(plumber())
      .pipe(sort())
      .pipe(logger({
        before: 'Starting sort en_' + app_en,
        after: 'Complete sort en_' + app_en,
        showChange: true
      }))
      .pipe(concat(app_en + '_en.js'))
      .pipe(gulp.dest(dist + 'js'))
      .pipe(uglify())
      .on('error', function (err) {
        gutil.log(gutil.colors.red('[Error]'), err.toString());
      })
      .pipe(rename(app_en + '_en.min.js'))
      .pipe(rev())
      .pipe(logger({
        before: 'Starting hash en_' + app_en,
        after: 'Complete hash en_' + app_en,
        showChange: true
      }))
      .pipe(gulp.dest(dist + 'js'))
      .pipe(rev.manifest(dist + 'tmp_en/' + app_en + '-manifest.json', {
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

//영문
appNames_en.map(function (app, index) {
  gulp.task('en_js-' + app + '-client', function () {
    return gulp.src('src/client/app_en/0' + index + '.' + app + '/**/*.js')
      // .pipe(plumber())
      .pipe(sort())
      .pipe(concat(app + '_en.js'))
      .pipe(gulp.dest(dist + 'js'))
      .pipe(uglify())
      .on('error', function (err) {
        gutil.log(gutil.colors.red('[Error]'), err.toString());
      })
      .pipe(rename(manifest_en[app + '_en.min.js']))
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
    'src/client/web-contents/js/$vars.js',
    'src/client/web-contents/js/chart.js',
    'src/client/web-contents/js/common.js',
    'src/client/web-contents/js/widgets.js',
    'src/client/web-contents/js/lottie_svg.min.js'
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

//영문
gulp.task('en_js-rb', function () {
  return gulp.src([
    'src/client/web-contents/js/$vars_en.js',
    'src/client/web-contents/js/chart_en.js',
    'src/client/web-contents/js/common_en.js',
    'src/client/web-contents/js/widgets_en.js'
  ])
    // .pipe(plumber())
    .pipe(sort())
    .pipe(logger({
      before: 'Starting sort js-rb',
      after: 'Complete sort js-rb',
      showChange: true
    }))
    .pipe(concat('script_en.js'))
    .pipe(gulp.dest(dist + 'js'))
    .pipe(uglify())
    .on('error', function (err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(rename('script_en.min.js'))
    .pipe(rev())
    .pipe(logger({
      before: 'Starting  hash en_js-rb',
      after: 'Complete hash en_js-rb',
      showChange: true
    }))
    .pipe(gulp.dest(dist + 'js'))
    .pipe(rev.manifest(dist + 'tmp_en/js-manifest.json', {
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
    'src/client/web-contents/css/roaming-next.css',
    'src/client/web-contents/css/m_product.css',
    'src/client/web-contents/css/font_spoqa.css',
    'src/client/web-contents/css/product.css'
    ])
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

//영문
gulp.task('en_css-rb', function () {
  return gulp.src([
    'src/client/web-contents/css/common_en.css',
    'src/client/web-contents/css/layout_en.css',
    'src/client/web-contents/css/widgets_en.css',
    'src/client/web-contents/css/components_en.css',
    'src/client/web-contents/css/style_en.css'])
  // .pipe(base64({
  //   baseDir: 'src/client/web-contents/',
  //   extensions: ['svg', 'png', /\.jpg#datauri$/i],
  //   maxImageSize: 10 * 1024 * 1024, // bytes
  //   debug: true
  // }))
    .pipe(concat('style_en.css'))
    // .pipe(imagehash())
    .pipe(cleanCSS())
    .pipe(gulp.dest(dist + 'css'))
    .on('error', function (err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(rename('style_en.min.css'))
    .pipe(rev())
    .pipe(logger({
      before: 'Starting hash en_css-rb',
      after: 'Complete hash en_css-rb',
      showChange: true
    }))
    .pipe(gulp.dest(dist + 'css'))
    .pipe(rev.manifest(dist + 'tmp_en/css-manifest.json', {
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

//영문
gulp.task('en_css-main', function () {
  return gulp.src([
    'src/client/web-contents/css/common_en.css',
    'src/client/web-contents/css/layout_en.css',
    'src/client/web-contents/css/widgets_en.css',
    'src/client/web-contents/css/components_en.css',
    'src/client/web-contents/css/style_en.css',
    'src/client/web-contents/css/main_en.css'])
  // .pipe(base64({
  //   baseDir: 'src/client/web-contents/',
  //   extensions: ['svg', 'png', /\.jpg#datauri$/i],
  //   maxImageSize: 10 * 1024 * 1024, // bytes
  //   debug: true
  // }))
    .pipe(concat('mainstyle_en.css'))
    // .pipe(imagehash())
    .pipe(cleanCSS())
    .pipe(gulp.dest(dist + 'css'))
    .on('error', function (err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(rename('mainstyle_en.min.css'))
    .pipe(rev())
    .pipe(logger({
      before: 'Starting hash en_css-main',
      after: 'Complete hash en_css-main',
      showChange: true
    }))
    .pipe(gulp.dest(dist + 'css'))
    .pipe(rev.manifest(dist + 'tmp_en/css-main-manifest.json', {
      merge: true
    }))
    .pipe(gulp.dest('.'));
});

gulp.task('en_css-products', function () {
  return gulp.src([
    'src/client/web-contents/css/products_en.css'])
  // .pipe(base64({
  //   baseDir: 'src/client/web-contents/',
  //   extensions: ['svg', 'png', /\.jpg#datauri$/i],
  //   maxImageSize: 10 * 1024 * 1024, // bytes
  //   debug: true
  // }))
    .pipe(concat('productstyle_en.css'))
    // .pipe(imagehash())
    .pipe(cleanCSS())
    .pipe(gulp.dest(dist + 'css'))
    .on('error', function (err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(rename('productstyle_en.min.css'))
    .pipe(rev())
    .pipe(logger({
      before: 'Starting hash en_css-products',
      after: 'Complete hash en_css-products',
      showChange: true
    }))
    .pipe(gulp.dest(dist + 'css'))
    .pipe(rev.manifest(dist + 'tmp_en/css-products-manifest.json', {
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

gulp.task('netfunnel', function () {
  return gulp.src('src/client/web-contents/js/netfunnel.js')
    .pipe(gulp.dest(dist + 'js'));
});

gulp.task('myt-adv-css', function () {
  return gulp.src('src/client/web-contents/css/submain.css')
    .pipe(gulp.dest(dist + 'css'));
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
//영문
gulp.task('manifest_en', function () {
  return gulp.src([dist + 'tmp_en/*.json'])
    .pipe(extend(manifestFile_en))
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

gulp.task('post-clean_en', function () {
  return gulp.src(dist + 'tmp_en').pipe(clean());

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

gulp.task('get-manifest_en', function () {
  return remoteSrc('manifest_en.json', {
    base: 'http://localhost:3001/'
  })
    .on('error', function (err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(jeditor(function (json) {
      manifest_en = json;
    }));
});

gulp.task('js-old-app', oldAppNames.map(function (app) {
  return 'js-old' + app;
}));
gulp.task('js-app', appNames.map(function (app) {
  return 'js-' + app;
}));
gulp.task('en_js-app', appNames_en.map(function (app) {
  return 'en_js-' + app;
}));
gulp.task('js-app-client', appNames.map(function (app) {
  return 'js-' + app + '-client';
}));
gulp.task('en_js-app-client', appNames_en.map(function (app) {
  return 'en_js-' + app + '-client';
}));
gulp.task('js', ['js-util', 'js-component', 'js-old-app', 'js-app']);
gulp.task('js-client', ['js-util-client', 'js-component-client', 'js-app-client']);
gulp.task('vendor', ['js-vendor', 'js-vendor-ex', 'css-vendor']);
gulp.task('json', ['json-chatbot-1', 'json-chatbot-2', 'json-chatbot-3', 'json-chatbot-4', 'json-chatbot-5', 'json-chatbot-6', 'json-chatbot-7', 'json-chatbot-8']);
gulp.task('rb', ['js-rb', 'netfunnel', 'css-rb', 'css-main', 'css-idpt', 'myt-adv-css', 'img', 'hbs', 'font', 'mp4', 'json']);

gulp.task('en_js', ['en_js-util', 'en_js-component', 'en_js-app']);
gulp.task('en_js-client', ['en_js-util-client', 'en_js-component-client', 'en_js-app-client']);
gulp.task('en_rb', ['en_js-rb', 'en_css-rb', 'en_css-main','en_css-products']);

gulp.task('task', ['vendor', 'js', 'rb', 'cab']);
gulp.task('en_task', ['en_js','en_rb']);
gulp.task('run', ['server', 'watch']);

gulp.task('default', shell.task([
  'gulp pre-clean --ver=' + version,
  'gulp task --ver=' + version,
  'gulp en_task --ver=' + version,
  'gulp hbs-front --ver=' + version,
  'gulp manifest --ver=' + version,
  'gulp manifest_en --ver=' + version,
  'gulp post-clean --ver=' + version,
  'gulp post-clean_en --ver=' + version,
  'gulp run --ver=' + version
]));

gulp.task('build', shell.task([
  'gulp pre-clean --ver=' + version,
  'gulp task --ver=' + version,
  'gulp en_task --ver=' + version,
  'gulp hbs-front --ver=' + version,
  'gulp manifest --ver=' + version,
  'gulp manifest_en --ver=' + version,
  'gulp post-clean --ver=' + version,
  'gulp post-clean_en --ver=' + version
]));

gulp.task('client-build', ['get-manifest','get-manifest_en'], function () {
  gulp.start('js-client','en_js-client');
});

gulp.task('ko-build', shell.task([
  'gulp pre-clean --ver=' + version,
  'gulp task --ver=' + version,
  'gulp hbs-front --ver=' + version,
  'gulp manifest --ver=' + version,
  'gulp post-clean --ver=' + version,
  'gulp ko-run --ver=' + version
]));

gulp.task('ko-run', ['server', 'ko-watch']);

gulp.task('ko-watch', function () {
  livereload.listen();
  gulp.watch('src/client/**/*.hbs', { interval: 500 }, ['hbs-front']);
  gulp.watch('src/client/**/*.js', { interval: 500 }, ['ko-client-build']);
  gulp.watch('dist/**', { interval: 500 }).on('change', livereload.changed);
});

gulp.task('ko-client-build', ['get-manifest'], function () {
  gulp.start('js-client');
});
