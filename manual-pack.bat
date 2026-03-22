@echo off
cd /d "%~dp0"
echo Creating portable application package...
echo.

REM Create output directory
if not exist "release" mkdir release

REM Copy essential files
echo Copying application files...
copy "main-fixed.js" "release\" >nul
copy "preload.js" "release\" >nul
copy "desktop-web.html" "release\" >nul
copy "overlay.html" "release\" >nul
copy "package.json" "release\" >nul
copy "start.bat" "release\" >nul

REM Create node_modules structure
echo Creating node_modules structure...
if not exist "release\node_modules\electron\dist" mkdir "release\node_modules\electron\dist"
copy "node_modules\electron\dist\electron.exe" "release\node_modules\electron\dist\" >nul

REM Copy electron resources
if exist "node_modules\electron\dist\resources" xcopy "node_modules\electron\dist\resources" "release\node_modules\electron\dist\resources\" /E /I /Q >nul

REM Create README
echo Creating README...
echo FPS Crosshair Helper - Portable Version > "release\README.txt"
echo. >> "release\README.txt"
echo To run the application: >> "release\README.txt"
echo 1. Double-click start.bat >> "release\README.txt"
echo 2. Or run: node_modules\electron\dist\electron.exe main-fixed.js >> "release\README.txt"

echo.
echo Portable package created in 'release' folder!
echo You can zip this folder and distribute it.
pause
