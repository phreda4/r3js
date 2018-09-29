/* r3www 2018 - GPITTAU PHREDA */

var dicc=[];
var dicca=[];
var dicci=[];
var ndicc=0;

var memc=0;
var memcode=new Int32Array(0xffff); // 256kb
var memd=0;

var display;
var display_data;
var memdata=new ArrayBuffer(0xffffff); // 16Mb
var mem=new DataView(realmem);

var modo=0; // 0-imm 1-code 2-data
var level=0;
var boot=-1;
var nro=0;

var r3machine=[
"0",":","::","#","##","|","^",			// 6
"LIT9","LITR","LITNR","LITC","STR",		// b
"CALL","VAR","DCODE","DDATA"];			// f
var r3base=[
";","(",")","[","]","EX","0?","1?","+?","-?",				// 10
"<?",">?","=?",">=?","<=?","<>?","A?","N?","B?",			// 19
"DUP","DROP","OVER","PICK2","PICK3","PICK4","SWAP","NIP",	// 27
"ROT","2DUP","2DROP","3DROP","4DROP","2OVER","2SWAP",		// 34
">R","R>","R@",												// 37
"AND","OR","XOR","NOT","NEG",								// 42
"+","-","*","/","*/",										// 47
"/MOD","MOD","ABS","SQRT","CLZ",							// 52
"<<",">>","0>>","*>>","<</",								// 57
"@","C@","Q@","@+","C@+","Q@+", 							// 65
"!","C!","Q!","!+","C!+","Q!+", 							// 71
"+!","C+!","Q+!", 											// 74
">A","A>","A@","A!","A+","A@+","A!+",						// 81 32bits
">B","B>","B@","B!","B+","B@+","B!+",						// 88 64bits
"MOVE","MOVE>","FILL",										// 91
"CMOVE","CMOVE>","CFILL",									// 94
"DMOVE","DMOVE>","DFILL",									// 97
"SYSCALL","SYSMEM",											// 99
0 ];

function isNro(tok) { 
	//if (tok[0]=="-")
	nro=tok.match(/^\d+$/); // integer
	if (nro!=null) { nro=parseInt(tok);return true; }
	nro=tok.match(/^\d+.\d+$/); // fixed.point
	if (nro!=null) { 
		n=tok.split(".");
		nro=(parseInt(n[0])<<16)|(parseInt("1"+n[1])&0xffff);
		return true; 
		}
	switch (tok[0]) {
	case "$":	// $hex
		tok=tok.slice(1);nro=tok.match(/^[0-9A-F]+$/);
		if (nro!=null) { nro=parseInt(tok,16);return true; }; 
		break;
	case "%":  // %bin
		tok=tok.slice(1);nro=tok.match(/^[0-1]+$/);
		if (nro!=null) { nro=parseInt(tok,2);return true; }; 
		break;
	}
	return false;
}

function isBas(tok) { 
	nro=r3base.indexOf(tok);
	if (nro<0) { return false; }
	return true;
}

function isWord(tok) { 
var i=dicc.length;
while (i--) {
	if (dicc[i]===tok) { break; }
	}
return i;
}


function error() {}

function codetok(nro) { 
if (modo==0 && boot==-1) { boot=memc; }
memcode[memc++]=nro; 
}

function datanro(nro) { 
mem.setInt32(memd,nro);memd+=4;
}

function datasave(str) { 
for(var i=0;i<str.length;i++)
	memdata[memd++]=str.charCodeAt(i);
memdata[memd++]=0;
}

function compilaSTR(str) {
ini=datasave(str);	
if (modo<2) {codetok((ini<<7)+11);}
}

function compilaCODE(name) {
var ex=0;
if (name[1]==":") { ex=1; }
dicc.push(name.slice(ex+1,name.length).toUpperCase());
dicca.push(memc);
dicci.push(ex);
modo=1;	
}

function compilaDATA(name) {
var ex=0;
if (name[1]=="#") { ex=1; }
dicc.push(name.slice(ex+1,name.length).toUpperCase());
dicca.push(memd);
dicci.push(ex+0x10);	// 0x10 es dato
modo=2;
}

function compilaADDR(n) {
if (modo>1) { datanro(n);return; }
codetok((n<<7)+13); 
}

function compilaLIT(n) {
if (modo>1) { datanro(n);return; }
codetok((n<<7)+7); // falta
}

function dataMAC(n){
if (n==45) {modo=3;} // * reserva bytes
if (n==17) {modo=4;}	// (	bytes
if (n==18) {modo=2;}	// )
if (n==19) {modo=5;}	// [	qwords
if (n==20) {modo=2;}	// ]
}

function compilaMAC(n) {
if(modo>1) { dataMAC(n);return; }
if (n==17) { } //(	etiqueta
if (n==18) { } //)	salto
if (n==19) {} //[	salto:etiqueta
if (n==20) {} //]	etiqueta;push
codetok(n+16);	
if (n==0) { if (level==0) {modo=0;} } //;
}

function compilaWORD(n) {
	
codetok((dicca[n]<<7)+12);
}

function r3token(str) {
memc=1;
memd=1;

boot=-1;
level=0;
var now=0;
var ini;
var ntoken;
str=str.trim();
while(now<str.length) {
	while (str.charCodeAt(now)<33) { now++; }
// comments	
	if(str[now]==="|") {
		now=str.indexOf("\n",now)+1;
		if (now<0) { now=str.length;}
		continue; }
// strings		
	if(str[now]=== "\"") {
		ini=now;
		now=str.indexOf("\"",now+1)+1;
//		now++;while(str.charCodeAt(now)!=43) { now++; } now++;

		compilaSTR(str.slice(ini+1,now-1));
		now++;
	} else {
		ini=now;
		while (str.charCodeAt(now)>32) { now++; }			
		ntoken=str.slice(ini,now);

// genera tokens
		switch (ntoken.charCodeAt(0)) {
			case 0x3A:// $3a :  Definicion
				compilaCODE(ntoken);break;
			case 0x23:// $23 #  Variable
				compilaDATA(ntoken);break;
			case 0x27:// $27 ' Direccion
				ntoken=ntoken.substr(1);
				nro=isWord(ntoken);if (nro<0) { error();break; }			
				compilaADDR(nro);break;		
			default:
				ntoken=ntoken.toUpperCase();
				if (isNro(ntoken)) { compilaLIT(nro);break; }
				if (isBas(ntoken)) { compilaMAC(nro);break; }
				nro=isWord(ntoken);if (nro<0) { error();break; }
				compilaWORD(nro);
				break;
			}
		}		
	}
ip=boot;	
}

/*
:vmstep
	$7f and 2 << 'vml + @ exec ;

::vmrun | adr --
	( @+ 1? )(
		( dup vmstep 8 0>> 0? ) drop
		0? ( drop ; )
		) 2drop ;
*/

function r3canvas(str) {
	
var canvas=document.getElementById(str);
var ctx=canvas.getContext('2d',{alpha:false});
display=ctx.createImageData(640,480);
display_data=new Uint32Array(display.data.buffer);

var i,j,p=0;
for(i=0;i<640;i++) {
	for(j=0;j<480;j++) {
		display[p++]=i*j;
		}	 
	}
ctx.putImageData(display, 0, 0);	
}	

var ip;
var TOS=0;
var NOS=0;
var RTOS=0;
var dpila=new Int32Array(256);//Float64Array
var rpila=new Int32Array(256);//Float64Array con cast?

function r3op(op) { var W;
while(op!=0){switch(op&0x7f){
	case 7: NOS++;dpila[NOS]=TOS;TOS=op>>7;op>>=16;break;//LIT9
	case 8: NOS++;dpila[NOS]=TOS;TOS=op>>7;op=0;break;//LITres
	case 9: NOS++;dpila[NOS]=TOS;TOS=-(op>>7);op=0;break;//LITreg neg
	case 10:NOS++;dpila[NOS]=TOS;TOS=memcode(op>>7);op=0;break;//LITcte
	case 11:NOS++;dpila[NOS]=TOS;TOS=op>>7;op=0;break;//str
	case 12:RTOS++;rpila[RTOS]=ip;ip=op>>7;op=0;break;// call
	case 13:NOS++;dpila[NOS]=TOS;TOS=memcode[op>>7];op=0;break;//ADR
	case 14:NOS++;dpila[NOS]=TOS;TOS=prog.getInt32(ip);ip+=4;break;//DWoRD
	case 15:NOS++;dpila[NOS]=TOS;TOS=prog.getInt32(ip);ip+=4;break;//DVAR
	case 16:ip=rpila[RTOS];RTOS--;op=0;break; // ;
	case 17: 
	case 18:ip=(op>>7);break;//JMP
	case 19:
	case 20:ip+=(op>>7);break;//JMPR
	case 21:W=TOS;TOS=dpila[NOS];NOS--;RTOS++;rpila[RTOS]=ip;ip=W;break;//EX
	case 22:if (TOS!=0) {ip+=(op>>7);}; break;//ZIF
	case 23:if (TOS==0) {ip+=(op>>7);}; break;//UIF
	case 24:if (TOS<=0) {ip+=(op>>7);}; break;//PIF
	case 25:if (TOS>=0) {ip+=(op>>7);}; break;//NIF
	case 26:if (TOS!=dpila[NOS]) {ip+=(op>>7);} TOS=dpila[NOS];NOS--;break;//IFN
	case 27:if (TOS==dpila[NOS]) {ip+=(op>>7);} TOS=dpila[NOS];NOS--;break;//IFNO
	case 28:if (TOS<=dpila[NOS]) {ip+=(op>>7);} TOS=dpila[NOS];NOS--;break;//IFL
	case 29:if (TOS>=dpila[NOS]) {ip+=(op>>7);} TOS=dpila[NOS];NOS--;break;//IFG
	case 30:if (TOS<dpila[NOS]) {ip+=(op>>7);} TOS=dpila[NOS];NOS--;break;//IFLE
	case 31:if (TOS>dpila[NOS]) {ip+=(op>>7);} TOS=dpila[NOS];NOS--;break;//IFGE
	case 32:if (!(TOS&dpila[NOS])) {ip+=(op>>7);} TOS=dpila[NOS];NOS--;break;//IFAND
	case 33:if (TOS&dpila[NOS]) {ip+=(op>>7);} TOS=dpila[NOS];NOS--;break;//IFNAND
	case 34:if (TOS<=dpila[NOS]&&dpila[NOS]<=dpila[NOS]) {ip+=(op>>7);} TOS=dpila[NOS-1];NOS-=2;break;//BETWEEN
	case 35:NOS++;dpila[NOS]=TOS;break;//DUP
	case 36:TOS=dpila[NOS];NOS--;break;//DROP
	case 37:NOS++;dpila[NOS]=TOS;TOS=dpila[NOS-1];break;//OVER
	case 38:NOS++;dpila[NOS]=TOS;TOS=dpila[NOS-2];break;//PICK2
	case 39:NOS++;dpila[NOS]=TOS;TOS=dpila[NOS-3];break;//PICK3
	case 40:NOS++;dpila[NOS]=TOS;TOS=dpila[NOS-4];break;//PICK4
	case 41:W=dpila[NOS];dpila[NOS]=TOS;TOS=W;break;//SWAP
	case 42:NOS--;break; //Nip
	case 43:W=TOS;TOS=dpila[NOS-1];dpila[NOS-1]=dpila[NOS];dpila[NOS]=W;break;//ROT
	case 44:W=dpila[NOS];NOS++;dpila[NOS]=TOS;NOS++;dpila[NOS]=W;break;//DUP2
	case 45:NOS--;TOS=dpila[NOS];NOS--;break;//DROP2
	case 46:NOS-=2;TOS=dpila[NOS];NOS--;break;//DROP3
	case 47:NOS-=3;TOS=dpila[NOS];NOS--;break;//DROP4
	case 48:NOS++;dpila[NOS]=TOS;TOS=dpila[NOS-3];NOS++;dpila[NOS]=TOS;TOS=dpila[NOS-3];break;//OVER2
	case 49:W=dpila[NOS];dpila[NOS]=dpila[NOS-2];dpila[NOS-2]=W;W=TOS;TOS=dpila[NOS-1];dpila[NOS-1]=W;break;//SWAP2
	
	case 50:RTOS++;rpila[RTOS]=TOS;TOS=dpila[NOS];NOS--;break;//>r
	case 51:NOS++;dpila[NOS]=TOS;TOS=rpila[RTOS];RTOS--;break;//r>
	case 52:NOS++;dpila[NOS]=TOS;TOS=rpila[RTOS];break;//r@
	
	case 53:TOS&=dpila[NOS];NOS--;break;//AND
	case 54:TOS|=dpila[NOS];NOS--;break;//OR
	case 55:TOS^=dpila[NOS];NOS--;break;//XOR
	case 56:TOS=~TOS;break;//NOT
	case 57:TOS=-TOS;break;//NEG
	case 58:TOS=dpila[NOS]+TOS;NOS--;break;//SUMA
	case 59:TOS=dpila[NOS]-TOS;NOS--;break;//RESTA
	case 60:TOS=dpila[NOS]*TOS;NOS--;break;//MUL
	case 61:TOS=dpila[NOS]/TOS;NOS--;break;//DIV
	case 62:TOS=(dpila[NOS-1]*dpila[NOS])/TOS;NOS-=2;break;//MULDIV
	case 63:W=dpila[NOS]%TOS;dpila[NOS]=dpila[NOS]/TOS;TOS=W;break;//DIVMOD
	case 64:TOS=dpila[NOS]%TOS;NOS--;break;//MOD
	case 65:W=(TOS>>31);TOS=(TOS+W)^W;break;//ABS
	case 66:TOS=Math.sqrt(TOS);break;//CSQRT
	case 67:TOS=Math.clz32(TOS);break;//CLZ
	case 68:TOS=dpila[NOS]<<TOS;NOS--;break;//SAR
	case 69:TOS=dpila[NOS]>>TOS;NOS--;break;//SAL
	case 70:TOS=dpila[NOS]>>TOS;NOS--;break;//SHL
	case 71:TOS=(dpila[NOS-1]*dpila[NOS])>>TOS;NOS-=2;break;//MULSHR
	case 72:TOS=(dpila[NOS-1]<<TOS)/dpila[NOS];NOS-=2;break;//CDIVSH
	
	case 73:TOS=mem.getInt32(TOS);break;//@
	case 74:TOS=mem.getInt8(TOS);break;//C@
	case 75:TOS=mem.getInt64(TOS);break;//Q@	

	case 76:NOS++;dpila[NOS]=TOS+8;TOS=mem.getInt32(TOS);break;//@+
	case 77:NOS++;dpila[NOS]=TOS+1;TOS=mem.getInt8(TOS);break;// C@+
	case 78:NOS++;dpila[NOS]=TOS+4;TOS=mem.getInt64(TOS);break;//Q@+		
			
	case 79:mem.setInt32(TOS,dpila[NOS]);NOS--;TOS=dpila[NOS];NOS--;break;//!
	case 80:mem.setInt8(TOS,dpila[NOS]);NOS--;TOS=dpila[NOS];NOS--;break;//C!
	case 81:mem.setInt64(TOS,dpila[NOS]);NOS--;TOS=dpila[NOS];NOS--;break;//Q!
	
	case 82:mem.setInt32(TOS,dpila[NOS]);NOS--;TOS+=4;break;//!+
	case 83:mem.setInt8(TOS,dpila[NOS]);NOS--;TOS++;break;//C!+
	case 84:mem.setInt64(TOS,dpila[NOS]);NOS--;TOS+=8;break;//Q!+
	
	case 85:mem.setInt32(TOS,mem.getInt32(TOS)+dpila[NOS]);NOS--;TOS=dpila[NOS];NOS--;break;//+!
	case 86:mem[TOS]+=dpila[NOS];NOS--;TOS=dpila[NOS];NOS--;break;//C+!
	case 87:mem[TOS]+=dpila[NOS];NOS--;TOS=dpila[NOS];NOS--;break;//Q+!
	
	case 88:REGA=TOS;TOS=dpila[NOS];NOS--;break; //>A
	case 89:NOS++;dpila[NOS]=TOS;TOS=REGA;break; //A> 
	case 90:NOS++;dpila[NOS]=TOS;TOS==mem.getInt32(REGA);break;//A@
	case 91:mem.setInt32(REGA,TOS);TOS=dpila[NOS];NOS--;break;//A! 
	case 92:REGA+=TOS;TOS=dpila[NOS];NOS--;break;//A+ 
	case 93:NOS++;dpila[NOS]=TOS;TOS==mem.getInt32(REGA);REGA+=4;break;//A@+ 
	case 94:mem.setInt32(REGA,TOS);TOS=dpila[NOS];NOS--;REGA+=4;break;//A!+

	case 95:REGB=TOS;TOS=dpila[NOS];NOS--;break; //>B
	case 96:NOS++;dpila[NOS]=TOS;TOS=REGB;break; //B> 
	case 97:NOS++;dpila[NOS]=TOS;TOS==mem.getInt64(REGB);break;//B@
	case 98:mem.setInt64(REGB,TOS);TOS=dpila[NOS];NOS--;break;//B! 
	case 99:REGB+=TOS;TOS=dpila[NOS];NOS--;break;//B+ 
	case 100:NOS++;dpila[NOS]=TOS;TOS==mem.getInt64(REGB);REGB+=8;break;//B@+ 
	case 101:mem.setInt64(REGB,TOS);TOS=dpila[NOS];NOS--;REGB+=8;break;//B!+

	case 102:break;//MOVE 
	case 103:break;//MOVE> 
	case 104:break;//FILL
	case 105:break;//CMOVE 
	case 106:break;//CMOVE> 
	case 107:break;//CFILL
	case 108:break;//QMOVE 
	case 109:break;//MOVE> 
	case 110:break;//QFILL
	
	case 111:break;//SYSCALL
	case 112:break;//SYSMEM		
	}op>>=8;}
}

function r3reset(){
	TOS=0;
	NOS=0;
	RTOS=0;
	ip=boot;
}

function r3step() {
	if (ip==0) { return; }
	r3op(memcode[ip++]);	
}

function r3run() {
	if (boot=-1) { return; }
	r3canvas();
	ip=boot;
	while(ip!=0) { r3op(memcode[ip++]); }
}

////////////////////////////////////////////////////////////////////

function num9(tok) // 9 bits
{ return ((tok<<16)>>7); }
function numr(tok) // r bits
{ return (tok>>7);}
function numrn(tok) // r bits neg
{ return -(tok>>7);}
function numct(tok) // cte
{ return memcode[(tok>>7)];}

function lstr(tok) // string
{ return (tok>>7); }
function jrel(tok) // jump rel
{ return (tok>>7); }

function printmr3(tok) {
if ((tok&0x7f)>15) { return r3base[(tok&0x7f)-16]; }
return r3machine[tok&0x7f];
}

/////////////////////////// LIB //////////////////////////////////////
// from https://stackoverflow.com/questions/18600895/resize-arraybuffer
if (!ArrayBuffer.transfer) {
  ArrayBuffer.transfer = function(oldBuffer, newByteLength) {
    var srcBuffer = Object(oldBuffer);
    var destBuffer = new ArrayBuffer(newByteLength);
    if (!(srcBuffer instanceof ArrayBuffer) || !(destBuffer instanceof ArrayBuffer)) {
      throw new TypeError('Source and destination must be ArrayBuffer instances');
    }
    var copylen = Math.min(srcBuffer.byteLength, destBuffer.byteLength);

    /* Copy 8 bytes at a time */
    var length = Math.trunc(copylen / 64);
    (new Float64Array(destBuffer, 0, length))
      .set(new Float64Array(srcBuffer, 0, length));

    /* Copy the remaining 0 to 7 bytes, 1 byte at a time */
    var offset = length * 64;
    length = copylen - offset;
    (new Uint8Array(srcBuffer, offset, length))
      .set(new Uint8Array(destBuffer, offset, length));

    return destBuffer;
  };
}