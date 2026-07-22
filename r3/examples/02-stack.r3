| 02 - STACK MANIPULATION
| watch the "stack" panel below the editor while this runs:
| it ends up empty because each line leaves and consumes everything,
| but you can pause/edit to see intermediate states.

^lib/str.r3
^lib/print.r3
^lib/gr.r3

:demo
	"DUP: duplicates the top" print cr
	5 dup .d print " " print .d print cr cr

	"SWAP: swaps the top 2" print cr
	1 2 swap .d print " " print .d print cr cr

	"ROT: a b c -- b c a" print cr
	1 2 3 rot .d print " " print .d print " " print .d print cr cr

	"-ROT: a b c -- c a b" print cr
	1 2 3 -rot .d print " " print .d print " " print .d print cr cr

	"OVER: copies the second item above the top" print cr
	7 9 over .d print " " print .d print " " print .d print cr cr

	"PICK2/3/4: copy the item N+1 positions back" print cr
	1 2 3 pick2 .d print cr		| copies the first one (1): 1 2 3 1
	1 2 3 4 pick3 .d print cr		| copies the first one (1): 1 2 3 4 1

	;

:
$00ff88 'ink !
'demo onshow
;
