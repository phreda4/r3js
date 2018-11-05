| sprite
| PHREDA 2015,2018
|------------------------
| pal-type-w-h
| 4-4-12-12

^r4/lib/gr.txt

#pal0 
$000000ff $808080ff $C0C0C0ff $FFFFFFff $800000ff $FF0000ff $808000ff $FFFF00ff 
$008000ff $00FF00ff $008080ff $00FFFFff $000080ff $0000FFff $800080ff $FF00FFff

#wb #hb		| ancho alto
#paleta 'pal0

|-- internas para clip
#addm 
#wi #hi

|-- internas para scale
#wr #hr
#sx #sy
#xa #ya

|----- 1:1

:clipw
	sw >? ( sw pick2 - ; ) wb ;
	
:negw
	-? ( dup 'wi +! neg 'addm ! 0 ; ) 0 'addm ! ;

:cliph
	sh >? ( sh pick2 - ; ) hb ;
	
:clip | x y	-- x y 
	swap wb over + clipw 'wi ! drop
	negw
	swap hb over + cliph 'hi ! drop
	-? ( dup 'hi +! neg wb * 'addm +! 0 )
	;
	
|---- opaque
:d0 | adr -- ;32 bit/pixel
	addm 2 << + >b
	wb wi - 2 <<
   	sw wi - 2 <<
	hi ( 1? )(
		wi ( 1? )( b@+ a!+ 1- ) drop
		over a+
		pick2 b+
		1- ) 3drop ;
:d1 | adr -- ;8		
:d2 | adr -- ;4
:d3 | adr -- ;2
:d4 | adr -- ;1
	;
	
#odraw d0 d1 d2 d3 d4 0 0 0

::sprite | x y 'spr  --
	0? ( 3drop ; )
	@+ dup
	dup $fff and 'wb ! 
	12 >> $fff and 'hb !
	2swap clip | adr h x y
	wi hi or -? ( drop 4drop ; ) drop
	xy>v >a
	dup 28 >> 1? ( rot @+ 'paleta ! rot rot ) drop
	24 >> $f and 2 << 'odraw + @ exec ;

|----- DRAW ROT 1:1
:inirot | x y r -- x y
	sincos 'xa ! 'ya !	| calc w&h
	xa wb * ya hb * neg 2dup +
	-? ( 0 swap )( 0 )
	rot -? ( min )( rot max swap )
	rot -? ( min )( rot max swap )
	- 16 >> 'wi !
	ya wb * xa hb * 2dup +
	-? ( 0 swap )( 0 )
	rot -? ( min )( rot max swap )
	rot -? ( min )( rot max swap )
	- 16 >> 'hi !		| calc ori
	wb 15 << wi xa * hi ya * - 2/ - 'sx !
	hb 15 << hi xa * wi ya * + 2/ - 'sy !
	swap wi wb - 2/ -	| adjust & clip
	wi over + sw >? ( sw over - 'wi +! ) drop
	-? ( dup 'wi +! neg dup xa * 'sx +! ya * 'sy +! 0 )
	swap hi hb - 2/ -
	hi over + sh >? ( sh over - 'hi +! ) drop
	-? ( dup 'hi +! dup ya * 'sx +! neg xa * 'sy +! 0 )
	;

:dotrot | xa ya w -- n
	over -? ( ; )
	16 >> hb >=? ( drop -1 ; )
	wb *
	pick3 -? ( nip ; )
	16 >> wb >=? ( 2drop -1 ; )
	+ ;

:r0
	>r inirot
	wi hi or -? ( 3drop r> drop ; ) drop
	setxy
	sx sy
	hi ( 1? )(
		pick2 pick2
		wi ( 1? )(
			dotrot
			-? ( drop 4 a+ )( 2 << r@ + @ a!+ )
			rot xa + rot ya +
			rot 1- ) 3drop
		sw wi - 2 << a+
		rot ya - rot xa +
		rot 1- )
	3drop r> drop ;

:r1 | x y r adr --
	>r inirot
	wi hi or -? ( 3drop r> drop ; ) drop
	setxy
	sx sy
	hi ( 1? )(
		pick2 pick2
		wi ( 1? )(
			dotrot
			-? ( drop 4 a+ )( 2 << r@ + @ acpx!+ )
			rot xa + rot ya +
			rot 1- ) 3drop
		sw wi - 2 << a+
		rot ya - rot xa +
		rot 1- )
	3drop r> drop ;

#rdraw r0 r1 0 0 0 0 0 0 

::rsprite | x y r 'bmr --
	0? ( 3drop ; )
	@+ dup
	dup $fff and 'wb ! 
	12 >> $fff and 'hb !
	2swap clip | adr h x y
	wi hi or -? ( drop 4drop ; ) drop
	xy>v >a
	dup 28 >> 1? ( rot @+ 'paleta ! rot rot ) drop
	24 >> $7 and 2 << 'rdraw + @ exec ;
