const { ipcRenderer, Menu } = require('electron');
var title = '';
var dataVideoUpdate = null

const titleElement = document.getElementById('title');
const btPlayElement = document.getElementById('bt-play');
const btPauseElement = document.getElementById('bt-pause');
const btStopElement = document.getElementById('bt-stop');
const btNextElement = document.getElementById('bt-next');
const btPrevElement = document.getElementById('bt-prev');

const btprecisionElement = document.getElementById('btprecision');
const btVelocityElement = document.getElementById('btVelocity');

const positionVideoDisplayElement = document.getElementById('positionVideoDisplay');
const minutesVideoDisplayElement = document.getElementById('minutesVideoDisplay');
const progressVideoElement = document.getElementById('progressVideo');
const progressBaseElement = document.getElementById('progressBase');

var dataSend = {
    velocity:1,
    precision:0.1,
    positionVideo:0,
    command:null
}

var clickProgress = false;

ipcRenderer.on('set-control', (event, data)=>{
    title = data.name;
    dataVideoUpdate = data.dataVideoUpdate;
    dataSend.positionVideo = dataVideoUpdate.currentTime;
    
    init();

    setDisplayPosition(dataVideoUpdate);
    seektimeupdate(dataVideoUpdate);
    calcPercentPosition(dataVideoUpdate);
});

ipcRenderer.on('control-video-update', (event, data)=>{    
    setDisplayPosition(data);
    seektimeupdate(data);
    calcPercentPosition(data);
});

function init(){   
    titleElement.innerHTML = title;

    sendControlCommand(null);

    btPlayElement.onclick = ()=>{
        sendControlCommand('play');
    }

    btPauseElement.onclick = ()=>{
        sendControlCommand('pause');
    }

    btStopElement.onclick = ()=>{
        sendControlCommand('stop');
    }

    btNextElement.onclick = ()=>{
        sendControlCommand('next');
    }

    btPrevElement.onclick = ()=>{
        sendControlCommand('prev');
    }

    btprecisionElement.onchange = ()=>{
        let precisionTemp = btprecisionElement.value;
        dataSend.precision = precisionTemp
        sendControlCommand('config');
    }

    btVelocityElement.onchange = ()=>{
        let velocityTemp = btVelocityElement.value;
        dataSend.velocity = velocityTemp;
        btVelocityElement.value = velocityTemp;
        sendControlCommand('config');
    }

    progressBaseElement.onmousedown = (e)=>{
        clickProgress = true;
        progressBaseElement.onmousemove(e);
    }

    document.onmouseup = (e)=>{
        clickProgress = false;
    }

    progressBaseElement.onmousemove = (e)=>{    
        if(!clickProgress){
            return;
        }

        let total = progressBaseElement.clientWidth;
        let posX = e.offsetX;
        let percentTemp = (posX*100)/total;
        let positionTemp = (percentTemp*dataVideoUpdate.duration)/100;

        dataSend.positionVideo = positionTemp;

        positionProgressNow(percentTemp);
        sendControlCommand('progressBar')       
    }
}

function sendControlCommand(command){
    dataSend.command = command;
    ipcRenderer.send('control-mommand', dataSend);
}

function setDisplayPosition(data){

    positionVideoDisplayElement.innerHTML = data.currentTime +' / '+ data.duration;
}

function calcPercentPosition(data){
    let percentagem = (data.currentTime*100)/data.duration;

    if(percentagem >= 100){
        percentagem = 100;
    }
    console.log('percent: '+percentagem);
    positionProgressNow(percentagem);
    // progressVideoElement.style.width = Math.round(percentagem)+'%';
}

function positionProgressNow(value){
    progressVideoElement.style.width = Math.round(value)+'%';
}

function seektimeupdate(data){
	var nt = data.currentTime * (100 / data.duration);
	
	var curmins = Math.floor(data.currentTime / 60);
	var cursecs = Math.floor(data.currentTime - curmins * 60);
	var durmins = Math.floor(data.duration / 60);
	var dursecs = Math.floor(data.duration - durmins * 60);
	if(cursecs < 10){ cursecs = "0"+cursecs; }
	if(dursecs < 10){ dursecs = "0"+dursecs; }
	if(curmins < 10){ curmins = "0"+curmins; }
	if(durmins < 10){ durmins = "0"+durmins; }

    minutesVideoDisplayElement.innerHTML = curmins+":"+cursecs +' / '+durmins+":"+dursecs;
}