const { Notification } = require('electron');
const { resolve } = require('path');

const iconPath = resolve(__dirname, '../','assets','image','icon', 'ico-video.png');

function createNotification(title, body){        

     new Notification({
            title:title, 
            subtitle:'subtitle',
            body:body,
            icon:iconPath,
            urgency:'critical'
        }).show();
}

module.exports = createNotification;
