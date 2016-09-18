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

  this.getWords = function(string){
    return string.replace(/[.,\/#!$%\^&\*;:'{}=\-_`~()]/g, '').trim().toLowerCase().split(' ');
  };


  this.buildIndex = function(){
    //get an instance of the index class for use inside the lodash loops
    //lodash overwrites "this"
    var self = this;
    //loop through files
    _.forIn(self.jsonFiles,function(file,fileIndex){
      //loop through json objects in file
      _.forIn(file,function(document,documentIndex){
        //create object if undefined
        self.index[fileIndex] = self.index[fileIndex] || {};
        var titleWords = self.getWords(document.title);
        self.saveTokens(titleWords,"title",fileIndex,documentIndex);
        var textWords = self.getWords(document.text);
        self.saveTokens(textWords,"text",fileIndex,documentIndex);
      });
    });
    this.index = self.index;
  };

  this.saveTokens = function(string,stringLocation,fileIndex,documentIndex){
    var tempIndex = this.index;
    _.forIn(string,function(word,wordIndex){
      tempIndex[fileIndex][word] = tempIndex[fileIndex][word] || [];
      var wordDetail = {};
      wordDetail[documentIndex] = stringLocation;
      tempIndex[fileIndex][word].push(wordDetail);
    });
    this.index = tempIndex;
  };

  this.getIndex = function(){
    return this.index;
  };

  this.getFileIndex = function(fileIndex){
    return this.index[fileIndex] !== undefined ? this.index[fileIndex] : false;
  };

};

module.exports = Index;
