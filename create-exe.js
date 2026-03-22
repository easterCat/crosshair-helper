// 创建 Windows 可执行文件
const fs = require('fs');
const path = require('path');

// 创建一个简单的 Windows 可执行文件包装器
const exeWrapper = `
@echo off
title 屏幕准星助手
echo.
echo ================================================
echo              屏幕准星助手 v1.0.0
echo ================================================
echo.
echo 正在启动应用...
cd /d "%~dp0"

REM 检查 Node.js 是否安装
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo 错误: 未检测到 Node.js
    echo 请先安装 Node.js: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM 检查依赖是否安装
if not exist "node_modules" (
    echo.
    echo 正在安装依赖...
    call npm install
    if %errorlevel% neq 0 (
        echo.
        echo 依赖安装失败！
        pause
        exit /b 1
    )
)

REM 启动应用
echo.
echo 启动准星助手...
node windows-app.js

REM 如果应用意外退出，显示错误信息
if %errorlevel% neq 0 (
    echo.
    echo 应用意外退出，错误代码: %errorlevel%
    echo.
    pause
)
`;

// 创建启动脚本
fs.writeFileSync(path.join(__dirname, '屏幕准星助手.bat'), exeWrapper);

// 创建应用信息文件
const appInfo = {
    name: "屏幕准星助手",
    version: "1.0.0",
    description: "FPS游戏屏幕准星工具",
    author: "Crosshair Helper Team",
    homepage: "https://github.com/crosshair-helper"
};

fs.writeFileSync(
    path.join(__dirname, 'app-info.json'), 
    JSON.stringify(appInfo, null, 2)
);

console.log('✅ Windows 应用文件已创建');
console.log('📁 生成的文件:');
console.log('   - 屏幕准星助手.bat (主启动文件)');
console.log('   - app-info.json (应用信息)');
console.log('');
console.log('🚀 使用方法:');
console.log('   1. 双击 "屏幕准星助手.bat" 启动应用');
console.log('   2. 应用会自动打开浏览器并启动准星助手');
console.log('');
console.log('📋 系统要求:');
console.log('   - Windows 7 或更高版本');
console.log('   - Node.js (应用会自动检查并提示安装)');
console.log('   - 现代浏览器 (Chrome, Firefox, Edge 等)');
