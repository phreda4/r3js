'use strict';

const CELL_SIZE = 4;
const PAGE_SIZE = 65536;

const section = {
  type: 0x01,
  import: 0x02,
  func: 0x03,
  table: 0x04,
  memory: 0x05,
  global: 0x06,
  export: 0x07,
  start: 0x08,
  elem: 0x09,
  code: 0x0a,
  data: 0x0b, 
};

const type = {
  block: 0x40,
  func: 0x60,
  anyfunc: 0x70,
  i32: 0x7f,
  i64: 0x7e,
  f32: 0x7d,
  f64: 0x7c,
};

const wasm = {
  nop: 0x01,
  block: 0x02,
  loop: 0x03,
  if: 0x04,
  else: 0x05, 
  end: 0x0b,
  br: 0x0c,
  br_if: 0x0d,
  br_table: 0x0e, 
  return: 0x0f, 
  drop: 0x1a,
  select: 0x1b,
  getLocal: 0x20,
  setLocal: 0x21,
  teeLocal: 0x22,
  getLocal: 0x23,
  setLocal: 0x24,

  i32load: 0x28,
  i64load: 0x29, 
  i32load8_s:0x2c,
  i32load16_s:0x2e, 

  i64load8_s:0x30,
  i64load16_s:0x32, 
  i64load32_s:0x34, 

  i32store: 0x36,
  i64store: 0x37, 
  i32store8: 0x3a, 
  i32store16: 0x3b, 
  i64store8: 0x3c, 
  i64store16: 0x3d, 
  i64store32: 0x3e, 

  currmem:0x3f,
  growmem:0x40,

  i32const: 0x41,
  i64const: 0x42, 

  i32eqz: 0x45,
  i32eq: 0x46, 
  i32ne: 0x47, 
  i32lt_s: 0x48,
  i32lt_u: 0x49,
  i32gt_s: 0x4a,		
  i32gt_u: 0x4b,		
  i32le_s: 0x4c,		
  i32le_u: 0x4d,		
  i32ge_s: 0x4e,		
  i32ge_u: 0x4f,		
  i64eqz: 0x50,
  i64eq: 0x51,	
  i64ne: 0x52,		
  i64lt_s: 0x53,
  i64lt_u: 0x54,	
  i64gt_s: 0x55,	
  i64gt_u: 0x56,	
  i64le_s: 0x57,	
  i64le_u: 0x58,	
  i64ge_s: 0x59,	
  i64ge_u: 0x5a,	

  i32clz: 0x67,
  i32ctz: 0x68,
  i32popcnt: 0x69,
  i32add: 0x6a,
  i32sub: 0x6b,
  i32mul: 0x6c,
  i32div_s: 0x6d,
  i32div_u: 0x6e,
  i32rem_s: 0x6f,
  i32rem_u: 0x70,
  i32and: 0x71,
  i32or: 0x72,
  i32xor: 0x73,
  i32shl: 0x74,
  i32shr_s: 0x75,
  i32shr_u: 0x76,
  i32rotl: 0x77,
  i32rotr: 0x78,
  i64clz: 0x79,
  i64ctz: 0x7a,
  i64popcnt: 0x7b,
  i64add: 0x7c,
  i64sub: 0x7d,
  i64mul: 0x7e,
  i64div_s: 0x7f,
  i64div_u: 0x80,
  i64rem_s: 0x81,
  i64rem_u: 0x82,
  i64and: 0x83,
  i64or: 0x84,
  i64xor: 0x85,
  i64shl: 0x86,
  i64shr_s: 0x87,
  i64shr_u: 0x88,
  i64rotl: 0x89,
  i64rotr: 0x8a
};


const r3ToWasm = {
  0:   () => [], //nop
  1:   () => [], // :
  2:   () => [], // ::
  3:   () => [], // #
  4:   () => [], // ##
  5:   () => [], // |
  6:   () => [], // ^			0:()=>[], //  6
  7:   () => [], // 
  8:   () => [], // 
  9:   () => [], // 
  10:  () => [], // 
  11:  () => [], // str		0:()=>[], //  11
  12:  () => [], // call
  13:  () => [], // var
  14:  () => [], // dcode
  15:  () => [], // ddata		0:()=>[], //  15
  16:  () => [ wasm.return ], // ;
  17:  () => [], // jmp
  18:  () => [], // jmpw
  19:  () => [], // [
  20:  () => [], // ]
  21:  () => [], // ;
  22:  () => [], // (
  23:  () => [], // )
  24:  () => [], // [
  25:  () => [], // ]
  26:  () => [], // EX
  27:  () => [], // 0?
  28:  () => [], // 1?
  29:  () => [], // +?
  30:  () => [], // -?
  31:  () => [], // <?
  32:  () => [], // >?
  33:  () => [], // =?
  34:  () => [], // >=?
  35:  () => [], // <=?
  36:  () => [], // <>?
  37:  () => [], // AN?
  38:  () => [], // NA?
  39:  () => [], // BTW?
  40:  () => [], // DUP
  41:  () => [], // DROP
  42:  () => [], // OVER
  43:  () => [], // PICK2
  44:  () => [], // PICK3
  45:  () => [], // PICK4
  46:  () => [], // SWAP
  47:  () => [], // NIP
  48:  () => [], // ROT
  49:  () => [], // 2DUP
  50:  () => [], // 2DROP
  51:  () => [], // 3DROP
  52:  () => [], // 4DROP
  53:  () => [], // 2OVER
  54:  () => [], // 2SWAP
  55:  () => [], // >R
  56:  () => [], // R>
  57:  () => [], // R@	
  58:  () => [ wasm.i32and ], // AND
  59:  () => [ wasm.i32or ], // OR
  60:  () => [ wasm.i32xor ], // XOR
  61:  () => [], // NOT
  62:  () => [], // NEG
  63:  () => [ wasm.i32add ], // +
  64:  () => [ wasm.i32sub ], // -
  65:  () => [ wasm.i32mul ], // *
  66:  () => [ wasm.i32div_s ], // /
  67:  () => [], // */	
  68:  () => [], // /MOD
  69:  () => [ wasm.i32rem_s ], // MOD
  70:  () => [], // ABS
  71:  () => [], // SQRT
  72:  () => [ wasm.i32clz ], // CLZ
  73:  () => [ wasm.i32shl ], // <<
  74:  () => [ wasm.i32shr_s ], // >>
  75:  () => [ wasm.i32shr_u ], // 0>>
  76:  () => [], // *>>
  77:  () => [], // <</
  78:  () => [], // @
  79:  () => [], // C@
  80:  () => [], // Q@
  81:  () => [], // @+
  82:  () => [], // C@+
  83:  () => [], // Q@+
  84:  () => [], // !
  85:  () => [], // C!
  86:  () => [], // Q!
  87:  () => [], // !+
  88:  () => [], // C!+
  89:  () => [], // Q!+
  90:  () => [], // +!
  91:  () => [], // C+!
  92:  () => [], // Q+!
  93:  () => [], // >A
  94:  () => [], // A>
  95:  () => [], // A@
  96:  () => [], // A!
  97:  () => [], // A+
  98:  () => [], // A@+
  99:  () => [], // A!+
  100: () => [], // >B
  101: () => [], // B>
  102: () => [], // B@
  103: () => [], // B!
  104: () => [], // B+
  105: () => [], // B@+
  106: () => [], // B!+
  107: () => [], // MOVE
  108: () => [], // MOVE>
  109: () => [], // FILL
  110: () => [], // CMOVE
  111: () => [], // CMOVE>
  112: () => [], // CFILL	
  113: () => [], // DMOVE
  114: () => [], // DMOVE>
  115: () => [], // DFILL
  116: () => [], // SYSCALL
  117: () => [] // SYSMEM
    
  /*    '>': () => [
        wasmInstr.getLocal, 0x00,
        wasmInstr.i32const, CELL_SIZE,
        wasmInstr.i32add,
        wasmInstr.setLocal, 0x00,
      ],
  */	
}
 
function intToVarint(n) {
  const buffer=[];
  let more=true;
  while (more) {
    let byte=n&0x7F;
    n>>>=7;
    if ((n===0 && (byte&0x40)===0) || (n===-1 && (byte&0x40)!==0)) { more=false; } else { byte|=0x80; }
    buffer.push(byte);
  }
  return buffer;
}

function intToVaruint(n) {
  const buffer = [];

  do {
    let byte = n & 0x7F;
    n >>>= 7;
    if (n !== 0) {
      byte |= 0x80;
    }
    buffer.push(byte);
  } while (n !== 0);

  return buffer;
}
 
function createSection(sectionType, ...data) {
  const flatData = [].concat(...data);
  return [section[sectionType], ...intToVaruint(flatData.length), ...flatData];
}
 
function getStrBytes(str) {
  const bytes = [];
  for (let i=0;i<str.length;i+=1) { bytes.push(str.charCodeAt(i)); }
  return bytes;
}
 
function compileToWasm(instrs) {
  const magicNumber = [0x00, 0x61, 0x73, 0x6d];
  const version = [0x01, 0x00, 0x00, 0x00];

  const functionsCount = 0x01;
  const startFuncIndex = 0x00;
  const startFunctionSignature = [type.func, 0x00, 0x00];
  const typeSection = createSection('type', functionsCount, startFunctionSignature);

  const importsCount = 0x01;
  const importModuleName = getStrBytes('imports');
  const importExportName = getStrBytes('memory');
  const importMemoryKind = 0x02;
  const memoryDesc = [0x00, 0x02];
  const importSection = createSection('import', importsCount, importModuleName.length, importModuleName, importExportName.length, importExportName, importMemoryKind, memoryDesc);

  const funcSection = createSection('func', functionsCount, startFuncIndex);

  const startSection = createSection('start', startFuncIndex);

  const localEntriesCount = 0x01;
  const i32VarCount = 0x02;

  const initOutputIndex = [wasmInstr.i32const, ...intToVarint(PAGE_SIZE),wasmInstr.setLocal, 0x00];

  const functionBody=instrs.reduce((res,instr)=>res.concat(instr.toWasm(...instr.extraParams)), initOutputIndex);
  functionBody.push(wasmInstr.end);

  const functionLength = intToVaruint(functionBody.length + 3);

  const codeSection=createSection('code',functionsCount,...functionLength,localEntriesCount,i32VarCount,type.i32,functionBody);

  const buffer = [
  ...magicNumber, 
  ...version, 
  ...typeSection, 
  ...importSection, 
  ...funcSection, 
  ...startSection, 
  ...codeSection];

  return Uint8Array.from(buffer);
}

  

var byteasm = new Uint8Array([
  0x00,0x61,0x73,0x6d // magic
  ,0x01,0x00,0x00,0x00 // version
  
  // typeSection
  ,0x01 // section code
  ,0x09,0x02,0x60,0x00,0x00,0x60,0x01
  ,0x7f,0x01,0x7f,0x03,0x03,0x02,0x00,0x01,0x05,0x04,0x01,0x00,0x80,0x01,0x07,0x07
  ,0x01,0x03,0x66,0x6f,0x6f,0x00,0x01,0x08,0x01,0x00,0x0a,0x3a,0x02,0x02,0x00,0x0b
  ,0x35,0x01,0x01,0x7f,0x20,0x00,0x41,0x04,0x6c,0x21,0x01,0x03,0x40,0x01,0x01,0x01
  ,0x0b,0x03,0x7f,0x41,0x01,0x0b,0x20,0x01,0x41,0xe4,0x00,0x6c,0x41,0xcd,0x02,0x20
  ,0x01,0x1b,0x21,0x01,0x41,0x00,0x20,0x01,0x36,0x02,0x00,0x41,0x00,0x21,0x01,0x41
  ,0x00,0x28,0x02,0x00,0x0f,0x0b,0x0b,0x0e,0x01,0x00,0x41,0x00,0x0b,0x08,0x00,0x00
  ,0x00,0x00,0x2c,0x00,0x00,0x00
]);


WebAssembly.compile(byteasm).then(mod => {
  let m = new WebAssembly.Instance(mod)
  console.log('foo(1) =>', m.exports.foo(1))
  console.log('foo(2) =>', m.exports.foo(2))
  console.log('foo(3) =>', m.exports.foo(63))
})