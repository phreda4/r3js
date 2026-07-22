| 04 - LOOPS
| there's no "for"/"while" keyword: a block ( ... ) that contains
| an unresolved ?-word automatically becomes a while. As long as
| the condition is true, the compiler jumps back to the start of
| the block; if false, it jumps to the end.
|
| careful with 1? semantics: it runs the block if TOS is DIFFERENT
| from 0. So "N ( ... 1 - 1? )" does N passes, decrementing to 0.
|
| "unary" ?-words (0? 1? +? -?) do NOT consume the value they test:
| it stays on the stack. "Binary" ones (<? >? =? <>? etc) consume
| BOTH operands and leave one. That's why it's usually better to use
| global variables for loop counters instead of juggling the stack.

^lib/str.r3
^lib/print.r3
^lib/gr.r3

#total

:sumupto | n -- sum
	0 'total !
	( dup total + 'total ! 1 - 1? )
	drop total
	;

#n

:table | -- ; prints the 7 times table, from 1 to 10
	1 'n !
	( n .d print " x 7 = " print
	  n 7 * .d print cr
	  n 1 + dup 'n ! 11 <>? drop ) drop
	;

:main
	cls home

	"Sum 1..5 = " print
	5 sumupto .d print cr
	cr

	"7 times table:" print cr
	table
	;

:
$88ccff 'ink !
'main onshow
;
