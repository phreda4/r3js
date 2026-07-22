# Loops (implicit while)

There's no `while` or `for` keyword. The same `( ... )` block used
for conditionals automatically becomes a *loop* if the compiler
finds an unresolved `?`-word inside it: in that case, besides
jumping to the end when the condition is false, it also adds a jump
back to the start when it's true.

## The canonical pattern

```
5 ( 1? 1 - )
```

This does 5 passes: each time, `1?` keeps going while the counter is
different from 0 (see the table in the conditionals doc), and `1 -`
decrements it. Once it hits 0, `1?` stops the loop.

## Watch the stack between passes

"Unary" `?`-words (`0?`, `1?`, `+?`, `-?`) do **not consume** the
value they test. If your block keeps growing the stack unintentionally,
it's almost always because the leftover from the condition is piling
up. Rule of thumb:

- Prefer keeping the counter in a **global variable**, not on the
  stack, except in very simple single-calculation loops.
- If the block compares with a binary `?`-word (`<>?`, `<=?`, etc.)
  against a value read from a variable, add an explicit `drop`
  afterwards if the word leaves a leftover you don't need for the
  next pass.
- Before trusting a loop, test it with small values and watch the
  stack panel: if it doesn't return to a stable size after each
  pass, there's a leak.

## Example with a control variable

```
#n

:table
	1 'n !
	( n .d print " x 7 = " print
	  n 7 * .d print cr
	  n 1 + dup 'n ! 11 <>? drop ) drop
	;
```

`n` lives only in the variable — it's never needlessly duplicated on
the stack — so the stack stays clean on every pass. The final `drop`
outside the block clears the leftover that `<>?` leaves once the
loop exits.

See **examples/04-loops.r3** for the full file, compiled and
verified by stepping through the VM.
