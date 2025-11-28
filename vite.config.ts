import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        electron([
          {
            entry: 'electron/main.ts',
            vite: {
              build: {
                outDir: 'dist-electron/main',
                rollupOptions: {
                  external: ['electron', 'path', 'fs']
                }
              }
            }
          },
          {
            entry: 'electron/preload.ts',
            vite: {
              build: {
                outDir: 'dist-electron/preload'
              }
            }
          }
        ]),
        renderer()
    ],
    
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    },
    build: {
      target: 'esnext'
    },
    /*开发服务器选项*/
    server: {
        // 端口
        port: 3000,
        host: '0.0.0.0'
    }
})