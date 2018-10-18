| r3 lib VFRAME play
| PHREDA 2018

##ink $ff0000

::vframe 0 sysmem ;
::sw 1 sysmem ; 
::sh 2 sysmem ;

::onshow 2 syscall ;

::xy>v | x y -- adr
  sw * + 2 << vframe + ;

::cls
  0 vframe sw sh * fill ;
  
  