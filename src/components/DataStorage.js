const { localStorage, sessionStorage } = require('electron-browser-storage');

class DataStorage {
	
	constructor(){
	    
    }    

    add(key, data){        
        localStorage.setItem(key, data);
    }

    async get(key){
        return await localStorage.getItem(key);
    }

    async remove(key){
        await localStorage.removeItem(key);
    }

    async clear(){
        await localStorage.clear();
    }

    
}

module.exports = DataStorage;