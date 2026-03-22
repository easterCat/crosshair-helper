console.log('Starting basic test...');

try {
  const electron = require('electron');
  console.log('Electron required successfully');
  console.log('Type:', typeof electron);
  
  // 尝试获取 app
  if (electron.app) {
    console.log('electron.app exists');
  } else {
    console.log('electron.app does not exist');
  }
  
  // 尝试直接获取
  const app = require('electron').app;
  console.log('Direct app:', typeof app);
  
} catch (error) {
  console.error('Error:', error);
}
