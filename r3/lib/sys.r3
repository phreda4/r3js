| SYS IO
| PHREDA 2018

::vframe 0 sysmem ;
::sw 1 sysmem ; 
::sh 2 sysmem ;
::msec 3 sysmem ;
::time 4 sysmem ;
::date 5 sysmem ;
::keycode 6 sysmem ;
::keychar 7 sysmem ;
::xymouse 8 sysmem dup $ffff and swap 16 >> ;
::bmouse 9 sysmem ;
::mem 10 sysmem ;

::echo 0 syscall ;
::ondom 1 syscall ;
::onshow 2 syscall ;
