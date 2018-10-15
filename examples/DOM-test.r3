| Example 3

^lib/dom.r3

#var 0

:1+ 1 'var +! ;
:1- -1 'var +! ;

:dom
  <br>
  "Hola Mundo" .s <br>
  '1- " -1 " <btn>
  " " .s var .d " " .s
  '1+ " +1 " <btn>
  ;

'dom ondom
dom
