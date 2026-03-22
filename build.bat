@echo off
cd /d "%~dp0"
echo FPS Crosshair Helper Build Script
echo.
echo Choose build option:
echo 1. Windows Installer (NSIS)
echo 2. Windows Portable (EXE)
echo 3. Both
echo.
set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" goto installer
if "%choice%"=="2" goto portable
if "%choice%"=="3" goto both
goto installer

:installer
echo.
echo Building Windows Installer...
npm run build-win
goto end

:portable
echo.
echo Building Windows Portable...
npm run build-portable
goto end

:both
echo.
echo Building Windows Installer...
npm run build-win
echo.
echo Building Windows Portable...
npm run build-portable
goto end

:end
echo.
if exist "dist" (
    echo Build completed successfully!
    echo Output files are in the dist directory
    dir "dist\*.exe" /B
) else (
    echo Build failed, please check error messages
)
pause
