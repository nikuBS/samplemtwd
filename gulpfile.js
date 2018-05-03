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
    return gulp.src('src/client/app/common/**/*.js')
        .pipe(concat('common.js'))
        .pipe(gulp.dest('dist/js'))
        .pipe(uglify())
        .on('error', function (err) {
            gutil.log(gutil.colors.red('[Error]'), err.toString());
        })
        .pipe(rename('common.min.js'))
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

gulp.task('js-my', function () {
    return gulp.src([
        'src/client/app/my/js/models/**/*.js',
        'src/client/app/my/js/views/**/*.js'])
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

gulp.task('js', ['js-util', 'js-common', 'js-home', 'js-my', 'js-product', 'js-user']);
gulp.task('default', ['server', 'vendor', 'js', 'watch']);
gulp.task('build', ['vendor', 'js']);