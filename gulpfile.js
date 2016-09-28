"use strict";
var gulp = require('gulp');
var exec = require('child_process').exec;
var browserSync = require('browser-sync');
var bsInstance1 = browserSync.create();
var bsInstance2 = browserSync.create();
var gulpSequence = require('run-sequence');

gulp.task('default',function(callback){
    gulpSequence('build-source','build-spec','build-frontend-js',['web-test','web-serve'],'watch-changes',callback);
});

gulp.task('build-source',function(cb){
  exec('browserify src/inverted-index.js -o src/main.js && \cp src/main.js public/js/index.bundle.js',function(err,stdout,stderr){
    console.log(stdout);
    console.log(stderr);
    if(err){
      console.log(err);
    }
    cb();
  });
});

gulp.task('build-spec',function(cb){
  exec('browserify spec/inverted-index-spec.js -o spec/test.js',function(err,stdout,stderr){
    console.log(stdout);
    console.log(stderr);
    if(err){
      console.log(err);
    }
    cb();
  });
});

gulp.task('build-frontend-js',function(cb){
  exec('browserify public/js/script.js -o public/js/script.bundle.js',function(err,stdout,stderr){
    console.log(stdout);
    console.log(stderr);
    if(err){
      console.log(err);
    }
    cb();
  });
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

gulp.task('watch-changes',function(){
  gulp.watch('src/inverted-index.js',['build-source']);
  gulp.watch('spec/inverted-index-spec.js', ['build-spec']);
  gulp.watch('public/js/script.js', ['build-frontend-js']);
  gulp.watch(['src/main.js','spec/test.js']).on('change',bsInstance1.reload);
  gulp.watch(['src/main.js','public/css/*.css','public/js/*.bundle.js','public/index.html']).on('change',bsInstance2.reload);
});
