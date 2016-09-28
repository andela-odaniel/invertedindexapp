"use strict";
var IndexObject = require('../../src/inverted-index');
var $ = require('jquery');
var _ = require('lodash');
window.index = new IndexObject();
$(document).ready(function(){
  var input;
  $('#file_select').click(function(){
    
    //create an input element
    input = $(document.createElement('input'));
    input.attr('type','file');
    input.attr('multiple','true');
    input.trigger('click');

    input.change(function(){
      var files = input.prop('files');
      for(var i = 0; i < files.length; i++){
        var reader = new FileReader();
        (function(fileIndex,reader){
          reader.addEventListener('load', function(){
            window.index.addFile(files[fileIndex].name,reader.result);
            drawFiles();
          });
        })(i,reader);
        reader.readAsText(files[i]);
      }
    return false;
    });
    
  });

  $("#files_pane").on('click','button.create-index',function(){
    var fileName = $(this).closest("div").data("fileName");
    createIndex(fileName);
  });

  $("#files_pane").on('click','button.remove-file',function(){
    var fileName = $(this).closest("div").data("fileName");
    createIndex(fileName);
  });

  

  function createIndex(fileName){
    window.index.createIndex(fileName);
    drawIndex();
  }

  function drawIndex(){
    console.log("draws");
  }

  function drawFiles(){
    var files = window.index.getFiles();
    $('#files_pane').empty();
    _.forIn(files,function(value,key){
      var div = "<div class=\"card-panel white\" data-file-name="+key+" style=\"text-align: center\">"+
              "<p>"+key+"</p>"+
              "<button type=\"button\" class=\"waves-effect waves-light create-index btn\" name=\"button\">Create Index</button>"+
              "<button type=\"button\" class=\"waves-effect waves-light btn red lighten-2\" name=\"button\">Delete File</button>"+
            "</div>";
      $('#files_pane').append(div);
    });
  }
});
