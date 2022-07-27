const { app } = require('electron');

function file() {
    var arq = {
        name:'novo-arquivo.ply',
        data:'novos dados',
        saved: false,
        path: app.getAppPath('documents')+'/novo-arquivo.ply',
        urlVideo:null
    }

    return arq
   
}

module.exports = file();

