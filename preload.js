const { contextBridge, ipcRenderer } = require('electron');

// 设置Electron环境标识
window.process = { type: 'renderer' };

// 暴露安全的API给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 配置管理
  getConfig: () => ipcRenderer.invoke('get-config'),
  saveConfig: (config) => ipcRenderer.invoke('save-config', config),
  updateCrosshair: (config) => ipcRenderer.invoke('update-crosshair', config),
  getPresets: () => ipcRenderer.invoke('get-presets'),
  savePreset: (name, config) => ipcRenderer.invoke('save-preset', name, config),
  deletePreset: (name) => ipcRenderer.invoke('delete-preset', name),
  
  // IPC事件监听
  onConfigUpdated: (callback) => ipcRenderer.on('config-updated', callback),
  onUpdateConfig: (callback) => ipcRenderer.on('update-config', callback),
  onToggleCrosshair: (callback) => ipcRenderer.on('toggle-crosshair', callback),
  
  // 热键管理
  setHotkeys: (toggleKey, switchKey) => ipcRenderer.invoke('set-hotkeys', toggleKey, switchKey),
  
  // 拖拽管理
  enableDrag: () => ipcRenderer.invoke('enable-drag'),
  disableDrag: () => ipcRenderer.invoke('disable-drag'),
  
  // 覆盖窗口控制
  toggleOverlay: () => ipcRenderer.invoke('toggle-overlay'),
  setCrosshairVisible: (visible) => ipcRenderer.invoke('set-crosshair-visible', visible),
  
  // 窗口控制
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window')
});

console.log('Preload script executed successfully');
