import { contextBridge, ipcRenderer, webUtils } from 'electron'


// 定义 API 接口
const api = {
  convertPngToIco: (filePath: string): Promise<{ success: boolean; outputPath?: string; message?: string }> => {
    return ipcRenderer.invoke('convert-png-to-ico', filePath)
  },
  getFilePath: (file: File): string => {
    // webUtils.getPathForFile 是 Electron 提供的专门 API
    return webUtils.getPathForFile(file)
  },
  closeApp: () => ipcRenderer.send('close-app'),

  // 窗口控制
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow: () => ipcRenderer.send('window-close'),
  
  // 拖拽移动
  dragWindow: (deltaX: number, deltaY: number) => {
    ipcRenderer.send('window-drag', { deltaX, deltaY })
  },
  
  // 检查窗口状态
  isWindowMaximized: () => ipcRenderer.invoke('window-is-maximized'),
  
  // 监听最大化状态变化
  onWindowMaximized: (callback: (isMaximized: boolean) => void) => {
    ipcRenderer.on('window-maximized-change', (_, isMaximized) => {
      callback(isMaximized)
    })
  }
}
// 暴露给渲染进程
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electronAPI', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electronAPI = api
}
