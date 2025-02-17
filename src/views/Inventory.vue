<template>
  <div class="inventory">
    <!-- 工具栏 -->
    <el-card class="toolbar-card">
      <div class="toolbar">
        <div class="search-area">
          <el-input
            v-model="searchForm.keyword"
            placeholder="搜索商品名称/编号"
            class="search-input"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-select
            v-model="searchForm.category"
            placeholder="商品分类"
            clearable
            class="category-select"
          >
            <el-option
              v-for="item in categories"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </div>
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>新增商品
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
        <el-table-column prop="code" label="商品编号" width="150" />
        <el-table-column prop="name" label="商品名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column prop="location" label="库位" width="120" />
        <el-table-column prop="quantity" label="库存量" width="100" align="right" />
        <el-table-column prop="price" label="单价" width="120" align="right">
          <template #default="{ row }">
            ￥{{ row.price.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="danger" link @click="handleDelete(row)">
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

    <!-- 表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增商品' : '编辑商品'"
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
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入商品名称" />
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
        <el-form-item label="库位" prop="location">
          <el-input v-model="form.location" placeholder="请输入库位" />
        </el-form-item>
        <el-form-item label="数量" prop="quantity">
          <el-input-number v-model="form.quantity" :min="0" class="form-number" />
        </el-form-item>
        <el-form-item label="单价" prop="price">
          <el-input-number 
            v-model="form.price" 
            :min="0" 
            :precision="2" 
            :step="0.1"
            class="form-number" 
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" class="form-select">
            <el-option label="正常" value="正常" />
            <el-option label="待检" value="待检" />
            <el-option label="报废" value="报废" />
          </el-select>
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
  name: 'Inventory'
}
</script>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { Search, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'
import { store } from '../store'

const loading = ref(false)
const rawData = ref([])
const tableData = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const categories = ['电子产品', '服装', '食品', '家具', '其他']

const searchForm = ref({
  keyword: '',
  category: ''
})

const dialogVisible = ref(false)
const dialogType = ref('add')
const formRef = ref(null)
const form = ref({
  name: '',
  category: '',
  location: '',
  quantity: 0,
  price: 0,
  status: '正常'
})

const rules = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择商品分类', trigger: 'change' }],
  location: [{ required: true, message: '请输入库位', trigger: 'blur' }],
  quantity: [{ required: true, message: '请输入数量', trigger: 'blur' }],
  price: [{ required: true, message: '请输入单价', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

// 获取库存列表
const getInventoryList = async () => {
  loading.value = true
  try {
    const { data: res } = await axios.get('/api/inventory/list')
    if (res.code === 200) {
      // 保存原始数据
      rawData.value = res.data
      // 更新 store
      store.setInventoryData(res.data, res.data.length)
      // 处理分页
      getCurrentPageData()
    }
  } catch (error) {
    console.error('获取库存列表失败:', error)
    ElMessage.error('获取库存列表失败')
  }
  loading.value = false
}

// 状态标签样式
const getStatusType = (status) => {
  const map = {
    '正常': 'success',
    '待检': 'warning',
    '报废': 'danger'
  }
  return map[status]
}

// 获取当前页数据
const getCurrentPageData = () => {
  if (!rawData.value.length) return
  
  // 先处理搜索过滤
  let filteredData = rawData.value
  if (searchForm.value.keyword || searchForm.value.category) {
    filteredData = rawData.value.filter(item => {
      const matchKeyword = !searchForm.value.keyword || 
        item.name.toLowerCase().includes(searchForm.value.keyword.toLowerCase()) ||
        item.code.toLowerCase().includes(searchForm.value.keyword.toLowerCase())
      const matchCategory = !searchForm.value.category || 
        item.category === searchForm.value.category
      return matchKeyword && matchCategory
    })
  }

  // 更新总数
  total.value = filteredData.length
  
  // 处理分页
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  tableData.value = filteredData.slice(start, end)
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1 // 重置到第一页
  getCurrentPageData()
}

// 新增
const handleAdd = () => {
  dialogType.value = 'add'
  form.value = {
    name: '',
    category: '',
    location: '',
    quantity: 0,
    price: 0,
    status: '正常'
  }
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  dialogType.value = 'edit'
  form.value = { ...row }
  dialogVisible.value = true
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除商品"${row.name}"吗？`,
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
      store.setInventoryData(rawData.value, rawData.value.length)
      // 重新处理分页
      getCurrentPageData()
      ElMessage.success('删除成功')
    })
    .catch(() => {})
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      if (dialogType.value === 'add') {
        const newItem = {
          id: Date.now(),
          ...form.value,
          code: `WH${Math.random().toString().slice(2, 8)}`,
          createTime: new Date().toISOString()
        }
        // 更新原始数据
        rawData.value = [newItem, ...rawData.value]
        // 更新 store
        store.setInventoryData(rawData.value, rawData.value.length)
      } else {
        // 更新原始数据
        rawData.value = rawData.value.map(item => 
          item.id === form.value.id ? { ...item, ...form.value } : item
        )
        // 更新 store
        store.setInventoryData(rawData.value, rawData.value.length)
      }
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
  getCurrentPageData()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  getCurrentPageData()
}

// 组件挂载时初始化数据
onMounted(() => {
  // 如果 store 中有数据，直接使用
  if (store.state.inventory.list.length) {
    rawData.value = store.state.inventory.list
    getCurrentPageData()
  } else {
    getInventoryList()
  }
})

// 监听搜索表单变化
watch([() => searchForm.value.keyword, () => searchForm.value.category], () => {
  handleSearch()
})
</script>

<style scoped>
.inventory {
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

.category-select {
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