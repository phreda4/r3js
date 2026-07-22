# Graphics

`lib/gr.r3` provides a minimal set of 2D primitives over the video
framebuffer. Everything draws in the color of the `ink` variable
($RRGGBB).

## Primitives

| Word           | Stack           | Description |
|----------------|-----------------|-------------|
| `cls`          | `--`            | clears the screen with `paper` |
| `pset`         | `x y --`        | plots a pixel |
| `pget`         | `x y -- c`      | reads a pixel's color |
| `op`           | `x y --`        | sets the origin point for `line` |
| `line`         | `x y --`        | draws a line from the origin (`op`) to `x y` |
| `rect`         | `w h x y --`    | filled rectangle |
| `circle`       | `x y r --`      | filled circle |
| `circleb`      | `x y r --`      | outlined circle |
| `ellipse`      | `x y rx ry --`  | filled ellipse |

## Minimal example

```
^lib/gr.r3

:main
	cls
	$ff4444 'ink !
	400 300 80 circle
	;

:
'main onshow
;
```

`onshow` registers the word to be called automatically every frame
(~30fps). If you only want to draw once, it still works — it just
redraws the same thing every frame.

## Combining with loops

Since `circle`/`rect`/`line` are regular words, they can be called
inside any loop (see the Loops doc) to generate patterns:

```
#i

:circles
	0 'i !
	( i 55 * 90 + 60 200 circle
	  i 1 + dup 'i ! 6 <>? drop )
	 drop
	;
```

See **examples/05-graphics.r3** for the full example, and
`lib/sprite.r3` for indexed-palette sprite drawing if you need
something beyond simple geometric shapes.
