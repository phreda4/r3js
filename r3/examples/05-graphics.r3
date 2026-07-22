| 05 - GRAPHICS
| lib/gr.r3 gives you primitives: pset, line, rect, circle, circleb, ellipse.
| the drawing color is stored in the "ink" variable ($rrggbb).

^lib/gr.r3

#i

:circles
	0 'i !
	( i 55 * 90 + 60 200 circle
	  i 1 + dup 'i ! 6 <>? drop )
	 drop
	;

:main
	cls

	$ff4444 'ink !
	100 100 60 40 rect

	$44ff44 'ink !
	400 300 80 circle

	$4488ff 'ink !
	circles

	$ffffff 'ink !
	50 400 op
	550 480 line
	;

:
'main onshow
;
