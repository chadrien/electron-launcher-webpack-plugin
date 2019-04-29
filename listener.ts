import { BrowserWindow, app } from 'electron';
import WebSocket from 'ws';
import { PORT, RELOAD_BROWSER, CLOSE_APP } from './ElectronLauncherPlugin';

const wsClient = new WebSocket(`ws://localhost:${PORT}`);

wsClient.on('message', (data: RELOAD_BROWSER | CLOSE_APP): void => {
  switch (data) {
    case 'RELOAD_BROWSER':
      BrowserWindow && BrowserWindow.getAllWindows().map((window): void => window.reload());
      break;
    case 'CLOSE_APP':
      app.quit();
      break;
  }
});
