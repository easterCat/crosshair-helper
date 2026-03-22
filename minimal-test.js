const electron = require('electron');
const { app, BrowserWindow } = electron;

console.log('Electron version:', process.versions.electron);
console.log('Node.js version:', process.versions.node);
console.log('ipcMain available:', typeof electron.ipcMain !== 'undefined');
console.log('app available:', typeof app !== 'undefined');

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

if (typeof app !== 'undefined' && app.whenReady) {
  app.whenReady().then(() => {
    console.log('App ready');
    createWindow();
  });

  app.on('window-all-closed', () => {
    app.quit();
  });
} else {
  console.error('Electron app object not available');
}
