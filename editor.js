"use strict";
// VM
//----------------------------------------------------
function dumpError() {
    if (werror[0]=="'") { 
        werror=werror.slice(1); 
    }
    var inin = ininclude(werror);

    if (inin!="") {
        editor.gotoLine(1,0);
        editor.insert("^"+inin+"\n")
        editor.focus();
        return;
    }

    const err = {
        row:lerror,
        column:cerror,
        text:" Word not Found:"+werror+" "+inin,type:"error"
    };

    editor.getSession().setAnnotations([err]);
    editor.gotoLine(lerror + 1, cerror);
    editor.focus();
}

function modeselect(value) {
    function modeactiva(name) {
        document.getElementById(name).style.display = (name == value) ? 'block' : 'none';
    }
    var modes = ['modedit', 'moderun', 'modeimg'];
    modes.forEach(modeactiva);
}

function modesrc() { 
    r3showx = -1;
    modeselect('modedit'); 
    editor.focus();
}

function moderun() {
    saveprev();

    var cc=r3compile(editor.getValue("\n"));
    if (cc>-1) {// error
        dumpError();
        //dumpVM();
        modeselect('modesrc');		
        return;
    }
	
    modeselect('moderun');	
    
    r3reset();
    if (boot!=-1) { runr3(boot); }
    animate(); 
    
    redraw();
    document.getElementById("r3dom").innerHTML=r3echo;
    dumpVM();  
}


function modeimg() {
    r3showx=-1;
    modeselect('modeimg');
    makeimage();
}

////////////////////////////////////////////////////////////////////  
function toggle(evt) {
    evt.classList.toggle("is-primary");
}

function saveimage() {
    toFILE("imager3.zip");
}

function loadimage() {
    var x = document.createElement("INPUT");
    x.setAttribute("type", "file");
    document.body.appendChild(x);
    x.addEventListener("change", function(evt) { fromFILE(evt.target.files[0]); },false);
    x.click();
    document.body.removeChild(x);  
}


// DEBUG
//----------------------------------------------------

function dumpd() { var s="";
    for (let i=TOSEX;i>1;i--) {
        s+='&nbsp;<span class="tag is-dark is-large">'+ stack[i] + '</span>';
    }
    return s;
}

const setDivH = (id,value) => document.getElementById(id).innerHTML = value;

function dumpVM() {
    setDivH("ds", dumpd());
}

  
//----------------------------------------------------
var filename="";

function saveprev() {
    if (filename == "") {
        return;
    }
    sessionStorage.setItem(filename,editor.getValue("\n"));
}

function codeload(name) {
    saveprev();
    filename=name;
    editor.setValue(sessionStorage.getItem(filename));
    editor.clearSelection(); 
    modesrc();
}

///////////
// IMAGE
///////////

var includelibs=[];
var wordlibs=[];

function definitions(str) {
    var w = '';
    var now = 0;
    var ini;	
    str = str.trim();
    while(now < str.length) {
        while (str.charCodeAt(now) < 33) {
            now++;
        }
        if(str[now]==="^") {					// include
            ini=++now;
            while (str.charCodeAt(now) > 32) { now++; }
            var name = str.slice(ini,now);
            continue;
        }
        if(str[now] === "|") {					// comments	
            now=str.indexOf("\n",now)+1;
            if (now<=0) {
                now = str.length;
            }
            continue; 
        }
        if(str[now] === "\"") {					// strings		
            ini = ++now;
            while (str.charCodeAt(now)!=0) { 
                if (str[now]=== "\"") { 
                    if (str[now+1]!="\"") { 
                        break; 
                    }
                    now++; 
                }
                now++; 
            }	
            now+=2;
            continue; 
        } 
        else {
            ini = now;
            while (str.charCodeAt(now)>32) {
                now++;
            }
            const str = str[ini] + str[ini + 1];
            if((str === '::') || (str === '##')) {
                wc++;
                w += "|" + str.slice(ini + 2, now);
            }
        }
    }
    return w + "|";
 }


function ininclude(word) {
    word = "|" + word + "|";
    var nl = wordlibs.length;
    for (let i=0;i<nl;i++) {
        if (wordlibs[i].indexOf(word) > -1) {
            return includelibs[i];
        }
    }
    return "";
}
 
function includelib(name,s) {
    includelibs.push(name);
    const wordlist = definitions(s)
    wordlibs.push(wordlist);
    /* debug
    const pname=name.slice(4);
    document.getElementById('libsincludes').innerText+=pname+" "+wordlist+"\n";
    */
}

function addfile(name,s) {
    if (s == "" || name == "") {
        return; 
    }
    sessionStorage.setItem(name,s);
    if (name.indexOf('lib/')!=-1) {
        includelib(name, s);
        return;
    }
    if (name.indexOf('/') != -1) {
        return; 
    }
    codeload(name);
}

//---------------------- URL
function fromURL(name) {

    sessionStorage.clear();

    const processResponse = response => { 
        if (response.status === 200 || response.status === 0) { 
            return Promise.resolve(response.blob());
        } else {
            return Promise.reject(new Error(response.statusText));
        }
    };

    const processZip = zip => {
        zip.forEach((name,file) => {
            file.async("string").then(s => addfile(name,s));
        });
    };

    fetch(name)
        .then(processResponse)
        .then(JSZip.loadAsync)
        .then(processZip);

    document.getElementById('filename').innerText= name;
}

//---------------------- Local file
function fromFILE(f){

    sessionStorage.clear();

    JSZip.loadAsync(f).then(zip => {
        zip.forEach((name, file) => {
            file.async("string").then(s => addfile(name,s));
        });
    });
}

function toFILE(f) {
    let zip = new JSZip();
    let namefile;
    for(let i=0;i<sessionStorage.length;i++) { 
        namefile = sessionStorage.key(i);
        zip.file(namefile, sessionStorage.getItem(namefile));
    }
    zip.generateAsync({type:"blob"})
        .then(blob => saveAs(blob, f));
}

//----------------------
function makeimage() {
    let filelist = document.getElementById('filelist');
    let s = "";
    let folder = "";
    for (let i=0; i < sessionStorage.length; i++) {
        let name = sessionStorage.key(i);
        let path = name.trim().split("/");
        if (path[1] !== undefined) {
            if (folder != path[0]) { 
                if (folder != "") {
                    s += "</div></article>";
                }
                s += '<article class="message" style="margin:2px">';
                s += '<div class="message-header" onclick="togglef(this)" style="padding:0px">';
                s += '&nbsp;' + path[0] + '/';
                s += '</div>';
                s += '<div class="message-body" style="padding:2px;display:none">';
            }
            s += "<button class='button is-small is-fullwidth' onclick='codeload("+'"'+name+'"'+");' style='justify-content:left;'>"+path[1]+"</button>";  
            folder = path[0];
        } else {
            if (folder != "") {
                s+="</div></article>";
                folder="";
            }  
            s += "<button class='button is-small is-fullwidth' onclick='codeload("+'"'+name+'"'+");' style='justify-content:left;'>"+name+"</button>";
        }
    }
    if (folder!="") { s+="</div></article>"; }	
    filelist.innerHTML = s;
}

function togglef(evt) {
  evt.parentElement.classList.toggle("is-primary");
  const isShown = (evt.nextElementSibling.style.display == 'none'); 
  evt.nextElementSibling.style.display= isShown ? 'block' : 'none';
}

/////////
// BOOT//
/////////

document.addEventListener("DOMContentLoaded", () => {
    const editor = ace.edit("src");

    editor.setOptions({ 
        theme:"ace/theme/twilight",
        minLines:4,maxLines:25,
        fontSize:18
        });
    editor.focus();
    
    fromURL('r3.zip');
});