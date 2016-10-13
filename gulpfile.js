"use strict";
var gulp = require('gulp');
var browserify = require('browserify');
var transform = require('vinyl-transform');
var source = require('vinyl-source-stream');
var rename = require('gulp-rename');
var browserSync = require('browser-sync');
var bsInstance1 = browserSync.create();
var bsInstance2 = browserSync.create();
var gulpSequence = require('run-sequence');
var bower = require('gulp-bower');
var jasmineNode = require('gulp-jasmine-node');
var istanbul = require('gulp-istanbul');

gulp.task('default',function(callback){
    gulpSequence('build-source','build-spec','build-frontend-js',['web-test','web-serve'],'watch-changes',callback);
});

gulp.task('install', function() {
  return bower('./bower_components')
    .pipe(gulp.dest('./public/lib'));
});

gulp.task('build-source',function(){
  var b = browserify();
  b.add('./src/inverted-index.js');
  b.bundle()
  .pipe(source('index.bundle.js'))
  .pipe(gulp.dest('./public/js/'))
  .pipe(rename('main.js'))
  .pipe(gulp.dest('./src/'));
});

gulp.task('build-spec',function(){
  var b = browserify();
  b.add('./spec/inverted-index-spec.js');
  b.bundle()
  .pipe(source('test.js'))
  .pipe(gulp.dest('./spec/'))
});



gulp.task('build-frontend-js',function(){
  var b = browserify();
  b.add('./public/js/app.js');
  b.bundle()
  .pipe(source('app.bundle.js'))
  .pipe(gulp.dest('./public/js'))
});

gulp.task('web-test',function(){
  bsInstance1.init({
    server: {
      baseDir: '.',
      index: 'spec/SpecRunner.html'
    },
    port: 3000,
    ui: {
      port: 7000
    }
  });
});

gulp.task('web-serve',function(){
  bsInstance2.init({
    server: {
      baseDir: './public',
      index: 'index.html'
    },
    port: 3200,
    ui: {
      port: 7200
    }
  });
});

gulp.task('pre-test',function(){
  return gulp.src(['./spec/**/*spec.js'])
  .pipe(istanbul())
  .pipe(istanbul.hookRequire());
});

gulp.task('test',['pre-test'],function(){
  return gulp.src(['./spec/**/*spec.js'])
  .pipe(jasmineNode({
    timeout: 10000
  }))
  .pipe(istanbul.writeReports({
    dir: './coverage',
    reporters: [ 'lcov' ],
    reportOpts: { dir: './coverage' },
  }))
});

gulp.task('watch-changes',function(){
  gulp.watch('src/inverted-index.js',['build-source']);
  gulp.watch('spec/inverted-index-spec.js', ['build-spec']);
  gulp.watch('public/js/app.js', ['build-frontend-js']);
  gulp.watch(['src/main.js','spec/test.js']).on('change',bsInstance1.reload);
  gulp.watch(['src/main.js','public/css/*.css','public/js/*.bundle.js','public/index.html']).on('change',bsInstance2.reload);
});
