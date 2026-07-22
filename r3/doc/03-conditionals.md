# Conditionals

R3Forth doesn't have an `if` keyword. Instead, a block in parentheses
`( ... )` runs conditionally when preceded by a word ending in `?`.

## Watch the semantics

Single-operand conditions **don't always mean what the name suggests
at first glance**. These are verified against the real virtual
machine, not guessed:

| Word    | The block runs when...             | Consumes the value? |
|---------|--------------------------------------|------------------------|
| `0?`    | TOS **is** 0                         | No, stays on the stack |
| `1?`    | TOS **is different** from 0          | No, stays on the stack |
| `+?`    | TOS is positive or zero (`>=0`)      | No, stays on the stack |
| `-?`    | TOS is negative (`<0`)               | No, stays on the stack |

Binary conditionals do consume both operands and leave one:

| Word      | The block runs when... |
|-----------|---------------------------|
| `a b <?`  | a < b  |
| `a b >?`  | a > b  |
| `a b =?`  | a = b  |
| `a b >=?` | a >= b |
| `a b <=?` | a <= b |
| `a b <>?` | a != b |

## Example

```
:classify | n --
	0? ( drop "zero" print cr ; )
	-? ( drop "negative" print cr ; )
	drop "positive" print cr
	;
```

`;` inside a block does an early *return* from the word that
contains it — that's the usual way to simulate an early "else".

## There's no "else"

There's no word for the opposite case. Typical patterns are:

1. **Early return**: as in the example above, each case ends with
   `;` if it applies, and the flow continues to the next `?`-word.
2. **Repeated inverse condition**: writing the opposite condition
   as a second block, when both cases are short.

See **examples/03-conditionals.r3** for a compiled and tested
example.
