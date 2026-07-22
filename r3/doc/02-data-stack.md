# The Data Stack

Everything in R3Forth flows through the *data stack*. There are no
implicit local variables or named parameters: values travel stacked.

You can watch the stack live in the panel below the editor while a
program runs.

## Basic manipulation words

| Word    | Effect                        | Example                |
|---------|--------------------------------|--------------------------|
| `DUP`   | duplicates the top             | `5 dup` -> `5 5`         |
| `DROP`  | discards the top                | `5 3 drop` -> `5`        |
| `SWAP`  | swaps the top 2                 | `1 2 swap` -> `2 1`      |
| `OVER`  | copies the second item on top   | `1 2 over` -> `1 2 1`    |
| `NIP`   | discards the second item        | `1 2 nip` -> `2`         |
| `ROT`   | `a b c -- b c a`                | `1 2 3 rot` -> `2 3 1`   |
| `-ROT`  | `a b c -- c a b`                | `1 2 3 -rot` -> `3 1 2`  |

## Duplicating pairs

`2DUP`, `2DROP`, `2SWAP`, `2OVER` work like their single-value
counterparts but on pairs of values (handy for `x y` coordinates).

## PICK2 / PICK3 / PICK4

Copy the value that sits *N positions* below the top, counting from
before the operation runs. Don't confuse it with "the second item":
`1 2 3 pick2` results in `1 2 3 1` (it copies the deepest of the
three, not the middle one). Worth trying in a scratch definition
before relying on it in real code.

## Registers A and B

Besides the data stack, there are two general-purpose registers (`A`
and `B`) commonly used to walk through memory without touching the
data stack:

```
100 >a          | store 100 in A
a@              | read 32 bits from the address in A
a@+             | read and auto-advance A
```

`AB[` and `]BA` save and restore A and B on the return stack —
useful for nesting traversals without clobbering the caller's
register values.

## Return stack

`>R`, `R>`, `R@` move values to and from the *return stack* (the
same one the compiler uses for function calls). It's handy for
"parking" a value while you do another operation that needs the top
free, but it always has to be balanced: anything pushed with `>R`
has to come back out with `R>` before the current word ends (`;`),
or you'll corrupt the return flow.

See **examples/02-stack.r3** for an interactive walkthrough.
