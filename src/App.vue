<script setup lang="ts">
import { ref } from 'vue'
const isDragging = ref(false)
const statusMsg = ref('')
const isProcessing = ref(false)
const fileInput = ref<HTMLInputElement | null>(null) // 修复 ref 类型

import TitleBar from './components/TitleBar.vue'

const handleZoneClick = () => {
  statusMsg.value = '' // 点击即清除提示
  fileInput.value?.click() // 触发 input 点击
}
// 处理拖拽进入
const onDragOver = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = true
}
// 处理拖拽离开
const onDragLeave = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = false
}
// 处理文件放下
const onDrop = async (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = false
  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    const file = files[0]
    await processFile(file)
  }
}
// 处理点击选择
const onFileChange = async (e: Event) => {
  const input = e.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    await processFile(input.files[0])
  }
}
// 核心处理逻辑
const processFile = async (file: File) => {
  // 简单的类型检查
  if (file.type !== 'image/png') {
    statusMsg.value = '错误：仅支持 PNG 格式'
    return
  }
  const filePath = window.electronAPI.getFilePath(file)

  console.log('获取到的文件路径:', filePath)
  
  try {
    isProcessing.value = true
    statusMsg.value = '正在转换...'
    
    // 调用 Preload 暴露的 API
    const result = await window.electronAPI.convertPngToIco(filePath)
    if (result.success) {
      statusMsg.value = `✅ 成功！已保存至: ${result.outputPath}`
    } else {
      statusMsg.value = `❌ 失败: ${result.message}`
    }
  } catch (err) {
    statusMsg.value = '❌ 发生未知错误'
    console.error(err)
  } finally {
    isProcessing.value = false
  }
}
</script>
<template>
  <div class="container">
    <!-- 标题栏 -->
    <TitleBar 
      title=" "
      :height="32"
    />
    <main>
      <h1>PNG 转 ICO 工具</h1>
          <div 
            class="drop-zone" 
            :class="{ active: isDragging, processing: isProcessing }"
            @dragover="onDragOver"
            @dragleave="onDragLeave"
            @drop="onDrop"
            @click="handleZoneClick"
          >
            <div v-if="isProcessing" class="loading">
              🔄 转换中...
            </div>
            <div v-else>
              <p class="icon">📁</p>
              <p>点击或拖拽 PNG 文件到此处</p>
              <p class="sub-text">将自动生成 ICO 到源文件目录</p>
            </div>
            
            <input 
              type="file" 
              ref="fileInput" 
              accept=".png" 
              style="display: none" 
              @change="onFileChange"
            />
          </div>
          <div class="status" v-if="statusMsg">{{ statusMsg }}</div>
    </main>
    
  </div>
</template>
<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f0f2f5;
  font-family: 'Segoe UI', sans-serif;
  user-select: none;
  position: relative; 
}
h1 {
  color: #333;
  margin-bottom: 30px;
  font-weight: 600;
}
.drop-zone {
  width: 400px;
  height: 250px;
  background: #fff;
  border: 2px dashed #cbd5e1;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #64748b;
}
.drop-zone:hover {
  border-color: #3b82f6;
  background: #eff6ff;
}
.drop-zone.active {
  border-color: #3b82f6;
  background: #eff6ff;
  transform: scale(1.02);
}
.drop-zone.processing {
  cursor: wait;
  opacity: 0.7;
}
.icon {
  font-size: 48px;
  margin: 0 0 10px 0;
}
.sub-text {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 5px;
}
.status {
  margin-top: 20px;
  padding: 10px 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  font-size: 14px;
  color: #333;
  max-width: 80%;
  word-break: break-all;
}
</style>