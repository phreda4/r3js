| Array 8 vals
| PHREDA 2017,2018
|------

::p.ini | cantidad list --
	here dup rot !+ ! 5 << 'here +! ;

::p.clear | list --
	dup 4+ @ swap ! ;

::p!+ | 'act list -- adr
	dup >r @ !+
	32 r> +! ;

::p! | list -- adr
	dup >r @ 
	32 r> +! ;

:delp | list end now -- list end- now-
	nip over @ swap	| recalc end!!
	swap 32 - 2dup 8 move
	dup pick3 !
	swap 32 - ;

::p.exec | list --
	dup @+ swap @
	( over <? )(
		dup @+ exec 0? ( drop delp )
		32 + ) 3drop ;

::p.nro | nro list -- adr
	4+ @ swap 5 << + ;

::p.cnt | list --
	@+ swap @ | last fist
	- 5 >> ;

::p.del | adr list --
	>a a@ 32 - 8 move a> dup @ 32 - swap ! ;

::p.mapv | 'vector list --
	@+ swap @
	( over <? )(
		pick2 exec
		32 + ) 3drop ;

::p.mapd | 'vector list --
	@+ swap @
	( over <? )(
		pick2 exec 0? ( drop dup delp )
		32 + ) 3drop ;

|........
:pmapmap | 'adr 'list 'vec --
	>r
	@+ swap @
	( over <? )(
		pick2 over <>? ( r@ exec )( drop )
		32 + )
	2drop r> drop ;

::p.map2 | 'vec 'list ---
	@+ swap @
	( over <? )(
		dup 32 + ( pick2 <? )(
			pick3 exec
			32 + ) drop
		32 + )
	3drop ;


:p.up | adr -- adr ; swap 64 -
	dup dup 32 - >a | p1 r:p2
	8 ( 1? )( 1- swap
		a@ over @ a!+ swap !+
		swap )
	2drop ;

::p.lastsort | col 'list --
	@+ swap @ swap 32 - | first last
	( over >? )(
		dup 32 -
		pick3 2 << + @
		over pick4 2 << + @
		<? ( 4drop ; ) drop
		p.up
		32 - ) 3drop ;
