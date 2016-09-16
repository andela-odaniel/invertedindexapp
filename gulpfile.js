"use strict";
var gulp = require('gulp');
var exec = require('child_process').exec;
var browserSync = require('browser-sync').create();
var gulpSequence = require('run-sequence');

gulp.task('default',function(callback){
    gulpSequence('build-source','build-spec','web-test','watch-changes',callback);
});

gulp.task('build-source',function(cb){
  exec('browserify src/inverted-index.js > src/main.js',function(err,stdout,stderr){
    console.log(stdout);
    console.log(stderr);
    if(err){
      console.log(err);
    }
    cb();
  });
});

gulp.task('build-spec',function(cb){
  exec('browserify spec/inverted-index-spec.js > spec/test.js',function(err,stdout,stderr){
    console.log(stdout);
    console.log(stderr);
    if(err){
      console.log(err);
    }
    cb();
  });
});

gulp.task('web-test',function(){
  browserSync.init({
    server: {
      baseDir: '.',
      index: 'spec/SpecRunner.html'
    }
  });
});

gulp.task('watch-changes',function(){
  gulp.watch('src/inverted-index.js',['build-source']);
  gulp.watch('spec/inverted-index-spec.js', ['build-spec']);
  gulp.watch(['src/main.js','spec/test.js']).on('change',browserSync.reload);
});
