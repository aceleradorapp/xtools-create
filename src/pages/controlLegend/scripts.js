const { ipcRenderer } = require('electron');
const NotificationModal = require('../../components/NotificationModal.js');


var notificationModal = new NotificationModal('windows-notification');

// windowsNotification.show('Teste', 'Ola seja bem vindo!',(e)=>{
//     console.log(e);
// },'sim','não',true, true,'?');

var title = '';

var totalCharacters = 0;
var dataLegend = [];

var pointerLegend = null;
var typeActionValue='screen';
var legendSelected = null;
var idLegendSelected = null;
var edition = false;
var videoVelocity = 1;

const titleElement = document.getElementById('title');
const textLegendElement = document.getElementById('textLegend');
const textNoteElement = document.getElementById('textNote');
const addLegendElement = document.getElementById('addLegend');
const clearLegend = document.getElementById('clearLegend');
const addNoteElement = document.getElementById('addNote');
const clearNoted = document.getElementById('clearNote');
const displayCharacter = document.getElementById('displayCharacter');
const displayPositionVideoElement = document.getElementById('displayPositionVideo');
const displayInitialPointElement = document.getElementById('displayInitialPoint');
const displayFinalPointElement = document.getElementById('displayFinalPoint');
const displayMomentElement = document.getElementById('displayMoment');
const legends = document.getElementById('legends');
const initialPointElement = document.getElementById('initialPoint');
const finalPointElement = document.getElementById('finalPoint');
const saveRecordElement = document.getElementById('saveRecord');

const buttonInteractiveElement = document.getElementById('button-interactive');
const buttonEditElement = document.getElementById('button-edit');
const buttonclearElement = document.getElementById('button-clear');

var positionVideo = 0;
var positionVideoData = 0;
var registerPoiners = {init:0, final:0};

addLegendElement.disabled = true;
addLegendElement.classList.add('blockButton');
clearLegend.disabled = true;
clearLegend.classList.add('blockButton');
clearNoted.disabled = true;
clearNoted.classList.add('blockButton');
addNoteElement.disabled = true;            
addNoteElement.classList.add('blockButton');
saveRecordElement.disabled = true;
saveRecordElement.classList.add('blockButton');



//Recebe dados do arquivo principal
ipcRenderer.on('set-controlLegend', (event, data)=>{
    title = 'Controle de Legendas';

    if(data.data!=null){
        dataLegend = data.data;
    }

    drawLegends();
    init();    

});

ipcRenderer.on('set-positionActual', (event, data)=>{
    positionVideoData = data;    
    positionVideo = data.position;
    videoVelocity = 1;
    displayPositionVideoElement.innerHTML = 'Posição atual do vídeo: '+data.position+' / '+data.duration;
});


function init(){
    titleElement.innerHTML = title;
    events();
}

function events(){
    addLegendElement.onclick = ()=>{
        if(textLegendElement.value == ''){
            return;
        }

        let data = {
            text: textLegendElement.value,
            id: dataLegend.length+1,
            type: typeActionValue,
            character:totalCharacters.length,
            videoInit:0,
            videoFinal:0,
            videoVelocity:1,
            info:null
        };

        if(!edition){
            dataLegend.push(data);
            pointerLegend = dataLegend.length-1;
        }else{

        }


        drawLegends();
        calcTotalCharacter();
        updateData();
        
        idLegendSelected = dataLegend.length-1;
        selectElementLegendById(idLegendSelected);

        //addLegendElement.disabled = true;
        //addLegendElement.classList.add('blockButton');

        //removeRadioChecke();

        textLegendElement.oninput();
    }

    clearLegend.onclick = ()=>{    
        notificationModal.show('Atenção!', 'Realmente deseja apagar o texto da legenda?',(e)=>{
            
            if(e=='Sim'){
                clearLegendAll();
                calcTotalCharacter();
            }

        },'Sim','Não',true, true,'?');            
    }

    addNoteElement.onclick = ()=>{
        if(textNoteElement.value == ''){
            return;
        }

        if(pointerLegend==null){
            return;
        }

        dataLegend[pointerLegend].info = textNoteElement.value;

        clearNoteAll();

        drawLegends();
        updateData();
        selectElementLegendById(idLegendSelected);        
    }

    clearNoted.onclick = ()=>{
        notificationModal.show('Atenção!', 'Realmente deseja apagar o texto de informação?',(e)=>{
            
            if(e=='Sim'){
                clearNoteAll();                
            }

        },'Sim','Não',true, true,'?');        
    }

    textLegendElement.oninput = ()=>{
        if(textLegendElement.value.length <=0){
            clearLegend.disabled = true;
            clearLegend.classList.add('blockButton');
            addLegendElement.disabled = true;
            addLegendElement.classList.add('blockButton');
        }else{
            clearLegend.disabled = false;
            clearLegend.classList.remove('blockButton');
            addLegendElement.disabled = false;
            addLegendElement.classList.remove('blockButton');
        }
        calcTotalCharacter();                
    }

    textNoteElement.oninput = ()=>{
        if(textNoteElement.value.length <=0){
            clearNoted.disabled = true;
            clearNoted.classList.add('blockButton');

            addNoteElement.disabled = true;            
            addNoteElement.classList.add('blockButton');
        }else{
            clearNoted.disabled = false;
            clearNoted.classList.remove('blockButton');

            addNoteElement.disabled = false;            
            addNoteElement.classList.remove('blockButton');
        }
    }

    initialPointElement.onclick = ()=>{
        //displayInitialPointElement.innerHTML = positionVideo;
        registerPoiners.init = positionVideo; 
        updateDisplayCapture(registerPoiners);       
    };

    finalPointElement.onclick = ()=>{
        //displayFinalPointElement.innerHTML = positionVideo;
        registerPoiners.final = positionVideo; 
        updateDisplayCapture(registerPoiners);       
    };

    saveRecordElement.onclick = ()=>{
        dataLegend[pointerLegend].videoInit = registerPoiners.init;
        dataLegend[pointerLegend].videoFinal = registerPoiners.final;
        dataLegend[pointerLegend].type = typeActionValue;

        registerPoiners = {init:0, final:0}; 
        updateDisplayCapture(registerPoiners);  
        drawLegends(); 
        updateData();   
        selectElementLegendById(idLegendSelected); 

        removeRadioChecke();

        saveRecordElement.disabled = true;
        saveRecordElement.classList.add('blockButton');
    }

    var radiosTypes = document.querySelectorAll('input[type=radio][name="typeAction"]');
    radiosTypes.forEach(radio => radio.onchange = () => {
        typeActionValue = radio.value;
        //addLegendElement.disabled = false;
        //addLegendElement.classList.remove('blockButton');
        //dataLegend[pointerLegend].type = typeActionValue;
        saveRecordElement.disabled = false;
        saveRecordElement.classList.remove('blockButton');
        console.log(typeActionValue)
        //COLOCAR AQUI UMA VARIÁVEL P MANTER OS DADOS ESCOLHHIDOS
    });    
}

function updateDisplayCapture(object){
    displayInitialPointElement.innerHTML = object.init;
    displayFinalPointElement.innerHTML = object.final;
}

function calcTotalCharacter(){
    totalCharacters = textLegendElement.value;
    displayCharacter.innerHTML = 'Total de caracteres: '+totalCharacters.length;    
}

function drawLegends(){
    if(dataLegend.length <= 0){
        return;
    }

    legends.innerHTML = createTags();

    createEventsLegend();
    clearLegendAll();

    function createTags(){
        let tag = '';

        for(var i=0; i< dataLegend.length; i++){    
                let imageTypeAction = dataLegend[i].type+'.png';                
                tag += '<div class="legend" data-id-legend = "'+i+'">';                    
                tag += '    <div class="tumbs">';

                tag += '        <div class="tumb tumb-number">';
                tag +=              dataLegend[i].id;
                tag += '        </div>';

                if(dataLegend[i].info != null){
                    tag += '<div class="tumb"><img src="../../assets/image/iconPlayer/info.png" alt=""></div>';
                }else{
                    tag += '<div class="tumb"> </div>';
                }

                if(dataLegend[i].videoInit != 0){
                    tag += '<div class="tumb"><img src="../../assets/image/iconAction/'+imageTypeAction+'" alt=""></div>';
                }else{
                    tag += '<div class="tumb"> </div>';
                }
                
                tag += '    </div>';
                tag += '    <div class="text">';
                tag +=              dataLegend[i].text;                
                tag += '    </div>';
                tag += '    <div class="buttons">';
                tag += '        <button class="btn-cube" data-id="'+i+'"><img src="../../assets/image/iconAction/edit.png" alt=""></button>';
                tag += '        <button class="btn-cube" data-id="'+i+'"><img src="../../assets/image/iconAction/clear.png" alt=""></button>';
                tag += '        <button class="btn-cube" data-id="'+i+'"><img src="../../assets/image/iconAction/iInteraction.png" alt=""></button>';
                tag += '    </div>';
                tag += '</div>';                
        }        

        displayMomentElement.innerHTML = 'Total de momentos: '+dataLegend.length;   
        
        createEventsButtons();

        return tag;
    }
}

function createEventsLegend(){
    let legendElement = getElementsLegend();

    for(var i=0; i< legendElement.length; i++){
        legendElement[i].onclick = selectedLegendHandler;           
    }
}

function createEventsButtons(){
    let buttons = getElementsButtons();    

    for(var i=0; i< buttons.length; i++){
        buttons[i].onclick = selectedButtonsHandler;                 
    }
}

function clearLegendAll(){
    textLegendElement.value = '';
}

function clearNoteAll(){
    textNoteElement.value = '';
}

function selectedLegendHandler(event){
    let legendElements = getElementsLegend();
    var element = event.currentTarget;
    var id = element.getAttribute("data-id-legend");

    idLegendSelected = id;

    for(var i=0; i< legendElements.length; i++){
        legendElements[i].classList.remove('selected');           
    }

    legendSelected = element;
    selectElementLegend(element);

    registerPoiners = {init:dataLegend[id].videoInit, final:dataLegend[id].videoFinal}; 
    updateDisplayCapture(registerPoiners);    

    displayPositionVideoElement.innerHTML = 'Posição atual do vídeo: '+registerPoiners.init+' / '+positionVideoData.duration;

    registerPoiners = {};

    sendIdLegend(id);    
}

function selectedButtonsHandler(event){
    console.log(event);
}

function selectElementLegend(element){
    if(!element){
        return;
    }
    element.classList.add('selected');
}

function selectElementLegendById(id=null){
    if(!id){
        return;
    }

    let elements = getElementsLegend();
    selectElementLegend(elements[id]);
}

function getElementsLegend(){
    let legendElement = document.getElementsByClassName('legend'); 
    return legendElement;
}

function getElementsButtons(){
    let buttonElements = document.getElementsByClassName('btn-cube');
    return buttonElements;
}

//Atualiza dados das legendas
function updateData(){
    ipcRenderer.send('updateData', dataLegend);
}

function sendIdLegend(id){
    pointerLegend = id;
    ipcRenderer.send('sendIdLegend', dataLegend[id]);
}

function checkTypeActrion(){

}

function removeRadioChecke(){
    var radio = document.querySelector('input[type=radio][name=typeAction]:checked');
    radio.checked = false;
}

function edit(){

}

function editLegend(){

}

function editNote(){

}

function editCaptura(){

}