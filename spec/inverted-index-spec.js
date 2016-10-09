"use strict";
var IndexObject = require('../src/inverted-index');
var hashFunction = require('../src/hashObject');
//empty json file
var filename0 = 'data/file0.json';
//invalid json file
var filename1 = 'data/file1.json';
//valid json file
var filename2 = 'data/file2.json';
//another valid json file
var filename3 = 'data/file3.json';
var _ = require('lodash');
var fs = require('fs');
// var fs = require('browserify-fs');

var readFile = function(fileName,callback){
  fs.readFile(fileName,'utf-8',function(err,data){
    if(err){
      //fail test
      expect(true).toBeFalsy();
    }
    callback(data);
  });
}

describe('Inverted Index Class',function(){
  var Index = new IndexObject();

  describe('Read Book Data',function(){
    var currentFileCount = _.size(Index.getFiles());
    describe('when I add a json file',function(){

      it("it should make sure the file is not empty",function(done){
        readFile(filename0,function(data){
          Index.addFile(filename0,data);
          expect(_.size(Index.getFiles())).toEqual(0);
          done();
        });
      });

      it("it should make sure the file is a valid json array",function(done){
        readFile(filename1,function(data){
          Index.addFile(filename1,data);
          expect(_.size(Index.getFiles())).toEqual(0);
          done();
        });
      });

      it("it should increment the files count by one", function (done){
        readFile(filename2,function(data){
          Index.addFile(filename2,data);
          expect(_.size(Index.getFiles())).toEqual((currentFileCount + 1));
          done();
        });
      });

      it("it should not add the same file twice", function (done) {
        readFile(filename2,function(data){
          Index.addFile(filename2,data);
          readFile(filename2,function(data2){
            Index.addFile(filename2,data2);
            expect(_.size(Index.getFiles())).toEqual(1);
            done();
          });
        });
      });

    });
  });

  describe('Populate Index',function(){
    describe('when i build an index',function(){
      
      it("it should created an inverted index object",function(done){
        readFile(filename2,function(data){
          Index.addFile(filename2,data);
          Index.createIndex(filename2);
          expect(_.size(Index.getIndex())).toBeGreaterThan(0);
          expect(Index.getIndex()[filename2]).toBeDefined;
          done();
        });
      });

      it("it should be an accurate index of the file",function(done){
        readFile(filename3,function(data){
          Index.addFile(filename3,data);
          Index.createIndex(filename3);
          //get the inverted index for the file
          var index = Index.getIndex(filename3);
          //get the uploaded json Files
          var file = Index.getFile(filename3);          
          _.forIn(index,function(word,wordIndex){
            for(var i = 0; i < word.length; i ++){
              //get the json object referred to by the index entry
              var containingString = (file[word[i]].title +" "+ file[word[i]].text).toLowerCase();
              //check if the string contains the index entry
              expect(containingString.indexOf(wordIndex)).toBeGreaterThan(-1);
            }
          });
          done();
        });
      });

    });
  });

  describe('Search Index',function(){
    describe('when i search the index',function(){
      beforeEach(function(){
        // Index = new IndexObject();
        var file = fs.readFileSync(filename2,'utf-8');
        Index.addFile(filename2,file);
        Index.createIndex(filename2);
      });

      it('it should return a correct result',function(){
        var files = Index.getFiles();
        var result = Index.searchIndex([filename2],'a','the');
        var result_a = result['a'][filename2];
        var result_the = result['the'][filename2];
                
        result_a.forEach(function(value){
          var containingString = files[filename2][value].title+" "+files[filename2][value].text; 
          expect(containingString.indexOf('a')).toBeGreaterThan(-1);
        });

        result_the.forEach(function(value){
          var containingString = files[filename2][value].title+" "+files[filename2][value].text; 
          expect(containingString.indexOf('the')).toBeGreaterThan(-1);
        });
      });

      it('it should be able to handle a varied number of arguments',function(){
        expect(_.isEmpty(Index.searchIndex([filename2],'a apple ball'))).toBeFalsy();
        expect(_.isEmpty(Index.searchIndex([filename2],'a','the'))).toBeFalsy();
        expect(_.isEmpty(Index.searchIndex([filename2],['a','of','the']))).toBeFalsy();
        expect(_.isEmpty(Index.searchIndex([filename2],['a'],'of','the'))).toBeFalsy();
      });

      it('it should be able to handle an array of arguments',function(){
        expect(_.isEmpty(Index.searchIndex([filename2],['a','the']))).toBeFalsy();
      });

      it('it should return an empty object if the search term does not exist',function(){
        var searchResult = Index.searchIndex([filename2],['aphid','rex']);
        expect(_.isEmpty(searchResult.aphid)).toBeTruthy();
        expect(_.isEmpty(searchResult.rex)).toBeTruthy();
      });
    });
  });
});