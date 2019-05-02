import { Compiler, compilation } from 'webpack';
import WebSocket, { Server } from 'ws';
import { toArray } from 'lodash';
import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import { Subject, combineLatest } from 'rxjs';
import { take } from 'rxjs/operators';

export const PORT = parseInt(process.env.ELECTRON_WEBPACK_PLUGIN_PORT || '60817', 10);
export type RELOAD_BROWSER = 'RELOAD_BROWSER';
export type CLOSE_APP = 'CLOSE_APP';

let wsClients: WebSocket[] = [];
function sendWsCommand(command: RELOAD_BROWSER | CLOSE_APP): void {
  wsClients = wsClients.filter((ws): boolean => {
    try {
      ws.send(command); // Hacky but working way to remove disconnected client
      return true;
    } catch {
      return false;
    }
  });
}

const mainEmitted$: Subject<compilation.Compilation> = new Subject();
const rendererEmitted$: Subject<void> = new Subject();
let electronProcess: ChildProcessWithoutNullStreams;
combineLatest(mainEmitted$, rendererEmitted$.pipe(take(1))).subscribe(([ compilation ]): void => {
  if (electronProcess) {
    electronProcess.kill();
  }

  electronProcess = spawn('npx', [ 'electron',  toArray(compilation.assets)[0].existsAt ]);
  electronProcess.stdout.on('data', (data): void => {
    console.log(data.toString());
  });
  electronProcess.stderr.on('data', (data): void => {
    console.error(data.toString());
  });
});

export default class ElectronLauncherPlugin {
  private isMain: boolean;

  public apply(compiler: Compiler): void {
    if (compiler.options.mode !== 'development') return; // only run in development mode

    if (this.isMain) {
      const wsServer = new Server({
        port: PORT,
      });
      wsServer.on('connection', (ws): void => { wsClients = [ ...wsClients, ws ]; });

      compiler.hooks.afterEmit.tap('ElectronLauncherPlugin', (compilation): void => {
        sendWsCommand('CLOSE_APP');
        mainEmitted$.next(compilation);
      });
    } else {
      compiler.hooks.afterEmit.tap('ElectronLauncherPlugin', (): void => {
        sendWsCommand('RELOAD_BROWSER');
        rendererEmitted$.next();
      });
    }
  }

  public constructor(isMain: boolean) {
    this.isMain = isMain;
  }
}
