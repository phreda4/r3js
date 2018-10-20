| r3 lib VFRAME play
| PHREDA 2018

^r3/lib/sys.r3

##ink $ff00ff
##paper $ff

::xy>v | x y -- adr
  sw * + 2 << vframe + ;

::cls
  paper vframe sw sh * fill ;
  
::box  | w h x y --
  xy>v >a
  ( 1? 1 -
    ink a> pick3 fill
	sw 2 << a+
    ) 2drop ;

##xa 0 ##ya 0

::pset | x y --
  xy>v ink swap ! ;

::pget | x y -- c
  xy>v @ ;
  
:hline | xd yd xa --
  pick2 - 0? ( drop pset ; )
  -? ( rot over + rot rot neg )
  >r xy>v ink swap r> fill ;
  
:iline | xd yd --
  ya =? ( xa hline ; )
  xa ya 
  pick2 <? ( 2swap )	| xm ym xM yM
  pick2 - >r			| xm ym xM  r:canty
  pick2 - r@ 16 <</
  rot 16 << rot rot
  r> 1 +				| xm<<16 ym delta canty
  ( 1? 1 - >r >r
    over 16 >> over pick3 r@ + 16 >> hline
    1 + swap
    r@ + swap
    r> r> ) 4drop ;
	
::line | x y --
  2dup iline 

::op | x y --
  'ya ! 'xa ! ;	
  
