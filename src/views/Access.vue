<template>
  <div class="access">
    <!-- 工具栏 -->
    <el-card class="toolbar-card">
      <div class="toolbar">
        <div class="search-area">
          <el-input
            v-model="searchForm.keyword"
            placeholder="搜索门禁/人员"
            class="search-input"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-select
            v-model="searchForm.area"
            placeholder="选择区域"
            clearable
            class="area-select"
          >
            <el-option
              v-for="area in areas"
              :key="area.value"
              :label="area.label"
              :value="area.value"
            />
          </el-select>
        </div>
        <div class="action-group">
          <el-button type="success" @click="handleAddPerson">
            <el-icon><UserFilled /></el-icon>添加人员
          </el-button>
          <el-button type="primary" @click="handleAddDevice">
            <el-icon><Plus /></el-icon>添加门禁
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 门禁设备列表 -->
    <el-card class="device-card">
      <template #header>
        <div class="card-header">
          <span class="title">门禁设备</span>
          <div class="header-actions">
            <el-button type="primary" link @click="handleRefresh">
              <el-icon><Refresh /></el-icon>刷新
            </el-button>
          </div>
        </div>
      </template>
      <el-table
        v-loading="loading"
        :data="filteredDevices"
        style="width: 100%"
        size="large"
        border
      >
        <el-table-column prop="name" label="设备名称" min-width="180" />
        <el-table-column prop="location" label="安装位置" width="150" />
        <el-table-column prop="type" label="设备类型" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getDeviceStatusType(row.status)">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastMaintenance" label="最后维护时间" width="180" />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleControl(row)">
              远程控制
            </el-button>
            <el-button type="success" link @click="handleViewRecords(row)">
              通行记录
            </el-button>
            <el-button type="warning" link @click="handleMaintenance(row)">
              维护
            </el-button>
            <el-button type="danger" link @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 通行记录 -->
    <el-card class="records-card">
      <template #header>
        <div class="card-header">
          <span class="title">最近通行记录</span>
          <el-button type="primary" link>查看全部</el-button>
        </div>
      </template>
      <el-table
        :data="currentPageRecords"
        style="width: 100%"
        size="large"
        border
      >
        <el-table-column prop="time" label="时间" width="180" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="department" label="部门" width="150" />
        <el-table-column prop="device" label="门禁设备" min-width="180" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.type === '进入' ? 'success' : 'info'">
              {{ row.type }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getAccessStatusType(row.status)">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页器 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="recordsPage.currentPage"
          v-model:page-size="recordsPage.pageSize"
          :page-sizes="[10, 20, 30, 50]"
          :total="recordsPage.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 添加人员对话框 -->
    <el-dialog
      v-model="personDialogVisible"
      title="添加授权人员"
      width="500px"
    >
      <el-form
        ref="personFormRef"
        :model="personForm"
        :rules="personRules"
        label-width="100px"
      >
        <el-form-item label="姓名" prop="name">
          <el-input v-model="personForm.name" />
        </el-form-item>
        <el-form-item label="工号" prop="employeeId">
          <el-input v-model="personForm.employeeId" />
        </el-form-item>
        <el-form-item label="部门" prop="department">
          <el-input v-model="personForm.department" />
        </el-form-item>
        <el-form-item label="权限区域" prop="areas">
          <el-select
            v-model="personForm.areas"
            multiple
            placeholder="请选择权限区域"
          >
            <el-option
              v-for="area in areas"
              :key="area.value"
              :label="area.label"
              :value="area.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="有效期" prop="validDate">
          <el-date-picker
            v-model="personForm.validDate"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="personDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitPerson">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 远程控制对话框 -->
    <el-dialog
      v-model="controlDialogVisible"
      :title="`远程控制 - ${currentDevice?.name}`"
      width="700px"
      class="control-dialog"
    >
      <div class="device-info">
        <div class="info-item">
          <span class="label">设备位置：</span>
          <span class="value">{{ currentDevice?.location }}</span>
        </div>
        <div class="info-item">
          <span class="label">设备状态：</span>
          <el-tag :type="getDeviceStatusType(currentDevice?.status)">
            {{ currentDevice?.status }}
          </el-tag>
        </div>
      </div>
      
      <div class="control-options">
        <div
          v-for="option in controlOptions"
          :key="option.value"
          class="control-card"
          :class="{ 'emergency': option.value === 'emergency' }"
          @click="executeControl(option)"
        >
          <el-icon class="control-icon">
            <component :is="getControlIcon(option.value)" />
          </el-icon>
          <span class="control-label">{{ option.label }}</span>
          <span class="control-desc">{{ getControlDescription(option.value) }}</span>
        </div>
      </div>
    </el-dialog>

    <!-- 查看通行记录对话框 -->
    <el-dialog
      v-model="recordsDialogVisible"
      title="通行记录"
      width="800px"
    >
      <el-table :data="deviceRecords" border>
        <el-table-column prop="time" label="时间" width="180" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="department" label="部门" width="150" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.type === '进入' ? 'success' : 'info'">
              {{ row.type }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getAccessStatusType(row.status)">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 设备维护对话框 -->
    <el-dialog
      v-model="maintenanceDialogVisible"
      title="添加维护计划"
      width="500px"
    >
      <el-form :model="maintenanceForm" label-width="100px">
        <el-form-item label="维护类型">
          <el-select v-model="maintenanceForm.type" style="width: 100%">
            <el-option label="常规维护" value="常规维护" />
            <el-option label="故障维修" value="故障维修" />
            <el-option label="设备升级" value="设备升级" />
          </el-select>
        </el-form-item>
        <el-form-item label="维护说明">
          <el-input
            v-model="maintenanceForm.description"
            type="textarea"
            rows="3"
          />
        </el-form-item>
        <el-form-item label="维护人员">
          <el-input v-model="maintenanceForm.maintainer" />
        </el-form-item>
        <el-form-item label="计划日期">
          <el-date-picker
            v-model="maintenanceForm.planDate"
            type="datetime"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="预计时长">
          <el-input-number
            v-model="maintenanceForm.estimatedDuration"
            :min="0.5"
            :step="0.5"
          />
          <span class="unit">小时</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="maintenanceDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitMaintenance">确定</el-button>
      </template>
    </el-dialog>

    <!-- 添加设备对话框 -->
    <el-dialog
      v-model="deviceDialogVisible"
      title="添加门禁设备"
      width="500px"
    >
      <el-form
        ref="deviceFormRef"
        :model="deviceForm"
        :rules="deviceRules"
        label-width="100px"
      >
        <el-form-item label="设备名称" prop="name">
          <el-input v-model="deviceForm.name" placeholder="如: Door-A1-01" />
        </el-form-item>
        <el-form-item label="安装位置" prop="location">
          <el-input v-model="deviceForm.location" placeholder="如: A区主入口" />
        </el-form-item>
        <el-form-item label="设备类型" prop="type">
          <el-select v-model="deviceForm.type" placeholder="请选择设备类型" style="width: 100%">
            <el-option
              v-for="item in deviceTypes"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="IP地址" prop="ipAddress">
          <el-input v-model="deviceForm.ipAddress" placeholder="如: 192.168.1.100" />
        </el-form-item>
        <el-form-item label="制造商" prop="manufacturer">
          <el-input v-model="deviceForm.manufacturer" />
        </el-form-item>
        <el-form-item label="设备型号" prop="model">
          <el-input v-model="deviceForm.model" />
        </el-form-item>
        <el-form-item label="安装日期" prop="installDate">
          <el-date-picker
            v-model="deviceForm.installDate"
            type="date"
            placeholder="选择安装日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="维护周期" prop="maintainPeriod">
          <el-input-number
            v-model="deviceForm.maintainPeriod"
            :min="1"
            :max="365"
          />
          <span class="unit">天</span>
        </el-form-item>
        <el-form-item label="设备说明" prop="description">
          <el-input
            v-model="deviceForm.description"
            type="textarea"
            rows="3"
            placeholder="请输入设备说明"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="deviceDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitDevice">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { Search, Plus, Refresh, UserFilled, Key } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 搜索表单
const searchForm = ref({
  keyword: '',
  area: ''
})

// 区域选项
const areas = [
  { value: 'A', label: 'A区' },
  { value: 'B', label: 'B区' },
  { value: 'C', label: 'C区' },
  { value: 'D', label: 'D区' },
  { value: 'E', label: 'E区' }
]

// 门禁设备数据
const loading = ref(false)
const devices = ref([
  {
    id: 1,
    name: 'Door-A1-01',
    location: 'A区主入口',
    type: '人脸识别',
    status: '正常',
    lastMaintenance: '2024-02-18 10:00:00'
  },
  {
    id: 2,
    name: 'Door-A2-01',
    location: 'A区侧门',
    type: '指纹识别',
    status: '正常',
    lastMaintenance: '2024-02-17 15:30:00'
  },
  {
    id: 3,
    name: 'Door-B1-01',
    location: 'B区主入口',
    type: '人脸识别',
    status: '维护中',
    lastMaintenance: '2024-02-18 09:15:00'
  },
  {
    id: 4,
    name: 'Door-B2-01',
    location: 'B区安全通道',
    type: '刷卡',
    status: '正常',
    lastMaintenance: '2024-02-16 14:20:00'
  },
  {
    id: 5,
    name: 'Door-C1-01',
    location: 'C区主入口',
    type: '人脸识别',
    status: '离线',
    lastMaintenance: '2024-02-15 16:45:00'
  },
  {
    id: 6,
    name: 'Door-D1-01',
    location: 'D区装卸区',
    type: '刷卡',
    status: '正常',
    lastMaintenance: '2024-02-17 11:30:00'
  },
  {
    id: 7,
    name: 'Door-E1-01',
    location: 'E区主入口',
    type: '人脸识别',
    status: '正常',
    lastMaintenance: '2024-02-18 08:00:00'
  },
  {
    id: 8,
    name: 'Door-E2-01',
    location: 'E区紧急出口',
    type: '指纹识别',
    status: '正常',
    lastMaintenance: '2024-02-16 09:20:00'
  }
])

// 通行记录分页配置
const recordsPage = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 通行记录数据
const records = ref([
  {
    id: 1,
    time: '2024-02-18 15:30:00',
    name: '陈明宇',
    department: '仓储管理部',
    device: 'Door-A1-01',
    type: '进入',
    status: '正常'
  },
  {
    id: 2,
    time: '2024-02-18 15:25:00',
    name: '林雨晴',
    department: '物流配送部',
    device: 'Door-B1-01',
    type: '离开',
    status: '正常'
  },
  {
    id: 3,
    time: '2024-02-18 15:20:00',
    name: '张浩然',
    department: '安防监控部',
    device: 'Door-C1-01',
    type: '进入',
    status: '异常'
  },
  {
    id: 4,
    time: '2024-02-18 15:15:00',
    name: '刘婷婷',
    department: '运营管理部',
    device: 'Door-D1-01',
    type: '进入',
    status: '未授权'
  },
  {
    id: 5,
    time: '2024-02-18 15:10:00',
    name: '王志强',
    department: '仓储管理部',
    device: 'Door-A2-01',
    type: '离开',
    status: '正常'
  },
  {
    id: 6,
    time: '2024-02-18 15:05:00',
    name: '杨子萱',
    department: '物流配送部',
    device: 'Door-E1-01',
    type: '进入',
    status: '正常'
  },
  {
    id: 7,
    time: '2024-02-18 15:00:00',
    name: '黄伟峰',
    department: '安防监控部',
    device: 'Door-B2-01',
    type: '离开',
    status: '正常'
  },
  {
    id: 8,
    time: '2024-02-18 14:55:00',
    name: '赵雪莹',
    department: '运营管理部',
    device: 'Door-E2-01',
    type: '进入',
    status: '异常'
  },
  {
    id: 9,
    time: '2024-02-18 14:50:00',
    name: '孙建国',
    department: '设备维护部',
    device: 'Door-C1-01',
    type: '进入',
    status: '正常'
  },
  {
    id: 10,
    time: '2024-02-18 14:45:00',
    name: '吴思思',
    department: '质量控制部',
    device: 'Door-A1-01',
    type: '离开',
    status: '正常'
  },
  {
    id: 11,
    time: '2024-02-18 14:40:00',
    name: '郭文杰',
    department: '仓储管理部',
    device: 'Door-B2-01',
    type: '进入',
    status: '正常'
  },
  {
    id: 12,
    time: '2024-02-18 14:35:00',
    name: '徐晓峰',
    department: '安防监控部',
    device: 'Door-C1-01',
    type: '离开',
    status: '正常'
  },
  {
    id: 13,
    time: '2024-02-18 14:30:00',
    name: '周雅婷',
    department: '质量控制部',
    device: 'Door-D1-01',
    type: '进入',
    status: '未授权'
  },
  {
    id: 14,
    time: '2024-02-18 14:25:00',
    name: '马建华',
    department: '物流配送部',
    device: 'Door-E1-01',
    type: '进入',
    status: '正常'
  },
  {
    id: 15,
    time: '2024-02-18 14:20:00',
    name: '沈丽娜',
    department: '运营管理部',
    device: 'Door-A2-01',
    type: '离开',
    status: '正常'
  },
  {
    id: 16,
    time: '2024-02-18 14:15:00',
    name: '李志强',
    department: '设备维护部',
    device: 'Door-B1-01',
    type: '进入',
    status: '异常'
  },
  {
    id: 17,
    time: '2024-02-18 14:10:00',
    name: '张美玲',
    department: '仓储管理部',
    device: 'Door-C1-01',
    type: '进入',
    status: '正常'
  },
  {
    id: 18,
    time: '2024-02-18 14:05:00',
    name: '王浩然',
    department: '安防监控部',
    device: 'Door-D1-01',
    type: '离开',
    status: '正常'
  },
  {
    id: 19,
    time: '2024-02-18 14:00:00',
    name: '刘芳',
    department: '质量控制部',
    device: 'Door-E2-01',
    type: '进入',
    status: '正常'
  },
  {
    id: 20,
    time: '2024-02-18 13:55:00',
    name: '杨光',
    department: '物流配送部',
    device: 'Door-A1-01',
    type: '进入',
    status: '正常'
  }
])

// 过滤后的通行记录
const filteredRecords = computed(() => {
  let result = [...records.value]
  
  // 关键词搜索
  if (searchForm.value.keyword) {
    const keyword = searchForm.value.keyword.toLowerCase()
    result = result.filter(record => 
      record.name.toLowerCase().includes(keyword) ||
      record.device.toLowerCase().includes(keyword)
    )
  }
  
  // 区域筛选
  if (searchForm.value.area) {
    result = result.filter(record => 
      record.device.includes(`Door-${searchForm.value.area}`)
    )
  }
  
  return result
})

// 当前页的记录
const currentPageRecords = computed(() => {
  const start = (recordsPage.value.currentPage - 1) * recordsPage.value.pageSize
  const end = start + recordsPage.value.pageSize
  return filteredRecords.value.slice(start, end)
})

// 更新总数
watch(filteredRecords, (newRecords) => {
  recordsPage.value.total = newRecords.length
})

// 处理页码改变
const handleCurrentChange = (page) => {
  recordsPage.value.currentPage = page
}

// 处理每页条数改变
const handleSizeChange = (size) => {
  recordsPage.value.pageSize = size
  recordsPage.value.currentPage = 1
}

// 初始化总数
onMounted(() => {
  recordsPage.value.total = records.value.length
})

// 更新部门选项
const departments = [
  '仓储管理部',
  '物流配送部',
  '安防监控部',
  '运营管理部',
  '设备维护部',
  '质量控制部'
]

// 更新人员表单
const personForm = ref({
  name: '',
  employeeId: '',
  department: '',
  areas: [],
  validDate: [],
  phone: '',  // 添加手机号
  position: '' // 添加职位
})

// 更新表单规则
const personRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  employeeId: [{ required: true, message: '请输入工号', trigger: 'blur' }],
  department: [{ required: true, message: '请选择部门', trigger: 'change' }],
  areas: [{ required: true, message: '请选择权限区域', trigger: 'change' }],
  validDate: [{ required: true, message: '请选择有效期', trigger: 'change' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  position: [{ required: true, message: '请输入职位', trigger: 'blur' }]
}

// 设备表单相关
const deviceDialogVisible = ref(false)
const deviceFormRef = ref(null)
const deviceForm = ref({
  name: '',
  location: '',
  type: '',
  ipAddress: '',
  manufacturer: '',
  model: '',
  installDate: '',
  maintainPeriod: 30,
  description: ''
})

// 设备类型选项
const deviceTypes = [
  { value: '人脸识别', label: '人脸识别' },
  { value: '指纹识别', label: '指纹识别' },
  { value: '刷卡', label: '刷卡' },
  { value: '密码', label: '密码' }
]

// 设备表单验证规则
const deviceRules = {
  name: [
    { required: true, message: '请输入设备名称', trigger: 'blur' },
    { pattern: /^Door-[A-Z]\d-\d{2}$/, message: '设备名称格式不正确', trigger: 'blur' }
  ],
  location: [{ required: true, message: '请输入安装位置', trigger: 'blur' }],
  type: [{ required: true, message: '请选择设备类型', trigger: 'change' }],
  ipAddress: [
    { required: true, message: '请输入IP地址', trigger: 'blur' },
    { pattern: /^(\d{1,3}\.){3}\d{1,3}$/, message: 'IP地址格式不正确', trigger: 'blur' }
  ],
  installDate: [{ required: true, message: '请选择安装日期', trigger: 'change' }]
}

// 远程控制对话框
const controlDialogVisible = ref(false)
const currentDevice = ref(null)
const controlOptions = ref([
  { 
    label: '远程开门',
    value: 'open',
    description: '授权人员临时进出'
  },
  { 
    label: '远程关门',
    value: 'close',
    description: '确保门禁安全关闭'
  },
  { 
    label: '紧急解锁',
    value: 'emergency',
    description: '紧急情况下快速解锁'
  },
  { 
    label: '设备重启',
    value: 'restart',
    description: '解决设备异常问题'
  }
])

// 查看通行记录
const recordsDialogVisible = ref(false)
const deviceRecords = ref([])

// 设备维护
const maintenanceDialogVisible = ref(false)
const maintenanceForm = ref({
  deviceId: '',
  type: '',
  description: '',
  maintainer: '',
  planDate: '',
  estimatedDuration: 1
})

// 状态样式
const getDeviceStatusType = (status) => {
  const map = {
    '正常': 'success',
    '离线': 'danger',
    '维护中': 'warning'
  }
  return map[status]
}

const getAccessStatusType = (status) => {
  const map = {
    '正常': 'success',
    '异常': 'danger',
    '未授权': 'warning'
  }
  return map[status]
}

// 添加人员相关
const personDialogVisible = ref(false)
const personFormRef = ref(null)

// 处理函数
const handleAddPerson = () => {
  personDialogVisible.value = true
}

const handleAddDevice = () => {
  deviceForm.value = {
    name: '',
    location: '',
    type: '',
    ipAddress: '',
    manufacturer: '',
    model: '',
    installDate: '',
    maintainPeriod: 30,
    description: ''
  }
  deviceDialogVisible.value = true
}

const handleRefresh = async () => {
  try {
    loading.value = true
    // 模拟刷新数据
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('数据已更新')
  } finally {
    loading.value = false
  }
}

const handleControl = (row) => {
  currentDevice.value = row
  controlDialogVisible.value = true
}

const handleViewRecords = async (row) => {
  try {
    loading.value = true
    // 模拟获取指定设备的通行记录
    deviceRecords.value = records.value.filter(record => record.device === row.name)
    recordsDialogVisible.value = true
  } finally {
    loading.value = false
  }
}

const handleMaintenance = (row) => {
  maintenanceForm.value = {
    deviceId: row.id,
    type: '常规维护',
    description: '',
    maintainer: '',
    planDate: '',
    estimatedDuration: 1
  }
  maintenanceDialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除设备 ${row.name} 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    devices.value = devices.value.filter(device => device.id !== row.id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const submitPerson = async () => {
  if (!personFormRef.value) return
  await personFormRef.value.validate((valid) => {
    if (valid) {
      // 实现提交人员信息的逻辑
      ElMessage.success('添加成功')
      personDialogVisible.value = false
    }
  })
}

// 执行控制命令
const executeControl = async (command) => {
  try {
    loading.value = true
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success(`成功执行${command.label}命令`)
    controlDialogVisible.value = false
  } catch (error) {
    ElMessage.error('操作失败')
  } finally {
    loading.value = false
  }
}

const submitMaintenance = () => {
  // 实现提交设备维护信息的逻辑
  ElMessage.success('维护计划已提交')
  maintenanceDialogVisible.value = false
}

// 控制命令图标映射
const getControlIcon = (value) => {
  const iconMap = {
    'open': 'Unlock',
    'close': 'Lock',
    'emergency': 'Warning',
    'restart': 'RefreshRight'
  }
  return iconMap[value]
}

// 获取控制选项描述
const getControlDescription = (value) => {
  return controlOptions.value.find(option => option.value === value)?.description
}

// 提交设备表单
const submitDevice = async () => {
  if (!deviceFormRef.value) return
  
  await deviceFormRef.value.validate((valid) => {
    if (valid) {
      // 添加新设备
      const newDevice = {
        id: devices.value.length + 1,
        ...deviceForm.value,
        status: '正常',
        lastMaintenance: new Date().toISOString().split('T')[0]
      }
      
      devices.value.push(newDevice)
      ElMessage.success('添加成功')
      deviceDialogVisible.value = false
    }
  })
}

// 过滤后的设备列表
const filteredDevices = computed(() => {
  let result = [...devices.value]
  
  // 关键词搜索
  if (searchForm.value.keyword) {
    const keyword = searchForm.value.keyword.toLowerCase()
    result = result.filter(device => 
      device.name.toLowerCase().includes(keyword) ||
      device.location.toLowerCase().includes(keyword)
    )
  }
  
  // 区域筛选
  if (searchForm.value.area) {
    result = result.filter(device => 
      device.location.startsWith(`${searchForm.value.area}区`)
    )
  }
  
  return result
})

// 监听搜索条件变化
watch([() => searchForm.value.keyword, () => searchForm.value.area], () => {
  // 重置分页到第一页
  recordsPage.value.currentPage = 1
})
</script>

<style scoped>
.access {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.toolbar-card {
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-area {
  display: flex;
  gap: 15px;
}

.search-input {
  width: 300px;
}

.area-select {
  width: 180px;
}

.action-group {
  display: flex;
  gap: 12px;
}

.device-card,
.records-card {
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header .title {
  font-size: 16px;
  font-weight: bold;
}

.header-actions {
  display: flex;
  gap: 12px;
}

:deep(.el-card__body) {
  padding: 15px 20px;
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

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 0 0;
}

.control-dialog {
  :deep(.el-dialog__body) {
    padding: 0;
  }
}

.device-info {
  background-color: #f5f7fa;
  padding: 20px;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  gap: 40px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.info-item .label {
  color: #909399;
}

.info-item .value {
  font-weight: 500;
}

.control-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  padding: 30px;
}

.control-card {
  height: 140px;
  background-color: var(--el-color-primary-light-9);
  border: 1px solid var(--el-color-primary-light-7);
  border-radius: 8px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.control-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: var(--el-color-primary);
}

.control-card.emergency {
  background-color: var(--el-color-danger-light-9);
  border-color: var(--el-color-danger-light-7);
}

.control-card.emergency:hover {
  border-color: var(--el-color-danger);
}

.control-icon {
  font-size: 36px;
  color: var(--el-color-primary);
  background-color: var(--el-color-primary-light-8);
  padding: 12px;
  border-radius: 50%;
}

.emergency .control-icon {
  color: var(--el-color-danger);
  background-color: var(--el-color-danger-light-8);
}

.control-label {
  font-size: 16px;
  font-weight: 500;
}

.control-desc {
  font-size: 13px;
  color: #909399;
  text-align: center;
}

.control-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transform: translateX(-100%);
  transition: 0.5s;
}

.control-card:hover::after {
  transform: translateX(100%);
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-pagination) {
  padding: 0;
  margin: 0;
}

:deep(.el-pagination .el-select .el-input) {
  width: 100px;
}
</style> 