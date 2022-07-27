const { Tray } = require('electron');
const { resolve } = require('path');

const iconPath = resolve(__dirname, '../','assets','image','icon', 'ico-video.png');

function createTray(){
    const tray = new Tray(iconPath);
    tray.setToolTip('Player Xtool');    

    return tray;
}

module.exports = createTray();