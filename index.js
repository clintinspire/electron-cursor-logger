const electron = require('electron')
const { app, BrowserWindow, ipcMain } = electron

function createWindow() {
    let win = new BrowserWindow({
        width: 900,
        height: 800,
        backgroundColor: '#fff',
        webPreferences: {
            nodeIntegration: true,
            allowRunningInsecureContent: true, // Allow logger.js to run
        }
    })
    win.loadFile('index.html')
}

function formatLog(logObj) {
    let ts = Date.now();
    let date_ob = new Date(ts);
    let day = date_ob.toString().split(' ')[0]
    let date = date_ob.getDate();
    let month = date_ob.toLocaleString('default', { month: 'short' });
    let year = date_ob.getFullYear();
    let hours = date_ob.getHours();
    let minutes = date_ob.getMinutes();
    let seconds = date_ob.getSeconds();

    return `[${day}, ${date} ${month} ${year} ${hours}:${minutes}:${seconds}] - { x: ${logObj.xpos}, y: ${logObj.ypos} }`
}

app.on('ready', function () {
    createWindow();
})

ipcMain.on('cursor-position-changed', (event, status) => {
    console.log(formatLog(status))
})
