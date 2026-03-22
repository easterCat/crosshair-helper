const electron = require('electron');
const { app, BrowserWindow, globalShortcut, screen, ipcMain, Menu, Tray } = electron;
const path = require('path');
const fs = require('fs');

// 简单的配置存储
const configPath = path.join(__dirname, 'config.json');
const presetsPath = path.join(__dirname, 'presets.json');

let currentConfig = {
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

let presets = {};

// 加载配置
function loadConfig() {
  try {
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf8');
      currentConfig = { ...currentConfig, ...JSON.parse(data) };
    }
  } catch (error) {
    console.log('Failed to load config:', error);
  }
  
  try {
    if (fs.existsSync(presetsPath)) {
      const data = fs.readFileSync(presetsPath, 'utf8');
      presets = JSON.parse(data);
    }
  } catch (error) {
    console.log('Failed to load presets:', error);
  }
}

// 保存配置
function saveConfig() {
  try {
    fs.writeFileSync(configPath, JSON.stringify(currentConfig, null, 2));
  } catch (error) {
    console.log('Failed to save config:', error);
  }
}

// 保存预设
function savePresets() {
  try {
    fs.writeFileSync(presetsPath, JSON.stringify(presets, null, 2));
  } catch (error) {
    console.log('Failed to save presets:', error);
  }
}

let mainWindow;
let overlayWindow;
let tray;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1366,
    height: 768,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    title: '屏幕准星助手',
    show: false
  });

  mainWindow.loadFile('desktop-web.html');

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    if (overlayWindow) {
      overlayWindow.close();
    }
  });

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
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  overlayWindow.setIgnoreMouseEvents(true);
  overlayWindow.loadFile('overlay.html');
  overlayWindow.show(); // 确保窗口显示
  
  overlayWindow.on('closed', () => {
    overlayWindow = null;
  });

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
  globalShortcut.register(currentConfig.hotkeyToggle, () => {
    toggleCrosshair();
  });

  globalShortcut.register(currentConfig.hotkeySwitch, () => {
    switchConfig();
  });
}

function toggleCrosshair() {
  currentConfig.visible = !currentConfig.visible;
  saveConfig();
  
  if (overlayWindow) {
    overlayWindow.webContents.send('toggle-crosshair', currentConfig.visible);
  }
  
  if (mainWindow) {
    mainWindow.webContents.send('config-updated', currentConfig);
  }
}

function switchConfig() {
  const presetNames = Object.keys(presets);
  
  if (presetNames.length > 0) {
    const currentPreset = '';
    const currentIndex = presetNames.indexOf(currentPreset);
    const nextIndex = (currentIndex + 1) % presetNames.length;
    const nextPreset = presetNames[nextIndex];
    
    currentConfig = { ...currentConfig, ...presets[nextPreset] };
    saveConfig();
    
    if (overlayWindow) {
      overlayWindow.webContents.send('config-updated', currentConfig);
    }
    
    if (mainWindow) {
      mainWindow.webContents.send('config-updated', currentConfig);
      mainWindow.webContents.send('preset-switched', nextPreset);
    }
  }
}

// IPC 处理程序
ipcMain.handle('get-config', () => {
  return currentConfig;
});

ipcMain.handle('save-config', (event, config) => {
  currentConfig = { ...currentConfig, ...config };
  saveConfig();
  if (overlayWindow) {
    overlayWindow.webContents.send('update-config', currentConfig);
  }
  return currentConfig;
});

ipcMain.handle('update-crosshair', (event, config) => {
  console.log('Main: Received update-crosshair', config);
  currentConfig = { ...currentConfig, ...config };
  if (overlayWindow) {
    console.log('Main: Sending to overlay window', currentConfig);
    overlayWindow.webContents.send('update-config', currentConfig);
  }
  return currentConfig;
});

ipcMain.handle('get-presets', () => {
  return presets;
});

ipcMain.handle('save-preset', (event, name, config) => {
  presets[name] = { ...config };
  savePresets();
  return presets;
});

ipcMain.handle('delete-preset', (event, name) => {
  delete presets[name];
  savePresets();
  return presets;
});

ipcMain.handle('set-hotkeys', (event, toggleKey, switchKey) => {
  globalShortcut.unregisterAll();
  
  globalShortcut.register(toggleKey, () => {
    if (overlayWindow) {
      overlayWindow.webContents.send('toggle-crosshair');
    }
  });
  
  globalShortcut.register(switchKey, () => {
    if (overlayWindow) {
      overlayWindow.webContents.send('switch-overlay');
    }
  });
  
  currentConfig.hotkeyToggle = toggleKey;
  currentConfig.hotkeySwitch = switchKey;
  saveConfig();
  if (overlayWindow) {
    overlayWindow.setIgnoreMouseEvents(true);
  }
});

ipcMain.handle('toggle-overlay', () => {
  if (overlayWindow) {
    if (overlayWindow.isVisible()) {
      overlayWindow.hide();
    } else {
      overlayWindow.show();
    }
  }
});

ipcMain.handle('set-crosshair-visible', (event, visible) => {
  currentConfig.visible = visible;
  if (overlayWindow) {
    overlayWindow.webContents.send('update-config', currentConfig);
  }
  saveConfig();
});

ipcMain.handle('minimize-window', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.handle('close-window', () => {
  if (mainWindow) {
    mainWindow.close();
  }
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
  loadConfig();
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
