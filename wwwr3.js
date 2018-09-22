'use strict';

(function() {


  function Compile(code) {
    return code;
  }
  
  function Execute(what) {
  console.log(what);
  }


  function Init() {
    var tags = document.getElementsByTagName('script');
    var count = 0;
    for (var t = 0; t < tags.length; ++t) {
      if (tags[t].type != 'text/r3') {
        continue;
      }
      ++count;
    }
    var full_window = count == 1 && document.body.innerText == '';
    for (var t = 0; t < tags.length; ++t) {
      if (tags[t].type != 'text/r3') {
        continue;
      }
      var tag = tags[t];
      if (tags[t].src) {
        var request = new XMLHttpRequest();
        request.addEventListener('load', function(e) {
          Execute(Compile(request.responseText));
        }, false);
        request.open('GET', tag.src);
        request.send();
      } else {
        Execute(Compile(tag.text));
      }
    }
  }

  function Main() {
    if (typeof window !== 'undefined') {
      window.addEventListener('load', Init);
      window.R3 = function (code) { return Execute(Compile(code)); };
    } else {
      exports.R3 = function (code) { return Execute(Compile(code)); };
    }
  }

  Main();

})();