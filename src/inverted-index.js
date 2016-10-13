"use strict";
var _ = require('lodash');

var Index = function () {
  //store uploaded files
  this.jsonFiles = {};
  //store the inverted index
  this.index = {};

  /**
   * Adds a json File to the jsonFiles object
   * if the file passes test
   * @param {string} index
   * @param {string} jsonFile
   * @returns {boolean} 
   */
  this.addFile = function (index, jsonFile) {
    if (this.isAllowedFile(index, jsonFile)) {
      this.jsonFiles[index] = this.parseJSON(jsonFile);
      return true;
    }
    return false;
  };

  /**
   * Tests if a prospective file is valid json,
   * if the file conforms to structure requirements
   * and if the file contains string objects only
   * @param {string} index
   * @param {string} jsonFile
   * @returns {boolean}
   */
  this.isAllowedFile = function (index, jsonFile) {
    var parsedFile = this.parseJSON(jsonFile);
    var isValidFileStructure = this.verifyFileStructure(parsedFile);
    //ensure file is valid JSON and is not empty
    if (parsedFile && _.size(parsedFile) > 0 && isValidFileStructure) {
      //ensure file is not duplicate
      if (!this.jsonFiles[index]) {
        return true;
      }
    }
    return false;
  };

  /**
   * Deletes a file from the jsonFiles object
   * @param {string} index
   */
  this.removeFile = function (index) {
    if (this.jsonFiles[index]) {
      delete this.jsonFiles[index];
    }
  }

  /**
   * Gets and returns a file from the
   * jsonFiles object
   * @param {string} fileIndex
   * @returns {object} 
   */
  this.getFile = function (fileIndex) {
    return this.jsonFiles[fileIndex] === undefined ? false : this.jsonFiles[fileIndex];
  };

  /**
   * Gets all files from the jsonFiles
   * object
   * @returns {object}
   */
  this.getFiles = function () {
    return this.jsonFiles;
  };

  /**
   * Gets the individual words in a string
   * @param {string} string
   * @returns {array}
   */
  this.getWords = function (string) {
    return string.replace(/[.,\/#!$%\^&\*;:'{}=\-_`~()]/g, '').trim().toLowerCase().split(' ');
  };


  /**
   * Creates inverted indices for all files
   * in the jsonFiles object
   */
  this.createAllFilesIndex = function () {
    _.forIn(this.jsonFiles, function (file, fileIndex) {
      this.createIndex(fileIndex);
    }.bind(this));
  };

  /**
   * Creates inverted indices for a specified file
   * in the jsonFiles object
   * @param {string} fileIndex
   */
  this.createIndex = function (fileIndex) {
    if (this.jsonFiles[fileIndex] !== undefined) {
      //create or empty the file index object
      this.index[fileIndex] = {};
      //loop through json objects in file
      _.forIn(this.jsonFiles[fileIndex], function (document, documentIndex) {
        var words = _.uniq(this.getWords(document.title + " " + document.text));
        words.map(function (word) {
          //create word object if undefined
          this.index[fileIndex][word] = this.index[fileIndex][word] || [];
          this.index[fileIndex][word].push(documentIndex);
        }.bind(this));
      }.bind(this));
    }
  }

  /**
   * Deletes a particular inverted index
   * from the index object
   * @param {string} index
   */
  this.removeIndex = function (index) {
    if (this.index[index]) {
      delete this.index[index];
    }
  }


  /**
   * Searches the given file indices for the
   * provided search term(s)
   * @param {array} arrayOfFileIndices
   * @param {array,string} arrayOfSearchTerms
   * @returns {object}
   */
  this.searchIndex = function (arrayOfFileIndices, arrayOfSearchTerms) {
    if (arrayOfFileIndices === undefined || arrayOfFileIndices.length < 1) {
      return [];
    }
    var fileIndices = arrayOfFileIndices;
    //remove the file indices from the arguments object
    delete arguments[0];

    var searchTerms = [];

    _.forIn(arguments, function (arguement, arguementIndex) {
      if (typeof arguement === 'string') {
        arguement = this.getWords(arguement);
      }
      searchTerms.push(arguement);
    }.bind(this));
    //remove null and undefined from searchTerms array
    searchTerms = _.compact(_.flattenDeep(searchTerms));
    return this.searchArray(fileIndices, searchTerms);
  };


  /**
   * Searches the specified file indices for a 
   * given search term
   * @param {array} arrayOfFileIndices
   * @param {string} word
   * @returns {object}
   */
  this.searchSingleWord = function (arrayOfFileIndices, word) {
    var result = {};
    //search each file and add the result to ... well, result :)
    for (var i = 0; i < arrayOfFileIndices.length; i++) {
      var wordLocationInFileIndex = this.getIndex()[arrayOfFileIndices[i]][word]
      if (wordLocationInFileIndex !== undefined) {
        result[arrayOfFileIndices[i]] = wordLocationInFileIndex;
      }
    }
    return result;
  };


  /**
   * Searches the specified file indices for a 
   * given search term
   * @param {array} arrayOfFileIndices
   * @param {array} arrayOfSearchTerms
   * @returns {object}
   */
  this.searchArray = function (arrayOfFileIndices, arrayOfSearchTerms) {
    var result = {};
    arrayOfSearchTerms.forEach(function (value) {
      result[value] = this.searchSingleWord(arrayOfFileIndices, value);
    }.bind(this));
    return result;
  };

  /**
   * Returns all indices or a given index
   * depending on if an argument is passed
   * @param {string} fileIndex
   * @returns {object}
   */
  this.getIndex = function (fileIndex) {
    return fileIndex === undefined ? this.index : this.index[fileIndex] === undefined ? false : this.index[fileIndex];
  };


  /**
   * Parses a given string and 
   * returns a json object
   * @param {string} jsonFile
   * @returns {object, boolean}
   */
  this.parseJSON = function (jsonFile) {
    try {
      return JSON.parse(jsonFile);
    } catch (err) {
      return false;
    }
  };

  /**
   * Verifies the structure of a given json object
   * @param {object,array} jsonFile
   * @returns {boolean}
   */
  this.verifyFileStructure = function (jsonFile) {
    var isValidFile = true;
    _.forIn(jsonFile, function (document, documentIndex) {
      var isValidTitle = document.title !== undefined && document.title.length > 0 && typeof document.title == 'string';
      var isValidText = document.text !== undefined && document.text.length > 0 && typeof document.text == 'string';
      if (!(isValidText && isValidTitle)) {
        isValidFile = false;
        //doesn't actually return, just breaks out of loop
        return false;
      }
    });
    return isValidFile;
  }

};

module.exports = Index;
