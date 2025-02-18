<template>
  <div class="mini-chart" ref="chartRef"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  type: {
    type: String,
    default: 'line'
  },
  data: {
    type: Array,
    required: true
  },
  color: {
    type: String,
    default: '#fff'
  }
})

const chartRef = ref(null)
let chart = null

const initChart = () => {
  if (!chartRef.value) return
  
  chart = echarts.init(chartRef.value)
  const option = {
    grid: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    },
    xAxis: {
      type: 'category',
      show: false
    },
    yAxis: {
      type: 'value',
      show: false
    },
    series: [{
      type: props.type,
      data: props.data,
      showSymbol: false,
      smooth: true,
      itemStyle: {
        color: props.color
      },
      areaStyle: props.type === 'line' ? {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
          offset: 0,
          color: props.color
        }, {
          offset: 1,
          color: 'transparent'
        }])
      } : null
    }]
  }
  chart.setOption(option)
}

watch(() => props.data, () => {
  chart?.setOption({
    series: [{
      data: props.data
    }]
  })
}, { deep: true })

onMounted(() => {
  initChart()
  window.addEventListener('resize', () => chart?.resize())
})

onUnmounted(() => {
  chart?.dispose()
  window.removeEventListener('resize', () => chart?.resize())
})
</script>

<style scoped>
.mini-chart {
  width: 100%;
  height: 100%;
}
</style> 