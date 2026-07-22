| 01 - HELLO WORLD
| Reverse Polish Notation (RPN): operands come before the operator.
| 3 4 + means "3, 4, add" -> leaves 7 on the stack.

^lib/str.r3
^lib/print.r3
^lib/gr.r3

:main
	cls home

	"Hello R3Forth" print cr
	cr

	3 4 + .d print cr		| 7
	10 3 - .d print cr		| 7
	6 7 * .d print cr		| 42
	20 3 / .d print cr		| 6

	;

:
$ffffff 'ink !
'main onshow
;
