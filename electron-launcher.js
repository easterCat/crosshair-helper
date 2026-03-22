const { spawn } = require('child_process');
const path = require('path');

// 直接调用 electron CLI
const electronPath = path.join(__dirname, 'node_modules', '.bin', 'electron');
const mainScript = path.join(__dirname, 'minimal-main.js');

console.log('Launching Electron...');
console.log('Electron path:', electronPath);
console.log('Main script:', mainScript);

const child = spawn('node', [electronPath, mainScript], {
  stdio: 'inherit',
  shell: true,
  cwd: __dirname
});

child.on('error', (error) => {
  console.error('Failed to start Electron:', error);
});

child.on('close', (code) => {
  console.log(`Electron exited with code ${code}`);
});
