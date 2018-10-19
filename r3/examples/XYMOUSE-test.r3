| Example 5 DRAW in Canvas

^r3/lib/gr.r3
^r3/lib/str.r3
^r3/lib/dom.r3

:keycode 6 sysmem ;
:keychar 7 sysmem ;
:xymouse 8 sysmem ;

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
  xymouse dup $ffff and swap 16 >>
  xy>v >a
  |ink
  3 sysmem 18 << $ff or
  dup a!+ a!+
  hit
  ;

'dom ondom
'show onshow