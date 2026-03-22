const { app, process } = require('electron');

class PerformanceMonitor {
    constructor() {
        this.startTime = Date.now();
        this.frameCount = 0;
        this.lastFrameTime = Date.now();
        this.fps = 0;
        this.memoryUsage = 0;
        this.cpuUsage = 0;
        
        this.startMonitoring();
    }
    
    startMonitoring() {
        // 每秒更新性能指标
        setInterval(() => {
            this.updatePerformanceMetrics();
        }, 1000);
        
        // 每30秒输出性能报告
        setInterval(() => {
            this.logPerformanceReport();
        }, 30000);
    }
    
    updatePerformanceMetrics() {
        // 计算FPS
        const now = Date.now();
        const deltaTime = now - this.lastFrameTime;
        this.fps = Math.round(1000 / deltaTime);
        this.lastFrameTime = now;
        this.frameCount++;
        
        // 获取内存使用情况
        const memoryUsage = process.memoryUsage();
        this.memoryUsage = {
            rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
            heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
            heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
            external: Math.round(memoryUsage.external / 1024 / 1024) // MB
        };
        
        // 获取CPU使用情况
        this.cpuUsage = process.cpuUsage();
    }
    
    logPerformanceReport() {
        const uptime = Math.round((Date.now() - this.startTime) / 1000);
        
        console.log('=== 性能报告 ===');
        console.log(`运行时间: ${uptime}秒`);
        console.log(`FPS: ${this.fps}`);
        console.log(`内存使用: ${this.memoryUsage.heapUsed}MB / ${this.memoryUsage.heapTotal}MB`);
        console.log(`总内存: ${this.memoryUsage.rss}MB`);
        console.log('================');
    }
    
    getMetrics() {
        return {
            fps: this.fps,
            memory: this.memoryUsage,
            uptime: Math.round((Date.now() - this.startTime) / 1000)
        };
    }
    
    // 优化建议
    getOptimizationSuggestions() {
        const suggestions = [];
        
        if (this.memoryUsage.heapUsed > 100) {
            suggestions.push('内存使用较高，建议检查内存泄漏');
        }
        
        if (this.fps < 30) {
            suggestions.push('FPS较低，建议优化渲染逻辑');
        }
        
        if (this.memoryUsage.heapUsed / this.memoryUsage.heapTotal > 0.8) {
            suggestions.push('堆内存使用率过高，建议进行垃圾回收');
        }
        
        return suggestions;
    }
}

module.exports = PerformanceMonitor;
