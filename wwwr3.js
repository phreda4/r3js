'use strict';

(function() {


  function Compile(code) {
    return code;
  }
  
  function Execute(what) {
    Say(what);
    console.log(what);
  }

  function Run(code) {
    return Execute(Compile(code));
  }

  function Say(what) {
    const createNewDiv = () => document.body.appendChild(document.createElement('div'));
    const [firstDiv = createNewDiv()] = document.getElementsByTagName('div');
    firstDiv.appendChild(document.createTextNode(what));
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