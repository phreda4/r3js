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

////////////////////////////////////////////////////////////////////
// HELP: lista y renderiza documentos de la carpeta doc/ (cargados
// junto con el resto de la imagen .zip, igual que lib/ o examples/).
////////////////////////////////////////////////////////////////////

function helpDocs() {
    const docs = [];
    for (let i=0; i<sessionStorage.length; i++) {
        const name = sessionStorage.key(i);
        if (name.indexOf('doc/') === 0 && name.slice(-3) === '.md') {
            docs.push(name);
        }
    }
    return docs.sort();
}

function mdEscape(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// mini-renderer markdown: encabezados, negrita/italica, code inline,
// bloques de codigo con fences, listas y parrafos. Alcanza para docs
// tecnicos simples sin traer una libreria externa.
function mdRender(src) {
    const lines = src.replace(/\r\n/g,'\n').split('\n');
    let html = '';
    let inCode = false, codeBuf = [];
    let inList = false;

    function closeList() { if (inList) { html += '</ul>'; inList = false; } }

    function inlineMd(s) {
        s = mdEscape(s);
        s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
        s = s.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
        s = s.replace(/\*([^*]+)\*/g, '<i>$1</i>');
        return s;
    }

    for (const raw of lines) {
        const line = raw;

        if (line.trim().slice(0,3) === '```') {
            if (!inCode) { inCode = true; codeBuf = []; }
            else { html += '<pre><code>' + mdEscape(codeBuf.join('\n')) + '</code></pre>'; inCode = false; }
            continue;
        }
        if (inCode) { codeBuf.push(line); continue; }

        if (line.trim() === '') { closeList(); continue; }

        const h = line.match(/^(#{1,4})\s+(.*)$/);
        if (h) {
            closeList();
            const lvl = h[1].length;
            html += '<h' + lvl + '>' + inlineMd(h[2]) + '</h' + lvl + '>';
            continue;
        }

        const li = line.match(/^\s*[-*]\s+(.*)$/);
        if (li) {
            if (!inList) { html += '<ul>'; inList = true; }
            html += '<li>' + inlineMd(li[1]) + '</li>';
            continue;
        }

        closeList();
        html += '<p>' + inlineMd(line) + '</p>';
    }
    closeList();
    if (inCode) { html += '<pre><code>' + mdEscape(codeBuf.join('\n')) + '</code></pre>'; }
    return html;
}

function helpOpen(name) {
    const src = sessionStorage.getItem(name);
    document.getElementById('help-content').innerHTML =
        (src === null) ? '<p>(no se pudo leer ' + name + ')</p>' : mdRender(src);
    document.querySelectorAll('#help-list button').forEach(b => b.classList.remove('is-primary'));
    const btn = document.getElementById('help-btn-' + name);
    if (btn) { btn.classList.add('is-primary'); }
}

function helpRefresh() {
    const docs = helpDocs();
    const list = document.getElementById('help-list');
    if (docs.length === 0) {
        list.innerHTML = '<p style="opacity:0.6;padding:6px">Sin documentos en doc/</p>';
        document.getElementById('help-content').innerHTML = '';
        return;
    }
    let s = '';
    for (const name of docs) {
        const base = name.slice(4, -3);
        s += '<button id="help-btn-' + name + '" class="button is-small is-fullwidth" ' +
             'onclick="helpOpen(\'' + name + '\');">' + base + '</button>';
    }
    list.innerHTML = s;
    helpOpen(docs[0]);
}

////////////////////////////////////////////////////////////////////
// PANEL DERECHO: canvas / dom / consola / archivos como tabs,
// todos coexisten con el editor (que ahora es siempre visible).
////////////////////////////////////////////////////////////////////

function showRightView(name, btn) {
    document.querySelectorAll('.rightview').forEach(el => el.classList.remove('active'));
    document.getElementById('view-' + name).classList.add('active');
    document.querySelectorAll('#righttabs button').forEach(b => b.classList.remove('is-primary'));
    if (btn) { btn.classList.add('is-primary'); }
    if (name === 'help') { helpRefresh(); }
}

function toggleFiles() {
    showRightView('files', document.getElementById('tab-files'));
    makeimage();
}

function modesrc() {
    // se mantiene por compatibilidad: enfocar el editor (ya siempre visible)
    editor.focus();
}

function moderun() {
    saveprev();
    editor.getSession().clearAnnotations();

    var cc=r3compile(editor.getValue("\n"));
    if (cc>-1) {// error
        dumpError();
        return;
    }

    r3reset();
    if (boot!=-1) { runr3(boot); }
    animate(); 
    
    redraw();
    document.getElementById("r3dom").innerHTML=r3echo;
    document.getElementById("r3console").textContent=r3echo;
    dumpVM();
    showRightView('canvas', document.querySelector('#righttabs button'));
}


function newimage() {
    sessionStorage.clear();
    includelibs=[];
    wordlibs=[];
    filename="";
    document.getElementById('filename').innerText="";
    document.getElementById('imagename').innerText="Sin imagen cargada";
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
    x.setAttribute("accept", ".zip");
    x.style.display = "none";
    document.body.appendChild(x);
    x.addEventListener("change", function(evt) {
        fromFILE(evt.target.files[0]);
        document.body.removeChild(x);
    }, false);
    x.click();
}


// DEBUG
//----------------------------------------------------

function dumpd() {
    var s="";
    for (let i=TOSEX;i>1;i--) {
        const cls = (i==TOSEX) ? "stackitem tos" : "stackitem";
        s+='<span class="'+cls+'">'+ stack[i] + '</span>';
    }
    if (s=="") { s='<span style="opacity:0.4">(vacío)</span>'; }
    return s;
}

const setDivH = (id,value) => document.getElementById(id).innerHTML = value;

function dumpVM() {
    setDivH("ds", dumpd());
}

function r3log(msg) {
    const el = document.getElementById('r3console');
    if (!el) { return; }
    const line = document.createElement('div');
    line.textContent = msg;
    el.appendChild(line);
    el.scrollTop = el.scrollHeight;
}

function clearConsole() {
    const el = document.getElementById('r3console');
    if (el) { el.innerHTML = ""; }
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
    let src = sessionStorage.getItem(name);
    if (src === null) {
        console.error("codeload: archivo no encontrado en sessionStorage:", name);
        return;
    }
    filename=name;
    document.getElementById('filename').innerText = name;
    editor.setValue(src);
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
            const pfx = str[ini] + str[ini + 1];
            if((pfx === '::') || (pfx === '##')) {
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
        const jobs = [];
        zip.forEach((name,file) => {
            jobs.push(file.async("string").then(s => addfile(name,s)));
        });
        return Promise.all(jobs);
    };

    fetch(name)
        .then(processResponse)
        .then(JSZip.loadAsync)
        .then(processZip)
        .then(() => {
            document.getElementById('imagename').innerText = name;
            makeimage();
            if (document.getElementById('view-help').classList.contains('active')) { helpRefresh(); }
        })
        .catch(err => {
            console.error("fromURL failed:", err);
            document.getElementById('imagename').innerText = "Sin imagen cargada (falló " + name + ")";
            alert("No se pudo cargar la imagen: " + name + "\n" + err.message);
        });

    document.getElementById('filename').innerText= name;
}

//---------------------- Local file
function fromFILE(f){

    sessionStorage.clear();

    JSZip.loadAsync(f).then(zip => {
        const jobs = [];
        zip.forEach((name, file) => {
            jobs.push(file.async("string").then(s => addfile(name,s)));
        });
        return Promise.all(jobs);
    }).then(() => {
        document.getElementById('imagename').innerText = f.name;
        makeimage();
        if (document.getElementById('view-help').classList.contains('active')) { helpRefresh(); }
    }).catch(err => {
        console.error("fromFILE failed:", err);
        alert("No se pudo abrir el archivo .zip: " + err.message);
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

    // agrupamos primero (una pasada), asi no importa el orden de
    // iteracion de sessionStorage ni si una carpeta viene interrumpida
    // por archivos sueltos entremedio (eso duplicaba el header de carpeta)
    const folders = new Map(); // folder -> [ {name, base} ]
    const root = [];           // archivos sin carpeta

    for (let i=0; i < sessionStorage.length; i++) {
        let name = sessionStorage.key(i);
        let path = name.trim().split("/");
        if (path[1] !== undefined) {
            if (!folders.has(path[0])) { folders.set(path[0], []); }
            folders.get(path[0]).push({ name, base: path[1] });
        } else {
            root.push(name);
        }
    }

    let s = "";
    const folderNames = Array.from(folders.keys()).sort();
    for (const fname of folderNames) {
        s += '<article class="message" style="margin:2px">';
        s += '<div class="message-header" onclick="togglef(this)" style="padding:0px">';
        s += '&nbsp;' + fname + '/';
        s += '</div>';
        s += '<div class="message-body" style="padding:2px;display:none">';
        const files = folders.get(fname).sort((a,b) => a.base.localeCompare(b.base));
        for (const f of files) {
            s += "<button class='button is-small is-fullwidth' onclick='codeload(\"" + f.name + "\");' style='justify-content:left;'>" + f.base + "</button>";
        }
        s += "</div></article>";
    }

    root.sort().forEach(name => {
        s += "<button class='button is-small is-fullwidth' onclick='codeload(\"" + name + "\");' style='justify-content:left;'>" + name + "</button>";
    });

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

var editor;

document.addEventListener("DOMContentLoaded", () => {
    editor = ace.edit("src");

    editor.setOptions({ 
        theme:"ace/theme/twilight",
        fontSize:18
        });
    editor.focus();

    editor.commands.addCommand({
        name: "run",
        bindKey: { win: "Ctrl-Enter", mac: "Command-Enter" },
        exec: () => moderun()
    });

    if (location.protocol === "file:") {
        // fetch() esta bloqueado por CORS al abrir el html directo (sin server).
        // Mostramos el panel de archivos para que el usuario cargue r3.zip a mano
        // con el boton "Load" (evita depender de un picker auto-disparado,
        // que algunos navegadores bloquean si no hay gesto de usuario previo).
        toggleFiles();
        return;
    }
    
    fromURL('r3.zip');
});