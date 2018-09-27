/* r3tokenizer 2018
GPITTAU PHREDA 
*/

var tok;
var nro=0;
var bas=0;
var wor=0;
var dic=0;

var memc=0;
var memcode=new Int32Array(0xffff); // 256kb
var memd=0;
var memdata=new Int32Array(0xffff); // 256kb

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
"@","C@","D@","@+","C@+","D@+", 							// 65
"!","C!","D!","!+","C!+","D!+", 							// 71
"+!","C+!","D+!", 											// 74
">A","A>","A@","A!","A+","A@+","A!+",						// 81
">B","B>","B@","B!","B+","B@+","B!+",						// 88
"MOVE","MOVE>","FILL",										// 91
"CMOVE","CMOVE>","CFILL",									// 94
"DMOVE","DMOVE>","DFILL",									// 97
"SYSCALL","SYSMEM",											// 99
0 ];

////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
/*
::r3tokenCode | str -- 'str tok/-error
	( dup c@ $ff and 33 <? )(
		0? ( nip ; ) 
		drop 1+ )	| quitar espacios
	$5e =? ( drop pINC ; )		| $5e ^  Include
	$7c =? ( drop pCOM ; )		| $7c |	 Comentario
	$3A =? ( drop pCOD ; )		| $3a :  Definicion
	$23 =? ( drop pVAR ; )		| $23 #  Variable
	$22 =? ( drop pSTR ; )		| $22 "	 Cadena
	$27 =? ( drop 1+ dup dup	| $27 ' Direccion
		?wor 1? ( nip pADR ; ) 2drop
		-1 ; )
	drop
	dup isNro 1? ( drop pNUM ; ) drop	| numero
	dup ?mac 1? ( pMAC ; ) drop	| macro
	?wor 1? ( pWOR ; ) drop		| palabra
 	-1 ;
*/

var dicc = [];

function pcom() { }
function pstr() { }

function pvar() {
	dicc[tok.slice(1)] = {
		addr: memd,
		info: 0
	};
	tokenMode = r3tokenData;
}

function pcod() {
	dicc[tok.slice(1)] = {
		addre: memd,
		info: 1
	};
	tokenMode = r3tokenCode;
}
var nro = 0;
function isNro() { 
	nro=tok.match(/^([0-9]+([\.][0-9]+)?)$/); // falta $hexa y %binario
	if (nro===null) { return false; }
	nro=Number(nro[1]);	// ojo, punto fijo, no flotante
	return true;  
}

function isBas() { 
	nro=r3base.indexOf(tok);
	if (nro<0) { return false; }
	return true;
}

function isWor(tok) { 
	return dicc[tok] !== undefined;
}

function lit9(nro) {
	memcode[memc] = nro<<7 | 7;
	memc++;
}

function mac(nro) {
	memcode[memc] = nro + 16;
	memc++;
}

function r3tokenCode(tok) {
	switch (tok.charCodeAt(0)) {
		case 0x5e:// =? ( drop pINC ; )		| $5e ^  Include
			return;
		case 0x7c:// =? ( drop pCOM ; )		| $7c |	 Comentario
			pcom();return;	
		case 0x3A:// =? ( drop pCOD ; )		| $3a :  Definicion
			pcod();return;		
		case 0x23:// =? ( drop pVAR ; )		| $23 #  Variable
			pvar();return;		
		case 0x22:// =? ( drop pSTR ; )		| $22 "	 Cadena
			pstr();return;		
		case 0x27:// =? ( drop 1+ dup dup	| $27 ' Direccion
			tok=tok.substr(1);
			if (isWor(tok)) { return; }			
			return -2;		
		}
	tok.toUpperCase();
	if (isNro(tok)) {
		lit9(nro);
		return 0;
	}
	if (isBas(tok)) { 
		mac(nro);
		return 0;
	}
	if (isWor(tok)) { return; }
	return -1;
}
var tokenMode = r3tokenCode;

function r3tokenData(tok) {
}

function* asWords (str) {
	var next= 0;
	var start;
	var findIndexFrom = (from, pred) => {
		let charindex = from;
		while(charindex < str.length && !pred(str[charindex])) {
			charindex++;
		}
		return charindex;
	};
	const isSpaceChar = char => char.charCodeAt(0) < 33 || char === "\n";
	while(next < str.length) {
		let charcode = str.charCodeAt(next);
		
		if(charcode < 33) {
			next = findIndexFrom(next, isSpaceChar) + 1;
			continue;
		}
		
		switch (charcode) {
			case 0x7c: 
				next = findIndexFrom(next, char => char === "\n") + 1;
				break;
			case 0x22: 
				start = next;
				next = findIndexFrom(next + 1, char => char === "\"");
				yield str.slice(start, next);
				next++;
				next++;
				break;
			default:
				start = next;
				next = findIndexFrom(next + 1, isSpaceChar);
				yield str.slice(start, next);
		}
	}
}
function r3tokenizer(str)
{
	memc=0;
	memd=0;
	for (tok of asWords(str)) {
		if (tokenMode(tok) < 0) {
			break;
		}
	}
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

var ip=0;
var TOS=0;
var NOS=0;
var RTOS=0;
var dpila=new Int32Array(256);//Float64Array
var rpila=new Int32Array(256);//Float64Array con cast?

function r3op(op) {
	switch(op&0x7f) {
		case 7: NOS++;dpila[NOS]=TOS;TOS=op>>7;break;//LIT9
		case 8: NOS++;dpila[NOS]=TOS;TOS=op>>7;break;//LITres
		case 9: NOS++;dpila[NOS]=TOS;TOS=op>>7;break;//LITreg neg
		case 10: NOS++;dpila[NOS]=TOS;TOS=prog.getInt32(IP);IP+=4;break;//LITcte
		case 11: NOS++;dpila[NOS]=TOS;TOS=prog.getInt32(IP);IP+=4;break;//str
		case 12: RTOS++;rpila[RTOS]=IP+4;IP=prog.getInt32(IP);break;// call
		case 13: NOS++;dpila[NOS]=TOS;TOS=mem.getInt32(prog.getInt32(IP));IP+=4;break;//ADR
		case 14: NOS++;dpila[NOS]=TOS;TOS=prog.getInt32(IP);IP+=4;break;//DWoRD
		case 15: NOS++;dpila[NOS]=TOS;TOS=prog.getInt32(IP);IP+=4;break;//DVAR
		case 16: ip=rpila[RTOS];RTOS--;w=0;break; // ;
		case 17: 
		case 18: IP=prog.getInt32(IP);break;//JMP
		case 19:
		case 20: IP+=prog.getInt8(IP);break;//JMPR
		case 21: W=TOS;TOS=dpila[NOS];NOS--;if (W!=0) { RTOS++;rpila[RTOS]=IP;IP=W; };break;//EXEC
		case 22:W=prog.getInt8(IP);IP++;if (TOS!=0) IP+=W; break;//ZIF
		case 23:W=prog.getInt8(IP);IP++;if (TOS==0) IP+=W; break;//UIF
		case 24: W=prog.getInt8(IP);IP++;if (TOS<=0) IP+=W; break;//PIF
		case 25: W=prog.getInt8(IP);IP++;if (TOS>=0) IP+=W; break;//NIF
		case 26:W=prog.getInt8(IP);IP++;if (TOS!=dpila[NOS]) IP+=W;TOS=dpila[NOS];NOS--;break;//IFN
		case 27:W=prog.getInt8(IP);IP++;if (TOS==dpila[NOS]) IP+=W;TOS=dpila[NOS];NOS--;break;//IFNO
		case 28:W=prog.getInt8(IP);IP++;if (TOS<=dpila[NOS]) IP+=W;TOS=dpila[NOS];NOS--;break;//IFL
		case 29:W=prog.getInt8(IP);IP++;if (TOS>=dpila[NOS]) IP+=W;TOS=dpila[NOS];NOS--;break;//IFG
		case 30:W=prog.getInt8(IP);IP++;if (TOS<dpila[NOS]) IP+=W;TOS=dpila[NOS];NOS--;break;//IFLE
		case 31:W=prog.getInt8(IP);IP++;if (TOS>dpila[NOS]) IP+=W;TOS=dpila[NOS];NOS--;break;//IFGE
		case 32:W=prog.getInt8(IP);IP++;if (!(TOS&dpila[NOS])) IP+=W;TOS=dpila[NOS];NOS--;break;//IFAND
		case 33:W=prog.getInt8(IP);IP++;if (TOS&dpila[NOS]) IP+=W;TOS=dpila[NOS];NOS--;break;//IFNAND
		case 34:W=prog.getInt8(IP);IP++;if (TOS&dpila[NOS]) IP+=W;TOS=dpila[NOS];NOS--;break;//BETWEEN

		case 34:NOS++;dpila[NOS]=TOS;break;//DUP
		case 35:TOS=dpila[NOS];NOS--;break;//DROP
		case 36:NOS++;dpila[NOS]=TOS;TOS=dpila[NOS-1];break;//OVER
		case 37:NOS++;dpila[NOS]=TOS;TOS=dpila[NOS-2];break;//PICK2
		case 38:NOS++;dpila[NOS]=TOS;TOS=dpila[NOS-3];break;//PICK3
		case 39:NOS++;dpila[NOS]=TOS;TOS=dpila[NOS-4];break;//PICK4
		case 40:W=dpila[NOS];dpila[NOS]=TOS;TOS=W;break;//SWAP
		case 41:NOS--;break; //NIP
		case 42:W=TOS;TOS=dpila[NOS-1];dpila[NOS-1]=dpila[NOS];dpila[NOS]=W;break;//ROT
		case 43:W=dpila[NOS];NOS++;dpila[NOS]=TOS;NOS++;dpila[NOS]=W;break;//DUP2
		case 44:NOS--;TOS=dpila[NOS];NOS--;break;//DROP2
		case 45:NOS-=2;TOS=dpila[NOS];NOS--;break;//DROP3
		case 46:NOS-=3;TOS=dpila[NOS];NOS--;break;//DROP4
		case 47:NOS++;dpila[NOS]=TOS;TOS=dpila[NOS-3];NOS++;dpila[NOS]=TOS;TOS=dpila[NOS-3];break;//OVER2
		case 48:W=dpila[NOS];dpila[NOS]=dpila[NOS-2];dpila[NOS-2]=W;W=TOS;TOS=dpila[NOS-1];dpila[NOS-1]=W;break;//SWAP2
		case 49:RTOS++;rpila[RTOS]=TOS;TOS=dpila[NOS];NOS--;break;//>r
		case 50:NOS++;dpila[NOS]=TOS;TOS=rpila[RTOS];RTOS--;break;//r>
		case 51:NOS++;dpila[NOS]=TOS;TOS=rpila[RTOS];break;//ERRE
		case 52:TOS&=dpila[NOS];NOS--;break;//AND
		case 53:TOS|=dpila[NOS];NOS--;break;//OR
		case 54:TOS^=dpila[NOS];NOS--;break;//XOR
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
		case 66:TOS=isqrt32(TOS);break;//CSQRT
		case 67:TOS=iclz32(TOS);break;//CLZ
		case 68:TOS=dpila[NOS]<<TOS;NOS--;break;//SAR
		case 69:TOS=dpila[NOS]>>TOS;NOS--;break;//SAL
		case 70:TOS=dpila[NOS]>>TOS;NOS--;break;//SHL
		case 71:TOS=(dpila[NOS-1]*dpila[NOS])>>TOS;NOS-=2;break;//MULSHR
		case 72:TOS=(dpila[NOS-1]<<TOS)/dpila[NOS];NOS-=2;break;//CDIVSH
		case 73:TOS=mem.getInt32(TOS);break;//FECH
		case 74:TOS=mem.getInt8(TOS);break;//CFECH
		case 75:TOS=mem.getInt64(TOS);break;//DFECH	
		
		
		/*
		case 76TOS=mem.getInt32(TOS);break;//FECH+
		case 77:TOS=mem.getInt8(TOS);break;//CFECH+
		case 78:TOS=mem.getInt64(TOS);break;//DFECH+		
				
		case 79:mem[TOS]=dpila[NOS];NOS--;TOS=dpila[NOS];NOS--;break;//STOR
		case 80:mem[TOS]=dpila[NOS];NOS--;TOS=dpila[NOS];NOS--;break;//CSTOR
		case 81:mem[TOS]=dpila[NOS];NOS--;TOS=dpila[NOS];NOS--;break;//DSTOR
		
		case 82:mem[TOS]=dpila[NOS];NOS--;TOS=dpila[NOS];NOS--;break;//STOR+
		case 83:mem[TOS]=dpila[NOS];NOS--;TOS=dpila[NOS];NOS--;break;//CSTOR+
		case 84:mem[TOS]=dpila[NOS];NOS--;TOS=dpila[NOS];NOS--;break;//DSTOR+
		
		case 85:mem[TOS]=dpila[NOS];NOS--;TOS=dpila[NOS];NOS--;break;//STOR+!
		case 86:mem[TOS]=dpila[NOS];NOS--;TOS=dpila[NOS];NOS--;break;//CSTOR+!
		case 87:mem[TOS]=dpila[NOS];NOS--;TOS=dpila[NOS];NOS--;break;//DSTOR+!
		
		case 88:REGA=TOS;TOS=dpila[NOS];NOS--;break; //>A
		case 89:NOS++;dpila[NOS]=TOS;TOS=REGA;break; // A> 
		case 90:mem[TOS]=dpila[NOS];NOS--;TOS=dpila[NOS];NOS--;break;//DSTOR+! iA@ 
		case 91:mem[TOS]=dpila[NOS];NOS--;TOS=dpila[NOS];NOS--;break;//DSTOR+! iA! 
		case 92:mem[TOS]=dpila[NOS];NOS--;TOS=dpila[NOS];NOS--;break;//DSTOR+! iA+ 
		case 93:mem[TOS]=dpila[NOS];NOS--;TOS=dpila[NOS];NOS--;break;//DSTOR+! iA@+ 
		case 94:mem[TOS]=dpila[NOS];NOS--;TOS=dpila[NOS];NOS--;break;//DSTOR+! iA!+
		case 95:REGB=TOS;TOS=dpila[NOS];NOS--;break; //>B	
		case 96:NOS++;dpila[NOS]=TOS;TOS=REGB;break; // B> 
		case 97:mem[TOS]=dpila[NOS];NOS--;TOS=dpila[NOS];NOS--;break;//DSTOR+! iB@ 
		case 98:mem[TOS]=dpila[NOS];NOS--;TOS=dpila[NOS];NOS--;break;//DSTOR+! iB! 
		case 99:mem[TOS]=dpila[NOS];NOS--;TOS=dpila[NOS];NOS--;break;//DSTOR+! iB+ 
		case 100:mem[TOS]=dpila[NOS];NOS--;TOS=dpila[NOS];NOS--;break;//DSTOR+! iB@+ 
		case 101:mem[TOS]=dpila[NOS];NOS--;TOS=dpila[NOS];NOS--;break;//DSTOR+! iB!+

		case 102:mem[TOS]=dpila[NOS];NOS--;TOS=dpila[NOS];NOS--;break;//DSTOR+! iMOVE 
		case 103:mem[TOS]=dpila[NOS];NOS--;TOS=dpila[NOS];NOS--;break;//DSTOR+! iMOVE> 
		case 104:mem[TOS]=dpila[NOS];NOS--;TOS=dpila[NOS];NOS--;break;//DSTOR+! iFILL
		case 105:mem[TOS]=dpila[NOS];NOS--;TOS=dpila[NOS];NOS--;break;//DSTOR+! iCMOVE 
		case 106:mem[TOS]=dpila[NOS];NOS--;TOS=dpila[NOS];NOS--;break;//DSTOR+! iCMOVE> 
		case 107:mem[TOS]=dpila[NOS];NOS--;TOS=dpila[NOS];NOS--;break;//DSTOR+! iCFILL
		case 108:mem[TOS]=dpila[NOS];NOS--;TOS=dpila[NOS];NOS--;break;//DSTOR+! iDMOVE 
		case 109:mem[TOS]=dpila[NOS];NOS--;TOS=dpila[NOS];NOS--;break;//DSTOR+! iDMOVE> 
		case 110:mem[TOS]=dpila[NOS];NOS--;TOS=dpila[NOS];NOS--;break;//DSTOR+! iDFILL

		case 111:mem[TOS]=dpila[NOS];NOS--;TOS=dpila[NOS];NOS--;break;//DSTOR+! iSYSCALL
		case 112:mem[TOS]=dpila[NOS];NOS--;TOS=dpila[NOS];NOS--;break;//DSTOR+! iSYSMEM		
		*/
	}
}


//var memc=0;
function r3reset(){
	ip=0;
}

function r3step() {
	r3op(memcode[ip++]);
}

//code="1 2 3 + -";
//r3tokenizer(code);
//console.info(code);
