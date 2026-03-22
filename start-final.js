const { spawn } = require('child_process');
const path = require('path');

// 使用 electron.cmd
const electronCmd = path.join(__dirname, 'node_modules', '.bin', 'electron.cmd');
const mainScript = path.join(__dirname, 'minimal-main.js');

console.log('Starting Electron with .cmd file...');

const child = spawn(electronCmd, [mainScript], {
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
