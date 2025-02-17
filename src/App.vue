<template>
  <router-view v-if="isInitialized"></router-view>
  <div v-else class="loading-container">
    <el-loading :fullscreen="true" text="系统初始化中..." />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { store, fixedData } from './store'
import axios from 'axios'

const route = useRoute()
const isInitialized = ref(false)

// 初始化所有数据
const initializeAllData = async () => {
  try {
    // 获取所有数据
    const [inventory, inbound, outbound, monitoring] = await Promise.all([
      axios.get('/api/inventory/list'),
      axios.get('/api/inbound/list'),
      axios.get('/api/outbound/list'),
      axios.get('/api/monitoring/overview')
    ])

    // 更新 store
    if (inventory.data.code === 200) {
      store.setInventoryData(inventory.data.data, inventory.data.data.length)
    }
    if (inbound.data.code === 200) {
      store.setInboundData(inbound.data.data, inbound.data.data.length)
    }
    if (outbound.data.code === 200) {
      store.setOutboundData(outbound.data.data, outbound.data.data.length)
    }
    if (monitoring.data.code === 200) {
      store.setMonitoringData(monitoring.data.data.cameras, monitoring.data.data.alarms)
    }

    // 保存到 localStorage
    store.saveState()
    isInitialized.value = true
  } catch (error) {
    console.error('初始化数据失败:', error)
    // 使用固定数据作为备选
    store.setInventoryData(fixedData.inventory.list, fixedData.inventory.total)
    store.setInboundData(fixedData.inbound.list, fixedData.inbound.total)
    store.setOutboundData(fixedData.outbound.list, fixedData.outbound.total)
    store.setMonitoringData(fixedData.monitoring.cameras, fixedData.monitoring.alarms)
    store.saveState()
    isInitialized.value = true
  }
}

// 监听路由变化，确保数据存在
watch(() => route.path, async (newPath) => {
  if (isInitialized.value) {
    // 根据路由检查并重新加载数据
    if (newPath === '/monitoring' && !store.state.monitoring.cameras.length) {
      await initializeAllData()
    }
  }
})

// 组件挂载时初始化
onMounted(async () => {
  await initializeAllData()
})

// 页面刷新或关闭前保存状态
window.addEventListener('beforeunload', () => {
  store.saveState()
})
</script>

<style>
.loading-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 全局样式 */
body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

#app {
  width: 100%;
  height: 100vh;
}

/* Element Plus 样式覆盖 */
:root {
  --el-color-primary: #409EFF;
}

.el-loading-text {
  font-size: 16px;
  color: var(--el-color-primary);
}
</style>
