| Example 5 DRAW in Canvas

##ink $ff00ff

:keycode 6 sysmem ;
:keychar 7 sysmem ;
:xymouse 8 sysmem ;

::vframe 0 sysmem ;
::sw 1 sysmem ;
::sh 2 sysmem ;

::onshow 2 syscall ;

::xy>v | x y -- adr
  sw * + 2 << vframe + ;

::cls
  0 vframe sw sh * fill ;

:hit
  keycode -1 <>? ( ink $ff00 xor 'ink ! )
  drop ;

::ondom 1 syscall ;
::echo 0 syscall ;


#mbuff * 48

:sign | sign --
 -? ( drop $2d over c! ; ) drop 1 + ;

::.d | val -- str
 dup abs
 'mbuff 47 + 0 over c! 1 -
 swap ( 10 /mod $30 + pick2 c! swap 1 - swap 1? ) drop
 swap sign ;

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


