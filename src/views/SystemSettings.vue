<template>
  <div class="settings">
    <!-- 系统管理选项卡 -->
    <el-tabs v-model="activeTab" class="settings-tabs">
      <!-- 用户管理 -->
      <el-tab-pane label="用户管理" name="users">
        <el-card class="tab-card">
          <template #header>
            <div class="card-header">
              <div class="search-area">
                <el-input
                  v-model="userSearch"
                  placeholder="搜索用户"
                  class="search-input"
                  clearable
                >
                  <template #prefix>
                    <el-icon><Search /></el-icon>
                  </template>
                </el-input>
              </div>
              <el-button type="primary" @click="handleAddUser">
                <el-icon><Plus /></el-icon>添加用户
              </el-button>
            </div>
          </template>
          
          <el-table :data="filteredUsers" border>
            <el-table-column prop="username" label="用户名" width="120" />
            <el-table-column prop="realName" label="姓名" width="100" />
            <el-table-column prop="role" label="角色" width="120">
              <template #default="{ row }">
                <el-tag :type="getRoleType(row.role)">{{ row.role }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="department" label="部门" width="120" />
            <el-table-column prop="phone" label="手机号" width="120" />
            <el-table-column prop="email" label="邮箱" min-width="180" />
            <el-table-column prop="hireDate" label="入职日期" width="120" />
            <el-table-column prop="lastLogin" label="最后登录时间" width="160" />
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-switch
                  v-model="row.status"
                  :active-value="1"
                  :inactive-value="0"
                  @change="handleUserStatusChange(row)"
                />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link @click="handleEditUser(row)">
                  编辑
                </el-button>
                <el-button 
                  type="danger" 
                  link 
                  @click="handleDeleteUser(row)"
                  :disabled="row.role === '超级管理员'"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <!-- 角色权限 -->
      <el-tab-pane label="角色权限" name="roles">
        <div class="role-management">
          <!-- 角色列表 -->
          <div class="role-list">
            <div class="role-header">
              <h3>角色列表</h3>
              <el-button type="primary" @click="handleAddRole">
                <el-icon><Plus /></el-icon>新增角色
              </el-button>
            </div>
            <el-table :data="roles" style="width: 100%">
              <el-table-column prop="name" label="角色名称" />
              <el-table-column prop="description" label="描述" />
              <el-table-column prop="users" label="用户数" width="100" />
              <el-table-column label="操作" width="200">
                <template #default="{ row }">
                  <el-button type="primary" link @click="handleEditRole(row)">
                    编辑
                  </el-button>
                  <el-button type="primary" link @click="handleConfigPermissions(row)">
                    配置权限
                  </el-button>
                  <el-button 
                    type="danger" 
                    link 
                    @click="handleDeleteRole(row)"
                    :disabled="row.isSystem"
                  >
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </el-tab-pane>

      <!-- 系统配置 -->
      <el-tab-pane label="系统配置" name="config">
        <el-card class="tab-card">
          <el-form :model="systemConfig" label-width="120px">
            <el-form-item label="系统名称">
              <el-input v-model="systemConfig.name" />
            </el-form-item>
            <el-form-item label="登录超时时间">
              <el-input-number 
                v-model="systemConfig.loginTimeout" 
                :min="1"
                :max="24"
              />
              <span class="unit">小时</span>
            </el-form-item>
            <el-form-item label="密码有效期">
              <el-input-number 
                v-model="systemConfig.passwordExpiry" 
                :min="30"
                :max="180"
              />
              <span class="unit">天</span>
            </el-form-item>
            <el-form-item label="数据备份">
              <el-switch v-model="systemConfig.autoBackup" />
              <span class="desc">每天凌晨自动备份数据</span>
            </el-form-item>
            <el-form-item label="操作日志">
              <el-switch v-model="systemConfig.operationLog" />
              <span class="desc">记录用户操作日志</span>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveSystemConfig">
                保存配置
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <!-- 用户表单对话框 -->
    <el-dialog
      v-model="userDialogVisible"
      :title="userForm.id ? '编辑用户' : '添加用户'"
      width="500px"
    >
      <el-form
        ref="userFormRef"
        :model="userForm"
        :rules="userRules"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="姓名" prop="realName">
          <el-input v-model="userForm.realName" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="userForm.role" placeholder="请选择角色" style="width: 100%">
            <el-option
              v-for="role in roles"
              :key="role.name"
              :label="role.name"
              :value="role.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="部门" prop="department">
          <el-select v-model="userForm.department" placeholder="请选择部门" style="width: 100%">
            <el-option
              v-for="dept in departments"
              :key="dept"
              :label="dept"
              :value="dept"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="userForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="入职日期" prop="hireDate">
          <el-date-picker
            v-model="userForm.hireDate"
            type="date"
            placeholder="请选择入职日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!userForm.id">
          <el-input
            v-model="userForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="userDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitUser">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 角色编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增角色' : '编辑角色'"
      width="500px"
    >
      <el-form ref="roleForm" :model="roleForm" :rules="rules" label-width="80px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="roleForm.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="roleForm.description"
            type="textarea"
            placeholder="请输入角色描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmitRole">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 权限配置对话框 -->
    <el-dialog
      v-model="permissionDialogVisible"
      title="配置权限"
      width="600px"
    >
      <el-tree
        ref="rolePermissionTree"
        :data="permissionList"
        show-checkbox
        node-key="id"
        :default-checked-keys="selectedPermissions"
        :props="{ 
          label: 'name',
          children: 'children'
        }"
      />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="permissionDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveRolePermissions">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Search, Plus, Setting } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 当前选中的选项卡
const activeTab = ref('users')

// 用户管理
const userSearch = ref('')
const users = ref([
  {
    id: 1,
    username: 'admin',
    realName: '王建国',    // 三字
    role: '超级管理员',
    department: '信息技术部',
    lastLogin: '2024-02-18 16:30:00',
    status: 1
  },
  {
    id: 2,
    username: 'liuyang',
    realName: '刘洋',     // 两字
    role: '仓库主管',
    department: '仓储管理部',
    lastLogin: '2024-02-18 15:45:00',
    status: 1
  },
  {
    id: 3,
    username: 'zhangjing',
    realName: '张静怡',    // 三字
    role: '仓库主管',
    department: '物流配送部',
    lastLogin: '2024-02-18 15:20:00',
    status: 1
  },
  {
    id: 4,
    username: 'chenming',
    realName: '陈明',     // 两字
    role: '普通员工',
    department: '仓储管理部',
    lastLogin: '2024-02-18 14:55:00',
    status: 1
  },
  {
    id: 5,
    username: 'wangxin',
    realName: '王新宇',    // 三字
    role: '普通员工',
    department: '质量控制部',
    lastLogin: '2024-02-18 14:30:00',
    status: 1
  },
  {
    id: 6,
    username: 'lihong',
    realName: '李红',     // 两字
    role: '普通员工',
    department: '物流配送部',
    lastLogin: '2024-02-18 14:15:00',
    status: 0
  },
  {
    id: 7,
    username: 'zhaojun',
    realName: '赵军伟',    // 三字
    role: '仓库主管',
    department: '设备维护部',
    lastLogin: '2024-02-18 13:50:00',
    status: 1
  },
  {
    id: 8,
    username: 'sunwei',
    realName: '孙伟',     // 两字
    role: '普通员工',
    department: '仓储管理部',
    lastLogin: '2024-02-18 13:25:00',
    status: 1
  },
  {
    id: 9,
    username: 'yanglin',
    realName: '杨林峰',    // 三字
    role: '普通员工',
    department: '物流配送部',
    lastLogin: '2024-02-18 13:10:00',
    status: 1
  },
  {
    id: 10,
    username: 'huangxiao',
    realName: '黄晓',     // 两字
    role: '普通员工',
    department: '质量控制部',
    lastLogin: '2024-02-18 12:45:00',
    status: 1
  },
  {
    id: 11,
    username: 'zhangwei',
    realName: '张维佳',    // 三字
    role: '普通员工',
    department: '设备维护部',
    lastLogin: '2024-02-18 12:20:00',
    status: 1
  },
  {
    id: 12,
    username: 'wangli',
    realName: '王丽',     // 两字
    role: '普通员工',
    department: '仓储管理部',
    lastLogin: '2024-02-18 11:55:00',
    status: 0
  }
])

// 角色管理
const roles = ref([
  {
    id: 1,
    name: '超级管理员',
    description: '系统最高权限管理员',
    users: 1,
    isSystem: true,
    permissions: ['all']
  },
  {
    id: 2,
    name: '仓库管理员',
    description: '负责仓库日常管理',
    users: 3,
    permissions: ['inventory', 'inbound', 'outbound']
  }
])

// 系统配置
const systemConfig = ref({
  name: '智能仓储管理系统',
  loginTimeout: 8,
  passwordExpiry: 90,
  autoBackup: true,
  operationLog: true
})

// 用户表单
const userDialogVisible = ref(false)
const userFormRef = ref(null)
const userForm = ref({
  username: '',
  realName: '',
  role: '',
  department: '',
  password: '',
  email: '',
  phone: '',
  hireDate: ''
})

// 用户表单验证规则
const userRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  realName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
  department: [{ required: true, message: '请选择部门', trigger: 'change' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  hireDate: [{ required: true, message: '请选择入职日期', trigger: 'change' }]
}

// 部门列表
const departments = [
  '信息技术部',
  '仓储管理部',
  '物流配送部',
  '质量控制部',
  '设备维护部'
]

// 更新用户数据，添加更真实的联系方式
users.value = users.value.map(user => {
  // 生成更真实的手机号，使用不同的号段
  const phonePrefix = ['135', '138', '139', '150', '151', '152', '158', '159', '186', '188']
  const randomPrefix = phonePrefix[Math.floor(Math.random() * phonePrefix.length)]
  const randomNumber = Math.floor(Math.random() * 100000000).toString().padStart(8, '0')
  
  // 生成更真实的邮箱，使用不同的邮箱服务商
  const emailDomains = ['qq.com', '163.com', 'gmail.com', 'outlook.com', 'company.com']
  const randomDomain = emailDomains[Math.floor(Math.random() * emailDomains.length)]
  
  // 生成随机的入职日期（2022-2024年间）
  const startDate = new Date('2022-01-01').getTime()
  const endDate = new Date('2024-01-01').getTime()
  const randomDate = new Date(startDate + Math.random() * (endDate - startDate))
  const hireDate = randomDate.toISOString().split('T')[0]

  return {
    ...user,
    phone: randomPrefix + randomNumber,
    email: user.role === '超级管理员' ? 
      'admin@company.com' : // 管理员使用公司邮箱
      `${user.username}${Math.floor(Math.random() * 1000)}@${randomDomain}`, // 普通用户使用随机邮箱
    hireDate
  }
})

// 过滤用户列表
const filteredUsers = computed(() => {
  if (!userSearch.value) return users.value
  const keyword = userSearch.value.toLowerCase()
  return users.value.filter(user => 
    user.username.toLowerCase().includes(keyword) ||
    user.realName.toLowerCase().includes(keyword) ||
    user.department.toLowerCase().includes(keyword)
  )
})

// 获取角色类型
const getRoleType = (role) => {
  const typeMap = {
    '超级管理员': 'danger',
    '仓库主管': 'warning',
    '普通员工': ''
  }
  return typeMap[role] || ''
}

// 处理用户状态变更
const handleUserStatusChange = (user) => {
  ElMessage.success(`${user.username} 状态已${user.status ? '启用' : '禁用'}`)
}

// 添加用户
const handleAddUser = () => {
  userForm.value = {
    username: '',
    realName: '',
    role: '',
    department: '',
    password: '',
    email: '',
    phone: '',
    hireDate: ''
  }
  userDialogVisible.value = true
}

// 编辑用户
const handleEditUser = (user) => {
  userForm.value = { ...user }
  userDialogVisible.value = true
}

// 删除用户
const handleDeleteUser = (user) => {
  ElMessageBox.confirm(
    `确定要删除用户 ${user.username} 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    users.value = users.value.filter(item => item.id !== user.id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

// 提交用户表单
const submitUser = async () => {
  if (!userFormRef.value) return
  
  await userFormRef.value.validate((valid) => {
    if (valid) {
      if (userForm.value.id) {
        // 更新用户
        const index = users.value.findIndex(user => user.id === userForm.value.id)
        users.value[index] = { 
          ...users.value[index],
          ...userForm.value,
          lastLogin: users.value[index].lastLogin
        }
        ElMessage.success('更新成功')
      } else {
        // 添加用户
        const newUser = {
          id: users.value.length + 1,
          ...userForm.value,
          lastLogin: '-',
          status: 1
        }
        users.value.push(newUser)
        ElMessage.success('添加成功')
      }
      userDialogVisible.value = false
    }
  })
}

// 保存系统配置
const saveSystemConfig = () => {
  ElMessage.success('系统配置已保存')
}

// 角色编辑对话框
const dialogVisible = ref(false)
const dialogType = ref('add')
const currentRole = ref(null)

// 表单数据
const roleForm = ref({
  name: '',
  description: ''
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入角色描述', trigger: 'blur' },
    { max: 200, message: '最多200个字符', trigger: 'blur' }
  ]
}

// 新增角色
const handleAddRole = () => {
  dialogType.value = 'add'
  roleForm.value = {
    name: '',
    description: ''
  }
  dialogVisible.value = true
}

// 编辑角色
const handleEditRole = (row) => {
  dialogType.value = 'edit'
  currentRole.value = row
  roleForm.value = {
    name: row.name,
    description: row.description
  }
  dialogVisible.value = true
}

// 权限配置对话框
const permissionDialogVisible = ref(false)

// 修改配置权限的处理函数
const handleConfigPermissions = (row) => {
  currentRole.value = row
  // 如果是超级管理员，默认选中所有权限
  if (row.isSystem) {
    selectedPermissions.value = getAllPermissionKeys(permissionList.value)
  } else {
    selectedPermissions.value = row.permissions || []
  }
  permissionDialogVisible.value = true
}

// 获取所有权限的key
const getAllPermissionKeys = (permissions) => {
  const keys = []
  const traverse = (items) => {
    items.forEach(item => {
      keys.push(item.id)
      if (item.children) {
        traverse(item.children)
      }
    })
  }
  traverse(permissions)
  return keys
}

// 修改保存角色权限的处理函数
const handleSaveRolePermissions = () => {
  if (!currentRole.value || !rolePermissionTree.value) return
  
  // 获取选中的节点和半选中的节点
  const checkedKeys = rolePermissionTree.value.getCheckedKeys()
  const halfCheckedKeys = rolePermissionTree.value.getHalfCheckedKeys()
  const allSelectedKeys = [...checkedKeys, ...halfCheckedKeys]
  
  const role = roles.value.find(item => item.id === currentRole.value.id)
  if (role) {
    role.permissions = allSelectedKeys
    ElMessage({
      type: 'success',
      message: '权限配置已保存',
      duration: 2000
    })
  }
  permissionDialogVisible.value = false
}

// 权限树形数据
const permissionList = ref([
  {
    id: 'system',
    name: '系统管理',
    children: [
      { id: 'user', name: '用户管理' },
      { id: 'role', name: '角色管理' },
      { id: 'permission', name: '权限管理' }
    ]
  },
  {
    id: 'warehouse',
    name: '仓储管理',
    children: [
      { id: 'inventory', name: '库存管理' },
      { id: 'inbound', name: '入库管理' },
      { id: 'outbound', name: '出库管理' }
    ]
  },
  {
    id: 'report',
    name: '报表管理',
    children: [
      { id: 'inventory-report', name: '库存报表' },
      { id: 'operation-report', name: '操作报表' }
    ]
  }
])

// 当前选中的权限
const selectedPermissions = ref([])
const defaultCheckedKeys = ref([])

const rolePermissionTree = ref(null)
const permissionTree = ref(null)
</script>

<style scoped>
.settings {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.settings-tabs {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
}

.tab-card {
  margin-top: 20px;
}

.card-header {
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

.unit {
  margin-left: 10px;
  color: #909399;
}

.desc {
  margin-left: 10px;
  color: #909399;
  font-size: 14px;
}

:deep(.el-tabs__nav-wrap::after) {
  height: 1px;
}

:deep(.el-form-item) {
  margin-bottom: 25px;
}

.role-management {
  padding: 20px;
}

.role-list {
  margin-bottom: 20px;
}

.role-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.role-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.permission-tree {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

:deep(.el-tree) {
  background: transparent;
}

:deep(.el-tree-node__content) {
  height: 40px;
}

:deep(.el-tree-node__content:hover) {
  background: rgba(64, 158, 255, 0.1);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 添加权限树的样式 */
:deep(.el-tree) {
  margin: 10px 0;
}

:deep(.el-tree-node__content) {
  height: 36px;
}

:deep(.el-tree-node__label) {
  font-size: 14px;
}

:deep(.el-tree-node.is-current > .el-tree-node__content) {
  background-color: #ecf5ff;
}

/* 权限配置对话框样式 */
.permission-dialog {
  .el-dialog__body {
    padding: 20px;
    max-height: 500px;
    overflow-y: auto;
  }
}
</style> 