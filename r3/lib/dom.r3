| r3 lib DOM play
| PHREDA 2018

^r3/lib/str.r3

::ondom 1 syscall ;
::echo 0 syscall ;

::<br> 
 "<br>" echo ;
 
::<btn> | 'exec "label" --
 "<button onclick='r3go(" echo 
 swap .d echo 
 ");'>" echo echo 
 "</button>" echo ;


