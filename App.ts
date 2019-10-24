import { app, BrowserWindow } from 'electron';
import Main from './Main';
import ConsoleLogger from './ConsoleLogger';

Main.main(app, BrowserWindow);
new ConsoleLogger();