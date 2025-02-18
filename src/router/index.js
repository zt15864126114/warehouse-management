import { createRouter, createWebHistory } from 'vue-router'
import { ElLoading } from 'element-plus'
import axios from 'axios'
import { store, fixedData } from '../store'

// 预先导入组件
import Layout from '../views/Layout.vue'
import Welcome from '../views/Welcome.vue'
import Dashboard from '../views/Dashboard.vue'
import Inventory from '../views/Inventory.vue'
import Inbound from '../views/Inbound.vue'
import Outbound from '../views/Outbound.vue'
import Monitoring from '../views/Monitoring.vue'
import Access from '../views/Access.vue'
import SystemSettings from '../views/SystemSettings.vue'

const routes = [
  {
    path: '/',
    component: Layout,
    redirect: '/welcome',
    children: [
      {
        path: 'welcome',
        name: 'Welcome',
        component: Welcome,
        meta: { title: '欢迎' }
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: { title: '系统概览' }
      },
      {
        path: 'inventory',
        name: 'Inventory',
        component: Inventory,
        meta: { title: '库存管理' }
      },
      {
        path: 'inbound',
        name: 'Inbound',
        component: Inbound,
        meta: { title: '入库管理' }
      },
      {
        path: 'outbound',
        name: 'Outbound',
        component: Outbound,
        meta: { title: '出库管理' }
      },
      {
        path: 'monitoring',
        name: 'Monitoring',
        component: Monitoring,
        meta: { title: '监控系统' }
      },
      {
        path: 'access',
        name: 'Access',
        component: Access,
        meta: { title: '门禁管理' }
      },
      {
        path: 'settings',
        name: 'SystemSettings',
        component: SystemSettings,
        meta: { title: '系统管理' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

let loadingInstance = null

// 添加一个分页函数
const paginateData = (data, currentPage, pageSize) => {
  const start = (currentPage - 1) * pageSize
  const end = start + pageSize
  return {
    list: data.slice(start, end),
    total: data.length
  }
}

// 全局路由守卫
router.beforeEach(async (to, from, next) => {
  // 显示加载中
  loadingInstance = ElLoading.service({
    lock: true,
    text: '加载中...',
    background: 'rgba(0, 0, 0, 0.7)'
  })

  try {
    // 检查数据是否已初始化
    if (!store.state.inventory.list.length) {
      await store.initializeData()
    }

    // 根据路由名称获取对应的数据
    switch (to.name) {
      case 'Dashboard':
        if (!store.state.dashboard.cards.length) {
          store.setDashboardData(fixedData.dashboard)
        }
        break

      case 'Inventory':
        if (!store.state.inventory.list.length) {
          store.setInventoryData(fixedData.inventory.list, fixedData.inventory.total)
        }
        break

      case 'Inbound':
        if (!store.state.inbound.list.length) {
          store.setInboundData(fixedData.inbound.list, fixedData.inbound.total)
        }
        break

      case 'Outbound':
        if (!store.state.outbound.list.length) {
          store.setOutboundData(fixedData.outbound.list, fixedData.outbound.total)
        }
        break

      case 'Monitoring':
        if (!store.state.monitoring.cameras.length) {
          store.setMonitoringData(fixedData.monitoring.cameras, fixedData.monitoring.alarms)
        }
        break
    }

    next()
  } catch (error) {
    console.error('路由加载失败:', error)
    next(false)
  }
})

router.afterEach(() => {
  // 关闭加载中
  if (loadingInstance) {
    setTimeout(() => {
      loadingInstance.close()
    }, 300)
  }
})

export default router 