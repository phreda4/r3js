^lib/sys.r3
^lib/fontj.r3
|---------------
| PRINT LIB
| PHREDA 2018
|---------------

##ccx 0 ##ccy 0
##cch 8 ##ccw 8

#_charemit 'char8j
#_charsize 'size8j

::font! | 'vemit 'vsize --
  '_charsize ! '_charemit ! ;

::emit | c --
  $ff and _charemit ex
  _charsize ex 'ccx +! ;

::home
  0 'ccx ! 0 'ccy ! ;

::print | "" --
  ccx ccy xy>v >a
  ( c@+ 1?
    emit ) 2drop ;

::cr
  cch 'ccy ! 0 'ccx ! ;