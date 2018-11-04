| Example 5 DRAW in Canvas

^lib/gr.r3

:xym 
  xymouse dup $ffff and swap 16 >> ;
  
#last 0

:show
  bmouse 0? ( 'last ! ; ) drop
  last 0? ( drop 1 'last ! xym op ; ) drop
  xym line ;

'show onshow