"use strict";
var _ = require('lodash');

var Index = function () {

  /* store uploaded files */
  this.jsonFiles = {};

  /* store the inverted index */
  this.index = {};

  /* store files to search */
  this.searchSpace = [];
}

/**
 * Adds a json File to the jsonFiles object
 * if the file passes test
 * @param {string} index
 * @param {string} jsonFile
 * @returns {boolean}
 */
Index.prototype.addFile = function (index, jsonFile) {
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
Index.prototype.isAllowedFile = function (index, jsonFile) {
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
Index.prototype.removeFile = function (index) {
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
Index.prototype.getFile = function (fileIndex) {
  return this.jsonFiles[fileIndex] === undefined ? false : this.jsonFiles[fileIndex];
};

/**
 * Gets all files from the jsonFiles
 * object
 * @returns {object}
 */
Index.prototype.getFiles = function () {
  return this.jsonFiles;
};

/**
 * Gets the individual words in a string
 * @param {string} string
 * @returns {array}
 */
Index.prototype.getWords = function (string) {
  return string.replace(/[.,\/#!$%\^&\*;:'{}=\-_`~()]/g, '').trim().toLowerCase().split(' ');
};


/**
 * Creates inverted indices for a specified file
 * in the jsonFiles object
 * @param {string} fileIndex
 */
Index.prototype.createIndex = function (fileIndex) {
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
Index.prototype.removeIndex = function (index) {
  if (this.index[index]) {
    delete this.index[index];
  }
}

/**
 * Searches the given file indices for the
 * provided search term(s)
 * @param {array} arrayOfFileIndices
 * @param {array,string} searchTerms
 * @returns {object}
 */
Index.prototype.doSearch = function () {
  /** check if the first argument is an array of file indices to search
   * parameters must be at least 2, an array of indices to search and the terms to find
   **/
  if(Array.isArray(arguments[0]) && Object.keys(arguments).length > 1){
    var prospectiveFileIndices = arguments[0];
    var i = 0;
    for(i; i < prospectiveFileIndices.length; i ++){
      /* if the propective file index exists add it to the search space */
      if(this.jsonFiles[prospectiveFileIndices[i]] != undefined){
        this.searchSpace.push(prospectiveFileIndices[i]);
      }
    }
  }

  var result = [];
  /* check if any file indices have been set to be searched */
  if(this.searchSpace.length > 0){
    /* remove the first argument so that all that remain are search terms */
    delete arguments[0];

    var searchTerms = [];

    _.forIn(arguments, function (argument, argumentIndex) {
      if (typeof argument === 'string') {
        argument = this.getWords(argument);
      }

      if(argument != null && argument != undefined){
        searchTerms.push(argument);
      }
    }.bind(this));

    //remove null and undefined from searchTerms array
    searchTerms = _.flattenDeep(searchTerms);
    if(searchTerms.length > 0){
      result = this.searchIndex(searchTerms);
    }
    /* reset the search space*/
    this.searchSpace = [];
  }

  return result;
}


/**
 * Searches the given file indices for the
 * provided search term(s)
 * @param {array} arrayOfSearchTerms
 * @returns {object}
 */
Index.prototype.searchIndex = function (arrayOfSearchTerms) {
  if(Array.isArray(arrayOfSearchTerms) && this.searchSpace.length > 0){
    return this.searchArray(this.searchSpace, arrayOfSearchTerms);
  }else{
    return [];
  }
};


/**
 * Searches the specified file indices for a
 * given search term
 * @param {array} arrayOfFileIndices
 * @param {string} word
 * @returns {object}
 */
Index.prototype.searchSingleWord = function (arrayOfFileIndices, word) {
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
Index.prototype.searchArray = function (arrayOfFileIndices, arrayOfSearchTerms) {
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
 * @returns {object,boolean}
 */
Index.prototype.getIndex = function (fileIndex) {
  if(fileIndex === undefined){
    return this.index;
  }else{
    if(this.index[fileIndex] != undefined){
      return this.index[fileIndex];
    }else{
      return false;
    }
  }
};


/**
 * Parses a given string and
 * returns a json object
 * @param {string} jsonFile
 * @returns {object, boolean}
 */
Index.prototype.parseJSON = function (jsonFile) {
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
Index.prototype.verifyFileStructure = function (jsonFile) {
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

module.exports = Index;
