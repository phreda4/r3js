| r3 lib string 
| PHREDA 2018

#mbuff * 48 

:sign | sign --
 -? ( drop $2d over c! ; ) drop 1 + ;
 
::.d | val -- str
 dup abs
 'mbuff 47 + 0 over c! 1 -  
 swap ( 10 /mod $30 + pick2 c! swap 1 - swap 1? ) drop
 swap sign ;