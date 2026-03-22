console.log('=== Electron Debug ===');
console.log('Node.js version:', process.versions.node);
console.log('Electron version:', process.versions.electron);

try {
  const electron = require('electron');
  console.log('Electron module loaded successfully');
  console.log('Available properties:', Object.keys(electron));
  
  const { ipcMain } = electron;
  console.log('ipcMain type:', typeof ipcMain);
  console.log('ipcMain:', ipcMain);
  
  if (ipcMain) {
    console.log('ipcMain.handle type:', typeof ipcMain.handle);
  }
} catch (error) {
  console.error('Error loading electron:', error);
}

console.log('=== End Debug ===');
