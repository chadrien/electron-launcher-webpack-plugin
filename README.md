# Electron launcher webpack plugin

Makes Electron + Webpack less painfull.


## What's it doing?

* Starts electron after the main and renderer have been compiled for the first time
* Restarts electron when a main process change has been compiled
* Reload your app's [`BrowserWindow`s](https://electronjs.org/docs/api/browser-window) when a renderer process change has been compiled
* Will only run in `development` mode

## Usage

```typescript
// webpack.config.ts

import ElectronLauncherPlugin from 'electron-launcher-webpack-plugin'

const mainConfig: webpack.Configuration = {
  // …
  plugins: [ new ElectronLauncherPlugin(true) ],
};

const rendererConfig: webpack.Configuration = {
  // …
  plugins: [ new ElectronLauncherPlugin(false) ],
}
```

And in your main process file/entry, add: `import 'electron-launcher-webpack-plugin/listener'`
