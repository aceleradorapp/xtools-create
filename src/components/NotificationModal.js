class NotificationModal {
	
	constructor(element){
	    this.windowElement = document.getElementById(element);
        this.titleElement = document.getElementById('title-window');
        this.textElement = document.getElementById('text-window');

        this.infoElement = document.getElementById('btn-info');
        
        this.btn1 = document.getElementById('btn-1');
        this.btn2 = document.getElementById('btn-2');
        this.btnClose = document.getElementById('btn-close');

        this.btnClose.onclick = this._btnCloseHandler.bind(this);
        this.funcReturn = null;
    }

    show(title, text, func, btn1='OK', btn2='Cancelar', btn1Show=true, btn2show=true,info='!'){

        this.funcReturn = func;
        this.titleElement.innerHTML = title;
        this.textElement.innerHTML = text;

        this.btn1.innerHTML = btn1;
        this.btn2.innerHTML = btn2;

        this._createEvents();   
        this.windowElement.classList.remove('hide-window'); 

        this.infoElement.innerHTML = info;
        
        if(btn1Show){
            this.btn1.classList.remove('hide-window');
        }else{
            this.btn1.classList.add('hide-window');
        }   
        
        if(btn2show){
            this.btn2.classList.remove('hide-window');
        }else{
            this.btn2.classList.add('hide-window');
        }
    }

    _createEvents(){
        this.btn1.onclick = this._btnHandler.bind(this);
        this.btn2.onclick = this._btnHandler.bind(this);        
    }

    _btnHandler(e){        
        this.funcReturn(e.target.outerText);        
        this.windowElement.classList.add('hide-window');        
    }

    _btnCloseHandler(e){ 
        let obj = {
            target:{outerText:'close'}
        }  
        this._btnHandler(obj);             
    }

    
}

module.exports = NotificationModal;