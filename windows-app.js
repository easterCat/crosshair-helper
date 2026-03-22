// Windows 桌面应用 - 使用 Node.js 原生模块
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

// 获取本机IP地址
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const interface of interfaces[name]) {
            if (interface.family === 'IPv4' && !interface.internal) {
                return interface.address;
            }
        }
    }
    return '127.0.0.1';
}

// 创建 HTTP 服务器来提供应用
const server = http.createServer((req, res) => {
    let filePath = path.join(__dirname, req.url === '/' ? 'desktop-web.html' : req.url);
    
    const extname = path.extname(filePath);
    let contentType = 'text/html';
    
    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.json':
            contentType = 'application/json';
            break;
        case '.ico':
            contentType = 'image/x-icon';
            break;
        case '.png':
            contentType = 'image/png';
            break;
        case '.jpg':
            contentType = 'image/jpeg';
            break;
    }
    
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404);
                res.end('File not found');
            } else {
                res.writeHead(500);
                res.end('Server error');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

const PORT = 3001;
const localIP = getLocalIP();

server.listen(PORT, '127.0.0.1', () => {
    console.log('');
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║                    🎯 FPS 准星助手 v2.0                      ║');
    console.log('║                                                              ║');
    console.log('║  🌐 本地地址: http://localhost:' + PORT + '                        ║');
    console.log('║  📱 局域网地址: http://' + localIP + ':' + PORT + '                    ║');
    console.log('║                                                              ║');
    console.log('║  🚀 正在打开浏览器...                                        ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log('');
    
    // 自动打开默认浏览器
    let startCommand;
    if (process.platform === 'darwin') {
        startCommand = 'open';
    } else if (process.platform === 'win32') {
        startCommand = 'cmd';
    } else {
        startCommand = 'xdg-open';
    }
    
    if (process.platform === 'win32') {
        // 使用 PowerShell 设置浏览器窗口大小
        const powershellScript = `
            $process = Start-Process "http://localhost:${PORT}" -PassThru
            Start-Sleep -Milliseconds 500
            $sig = @"
            [DllImport("user32.dll")]
            public static extern bool ShowWindowAsync(IntPtr hWnd, int nCmdShow);
            [DllImport("user32.dll")]
            public static extern bool SetWindowPos(IntPtr hWnd, IntPtr hWndInsertAfter, int X, int Y, int cx, int cy, uint uFlags);
            "@
            $type = Add-Type -MemberDefinition $sig -Name "Win32" -PassThru
            $hwnd = $process.MainWindowHandle
            $type::SetWindowPos($hwnd, [IntPtr]::Zero, 0, 0, 1366, 768, 0x4000)
        `;
        spawn('powershell', ['-Command', powershellScript], { 
            detached: true,
            stdio: 'ignore'
        });
    } else {
        spawn(startCommand, [`http://localhost:${PORT}`], { 
            detached: true,
            stdio: 'ignore'
        });
    }
    
    console.log('📋 使用说明:');
    console.log('   🎯 在浏览器中自定义准星设置');
    console.log('   ⌨️  使用 F6 键显示/隐藏准星');
    console.log('   🔄 使用 F7 键切换覆盖模式');
    console.log('   🚪 按 ESC 键退出覆盖模式');
    console.log('   🌐 支持局域网访问 (手机/平板)');
    console.log('');
    console.log('💡 提示: 如果浏览器没有自动打开，请手动访问上述地址');
    console.log('');
});

// 优雅关闭
process.on('SIGINT', () => {
    console.log('');
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║                    👋 正在关闭应用...                        ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    server.close(() => {
        console.log('✅ 应用已关闭，感谢使用！');
        process.exit(0);
    });
});

// 处理意外关闭
process.on('SIGTERM', () => {
    console.log('📡 收到终止信号，正在关闭...');
    server.close(() => {
        process.exit(0);
    });
});
