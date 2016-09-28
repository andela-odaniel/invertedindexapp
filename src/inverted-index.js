"use strict";
var hashFunction = require('../src/hashObject');
var _ = require('lodash');

var Index = function(){
  //store uploaded files
  this.jsonFiles = {};
  //store the inverted index
  this.index = {};

  this.addFile = function(index,jsonFile){
    var parsedFile = this.parseJSON(jsonFile);
    //if the file is empty, do nothing
    if(parsedFile && _.size(parsedFile) > 0){
      //if file already exists, do nothing
      if(!this.jsonFiles[index]){
        this.jsonFiles[index] = parsedFile;
      }
    }
  };

  this.getFile = function(fileIndex){
    return this.jsonFiles[fileIndex] === undefined ? false : this.jsonFiles[fileIndex];
  };

  this.getFiles = function(){
    return this.jsonFiles;
  };

  this.getWords = function(string){
    return string.replace(/[.,\/#!$%\^&\*;:'{}=\-_`~()]/g, '').trim().toLowerCase().split(' ');
  };


  this.createAllFilesIndex = function(){
    //loop through files
    _.forIn(this.jsonFiles,function(file,fileIndex){
      //loop through json objects in file
      _.forIn(file,function(document,documentIndex){
        //create object if undefined
        this.index[fileIndex] = this.index[fileIndex] || {};
        var titleWords = this.getWords(document.title);
        this.saveTokens(titleWords,"title",fileIndex,documentIndex);
        var textWords = this.getWords(document.text);
        this.saveTokens(textWords,"text",fileIndex,documentIndex);
      }.bind(this));
    }.bind(this));
    // this.index = self.index;
  };

  this.createIndex = function(fileIndex){
    if(this.jsonFiles[fileIndex] !== undefined){
      //loop through json objects in file
      _.forIn(this.jsonFiles[fileIndex],function(document,documentIndex){
        //create object if undefined
        this.index[fileIndex] = this.index[fileIndex] || {};
        var titleWords = this.getWords(document.title);
        this.saveTokens(titleWords,"title",fileIndex,documentIndex);
        var textWords = this.getWords(document.text);
        this.saveTokens(textWords,"text",fileIndex,documentIndex);
      }.bind(this));
    }
  }


  this.searchIndex = function(){
    if(arguments.length === 1){
      return (typeof arguments[0] === 'object') ? this.searchArray(arguments[0]) : this.searchSingleWord(arguments[0]);
    }else{
      return this.searchArray(_.values(arguments));
    }
  };


  this.searchSingleWord = function(word){
    var result = {};
    _.forIn(this.getIndex(),function(file,fileIndex){
      if(file[word] !== undefined){
        result[fileIndex] = file[word];
      }
    });
    return result;
  };

  this.searchArray = function(searchTerms){
    var result = {};
    searchTerms.forEach(function(value){
      result[value] = this.searchSingleWord(value);
    }.bind(this));
    return result;
  };

  this.saveTokens = function(string,stringLocation,fileIndex,documentIndex){
    _.forIn(string,function(word,wordIndex){
      this.index[fileIndex][word] = this.index[fileIndex][word] || [];
      var wordDetail = {};
      wordDetail[documentIndex] = stringLocation;
      this.index[fileIndex][word].push(wordDetail);
    }.bind(this));
  };

  this.getIndex = function(fileIndex){
    return fileIndex === undefined ?  this.index : this.index[fileIndex] === undefined ? false : this.index[fileIndex];
  };


  this.parseJSON = function(jsonFile){
      try {
          return JSON.parse(jsonFile);
      } catch (err) {
          return false;
      }
  };

};

module.exports = Index;
