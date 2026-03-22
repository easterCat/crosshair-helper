const electron = require('electron');
const { app, BrowserWindow, globalShortcut, screen, ipcMain, Menu, Tray } = electron;
const path = require('path');
const Store = require('electron-store');

// 初始化配置存储
const store = new Store();

let mainWindow;
let overlayWindow;
let tray;

// 默认配置
const defaultConfig = {
  style: 'cross',
  color: '#00ff00',
  size: 20,
  thickness: 2,
  opacity: 0.8,
  x: 0.5,
  y: 0.5,
  gap: 5,
  visible: true,
  hotkeyToggle: 'F6',
  hotkeySwitch: 'F7'
};

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1366,
    height: 768,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    title: '屏幕准星助手',
    show: false
  });

  mainWindow.loadFile('index.html');

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    if (overlayWindow) {
      overlayWindow.close();
    }
  });

  // 开发模式下打开开发者工具
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }
}

function createOverlayWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  
  overlayWindow = new BrowserWindow({
    width: width,
    height: height,
    x: 0,
    y: 0,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    movable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  overlayWindow.setIgnoreMouseEvents(true);
  overlayWindow.loadFile('overlay.html');
  
  overlayWindow.on('closed', () => {
    overlayWindow = null;
  });

  // 设置窗口穿透点击
  overlayWindow.on('blur', () => {
    overlayWindow.setIgnoreMouseEvents(true);
  });
}

function createTray() {
  try {
    tray = new Tray(path.join(__dirname, 'assets', 'icon.png'));
  } catch (error) {
    console.log('图标文件不存在，跳过系统托盘创建');
    return;
  }
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示/隐藏准星',
      click: () => {
        toggleCrosshair();
      }
    },
    {
      label: '打开主界面',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        } else {
          createMainWindow();
        }
      }
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        app.quit();
      }
    }
  ]);

  tray.setToolTip('屏幕准星助手');
  tray.setContextMenu(contextMenu);

  tray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    } else {
      createMainWindow();
    }
  });
}

function registerGlobalShortcuts() {
  const config = store.get('config', defaultConfig);
  
  // 注册显示/隐藏快捷键
  globalShortcut.register(config.hotkeyToggle, () => {
    toggleCrosshair();
  });

  // 注册切换配置快捷键
  globalShortcut.register(config.hotkeySwitch, () => {
    switchConfig();
  });
}

function toggleCrosshair() {
  const config = store.get('config', defaultConfig);
  config.visible = !config.visible;
  store.set('config', config);
  
  if (overlayWindow) {
    overlayWindow.webContents.send('toggle-crosshair', config.visible);
  }
  
  if (mainWindow) {
    mainWindow.webContents.send('config-updated', config);
  }
}

function switchConfig() {
  const presets = store.get('presets', {});
  const presetNames = Object.keys(presets);
  
  if (presetNames.length > 0) {
    const currentPreset = store.get('currentPreset', '');
    const currentIndex = presetNames.indexOf(currentPreset);
    const nextIndex = (currentIndex + 1) % presetNames.length;
    const nextPreset = presetNames[nextIndex];
    
    const config = { ...presets[nextPreset] };
    store.set('config', config);
    store.set('currentPreset', nextPreset);
    
    if (overlayWindow) {
      overlayWindow.webContents.send('config-updated', config);
    }
    
    if (mainWindow) {
      mainWindow.webContents.send('config-updated', config);
      mainWindow.webContents.send('preset-switched', nextPreset);
    }
  }
}

// IPC 处理程序
ipcMain.handle('get-config', () => {
  return store.get('config', defaultConfig);
});

ipcMain.handle('save-config', (event, config) => {
  store.set('config', config);
  if (overlayWindow) {
    overlayWindow.webContents.send('config-updated', config);
  }
});

ipcMain.handle('get-presets', () => {
  return store.get('presets', {});
});

ipcMain.handle('save-preset', (event, name, config) => {
  const presets = store.get('presets', {});
  presets[name] = { ...config };
  store.set('presets', presets);
});

ipcMain.handle('delete-preset', (event, name) => {
  const presets = store.get('presets', {});
  delete presets[name];
  store.set('presets', presets);
});

ipcMain.handle('set-hotkeys', (event, toggleKey, switchKey) => {
  // 注销旧的快捷键
  globalShortcut.unregisterAll();
  
  // 注册新的快捷键
  globalShortcut.register(toggleKey, () => {
    toggleCrosshair();
  });
  
  globalShortcut.register(switchKey, () => {
    switchConfig();
  });
  
  const config = store.get('config', defaultConfig);
  config.hotkeyToggle = toggleKey;
  config.hotkeySwitch = switchKey;
  store.set('config', config);
});

ipcMain.handle('enable-drag', () => {
  if (overlayWindow) {
    overlayWindow.setIgnoreMouseEvents(false);
  }
});

ipcMain.handle('disable-drag', () => {
  if (overlayWindow) {
    overlayWindow.setIgnoreMouseEvents(true);
  }
});

app.whenReady().then(() => {
  createMainWindow();
  createOverlayWindow();
  createTray();
  registerGlobalShortcuts();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
    createOverlayWindow();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

// 防止多实例运行
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}
