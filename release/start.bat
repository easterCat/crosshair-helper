@echo off
cd /d "%~dp0"
echo Starting FPS Crosshair Helper...
"node_modules\electron\dist\electron.exe" main-fixed.js
