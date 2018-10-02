/* r3www 20138 - GPITTAU PHREDA */
"use strict";


/*------COMPILER------*/

// 0-imm 1-code 2-data 3-reserve 4-bytes 5-qwords
var modo=0; 

var dicc=[];
var dicca=[];
var dicci=[];
var ndicc=0;

var level=0;
var stackbl=[];
var stacka=[];

var boot=-1;
var nro=0;

var memc=0;
var memcode=new Int32Array(0xffff); // 256kb

var memd=0;
var memdata=new ArrayBuffer(0xfffffff); // 256Mb
var mem=new DataView(memdata);

var r3machine=[
"nop",":","::","#","##","|","^",	// 6
"lit","lit","lit","lit","str",		// 11
"call","var","dcode","ddata",		// 15
";","jmp","jmpw","[","]"
];
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
		var n1=parseInt(n[0]),v=1;
		for (var i=0;i<n[1].length;i++) { v*=10; }
		//n2=parseInt("1"+n[1]);
		n2=0xffff*parseInt(n[1])/v;
		nro=(n1<<16)|(n2&0xffff);// falta
		return true; 
		}
	switch (tok[0]) {
	case "$":	// $hex
		tok=tok.slice(1);nro=tok.match(/^[0-9A-F]+$/);
		if (nro!=null) { nro=parseInt(tok,16);return true; }; 
		break;
	case "%":  // %bin %..1.1 allow
		tok=tok.split('.').join('0');		// convert . or 0
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

function isWord(tok) { var i=dicc.length;
	while (i--) { if (dicc[i]===tok) { break; } }
	return i;
	}


function codetok(nro) { 
	if (modo==0 && boot==-1) { boot=memc; }
	memcode[memc++]=nro; 
	}

function datanro(nro) { 
	switch(modo){
		case 2:mem.setInt32(memd,nro,true);memd+=4;break;
		case 3:memd+=nro;break;
		case 4:mem.setInt8(memd,nro);memd+=1;break;
		case 5:mem.setInt64(memd,nro);memd+=8;break;
		}
	if (modo==2) { mem.setInt32(memd,nro,true);memd+=4; }
	if (modo==3) { memd+=nro; }
	if (modo==4) { mem.setInt8(memd,nro);memd+=1; }
	if (modo==5) { mem.setInt64(memd,nro);memd+=8; }
	}

function datasave(str) { 
	for(var i=0;i<str.length;i++) { mem.setInt8(memd++,str.charCodeAt(i)); }
	mem.setInt8(memd++,0);	
	}


function compilaDATA(name) { var ex=0;
	if (name[1]=="#") { ex=1; }
	dicc.push(name.slice(ex+1,name.length).toUpperCase());
	dicca.push(memd);
	dicci.push(ex+0x10);	// 0x10 es dato
	modo=2;
	}

function dataMAC(n){
	if (n==45) {modo=3;} // * reserva bytes
	if (n==1) {modo=4;} // (	bytes
	if (n==2) {modo=2;} // )
	if (n==3) {modo=5;} // [	qwords
	if (n==4) {modo=2;} // ]
	}

	
function compilaCODE(name) { var ex=0;
	if (name[1]==":") { ex=1; }
	dicc.push(name.slice(ex+1,name.length).toUpperCase());
	dicca.push(memc);
	dicci.push(ex);
	modo=1;	
	}

function compilaADDR(n) {
	if (modo>1) { datanro(n);return; }
	codetok((n<<7)+13); 
	}

function compilaLIT(n) {
	if (modo>1) { datanro(n);return; }
	if (n>-257 && n<256) { codetok(((n<<7)&0xff8)+7);return; }
	if (n==(n<<6)>>6) { // un bit mas por signo (token 8 y 9)
		codetok((n<<7)+8+((n>>25)&1));
		return;
		} 
	codetok((n<<7)+10);
	}

function compilaSTR(str) {
	ini=datasave(str);	
	if (modo<2) {codetok((ini<<7)+11);}
	}
	

function blockIn(){
	stacka.push(memc);
	level++;
	}

function solvejmp(from,to) {
	var whi=false;
	for (var i=from;i<to;i++) {
		var op=memcode[i]&0x7f;
		if (op>21 && op<35 && (memcode[i]>>7)==0) {
			memcode[i]+=(memc-i)<<7;	// patch while
			whi=true;
			}
		}
	return whi;
	}

function blockOut(){
	var from=stacka.pop();
	var dist=memc-from;
	if (solvejmp(from,memc)) { // salta
		codetok((-(dist+1)<<7)+18); 	// jmpr
	} else {
		memcode[from-1]+=(dist<<7);		// patch if
	}
	level--;
	}

function compilaMAC(n) {
	if(modo>1) { dataMAC(n);return; }
	if (n==1) { blockIn();return; }		//(	etiqueta
	if (n==2) { blockOut();return; }	//)	salto
	if (n==3) { anonIn();return; }		//[	salto:etiqueta
	if (n==4) { annonOut();return; }	//]	etiqueta;push
	codetok(n+16);	
	if (n==0) { if (level==0) {modo=0;} } // ;
	}

function compilaWORD(n) {
	if (modo>1) { datanro(n);return; }
	codetok((dicca[n]<<7)+12+((dicci[n]>>4)&1));
	}

function r3token(str) {
	memc=1;
	memd=0;

	boot=-1;
	level=0;
	var now=0;
	var ini;
	var ntoken;
	str=str.trim();
	while(now<str.length) {
		while (str.charCodeAt(now)<33) { now++; }
		if(str[now]==="|") {					// comments	
			now=str.indexOf("\n",now)+1;
			if (now<0) { now=str.length;}
			continue; }

		if(str[now]=== "\"") {					// strings		
			ini=now;
			now=str.indexOf("\"",now+1)+1;
	//		now++;while(str.charCodeAt(now)!=43) { now++; } now++;
	
			compilaSTR(str.slice(ini+1,now-1));
			now++;
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
					ntoken=ntoken.substr(1);
					nro=isWord(ntoken);if (nro<0) { error();break; }			
					compilaADDR(nro);break;		
				default:
					ntoken=ntoken.toUpperCase();
					if (isNro(ntoken)) { 
						compilaLIT(nro);break; }
					if (isBas(ntoken)) { 
						compilaMAC(nro);break; }
					nro=isWord(ntoken);if (nro<0) { error();break; }
					compilaWORD(nro);
					break;
				}
			}		
		}	        
	ip=boot;	
	}

function error() {
	document.getElementById("logerror").innerText = "Error: palabra no encontrada en :"+dicc[ndicc];
	}


/*------CANVAS------*/

var canvas;
var ctx;
var imageData;
var buf8;

function r3init() {
	canvas = document.getElementById('canvas');
	ctx = canvas.getContext('2d',{alpha:false,preserveDrawingBuffer:true});
	imageData=ctx.getImageData(0,0,canvas.width, canvas.height);
	buf8=new Uint8ClampedArray(memdata,0,imageData.data.length);
	}

function redraw() { 
	imageData.data.set(buf8);ctx.putImageData(imageData,0,0); 
	}
	
/*------RUNER------*/

var ip;

var TOS=0;
var NOS=0;
var RTOS=256;
var stack=new Int32Array(256); 
// TOS..DSTACK--> <--RSTACK

function r3op(op) { var W;
	//while(op!=0){
		switch(op&0x7f){
	case 7: NOS++;stack[NOS]=TOS;TOS=(op<<16)>>23;op>>=16;break;//LIT9
	case 8: NOS++;stack[NOS]=TOS;TOS=op>>7;op=0;break;			//LITres
	case 9: NOS++;stack[NOS]=TOS;TOS=-(op>>7);op=0;break;		//LITreg neg
	case 10:NOS++;stack[NOS]=TOS;TOS=memcode(op>>7);op=0;break;// LITcte
	case 11:NOS++;stack[NOS]=TOS;TOS=op>>7;op=0;break;			// STR
	case 12:RTOS--;stack[RTOS]=ip;ip=op>>7;op=0;break;			// CALL
	case 13:NOS++;stack[NOS]=TOS;TOS=mem.getInt32(op>>7);op=0;break;	// VAR
	case 14:NOS++;stack[NOS]=TOS;TOS=op>>7;ip+=4;op=0;break;	// DWORD
	case 15:NOS++;stack[NOS]=TOS;TOS=op>>7;ip+=4;op=0;break;	// DVAR
	case 16:ip=stack[RTOS];RTOS++;op=0;break; 					// ;
	case 17:ip=(op>>7);break;//JMP
	case 18:ip+=(op>>7);break;//JMPR
	case 19:break;
	case 20:break;
	case 21:W=TOS;TOS=stack[NOS];NOS--;RTOS--;stack[RTOS]=ip;ip=W;break;//EX

	case 22:if (TOS==0) {ip+=(op>>7);}; break;//ZIF
	case 23:if (TOS!=0) {ip+=(op>>7);}; break;//UIF
	case 24:if (TOS>=0) {ip+=(op>>7);}; break;//PIF
	case 25:if (TOS<=0) {ip+=(op>>7);}; break;//NIF
	case 26:if (TOS==stack[NOS]) {ip+=(op>>7);} TOS=stack[NOS];NOS--;break;//IFN
	case 27:if (TOS!=stack[NOS]) {ip+=(op>>7);} TOS=stack[NOS];NOS--;break;//IFNO
	case 28:if (TOS>stack[NOS]) {ip+=(op>>7);} TOS=stack[NOS];NOS--;break;//IFL
	case 29:if (TOS>stack[NOS]) {ip+=(op>>7);} TOS=stack[NOS];NOS--;break;//IFG
	case 30:if (TOS<=stack[NOS]) {ip+=(op>>7);} TOS=stack[NOS];NOS--;break;//IFLE
	case 31:if (TOS>=stack[NOS]) {ip+=(op>>7);} TOS=stack[NOS];NOS--;break;//IFGE
	case 32:if (TOS&stack[NOS]) {ip+=(op>>7);} TOS=stack[NOS];NOS--;break;//IFAND
	case 33:if (!(TOS&stack[NOS])) {ip+=(op>>7);} TOS=stack[NOS];NOS--;break;//IFNAND
	case 34:if (TOS<=stack[NOS]&&stack[NOS]<=stack[NOS]) {ip+=(op>>7);} TOS=stack[NOS-1];NOS-=2;break;//BETWEEN

	case 35:NOS++;stack[NOS]=TOS;break;						//DUP
	case 36:TOS=stack[NOS];NOS--;break;						//DROP
	case 37:NOS++;stack[NOS]=TOS;TOS=stack[NOS-1];break;	//OVER
	case 38:NOS++;stack[NOS]=TOS;TOS=stack[NOS-2];break;	//PICK2
	case 39:NOS++;stack[NOS]=TOS;TOS=stack[NOS-3];break;	//PICK3
	case 40:NOS++;stack[NOS]=TOS;TOS=stack[NOS-4];break;	//PICK4
	case 41:W=stack[NOS];stack[NOS]=TOS;TOS=W;break;		//SWAP
	case 42:NOS--;break; 									//NIP
	case 43:W=TOS;TOS=stack[NOS-1];stack[NOS-1]=stack[NOS];stack[NOS]=W;break;//ROT
	case 44:W=stack[NOS];NOS++;stack[NOS]=TOS;NOS++;stack[NOS]=W;break;//DUP2
	case 45:NOS--;TOS=stack[NOS];NOS--;break;				//DROP2
	case 46:NOS-=2;TOS=stack[NOS];NOS--;break;				//DROP3
	case 47:NOS-=3;TOS=stack[NOS];NOS--;break;				//DROP4
	case 48:NOS++;stack[NOS]=TOS;TOS=stack[NOS-3];
			NOS++;stack[NOS]=TOS;TOS=stack[NOS-3];break;	//OVER2
	case 49:W=stack[NOS];stack[NOS]=stack[NOS-2];stack[NOS-2]=W;
			W=TOS;TOS=stack[NOS-1];stack[NOS-1]=W;break;	//SWAP2
	
	case 50:RTOS--;stack[RTOS]=TOS;TOS=stack[NOS];NOS--;break;	//>r
	case 51:NOS++;stack[NOS]=TOS;TOS=stack[RTOS];RTOS++;break;	//r>
	case 52:NOS++;stack[NOS]=TOS;TOS=stack[RTOS];break;			//r@
	
	case 53:TOS&=stack[NOS];NOS--;break;					//AND
	case 54:TOS|=stack[NOS];NOS--;break;					//OR
	case 55:TOS^=stack[NOS];NOS--;break;					//XOR
	case 56:TOS=~TOS;break;									//NOT
	case 57:TOS=-TOS;break;									//NEG
	case 58:TOS=stack[NOS]+TOS;NOS--;break;					//SUMA
	case 59:TOS=stack[NOS]-TOS;NOS--;break;					//RESTA
	case 60:TOS=stack[NOS]*TOS;NOS--;break;					//MUL
	case 61:TOS=stack[NOS]/TOS;NOS--;break;					//DIV
	case 62:TOS=(stack[NOS-1]*stack[NOS])/TOS;NOS-=2;break;	//MULDIV
	case 63:W=stack[NOS]%TOS;stack[NOS]=stack[NOS]/TOS;TOS=W;break;//DIVMOD
	case 64:TOS=stack[NOS]%TOS;NOS--;break;					//MOD
	case 65:W=(TOS>>31);TOS=(TOS+W)^W;break;				//ABS
	case 66:TOS=Math.sqrt(TOS);break;						//CSQRT
	case 67:TOS=Math.clz32(TOS);break;						//CLZ
	case 68:TOS=stack[NOS]<<TOS;NOS--;break;				//SAR
	case 69:TOS=stack[NOS]>>TOS;NOS--;break;				//SAL
	case 70:TOS=stack[NOS]>>TOS;NOS--;break;				//SHL
	case 71:TOS=(stack[NOS-1]*stack[NOS])>>TOS;NOS-=2;break;//MULSHR
	case 72:TOS=(stack[NOS-1]<<TOS)/stack[NOS];NOS-=2;break;//CDIVSH
	
	case 73:TOS=mem.getInt32(TOS);break;//@
	case 74:TOS=mem.getInt8(TOS);break;//C@
	case 75:TOS=mem.getInt64(TOS);break;//Q@	

	case 76:NOS++;stack[NOS]=TOS+8;TOS=mem.getInt32(TOS);break;//@+
	case 77:NOS++;stack[NOS]=TOS+1;TOS=mem.getInt8(TOS);break;// C@+
	case 78:NOS++;stack[NOS]=TOS+4;TOS=mem.getInt64(TOS);break;//Q@+		
			
	case 79:mem.setInt32(TOS,stack[NOS]);NOS--;TOS=stack[NOS];NOS--;break;// !
	case 80:mem.setInt8(TOS,stack[NOS]);NOS--;TOS=stack[NOS];NOS--;break;//C!
	case 81:mem.setInt64(TOS,stack[NOS]);NOS--;TOS=stack[NOS];NOS--;break;//Q!
	
	case 82:mem.setInt32(TOS,stack[NOS]);NOS--;TOS+=4;break;// !+
	case 83:mem.setInt8(TOS,stack[NOS]);NOS--;TOS++;break;//C!+
	case 84:mem.setInt64(TOS,stack[NOS]);NOS--;TOS+=8;break;//Q!+
	
	case 85:mem.setInt32(TOS,mem.getInt32(TOS)+stack[NOS]);NOS--;TOS=stack[NOS];NOS--;break;//+!
	case 86:mem[TOS]+=stack[NOS];NOS--;TOS=stack[NOS];NOS--;break;//C+!
	case 87:mem[TOS]+=stack[NOS];NOS--;TOS=stack[NOS];NOS--;break;//Q+!
	
	case 88:REGA=TOS;TOS=stack[NOS];NOS--;break; //>A
	case 89:NOS++;stack[NOS]=TOS;TOS=REGA;break; //A> 
	case 90:NOS++;stack[NOS]=TOS;TOS==mem.getInt32(REGA);break;//A@
	case 91:mem.setInt32(REGA,TOS);TOS=stack[NOS];NOS--;break;//A! 
	case 92:REGA+=TOS;TOS=stack[NOS];NOS--;break;//A+ 
	case 93:NOS++;stack[NOS]=TOS;TOS==mem.getInt32(REGA);REGA+=4;break;//A@+ 
	case 94:mem.setInt32(REGA,TOS);TOS=stack[NOS];NOS--;REGA+=4;break;//A!+

	case 95:REGB=TOS;TOS=stack[NOS];NOS--;break; //>B
	case 96:NOS++;stack[NOS]=TOS;TOS=REGB;break; //B> 
	case 97:NOS++;stack[NOS]=TOS;TOS==mem.getInt64(REGB);break;//B@
	case 98:mem.setInt64(REGB,TOS);TOS=stack[NOS];NOS--;break;//B! 
	case 99:REGB+=TOS;TOS=stack[NOS];NOS--;break;//B+ 
	case 100:NOS++;stack[NOS]=TOS;TOS==mem.getInt64(REGB);REGB+=8;break;//B@+ 
	case 101:mem.setInt64(REGB,TOS);TOS=stack[NOS];NOS--;REGB+=8;break;//B!+

	case 102:break;//MOVE 
	case 103:break;//MOVE> 
	case 104:break;//FILL
	case 105:break;//CMOVE 
	case 106:break;//CMOVE> 
	case 107:break;//CFILL
	case 108:break;//QMOVE 
	case 109:break;//MOVE> 
	case 110:break;//QFILL
	
	case 111:break;//SYSCALL | n -- v
	case 112:break;//SYSMEM | -- ini
	}
	//op>>=8;}
	}


function r3reset(){
	TOS=0;NOS=0;RTOS=256;
	boot=-1
	dicc.splice(0,dicc.length);
	dicca.splice(0,dicca.length);
	dicci.splice(0,dicci.length);
	ndicc=0;
	}

function r3step() {
	if (ip==0) { return; }
	r3op(memcode[ip++]);	
	}

function r3run() {
	if (boot==-1) { return; }
	ip=boot;
	while(ip!=0) { r3op(memcode[ip++]); }
	}

////////////////////////////////////////////////////////////////////
function animate() {
	reqAnimFrame=
	window.mozRequestAnimationFrame||
	window.webkitRequestAnimationFrame||
	window.msRequestAnimationFrame||
	window.oRequestAnimationFrame;
	reqAnimFrame(animate);
	//ex(byname("show"));
	}

function r3boot() {
	r3init();
	//animate();
	}	

////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////
window.onload=r3boot;	
////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////

function num9(tok) // 9 bits
{ return (tok<<16)>>23; }
function numr(tok) // r bits
{ return (tok>>7);}
function numrn(tok) // r bits neg
{ return -(tok>>7);}
function numct(tok) // cte
{ return memcode[tok>>7];}

function printmr3(tok) {
var s="";
switch(tok&0x7f){
		case 7:s+="("+num9(tok)+")";break
		case 8:	
		case 17:case 18:
		case 22:case 23:case 24:case 25:
		case 26:case 27:case 28:case 29:case 30:case 31:
		case 32:case 33:case 34:
			s+="("+numr(tok)+")";break
		case 9:s+="("+numnr(tok)+")";break
		case 10:s+="("+numct(tok)+")";break
//		default:
	}
if ((tok&0x7f)>20) { return r3base[(tok&0x7f)-16]+s; }
return r3machine[tok&0x7f]+s;
}