<template>
  <div class="monitoring">
    <!-- 实时预警通知 -->
    <el-alert
      v-if="latestAlarm"
      :title="latestAlarm.title"
      :description="latestAlarm.content"
      :type="getAlarmLevelType(latestAlarm.level)"
      show-icon
      :closable="false"
      class="alert-banner"
    />

    <!-- 数据统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6" v-for="stat in statsCards" :key="stat.title">
        <el-card class="stats-card">
          <template #header>
            <div class="stats-header">
              <span>{{ stat.title }}</span>
              <el-tag :type="stat.type">{{ stat.value }}</el-tag>
            </div>
          </template>
          <div class="stats-content">
            <el-progress
              type="dashboard"
              :percentage="stat.percentage"
              :color="stat.color"
            />
            <div class="stats-label">{{ stat.label }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 区域筛选 -->
    <div class="filter-bar">
      <el-select
        v-model="currentArea"
        placeholder="选择区域"
        clearable
        class="area-select"
        @change="filterByArea"
      >
        <el-option
          v-for="area in areas"
          :key="area.value"
          :label="area.label"
          :value="area.value"
        />
      </el-select>
    </div>

    <!-- 摄像头列表 -->
    <el-card class="camera-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <span class="title">监控点位</span>
            <el-tag type="success">{{ cameras.filter(c => c.status === '在线').length }} 在线</el-tag>
            <el-tag type="danger">{{ cameras.filter(c => c.status === '离线').length }} 离线</el-tag>
          </div>
          <div class="header-actions">
            <el-button type="primary" link @click="handleRefresh">
              <el-icon><Refresh /></el-icon>刷新
            </el-button>
            <el-button type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon>添加监控点
            </el-button>
          </div>
        </div>
      </template>
      <el-table
        v-loading="loading"
        :data="cameras"
        style="width: 100%"
        size="large"
        border
      >
        <el-table-column prop="name" label="监控点名称" min-width="180" />
        <el-table-column prop="location" label="位置" width="150" />
        <el-table-column prop="type" label="设备类型" width="150" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getCameraStatusType(row.status)">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastMaintenance" label="最后维护时间" width="180" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleViewCamera(row)">查看</el-button>
            <el-button type="warning" link @click="handleMaintenance(row)">维护</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 告警列表 -->
    <el-card class="alarm-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <span class="title">告警信息</span>
            <el-tag type="danger">{{ alarms.filter(a => a.level === '严重').length }} 严重</el-tag>
            <el-tag type="warning">{{ alarms.filter(a => a.level === '警告').length }} 警告</el-tag>
          </div>
          <div class="header-actions">
            <el-button type="primary" link @click="handleRefresh">
              <el-icon><Refresh /></el-icon>刷新
            </el-button>
            <el-button type="danger" link @click="handleClearAlarms">
              <el-icon><Delete /></el-icon>清空已处理
            </el-button>
          </div>
        </div>
      </template>
      <el-table
        v-loading="loading"
        :data="alarms"
        style="width: 100%"
        size="large"
        border
      >
        <el-table-column prop="title" label="告警标题" min-width="180" />
        <el-table-column prop="content" label="告警内容" min-width="300" show-overflow-tooltip />
        <el-table-column prop="level" label="级别" width="100">
          <template #default="{ row }">
            <el-tag :type="getAlarmLevelType(row.level)">
              {{ row.level }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="location" label="位置" width="120" />
        <el-table-column prop="time" label="时间" width="180" />
        <el-table-column prop="type" label="类型" width="120" />
        <el-table-column prop="count" label="次数" width="80" align="right" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleProcessAlarm(row)">处理</el-button>
            <el-button type="success" link @click="handleIgnoreAlarm(row)">忽略</el-button>
            <el-button type="info" link @click="handleAlarmDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 查看监控对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="currentCamera?.name"
      width="800px"
      class="camera-dialog"
    >
      <div class="camera-preview">
        <div class="camera-placeholder large">
          <el-icon :size="64"><VideoCamera /></el-icon>
          <span>监控预览</span>
          <div class="camera-info">
            <p><strong>位置：</strong>{{ currentCamera?.location }}</p>
            <p><strong>类型：</strong>{{ currentCamera?.type }}</p>
            <p><strong>状态：</strong>
              <el-tag :type="getCameraStatusType(currentCamera?.status)">
                {{ currentCamera?.status }}
              </el-tag>
            </p>
          </div>
        </div>
      </div>
      <div class="camera-controls">
        <div class="control-group">
          <span class="control-label">方向控制</span>
          <el-button-group>
            <el-button type="primary" :icon="ArrowUp" />
            <el-button type="primary" :icon="ArrowDown" />
            <el-button type="primary" :icon="ArrowLeft" />
            <el-button type="primary" :icon="ArrowRight" />
          </el-button-group>
        </div>
        <div class="control-group">
          <span class="control-label">变焦控制</span>
          <el-button-group>
            <el-button type="primary" :icon="ZoomIn" />
            <el-button type="primary" :icon="ZoomOut" />
          </el-button-group>
        </div>
      </div>
    </el-dialog>

    <!-- 添加设备对话框 -->
    <el-dialog
      v-model="addDialogVisible"
      title="添加监控点"
      width="500px"
      destroy-on-close
    >
      <el-form
        ref="addFormRef"
        :model="addForm"
        :rules="rules"
        label-width="100px"
        class="dialog-form"
      >
        <el-form-item label="设备名称" prop="name">
          <el-input 
            v-model="addForm.name" 
            placeholder="请输入设备名称，格式：IPC-X0-00"
          />
        </el-form-item>
        <el-form-item label="安装位置" prop="location">
          <el-input 
            v-model="addForm.location" 
            placeholder="请输入安装位置"
          />
        </el-form-item>
        <el-form-item label="设备类型" prop="type">
          <el-select 
            v-model="addForm.type" 
            placeholder="请选择设备类型"
            class="form-select"
          >
            <el-option
              v-for="type in deviceTypes"
              :key="type"
              :label="type"
              :value="type"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="addDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleAddSubmit">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Monitoring'
}
</script>

<script setup>
import { ref, onMounted, onActivated, computed } from 'vue'
import { 
  VideoCamera, 
  Refresh,
  Plus,
  Delete,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ZoomIn,
  ZoomOut
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'
import { store, fixedData } from '../store'

const loading = ref(false)
const cameras = ref([])
const alarms = ref([])
const dialogVisible = ref(false)
const currentCamera = ref(null)
const addDialogVisible = ref(false)
const addForm = ref({
  name: '',
  location: '',
  type: '海康威视球机'
})
const addFormRef = ref(null)

// 设备类型选项
const deviceTypes = [
  '海康威视球机',
  '大华枪机',
  '海康威视枪机',
  '大华球机',
  '萤石云摄像头'
]

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入设备名称', trigger: 'blur' },
    { pattern: /^IPC-[A-Z]\d-\d{2}$/, message: '设备名称格式应为 IPC-X0-00', trigger: 'blur' }
  ],
  location: [
    { required: true, message: '请输入安装位置', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择设备类型', trigger: 'change' }
  ]
}

// 新增的响应式数据
const currentArea = ref('')
const areas = ref(fixedData.monitoring.areas)
const inspectionTasks = ref(fixedData.monitoring.inspectionTasks)
const latestAlarm = computed(() => alarms.value[0])

// 统计卡片数据
const statsCards = computed(() => [
  {
    title: '设备总数',
    value: cameras.value.length,
    percentage: Math.round((cameras.value.filter(c => c.status === '在线').length / cameras.value.length) * 100),
    label: '在线率',
    type: 'primary',
    color: '#409EFF'
  },
  {
    title: '设备健康度',
    value: fixedData.monitoring.stats.deviceHealth + '%',
    percentage: fixedData.monitoring.stats.deviceHealth,
    label: '健康评分',
    type: 'success',
    color: '#67C23A'
  },
  {
    title: '告警统计',
    value: alarms.value.length,
    percentage: 100 - Math.round((alarms.value.filter(a => a.level === '严重').length / alarms.value.length) * 100),
    label: '告警处理率',
    type: 'warning',
    color: '#E6A23C'
  },
  {
    title: '维护计划',
    value: fixedData.monitoring.stats.maintenanceRate + '%',
    percentage: fixedData.monitoring.stats.maintenanceRate,
    label: '计划完成率',
    type: 'info',
    color: '#909399'
  }
])

// 获取监控数据
const getMonitoringData = () => {
  loading.value = true
  try {
    // 直接使用固定数据
    cameras.value = [...fixedData.monitoring.cameras]
    alarms.value = [...fixedData.monitoring.alarms]
    // 更新 store
    store.setMonitoringData(cameras.value, alarms.value)
    loading.value = false
  } catch (error) {
    console.error('获取监控数据失败:', error)
    ElMessage.error('获取监控数据失败')
    loading.value = false
  }
}

// 获取摄像头状态样式
const getCameraStatusType = (status) => {
  return status === '在线' ? 'success' : 'danger'
}

// 获取告警级别样式
const getAlarmLevelType = (level) => {
  const map = {
    '严重': 'danger',
    '警告': 'warning',
    '提示': 'info'
  }
  return map[level]
}

// 区域筛选方法
const filterByArea = (area) => {
  if (!area) {
    cameras.value = [...fixedData.monitoring.cameras]
  } else {
    cameras.value = fixedData.monitoring.cameras.filter(
      camera => camera.location.startsWith(area)
    )
  }
}

// 获取任务状态样式
const getTaskStatusType = (status) => {
  const map = {
    'pending': 'warning',
    'completed': 'success',
    'overdue': 'danger'
  }
  return map[status]
}

// 组件被激活时重新获取数据
onActivated(() => {
  getMonitoringData()
})

// 组件挂载时获取数据
onMounted(() => {
  getMonitoringData()
})

// 刷新数据
const handleRefresh = () => {
  getMonitoringData()
  ElMessage.success('刷新成功')
}

// 查看监控
const handleViewCamera = (camera) => {
  currentCamera.value = { ...camera }
  dialogVisible.value = true
}

// 维护设备
const handleMaintenance = (camera) => {
  ElMessageBox.confirm(
    `确认对设备 ${camera.name} 进行维护？`,
    '维护确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 更新维护时间
    const updatedCamera = {
      ...camera,
      lastMaintenance: new Date().toISOString().split('T')[0]
    }
    cameras.value = cameras.value.map(c => 
      c.id === camera.id ? updatedCamera : c
    )
    store.setMonitoringData(cameras.value, alarms.value)
    ElMessage.success('维护记录已更新')
  }).catch(() => {})
}

// 删除设备
const handleDelete = (camera) => {
  ElMessageBox.confirm(
    `确认删除设备 ${camera.name}？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'danger'
    }
  ).then(() => {
    cameras.value = cameras.value.filter(c => c.id !== camera.id)
    store.setMonitoringData(cameras.value, alarms.value)
    ElMessage.success('设备已删除')
  }).catch(() => {})
}

// 处理告警
const handleProcessAlarm = (alarm) => {
  ElMessageBox.confirm(
    `确认处理告警 "${alarm.title}"？`,
    '处理确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    alarms.value = alarms.value.filter(a => a.id !== alarm.id)
    store.setMonitoringData(cameras.value, alarms.value)
    ElMessage.success('告警已处理')
  }).catch(() => {})
}

// 忽略告警
const handleIgnoreAlarm = (alarm) => {
  alarms.value = alarms.value.filter(a => a.id !== alarm.id)
  store.setMonitoringData(cameras.value, alarms.value)
  ElMessage.success('告警已忽略')
}

// 查看告警详情
const handleAlarmDetail = (alarm) => {
  ElMessageBox.alert(
    `
    <p><strong>告警内容：</strong>${alarm.content}</p>
    <p><strong>位置：</strong>${alarm.location}</p>
    <p><strong>时间：</strong>${alarm.time}</p>
    <p><strong>类型：</strong>${alarm.type}</p>
    <p><strong>告警次数：</strong>${alarm.count}</p>
    `,
    `告警详情 - ${alarm.title}`,
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: '关闭'
    }
  )
}

// 清空已处理告警
const handleClearAlarms = () => {
  ElMessageBox.confirm(
    '确认清空所有已处理的告警记录？',
    '清空确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    alarms.value = alarms.value.filter(a => a.status !== 'processed')
    store.setMonitoringData(cameras.value, alarms.value)
    ElMessage.success('已清空处理记录')
  }).catch(() => {})
}

// 添加设备
const handleAdd = () => {
  addForm.value = {
    name: '',
    location: '',
    type: '海康威视球机'
  }
  addDialogVisible.value = true
}

// 提交添加设备表单
const handleAddSubmit = async () => {
  if (!addFormRef.value) return
  await addFormRef.value.validate((valid) => {
    if (valid) {
      const newCamera = {
        id: Date.now(),
        ...addForm.value,
        status: '在线',
        lastMaintenance: new Date().toISOString().split('T')[0]
      }
      // 更新数据
      cameras.value = [newCamera, ...cameras.value]
      store.setMonitoringData(cameras.value, alarms.value)
      ElMessage.success('添加成功')
      addDialogVisible.value = false
    }
  })
}

// 创建巡检任务
const createInspection = () => {
  // TODO: 实现创建巡检任务的逻辑
  ElMessage.info('创建巡检任务功能开发中')
}
</script>

<style scoped>
.monitoring {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.camera-card {
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
}

.alarm-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-left .title {
  font-size: 16px;
  font-weight: bold;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.camera-preview {
  background-color: #1a1a1a;
  border-radius: 8px;
  padding: 20px;
}

.camera-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  color: #fff;
}

.camera-placeholder.large {
  height: 400px;
  justify-content: center;
  background-color: #2c2c2c;
  border-radius: 4px;
}

.camera-info {
  text-align: center;
  margin-top: 20px;
}

.camera-info p {
  margin: 8px 0;
}

.camera-controls {
  margin-top: 20px;
  display: flex;
  gap: 40px;
  justify-content: center;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.control-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.control-label {
  font-size: 14px;
  color: #606266;
}

:deep(.el-table) {
  --el-table-header-bg-color: #f5f7fa;
  border-radius: 8px;
}

:deep(.el-table th) {
  font-weight: bold;
}

:deep(.el-table--border) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-dialog.camera-dialog) {
  border-radius: 8px;
}

:deep(.el-dialog__body) {
  padding: 20px;
}

:deep(.el-dialog__header) {
  margin-right: 0;
  padding: 20px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

:deep(.el-dialog__footer) {
  padding: 20px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.dialog-form {
  padding: 20px 0;
}

.form-select {
  width: 100%;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.alert-banner {
  margin-bottom: 20px;
}

.stats-row {
  margin-bottom: 20px;
}

.stats-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stats-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
}

.stats-label {
  margin-top: 10px;
  color: #606266;
  font-size: 14px;
}

.filter-bar {
  margin-bottom: 20px;
  display: flex;
  gap: 12px;
}

.area-select {
  width: 200px;
}

.inspection-card {
  margin-top: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
}

:deep(.el-timeline-item__node) {
  width: 12px;
  height: 12px;
}

:deep(.el-timeline-item__content h4) {
  margin: 0;
  font-size: 14px;
  color: #303133;
}

:deep(.el-timeline-item__content p) {
  margin: 4px 0;
  font-size: 13px;
  color: #606266;
}

:deep(.el-timeline-item__timestamp) {
  font-size: 13px;
}
</style> 