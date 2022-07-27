function createMenuMaster(func){
    var clickMenuHandler = func;
    const template = [
        {            
            label:'Arquivo',
            submenu:[
                {
                    id:1,
                    label:'Novo',
                    enabled: true,
                    click(){
                        clickMenuHandler('novo');
                    }
                },
                {
                    id:2,
                    label:'Abrir',
                    enabled: true,
                    click(){
                        clickMenuHandler('abrir');
                    }
                },
                {
                    id:3,
                    label:'Salvar',
                    enabled: false,
                    click(){
                        clickMenuHandler('salvar');
                    }
                },
                {
                    id:4,
                    label:'Salvar como',
                    enabled: false,
                    click(){
                        clickMenuHandler('salvar-como');
                    }
                },
                { 
                    type: 'separator' 
                },
                {
                    id:5,
                    label:'Exportar legenda',
                    enabled: false,
                    click(){
                        clickMenuHandler('exportar-legenda');
                    }
                },
                {
                    id:6,
                    label:'Importar legenda',
                    enabled: false,
                    click(){
                        clickMenuHandler('imortar-legenda');
                    }
                },
                { 
                    type: 'separator' 
                },
                {
                    id:7,
                    label:'Compilar dados',
                    enabled: false,
                    click(){
                        clickMenuHandler('compilar-dados');
                    }
                },
                { 
                    type: 'separator' 
                },
                {
                    id:100,
                    label:'Fechar',
                    role:process.platform === 'darwin' ? 'close' : 'quit'
                }
            ]
        },
        {
            id:10,
            label:'Ferramentas',            
            submenu:[
                {
                    id:11,
                    label:'Controle',
                    enabled: false, 
                    click(){
                        clickMenuHandler('controle');
                    }                 
                },
                {
                    id:12,
                    label:'Legendas',
                    enabled: false, 
                    click(){
                        clickMenuHandler('legendas');
                    }                                      
                }
            ]
        }
    ];

    return template;
}

module.exports = createMenuMaster;