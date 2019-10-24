import { BrowserWindow } from 'electron';

export default class Main {
    static win: Electron.BrowserWindow;
    static application: Electron.App;
    static BrowserWindow;

    private static onReady() {
        Main.win = new Main.BrowserWindow({
            width: 900,
            height: 800,
            backgroundColor: '#fff',
            webPreferences: {
                nodeIntegration: true,
                allowRunningInsecureContent: true, // Allow logger.js to run
            }
        });
        Main.win.loadFile('index.html');
    }

    static main(app: Electron.App, browserWindow: typeof BrowserWindow) {
        Main.BrowserWindow = browserWindow;
        Main.application = app;
        Main.application.on('ready', Main.onReady);
    }
}
