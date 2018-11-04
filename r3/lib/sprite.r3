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
