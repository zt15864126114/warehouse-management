<template>
  <div class="inbound">
    <!-- 工具栏 -->
    <el-card class="toolbar-card">
      <div class="toolbar">
        <div class="search-area">
          <el-input
            v-model="searchForm.keyword"
            placeholder="搜索商品名称/订单号"
            class="search-input"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-select
            v-model="searchForm.status"
            placeholder="订单状态"
            clearable
            class="status-select"
          >
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>新增入库
        </el-button>
      </div>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <el-table
        v-loading="loading"
        :data="tableData"
        style="width: 100%"
        size="large"
        border
      >
        <el-table-column prop="orderNo" label="订单编号" width="150" />
        <el-table-column prop="productName" label="商品名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column prop="quantity" label="数量" width="100" align="right" />
        <el-table-column prop="operator" label="操作人" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button 
              v-if="row.status === '待入库'"
              type="success" 
              link 
              @click="handleComplete(row)"
            >
              确认入库
            </el-button>
            <el-button 
              v-if="row.status === '待入库'"
              type="danger" 
              link 
              @click="handleCancel(row)"
            >
              取消入库
            </el-button>
            <el-button
              type="primary"
              link
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              link
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页器 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增入库对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        class="dialog-form"
      >
        <el-form-item label="商品名称" prop="productName">
          <el-input v-model="form.productName" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="商品分类" prop="category">
          <el-select v-model="form.category" placeholder="请选择分类" class="form-select">
            <el-option
              v-for="item in categories"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="数量" prop="quantity">
          <el-input-number v-model="form.quantity" :min="1" class="form-number" />
        </el-form-item>
        <el-form-item label="操作人" prop="operator">
          <el-input v-model="form.operator" placeholder="请输入操作人" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Inbound'
}
</script>

<script setup>
import { ref, onMounted, computed, watch, onActivated } from 'vue'
import { Search, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'
import { store } from '../store'
import { paginateData } from '../utils/pagination'

const loading = ref(false)
const rawData = ref([]) // 添加原始数据存储
const tableData = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const categories = ['电子产品', '服装', '食品', '家具', '其他']
const statusOptions = [
  { label: '待入库', value: '待入库' },
  { label: '已入库', value: '已入库' },
  { label: '已取消', value: '已取消' }
]

const searchForm = ref({
  keyword: '',
  status: ''
})

const dialogVisible = ref(false)
const formRef = ref(null)
const form = ref({
  productName: '',
  category: '',
  quantity: 1,
  operator: '管理员'
})

const rules = {
  productName: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择商品分类', trigger: 'change' }],
  quantity: [{ required: true, message: '请输入数量', trigger: 'blur' }],
  operator: [{ required: true, message: '请输入操作人', trigger: 'blur' }]
}

const dialogType = ref('add') // 添加 dialogType

// 修改对话框标题
const dialogTitle = computed(() => dialogType.value === 'add' ? '新增入库' : '编辑入库')

// 获取入库单列表
const getInboundList = async () => {
  loading.value = true
  try {
    // 先检查 store 中是否有数据
    if (store.state.inbound.list.length > 0) {
      rawData.value = store.state.inbound.list
      getCurrentPageData()
    } else {
      const { data: res } = await axios.get('/api/inbound/list')
      if (res.code === 200) {
        rawData.value = res.data
        store.setInboundData(res.data, res.data.length)
        getCurrentPageData()
      }
    }
  } catch (error) {
    console.error('获取入库单列表失败:', error)
    ElMessage.error('获取入库单列表失败')
  }
  loading.value = false
}

// 状态标签样式
const getStatusType = (status) => {
  const map = {
    '待入库': 'warning',
    '已入库': 'success',
    '已取消': 'info'
  }
  return map[status]
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1 // 重置到第一页
  getCurrentPageData() // 改为直接调用 getCurrentPageData
}

// 新增
const handleAdd = () => {
  dialogType.value = 'add'
  form.value = {
    productName: '',
    category: '',
    quantity: 1,
    operator: '管理员'
  }
  dialogVisible.value = true
}

// 获取当前页数据
const getCurrentPageData = () => {
  if (!rawData.value.length) return
  
  // 先处理搜索过滤
  let filteredData = rawData.value
  if (searchForm.value.keyword || searchForm.value.status) {
    filteredData = rawData.value.filter(item => {
      const matchKeyword = !searchForm.value.keyword || 
        item.productName.toLowerCase().includes(searchForm.value.keyword.toLowerCase()) ||
        item.orderNo.toLowerCase().includes(searchForm.value.keyword.toLowerCase())
      const matchStatus = !searchForm.value.status || 
        item.status === searchForm.value.status
      return matchKeyword && matchStatus
    })
  }

  // 更新总数
  total.value = filteredData.length
  
  // 处理分页
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  tableData.value = filteredData.slice(start, end)
}

// 确认入库
const handleComplete = (row) => {
  ElMessageBox.confirm(
    `确认入库订单"${row.orderNo}"？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      // 更新原始数据
      rawData.value = rawData.value.map(item => 
        item.id === row.id ? { ...item, status: '已入库' } : item
      )
      // 更新 store
      store.setInboundData(rawData.value, rawData.value.length)
      // 重新处理分页
      getCurrentPageData()
      ElMessage.success('入库成功')
    })
    .catch(() => {})
}

// 取消入库
const handleCancel = (row) => {
  ElMessageBox.confirm(
    `确定要取消入库订单"${row.orderNo}"吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      // 更新原始数据
      rawData.value = rawData.value.map(item => 
        item.id === row.id ? { ...item, status: '已取消' } : item
      )
      // 更新 store
      store.setInboundData(rawData.value, rawData.value.length)
      // 重新处理分页
      getCurrentPageData()
      ElMessage.success('取消成功')
    })
    .catch(() => {})
}

// 添加编辑方法
const handleEdit = (row) => {
  dialogType.value = 'edit'
  form.value = {
    id: row.id,
    productName: row.productName,
    category: row.category,
    quantity: row.quantity,
    operator: row.operator
  }
  dialogVisible.value = true
}

// 添加删除方法
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除入库单"${row.orderNo}"吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      // 更新原始数据
      rawData.value = rawData.value.filter(item => item.id !== row.id)
      // 更新 store
      store.setInboundData(rawData.value, rawData.value.length)
      // 重新处理分页
      getCurrentPageData()
      ElMessage.success('删除成功')
    })
    .catch(() => {})
}

// 修改提交方法
const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      if (dialogType.value === 'add') {
        const newItem = {
          id: Date.now(),
          ...form.value,
          orderNo: `IN${Date.now()}`,
          status: '待入库',
          createTime: new Date().toISOString()
        }
        // 更新原始数据
        rawData.value = [newItem, ...rawData.value]
      } else {
        // 编辑模式
        rawData.value = rawData.value.map(item => 
          item.id === form.value.id ? { 
            ...item, 
            ...form.value,
            orderNo: item.orderNo,
            status: item.status,
            createTime: item.createTime
          } : item
        )
      }
      // 更新 store
      store.setInboundData(rawData.value, rawData.value.length)
      // 重新处理分页
      getCurrentPageData()
      ElMessage.success(dialogType.value === 'add' ? '添加成功' : '更新成功')
      dialogVisible.value = false
    }
  })
}

// 分页
const handleSizeChange = (val) => {
  pageSize.value = val
  getCurrentPageData() // 改为直接调用 getCurrentPageData
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  getCurrentPageData() // 改为直接调用 getCurrentPageData
}

// 监听搜索表单变化
watch([() => searchForm.value.keyword, () => searchForm.value.status], () => {
  handleSearch()
})

// 组件被激活时重新获取数据
onActivated(() => {
  getInboundList()
})

// 组件挂载时获取数据
onMounted(() => {
  getInboundList()
})
</script>

<style scoped>
.inbound {
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

.status-select {
  width: 180px;
}

.table-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.dialog-form {
  padding: 20px 0;
}

.form-select {
  width: 100%;
}

.form-number {
  width: 100%;
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

:deep(.el-dialog__body) {
  padding: 0 20px;
}
</style> 