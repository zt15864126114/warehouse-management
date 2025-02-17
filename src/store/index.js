import { reactive } from 'vue'
import axios from 'axios'

// 从 localStorage 获取初始状态
const getInitialState = () => {
  try {
    const savedState = localStorage.getItem('warehouseState')
    if (savedState) {
      const parsedState = JSON.parse(savedState)
      // 检查是否有完整的数据
      if (parsedState.inventory?.list?.length > 0 &&
          parsedState.inbound?.list?.length > 0 &&
          parsedState.outbound?.list?.length > 0 &&
          parsedState.monitoring?.cameras?.length > 0) {
        return parsedState
      }
    }
    // 如果没有有效的保存数据，使用固定数据
    return {
      dashboard: { ...fixedData.dashboard },
      inventory: {
        list: [...fixedData.inventory.list],
        total: fixedData.inventory.total
      },
      inbound: {
        list: [...fixedData.inbound.list],
        total: fixedData.inbound.total
      },
      outbound: {
        list: [...fixedData.outbound.list],
        total: fixedData.outbound.total
      },
      monitoring: {
        cameras: [...fixedData.monitoring.cameras],
        alarms: [...fixedData.monitoring.alarms]
      }
    }
  } catch (error) {
    console.error('Failed to load state from localStorage:', error)
    return getEmptyState()
  }
}

// 获取空状态
const getEmptyState = () => ({
  dashboard: {
    cards: [],
    trends: null,
    distribution: null,
    usage: null,
    alarms: null,
    alarmStats: null
  },
  inventory: {
    list: [],
    total: 0
  },
  inbound: {
    list: [],
    total: 0
  },
  outbound: {
    list: [],
    total: 0
  },
  monitoring: {
    cameras: [],
    alarms: []
  }
})

// 固定数据
const fixedData = {
  dashboard: {
    cards: [
      {
        title: '总库存量',
        value: '12,580',
        trend: 5.2,
        icon: 'Box',
        color: '#409EFF'
      },
      {
        title: '今日入库',
        value: '1,234',
        trend: 12.5,
        icon: 'Goods',
        color: '#67C23A'
      },
      {
        title: '今日出库',
        value: '890',
        trend: -3.8,
        icon: 'Van',
        color: '#E6A23C'
      },
      {
        title: '库存金额',
        value: '￥1,526,800',
        trend: 8.3,
        icon: 'Money',
        color: '#F56C6C'
      }
    ],
    trends: {
      inbound: [120, 132, 101, 134, 90, 230, 210],
      outbound: [80, 112, 95, 108, 75, 210, 185]
    },
    distribution: [
      { value: 4200, name: '电子产品' },
      { value: 3580, name: '服装' },
      { value: 2600, name: '食品' },
      { value: 1200, name: '家具' },
      { value: 1000, name: '其他' }
    ],
    usage: [
      {
        name: 'A区-电子产品区',
        value: 85,
        capacity: 1000,
        used: 850
      },
      {
        name: 'B区-服装区',
        value: 70,
        capacity: 1200,
        used: 840
      },
      {
        name: 'C区-食品区',
        value: 65,
        capacity: 800,
        used: 520
      },
      {
        name: 'D区-家具区',
        value: 90,
        capacity: 500,
        used: 450
      },
      {
        name: 'E区-周转区',
        value: 75,
        capacity: 600,
        used: 450
      }
    ],
    alarms: [
      {
        id: 1,
        title: '库位容量预警',
        content: '原料区高架库A1-03-02库位使用率达到95%，请及时调整',
        level: '警告',
        location: 'A1-03-02',
        time: '2024-02-17 14:30:00',
        type: '容量预警',
        count: 5
      },
      {
        id: 2,
        title: '冷链温度异常',
        content: '1号冷库B2区温度上升至8.5℃，超出标准范围(2-6℃)',
        level: '严重',
        location: 'B2-01-01',
        time: '2024-02-17 14:15:00',
        type: '温度异常',
        count: 3
      },
      {
        id: 3,
        title: '安全隐患预警',
        content: '叉车主通道C1区检测到障碍物，影响通行安全',
        level: '警告',
        location: 'C1-过道-01',
        time: '2024-02-17 14:00:00',
        type: '安全隐患',
        count: 2
      },
      {
        id: 4,
        title: '设备故障报警',
        content: 'A2区输送带传感器异常，需要维护',
        level: '严重',
        location: 'A2-输送-02',
        time: '2024-02-17 13:30:00',
        type: '设备故障',
        count: 4
      },
      {
        id: 5,
        title: '货物积压预警',
        content: 'D2区临时存放区已超过48小时未处理',
        level: '警告',
        location: 'D2-暂存-03',
        time: '2024-02-17 13:45:00',
        type: '货物积压',
        count: 3
      }
    ],
    alarmStats: {
      total: 17,
      severe: 7,
      warning: 10,
      types: [
        { name: '容量预警', value: 5 },
        { name: '温度异常', value: 3 },
        { name: '安全隐患', value: 2 },
        { name: '设备故障', value: 4 },
        { name: '货物积压', value: 3 }
      ],
      trend: [
        { date: '2024-02-11', severe: 2, warning: 1 },
        { date: '2024-02-12', severe: 1, warning: 2 },
        { date: '2024-02-13', severe: 0, warning: 3 },
        { date: '2024-02-14', severe: 1, warning: 1 },
        { date: '2024-02-15', severe: 2, warning: 1 },
        { date: '2024-02-16', severe: 0, warning: 1 },
        { date: '2024-02-17', severe: 1, warning: 1 }
      ]
    }
  },
  inventory: {
    list: [
      // 电子产品
      {
        id: 1,
        code: 'WH240201001',
        name: 'Apple iPhone 15 Pro Max 1TB 原色钛金属',
        category: '电子产品',
        location: 'A1-01-01',
        quantity: 500,
        price: 14999.00,
        status: '正常',
        createTime: '2024-02-01 10:00:00'
      },
      {
        id: 2,
        code: 'WH240201002',
        name: 'Apple MacBook Pro 16 M3 Max 2TB',
        category: '电子产品',
        location: 'A1-01-02',
        quantity: 200,
        price: 29999.00,
        status: '正常',
        createTime: '2024-02-01 10:30:00'
      },
      {
        id: 3,
        code: 'WH240201003',
        name: '华为 Mate 60 Pro+ 1TB 砚黑',
        category: '电子产品',
        location: 'A1-01-03',
        quantity: 800,
        price: 8999.00,
        status: '正常',
        createTime: '2024-02-01 11:00:00'
      },
      {
        id: 4,
        code: 'WH240201004',
        name: '小米 14 Ultra 1TB 暗夜黑',
        category: '电子产品',
        location: 'A1-01-04',
        quantity: 600,
        price: 7299.00,
        status: '正常',
        createTime: '2024-02-01 11:30:00'
      },
      {
        id: 5,
        code: 'WH240201005',
        name: 'OPPO Find X7 Ultra 1TB 星夜黑',
        category: '电子产品',
        location: 'A1-01-05',
        quantity: 400,
        price: 6999.00,
        status: '正常',
        createTime: '2024-02-01 12:00:00'
      },
      // 服装
      {
        id: 6,
        code: 'WH240201006',
        name: 'Nike Air Jordan 1 High OG "Chicago Lost & Found"',
        category: '服装',
        location: 'B1-01-01',
        quantity: 1000,
        price: 1599.00,
        status: '正常',
        createTime: '2024-02-01 13:00:00'
      },
      {
        id: 7,
        code: 'WH240201007',
        name: 'UNIQLO +J 羊绒混纺大衣',
        category: '服装',
        location: 'B1-01-02',
        quantity: 2000,
        price: 1999.00,
        status: '正常',
        createTime: '2024-02-01 13:30:00'
      },
      {
        id: 8,
        code: 'WH240201008',
        name: 'The North Face 1996 Nuptse 羽绒服',
        category: '服装',
        location: 'B1-01-03',
        quantity: 800,
        price: 2499.00,
        status: '正常',
        createTime: '2024-02-01 14:00:00'
      },
      {
        id: 9,
        code: 'WH240201009',
        name: 'Arc\'teryx Beta AR 冲锋衣',
        category: '服装',
        location: 'B1-01-04',
        quantity: 500,
        price: 4999.00,
        status: '正常',
        createTime: '2024-02-01 14:30:00'
      },
      {
        id: 10,
        code: 'WH240201010',
        name: 'Adidas Ultraboost Light 跑鞋',
        category: '服装',
        location: 'B1-01-05',
        quantity: 1200,
        price: 1299.00,
        status: '正常',
        createTime: '2024-02-01 15:00:00'
      },
      // 食品
      {
        id: 11,
        code: 'WH240201011',
        name: '蒙牛特仑苏纯牛奶 250ml*24',
        category: '食品',
        location: 'C1-01-01',
        quantity: 5000,
        price: 139.90,
        status: '正常',
        createTime: '2024-02-01 15:30:00'
      },
      {
        id: 12,
        code: 'WH240201012',
        name: '三只松鼠坚果礼盒 2kg',
        category: '食品',
        location: 'C1-01-02',
        quantity: 3000,
        price: 199.90,
        status: '正常',
        createTime: '2024-02-01 16:00:00'
      }
    ],
    total: 12
  },
  inbound: {
    list: [
      {
        id: 1,
        orderNo: 'IN202402170001',
        productName: 'Apple iPhone 15 Pro Max 1TB 原色钛金属',
        category: '电子产品',
        quantity: 100,
        operator: '李明',
        status: '已入库',
        createTime: '2024-02-17 09:00:00'
      },
      {
        id: 2,
        orderNo: 'IN202402170002',
        productName: 'Apple MacBook Pro 16 M3 Max 2TB',
        category: '电子产品',
        quantity: 50,
        operator: '王芳',
        status: '待入库',
        createTime: '2024-02-17 09:30:00'
      },
      {
        id: 3,
        orderNo: 'IN202402170003',
        productName: '华为 Mate 60 Pro+ 1TB 砚黑',
        category: '电子产品',
        quantity: 200,
        operator: '张伟',
        status: '已入库',
        createTime: '2024-02-17 10:00:00'
      },
      {
        id: 4,
        orderNo: 'IN202402170004',
        productName: 'UNIQLO +J 羊绒混纺大衣',
        category: '服装',
        quantity: 500,
        operator: '刘洋',
        status: '待入库',
        createTime: '2024-02-17 10:30:00'
      },
      {
        id: 5,
        orderNo: 'IN202402170005',
        productName: '蒙牛特仑苏纯牛奶 250ml*24',
        category: '食品',
        quantity: 1000,
        operator: '陈静',
        status: '已入库',
        createTime: '2024-02-17 11:00:00'
      },
      {
        id: 6,
        orderNo: 'IN202402170006',
        productName: 'The North Face 1996 Nuptse 羽绒服',
        category: '服装',
        quantity: 300,
        operator: '赵鑫',
        status: '待入库',
        createTime: '2024-02-17 11:30:00'
      },
      {
        id: 7,
        orderNo: 'IN202402170007',
        productName: '小米 14 Ultra 1TB 暗夜黑',
        category: '电子产品',
        quantity: 150,
        operator: '孙丽',
        status: '已入库',
        createTime: '2024-02-17 13:00:00'
      },
      {
        id: 8,
        orderNo: 'IN202402170008',
        productName: 'OPPO Find X7 Ultra 1TB 星夜黑',
        category: '电子产品',
        quantity: 100,
        operator: '周强',
        status: '待入库',
        createTime: '2024-02-17 13:30:00'
      }
    ],
    total: 8
  },
  outbound: {
    list: [
      {
        id: 1,
        orderNo: 'OUT202402170001',
        productName: 'Apple iPhone 15 Pro Max 1TB 原色钛金属',
        category: '电子产品',
        quantity: 20,
        operator: '赵晓',
        status: '已出库',
        createTime: '2024-02-17 09:00:00'
      },
      {
        id: 2,
        orderNo: 'OUT202402170002',
        productName: 'Apple MacBook Pro 16 M3 Max 2TB',
        category: '电子产品',
        quantity: 15,
        operator: '孙磊',
        status: '待出库',
        createTime: '2024-02-17 09:30:00'
      },
      {
        id: 3,
        orderNo: 'OUT202402170003',
        productName: '华为 Mate 60 Pro+ 1TB 砚黑',
        category: '电子产品',
        quantity: 50,
        operator: '周婷',
        status: '已出库',
        createTime: '2024-02-17 10:00:00'
      },
      {
        id: 4,
        orderNo: 'OUT202402170004',
        productName: 'UNIQLO +J 羊绒混纺大衣',
        category: '服装',
        quantity: 100,
        operator: '吴强',
        status: '待出库',
        createTime: '2024-02-17 10:30:00'
      },
      {
        id: 5,
        orderNo: 'OUT202402170005',
        productName: '蒙牛特仑苏纯牛奶 250ml*24',
        category: '食品',
        quantity: 200,
        operator: '郑阳',
        status: '已出库',
        createTime: '2024-02-17 11:00:00'
      },
      {
        id: 6,
        orderNo: 'OUT202402170006',
        productName: 'The North Face 1996 Nuptse 羽绒服',
        category: '服装',
        quantity: 80,
        operator: '王磊',
        status: '待出库',
        createTime: '2024-02-17 11:30:00'
      },
      {
        id: 7,
        orderNo: 'OUT202402170007',
        productName: '小米 14 Ultra 1TB 暗夜黑',
        category: '电子产品',
        quantity: 30,
        operator: '张婷',
        status: '已出库',
        createTime: '2024-02-17 13:00:00'
      },
      {
        id: 8,
        orderNo: 'OUT202402170008',
        productName: 'OPPO Find X7 Ultra 1TB 星夜黑',
        category: '电子产品',
        quantity: 25,
        operator: '李强',
        status: '待出库',
        createTime: '2024-02-17 13:30:00'
      }
    ],
    total: 8
  },
  monitoring: {
    cameras: [
      {
        id: 1,
        name: 'IPC-A1-01',
        location: '原料区-高架库A区',
        status: '在线',
        type: '海康威视球机',
        lastMaintenance: '2024-01-15'
      },
      {
        id: 2,
        name: 'IPC-B2-03',
        location: '成品区-平库B区',
        status: '在线',
        type: '大华枪机',
        lastMaintenance: '2024-01-20'
      },
      {
        id: 3,
        name: 'IPC-C1-02',
        location: '包装区-自动化线',
        status: '离线',
        type: '海康威视球机',
        lastMaintenance: '2024-02-01'
      },
      {
        id: 4,
        name: 'IPC-D3-04',
        location: '装卸区-月台',
        status: '在线',
        type: '大华枪机',
        lastMaintenance: '2024-02-05'
      },
      {
        id: 5,
        name: 'IPC-E2-01',
        location: '周转区-暂存区',
        status: '在线',
        type: '海康威视球机',
        lastMaintenance: '2024-02-10'
      },
      {
        id: 6,
        name: 'IPC-F1-05',
        location: '危险品区-专用库',
        status: '在线',
        type: '大华枪机',
        lastMaintenance: '2024-02-15'
      }
    ],
    alarms: [
      {
        id: 1,
        title: '库位容量预警',
        content: '原料区高架库A1-03-02库位使用率达到95%，请及时调整',
        level: '警告',
        location: 'A1-03-02',
        time: '2024-02-17 14:30:00',
        type: '容量预警',
        count: 5
      },
      {
        id: 2,
        title: '冷链温度异常',
        content: '1号冷库B2区温度上升至8.5℃，超出标准范围(2-6℃)',
        level: '严重',
        location: 'B2-01-01',
        time: '2024-02-17 14:15:00',
        type: '温度异常',
        count: 3
      },
      {
        id: 3,
        title: '安全隐患预警',
        content: '叉车主通道C1区检测到障碍物，影响通行安全',
        level: '警告',
        location: 'C1-过道-01',
        time: '2024-02-17 14:00:00',
        type: '安全隐患',
        count: 2
      },
      {
        id: 4,
        title: '设备故障报警',
        content: 'A2区输送带传感器异常，需要维护',
        level: '严重',
        location: 'A2-输送-02',
        time: '2024-02-17 13:30:00',
        type: '设备故障',
        count: 4
      },
      {
        id: 5,
        title: '货物积压预警',
        content: 'D2区临时存放区已超过48小时未处理',
        level: '警告',
        location: 'D2-暂存-03',
        time: '2024-02-17 13:45:00',
        type: '货物积压',
        count: 3
      },
      {
        id: 6,
        title: '未授权访问',
        content: 'E1区检测到未授权人员进入',
        level: '严重',
        location: 'E1-01-01',
        time: '2024-02-17 14:45:00',
        type: '安全预警',
        count: 1
      },
      {
        id: 7,
        title: '环境湿度异常',
        content: 'F2区相对湿度达到85%，超出标准范围',
        level: '警告',
        location: 'F2-02-03',
        time: '2024-02-17 15:00:00',
        type: '环境异常',
        count: 2
      },
      {
        id: 8,
        title: '监控设备离线',
        content: 'C1-02摄像头离线，请检查网络连接',
        level: '警告',
        location: 'C1-02',
        time: '2024-02-17 15:15:00',
        type: '设备异常',
        count: 1
      }
    ],
    stats: {
      deviceHealth: 92,
      alarmRate: 2.5,
      responseTime: 85,
      maintenanceRate: 95
    },
    inspectionTasks: [
      {
        id: 1,
        title: '日常设备巡检',
        area: 'A区',
        staff: '张工',
        status: 'pending',
        time: '2024-02-18 09:00:00'
      },
      {
        id: 2,
        title: '月度设备维护',
        area: 'B区',
        staff: '李工',
        status: 'completed',
        time: '2024-02-17 14:00:00'
      }
    ],
    maintenanceRecords: [
      {
        id: 1,
        deviceName: 'IPC-A1-01',
        type: '定期检查',
        staff: '王工',
        status: 'completed',
        time: '2024-02-15 10:00:00',
        notes: '设备运行正常，已完成清洁和校准'
      }
    ],
    areas: [
      { value: 'A', label: '原料区' },
      { value: 'B', label: '成品区' },
      { value: 'C', label: '包装区' },
      { value: 'D', label: '装卸区' },
      { value: 'E', label: '周转区' },
      { value: 'F', label: '危险品区' }
    ],
    maintenanceStaff: [
      { id: 1, name: '张工', specialty: '视频监控' },
      { id: 2, name: '李工', specialty: '网络设备' },
      { id: 3, name: '王工', specialty: '系统维护' }
    ]
  }
}

// 导出固定数据供其他文件使用
export { fixedData }

// 确保在导出 store 之前初始化数据
const store = {
  state: reactive(getInitialState()),

  // 保存状态到 localStorage
  saveState() {
    try {
      const state = {
        dashboard: { ...this.state.dashboard },
        inventory: {
          list: [...this.state.inventory.list],
          total: this.state.inventory.total
        },
        inbound: {
          list: [...this.state.inbound.list],
          total: this.state.inbound.total
        },
        outbound: {
          list: [...this.state.outbound.list],
          total: this.state.outbound.total
        },
        monitoring: {
          cameras: [...this.state.monitoring.cameras],
          alarms: [...this.state.monitoring.alarms]
        }
      }
      localStorage.setItem('warehouseState', JSON.stringify(state))
    } catch (error) {
      console.error('Failed to save state to localStorage:', error)
    }
  },

  // 初始化所有数据
  async initializeData() {
    try {
      // 检查是否已有数据
      if (this.state.inventory.list.length > 0) {
        return true
      }

      // 使用固定数据初始化
      this.setDashboardData(fixedData.dashboard)
      this.setInventoryData(fixedData.inventory.list, fixedData.inventory.total)
      this.setInboundData(fixedData.inbound.list, fixedData.inbound.total)
      this.setOutboundData(fixedData.outbound.list, fixedData.outbound.total)
      this.setMonitoringData(fixedData.monitoring.cameras, fixedData.monitoring.alarms)
      
      // 保存到 localStorage
      this.saveState()
      return true
    } catch (error) {
      console.error('初始化数据失败:', error)
      return false
    }
  },

  // Dashboard
  setDashboardData(data) {
    this.state.dashboard = data
    this.saveState()
  },

  // Inventory
  setInventoryData(list, total) {
    this.state.inventory = {
      list: Array.isArray(list) ? list : [],
      total: typeof total === 'number' ? total : (Array.isArray(list) ? list.length : 0)
    }
    this.saveState()
  },

  // Inbound
  setInboundData(list, total) {
    this.state.inbound = {
      list: Array.isArray(list) ? [...list] : [],
      total: typeof total === 'number' ? total : (Array.isArray(list) ? list.length : 0)
    }
    this.saveState()
  },

  // Outbound
  setOutboundData(list, total) {
    this.state.outbound = {
      list: Array.isArray(list) ? [...list] : [],
      total: typeof total === 'number' ? total : (Array.isArray(list) ? list.length : 0)
    }
    this.saveState()
  },

  // Monitoring
  setMonitoringData(cameras, alarms) {
    this.state.monitoring.cameras = cameras
    this.state.monitoring.alarms = alarms
    this.saveState()
  },

  // 清除所有数据
  clearState() {
    this.state.dashboard = {
      cards: [],
      trends: null,
      distribution: null,
      usage: null,
      alarms: null
    }
    this.state.inventory = {
      list: [],
      total: 0
    }
    this.state.inbound = {
      list: [],
      total: 0
    }
    this.state.outbound = {
      list: [],
      total: 0
    }
    this.state.monitoring = {
      cameras: [],
      alarms: []
    }
    localStorage.removeItem('warehouseState')
  }
}

// 确保数据被正确初始化
store.initializeData()

export { store }

// 监听页面卸载事件，保存状态
window.addEventListener('beforeunload', () => {
  store.saveState()
}) 