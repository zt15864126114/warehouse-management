<template>
  <div class="welcome">
    <div class="welcome-header">
      <img src="../assets/logo.svg" alt="logo" class="logo">
      <h1>智能仓储管理系统</h1>
      <p class="subtitle">Intelligent Warehouse Management System</p>
    </div>

    <div class="quick-access">
      <h2>快速访问</h2>
      <el-row :gutter="20">
        <el-col :span="6" v-for="menu in quickMenus" :key="menu.path">
          <router-link :to="menu.path">
            <el-card class="menu-card" :body-style="{ padding: '20px' }">
              <div class="menu-icon">
                <el-icon :size="32" :color="menu.color">
                  <component :is="menu.icon" />
                </el-icon>
              </div>
              <div class="menu-info">
                <h3>{{ menu.title }}</h3>
                <p>{{ menu.desc }}</p>
              </div>
            </el-card>
          </router-link>
        </el-col>
      </el-row>
    </div>

    <div class="system-info">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card class="info-card">
            <template #header>
              <div class="card-header">
                <span>系统状态</span>
                <el-tag type="success">正常运行</el-tag>
              </div>
            </template>
            <div class="status-list">
              <div class="status-item" v-for="status in systemStatus" :key="status.label">
                <span class="label">{{ status.label }}：</span>
                <span class="value" :class="status.class">{{ status.value }}</span>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card class="info-card">
            <template #header>
              <div class="card-header">
                <span>最近活动</span>
                <el-button type="primary" link>查看更多</el-button>
              </div>
            </template>
            <div class="activity-list">
              <div class="activity-item" v-for="activity in recentActivities" :key="activity.time">
                <el-tag size="small" :type="activity.type">{{ activity.category }}</el-tag>
                <span class="content">{{ activity.content }}</span>
                <span class="time">{{ activity.time }}</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { DataLine, Box, Download, Upload, VideoCamera } from '@element-plus/icons-vue'

const quickMenus = [
  {
    title: '系统概览',
    desc: '查看系统整体运行状况',
    icon: 'DataLine',
    path: '/dashboard',
    color: '#409EFF'
  },
  {
    title: '库存管理',
    desc: '管理仓库物资库存信息',
    icon: 'Box',
    path: '/inventory',
    color: '#67C23A'
  },
  {
    title: '入库管理',
    desc: '处理物资入库相关事务',
    icon: 'Download',
    path: '/inbound',
    color: '#E6A23C'
  },
  {
    title: '出库管理',
    desc: '处理物资出库相关事务',
    icon: 'Upload',
    path: '/outbound',
    color: '#F56C6C'
  }
]

const systemStatus = [
  { label: '服务器状态', value: '运行中', class: 'success' },
  { label: '数据库连接', value: '已连接', class: 'success' },
  { label: 'CPU使用率', value: '32%', class: 'normal' },
  { label: '内存使用率', value: '45%', class: 'normal' },
  { label: '磁盘空间', value: '75%', class: 'warning' }
]

const recentActivities = [
  {
    category: '入库',
    content: '新增入库单：IN202402180001',
    time: '10分钟前',
    type: 'success'
  },
  {
    category: '告警',
    content: 'A区温度超出预警值',
    time: '30分钟前',
    type: 'danger'
  },
  {
    category: '出库',
    content: '完成出库单：OUT202402180003',
    time: '1小时前',
    type: 'warning'
  },
  {
    category: '系统',
    content: '完成日常数据备份',
    time: '2小时前',
    type: 'info'
  }
]
</script>

<style scoped>
.welcome {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.welcome-header {
  text-align: center;
  margin-bottom: 40px;
  padding: 40px 0;
}

.logo {
  width: 80px;
  height: 80px;
  margin-bottom: 20px;
}

.welcome-header h1 {
  font-size: 28px;
  color: #303133;
  margin: 0 0 10px;
}

.subtitle {
  font-size: 16px;
  color: #909399;
  margin: 0;
}

.quick-access {
  margin-bottom: 40px;
}

.quick-access h2 {
  font-size: 20px;
  color: #303133;
  margin-bottom: 20px;
}

.menu-card {
  height: 140px;
  border-radius: 8px;
  transition: all 0.3s;
  cursor: pointer;
}

.menu-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 20px 0 rgba(0,0,0,0.1);
}

.menu-icon {
  margin-bottom: 15px;
}

.menu-info h3 {
  font-size: 16px;
  color: #303133;
  margin: 0 0 8px;
}

.menu-info p {
  font-size: 13px;
  color: #909399;
  margin: 0;
}

.info-card {
  border-radius: 8px;
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.status-item {
  display: flex;
  align-items: center;
}

.status-item .label {
  width: 100px;
  color: #606266;
}

.status-item .value {
  font-weight: bold;
}

.status-item .value.success {
  color: #67C23A;
}

.status-item .value.warning {
  color: #E6A23C;
}

.status-item .value.normal {
  color: #409EFF;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.activity-item .content {
  flex: 1;
  color: #606266;
}

.activity-item .time {
  color: #909399;
  font-size: 13px;
}

a {
  text-decoration: none;
}

:deep(.el-card__header) {
  padding: 15px 20px;
  border-bottom: 1px solid #ebeef5;
}
</style> 