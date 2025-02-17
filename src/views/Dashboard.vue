<template>
  <div class="dashboard">
    <!-- 数据卡片 -->
    <el-row :gutter="20">
      <el-col :span="6" v-for="card in cards" :key="card.title">
        <el-card class="data-card" :body-style="{ padding: '20px' }">
          <div class="card-content">
            <div class="card-icon" :style="{ backgroundColor: card.color + '15' }">
              <el-icon :size="24" :color="card.color">
                <component :is="card.icon" />
              </el-icon>
            </div>
            <div class="card-info">
              <div class="card-title">{{ card.title }}</div>
              <div class="card-value">{{ card.value }}</div>
              <div class="card-trend">
                较昨日
                <span :class="card.trend >= 0 ? 'up' : 'down'">
                  {{ Math.abs(card.trend) }}%
                  <el-icon>
                    <component :is="card.trend >= 0 ? 'CaretTop' : 'CaretBottom'" />
                  </el-icon>
                </span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <div class="chart-container">
      <!-- 左侧区域 -->
      <el-row :gutter="20" class="charts-row">
        <el-col :span="16">
          <el-card class="chart-card">
            <template #header>
              <div class="chart-header">
                <span class="title">出入库趋势</span>
                <el-radio-group v-model="trendTimeRange" size="small">
                  <el-radio-button label="week">本周</el-radio-button>
                  <el-radio-button label="month">本月</el-radio-button>
                </el-radio-group>
              </div>
            </template>
            <div ref="stockTrendChart" style="height: 350px"></div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="chart-card">
            <template #header>
              <div class="chart-header">
                <span class="title">库存分类占比</span>
              </div>
            </template>
            <div ref="stockTypeChart" style="height: 350px"></div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 下方区域 -->
      <el-row :gutter="20" class="charts-row">
        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <div class="chart-header">
                <span class="title">库位使用率</span>
                <el-tag 
                  v-if="getMaxUsage() >= 90"
                  type="danger" 
                  size="small"
                >库位紧张</el-tag>
              </div>
            </template>
            <div ref="locationUsageChart" style="height: 300px"></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <div class="chart-header">
                <span class="title">告警统计</span>
                <el-tag 
                  :type="store.state.dashboard.alarmStats.severe > 0 ? 'danger' : 'success'"
                  size="small"
                >
                  {{ store.state.dashboard.alarmStats.severe }}个严重告警
                </el-tag>
              </div>
            </template>
            <div ref="alarmStatChart" style="height: 300px"></div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 告警列表 -->
      <el-row :gutter="20" class="charts-row">
        <el-col :span="24">
          <el-card class="chart-card">
            <template #header>
              <div class="chart-header">
                <span class="title">实时告警</span>
                <el-button type="primary" link>查看全部</el-button>
              </div>
            </template>
            <el-table :data="store.state.dashboard.alarms" style="width: 100%" size="large">
              <el-table-column prop="time" label="时间" width="180" />
              <el-table-column prop="title" label="告警标题" width="200" />
              <el-table-column prop="content" label="告警内容" />
              <el-table-column prop="location" label="位置" width="150" />
              <el-table-column prop="level" label="级别" width="100">
                <template #default="{ row }">
                  <el-tag :type="row.level === '严重' ? 'danger' : 'warning'">
                    {{ row.level }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Dashboard'
}
</script>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { Box, Goods, Van, Money, CaretTop, CaretBottom } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { store } from '../store'

const cards = ref(store.state.dashboard.cards)
const stockTrendChart = ref(null)
const stockTypeChart = ref(null)
const locationUsageChart = ref(null)
const alarmStatChart = ref(null)
const alarmTypeChart = ref(null)
let charts = [] // 存储所有图表实例

// 初始化图表
const initCharts = () => {
  // 清除旧的图表实例
  charts.forEach(chart => {
    if (chart.resizeHandler) {
      window.removeEventListener('resize', chart.resizeHandler)
    }
    chart.dispose()
  })
  charts = []

  const chartInstances = {
    trendChart: null,
    typeChart: null,
    locationChart: null,
    alarmChart: null,
    alarmTypeChart: null
  }

  // 初始化趋势图
  if (stockTrendChart.value) {
    chartInstances.trendChart = echarts.init(stockTrendChart.value)
    const resizeHandler = () => chartInstances.trendChart.resize()
    window.addEventListener('resize', resizeHandler)
    chartInstances.trendChart.resizeHandler = resizeHandler
    charts.push(chartInstances.trendChart)
  }

  // 初始化分类图
  if (stockTypeChart.value) {
    chartInstances.typeChart = echarts.init(stockTypeChart.value)
    const resizeHandler = () => chartInstances.typeChart.resize()
    window.addEventListener('resize', resizeHandler)
    chartInstances.typeChart.resizeHandler = resizeHandler
    charts.push(chartInstances.typeChart)
  }

  // 初始化库位图
  if (locationUsageChart.value) {
    chartInstances.locationChart = echarts.init(locationUsageChart.value)
    const resizeHandler = () => chartInstances.locationChart.resize()
    window.addEventListener('resize', resizeHandler)
    chartInstances.locationChart.resizeHandler = resizeHandler
    charts.push(chartInstances.locationChart)
  }

  // 初始化告警图
  if (alarmStatChart.value) {
    chartInstances.alarmChart = echarts.init(alarmStatChart.value)
    const resizeHandler = () => chartInstances.alarmChart.resize()
    window.addEventListener('resize', resizeHandler)
    chartInstances.alarmChart.resizeHandler = resizeHandler
    charts.push(chartInstances.alarmChart)
  }

  // 初始化告警类型分布图
  if (alarmTypeChart.value) {
    chartInstances.alarmTypeChart = echarts.init(alarmTypeChart.value)
    const resizeHandler = () => chartInstances.alarmTypeChart.resize()
    window.addEventListener('resize', resizeHandler)
    chartInstances.alarmTypeChart.resizeHandler = resizeHandler
    charts.push(chartInstances.alarmTypeChart)
  }

  return chartInstances
}

// 获取仪表盘数据
const getDashboardData = async () => {
  try {
    const { data: res } = await axios.get('/api/dashboard/overview')
    if (res.code === 200) {
      const data = res.data
      
      // 更新数据并保存到 store
      store.setDashboardData({
        cards: [
          {
            title: '总库存量',
            value: data.totalInventory.toLocaleString(),
            trend: 5.2,
            icon: 'Box',
            color: '#409EFF'
          },
          {
            title: '今日入库',
            value: data.todayInbound.toLocaleString(),
            trend: 12.5,
            icon: 'Goods',
            color: '#67C23A'
          },
          {
            title: '今日出库',
            value: data.todayOutbound.toLocaleString(),
            trend: -3.8,
            icon: 'Van',
            color: '#E6A23C'
          },
          {
            title: '库存金额',
            value: `￥${data.totalAmount.toLocaleString()}`,
            trend: 8.3,
            icon: 'Money',
            color: '#F56C6C'
          }
        ],
        trends: data.inventoryTrend,
        distribution: data.categoryDistribution,
        usage: data.locationUsage,
        alarms: data.recentAlarms,
        alarmStats: data.alarmStats
      })
      
      // 更新本地数据
      cards.value = store.state.dashboard.cards

      // 更新图表
      nextTick(() => {
        updateCharts()
      })
    }
  } catch (error) {
    console.error('获取仪表盘数据失败:', error)
    ElMessage.error('获取仪表盘数据失败')
  }
}

// 更新图表
const updateCharts = () => {
  const chartInstances = initCharts()
  
  // 更新趋势图
  if (chartInstances.trendChart && store.state.dashboard.trends) {
    chartInstances.trendChart.setOption({
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['入库量', '出库量']
      },
      xAxis: {
        type: 'category',
        data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '入库量',
          type: 'line',
          smooth: true,
          data: store.state.dashboard.trends.inbound
        },
        {
          name: '出库量',
          type: 'line',
          smooth: true,
          data: store.state.dashboard.trends.outbound
        }
      ]
    })
  }

  // 更新分类图
  if (chartInstances.typeChart && store.state.dashboard.distribution) {
    chartInstances.typeChart.setOption({
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left'
      },
      series: [
        {
          name: '库存分类',
          type: 'pie',
          radius: '50%',
          data: store.state.dashboard.distribution,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    })
  }

  // 更新库位图
  if (chartInstances.locationChart && store.state.dashboard.usage) {
    chartInstances.locationChart.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      xAxis: {
        type: 'category',
        data: store.state.dashboard.usage.map(item => item.name)
      },
      yAxis: {
        type: 'value',
        max: 100,
        axisLabel: {
          formatter: '{value}%'
        }
      },
      series: [
        {
          type: 'bar',
          data: store.state.dashboard.usage.map(item => item.value),
          itemStyle: {
            color: function(params) {
              const value = params.value
              if (value > 80) return '#F56C6C'
              if (value > 60) return '#E6A23C'
              return '#67C23A'
            }
          },
          label: {
            show: true,
            position: 'top',
            formatter: '{c}%'
          }
        }
      ]
    })
  }

  // 更新告警统计图
  if (chartInstances.alarmChart && store.state.dashboard.alarmStats) {
    chartInstances.alarmChart.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: ['严重告警', '一般告警']
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: store.state.dashboard.alarmStats.trend.map(item => item.date)
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '严重告警',
          type: 'bar',
          stack: 'total',
          data: store.state.dashboard.alarmStats.trend.map(item => item.severe),
          itemStyle: {
            color: '#F56C6C'
          }
        },
        {
          name: '一般告警',
          type: 'bar',
          stack: 'total',
          data: store.state.dashboard.alarmStats.trend.map(item => item.warning),
          itemStyle: {
            color: '#E6A23C'
          }
        }
      ]
    })
  }

  // 更新告警类型分布图
  if (chartInstances.alarmTypeChart && store.state.dashboard.alarmStats) {
    chartInstances.alarmTypeChart.setOption({
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        data: store.state.dashboard.alarmStats.types.map(item => item.name)
      },
      series: [
        {
          name: '告警类型',
          type: 'pie',
          radius: ['50%', '70%'],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '14',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: store.state.dashboard.alarmStats.types.map(item => ({
            value: item.value,
            name: item.name
          }))
        }
      ]
    })
  }
}

// 组件挂载时初始化
onMounted(() => {
  if (!store.state.dashboard.cards.length) {
    getDashboardData()
  } else {
    nextTick(() => {
      updateCharts()
    })
  }
})

// 组件卸载时清理资源
onUnmounted(() => {
  charts.forEach(chart => {
    if (chart.resizeHandler) {
      window.removeEventListener('resize', chart.resizeHandler)
    }
    chart.dispose()
  })
  charts = []
})

// 获取最高库位使用率
const getMaxUsage = () => {
  if (!store.state.dashboard.usage) return 0
  return Math.max(...store.state.dashboard.usage.map(item => item.value))
}

// 时间范围选择
const trendTimeRange = ref('week')

// 监听时间范围变化
watch(trendTimeRange, (newValue) => {
  // 这里可以根据选择的时间范围更新趋势图数据
  updateCharts()
})
</script>

<style scoped>
.dashboard {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.data-card {
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
  transition: all 0.3s;
}

.data-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 20px 0 rgba(0,0,0,0.1);
}

.card-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.card-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-info {
  flex: 1;
}

.card-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.card-value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 8px;
}

.card-trend {
  font-size: 13px;
  color: #909399;
}

.up {
  color: #67C23A;
  margin-left: 5px;
}

.down {
  color: #F56C6C;
  margin-left: 5px;
}

.chart-container {
  margin-top: 20px;
}

.charts-row {
  margin-bottom: 20px;
}

.chart-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-header .title {
  font-size: 16px;
  font-weight: bold;
}

:deep(.el-card__header) {
  padding: 15px 20px;
  border-bottom: 1px solid #ebeef5;
}

:deep(.el-table) {
  --el-table-header-bg-color: #f5f7fa;
}

:deep(.el-table th) {
  font-weight: bold;
}
</style> 