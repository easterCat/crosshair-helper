// 最简化的 Electron 应用
const electron = require('electron');
const { app, BrowserWindow } = electron;

console.log('Electron loaded:', typeof electron);
console.log('App type:', typeof app);

function createWindow() {
  const win = new BrowserWindow({
    width: 1366,
    height: 768,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile('index.html');
  win.webContents.openDevTools();
}

if (typeof app !== 'undefined') {
  app.on('ready', createWindow);
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
} else {
  console.error('App is undefined');
}
