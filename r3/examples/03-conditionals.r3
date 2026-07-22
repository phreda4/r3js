| 03 - CONDITIONALS
| R3Forth has no "if/else": conditionals are postfix.
| n 0? ( ... ) runs the block ONLY WHEN n is ZERO (careful, this is
| the opposite of what the name suggests). n stays on the stack.
| n +? ( ... ) runs the block when n is >= 0 (positive or zero).
| n -? ( ... ) runs the block when n is <  0 (negative).
| There's no native "else" - it's solved with the inverse condition after.

^lib/str.r3
^lib/print.r3
^lib/gr.r3

:classify | n --
	0? ( drop "zero" print cr ; )
	-? ( drop "negative" print cr ; )
	drop "positive" print cr
	;

:main
	cls home

	5 classify
	-3 classify
	0 classify
	cr

	"Binary comparisons (a b <? consumes the top):" print cr
	3 5 <? ( "3 < 5, yes" print cr ) drop
	5 
	3 >? ( "5 > 3, yes" print cr ) 
	5 =? ( "5 = 5, yes" print cr ) 
	drop
	;

:
$ffcc00 'ink !
'main onshow
;
