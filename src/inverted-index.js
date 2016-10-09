"use strict";
var _ = require('lodash');

var Index = function(){
  //store uploaded files
  this.jsonFiles = {};
  //store the inverted index
  this.index = {};

  this.addFile = function(index,jsonFile){
    if(this.isAllowedFile(index,jsonFile)){
      this.jsonFiles[index] = this.parseJSON(jsonFile);;
    }
  };

  this.isAllowedFile = function(index,jsonFile){
    var parsedFile = this.parseJSON(jsonFile);
    //ensure file is valid JSON and is not empty
    if(parsedFile && _.size(parsedFile) > 0){
      //ensure file is not duplicate
      if(!this.jsonFiles[index]){
        return true;
      }
    }
    return false;
  };

  this.removeFile = function(index){
    if(this.jsonFiles[index]){
      delete this.jsonFiles[index];
    }
  } 

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
    _.forIn(this.jsonFiles,function(file, fileIndex){
      this.createIndex(fileIndex);
    }.bind(this));
  };

  this.createIndex = function(fileIndex){
    if(this.jsonFiles[fileIndex] !== undefined){
      //create or empty the file index object
      this.index[fileIndex] = {};
      //loop through json objects in file
      _.forIn(this.jsonFiles[fileIndex],function(document,documentIndex){
        var words = _.uniq(this.getWords(document.title+" "+document.text));
        words.map(function(word){
          //create word object if undefined
          this.index[fileIndex][word] = this.index[fileIndex][word] || [];
          this.index[fileIndex][word].push(documentIndex);
        }.bind(this));
      }.bind(this));
    }
  }

  this.removeIndex = function(index){
    if(this.index[index]){
      delete this.index[index];
    }
  }


  this.searchIndex = function(arrayOfFileIndices,arrayOfSearchTerms){
    if(arrayOfFileIndices === undefined || arrayOfFileIndices.length < 1){
      return [];
    }
    var fileIndices = arrayOfFileIndices;
    //remove the file indices from the arguments object
    delete arguments[0];
    
    var searchTerms = [];

    _.forIn(arguments,function(arguement,arguementIndex){
      if(typeof arguement === 'string'){
        arguement = this.getWords(arguement);
      }
      searchTerms.push(arguement);
    }.bind(this));
    //remove null and undefined from searchTerms
    searchTerms = _.compact(_.flattenDeep(searchTerms));
    return this.searchArray(fileIndices,searchTerms);
  };


  this.searchSingleWord = function(arrayOfFileIndices,word){
    var result = {};
    //search each file and add the result to ... well, result :)
    for(var i = 0; i < arrayOfFileIndices.length; i++){
      var wordLocationInFileIndex = this.getIndex()[arrayOfFileIndices[i]][word]
      if(wordLocationInFileIndex !== undefined){
        result[arrayOfFileIndices[i]] = wordLocationInFileIndex;
      }
    }
    return result;
  };

  this.searchArray = function(arrayOfFileIndices,arrayOfSearchTerms){
    console.log(arguments);
    var result = {};
    arrayOfSearchTerms.forEach(function(value){
      result[value] = this.searchSingleWord(arrayOfFileIndices,value);
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
