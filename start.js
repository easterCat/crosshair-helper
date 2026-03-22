const { spawn } = require('child_process');
const path = require('path');

const electronPath = path.join(__dirname, 'node_modules', '.bin', 'electron.cmd');
const mainScript = path.join(__dirname, 'main.js');

console.log('Starting Electron with:', electronPath);
console.log('Main script:', mainScript);

const child = spawn(electronPath, [mainScript, '--dev'], {
  stdio: 'inherit',
  shell: true
});

child.on('error', (error) => {
  console.error('Failed to start Electron:', error);
});

child.on('close', (code) => {
  console.log(`Electron exited with code ${code}`);
});
