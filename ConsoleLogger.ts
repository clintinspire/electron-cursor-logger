import { ipcMain } from 'electron';

class LogObjType {
    xpos: number
    ypos: number
}

export default class ConsoleLogger {
    constructor() {
        ipcMain.on('cursor-position-changed', this.callBack)
    }

    formatLog(logObj: LogObjType) {
        
    }

    callBack(event, status) {
        let ts = Date.now();
        let date_ob = new Date(ts);
        let day = date_ob.toString().split(' ')[0]
        let date = date_ob.getDate();
        let month = date_ob.toLocaleString('default', { month: 'short' });
        let year = date_ob.getFullYear();
        let hours = date_ob.getHours();
        let minutes = date_ob.getMinutes();
        let seconds = date_ob.getSeconds();
        const text =`[${day}, ${date} ${month} ${year} ${hours}:${minutes}:${seconds}] - { x: ${status.xpos}, y: ${status.ypos} }`
        console.log(text)
    }
}