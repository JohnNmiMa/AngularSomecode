// Include gulp
var gulp = require('gulp'); 
var connect = require('gulp-connect');
var usemin = require('gulp-usemin');
var minifyHtml = require('gulp-minify-html');
var minifyCss = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var rev = require('gulp-rev');
var clean = require('gulp-clean');
var replace = require('gulp-replace');
var rename = require('gulp-rename');

gulp.task('copy-html-files', function() {
    //gulp.src(['./app/**/*.html', './app/**/*.css',
    //gulp.src(['./app/**/*.html', '!./app/index.html', './app/**/*.css',
    gulp.src(['./app/**/*.html', '!./app/index.html',
              './app/bower_components/fontawesome/fonts/*.otf',
              './app/bower_components/fontawesome/fonts/*.eot',
              './app/bower_components/fontawesome/fonts/*.svg',
              './app/bower_components/fontawesome/fonts/*.ttf',
              './app/bower_components/fontawesome/fonts/*.woff',
              './app/bower_components/bootstrap/dist/css/bootstrap.css.map',
              './app/bower_components/bootstrap/dist/fonts/*.eot',
              './app/bower_components/bootstrap/dist/fonts/*.svg',
              './app/bower_components/bootstrap/dist/fonts/*.ttf',
              './app/bower_components/bootstrap/dist/fonts/*.woff',
              ], {base: './app'})
    .pipe(gulp.dest('build/'));
});

gulp.task('fix-awesome-paths', ['fix-glyphicon-paths'], function() {
    gulp.src('./build/_assets/combined-*.css')
    .pipe(replace('../fonts/fontawesome-webfont', '../bower_components/fontawesome/fonts/fontawesome-webfont'))
    .pipe(gulp.dest('./build/_assets'));
});

gulp.task('fix-glyphicon-paths', ['usemin'], function() {
    return gulp.src('./build/_assets/combined-*.css')
    .pipe(replace('../fonts/glyphicons-halflings', '../bower_components/bootstrap/dist/fonts/glyphicons-halflings'))
    .pipe(gulp.dest('./build/_assets'));
});

gulp.task('usemin', function() {
    return gulp.src('./app/index.html')
    .pipe(usemin({
        assetsDir: 'app',
        css: [minifyCss(), 'concat', rev()],
        //js: [uglify({mangle: false}), rev()] // don't mangle names
        //js: [uglify({preserveComments: 'some'}), rev()] // keep comments that start with !
        js: [uglify(), rev()]
    }))
    .pipe(gulp.dest('build'));
});

gulp.task('connect', function() {
    connect.server({
        root: 'app/'
    });
});

// Default Task
gulp.task('default', ['connect']);
// Build Task - has multiple dependencies that need to run serially
gulp.task('build', ['copy-html-files', 'usemin', 'fix-awesome-paths', 'fix-glyphicon-paths']);
