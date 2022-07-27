const { app, BrowserWindow, Menu, dialog, ipcMain, nativeTheme } = require('electron');
const fs = require('fs');
const path = require('path');
const createMenuMaster = require('./src/components/MenuMaster.js');
const notifier = require('./src/components/Notification');
const DataStorage = require('./src/components/DataStorage');
// const db = require('./src/models/dbXtools');

var dataStorage = new DataStorage();
var mainWindows = null;
var controlWindows = null;
var controlLegend = null;
var file = {};
var menu;

var positionActualVideo = 0;

var dataVideoUpdate = {
    currentTime:0,
    duration:0,
    pointer:0,
    videoVelocity:1
}

file = {
    type:'novo',
    name:'novo-arquivo.ply',
    data:null,
    saved: false,
    update:true,
    path: app.getAppPath('documents')+'/novo-arquivo.ply',
    urlVideo:null,
    pathVideo:null,
    nameVideo:null
}

function createWindow(){

    dataStorage.add('user', 'Michael Milanez');
    //console.log('get local storage');

    mainWindows = new BrowserWindow({
        width: 1200,
        height:800,
        minWidth: 1200,
        minHeight: 800,       
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            nodeIntegrationInWorker: true
        },
        backgroundColor: '#2e2c29',        
        frame: true,
        show: false,
        icon: __dirname+'/src/assets/image/icon/Xtools-ico-nano.png',
        darkTheme: true
    });  
           
    nativeTheme.themeSource = 'dark';
    //const tray = require('./src/components/Tray');
    //notifier('Atenção!','Sistema indentificou que seu monitor não tem resolução adequada para esse trabalho.');    

    mainWindows.on('ready-to-show', () => {       
        mainWindows.show(); 
        //console.log(dataStorage.get('user'));               
    });

    mainWindows.on('closed', ()=>{
        if(controlWindows){
            controlWindows.close();
            controlWindows = null;
        }

        if(controlLegend){
            controlLegend.close();
            controlLegend = null;
        }
    });

    //await mainWindows.loadFile('src/pages/home/index.html');        
    mainWindows.loadFile('src/pages/home/index.html');

    // mainWindows.webContents.openDevTools();


    ipcMain.on('control-mommand', (event, date)=>{              
        mainWindows.webContents.send('set-command',date);
    });

    // Retorno do Update dos dados da legenda
    ipcMain.on('updateData', (event, data) =>{
        file.data = data;
        file.update = false;
        file.type = 'update';

        mainWindows.webContents.send('set-file',file);
    });

    // retorno do id da legenda selecionada
    ipcMain.on('sendIdLegend', (event, legend) =>{        
        mainWindows.webContents.send('set-position-video',legend);
    });

    

    


}
/**
 * Cria menu personalizado
 * @param {Object} template 
 */
function createMenu(template){
    menu = Menu.buildFromTemplate(createMenuMaster(clickMenuHandler));
    Menu.setApplicationMenu(menu);
}

/**
 * Retorna os eventos de clique dos menus
 * @param {Event} e 
 */
function clickMenuHandler(e){    

    if(!file.update && e!='salvar' && e!='salvar-como' && e!='legendas' && e!='compilar-dados'){
        mainWindows.webContents.send('notification-salve',e);        
    }else{
        selectMenuNow(e);        
    }        
}

ipcMain.on('menu-select', (event, e)=>{        
    selectMenuNow(e);
});

function selectMenuNow(e){
    if(e == 'novo'){
        //closeWindow();
        createNewFile();
    }else if(e == 'abrir'){
        //closeWindow();
        openFile();
    }else if(e == 'salvar'){
        saveFile()
    }else if(e == 'salvar-como'){
        saveFileAs();
    }else if(e == 'controle'){
        openControl();
    }else if(e == 'legendas'){
        openLegend();
    }else if(e == 'compilar-dados'){
        compileData();
    } 
}

/**
 * Desbloqueia o acesso aos itens dos menus
 */
function unlockMenu(){
    menu.getMenuItemById(3).enabled = true;
    menu.getMenuItemById(4).enabled = true;
    menu.getMenuItemById(5).enabled = true;
    menu.getMenuItemById(6).enabled = true;
    menu.getMenuItemById(11).enabled = true;
    menu.getMenuItemById(12).enabled = true; 
}

/**
 * Novo projeto
 * @returns 
 */
async function createNewFile(){

    file.type = 'novo';
    file.name = 'novo-arquivo.ply'
    file.data = null,
    file.saved = false;
    file.update = true;

    let options = {
        //properties:['multiSelections'],
        defaultPath: file.path, 
        filters: [
            { name: "Vídeos", extensions: ["mkv", "avi", "mp4"] }
        ],
    }    

    let dialogFile = await dialog.showOpenDialog(options); 

    if(dialogFile.canceled == true){
        return;
    }
    
    file.path = path.dirname(dialogFile.filePaths[0]);
    file.urlVideo = dialogFile.filePaths;
    file.pathVideo = path.dirname(dialogFile.filePaths[0]);
    file.nameVideo = path.basename(dialogFile.filePaths[0]);
    file.update = true;

    loadFile(file);   

    unlockMenu();       
}

function loadFile(file){
    mainWindows.webContents.send('set-file',file);
}

/**
 * Abrir o projeto
 * @returns 
 */
async function openFile(){    

    let options = {
        defaultPath: file.path, 
        filters: [
            { name: "ply", extensions: ["ply"] }
        ],
    }    

    let dialogFile = await dialog.showOpenDialog(options);

    if(dialogFile.canceled == true){
        return;
    }

    let data = JSON.parse(readFile(dialogFile.filePaths[0]));          

    file = {
        type:'abrir',
        name:path.basename(dialogFile.filePaths[0]),
        data:data.data,
        saved: true,
        update:true,
        path: dialogFile.filePaths[0],
        urlVideo:data.pathVideo +'\\'+ data.nameVideo,//data.urlVideo,
        pathVideo:data.pathVideo,
        nameVideo:data.nameVideo
    }    

    loadFile(file);
    unlockMenu();
    
}

function readFile(filePath){ 
    try {
        return fs.readFileSync(filePath, 'utf8')
    } catch (error) {
        console.log(error);
        return '';
    }
}

/**
 * Save projeto
 * @returns 
 */
function saveFile(){
    if(file.saved){
        return writeFile(file.path);
    }

    return saveFileAs();
}

/**
 * Save as projetos
 * @returns 
 */
async function saveFileAs(){
    let dialogFile = await dialog.showSaveDialog({
        defaultPath: file.path,
        filters: [
            { name: "PLY", extensions: ["ply"] }
        ],
    });

    if(dialogFile.canceled == true){
        return;
    }

    writeFile(dialogFile.filePath);    
}

function writeFile(filePath){
    try {

        let dataTemp = {
            nameVideo: file.nameVideo,
            urlVideo: file.urlVideo,
            pathVideo: file.pathVideo,
            nameVideo: file.nameVideo,
            data: file.data
        }


        fs.writeFile(filePath, JSON.stringify(dataTemp), (error)=>{
            if(error) throw error;

            file.type = 'save'
            file.path = filePath;
            file.saved = true;
            file.update = true
            file.name = path.basename(filePath); 
            
            loadFile(file);
        });
    } catch (error) {
        console.log(error);
    }
}

/**
 * Abre janela de controle
 */
function openControl(){
    controlWindows = new BrowserWindow({
        width: 271,
        height:380,
        autoHideMenuBar: true,
        resizable:false,
        minimizable: false,
        alwaysOnTop:true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
        icon: __dirname+'/src/assets/image/icon/Xtools-ico-nano.png',
    });

    controlWindows.on('ready-to-show', () => {
        controlWindows.webContents.send('set-control',{name:"Controle", dataVideoUpdate:dataVideoUpdate});        
        controlWindows.show();
        menu.getMenuItemById(11).enabled = false;
    });

    controlWindows.on('closed', ()=>{
        menu.getMenuItemById(11).enabled = true;
        controlWindows = null;
    });

    controlWindows.loadFile('src/pages/control/index.html');
    // controlWindows.webContents.openDevTools();
}

/**
 * Abre janela de controle
 */
 function openLegend(){
    controlLegend = new BrowserWindow({ 
        width: 1200,
        height:800,
        minWidth: 1200,
        minHeight: 800, 
        autoHideMenuBar: true,
        resizable:true,
        minimizable: false,
        alwaysOnTop:false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
        show: false,
        icon: __dirname+'/src/assets/image/icon/Xtools-ico-nano.png',
    });

    nativeTheme.themeSource = 'dark';

    controlLegend.webContents.openDevTools();

    controlLegend.on('ready-to-show', () => {              
        controlLegend.webContents.send('set-controlLegend',file);
        controlLegend.show();
        menu.getMenuItemById(12).enabled = false;
    });

    controlLegend.on('closed', ()=>{
        menu.getMenuItemById(12).enabled = true;
        controlLegend = null;
    });

    controlLegend.loadFile('src/pages/controlLegend/index.html');

}

// function closeWindow(){
//     if(controlLegend!=null){
//         controlLegend.close();
//         controlLegend = null;
//     }
// }


createMenu();

app.whenReady().then(createWindow);

app.on('activate', ()=>{
    if(BrowserWindow.getAllWindows().length ===0){
        createWindow();
    }
});

// app.on('window-all-closed',()=>{
//     console.log('fechou');
//     if(controlLegend){
//         controlLegend.close();  
//     }
//     app.quit();  
// });

// mainWindows.on('closed',()=>{
//     console.log('fechou');
//      //mainWindows.close();
//      controlLegend.close();  
//      app.quit();  
// });


//************************************************************ */
// controle vídeo

ipcMain.on('video-position', (event, data)=>{ 
    
    if(!controlLegend){
        return;
    }     

    positionActualVideo = data;

    //controlLegend.webContents.send('set-positionActual',positionActualVideo);
});

ipcMain.on('video-update', (event, data)=>{  
    
    dataVideoUpdate.currentTime = data.currentTime;
    dataVideoUpdate.duration = data.duration;
    dataVideoUpdate.pointer = data.pointer;
    dataVideoUpdate.videoVelocity = data.videoVelocity;
    dataVideoUpdate.position = data.currentTime;

    data.dataVideoUpdate = dataVideoUpdate;

    if(controlWindows){
        controlWindows.webContents.send('control-video-update', data);
    }  

    //caso tenha erros comentar essa linhas e liberar a linha 434 data 27/07/2022
    if(controlLegend){
        controlLegend.webContents.send('set-positionActual',dataVideoUpdate);
    }
});

function compileData(){
    mainWindows.webContents.send('compile','compilar');    
}