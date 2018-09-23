/* r3tokenizer 2018
GPITTAU PHREDA 
*/
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

var tok;
var nro=0;
var bas=0;
var wor=0;

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
}

code="1 2 3 + -";
r3tokenizer(code);
console.info(code);
