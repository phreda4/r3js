/* r3tokenizer 2018
GPITTAU PHREDA 
*/

var tokenmem[];
var tok;
var nro=0;
var bas=0;
var wor=0;


var r3base=[
";","(",")","[","]","EX","0?","1?","+?","-?",				// 10
"<?",">?","=?",">=?","<=?","<>?","A?","N?","B?",			// 19
"DUP","DROP","OVER","PICK2","PICK3","PICK4","SWAP","NIP",	// 27
"ROT","2DUP","2DROP","3DROP","4DROP","2OVER","2SWAP",		// 34
">R","R>","R@",												// 37
"AND","OR","XOR","NOT","NEG",								// 42
"+","-","*","/","*/",										// 47
"/MOD","MOD","ABS","SQRT","CLZ",							// 52
"<<",">>","0>>","*>>","<</",	//57
"@","C@","D@","@+","C@+","D@+", //65
"!","C!","D!","!+","C!+","D!+", // 71
"+!","C+!","D+!", // 74
">A","A>","A@","A!","A+","A@+","A!+",	//81
">B","B>","B@","B!","B+","B@+","B!+",	//88
"MOVE","MOVE>","FILL",	//91
"CMOVE","CMOVE>","CFILL",	//94
"DMOVE","DMOVE>","DFILL",	//97
"SYSCALL","SYSMEM",	// 99
0 ];

////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
/*
::r3token | str -- 'str tok/-error
	( dup c@ $ff and 33 <? )( 0? ( nip ; ) drop 1+ )	| quitar espacios
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


function isNro() { 
var nro=tok.match(/^([0-9]*([.][0-9]*)?([eE][+-]?[0-9]+)?[#]?)/); // falta $hexa y %binario
if (nro===null) { return false; }
nro=nro[1];
return true;  
}

function isBas() { 
var bas=r3base.indexOf(tok);
if (bas<0) { return false; }
return true;
}

function isWor(tok) { 
var wor=r3base.indexOf(tok);
if (wor<0) { return false; }
return true;
}

function r3token(tok) {
tok.trim().toUpperCase();
switch (tok.charAt(0)) {
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
		if isWor(tok) { return; }			
		return -2;		
	}
if isNro(tok) { return; }
if isBas(tok) { return; }
if isWor(tok) { return; }
return -1;
}


function r3tokenizer(str)
{
while((tok=nextword(str))!='') {
	if (r3token(tok)<0) break;
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

function r3op(op) {
switch(op) {
	case 0: IP=rpila[RTOS];RTOS--;break; //FIN
	case 1: NOS++;dpila[NOS]=TOS;TOS=prog.getInt32(IP);IP+=4;break;//LIT
	case 2: NOS++;dpila[NOS]=TOS;TOS=mem.getInt32(prog.getInt32(IP));IP+=4;break;//ADR
	case 3: RTOS++;rpila[RTOS]=IP+4;IP=prog.getInt32(IP);break;// call
	case 4: IP=prog.getInt32(IP);break;//JMP
	case 5: IP+=prog.getInt8(IP);break;//JMPR
	case 6: W=TOS;TOS=dpila[NOS];NOS--;if (W!=0) { RTOS++;rpila[RTOS]=IP;IP=W; };break;//EXEC
	case 7: W=prog.getInt8(IP);IP++;if (TOS!=0) IP+=W; break;//IF
	case 8: W=prog.getInt8(IP);IP++;if (TOS<=0) IP+=W; break;//PIF
	case 9: W=prog.getInt8(IP);IP++;if (TOS>=0) IP+=W; break;//NIF
	case 10:W=prog.getInt8(IP);IP++;if (TOS==0) IP+=W; break;//UIF
	case 11:W=prog.getInt8(IP);IP++;if (TOS!=dpila[NOS]) IP+=W;TOS=dpila[NOS];NOS--;break;//IFN
	case 12:W=prog.getInt8(IP);IP++;if (TOS==dpila[NOS]) IP+=W;TOS=dpila[NOS];NOS--;break;//IFNO
	case 13:W=prog.getInt8(IP);IP++;if (TOS<=dpila[NOS]) IP+=W;TOS=dpila[NOS];NOS--;break;//IFL
	case 14:W=prog.getInt8(IP);IP++;if (TOS>=dpila[NOS]) IP+=W;TOS=dpila[NOS];NOS--;break;//IFG
	case 15:W=prog.getInt8(IP);IP++;if (TOS<dpila[NOS]) IP+=W;TOS=dpila[NOS];NOS--;break;//IFLE
	case 16:W=prog.getInt8(IP);IP++;if (TOS>dpila[NOS]) IP+=W;TOS=dpila[NOS];NOS--;break;//IFGE
	case 17:W=prog.getInt8(IP);IP++;if (!(TOS&dpila[NOS])) IP+=W;TOS=dpila[NOS];NOS--;break;//IFAND
	case 18:W=prog.getInt8(IP);IP++;if (TOS&dpila[NOS]) IP+=W;TOS=dpila[NOS];NOS--;break;//IFNAND
	//--- pila de datos
	case 19:NOS++;dpila[NOS]=TOS;break;//DUP
	case 20:TOS=dpila[NOS];NOS--;break;//DROP
	case 21:NOS++;dpila[NOS]=TOS;TOS=dpila[NOS-1];break;//OVER
	case 22:NOS++;dpila[NOS]=TOS;TOS=dpila[NOS-2];break;//PICK2
	case 23:NOS++;dpila[NOS]=TOS;TOS=dpila[NOS-3];break;//PICK3
	case 24:NOS++;dpila[NOS]=TOS;TOS=dpila[NOS-4];break;//PICK4
	case 25:W=dpila[NOS];dpila[NOS]=TOS;TOS=W;break;//SWAP
	case 26:NOS--;break; //NIP
	case 27:W=TOS;TOS=dpila[NOS-1];dpila[NOS-1]=dpila[NOS];dpila[NOS]=W;break;//ROT
	case 28:W=dpila[NOS];NOS++;dpila[NOS]=TOS;NOS++;dpila[NOS]=W;break;//DUP2
	case 29:NOS--;TOS=dpila[NOS];NOS--;break;//DROP2
	case 30:NOS-=2;TOS=dpila[NOS];NOS--;break;//DROP3
	case 31:NOS-=3;TOS=dpila[NOS];NOS--;break;//DROP4
	case 32:NOS++;dpila[NOS]=TOS;TOS=dpila[NOS-3];NOS++;dpila[NOS]=TOS;TOS=dpila[NOS-3];break;//OVER2
	case 33:W=dpila[NOS];dpila[NOS]=dpila[NOS-2];dpila[NOS-2]=W;W=TOS;TOS=dpila[NOS-1];dpila[NOS-1]=W;break;//SWAP2
	case 34:RTOS++;rpila[RTOS]=TOS;TOS=dpila[NOS];NOS--;break;//>r
	case 35:NOS++;dpila[NOS]=TOS;TOS=rpila[RTOS];RTOS--;break;//r>
	case 36:NOS++;dpila[NOS]=TOS;TOS=rpila[RTOS];break;//ERRE
	case 37:rpila[RTOS]+=TOS;TOS=dpila[NOS];NOS--;break;//ERREM:
	case 38:NOS++;dpila[NOS]=TOS;TOS=mem[rpila[RTOS]];rpila[RTOS]+=4;break;//ERRFM
	case 39:mem[rpila[RTOS]]=TOS;TOS=dpila[NOS];NOS--;rpila[RTOS]+=4;break;//ERRSM
	case 40:RTOS--;break;//ERRDR
	case 41:TOS&=dpila[NOS];NOS--;break;//AND
	case 42:TOS|=dpila[NOS];NOS--;break;//OR
	case 43:TOS^=dpila[NOS];NOS--;break;//XOR
	case 44:TOS=~TOS;break;//NOT
	case 45:TOS=dpila[NOS]+TOS;NOS--;break;//SUMA
	case 46:TOS=dpila[NOS]-TOS;NOS--;break;//RESTA
	case 47:TOS=dpila[NOS]*TOS;NOS--;break;//MUL
	case 48:TOS=dpila[NOS]/TOS;NOS--;break;//DIV
	case 49:TOS=(dpila[NOS-1]*dpila[NOS])/TOS;NOS-=2;break;//MULDIV
	case 50:TOS=(dpila[NOS-1]*dpila[NOS])>>TOS;NOS-=2;break;//MULSHR
	case 51:W=dpila[NOS]%TOS;dpila[NOS]=dpila[NOS]/TOS;TOS=W;break;//DIVMOD
	case 52:TOS=dpila[NOS]%TOS;NOS--;break;//MOD
	case 53:W=(TOS>>31);TOS=(TOS+W)^W;break;//ABS
	case 54:TOS=isqrt32(TOS);break;//CSQRT
	case 55:TOS=iclz32(TOS);break;//CLZ
	case 56:TOS=(dpila[NOS-1]<<TOS)/dpila[NOS];NOS-=2;break;//CDIVSH
	case 57:TOS=-TOS;break;//NEG
	case 61:TOS>>=1;break;//DIV2
	case 62:TOS<<=1;break;//MUL2
	case 63:TOS=dpila[NOS]<<TOS;NOS--;break;//SHL
	case 64:TOS=dpila[NOS]>>TOS;NOS--;break;//SHR
	case 65:TOS=mem.getInt32(TOS);break;//FECH
	case 66:TOS=mem.getInt8(TOS);break;//CFECH
	case 67:TOS=mem.getInt16(TOS);break;//WFECH
	case 68:W=dpila[NOS];mem[TOS]=W&0xff;mem[TOS+1]=(W>>8)&0xff;mem[TOS+2]=(W>>16)&0xff;mem[TOS+3]=(W>>24)&0xff;
			NOS--;TOS=dpila[NOS];NOS--;break;//STOR
	case 69:mem[TOS]=dpila[NOS];NOS--;TOS=dpila[NOS];NOS--;break;//CSTOR
	case 70:W=dpila[NOS];mem[TOS]=W&0xff;mem[TOS+1]=(W>>8)&0xff;NOS--;TOS=dpila[NOS];NOS--;break;//WSTOR
	}
}

function r3run()
{
	w=tok[ip];
	while (w!=0) {
		r3op(w&0x7f);
		w>>=8;
		}
	if (w==0) return;
	ip++;

}

code="1 2 3 + -";
r3tokenizer(code);
console.info(code);
