"use strict";
var hashFunction = require('../src/hashObject');
var _ = require('lodash');

var Index = function(){
  //store files
  this.jsonFiles = {};
  //store index
  this.index = {};

  this.addFile = function(index,jsonFile){
    //if the file is empty, do nothing
    if(jsonFile.length > 0){
      //if this a new file, store it
      if(!this.jsonFiles[index]){
        this.jsonFiles[index] = jsonFile;
      }
      else{
        //if there's been a change to the file contents, update the file
        if(hashFunction(this.jsonFiles[index]) !== hashFunction(jsonFile)){
          this.jsonFiles[index] = jsonFile;
        }
      }
    }
  };

  this.getFiles = function(){
    return this.jsonFiles;
  };

  this.getUniqueWords = function(string){
    return _.uniq(string.replace(/[.,\/#!$%\^&\*;:'{}=\-_`~()]/g, '').trim().toLowerCase().split(' '));
  };


  this.buildIndex = function(){
    //get an instance of the index class for use inside the lodash loops
    //lodash overwrites "this"
    var self = this;
    _.forIn(this.jsonFiles,function(file,fileIndex){
      _.forIn(file,function(document,documentIndex){
        self.index[fileIndex] = self.index[fileIndex] || {};
        var titleWords = self.getUniqueWords(document.title);
        _.forIn(titleWords,function(word,wordIndex){
          self.index[fileIndex][word] = self.index[fileIndex][word] || [];
          var wordDetail = {};
          wordDetail[documentIndex] = "title";
          self.index[fileIndex][word].push(wordDetail);
        });
        var textWords = self.getUniqueWords(document.text);
        _.forIn(textWords,function(word,wordIndex){
          self.index[fileIndex][word] = self.index[fileIndex][word] || [];
          var wordDetail = {};
          wordDetail[documentIndex] = "text";
          self.index[fileIndex][word].push(wordDetail);
        });
      });
    });
    this.index = self.index;
  };


  this.getIndex = function(fileIndex){
    return this.index[fileIndex] !== undefined ? this.index[fileIndex] : false;
  };

};

module.exports = Index;
