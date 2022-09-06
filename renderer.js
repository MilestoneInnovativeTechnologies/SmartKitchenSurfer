// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

const { ipcRenderer } = require('electron')
const fs = require('fs');

let host_file_name = ''

ipcRenderer.on('host-file',function(event, file_name){
    host_file_name = file_name;
    fs.access(host_file_name, fs.constants.R_OK, (error) => {
        if(error) {
            logoUp(10); hostReq(0,true);
            let sBtn = document.querySelector('#host_submit')
            sBtn.addEventListener('click',function(){
                let hTxt = String(document.querySelector('#host').value).trim();
                if(!hTxt) return status('Please enter the IP Address or Host Address where Smart Kitchen Deployed..');

                if(!hTxt.startsWith('http')) hTxt = 'http://' + hTxt;

                fs.writeFile(host_file_name,hTxt,function(error){
                    if(error) status('Error in writing the host details...');
                    hostReq(0,false);
                    sendHost(hTxt)
                });

            })
        } else {
            fs.readFile(host_file_name,function(error,hTxtBuffer){
                if(error) return status('Error in reading host. Close by Pressing Ctrl + F12, and reopen..');
                sendHost(hTxtBuffer.toString())
            })
        }
    });
})

ipcRenderer.on('loaded',function(event){
    console.warn('LOADED')
    setTimeout(() => {
        putLoading(false);
        logoUp(0);
        showInfo(); setTimeout(showStart,1000)
    },250)
})

function status(txt){
    let sDiv = document.querySelector("#status_div");
    sDiv.innerHTML = txt;
    sDiv.style.transform = 'scale(1)';
    setTimeout(() => sDiv.style.transform = 'scale(0)',5000)
}

function logoUp(amt){
    let lImg = document.querySelector("#logo-img");
    lImg.style.top = amt + "px";
}
function hostReq(amt,state){
    let hDiv = document.querySelector("#host_div");
    if(!state){
        hDiv.style.transform = "scale(0)";
        hDiv.style.top = 0 + "px";
    } else {
        hDiv.style.transform = "scale(1.0)";
        hDiv.style.top = amt + "px";
    }
}

function sendHost(hTxt){
    logoUp(0);
    setTimeout(putLoading,700);
    ipcRenderer.send('host',hTxt);
}

function putLoading(state){
    let cDiv = document.querySelector(".container");
    if(state === undefined){
        cDiv.style.background = "url('loader.gif') 50% 57% no-repeat #FBFBFB";
        cDiv.style.backgroundSize = "200px";
    } else {
        cDiv.style.background = "";
        cDiv.style.backgroundSize = "";
    }
}

function showInfo(){
    document.querySelector('#info_div').style.transform = 'scale(1)'
    setTimeout(putLoading,1000,false)
}

function showStart(){
    document.querySelector('#start_div').style.transform = 'scale(1)'
    document.querySelector("#start-img").addEventListener('click',function(){
        ipcRenderer.send('start')
    })
}
