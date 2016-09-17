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
  var currentFileCount = Object.keys(Index.getFiles()).length;

  describe('when I add a json file',function(){
    it("it should make sure the file is not empty",function(){
      Index.addFile(hashFunction(filename0),file0);
      expect(Object.keys(Index.getFiles()).length).toEqual(0);
    });

    it("it should increment the files count by one", function () {
      Index.addFile(hashFunction(filename1),file1);
      expect(Object.keys(Index.getFiles()).length).toEqual((currentFileCount + 1));
    });
  });

  describe('when i build an index',function(){
    it("it should created an inverted index",function(){
      Index.buildIndex();
      expect(Object.keys(Index.getIndex()).length).toBeGreaterThan(0);
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
        })
      });
    });
  });

});
