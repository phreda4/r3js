/* r3tokenizer 2018
GPITTAU PHREDA 
*/

var dicc=[];
var dicca=[];
var dicci=[];
var ndicc=0;

var memc=0;
var memcode=new Int32Array(0xffff); // 256kb
var memd=0;
var memdata=new Int8Array(0xfffff); // 1Mb

/*
i0 i: i:: i# i: i| i^		| 0 1 2 3 4 5 6
idec ihex ibin ifix istr    | 7 8 9 a b
iwor ivar idwor idvar		| c d e f
*/
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

var tok;
var nro = 0;

function isNro(tok) { 
	nro=tok.match(/^([0-9]+([\.][0-9]+)?)$/); // falta $hexa y %binario
	if (nro===null) { return false; }
	nro=Number(nro[1]);	// ojo, punto fijo, no flotante
	return true;  
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

//-------------------------------------
// V2 tokenizer
// modo oscurantista
//-------------------------------------
var nro=0;
var modo=0; // 0-imm 1-code 2-data
var level=0;
var boot=-1;

function error() {}

function codetok(nro) { 
if (modo==0 && boot==-1) { boot=memc; }
memcode[memc++]=nro; 
}

function datanro(nro) { // debe haber una mejor forma o no
memdata[memd++]=nro&0xff;memdata[memd++]=(nro>>8)&0xff;
memdata[memd++]=(nro>>16)&0xff;memdata[memd++]=(nro>>24)&0xff; 
}

function datasave(str) { 
for(var i=0;i<str.length;i++)
	memdata[memd++]=str.charCodeAt(i);
memdata[memd++]=0;
}

function compilaSTR(str) {
ini=datasave(str.slice(1,str.length-1));	
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
if (modo==2) { datanro(n);return; }
codetok((n<<7)+13); 
}

function compilaLIT(n) {
if (modo==2) { datanro(n);return; }
codetok((n<<7)+7); // falta
}

function compilaMAC(n) {
/*
if (n==1) {} //(
if (n==2) {} //)
if (n==3) {} //[
if (n==4) {} //]
*/
codetok(n+16);	
if (n==0) { if (level==0) { modo=0; } } //;
}

function compilaWORD(n) {
	
codetok((n<<7)+12);
}

function tokenizer2(str) {
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
//		now++;while (str.charCodeAt(now)!=43) { now++; } now++;

		compilaSTR(str.slice(ini,now));
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

var ip;
var TOS=0;
var NOS=0;
var RTOS=0;
var dpila=new Int32Array(256);//Float64Array
var rpila=new Int32Array(256);//Float64Array con cast?

function r3op(op) {
while(op!=0) {
	switch(op&0x7f) {
		case 7: NOS++;dpila[NOS]=TOS;TOS=op>>7;op>>=16;break;//LIT9
		case 8: NOS++;dpila[NOS]=TOS;TOS=op>>7;op=0;break;//LITres
		case 9: NOS++;dpila[NOS]=TOS;TOS=-(op>>7);op=0;break;//LITreg neg
		case 10: NOS++;dpila[NOS]=TOS;TOS=memcode(op>>7);op=0;break;//LITcte
		case 11: NOS++;dpila[NOS]=TOS;TOS=op>>7;op=0;break;//str
		case 12: RTOS++;rpila[RTOS]=ip;ip=op>>7;op=0;break;// call
		case 13: NOS++;dpila[NOS]=TOS;TOS=memcode[op>>7];op=0;break;//ADR
		case 14: NOS++;dpila[NOS]=TOS;TOS=prog.getInt32(ip);ip+=4;break;//DWoRD
		case 15: NOS++;dpila[NOS]=TOS;TOS=prog.getInt32(ip);ip+=4;break;//DVAR
		case 16: ip=rpila[RTOS];RTOS--;op=0;break; // ;
		case 17: 
		case 18: ip=prog.getInt32(ip);break;//JMP
		case 19:
		case 20: ip+=prog.getInt8(ip);break;//JMPR
		case 21: W=TOS;TOS=dpila[NOS];NOS--;RTOS++;rpila[RTOS]=ip;ip=W;break;//EX
		case 22: if (TOS!=0) {ip+=(op>>7);}; break;//ZIF
		case 23: if (TOS==0) {ip+=(op>>7);}; break;//UIF
		case 24: if (TOS<=0) {ip+=(op>>7);}; break;//PIF
		case 25: if (TOS>=0) {ip+=(op>>7);}; break;//NIF
		case 26: if (TOS!=dpila[NOS]) {ip+=(op>>7);} TOS=dpila[NOS];NOS--;break;//IFN
		case 27: if (TOS==dpila[NOS]) {ip+=(op>>7);} TOS=dpila[NOS];NOS--;break;//IFNO
		case 28: if (TOS<=dpila[NOS]) {ip+=(op>>7);} TOS=dpila[NOS];NOS--;break;//IFL
		case 29: if (TOS>=dpila[NOS]) {ip+=(op>>7);} TOS=dpila[NOS];NOS--;break;//IFG
		case 30: if (TOS<dpila[NOS]) {ip+=(op>>7);} TOS=dpila[NOS];NOS--;break;//IFLE
		case 31: if (TOS>dpila[NOS]) {ip+=(op>>7);} TOS=dpila[NOS];NOS--;break;//IFGE
		case 32: if (!(TOS&dpila[NOS])) {ip+=(op>>7);} TOS=dpila[NOS];NOS--;break;//IFAND
		case 33: if (TOS&dpila[NOS]) {ip+=(op>>7);} TOS=dpila[NOS];NOS--;break;//IFNAND
		case 34: if (TOS<=dpila[NOS]&&dpila[NOS]<=dpila[NOS]) {ip+=(op>>7);} TOS=dpila[NOS-1];NOS-=2;break;//BETWEEN

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
		case 52:NOS++;dpila[NOS]=TOS;TOS=rpila[RTOS];break;//ERRE
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
		case 76: TOS=memdata[TOS];break;//FECH+
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
op>>=8;}
}


//var memc=0;
function r3reset(){
	TOS=0;
	NOS=0;
	RTOS=0;
	ip=boot;
}

function r3step() {
	r3op(memcode[ip++]);
	if (ip==0) { r3reset(); }
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

function printmr3(tok)
{
if ((tok&0x7f)>15) { return r3base[(tok&0x7f)-16]; }
return r3machine[(tok&0x7f)-16];
}
