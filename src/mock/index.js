import Mock from 'mockjs'
import { fixedData } from '../store'

// 库存数据
const inventory = Mock.mock({
  'list|50-100': [{
    'id|+1': 1,
    'name': '@ctitle(4,8)',
    'category|1': ['电子产品', '服装', '食品', '家具', '其他'],
    'code': /[A-Z]{2}\d{6}/,
    'location': /[A-Z]-\d{2}-\d{2}/,
    'quantity|1-1000': 1,
    'price|10-1000.2': 1,
    'status|1': ['正常', '待检', '报废'],
    'createTime': '@datetime("yyyy-MM-dd HH:mm:ss")'
  }]
})

// 入库记录
const inbound = Mock.mock({
  'list|20-30': [{
    'id|+1': 1,
    'orderNo': /IN\d{12}/,
    'productName': '@ctitle(4,8)',
    'category|1': ['电子产品', '服装', '食品', '家具', '其他'],
    'quantity|1-100': 1,
    'operator': '@cname',
    'status|1': ['待入库', '已入库', '已取消'],
    'createTime': '@datetime("yyyy-MM-dd HH:mm:ss")'
  }]
})

// 出库记录
const outbound = Mock.mock({
  'list|20-30': [{
    'id|+1': 1,
    'orderNo': /OUT\d{12}/,
    'productName': '@ctitle(4,8)',
    'category|1': ['电子产品', '服装', '食品', '家具', '其他'],
    'quantity|1-100': 1,
    'operator': '@cname',
    'status|1': ['待出库', '已出库', '已取消'],
    'createTime': '@datetime("yyyy-MM-dd HH:mm:ss")'
  }]
})

// 仪表盘数据
const dashboard = {
  overview: {
    totalInventory: Mock.mock('@integer(5000, 10000)'),
    todayInbound: Mock.mock('@integer(50, 200)'),
    todayOutbound: Mock.mock('@integer(30, 150)'),
    totalAmount: Mock.mock('@float(100000, 1000000, 2, 2)'),
    inventoryTrend: Mock.mock({
      'inbound|7': ['@integer(50, 200)'],
      'outbound|7': ['@integer(30, 150)']
    }),
    categoryDistribution: [
      { name: '电子产品', value: Mock.mock('@integer(1000, 2000)') },
      { name: '服装', value: Mock.mock('@integer(800, 1500)') },
      { name: '食品', value: Mock.mock('@integer(500, 1000)') },
      { name: '家具', value: Mock.mock('@integer(300, 800)') },
      { name: '其他', value: Mock.mock('@integer(200, 500)') }
    ],
    locationUsage: [
      { name: 'A区', value: Mock.mock('@integer(60, 95)') },
      { name: 'B区', value: Mock.mock('@integer(60, 95)') },
      { name: 'C区', value: Mock.mock('@integer(60, 95)') },
      { name: 'D区', value: Mock.mock('@integer(60, 95)') },
      { name: 'E区', value: Mock.mock('@integer(60, 95)') }
    ],
    recentAlarms: Mock.mock({
      'severe|7': ['@integer(0, 5)'],
      'normal|7': ['@integer(2, 8)']
    })
  }
}

// 监控点位
const cameras = Mock.mock({
  'list|6-8': [{
    'id|+1': 1,
    'name': '@ctitle(4,8)监控点',
    'location': /[A-Z]-\d{2}-\d{2}/,
    'status|1': ['在线', '离线'],
    'lastHeartbeat': '@datetime("yyyy-MM-dd HH:mm:ss")'
  }]
})

export function mockXHR() {
  // 设置拦截 ajax 请求的相应时间
  Mock.setup({
    timeout: '100-200' // 缩短响应时间
  })

  // 库存列表
  Mock.mock(new RegExp('/api/inventory/list'), 'get', () => {
    return {
      code: 200,
      message: 'success',
      data: fixedData.inventory.list
    }
  })

  // 入库列表
  Mock.mock('/api/inbound/list', 'get', () => {
    console.log('Mock inbound data:', fixedData.inbound.list)
    return {
      code: 200,
      message: 'success',
      data: fixedData.inbound.list
    }
  })

  // 出库列表
  Mock.mock('/api/outbound/list', 'get', () => {
    console.log('Mock outbound data:', fixedData.outbound.list)
    return {
      code: 200,
      message: 'success',
      data: fixedData.outbound.list
    }
  })

  // 监控数据
  Mock.mock('/api/monitoring/overview', 'get', () => {
    console.log('Mock monitoring data:', {
      cameras: fixedData.monitoring.cameras,
      alarms: fixedData.monitoring.alarms
    })
    return {
      code: 200,
      message: 'success',
      data: {
        cameras: fixedData.monitoring.cameras,
        alarms: fixedData.monitoring.alarms
      }
    }
  })

  // Dashboard 数据
  Mock.mock(new RegExp('/api/dashboard/overview'), 'get', () => {
    return {
      code: 200,
      message: 'success',
      data: fixedData.dashboard
    }
  })

  console.log('Mock initialized with fixed data')
} 