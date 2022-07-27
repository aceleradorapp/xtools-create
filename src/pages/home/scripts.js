const { ipcRenderer, shell  } = require('electron');
const NotificationModal = require('../../../src/components/NotificationModal.js');
import VideoControl from '../../../src/components/VideoControl.js';


var videoControl = null;
var notificationModal = new NotificationModal('windows-notification');

var title = '';
var urlVideo = null;
var update = '';

const titleElement = document.getElementById('title');
const videoElement = document.getElementById('video');
const contentVideoElement = document.getElementById('contentVideo');
const logoElement = document.getElementById('logo');
const btnLogarElement = document.getElementById('btnLogar');
const btLinkElement = document.getElementById('btLink');

btnLogarElement.onclick = btnLogarHandler;
btLinkElement.onclick = btLinkHandler;

var file = null;

ipcRenderer.on('set-file', (event, data)=>{
    file = data;
    title = data.name;
    update = data.update?'':'*';
    urlVideo = data.urlVideo;
    titleElement.innerHTML = ' Xtool | ' + title + update;

    if(data.type == 'novo' || data.type == 'abrir'){
        init();
    }
});

ipcRenderer.on('compile', (event, data)=>{
    console.log('Compilar');    
    document.location.href = 'D:/projetos/splitVideo/py teste.py "aula01.ply"';
});

ipcRenderer.on('set-command', (event, data)=>{
    
    
    if(data.command == 'play'){
        videoElement.play();
    }else if(data.command == 'pause'){
        videoElement.pause()
    }else if(data.command == 'stop'){
        videoElement.pause();
        videoElement.currentTime = 0;
    }else if(data.command == 'next'){
        videoElement.pause();
        videoElement.currentTime = videoElement.duration;
    }else if(data.command == 'prev'){
        videoElement.currentTime = 0;
    }else if(data.command == 'config'){
        videoControl.setPrecision(data.precision);
        videoControl.setVelocity(data.velocity);
    }else if('progressBar'){        
        videoControl.setPositionVideo(data.positionVideo);
    }
});

ipcRenderer.on('notification-salve', (event, data)=>{
    var menuName = data;
    var menssage = 'O arquivo não foi salvo, se continuar perderá as alterações feitas./n Realmente deseja continuar.'
    notificationModal.show('Atenção!', menssage,(e)=>{            
        if(e=='Sim'){
            ipcRenderer.send('menu-select', menuName);
        }

    },'Sim','Não',true, true,'?'); 
});

ipcRenderer.on('set-position-video', (event, data)=>{
    let position = data.videoInit;

    if(!position){
        return;
    }

    videoControl.setPositionVideo(position);
});

function init(){
    contentVideoElement.classList.remove('hide');
    logoElement.classList.add('hide');
    videoElement.src = urlVideo;  
         
    videoElement.addEventListener('loadeddata', videoLoaded, false ); 
    videoElement.addEventListener('timeupdate', timeUpdateHandler, false);
    document.addEventListener('wheel', wheelHandler);


}


function videoLoaded(e){
    videoControl = new VideoControl(videoElement);
    videoElement.playbackRate = 3;

    //envia a posição do video para o main.js
    videoControl.returnPosition((data)=>{
        ipcRenderer.send('video-position', data);
    });
}

function wheelHandler(event) {
    var positionActual = event.deltaY;
    videoControl.setRolePositionVideo(positionActual);     
}

function btLinkHandler(e){
    e.preventDefault();
    shell.openExternal('http://www.aceleradora.app.br/');
}

function btnLogarHandler(e){
    e.preventDefault();
}

function timeUpdateHandler(e){
    let dataTemp = {
        currentTime: videoElement.currentTime,
        duration: videoElement.duration,
        pointer:videoControl.getPointer(),
        videoVelocity: videoControl.getVelocity()
    }

    // atualiza o ponteiro do vídeo com o valor atual
    videoControl.setPointer(videoElement.currentTime);
    // videoControl.setPrecision();

    ipcRenderer.send('video-update',dataTemp);
}
