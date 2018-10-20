| Example 5 DRAW in Canvas

^r3/lib/gr.r3
^r3/lib/str.r3
^r3/lib/dom.r3

:hit
  keycode -1 <>? ( ink $ff00 xor 'ink ! )
  drop ;

:dom
 "tecla :" echo
  keycode .d echo
  " " echo
  keychar .d echo
  ;

:show
  bmouse 0? ( drop ; ) drop
  xymouse dup $ffff and swap 16 >>
  xy>v >a
  |ink
  msec 18 << $ff or
  dup a!+ a!+
  hit
  ;

'dom ondom
'show onshow