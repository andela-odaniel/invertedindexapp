"use strict";
var crypto = require('crypto');

var hashObject = function (object) {
  var hash = crypto.createHash('md5')
    .update(JSON.stringify(object, function (k, v) {
      if (k[0] === "_"){ return undefined; } // remove api stuff
      else if (typeof v === "function"){ // consider functions
        return v.toString();
      }
      else { return v;}
    }))
    .digest('hex');
  return hash;
};

module.exports = hashObject;
