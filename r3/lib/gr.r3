| r3 lib VFRAME play
| PHREDA 2018

^lib/sys.r3

##ink $ff00ff
##paper $ff

::xy>v | x y -- adr
  sw * + 2 << vframe + ;

::cls
  paper vframe sw sh * fill ;
  
##xa 0 ##ya 0

::pset | x y --
  xy>v ink swap ! ;

::pget | x y -- c
  xy>v @ ;
  
:hline | xd yd xa --
  pick2 - 0? ( drop pset ; )
  -? ( rot over + rot rot neg )
  >r xy>v ink swap r> fill ;
  
:vline | x1 y1 cnt
	rot rot xy>v >a
	( 1? 1 - ink a! sw 2 << a+ ) drop ;
	
:iline | xd yd --
  ya =? ( xa hline ; )
  xa ya 
  pick2 <? ( 2swap )   | xm ym xM yM
  pick2 - 1 + >r	   | xm ym xM  r:canty
  pick2 - 0? ( drop r> vline ; )
  r@ 16 <</
  rot 16 << $8000 + 
  rot rot r>           | xm<<16 ym delta canty
  ( 1? 1 - >r >r
    over 16 >> over pick3 r@ + 16 >> hline
    1 + swap
    r@ + swap
    r> r> ) 4drop ;
	
::line | x y --
  2dup iline 

::op | x y --
  'ya ! 'xa ! ;	

::rect  | w h x y --
  xy>v >a
  ( 1? 1 -
    ink a> pick3 fill
	sw 2 << a+
    ) 2drop ;
	
#ym #xm
#dx #dy

:qfill | x y
	ym over - xm pick3 - over op
	xm pick3 + swap line
	ym over + xm pick3 - over op
	xm pick3 + swap line ;
:qf
	xm pick2 - ym pick2 - xm pick4 + hline 
	xm pick2 - ym pick2 + xm pick4 + hline ;
	

:qfill1 | x y
	xm pick2 - ym op
	xm pick2 + ym line ;
:qf1
	ym xm pick3 - xm pick4 + hline ;
	
::ellipse | a b rx ry --
	'ym ! 'xm !
	over dup * dup 1 <<		| a b c 2aa
	swap dup >b 'dy ! 		| a b 2aa
	rot rot over neg 1 << 1 +	| 2aa a b c
	swap dup * dup 1 << 		| 2aa a c b 2bb
	rot rot * dup b+ 'dx !	| 2aa a 2bb
	swap 1				| 2aa 2bb x y
	pick3 'dy +! dy b+
	qfill1
	( swap +? swap 		| 2aa 2bb x y
		b> 1 <<
		dx >=? ( rot 1 - rot rot pick3 'dx +! dx b+ )
		dy <=? ( rot rot qfill 1 + rot pick4 'dy +! dy b+ )
		drop
		)
	4drop ;

::circle | x y r --
	dup ellipse ;
	
::circleb | x y r --
	dup 1 << 'ym ! 1 - 0
	1 'dx ! 1 'dy !
	1 ym - 'xm !
	( over <=?  | x0 y0 x y 
		pick3 pick2 + pick3 pick2 + pset
		pick3 pick2 - pick3 pick2 + pset
		pick3 pick2 + pick3 pick2 - pset
		pick3 pick2 - pick3 pick2 - pset
		pick3 over + pick3 pick3 + pset
		pick3 over - pick3 pick3 + pset
		pick3 over + pick3 pick3 - pset
		pick3 over - pick3 pick3 - pset
		xm 
		0 <=? (
			swap 1 + swap
			dy +
			2 'dy +!
			) 
		0 >? (
			rot 1 - rot rot
			2 'dx +!
			dx ym - +
			) 
		'xm !
		) 4drop ;
	
