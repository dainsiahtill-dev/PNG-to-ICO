// main.js (ES Module 版本)
import { app, BrowserWindow, ipcMain } from 'electron';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import pngToIco from 'png-to-ico';

// 屏蔽安全警告
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

// 兼容 ES Module 的 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const windowSize = { width: 600, height: 480 }

// 创建浏览器窗口
const createWindow = () => {
    const mainWindow = new BrowserWindow({
        width: windowSize.width,
        height: windowSize.height,
        minWidth: windowSize.width,
        minHeight: windowSize.height,
        titleBarStyle: 'hidden',
        webPreferences: {
            preload: join(__dirname, '../preload/preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false
        },
        show: false,
        icon: join(__dirname, '../../src/assets/icon.png'),
        title: 'ICO转换工具',
        
    });

    ipcMain.on('close-app', () => {
        const win = BrowserWindow.getFocusedWindow()
        if (win) {
            win.close()
        }
        // 或者直接使用 app.quit() 退出整个程序
    })

    mainWindow.once('ready-to-show', () => {
        mainWindow.show()
    })
    
    // --- 核心业务逻辑：监听转换请求 ---
    ipcMain.handle('convert-png-to-ico', async (_, filePath: string) => {
        console.log(filePath);
        
        try {
        if (!filePath.toLowerCase().endsWith('.png')) {
            throw new Error('请选择 PNG 文件');
        }
        // 生成输出路径 (同目录下)
        const outputDir = path.dirname(filePath);
        const fileName = path.basename(filePath, '.png');
        const outputPath = path.join(outputDir, `${fileName}.ico`);
        // 执行转换 (生成多种尺寸以适配 Windows)
        const buffer = await pngToIco(filePath);
        
        // 写入文件
        fs.writeFileSync(outputPath, buffer);
            return { success: true, outputPath };
        } catch (error: any) {
            return { success: false, message: error.message || '转换失败' };
        }
    });

    // 窗口控制 IPC
    ipcMain.on('window-minimize', () => {
        mainWindow?.minimize()
    })
    ipcMain.on('window-maximize', () => {
        if (mainWindow?.isMaximized()) {
        mainWindow.unmaximize()
        } else {
        mainWindow?.maximize()
        }
    })
    ipcMain.on('window-close', () => {
        mainWindow?.close()
    })
    // 拖拽移动 IPC
    ipcMain.on('window-drag', (event, { deltaX, deltaY }: { deltaX: number; deltaY: number }) => {
        if (!mainWindow) return
        
        const [x, y] = mainWindow.getPosition()
        mainWindow.setPosition(x + deltaX, y + deltaY, false)
    })
    // 查询窗口状态
    ipcMain.handle('window-is-maximized', () => {
        return mainWindow?.isMaximized() ?? false
    })
    // 监听最大化状态变化并广播
    mainWindow.on('maximize', () => {
        mainWindow?.webContents.send('window-maximized-change', true)
    })
    
    mainWindow.on('unmaximize', () => {
        mainWindow?.webContents.send('window-maximized-change', false)
    })
    
    // development 模式
    if (process.env.VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
        // 开启调试台
        mainWindow.webContents.openDevTools({ 
            mode: 'detach',
            activate: true
        })
    } else {
        mainWindow.loadFile(join(__dirname, '../../dist/index.html'));
    }
};
// Electron 会在初始化后并准备
app.whenReady().then(() => {
    createWindow();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
