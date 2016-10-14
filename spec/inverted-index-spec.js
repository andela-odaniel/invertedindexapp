"use strict";

var IndexObject = require('../src/inverted-index');
var _ = require('lodash');
var fs = require('fs');

/*****
 * HELPER JSON FILES TO RUN TESTS
 * *****/
//empty json file
var filename0 = 'data/file0.json';
//invalid json file
var filename1 = 'data/file1.json';
//valid json file
var filename2 = 'data/file2.json';
//another valid json file
var filename3 = 'data/file3.json';
//invalid json file, text empty
var filename4 = 'data/file4.json';
//invalid json file, structure incorrect
var filename5 = 'data/file5.json';

/**
 * Reads a given file from the filesystem
 * and runs a callback with the data
 * @param {string} fileName
 * @param {function} callback
 */
var readFile = function (fileName, callback) {
  fs.readFile(fileName, 'utf-8', function (err, data) {
    if (err) {
      //fail test
      expect(true).toBeFalsy();
    }
    callback(data);
  });
}

/**
 * Main Test Suite to test the Inverted Index class
**/
describe('Inverted Index Class', function () {
  var Index = new IndexObject();

  /**
   * Test Suite to test reading book data
  **/
  describe('Read Book Data', function () {
    var currentFileCount = _.size(Index.getFiles());

    describe('when I add a json file', function () {

      it("it should make sure the file is not empty", function (done) {
        readFile(filename0, function (data) {
          Index.addFile(filename0, data);
          expect(_.size(Index.getFiles())).toEqual(0);
          done();
        });
      });

      it("it should make sure the file is a valid json array", function (done) {
        readFile(filename1, function (data) {
          Index.addFile(filename1, data);
          expect(Index.addFile(filename1, data)).toBeFalsy();
          done();
        });
      });


      it("it should not add the same file twice", function (done) {
        readFile(filename2, function (data) {
          Index.addFile(filename2, data);
          readFile(filename2, function (data2) {
            expect(Index.addFile(filename2, data)).toBeFalsy();
            done();
          });
        });
      });

      it("it should make sure the the text and title are not empty", function (done) {
        readFile(filename4, function (data) {
          expect(Index.addFile(filename4, data)).toBeFalsy();
          done();
        });
      });

      it("it should make sure the file has the correct structure", function (done) {
        readFile(filename5, function (data) {
          expect(Index.addFile(filename5, data)).toBeFalsy();
          done();
        });
      });

      it("it should increment the files count by one", function (done) {
        readFile(filename2, function (data) {
          Index.addFile(filename2, data);
          expect(_.size(Index.getFiles())).toEqual(currentFileCount + 1);
          done();
        });
      });

    });

  });

  /**
   * Test Suite to test populating the file index
  **/
  describe('Populate Index', function () {

    describe('when i build an index', function () {

      it("it should create an inverted index object", function (done) {
        readFile(filename2, function (data) {
          Index.addFile(filename2, data);
          Index.createIndex(filename2);
          expect(_.size(Index.getIndex())).toBeGreaterThan(0);
          expect(Index.getIndex(filename2)).toBeDefined;
          expect(typeof Index.getIndex(filename2)).toEqual('object');
          done();
        });
      });

      it("it should be an accurate index of the file", function (done) {
        readFile(filename3, function (data) {
          Index.addFile(filename3, data);
          Index.createIndex(filename3);
          //get the inverted index for the file
          var index = Index.getIndex(filename3);
          //get the uploaded json Files
          var file = Index.getFile(filename3);
          _.forIn(index, function (word, wordIndex) {
            for (var i = 0; i < word.length; i++) {
              //get the json object referred to by the index entry
              var containingString = (file[word[i]].title + " " + file[word[i]].text).toLowerCase();
              //check if the string contains the index entry
              expect(containingString.indexOf(wordIndex)).toBeGreaterThan(-1);
            }
          });
          done();
        });
      });

    });

  });

  /**
   * Test Suite to test searching the file index
  **/
  describe('Search Index', function () {
    describe('when i search the index', function () {
      beforeEach(function () {
        Index = new IndexObject();
        var file = fs.readFileSync(filename2, 'utf-8');
        Index.addFile(filename2, file);
        Index.createIndex(filename2);
      });

      it('it should return a correct result', function () {
        var files = Index.getFiles();
        var result = Index.searchIndex([filename2], 'a', 'the');
        var result_a = result['a'][filename2];
        var result_the = result['the'][filename2];

        result_a.forEach(function (value) {
          var containingString = files[filename2][value].title + " " + files[filename2][value].text;
          expect(containingString.indexOf('a')).toBeGreaterThan(-1);
        });

        result_the.forEach(function (value) {
          var containingString = files[filename2][value].title + " " + files[filename2][value].text;
          expect(containingString.indexOf('the')).toBeGreaterThan(-1);
        });
      });

      it('it should not take too long to search', function () {
        var files = Index.getFiles();
        var startTime = new Date();
        var result = Index.searchIndex([filename2], 'a');
        var endTime = new Date();
        var result_a = result['a'][filename2];
        expect(endTime.getTime() - startTime.getTime()).toBeLessThan(5.0);

        result_a.forEach(function (value) {
          var containingString = files[filename2][value].title + " " + files[filename2][value].text;
          expect(containingString.indexOf('a')).toBeGreaterThan(-1);
        });
      });

      it('it should be able to handle a varied number of arguments', function () {
        var searchTerms = {
          0: 'termite',
          1: 'a apple ball',
          2: 'cat',
          3: 'the',
          4: ['a', 'of', 'the'],
        }
        //takes one term
        var result0 = Index.searchIndex([filename2], searchTerms[0]);
        expect(result0['termite']).toBeDefined();

        //takes 2 terms
        var result1 = Index.searchIndex([filename2], searchTerms[0], searchTerms[2]);
        expect(result1['termite']).toBeDefined();
        expect(result1['cat']).toBeDefined();

        //takes 3 terms
        var result2 = Index.searchIndex([filename2], searchTerms[0], searchTerms[2], searchTerms[3]);
        expect(result2['termite']).toBeDefined();
        expect(result2['cat']).toBeDefined();
        expect(result2['the']).toBeDefined();

        //takes a sentence
        var result3 = Index.searchIndex([filename2], searchTerms[1]);
        expect(result3['a']).toBeDefined();
        expect(result3['apple']).toBeDefined();
        expect(result3['ball']).toBeDefined();

        //takes a sentence and a string
        var result4 = Index.searchIndex([filename2], searchTerms[0], searchTerms[1]);
        expect(result4['a']).toBeDefined();
        expect(result4['apple']).toBeDefined();
        expect(result4['ball']).toBeDefined();
        expect(result4['termite']).toBeDefined();


        //takes an array and a string
        var result5 = Index.searchIndex([filename2], searchTerms[1], searchTerms[4]);
        expect(result5['a']).toBeDefined();
        expect(result5['apple']).toBeDefined();
        expect(result5['ball']).toBeDefined();
        expect(result5['of']).toBeDefined();
        expect(result5['the']).toBeDefined();
      });

      it('it should be able to handle an array of arguments', function () {
        var result = Index.searchIndex([filename2], ['a', 'the']);
        expect(result['a']).toBeDefined();
        expect(result['the']).toBeDefined();
      });

      it('it should return an empty object if the search term does not exist', function () {
        var searchResult = Index.searchIndex([filename2], ['aphid', 'rex']);
        expect(_.isEmpty(searchResult.aphid)).toBeTruthy();
        expect(_.isEmpty(searchResult.rex)).toBeTruthy();
      });
    });
  });
});
