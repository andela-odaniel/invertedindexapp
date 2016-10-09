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
            drawFile(files[fileIndex].name);
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
    console.log(window.index.getIndex(fileName));
    drawIndex(fileName);
  }

  function drawFile(fileName){
    var file = window.index.getFile(fileName);
    if(file){
      var div = "<div class=\"card-panel white\" data-file-name="+fileName+" style=\"text-align: center\">"+
              "<p>"+fileName+"</p>"+
              "<button type=\"button\" class=\"waves-effect waves-light create-index btn\" name=\"button\">Create Index</button>"+
              "<button type=\"button\" class=\"waves-effect waves-light btn red lighten-2\" name=\"button\">Delete File</button>"+
            "</div>";
      $('#files_pane').append(div);
    }
  }

  function drawIndex(fileName){
    var index = window.index.getIndex(fileName);
    if(index){
      var div = "<div class=\"card-panel white\" data-file-name="+fileName+"style=\"text-align: center\">\
                    <table>\
                      <thead>\
                        <th>"+fileName+"</th>\
                      </thead>\
                      <tbody>\
                        <tr>\
                          <td>Word</td>\
                          <td>Doc1</td>\
                          <td>Doc2</td>\
                        </tr>"+
                        drawRows(index,fileName);
                        +"\
                      </tbody>\
                    </table>\
                  </div>";
      $('#index_pane').append(div);
    };
  }
});

function drawRows(index,fileName){
  var numberOfDocuments = _.size(window.index.getFile(fileName));
   var result = "";
  _.forIn(index,function(word,wordIndex){
    result += "<tr><td>"+wordIndex+"</td>";
    console.log("current word is '"+ wordIndex+"'");
    for(var i = 0; i < numberOfDocuments; i++){
      console.log("Run #"+i);
      if(word[i] !== undefined){
        console.log("the current document is");
        console.log(word[i]);
        var currentKey = Object.keys(word[i]);
        console.log("currentKey is "+ currentKey);
        console.log("counter is " + i);
        console.log(" ---------- ");
        if(currentKey == i){
          result +="<td>&#10004;</td>";
        }
        else{
          result +="<td></td>";
        }
      }
    }
    result += "</tr>";
  });
  return result;
}
