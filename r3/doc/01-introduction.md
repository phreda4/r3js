# Introduction to R3Forth

R3Forth is a Forth dialect: a **concatenative**, stack-based language,
with no infix operators or function parentheses.

## Reverse Polish Notation (RPN)

Instead of `3 + 4`, you write:

```
3 4 +
```

Each word takes its arguments from the *data stack* and leaves its
result right there. Chaining words is chaining operations:

```
3 4 + 5 *      | (3+4)*5 = 35
```

## Building blocks of the language

A `.r3` program is made of:

- **Includes**: `^lib/gr.r3` brings in the definitions from another file.
- **Comments**: a line starting with `|`.
- **Variables**: `#name` (32 bits) or `#name value` (with an initial value).
- **Definitions**: `:name ... ;` (private) or `::name ... ;` (public,
  visible from other files that include this one).
- **Boot block**: a standalone `: ... ;` at the end of the file,
  which runs when the image loads.

```
^lib/gr.r3

#counter 0

::double | n -- n*2
	2 *
	;

:main
	cls
	5 double .d print
	;

:
'main onshow
;
```

## Stack comments

The `| a b -- c` convention documents what a word expects on the
stack (left of `--`) and what it leaves (right of `--`). It's not
code, just documentation for the reader.

## Next steps

- **02 - Data Stack**: how to duplicate, swap and reorder values.
- **03 - Conditionals**: how "if" is solved without the word "if".
- **04 - Loops**: the implicit while mechanism.
- **05 - Graphics**: drawing with `lib/gr.r3`.

All examples live in this image's `examples/` folder — open them
from the **Files** tab.
