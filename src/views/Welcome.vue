<template>
  <div class="welcome animate__animated animate__fadeIn">
    <!-- 左侧面板 -->
    <div class="left-panel">
      <div class="welcome-header">
        <h1>智能仓储管理系统</h1>
        <p class="subtitle">{{ currentDate }}</p>
      </div>

      <!-- 快速访问菜单 -->
      <div class="menu-section">
        <h2>快速访问</h2>
        <div class="menu-grid">
          <router-link v-for="menu in quickMenus" :key="menu.path" :to="menu.path">
            <div class="menu-item">
              <div class="menu-icon" :class="menu.class">
                <el-icon><component :is="menu.icon" /></el-icon>
              </div>
              <span>{{ menu.title }}</span>
            </div>
          </router-link>
        </div>
      </div>

      <!-- 最近活动 -->
      <div class="activity-section">
        <div class="section-header">
          <h2>最近活动</h2>
          <el-button type="primary" text>查看全部</el-button>
        </div>
        <div class="activity-list">
          <div class="activity-item" v-for="activity in recentActivities" :key="activity.time">
            <div class="activity-icon" :class="activity.type">
              <el-icon><component :is="getActivityIcon(activity.type)" /></el-icon>
            </div>
            <div class="activity-content">
              <div class="activity-title">{{ activity.content }}</div>
              <div class="activity-meta">
                <span class="activity-category">{{ activity.category }}</span>
                <span class="activity-time">{{ activity.time }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧面板 -->
    <div class="right-panel">
      <!-- 数据概览卡片 -->
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-header">
            <div class="stat-title">库存总量</div>
            <el-icon class="stat-icon"><Box /></el-icon>
          </div>
          <div class="stat-value">{{ stats.inventory }}</div>
          <div class="stat-chart">
            <div class="trend up">
              <el-icon><CaretTop /></el-icon>
              <span>8.5%</span>
            </div>
            <div class="mini-line"></div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-header">
            <div class="stat-title">今日入库</div>
            <el-icon class="stat-icon"><Download /></el-icon>
          </div>
          <div class="stat-value">{{ stats.inbound }}</div>
          <div class="stat-chart">
            <div class="trend up">
              <el-icon><CaretTop /></el-icon>
              <span>12.3%</span>
            </div>
            <div class="mini-line"></div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-header">
            <div class="stat-title">今日出库</div>
            <el-icon class="stat-icon"><Upload /></el-icon>
          </div>
          <div class="stat-value">{{ stats.outbound }}</div>
          <div class="stat-chart">
            <div class="trend down">
              <el-icon><CaretBottom /></el-icon>
              <span>3.2%</span>
            </div>
            <div class="mini-line"></div>
          </div>
        </div>
      </div>

      <!-- 图表区域 -->
      <div class="chart-section">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <h3>库存趋势分析</h3>
              <el-radio-group v-model="timeRange" size="small">
                <el-radio-button label="today">今日</el-radio-button>
                <el-radio-button label="week">本周</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="chart-container" ref="inventoryChartRef"></div>
        </el-card>
      </div>

      <!-- 系统状态 -->
      <div class="system-status">
        <div class="status-header">
          <h3>系统状态</h3>
          <el-tag type="success">运行正常</el-tag>
        </div>
        <div class="status-grid">
          <div class="status-item" v-for="status in systemStatus" :key="status.label">
            <div class="status-info">
              <span class="label">{{ status.label }}</span>
              <span class="value" :class="status.class">{{ status.value }}</span>
            </div>
            <el-progress 
              :percentage="parseInt(status.value)" 
              :status="status.class"
              :stroke-width="6"
              :show-text="false"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { 
  DataLine, 
  Box, 
  Download, 
  Upload, 
  InfoFilled, 
  CaretTop, 
  CaretBottom,
  Check,
  Warning,
  CircleCheck,
  Bell
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { store } from '../store'

// 时间相关
const currentTime = ref('')
const currentDate = ref('')

const updateDateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', { hour12: false })
  currentDate.value = now.toLocaleDateString('zh-CN', { 
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
}

// 统计数据
const stats = ref({
  inventory: '12,580',
  inbound: '1,234',
  outbound: '986'
})

// 迷你图表数据
const miniChartData = ref({
  inventory: [12000, 12200, 12400, 12580, 12300, 12450, 12580],
  inbound: [120, 150, 180, 200, 160, 190, 210],
  outbound: [100, 130, 150, 170, 140, 160, 180]
})

// 获取状态颜色
const getStatusColor = (type) => {
  const colorMap = {
    'success': '#52c41a',
    'warning': '#faad14',
    'danger': '#ff4d4f',
    'normal': '#1890ff'
  }
  return colorMap[type] || colorMap.normal
}

const quickMenus = [
  {
    title: '系统概览',
    desc: '查看系统整体运行状况',
    icon: 'DataLine',
    path: '/dashboard',
    class: 'blue-gradient'
  },
  {
    title: '库存管理',
    desc: '管理仓库物资库存信息',
    icon: 'Box',
    path: '/inventory',
    class: 'green-gradient'
  },
  {
    title: '入库管理',
    desc: '处理物资入库相关事务',
    icon: 'Download',
    path: '/inbound',
    class: 'orange-gradient'
  },
  {
    title: '出库管理',
    desc: '处理物资出库相关事务',
    icon: 'Upload',
    path: '/outbound',
    class: 'purple-gradient'
  }
]

const systemStatus = [
  { label: '系统运行时间', value: '7天12小时', class: 'normal' },
  { label: '服务器负载', value: '32%', class: 'success' },
  { label: '内存使用率', value: '45%', class: 'success' },
  { label: '存储空间', value: '68%', class: 'warning' }
]

// 获取活动图标
const getActivityIcon = (type) => {
  const iconMap = {
    'success': 'CircleCheck',
    'warning': 'Warning',
    'danger': 'Bell',
    'info': 'InfoFilled'
  }
  return iconMap[type]
}

// 最近活动数据
const recentActivities = [
  {
    category: '入库',
    content: '新增入库单：IN202402170001',
    time: '10分钟前',
    type: 'success'
  },
  {
    category: '系统',
    content: '完成数据库备份',
    time: '30分钟前',
    type: 'info'
  },
  {
    category: '出库',
    content: '完成出库单：OUT202402170003',
    time: '1小时前',
    type: 'warning'
  },
  {
    category: '警告',
    content: 'A1区库存即将不足',
    time: '2小时前',
    type: 'danger'
  }
]

// 图表相关
const timeRange = ref('today')
const inventoryChartRef = ref(null)
const distributionChartRef = ref(null)
let inventoryChart = null
let distributionChart = null

// 实时数据更新间隔
let updateTimer = null

// 初始化库存变化图表
const initInventoryChart = () => {
  if (!inventoryChartRef.value) return
  
  inventoryChart = echarts.init(inventoryChartRef.value)
  const option = {
    grid: {
      top: 40,
      right: 20,
      bottom: 20,
      left: 40,
      containLabel: true
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'line',
        lineStyle: {
          color: '#409EFF',
          width: 1,
          type: 'dashed'
        }
      }
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'],
      axisLine: {
        lineStyle: {
          color: '#E4E7ED'
        }
      },
      axisTick: {
        show: false
      }
    },
    yAxis: {
      type: 'value',
      splitLine: {
        lineStyle: {
          color: '#F2F6FC'
        }
      }
    },
    series: [{
      name: '库存量',
      type: 'line',
      smooth: true,
      showSymbol: false,
      itemStyle: {
        color: '#409EFF'
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
          offset: 0,
          color: 'rgba(64,158,255,0.3)'
        }, {
          offset: 1,
          color: 'rgba(64,158,255,0.1)'
        }])
      },
      data: [12000, 12200, 12100, 12400, 12580, 12300, 12450, 12580]
    }]
  }
  inventoryChart.setOption(option)
}

// 初始化库存分布图表
const initDistributionChart = () => {
  if (!distributionChartRef.value) return
  
  distributionChart = echarts.init(distributionChartRef.value)
  const option = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center'
    },
    series: [{
      name: '库存分布',
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['40%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: false
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 14,
          fontWeight: 'bold'
        }
      },
      data: [
        { value: 5200, name: '电子产品' },
        { value: 3100, name: '服装' },
        { value: 2340, name: '食品' },
        { value: 1200, name: '家具' },
        { value: 740, name: '其他' }
      ]
    }]
  }
  distributionChart.setOption(option)
}

onMounted(() => {
  // 初始化时间
  updateDateTime()
  // 设置定时更新
  const timeTimer = setInterval(updateDateTime, 1000)
  
  // 初始化图表
  initInventoryChart()
  
  // 启动实时数据更新
  updateTimer = setInterval(() => {
    // 更新统计数据
    stats.value = {
      inventory: (12000 + Math.floor(Math.random() * 1000)).toLocaleString(),
      inbound: (1000 + Math.floor(Math.random() * 500)).toLocaleString(),
      outbound: (800 + Math.floor(Math.random() * 400)).toLocaleString()
    }
    
    // 更新迷你图表数据
    miniChartData.value.inventory.shift()
    miniChartData.value.inventory.push(parseInt(stats.value.inventory.replace(/,/g, '')))
    
    miniChartData.value.inbound.shift()
    miniChartData.value.inbound.push(parseInt(stats.value.inbound.replace(/,/g, '')))
    
    miniChartData.value.outbound.shift()
    miniChartData.value.outbound.push(parseInt(stats.value.outbound.replace(/,/g, '')))
  }, 5000)

  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    inventoryChart?.resize()
  })

  return () => {
    clearInterval(timeTimer)
    clearInterval(updateTimer)
    window.removeEventListener('resize', () => {
      inventoryChart?.resize()
    })
  }
})

onUnmounted(() => {
  inventoryChart?.dispose()
  distributionChart?.dispose()
})
</script>

<style scoped>
.welcome {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 24px;
  padding: 24px;
  min-height: calc(100vh - 60px);
  background: #f6f8fa;
}

.left-panel {
  background: white;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 32px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}

.welcome-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 8px;
}

.subtitle {
  color: #8c8c8c;
  font-size: 14px;
}

.menu-section h2,
.activity-section h2 {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 16px;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.menu-item {
  padding: 20px;
  border-radius: 16px;
  background: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
  cursor: pointer;
  animation: fadeInUp 0.6s ease-out;
  animation-fill-mode: both;
}

.menu-item:nth-child(1) { animation-delay: 0.2s; }
.menu-item:nth-child(2) { animation-delay: 0.3s; }
.menu-item:nth-child(3) { animation-delay: 0.4s; }
.menu-item:nth-child(4) { animation-delay: 0.5s; }

.menu-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
  border-color: transparent;
}

.menu-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  transition: all 0.3s ease;
  animation: pulse 2s infinite;
}

.menu-icon.blue-gradient {
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.2);
}

.menu-icon.green-gradient {
  background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
  box-shadow: 0 4px 12px rgba(82, 196, 26, 0.2);
}

.menu-icon.orange-gradient {
  background: linear-gradient(135deg, #fa8c16 0%, #d46b08 100%);
  box-shadow: 0 4px 12px rgba(250, 140, 22, 0.2);
}

.menu-icon.purple-gradient {
  background: linear-gradient(135deg, #722ed1 0%, #531dab 100%);
  box-shadow: 0 4px 12px rgba(114, 46, 209, 0.2);
}

.menu-item:hover .menu-icon {
  transform: scale(1.1);
}

.menu-item:hover .menu-icon.blue-gradient {
  box-shadow: 0 6px 16px rgba(24, 144, 255, 0.3);
}

.menu-item:hover .menu-icon.green-gradient {
  box-shadow: 0 6px 16px rgba(82, 196, 26, 0.3);
}

.menu-item:hover .menu-icon.orange-gradient {
  box-shadow: 0 6px 16px rgba(250, 140, 22, 0.3);
}

.menu-item:hover .menu-icon.purple-gradient {
  box-shadow: 0 6px 16px rgba(114, 46, 209, 0.3);
}

.menu-icon :deep(svg) {
  color: white;
  font-size: 24px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.menu-item span {
  font-size: 16px;
  font-weight: 500;
  color: #1a1a1a;
}

.right-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
  animation: slideIn 0.6s ease-out;
  animation-fill-mode: both;
}

.stat-card:nth-child(1) { animation-delay: 0.1s; }
.stat-card:nth-child(2) { animation-delay: 0.2s; }
.stat-card:nth-child(3) { animation-delay: 0.3s; }

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.stat-title {
  font-size: 14px;
  color: #8c8c8c;
}

.stat-icon {
  font-size: 20px;
  color: #1890ff;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 16px;
  animation: numberChange 0.5s ease-out;
}

.stat-chart {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  animation: bounce 1s infinite;
}

.trend.up { color: #52c41a; }
.trend.down { color: #ff4d4f; }

.mini-line {
  flex: 1;
  height: 30px;
  margin-left: 16px;
  background: #f0f2f5;
  border-radius: 4px;
}

.chart-card {
  border-radius: 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.chart-container {
  height: 300px;
  position: relative;
}

.system-status {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.status-header h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.status-grid {
  display: grid;
  gap: 20px;
}

.status-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.status-info .label {
  color: #8c8c8c;
}

.status-info .value {
  font-weight: 500;
}

.value.success { color: #52c41a; }
.value.warning { color: #faad14; }
.value.danger { color: #ff4d4f; }
.value.normal { color: #1890ff; }

.activity-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.activity-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.activity-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  transition: background-color 0.3s ease;
  animation: fadeInRight 0.5s ease-out;
  animation-fill-mode: both;
}

.activity-item:nth-child(1) { animation-delay: 0.3s; }
.activity-item:nth-child(2) { animation-delay: 0.4s; }
.activity-item:nth-child(3) { animation-delay: 0.5s; }
.activity-item:nth-child(4) { animation-delay: 0.6s; }

.activity-item:hover {
  background: #f6f8fa;
}

.activity-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
}

.activity-icon.success { background: #f6ffed; color: #52c41a; }
.activity-icon.warning { background: #fffbe6; color: #faad14; }
.activity-icon.danger { background: #fff2f0; color: #ff4d4f; }
.activity-icon.info { background: #e6f7ff; color: #1890ff; }

.activity-content {
  flex: 1;
}

.activity-title {
  font-size: 14px;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.activity-meta {
  display: flex;
  gap: 8px;
  font-size: 12px;
  color: #8c8c8c;
}

@media (max-width: 1200px) {
  .welcome {
    grid-template-columns: 1fr;
  }
  
  .left-panel {
    height: auto;
  }
  
  .menu-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .activity-list {
    max-height: 300px;
  }
}

@media (max-width: 768px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }
  
  .menu-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 自定义动画关键帧 */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes numberChange {
  from {
    transform: translateY(-10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}

/* 悬停效果增强 */
.menu-item {
  position: relative;
  overflow: hidden;
}

.menu-item::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    120deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  transform: translateX(-100%);
}

.menu-item:hover::after {
  animation: shine 0.8s ease-out;
}

@keyframes shine {
  100% {
    transform: translateX(100%);
  }
}

/* 活动图标旋转效果 */
.activity-item:hover .activity-icon {
  transform: rotate(360deg);
}

/* 系统状态进度条动画 */
:deep(.el-progress-bar__inner) {
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 卡片阴影动画 */
.stat-card,
.menu-item,
.chart-card,
.system-status {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.stat-card:hover,
.chart-card:hover,
.system-status:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

/* 趋势图标颜色过渡 */
.trend.up,
.trend.down {
  transition: color 0.3s ease;
}

.trend.up:hover { color: #389e0d; }
.trend.down:hover { color: #cf1322; }

/* 添加加载动画 */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.loading-overlay.active {
  opacity: 1;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #409eff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 