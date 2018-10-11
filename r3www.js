'use strict';

(function() {

  function Run(code) {
	r3boot();
	r3echo="";
	r3reset();
	if (r3token(code)!=0) { return;	}
	r3run();
	redraw();
	document.getElementById("r3dom").innerHTML=r3echo;
  }

  
  function Init() {
      Array
      .from(document.getElementsByTagName('script'))
      .filter(({type}) => type === 'text/r3')
      .forEach(({text}) => Run(text));
  }

  function Main() {
    if (typeof window !== 'undefined') {
      window.addEventListener('load', Init);
      window.R3 = function (code) { return Run(code); };
    } else {
      exports.R3 = function (code) { return Run(code); };
    }
  }

  Main();

})();