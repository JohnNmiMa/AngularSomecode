//inside of gulpfile.js
var gulp = require('gulp');
var shell = require('gulp-shell');
var usemin = require('gulp-usemin');
var minifyCss = require('gulp-minify-css');
var annotate = require('gulp-ng-annotate');
var uglify = require('gulp-uglify');
var rev = require('gulp-rev');
var replace = require('gulp-replace');

gulp.task('flask', shell.task(['source ./venv/bin/activate && python run.py']));

gulp.task('copy-files', function() {
    gulp.src(['!./app/templates/index.html',
              './app/**/*.html',
              './app/static/**/*.html',
              './app/static/components/**/*.html',
              './app/static/components/snippetpanel/arrow-down.png',
              '*.py', './app/*.py', 'requirements.txt',
              'app.db', 'search.db/Snippet/*', 'db_repository',
              './app/static/bower_components/codemirror/mode/**/*.js',
              './app/static/bower_components/fontawesome/fonts/*.otf',
              './app/static/bower_components/fontawesome/fonts/*.eot',
              './app/static/bower_components/fontawesome/fonts/*.svg',
              './app/static/bower_components/fontawesome/fonts/*.ttf',
              './app/static/bower_components/fontawesome/fonts/*.woff',
              './app/static/bower_components/bootstrap/dist/css/bootstrap.css.map',
              './app/static/bower_components/bootstrap/dist/fonts/*.eot',
              './app/static/bower_components/bootstrap/dist/fonts/*.svg',
              './app/static/bower_components/bootstrap/dist/fonts/*.ttf',
              './app/static/bower_components/bootstrap/dist/fonts/*.woff'
    ], {base: '.'})
    .pipe(gulp.dest('build/'));
});

gulp.task('usemin', function() {
    return gulp.src('app/templates/index.html')
        .pipe(usemin({
            assetsDir: 'app',
            css: [minifyCss(), 'concat', rev()],
            //js: [uglify({mangle: false}), rev()] // don't mangle names
            //js: [uglify({preserveComments: 'some'}), rev()] // keep comments that start with !
            js: [annotate(), uglify(), rev()]
        }))
        .pipe(gulp.dest('build/app/templates'));
});

gulp.task('fix-glyphicon-paths', ['usemin'], function() {
    return gulp.src('./build/app/static/combined-*.css')
        .pipe(replace('../fonts/glyphicons-halflings', '../static/bower_components/bootstrap/dist/fonts/glyphicons-halflings'))
        .pipe(gulp.dest('./build/app/static'));
});

gulp.task('fix-awesome-paths', ['fix-glyphicon-paths'], function() {
    gulp.src('./build/app/static/combined-*.css')
    .pipe(replace('../fonts/fontawesome-webfont', '../static/bower_components/fontawesome/fonts/fontawesome-webfont'))
    .pipe(gulp.dest('./build/app/static'));
});

// Default Task - run the Flask server
gulp.task('default', ['flask']);

// Build Task - has multiple dependencies that need to run serially
gulp.task('build', ['copy-files', 'usemin', 'fix-glyphicon-paths', 'fix-awesome-paths']);
