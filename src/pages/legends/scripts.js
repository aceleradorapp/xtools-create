const { ipcRenderer, Menu } = require('electron');
var title = '';

const titleElement = document.getElementById('title');
const btPlayElement = document.getElementById('bt-play');

ipcRenderer.on('set-legends', (event, date)=>{
    title = date.name;
    init();
});

function init(){
    titleElement.innerHTML = title;
   
}