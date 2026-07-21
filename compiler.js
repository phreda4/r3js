/* r3www 2018 - GPITTAU PHREDA */
"use strict";

/*------COMPILER------*/

// 0-imm 1-code 2-data 3-reserve 4-bytes 5-qwords
var modo=0; 

var includes=[];	// nombre del include

var dicc=[];		// nombre palabra
var dicca=[];		// direccion de entrada
var dicci=[];		// info
var dicclocal;

var level=0;
var stacka=[];

var nerror=0;	
var lerror=0;
var cerror=0;
var werror="";

var boot=-1;
var nro=0;

var memc=0;
var memcode=new Int32Array(0xffff); // 256kb

var memd=0;
var meminidata=0;
//var memdata=new ArrayBuffer(0xfffffff); // 256Mb
var memdata=new ArrayBuffer(0xffffff); // 16Mb
var mem=new DataView(memdata);

var r3echo="";
var r3domx=-1;
var r3showx=-1;

var sw,sh;
var xm=0;
var ym=0;
var bm=0;

var ke=0;
var kc=0;

var r3machine=[
"nop",":","::","#","##","|","^",	// 6
"","","","","str",		// 11
"call","var","dcode","ddata",		// 15
";","jmp","jmpw","[","]"
];
var r3base=[
";","(",")","[","]","EX","0?","1?","+?","-?",				// 10
"<?",">?","=?",">=?","<=?","<>?","AND?","NAND?","IN?",		// 19
"DUP","DROP","OVER","PICK2","PICK3","PICK4","SWAP","NIP",	// 27
"ROT","-ROT","2DUP","2DROP","3DROP","4DROP","2OVER","2SWAP",	// 35
">R","R>","R@",												// 38
"AND","OR","XOR","NAND",									// 42
"+","-","*","/",											// 46
"<<",">>",">>>",											// 49
"MOD","/MOD","*/","*>>","<</",								// 54
"NOT","NEG","ABS","SQRT","CLZ",							// 59
"@","C@","W@","D@", 										// 63
"@+","C@+","W@+","D@+", 									// 67
"!","C!","W!","D!", 										// 71
"!+","C!+","W!+","D!+", 									// 75
"+!","C+!","W+!","D+!", 									// 79
">A","A>","A+",											// 82
"A@","A!","A@+","A!+",										// 86
"CA@","CA!","CA@+","CA!+",									// 90
"DA@","DA!","DA@+","DA!+",									// 94
">B","B>","B+",											// 97
"B@","B!","B@+","B!+",										// 101
"CB@","CB!","CB@+","CB!+",									// 105
"DB@","DB!","DB@+","DB!+",									// 109
"AB[","]BA",												// 111
"MOVE","MOVE>","FILL",										// 114
"CMOVE","CMOVE>","CFILL",									// 117
"DMOVE","DMOVE>","DFILL",									// 120
"MEM",														// 121
"SYSCALL","SYSMEM",										// 123
0 ];

function isNro(tok) { 
	let sign;
	if (tok[0]=="-") { tok=tok.slice(1);sign=-1; } else { sign=1;}
	nro=tok.match(/^\d+$/); // integer
	if (nro!=null) { nro=parseInt(tok)*sign;return true; }
	nro=tok.match(/^\d+.\d+$/); // fixed.point
	if (nro!=null) { 
		var n=tok.split(".");
		var n1=parseInt(n[0]),v=1;
		for (let i=0;i<n[1].length;i++) { v*=10; }
		var n2=0x10000*parseInt(n[1])/v;
		nro=((n1<<16)|(n2&0xffff))*sign;
		return true; 
		}
	switch (tok[0]) {
	case "$":	// $hex
		tok=tok.split('.').join('0');		// convert . or 0
		tok=tok.slice(1);nro=tok.match(/^[0-9A-F]+$/);
		if (nro!=null) { nro=parseInt(tok,16)*sign;return true; }; 
		break;
	case "%":  // %bin %..1.1 allow
		tok=tok.split('.').join('0');		// convert . or 0
		tok=tok.slice(1);nro=tok.match(/^[0-1]+$/); 
		if (nro!=null) { nro=parseInt(tok,2)*sign;return true; }; 
		break;
	}
	return false;
}

function isBas(tok) { 
	nro=r3base.indexOf(tok);
	if (nro<0) { return false; }
	return true;
	}

function isWord(tok) { let i=dicc.length;
	while (i--) { if (dicc[i]===tok && ((dicci[i]&1)==1 || i>=dicclocal)) { break; } }
	return i;
	}

function codetok(nro) { 
	memcode[memc++]=nro; 
	}

function datanro(nro) { 
	switch(modo){
		case 2:mem.setInt32(memd,nro);memd+=4;break;
		case 3:for(let i=0;i<nro;i++) { mem.setInt8(memd++,0); };break;
		case 4:mem.setInt8(memd,nro);memd+=1;break;
		case 5:mem.setInt64(memd,nro);memd+=8;break;
		}
	}

function datasave(str) { let r=memd;
	for(let i=0;i<str.length;i++) 
		{ if (str.charCodeAt(i)==34) {i++;} mem.setInt8(memd++,str.charCodeAt(i)); }
	mem.setInt8(memd++,0);	
	return r;
	}
	
function datastr(n) { let s="";
	while (mem.getInt8(n)!=0) { s+=String.fromCharCode(mem.getInt8(n++)); }
	return s;
	}

function closevar() {
	if (dicc.length==0) { return; }
	if ((dicci[dicc.length-1]&0x10)==0) { return; } // prev is var
	if (dicca[dicc.length-1]<memd) { return; } // have val
	mem.setInt32(memd,0);memd+=4;
}

function compilaDATA(name) { let ex=0;
	closevar();
	if (name[1]=="#") { ex=1; }
	dicc.push(name.slice(ex+1,name.length).toUpperCase());
	dicca.push(memd);
	dicci.push(ex+0x10);	// 0x10 es dato
	modo=2;
	}

function dataMAC(n){
	if (n==44) {modo=3;} // * reserva bytes
	if (n==1) {modo=4;} // (	bytes
	if (n==2) {modo=2;} // )
	if (n==3) {modo=5;} // [	qwords
	if (n==4) {modo=2;} // ]
	}
	
function compilaCODE(name) { let ex=0;
	closevar();
	if (name[1]==":") { ex=1; }
	if (name==":") { boot=memc; }
	dicc.push(name.slice(ex+1,name.length).toUpperCase());
	dicca.push(memc);
	dicci.push(ex);
	modo=1;	
	}

function compilaADDR(n) {
	if (modo>1) { datanro(dicca[n]);return; }
	codetok((dicca[n]<<8)+14+((dicci[n]>>4)&1)); 
	}

function compilaLIT(n) {
	if (modo>1) { datanro(n);return; }
	if (n==(n<<7)>>7) { // un bit mas por signo (token 8 y 9), ahora opcode ocupa 8 bits
		codetok((n<<8)+8);
		return;
		} 
	codetok((n&0xffffff00)+9); // falta cte en mem
	codetok(((n&0xff)<<8)+10); // falta cte en mem	
	}

function compilaSTR(str) {
	let ini=datasave(str);	
	if (modo<2) {codetok((ini<<8)+11);}
	}
	

function blockIn(){
	stacka.push(memc);
	level++;
	}

function solvejmp(from,to) {
	let whi=false;
	for (let i=from;i<to;i++) {
		let op=memcode[i]&0xff;
		if (op>21 && op<35 && (memcode[i]>>8)==0) {
			memcode[i]+=(memc-i)<<8;	// patch while
			whi=true;
			}
		}
	return whi;
	}

function blockOut(){
	let from=stacka.pop();
	let dist=memc-from;
	if (solvejmp(from,memc)) { // salta
		codetok((-(dist+1)<<8)+18); 	// jmpr
	} else {
		memcode[from-1]+=(dist<<8);		// patch if
	}
	level--;
	}

function compilaMAC(n) {
	if(modo>1) { dataMAC(n);return; }
	if (n==1) { blockIn();return; }		//(	etiqueta
	if (n==2) { blockOut();return; }	//)	salto
	if (n==3) { anonIn();return; }		//[	salto:etiqueta
	if (n==4) { anonOut();return; }		//]	etiqueta;push
	codetok(n+16);	
	if (n==0) { if (level==0) {modo=0;} } // ;
	}

function compilaWORD(n) {
	if (modo>1) { datanro(n);return; }
	codetok((dicca[n]<<8)+12+((dicci[n]>>4)&1));
	}

function r3token(str) {

	level=0;
	let now=0;
	let ini;
	let ntoken;
	str=str.trim();
	while(now<str.length) {
		while (str.charCodeAt(now)<33) { now++; }
		if(str[now]==="^") {					// include
			ini=now;
			while (str.charCodeAt(now)>32) { now++; }
			continue;
			}
		if(str[now]==="|") {					// comments	
			now=str.indexOf("\n",now)+1;
			if (now<=0) { now=str.length;}
			continue; }

		if(str[now]=== "\"") {					// strings		
			ini=++now;
			while (str.charCodeAt(now)!=0) { 
				if (str[now]=== "\"") { if (str[now+1]!="\"") { break; } now++; }
				now++; }	
			compilaSTR(str.slice(ini,now));
			now+=2;
		} else {
			ini=now;
			while (str.charCodeAt(now)>32) { now++; }
			ntoken=str.slice(ini,now);
			switch (ntoken.charCodeAt(0)) {	// genera tokens
				case 0x3A:// $3a :  Definicion	// :CODE
					compilaCODE(ntoken);break;
				case 0x23:// $23 #  Variable	// #DATA
					compilaDATA(ntoken);break;	
				case 0x27:// $27 ' Direccion	// 'ADR
					ntoken=ntoken.substr(1).toUpperCase();
					nro=isWord(ntoken);if (nro<0) { error(str,now);return 2; }			
					compilaADDR(nro);break;		
				default:
					ntoken=ntoken.toUpperCase();
					if (isNro(ntoken)) { compilaLIT(nro);break; }
					if (isBas(ntoken)) { compilaMAC(nro);break; }
					nro=isWord(ntoken);if (nro<0) { error(str,now);return 1; }
					if (modo==2) { compilaADDR(nro);break; }
					compilaWORD(nro);
					break;
				}
			}		
		}	        
	if (memcode[memc-1]!=16) { memcode[memc++]=16; } // last;
	return 0;
	}


function r3includes(str) {
	let now=0;
	let ini;	
	str=str.trim();
	while(now<str.length) {
		while (str.charCodeAt(now)<33) { now++; }
		if(str[now]==="^") {					// include
			ini=++now;
			while (str.charCodeAt(now)>32) { now++; }
			var name=str.slice(ini,now);
			if (includes.indexOf(name)==-1) {
				//if (sessionStorage.getItem(name)=null) return;
				r3includes(sessionStorage.getItem(name));
				includes.push(name); 
				}
			continue;
			}
		if(str[now]==="|") {					// comments	
			now=str.indexOf("\n",now)+1;
			if (now<=0) { now=str.length;}
			continue; }
		if(str[now]=== "\"") {					// strings		
			ini=++now;
			while (str.charCodeAt(now)!=0) { 
				if (str[now]=== "\"") { if (str[now+1]!="\"") { break; } now++; }
				now++; }	
			now+=2;
		} else {
			ini=now;
			while (str.charCodeAt(now)>32) { now++; }
			}
		}
	}


function r3compile(str) {	
	includes=[]
	
// load includes
	r3includes(str);

	canvasini();
	
	dicc=[]
	dicca=[]
	dicci=[]
	dicclocal=0;
	
	boot=-1

	memc=1;
	memd=meminidata;
	
// tokenize
	for (let i=0;i<includes.length;i++) {
		if (r3token(sessionStorage.getItem(includes[i]))) return nerror;
		dicclocal=dicc.length;
		}
	
// last tokenizer		
	if (r3token(str)!=0) return nerror;
	return -1;
	}

function r3copilewi(str) {
	dicc=[]
	dicca=[]
	dicci=[]
	
	boot=-1

	memc=1;
	memd=meminidata;
	
// last tokenizer		
	if (r3token(str)!=0) return nerror;
	return -1;
	
  }
	
function error(str,now) {
	nerror=now;
	let n2=now;
	let n1=now-1;
	while (n1>0 && str.charCodeAt(n1)>32) {n1--;}
	
	lerror=0;
	for(let i=0;i<now;i++){ if(str[i]=="\n"||str[i]=="\r") {lerror++;i++;cerror=i;if (str[i]=="\n"||str[i]=="\r") { i++; } } }
	cerror=now-cerror;
	
	werror=str.slice(n1,n2).trim();
	}

/*------RUNER------*/
var TOSEX=0;
var stack=new Int32Array(256); 

//---------------------------//
// TOS..DSTACK--> <--RSTACK  //
//---------------------------//
function runr3(adr) {
  let ip=adr|0;
  let TOS=0,NOS=0;
  let REGA=0,REGB=0;
  let RTOS=255;
  stack[255]=0;
  let op=0,W=0,W1=0; 
  while(ip!=0) { 
   op=memcode[ip++]; 
	switch(op&0xff){
	case 7: NOS++;stack[NOS]=TOS;TOS=(op<<15)>>23;break;		// LIT9 (opcode 8bit + literal 9bit con signo)
	case 8: NOS++;stack[NOS]=TOS;TOS=op>>8;break;				// LITres
	case 9: NOS++;stack[NOS]=TOS;TOS=(op&0xffffff00);break;		// LIT1
	case 10:TOS|=(op>>8)&0xff;break;		// LIT2
	case 11:NOS++;stack[NOS]=TOS;TOS=op>>8;break;				// STR
	case 12:RTOS--;stack[RTOS]=ip;ip=op>>8;break;				// CALL
	case 13:NOS++;stack[NOS]=TOS;TOS=mem.getInt32(op>>8);break;	// VAR
	case 14:NOS++;stack[NOS]=TOS;TOS=op>>8;break;				// DWORD
	case 15:NOS++;stack[NOS]=TOS;TOS=op>>8;break;				// DVAR
	case 16:ip=stack[RTOS];RTOS++;break; 						// ;
	case 17:ip=(op>>8);break;//JMP
	case 18:ip+=(op>>8);break;//JMPR
	case 19:break;
	case 20:break;
	case 21:W=TOS;TOS=stack[NOS];NOS--;RTOS--;stack[RTOS]=ip;ip=W;break;//EX

	case 22:if (TOS!=0) {ip+=(op>>8);}; break;//ZIF	0?
	case 23:if (TOS==0) {ip+=(op>>8);}; break;//UIF	1?
	case 24:if (TOS<0) {ip+=(op>>8);}; break;//PIF		+?
	case 25:if (TOS>=0) {ip+=(op>>8);}; break;//NIF	-?

	case 26:if (TOS<stack[NOS]) {ip+=(op>>8);} TOS=stack[NOS];NOS--;break;//<?
	case 27:if (TOS>stack[NOS]) {ip+=(op>>8);} TOS=stack[NOS];NOS--;break;//>?
	case 28:if (TOS!=stack[NOS]) {ip+=(op>>8);} TOS=stack[NOS];NOS--;break;//=?
	case 29:if (TOS>=stack[NOS]) {ip+=(op>>8);} TOS=stack[NOS];NOS--;break;//>=?
	case 30:if (TOS<=stack[NOS]) {ip+=(op>>8);} TOS=stack[NOS];NOS--;break;//<=?
	case 31:if (TOS==stack[NOS]) {ip+=(op>>8);} TOS=stack[NOS];NOS--;break;//<>?
	case 32:if (!(TOS&stack[NOS])) {ip+=(op>>8);} TOS=stack[NOS];NOS--;break;//AND?
	case 33:if (TOS&stack[NOS]) {ip+=(op>>8);} TOS=stack[NOS];NOS--;break;//NAND?
	case 34:if (TOS<=stack[NOS]&&stack[NOS]<=stack[NOS]) {ip+=(op>>8);} 
				TOS=stack[NOS-1];NOS-=2;break;//IN? (need bit trick)

	case 35:NOS++;stack[NOS]=TOS;break;						//DUP
	case 36:TOS=stack[NOS];NOS--;break;						//DROP
	case 37:NOS++;stack[NOS]=TOS;TOS=stack[NOS-1];break;	//OVER
	case 38:NOS++;stack[NOS]=TOS;TOS=stack[NOS-2];break;	//PICK2
	case 39:NOS++;stack[NOS]=TOS;TOS=stack[NOS-3];break;	//PICK3
	case 40:NOS++;stack[NOS]=TOS;TOS=stack[NOS-4];break;	//PICK4
	case 41:W=stack[NOS];stack[NOS]=TOS;TOS=W;break;		//SWAP
	case 42:NOS--;break; 									//NIP
	case 43:W=TOS;TOS=stack[NOS-1];stack[NOS-1]=stack[NOS];stack[NOS]=W;break;//ROT
	case 44:W=TOS;TOS=stack[NOS];stack[NOS]=stack[NOS-1];stack[NOS-1]=W;break;//-ROT

	case 45:W=stack[NOS];NOS++;stack[NOS]=TOS;NOS++;stack[NOS]=W;break;//2DUP
	case 46:NOS--;TOS=stack[NOS];NOS--;break;				//2DROP
	case 47:NOS-=2;TOS=stack[NOS];NOS--;break;				//3DROP
	case 48:NOS-=3;TOS=stack[NOS];NOS--;break;				//4DROP
	case 49:NOS++;stack[NOS]=TOS;TOS=stack[NOS-3];
			NOS++;stack[NOS]=TOS;TOS=stack[NOS-3];break;	//2OVER
	case 50:W=stack[NOS];stack[NOS]=stack[NOS-2];stack[NOS-2]=W;
			W=TOS;TOS=stack[NOS-1];stack[NOS-1]=W;break;	//2SWAP

	case 51:RTOS--;stack[RTOS]=TOS;TOS=stack[NOS];NOS--;break;	//>R
	case 52:NOS++;stack[NOS]=TOS;TOS=stack[RTOS];RTOS++;break;	//R>
	case 53:NOS++;stack[NOS]=TOS;TOS=stack[RTOS];break;			//R@

	case 54:TOS&=stack[NOS];NOS--;break;					//AND
	case 55:TOS|=stack[NOS];NOS--;break;					//OR
	case 56:TOS^=stack[NOS];NOS--;break;					//XOR
	case 57:TOS=~(stack[NOS]&TOS);NOS--;break;				//NAND

	case 58:TOS=stack[NOS]+TOS;NOS--;break;					//+
	case 59:TOS=stack[NOS]-TOS;NOS--;break;					//-
	case 60:TOS=stack[NOS]*TOS;NOS--;break;					//*
	case 61:TOS=(stack[NOS]/TOS)|0;NOS--;break;				//DIV

	case 62:TOS=stack[NOS]<<TOS;NOS--;break;				//<<
	case 63:TOS=stack[NOS]>>TOS;NOS--;break;				//>>
	case 64:TOS=stack[NOS]>>>TOS;NOS--;break;				//>>>

	case 65:TOS=stack[NOS]%TOS;NOS--;break;					//MOD
	case 66:W=stack[NOS]%TOS;stack[NOS]=(stack[NOS]/TOS)|0;TOS=W;break;//DIVMOD
	case 67:TOS=((stack[NOS-1]*stack[NOS])/TOS)|0;NOS-=2;break;	//*/
	case 68:TOS=(stack[NOS-1]*stack[NOS])>>TOS;NOS-=2;break;//*>>
	case 69:TOS=((stack[NOS-1]<<TOS)/stack[NOS])|0;NOS-=2;break;//<</

	case 70:TOS=~TOS;break;									//NOT
	case 71:TOS=-TOS;break;									//NEG
	case 72:W=(TOS>>31);TOS=(TOS+W)^W;break;				//ABS
	case 73:TOS=Math.sqrt(TOS)|0;break;						//SQRT
	case 74:TOS=Math.clz32(TOS);break;						//CLZ

	case 75:TOS=mem.getInt32(TOS);break;//@ (64bit en spec; placeholder 32bit, TOS es Number no BigInt)
	case 76:TOS=mem.getInt8(TOS);break;//C@ (8bit)
	case 77:TOS=mem.getInt16(TOS);break;//W@ (16bit)
	case 78:TOS=mem.getInt32(TOS);break;//D@ (32bit)

	case 79:NOS++;stack[NOS]=TOS+4;TOS=mem.getInt32(TOS);break;//@+ (placeholder: avanza 4, ver nota @ )
	case 80:NOS++;stack[NOS]=TOS+1;TOS=mem.getInt8(TOS);break;//C@+
	case 81:NOS++;stack[NOS]=TOS+2;TOS=mem.getInt16(TOS);break;//W@+
	case 82:NOS++;stack[NOS]=TOS+4;TOS=mem.getInt32(TOS);break;//D@+

	case 83:mem.setInt32(TOS,stack[NOS]);NOS--;TOS=stack[NOS];NOS--;break;//! (placeholder 32bit)
	case 84:mem.setInt8(TOS,stack[NOS]);NOS--;TOS=stack[NOS];NOS--;break;//C!
	case 85:mem.setInt16(TOS,stack[NOS]);NOS--;TOS=stack[NOS];NOS--;break;//W!
	case 86:mem.setInt32(TOS,stack[NOS]);NOS--;TOS=stack[NOS];NOS--;break;//D!

	case 87:mem.setInt32(TOS,stack[NOS]);NOS--;TOS+=4;break;//!+ (placeholder)
	case 88:mem.setInt8(TOS,stack[NOS]);NOS--;TOS++;break;//C!+
	case 89:mem.setInt16(TOS,stack[NOS]);NOS--;TOS+=2;break;//W!+
	case 90:mem.setInt32(TOS,stack[NOS]);NOS--;TOS+=4;break;//D!+

	case 91:mem.setInt32(TOS,mem.getInt32(TOS)+stack[NOS]);NOS--;TOS=stack[NOS];NOS--;break;//+! (placeholder)
	case 92:mem.setInt8(TOS,mem.getInt8(TOS)+stack[NOS]);NOS--;TOS=stack[NOS];NOS--;break;//C+!
	case 93:mem.setInt16(TOS,mem.getInt16(TOS)+stack[NOS]);NOS--;TOS=stack[NOS];NOS--;break;//W+!
	case 94:mem.setInt32(TOS,mem.getInt32(TOS)+stack[NOS]);NOS--;TOS=stack[NOS];NOS--;break;//D+!

	case 95:REGA=TOS;TOS=stack[NOS];NOS--;break; //>A
	case 96:NOS++;stack[NOS]=TOS;TOS=REGA;break; //A>
	case 97:REGA+=TOS;TOS=stack[NOS];NOS--;break;//A+

	case 98:NOS++;stack[NOS]=TOS;TOS=mem.getInt32(REGA);break;//A@
	case 99:mem.setInt32(REGA,TOS);TOS=stack[NOS];NOS--;break;//A!
	case 100:NOS++;stack[NOS]=TOS;TOS=mem.getInt32(REGA);REGA+=4;break;//A@+
	case 101:mem.setInt32(REGA,TOS);TOS=stack[NOS];NOS--;REGA+=4;break;//A!+

	case 102:NOS++;stack[NOS]=TOS;TOS=mem.getInt8(REGA);break;//CA@
	case 103:mem.setInt8(REGA,TOS);TOS=stack[NOS];NOS--;break;//CA!
	case 104:NOS++;stack[NOS]=TOS;TOS=mem.getInt8(REGA);REGA+=1;break;//CA@+
	case 105:mem.setInt8(REGA,TOS);TOS=stack[NOS];NOS--;REGA+=1;break;//CA!+

	case 106:NOS++;stack[NOS]=TOS;TOS=mem.getInt32(REGA);break;//DA@ (placeholder 32bit, spec=64)
	case 107:mem.setInt32(REGA,TOS);TOS=stack[NOS];NOS--;break;//DA!
	case 108:NOS++;stack[NOS]=TOS;TOS=mem.getInt32(REGA);REGA+=4;break;//DA@+
	case 109:mem.setInt32(REGA,TOS);TOS=stack[NOS];NOS--;REGA+=4;break;//DA!+

	case 110:REGB=TOS;TOS=stack[NOS];NOS--;break; //>B
	case 111:NOS++;stack[NOS]=TOS;TOS=REGB;break; //B>
	case 112:REGB+=TOS;TOS=stack[NOS];NOS--;break;//B+

	case 113:NOS++;stack[NOS]=TOS;TOS=mem.getInt32(REGB);break;//B@
	case 114:mem.setInt32(REGB,TOS);TOS=stack[NOS];NOS--;break;//B!
	case 115:NOS++;stack[NOS]=TOS;TOS=mem.getInt32(REGB);REGB+=4;break;//B@+
	case 116:mem.setInt32(REGB,TOS);TOS=stack[NOS];NOS--;REGB+=4;break;//B!+

	case 117:NOS++;stack[NOS]=TOS;TOS=mem.getInt8(REGB);break;//CB@
	case 118:mem.setInt8(REGB,TOS);TOS=stack[NOS];NOS--;break;//CB!
	case 119:NOS++;stack[NOS]=TOS;TOS=mem.getInt8(REGB);REGB+=1;break;//CB@+
	case 120:mem.setInt8(REGB,TOS);TOS=stack[NOS];NOS--;REGB+=1;break;//CB!+

	case 121:NOS++;stack[NOS]=TOS;TOS=mem.getInt32(REGB);break;//DB@ (placeholder 32bit, spec=64)
	case 122:mem.setInt32(REGB,TOS);TOS=stack[NOS];NOS--;break;//DB!
	case 123:NOS++;stack[NOS]=TOS;TOS=mem.getInt32(REGB);REGB+=4;break;//DB@+
	case 124:mem.setInt32(REGB,TOS);TOS=stack[NOS];NOS--;REGB+=4;break;//DB!+

	case 125:RTOS--;stack[RTOS]=REGA;RTOS--;stack[RTOS]=REGB;break;	//AB[ push A,B a RSTACK (B queda en el tope)
	case 126:REGB=stack[RTOS];RTOS++;REGA=stack[RTOS];RTOS++;break;	//]BA pop RSTACK a B,A (B primero, luego A)

	case 127://MOVE (placeholder 32bit, spec=64bit words)
		W=stack[NOS-1];W1=stack[NOS];
		while (TOS--) { mem.setInt32(W,mem.getInt32(W1));W+=4;W1+=4; }
		NOS-=2;TOS=stack[NOS];NOS--;break;
	case 128://MOVE>
		W=stack[NOS-1]+(TOS<<2);W1=stack[NOS]+(TOS<<2);
		while (TOS--) { W-=4;W1-=4;mem.setInt32(W,mem.getInt32(W1)); }
		NOS-=2;TOS=stack[NOS];NOS--;break;
	case 129://FILL
		W1=stack[NOS-1];W=stack[NOS];
		while (TOS--) { mem.setInt32(W,W1);W+=4; }
		NOS-=2;TOS=stack[NOS];NOS--;break;
	case 130://CMOVE
		W=stack[NOS-1];W1=stack[NOS];
		while (TOS--) { mem.setInt8(W,mem.getInt8(W1));W++;W1++; }
		NOS-=2;TOS=stack[NOS];NOS--;break;
	case 131://CMOVE>
		W=stack[NOS-1]+TOS;W1=stack[NOS]+TOS;
		while (TOS--) { W--;W1--;mem.setInt8(W,mem.getInt8(W1)); }
		NOS-=2;TOS=stack[NOS];NOS--;break;
	case 132://CFILL
		W1=stack[NOS-1];W=stack[NOS];
		while (TOS--) { mem.setInt8(W,W1);W++; }
		NOS-=2;TOS=stack[NOS];NOS--;break;
	case 133://DMOVE (32bit words)
		W=stack[NOS-1];W1=stack[NOS];
		while (TOS--) { mem.setInt32(W,mem.getInt32(W1));W+=4;W1+=4; }
		NOS-=2;TOS=stack[NOS];NOS--;break;
	case 134://DMOVE>
		W=stack[NOS-1]+(TOS<<2);W1=stack[NOS]+(TOS<<2);
		while (TOS--) { W-=4;W1-=4;mem.setInt32(W,mem.getInt32(W1)); }
		NOS-=2;TOS=stack[NOS];NOS--;break;
	case 135://DFILL
		W1=stack[NOS-1];W=stack[NOS];
		while (TOS--) { mem.setInt32(W,W1);W+=4; }
		NOS-=2;TOS=stack[NOS];NOS--;break;

	case 136:NOS++;stack[NOS]=TOS;TOS=memd;break;//MEM (revisar semantica exacta vs .c)

	case 137:systemcall(TOS,stack[NOS]);TOS=stack[NOS-1];NOS-=2;break; //SYSCALL | nro int --
	case 138:TOS=systemmem(TOS);break;//SYSMEM | nro -- ini
	}
   }
  NOS++;stack[NOS]=TOS;
  TOSEX=NOS;
  }
	

function systemcall(TOS,NOS) {
	switch(TOS) {
	case 0:r3echo+=datastr(NOS);break;	// "hola" 0 systemcall // echo
	case 1:r3domx=NOS;break;
	case 2:r3showx=NOS;animate();break;	
		}
	}
	
var date=new Date();
	
function systemmem(TOS)	{
	switch(TOS) {
	// graphics
	case 0:return 0;				// VFRAME
	case 1:return canvas.width;		// sw
	case 2:return canvas.height;	// sh
	// time
	case 3:return Date.now();		// msec
	case 4:return (date.getFullYear()<<16)+(date.getMonth()<<8)+date.getDay();		// y-m-d 0000-00-00
	case 5:return (date.getHours()<<16)+(date.getMinutes()<<8)+date.getSeconds();		// h:m:s .. 00:00:00
	// keyboard
	case 6:return ke;
	case 7:return kc;
	// miqui maus
	case 8:return ym<<16|xm;
	case 9:return bm;
	// mem
	case 10:return memd;
		}
	}	
	
 
		
//---------------------------------------	
function r3reset(){
	r3domx=-1;
	r3showx=-1
	r3echo="";
	}

	
/*------CANVAS------*/
var canvas;
var ctx;
var imageData;
var buf8;

function getMouse(e) {
  const rect = canvas.getBoundingClientRect();
  xm=(e.clientX - rect.left) / (rect.right - rect.left) * canvas.width;
  ym=(e.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height;
  }
  
/*  
  window.addEventListener('resize', Resize, false);
// to suppress oncontextmenu because it blocks a mouseup when two buttons are pressed and 
// the right-mouse button is released before the other button.
//	canvas.addEventListener('contextmenu',function(e) { return false; }, false);	
*/  

function getWindowStyleButton(e){ let button = 0;
  if (e) {
	if (e.button === 0) button = 1;
	else if (e.button === 1) button = 4;
	else if (e.button === 2) button = 2;  
  } else if (window.event){ button = window.event.button; }
  return button;
  }
	
function DownMouse(e){ bm = bm | getWindowStyleButton(e); }
function UpMouse(e){ bm = bm ^ getWindowStyleButton(e); }

function eventIni() {	
	// event for var
	canvas.addEventListener('mousemove', getMouse, false);
	canvas.addEventListener('mouseenter', getMouse, false);	

	canvas.addEventListener('mousedown', DownMouse, false);
	canvas.addEventListener('mouseup', UpMouse, false);	

	document.addEventListener("keydown", function(event) { 
	
	ke=event.key;kc=event.code;
	//event.preventDefault(); 
	}, false);
	document.addEventListener("keyup", function(event) { 
	
	ke=event.key;kc=event.code;
	//event.preventDefault();  
	}, false);	
}

function eventRem() {
	canvas.removeEventListener('mousemove', getMouse, false);
	canvas.removeEventListener('mouseenter', getMouse, false);	

	canvas.removeEventListener('mousedown', DownMouse, false);
	canvas.removeEventListener('mouseup', UpMouse, false);	

	document.removeEventListener("keydown", function(event) { 
		ke=event.key;kc=event.code;
	//event.preventDefault(); 
	}, false);
	document.removeEventListener("keyup", function(event) { 
		ke=event.key;kc=0x10000|event.code;
	//event.preventDefault();  
	}, false);	
	
}

function canvasini() {
	canvas = document.getElementById('canvas');
	ctx = canvas.getContext('2d',{
		alpha:false,
		imageSmoothingEnabled:false,
		preserveDrawingBuffer:true
		});
	
	imageData=ctx.getImageData(0,0,canvas.width, canvas.height);
	
	buf8=new Uint8ClampedArray(memdata,0,imageData.data.length);
	
	meminidata=imageData.data.length;// dinamic???

	eventIni();
	}

function redraw() { 
	ctx.save();
	imageData.data.set(buf8);
/*	
//ctx.msImageSmoothingEnabled = false;
ctx.imageSmoothingEnabled = false;
ctx.scale(2,2);
ctx.drawImage(imageData,0,0);
*/
	ctx.putImageData(imageData,0,0); 
	ctx.restore();
	}


/*------DOM------*/
function domini() {
	document.getElementById('r3dom').innerHTML="DOM INI";
	r3domx=-1;
	}
	
function r3go(a) {	
	runr3(a);
	redom();
	}
	
function redom() {
	if (r3domx==-1) { return; }
	r3echo="";
	runr3(r3domx);
	document.getElementById('r3dom').innerHTML=r3echo;
	}

/*------SHOW------*/
var reqAnimFrame=
	window.mozRequestAnimationFrame||
	window.webkitRequestAnimationFrame||
	window.msRequestAnimationFrame||
	window.oRequestAnimationFrame||
        window.requestAnimationFrame ;     // for firefox (needed at least in Linux)

function animate() {
	if (r3showx!=-1) {
		reqAnimFrame(animate);		
		runr3(r3showx);
		redraw();
		}
	}
