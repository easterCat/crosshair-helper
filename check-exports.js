const electron = require('electron');
console.log('Electron module type:', typeof electron);
console.log('Electron constructor:', electron.constructor.name);
console.log('Electron length:', electron.length);
console.log('Electron[0]:', electron[0]);
console.log('Electron[1]:', electron[1]);

// 尝试不同的导入方式
try {
  const app = require('electron').app;
  console.log('Direct app import:', typeof app);
} catch (e) {
  console.log('Direct app import failed:', e.message);
}

try {
  const { app } = electron;
  console.log('Destructured app:', typeof app);
} catch (e) {
  console.log('Destructured app failed:', e.message);
}

// 检查是否是函数调用
if (typeof electron === 'function') {
  console.log('Electron is a function, calling it...');
  const result = electron();
  console.log('Result:', result);
}
