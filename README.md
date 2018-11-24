# r3

Programing language based in ColorForth and :r4

Actual Version work in a .html in javascript, without server, but the main image is empty.

try in:

* https://rawgit.com/r3www/r3/master/index.html

## RoadMap

* jit wasm compiler.
* connect net,sound,gl,cam,mic.
* deploy in many types.
* IDE for phones

## Start Documentation

The actual system is a compiler to tokencodes and a engine to run this codes.

### r3 has some diferences with :r4

Not use the word ")(", only two constructor for modify flow execution:

* conditional in the block of words ( .. ?? .. ) is a WHILE

* conditional in the front of block of words  ?? ( .. ) is a IF

Like ColorForth, not have ELSE!!, but this can be done with code factorization, a good thing!!

* remove 16bits access words, and add 64bits, but javascript not have access to 64bits mem, WASM yes, but the interpreter..

* redoing all the SO access trow only SYSCALL and SYSMEM, think in many plataform.

* redoing interaction work, all animation are with vectors words now.

### Actual problems

* No have return multiple values, wait for this and need simulate the data stack.

* No hace access to return stack, I guess limitate the RSTACK to be balanced and use auxiliary registers.

* WASM not have GOTO or JMP, some dificult from compiler.

* for now are slow.








