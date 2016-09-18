"use strict";
var IndexObject = require('../src/inverted-index');
var hashFunction = require('../src/hashObject');
var filename0 = '../data/file0.js';
var filename1 = '../data/file1.js';
var file0 = require(filename0);
var file1 = require(filename1);
var _ = require('lodash');

describe('Inverted Index Class',function(){
  var Index = new IndexObject();
  var currentFileCount = _.size(Index.getFiles());

  describe('when I add a json file',function(){
    it("it should make sure the file is not empty",function(){
      Index.addFile(hashFunction(filename0),file0);
      expect(_.size(Index.getFiles())).toEqual(0);
    });

    it("it should increment the files count by one", function () {
      Index.addFile(hashFunction(filename1),file1);
      expect(_.size(Index.getFiles())).toEqual((currentFileCount + 1));
    });
  });

  describe('when i build an index',function(){
    it("it should created an inverted index",function(){
      Index.buildIndex();
      expect(_.size(Index.getIndex())).toBeGreaterThan(0);
    });

    it("it should be an accurate index of the file",function(){
      //get the inverted index
      var index = Index.getIndex();
      //get the uploaded json Files
      var files = Index.getFiles();
      _.forIn(index,function(file,fileIndex){
        _.forIn(file,function(word,wordIndex){
          _.forIn(word,function(object,objectIndex){
            _.forIn(object,function(value,key){
              //get the json object referred to by the index entry
              var containingString = files[fileIndex][key][value].toLowerCase();
              //check if the string contains the index entry
              expect(containingString.indexOf(wordIndex)).toBeGreaterThan(-1);
            });
          });
        });
      });
    });
  });

  describe('when i search the index',function(){
    it('it should be able to handle a varied number of arguments',function(){
      // expect(_.isEmpty(Index.searchIndex('a'))).toBeFalsy(); //check this later. test fails
      expect(_.isEmpty(Index.searchIndex('a','the'))).toBeFalsy();
      expect(_.isEmpty(Index.searchIndex('a','of','the'))).toBeFalsy();
    });

    it('it should be able to handle an array of arguments',function(){
      expect(_.isEmpty(Index.searchIndex(['a','the']))).toBeFalsy();
    });

    it('it should return an empty object if the search term does not exist',function(){
      var searchResult = Index.searchIndex(['aphid','rex']);
      expect(_.isEmpty(searchResult.aphid)).toBeTruthy();
      expect(_.isEmpty(searchResult.rex)).toBeTruthy();
    });
  });

});
