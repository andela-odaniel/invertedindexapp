"use strict";
var IndexObject = require('../src/inverted-index');
// var fs = require('fs');
var hashFunction = require('../src/hashObject');
var file0 = require('../data/file0.js');
var file1 = require('../data/file1.js');

describe('Inverted Index Class',function(){
  var Index = new IndexObject();
  var currentFileCount = Object.keys(Index.getFiles()).length;

  describe('when I add a json file',function(){
    it("it should make sure the file is not empty",function(){
      Index.addFile(hashFunction(file0),file0);
      expect(Object.keys(Index.getFiles()).length).toEqual(0);
    });

    it("it should increment the files count by one", function () {
      Index.addFile(hashFunction(file1),file1);
      expect(Object.keys(Index.getFiles()).length).toEqual((currentFileCount + 1));
    });
  });

  describe('when i build an index',function(){
    it("it should created an inverted index",function(){
      Index.buildIndex();
      expect(Object.keys(Index.getIndex()).length).toBeGreaterThan(0);
    });
  });

});
