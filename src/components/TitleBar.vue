<template>
    <div class="title-bar" :class="{ 'is-maximized': isMaximized }" @dblclick="toggleMaximize">
        <div class="drag-region" @mousedown="startDrag">
            <!-- ✅ 左侧：标题区域 -->
            <div class="title-left">
                <img v-if="icon" :src="icon" class="window-icon" />
                <span class="title" v-if="title">{{ title }}</span>
            </div>
            
            <!-- ✅ 右侧：控制按钮 -->
            <div class="window-controls">
                <button class="control-btn minimize" @click="minimize" title="最小化">
                    <svg width="11" height="11" viewBox="0 0 12 12">
                        <rect fill="currentColor" x="1" y="5" width="10" height="1" />
                    </svg>
                </button>
                <button class="control-btn maximize" @click="toggleMaximize" :title="maximizeTitle">
                    <svg v-if="!isMaximized" width="11" height="11" viewBox="0 0 12 12">
                        <rect x="1.5" y="1.5" width="9" height="9" fill="none" stroke="currentColor" stroke-width="1" />
                    </svg>
                    <svg v-else width="11" height="11" viewBox="0 0 12 12">
                        <path d="M3 3h5v5H3z" fill="none" stroke="currentColor" stroke-width="1" />
                        <path d="M4 4h3v3H4z" fill="currentColor" stroke="none" />
                    </svg>
                </button>
                <button class="control-btn close" @click="close" title="关闭">✕</button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface Props {
    title?: string
    icon?: string
    height?: number
}

const props = withDefaults(defineProps<Props>(), {
    title: 'Electron App',
    height: 32
})

const isMaximized = ref(false)

// 窗口控制
const minimize = () => window.electronAPI?.minimizeWindow()
const close = () => window.electronAPI?.closeWindow()
const toggleMaximize = () => window.electronAPI?.maximizeWindow()

// 拖拽逻辑
let isDragging = false, startPos = { x: 0, y: 0 }

const startDrag = (e: MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.closest('.window-controls')) return // 点击按钮不拖拽
    
    isDragging = true
    startPos.x = e.screenX
    startPos.y = e.screenY
    document.addEventListener('mousemove', onDrag)
    document.addEventListener('mouseup', endDrag)
    document.addEventListener('mouseleave', endDrag)
    e.preventDefault()
}

const onDrag = (e: MouseEvent) => {
    if (!isDragging) return
    const deltaX = e.screenX - startPos.x
    const deltaY = e.screenY - startPos.y
    if (Math.abs(deltaX) > 0 || Math.abs(deltaY) > 0) {
        window.electronAPI?.dragWindow(deltaX, deltaY)
        startPos.x = e.screenX
        startPos.y = e.screenY
    }
}

const endDrag = () => {
    if (!isDragging) return
    isDragging = false
    document.removeEventListener('mousemove', onDrag)
    document.removeEventListener('mouseup', endDrag)
    document.removeEventListener('mouseleave', endDrag)
}

// 监听最大化状态
onMounted(() => {
    window.electronAPI?.isWindowMaximized?.().then((max: boolean) => isMaximized.value = max)
    window.electronAPI?.onWindowMaximized?.((max: boolean) => isMaximized.value = max)
})

const maximizeTitle = computed(() => isMaximized.value ? '还原' : '最大化')
</script>

<style scoped lang="scss">
.title-bar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: v-bind('props.height + "px"');
    background: rgba(30, 30, 30, 0.7);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    z-index: 9999;
    user-select: none;
    overflow: hidden; // ✅ 防止内容溢出

    .drag-region {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 12px 0 16px; // ✅ 右侧减少内边距
        cursor: grab;
        box-sizing: border-box; // ✅ 确保 padding 包含在宽度内

        &:active {
            cursor: grabbing;
        }
    }

    // ✅ 左侧标题（占据剩余空间）
    .title-left {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 1;
        min-width: 0; // 防止 flex 溢出
    }

    .window-icon {
        width: 16px;
        height: 16px;
        flex-shrink: 0;
    }

    .title {
        font-size: 13px;
        font-weight: 500;
        color: #e0e0e0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    // ✅ 右侧控制按钮（靠右对齐）
    .window-controls {
        display: flex;
        align-items: center;
        flex-shrink: 0;
        margin-left: auto; // ✅ 强制靠右
    }

    // ✅ 按钮基础样式（紧凑版）
    .control-btn {
        width: 44px; // ✅ 缩小宽度
        height: 30px; // ✅ 缩小高度
        min-width: 44px; // ✅ 防止 flex 压缩
        border: none;
        background: transparent;
        color: rgba(255, 255, 255, 0.6);
        cursor: pointer;
        transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1); // ✅ 平滑过渡
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        box-sizing: border-box; // ✅ 关键：防止边框导致溢出

        &:hover {
            color: #fff;
            // ✅ 移除 scale，改用更安全的 filter
            filter: brightness(1.15);
            // ✅ 添加发光效果（可选）
            // box-shadow: 0 0 8px currentColor;
        }

        &:active {
            transform: scale(0.92); // ✅ 缩小比例，避免溢出
            transition-duration: 0.08s;
        }

        svg {
            pointer-events: none;
        }
    }

    // ✅ 最小化按钮：柔和黄色
    .control-btn.minimize:hover {
        background: #ffbd2e;
        color: #000;
    }

    // ✅ 最大化按钮：清新绿色
    .control-btn.maximize:hover {
        background: #28ca42;
        color: #000;
    }

    // ✅ 关闭按钮：经典红色
    .control-btn.close:hover {
        background: #ff5f57;
        color: #fff;
    }
}
</style>
