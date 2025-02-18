<template>
  <el-container class="layout-container">
    <el-aside width="220px" class="aside">
      <router-link to="/welcome" class="logo-link">
        <div class="logo">
          <img src="../assets/logo.svg" alt="logo" />
          <div class="logo-text">
            <h1>智能仓储</h1>
            <span class="subtitle">IWMS</span>
          </div>
        </div>
      </router-link>
      <el-menu
        :default-active="route.path"
        class="el-menu-vertical"
        router
        background-color="#304156"
        text-color="#fff"
        active-text-color="#409EFF"
      >
        <el-menu-item index="/welcome">
          <el-icon><HomeFilled /></el-icon>
          <span>欢迎</span>
        </el-menu-item>
        <el-menu-item index="/dashboard">
          <el-icon><DataLine /></el-icon>
          <span>系统概览</span>
        </el-menu-item>
        <el-menu-item index="/inventory">
          <el-icon><Box /></el-icon>
          <span>库存管理</span>
        </el-menu-item>
        <el-menu-item index="/inbound">
          <el-icon><Download /></el-icon>
          <span>入库管理</span>
        </el-menu-item>
        <el-menu-item index="/outbound">
          <el-icon><Upload /></el-icon>
          <span>出库管理</span>
        </el-menu-item>
        <el-menu-item index="/monitoring">
          <el-icon><VideoCamera /></el-icon>
          <span>监控系统</span>
        </el-menu-item>
        <el-menu-item index="/access">
          <el-icon><Key /></el-icon>
          <span>门禁管理</span>
        </el-menu-item>
        <el-menu-item index="/settings">
          <el-icon><Setting /></el-icon>
          <span>系统管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    
    <el-container>
      <el-header class="header">
        <div class="header-left">
          <el-icon class="fold-btn" @click="isCollapse = !isCollapse">
            <Fold v-if="!isCollapse"/>
            <Expand v-else/>
          </el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ route.meta.title }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-button type="primary" link>
            <el-icon><Bell /></el-icon>
            <el-badge :value="3" class="notice-badge" />
          </el-button>
          <el-dropdown>
            <span class="user-info">
              <el-avatar :size="32" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
              <span class="username">管理员</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>
                  <el-icon><User /></el-icon>个人信息
                </el-dropdown-item>
                <el-dropdown-item>
                  <el-icon><Setting /></el-icon>系统设置
                </el-dropdown-item>
                <el-dropdown-item divided>
                  <el-icon><SwitchButton /></el-icon>退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <el-main class="main">
        <router-view v-slot="{ Component }">
          <keep-alive>
            <component :is="Component" />
          </keep-alive>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, provide } from 'vue'
import { useRoute } from 'vue-router'
import { 
  DataLine, Box, Download, Upload, VideoCamera, ArrowDown,
  Fold, Expand, Bell, User, Setting, SwitchButton, HomeFilled, Key
} from '@element-plus/icons-vue'

const route = useRoute()
const isCollapse = ref(false)

// 提供一个刷新方法给子组件
const refreshView = () => {
  // 触发子组件的刷新
  if (route.name === 'Dashboard') {
    // 触发 Dashboard 的刷新
  } else if (route.name === 'Inventory') {
    // 触发 Inventory 的刷新
  }
  // ... 其他组件的刷新逻辑
}

provide('refreshView', refreshView)
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.aside {
  background-color: #304156;
  transition: width 0.3s;
  overflow: hidden;
}

.logo-link {
  text-decoration: none;
  display: block;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  background-color: #263445;
  transition: all 0.3s;
}

.logo:hover {
  background-color: #1f2d3d;
}

.logo img {
  width: 36px;
  height: 36px;
  margin-right: 12px;
  transition: transform 0.3s;
}

.logo:hover img {
  transform: rotate(360deg);
}

.logo-text {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.logo h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  line-height: 1.2;
}

.logo .subtitle {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

.el-menu {
  border-right: none;
}

.el-menu-item {
  height: 50px;
  line-height: 50px;
}

.header {
  background-color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);
  height: 60px !important;
}

.header-left {
  display: flex;
  align-items: center;
}

.fold-btn {
  font-size: 20px;
  margin-right: 20px;
  cursor: pointer;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.username {
  margin: 0 8px;
  font-size: 14px;
}

.notice-badge {
  margin-top: -8px;
}

.main {
  background-color: #f0f2f5;
  padding: 20px;
}

:deep(.el-menu-item.is-active) {
  background-color: #263445 !important;
}

:deep(.el-menu-item:hover) {
  background-color: #263445 !important;
}
</style> 