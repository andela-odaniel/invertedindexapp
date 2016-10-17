( function(){
    var IndexObject = require('../../src/inverted-index');
    var app = angular.module('invertedIndex',['ngFileUpload']);

    app.directive('jsonFile',function() {
        return {
            restrict: 'E',
            templateUrl: 'templates/fileDirective.html'
        }
    });

    app.directive('fileIndex',function() {
        return {
            restrict: 'E',
            templateUrl: 'templates/indexDirective.html'
        }
    });

    app.directive('filesCheckbox',function() {
        return {
            restrict: 'E',
            templateUrl: 'templates/filesCheckbox.html'
        }
    });

    app.controller('IndexController',['$rootScope','$scope','$timeout',function($rootScope,$scope,$timeout){
        $scope.index = new IndexObject();
        $scope.filesEmpty = true;
        $scope.indexEmpty = true;
        $scope.searchResultEmpty = true;
        $scope.searchTerm;
        $scope.numberOfDocuments = {};
        $scope.selectedFiles = [];
        $scope.searchResult = [];
        $rootScope.keys = Object.keys;

        $scope.trackFilesSize = function() {
            if (Object.keys($scope.index.jsonFiles).length) {
                $scope.filesEmpty = false;
            }else{
                 $scope.filesEmpty = true;
            }
        }

        $scope.trackIndexSize = function() {
            if (Object.keys($scope.index.index).length) {
                $scope.indexEmpty = false;
            }else{
                 $scope.indexEmpty = true;
            }
        }

        $scope.uploadFiles = function(files) {
            for (var i = 0; i < files.length; i++) {
                var reader = new FileReader();
                ( function($scope,reader,fileName) {

                reader.addEventListener('load', function(){
                    $timeout(function() {
                        try{
                            var uploadedFile = angular.fromJson(reader.result);
                            if (!$scope.keys(uploadedFile).length) {
                                Materialize.toast(fileName+' is empty', 2000,'rounded');
                            }else{
                                if ($scope.index.addFile(fileName,reader.result)) {
                                    $scope.trackFilesSize();
                                    Materialize.toast(fileName+' uploaded', 2000,'rounded');
                                }else{
                                    Materialize.toast(fileName+' is invalid', 2000,'rounded');
                                }
                            }
                        }catch(err){
                            Materialize.toast(fileName+' is invalid', 2000,'rounded');
                        } 
                    });
                    
                });
                })($scope,reader,files[i].name);
                reader.readAsText(files[i]);
            }
        }

        $scope.deleteFile = function(fileName) {
            console.log(fileName);
            $scope.index.removeFile(fileName);
            $scope.trackFilesSize();
            $scope.deleteIndex(fileName);
            Materialize.toast(fileName+' file deleted', 2000,'rounded');            
        }

        $scope.createIndex = function(fileName) {
            $scope.index.createIndex(fileName);
            $scope.trackIndexSize();
            //js lacks a range function, we'll have to improvise
            $scope.numberOfDocuments[fileName] = [];
            var i = 0;
            for (i; i < $scope.index.jsonFiles[fileName].length; i++) {
                $scope.numberOfDocuments[fileName].push(i);
            }
            Materialize.toast(fileName+' index created', 2000,'rounded');            
        }

        $scope.deleteIndex = function(fileName) {
            $scope.index.removeIndex(fileName);
            $scope.trackIndexSize();
            Materialize.toast(fileName+' index deleted', 2000,'rounded');
        }

        $scope.fileSelected = function(fileName) {
            var fileIndex = $scope.selectedFiles.indexOf(fileName);
            if(fileIndex > -1){
                $scope.selectedFiles.splice(fileIndex,1);
            }
            else{
                $scope.selectedFiles.push(fileName);
            }
        }

        $scope.search = function() {
            if($scope.searchTerm.length > 0) {
                if($scope.selectedFiles.length){
                    $scope.searchResult = $scope.index.doSearch($scope.selectedFiles,$scope.searchTerm);
                }else{
                    $scope.searchResult = $scope.index.doSearch(null,$scope.searchTerm);
                }
                $scope.searchTerm = '';
                $scope.selectedFiles = [];
                $scope.searchResultEmpty = false;
            }else{
                Materialize.toast('Enter a word to search', 3000,'rounded');
            }
        }
    }]);
})();