/// <reference types="vite/client" />
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
interface ElectronAPI {
  convertPngToIco: (filePath: string) => Promise<{ success: boolean; outputPath?: string; message?: string }>
  getFilePath: (file: File) => string
  //窗口控制相关
  minimizeWindow(): void
  maximizeWindow(): void
  closeWindow(): void
  dragWindow(deltaX: number, deltaY: number): void
  isWindowMaximized(): Promise<boolean>
  onWindowMaximized(callback: (isMaximized: boolean) => void): void
}
interface Window {
  electronAPI: ElectronAPI
}
