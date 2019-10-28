import { BrowserWindow, screen } from "electron";
const MARGIN = 20;
const BROWSER_WINDOW = {
    height: 500,
    width: 400,
};

export default class Main {
    public static main(app: Electron.App, browserWindow: typeof BrowserWindow) {
        Main.BrowserWindow = browserWindow;
        Main.application = app;
        Main.application.on("ready", Main.onReady);
    }
    private static win: Electron.BrowserWindow;
    private static application: Electron.App;
    private static BrowserWindow: typeof BrowserWindow;

    private static onReady() {
        const { height, width } = BROWSER_WINDOW;
        Main.win = new Main.BrowserWindow({
            backgroundColor: "#fff",
            height,
            webPreferences: {
                allowRunningInsecureContent: true,
                nodeIntegration: true,
            },
            width,
        });
        Main.win.loadFile("index.html");
        Main.startLogging();
    }

    private static isNearBounds(coordinates: { x: number; y: number; }) {
        const { height, width } = screen.getPrimaryDisplay().bounds;
        const isNearSides = (coordinates.x < MARGIN || coordinates.x > width - MARGIN);
        const isNearTopOrBottom = (coordinates.y < MARGIN || coordinates.y > height - MARGIN);
        return (isNearSides || isNearTopOrBottom);
    }

    private static startLogging() {
        let mouseX: number = 0;
        let mouseY: number = 0;
        setInterval(() => {
            const newMousePosition = screen.getCursorScreenPoint();
            const timestamp = new Date().toUTCString();
            if (newMousePosition.x !== mouseX && newMousePosition.y !== mouseY) {
                console.log(`[${timestamp}] -`, newMousePosition);
                if (!Main.isNearBounds(newMousePosition)) {
                    Main.win.webContents.send("cursor-update", newMousePosition);
                }
            }
            mouseX = newMousePosition.x;
            mouseY = newMousePosition.y;
        }, 0);
    }
}
