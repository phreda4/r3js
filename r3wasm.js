'use strict';

function genInst(inst, depth) {
  return '  '.repeat(depth * 2) + inst + '\n';
}

function genCode(code, depth) {
  let result = '';
  for (const i of code) {
    if (Array.isArray(i)) {
      result += genInst(`    (block ;; [`, depth);
      result += genInst(`      (loop`, depth);
      result += genInst(
        `        (br_if 1 (i32.eqz (i32.load8_s (get_local $ptr))))`,
        depth
      );
      result += genCode(i, depth + 1);
      result += genInst(`        (br 0)`, depth);
      result += genInst('      )', depth);
      result += genInst('    ) ;; ]', depth);
    } else if (i === '>') {
      result += genInst(
        '    (set_local $ptr (i32.add (get_local $ptr) (i32.const 1))) ;; >',
        depth
      );
    } else if (i === '<') {
      result += genInst(
        '    (set_local $ptr (i32.sub (get_local $ptr) (i32.const 1))) ;; <',
        depth
      );
    } else if (i === '+') {
      result += genInst(
        '    (i32.store8 (get_local $ptr) (i32.add (i32.load8_s (get_local $ptr)) (i32.const 1))) ;; +',
        depth
      );
    } else if (i === '-') {
      result += genInst(
        '    (i32.store8 (get_local $ptr) (i32.sub (i32.load8_s (get_local $ptr)) (i32.const 1))) ;; -',
        depth
      );
    } else if (i === '.') {
      result += genInst(
        '    (i32.load8_s (get_local $ptr)) (call $putchar) ;; .',
        depth
      );
    } else if (i === ',') {
      result += genInst(
        '    (i32.store8 (get_local $ptr) (call $getchar)) ;; ,',
        depth
      );
    }
  }
  return result;
}

function compile(bfCode, opts) {
  const prologue = `(module
  (func $getchar (import "imports" "getchar") (result i32))
  (func $putchar (import "imports" "putchar") (param i32))
  (memory $0 (export "memory") 1 1)

  (func (export "main") (local $ptr i32)
`;
  const epilogue = `  )
)
`;

  const wast = `${prologue}${genCode(bfCode, 0)}${epilogue}`;
  if (opts.verbose || process.env.NODE_ENV === 'debug') {
    console.log(wast);
  }
  return wast;
}

let buf = '';
function getchar() {
  if (buf === '') {
    buf = buf + readlineSync.question() + '\n';
  }
  const result = buf.charCodeAt(0);
  buf = buf.substring(1);
  return result;
}

async function run(uint8array, opts) {
  const wasm = await WebAssembly.instantiate(uint8array, {
    imports: {
      getchar,
      putchar,
    },
  });

  const result = wasm.instance.exports.main();
  if (opts.verbose || process.env.NODE_ENV === 'debug') {
    const memory = new Uint8Array(wasm.instance.exports.memory.buffer);
    console.log(memory);
  }
  return result;
}

// compile from string
async function compileAndRunString(bfSource, opts) {
  const bfAst = bfParser.parse(bfSource, opts);
  const wast = bfCompiler.compile(bfAst, opts);
  const wasm = await wast2wasm.convert(wast, opts);
  return await wasmRuner.run(wasm, opts);
}
