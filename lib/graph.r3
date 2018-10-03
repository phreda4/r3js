##ink $ff0000

::vframe 0 sysmem ;
::sw 1 sysmem ; 
::sh 2 sysmem ;

::xy>v | x y -- adr
	sw * + 2 << vframe + ;
	