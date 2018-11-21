| 3dmath - PHREDA 
|-------------------------

^lib/math.r3

##xf ##yf
##ox ##oy

#mati | matrix id
1.0 0 0 0		| 1.0 = $10000
0 1.0 0 0
0 0 1.0 0
0 0 0 1.0
#mats * 1280 | 20 matrices
#mat> 'mats

::matini
	'mats dup 'mat> ! 'mati 16 move ;

::mpush | --
	mat> dup 64 + dup 'mat> ! swap 16 move ;

::mpop | --
	mat> |'mats =? ( drop ; )
	64 - 'mat> ! ;

::nmpop | n --
	6 << mat> swap - |'mats <? ( 'mats nip )
	'mat> ! ;

|-----------------------------
::mtrans | x y z --
	mat> >a
	pick2 a> 48 + @ *. a@ + a!+
	pick2 a> 48 + @ *. a@ + a!+
	pick2 a> 48 + @ *. a@ + a!+
	rot a@ + a!+
	over a> 32 + @ *. a@ + a!+
	over a> 32 + @ *. a@ + a!+
	over a> 32 + @ *. a@ + a!+
	swap a@ + a!+
	dup a> 16 + @ *. a@ + a!+
	dup a> 16 + @ *. a@ + a!+
	dup a> 16 + @ *. a@ + a!+
	a> +! ;

::mtransi | x y z -- ;pre
	mat> >a
	pick2 a@+ *. pick2 a@+ *. + over a@+ *. + a@ + a!+
	pick2 a@+ *. pick2 a@+ *. + over a@+ *. + a@ + a!+
	rot a@+ *. rot a@+ *. + swap a@+ *. + a@ + a! ;

|-----------------------------
::mscale | x y z -- ; post
	mat> >a
	pick2 a@ *. a!+ pick2 a@ *. a!+ pick2 a@ *. a!+ rot a@ *. a!+
	over a@ *. a!+ over a@ *. a!+ over a@ *. a!+ swap a@ *. a!+
	dup a@ *. a!+ dup a@ *. a!+ dup a@ *. a!+ a@ *. a! ;

::mscalei | x y z
	mat> >a
	pick2 a@ *. a!+ over a@ *. a!+ dup a@ *. a!+ 4 a+
	pick2 a@ *. a!+ over a@ *. a!+ dup a@ *. a!+ 4 a+
	rot a@ *. a!+ swap a@ *. a!+ a@ *. a! ;

|-----------------------------
::mrotx | x -- ; posmultiplica
	0? ( drop ; )
	mat> 16 + >a
	dup sin swap cos
	a@ a> 16 + @ | s c e i
	pick2 pick2 *. pick4 pick2 *. + a!+
	pick2 *. >r pick2 neg *. r> + a> 12 + !
	a@ a> 16 + @ | s c f j
	pick2 pick2 *. pick4 pick2 *. + a!+
	pick2 *. >r pick2 neg *. r> + a> 12 + !
	a@ a> 16 + @ | s c g k
	pick2 pick2 *. pick4 pick2 *. + a!+
	pick2 *. >r pick2 neg *. r> + a> 12 + !
	a@ a> 16 + @ | s c h l
	pick2 pick2 *. pick4 pick2 *. + a!+
	rot *. >r *. r> + a> 12 + ! ;

::mrotxi |x -- ; premultiplica
	0? ( drop ; )
	mat> 4+ >a
	dup sin swap cos
	a@ a> 4+ @ | s c b c
	pick2 pick2 *. pick4 neg pick2 *. + a!+ | s c b c
	pick2 *. >r pick2 *. r> + a!+ 8 a+
	a@ a> 4+ @ | s c f g
	pick2 pick2 *. pick4 neg pick2 *. + a!+
	pick2 *. >r pick2 *. r> + a!+ 8 a+
	a@ a> 4+ @ | s c j k
	pick2 pick2 *. pick4 neg pick2 *. + a!+
	pick2 *. >r pick2 *. r> + a!+ 8 a+
	a@ a> 4+ @ | s c m o
	pick2 pick2 *. pick4 neg pick2 *. + a!+
	rot *. >r *. r> + a! ;

|-----------------------------
::mroty | y  --
	0? ( drop ; )
	mat> >a
	dup sin swap cos
	a@ a> 32 + @ pick2 pick2 *. pick4 pick2 *. + a!+
	pick2 *. >r pick2 neg *. r> + a> 28 + !
	a@ a> 32 + @ pick2 pick2 *. pick4 pick2 *. + a!+
	pick2 *. >r pick2 neg *. r> + a> 28 + !
	a@ a> 32 + @ pick2 pick2 *. pick4 pick2 *. + a!+
	pick2 *. >r pick2 neg *. r> + a> 28 + !
	a@ a> 32 + @ pick2 pick2 *. pick4 pick2 *. + a!+
	rot *. >r swap neg *. r> + a> 28 + ! ;

::mrotyi | y --
	0? ( drop ; )
	mat> >a
	dup sin swap cos
	a@ a> 8 + @ | s c a c
	pick2 pick2 *. pick4 pick2 *. + a!+
	pick2 *. >r pick2 neg *. r> + a> 4+ ! 12 a+
	a@ a> 8 + @ | s c a c
	pick2 pick2 *. pick4 pick2 *. + a!+
	pick2 *. >r pick2 neg *. r> + a> 4+ ! 12 a+
	a@ a> 8 + @ | s c a c
	pick2 pick2 *. pick4 pick2 *. + a!+
	pick2 *. >r pick2 neg *. r> + a> 4+ ! 12 a+
	a@ a> 8 + @ | s c a c
	pick2 pick2 *. pick4 pick2 *. + a!+
	rot *. >r swap neg *. r> + a> 4+ ! ;

|-----------------------------
::mrotz | z --
	0? ( drop ; )
	mat> >a
	dup sin swap cos
	a@ a> 16 + @ | s c e i
	pick2 pick2 *. pick4 pick2 *. + a!+
	pick2 *. >r pick2 neg *. r> + a> 12 + !
	a@ a> 16 + @ | s c e i
	pick2 pick2 *. pick4 pick2 *. + a!+
	pick2 *. >r pick2 neg *. r> + a> 12 + !
	a@ a> 16 + @ | s c e i
	pick2 pick2 *. pick4 pick2 *. + a!+
	pick2 *. >r pick2 neg *. r> + a> 12 + !
	a@ a> 16 + @ | s c e i
	pick2 pick2 *. pick4 pick2 *. + a!+
	rot *. >r *. r> + a> 12 + ! ;

::mrotzi | z --
	0? ( drop ; )
	mat> >a
	dup sin swap cos
	a@ a> 4+ @ | s c a b
	pick2 pick2 *. pick4 neg pick2 *. + a!+
	pick2 *. >r pick2 *. r> + a!+ 8 a+
	a@ a> 4+ @ | s c a b
	pick2 pick2 *. pick4 neg pick2 *. + a!+
	pick2 *. >r pick2 *. r> + a!+ 8 a+
	a@ a> 4+ @ | s c a b
	pick2 pick2 *. pick4 neg pick2 *. + a!+
	pick2 *. >r pick2 *. r> + a!+ 8 a+
	a@ a> 4+ @ | s c a b
	pick2 pick2 *. pick4 neg pick2 *. + a!+
	rot *. >r *. r> + a! ;


|-----------------------------
:invierte
	over @ over @ swap rot ! swap ! ;

::matinv
	mat> >a
	a> 12 + @  neg a> 28 + @  neg a> 44 + @ neg | tx ty tz
	a> 4+ dup 12 + invierte a> 8 + dup 24 + invierte a> 24 + dup 12 + invierte
	pick2 a@  *. pick2 a> 4+ @ *. + over a> 8 + @  *. + a> 12 + !
	pick2 a> 16 + @  *. pick2 a> 20 + @  *. + over a> 24 + @  *. + a> 28 + !
	rot a> 32 + @  *. rot a> 36 + @  *. + swap a> 40 + @  *. + a> 44 + !
	;

::transform | x y z -- x y z
	mat> >a pick2 a@+ *. pick2 a@+ *. + over a@+ *. + a@+ +
	>r pick2 a@+ *. pick2 a@+ *. + over a@+ *. + a@+ +
	>r rot a@+ *. rot a@+ *. + swap a@+ *. + a@ +
	r> r> swap rot ;

::transformr | x y z -- x y z
	mat> >a pick2 a@+ *. pick2 a@+ *. + over a@+ *. + 4 a+
	>r pick2 a@+ *. pick2 a@+ *. + over a@+ *. + 4 a+
	>r rot a@+ *. rot a@+ *. + swap a@ *. +
	r> r> swap rot ;

::ztransform | x y z -- z
	mat> 32 + >a
	rot a@+ *. rot a@+ *. + swap a@+ *. + a@ + ;

::oztransform | -- z
	mat> 44 + @ ;

::oxyztransform | -- x y z
	mat> dup 12 + @ over 28 + @ rot 44 + @ ;

|-----------------------------
::2dmode | --
	sw 1 >> 'ox !
	sh 1 >> 'oy !
	;

::3dmode | fov --
	sh *. dup 'yf ! 'xf !
	sw 1 >> 'ox !
	sh 1 >> 'oy !
	matini
	;

|----------------------------
::Omode | --
	sw dup 1 >> 'ox !
	sh dup 1 >> 'oy !
	min dup 'xf ! 'yf !
	matini
	;

|----------------------------
::o3dmode | w h --
	dup 1 >> 'oy !
	over 1 >> 'ox !
	min dup 'xf ! 'yf !
	matini ;

::p3d | x y z -- x y
	dup >r
	yf swap */ oy + swap
	xf r> */ ox + swap ;

::p3dz | x y z -- x y z
	rot xf pick2 */ ox + | y z x'
	rot yf pick3 */ oy +
	rot ;

::p3di | x y z -- z y x
	swap yf pick2 */ oy +	| x z y'
	rot xf pick3 */ ox + ;	| z y' x'

::p3ditest | x y z -- z y x
	xf over 20 <</ >r | 20 bits
	swap r@ 20 *>> oy +
	rot r> 20 *>> ox + ;

::p3dizb | x y z -- z y x
	swap over 20 *>> oy +
	rot pick2 20 *>> ox + ;

::p3dcz | z -- 1/z
	0? ( 1 nip )
	xf swap 20 <</ ;

|----------------------------

::p3d1 | x y z -- x y
	dup >r
	9 <</ oy + swap
	r> 9 <</ ox + swap ;

::p3di1 | x y z -- z y x
	swap over 9 <</ oy +	| x z y'
	rot pick2 9 <</ ox + ;	| z y' x'

::project3d | x y z -- u v
	transform
	0? ( 3drop ox oy ; )
	>r
	yf r@ */ oy + swap
	xf r> */ ox + swap ;

::project3dz | x y z -- z x y
	transform
	0? ( 3drop ox oy 1 ; )
	rot xf pick2 */ ox + | y z X
	rot yf pick3 */ oy + ;

::invproject3d | x y z -- x y
	>r
	oy - r@ yf */ swap
	ox - r> xf */ swap ;

::projectdim | x y z -- u v
	transform
	0? ( 3drop 0 0 ; )
	>r
	yf r@ */ swap
	xf r> */ swap ;

::project | x y z -- u v
	0? ( 3drop ox oy ; )
	rot xf pick2 */ ox +
	rot rot yf swap */ oy +
	;

::projectv | x y z -- u v
	rot xf pick2 */ ox +
	rot rot yf swap */ oy +
	;

::inscreen | -- x y
	oxyztransform
	0? ( 3drop ox oy ; )
	>r
	yf r@ */ oy + swap
	xf r> */ ox + swap ;

::proyect2d | x y z -- x y
	drop oy + swap ox + swap ;

::aspect | --
	sw 16 << sh / ;

|------------- divisionless
::3dini
	1024 sw - 1 >> neg 'ox !
	1024 sh - 1 >> neg 'oy !
	matini ;

:c10 | x z -- x'
	1 >> 0 swap over | x 0 z 0
	pick3 >? ( over - rot )( over + rot 512 + ) rot 1 >> rot
	pick3 >? ( over - rot )( over + rot 256 + ) rot 1 >> rot
	pick3 >? ( over - rot )( over + rot 128 + ) rot 1 >> rot
	pick3 >? ( over - rot )( over + rot 64 + ) rot 1 >> rot
	pick3 >? ( over - rot )( over + rot 32 + ) rot 1 >> rot
	pick3 >? ( over - rot )( over + rot 16 + ) rot 1 >> rot
	pick3 >? ( over - rot )( over + rot 8 + ) rot 1 >> rot
	pick3 >? ( over - rot )( over + rot 4+ ) rot 1 >> rot
	pick3 >? ( over - rot )( over + rot 2 + ) rot 1 >> rot
	pick3 >? ( 2drop )( 2drop 1 + )
	nip ;

::3dproject | x y z -- x y
	rot over c10 ox + rot rot c10 oy + ;

::3dproj | x y z -- x y
	rot over c10 rot rot c10 ;

|------- vectores
::normInt2Fix | x y z -- xf yf zf
	pick2 dup * pick2 dup * + over dup * + sqrt
	1? ( 1.0 swap /. ) >r rot r@ *. rot r@ *. rot r> *. ;

::normFix | x y z -- x y z
	pick2 dup *. pick2 dup *. + over dup *. + sqrt.
	1? ( 1.0 swap /. ) >r rot r@ *. rot r@ *. rot r> *. ;

|-------- vectores en memoria
::v3len | v1 -- l
	@+ dup *. swap @+ dup *. swap @ dup *. + + sqrt. ;

::v3nor | v1 --
	dup v3len 1? ( 1.0 swap /. ) swap >a
	a@ over *. a!+ a@ over *. a!+ a@ *. a! ;

::v3ddot | v1 v2 -- r ; r=v1.v2
	>a @+ a@+ *. swap @+ a@+ *. swap @ a@ *. + +  ;

::v3vec | v1 v2 -- ; v1=v1 x v2
	>a dup @ a> 4+ @ *. over 4+ @ a@ *. -
	over 8 + @ a@ *. pick2 @ a> 8 + @ *. -
	pick2 4+ @ a> 8 + @ *. pick3 8 + @ a> 4+ @ *. -
	>r rot r> swap !+ !+ ! ;

::v3- | v1 v2 -- ; v1=v1-v2
	>a dup @ a@+ - swap !+ dup @ a@+ - swap !+ dup @ a@ - swap ! ;

::v3+ | v1 v2 -- ; v1=v1+v2
	>a dup @ a@+ + swap !+ dup @ a@+ + swap !+ dup @ a@ + swap ! ;

::v3* | v1 s -- ; v1=v1*s
	swap >a a@ over *. a!+ a@ over *. a!+ a@ *. a! ;

::v3= | v1 v2 --
	3 move ;

|-------------- rota directo -----------------------------
#cox #coy #coz
#six #siy #siz

::calcrot | rx ry rz --
	sincos 'coz ! 'siz !
	sincos 'coy ! 'siy !
	sincos 'cox ! 'six !
	;

::makerot | x y z -- x' y' z'
	rot rot | z x y
	over cox *. over six *. +	| z x y x'
	rot six *. rot cox *. - 	| z x' y'
	swap rot 					| y' x' z
	over coy *. over siy *. +	| y' x' z x''
	rot siy *. rot coy *. -		| y' x'' z'
	rot							| x'' y' z'
	over coz *. over siz *. +	|  x'' y' z' y''
	rot siz *. rot coz *. -		| x'' y'' z''
	;

#m11 #m12 #m13
#m21 #m22 #m23
#m31 #m32 #m33

::calcvrot | rx ry rz --
	sincos 'coz ! 'siz !
	sincos 'coy ! 'siy !
	sincos 'cox ! 'six !
    coz coy *. 'm11 !
    cox siz *. coy *. six siy *. + 'm12 !
    six siz *. coy *. cox siy *. - 'm13 !
	siz neg 'm21 !
    cox coz *. 'm22 !
    six coz *. 'm23 !
    coz siy *. 'm31 !
    cox siz *. siy *. six coy *. - 'm32 !
    six siz *. siy *. cox coy *. + 'm33 !
	;

::mrotxyz | x y z --
 	calcvrot
	mat> >a
	a@+ a@+ a@+ -12 a+
	pick2 m11 *. pick2 m21 *. + over m31 *. + a!+
	pick2 m12 *. pick2 m22 *. + over m32 *. + a!+
	rot m13 *. rot m23 *. + swap m33 *. + a!+ 4 a+
	a@+ a@+ a@+ -12 a+
	pick2 m11 *. pick2 m21 *. + over m31 *. + a!+
	pick2 m12 *. pick2 m22 *. + over m32 *. + a!+
	rot m13 *. rot m23 *. + swap m33 *. + a!+ 4 a+
	a@+ a@+ a@+ -12 a+
	pick2 m11 *. pick2 m21 *. + over m31 *. + a!+
	pick2 m12 *. pick2 m22 *. + over m32 *. + a!+
	rot m13 *. rot m23 *. + swap m33 *. + a! 4 a+
	a@+ a@+ a@+ -12 a+
	pick2 m11 *. pick2 m21 *. + over m31 *. + a!+
	pick2 m12 *. pick2 m22 *. + over m32 *. + a!+
	rot m13 *. rot m23 *. + swap m33 *. + a! 4 a+
	;

::mrotxyzi | x y z --
 	calcrot
	mat> >a
	a@ a> 16 + @ a> 32 + @
	pick2 m11 *. pick2 m12 *. + over m13 *. + a! 16 a+
	pick2 m21 *. pick2 m22 *. + over m23 *. + a! 16 a+
	rot m31 *. rot m32 *. + swap m33 *. + a! -28 a+
	a@ a> 16 + @ a> 32 + @
	pick2 m11 *. pick2 m12 *. + over m13 *. + a! 16 a+
	pick2 m21 *. pick2 m22 *. + over m23 *. + a! 16 a+
	rot m31 *. rot m32 *. + swap m33 *. + a! -28 a+
   	a@ a> 16 + @ a> 32 + @
	pick2 m11 *. pick2 m12 *. + over m13 *. + a! 16 a+
	pick2 m21 *. pick2 m22 *. + over m23 *. + a! 16 a+
	rot m31 *. rot m32 *. + swap m33 *. + a! -28 a+
   	a@ a> 16 + @ a> 32 + @
	pick2 m11 *. pick2 m12 *. + over m13 *. + a! 16 a+
	pick2 m21 *. pick2 m22 *. + over m23 *. + a! 16 a+
	rot m31 *. rot m32 *. + swap m33 *. + a!
	;


#oh #ow
::3dnorm | w h xc yc --
	rot 'oh !
	rot 'ow !
	'oy !
	'ox !
	;

::3dpp | x y z -- x y
	rot over / ox + >r / oy + r> ;

