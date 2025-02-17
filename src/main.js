import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import { mockXHR } from './mock'
import { store } from './store'

// 配置 axios 默认值
axios.defaults.baseURL = '/'
axios.defaults.timeout = 5000

// 开发环境下使用 Mock
if (process.env.NODE_ENV === 'development') {
  mockXHR()
}

const app = createApp(App)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(ElementPlus)
app.use(router)

// 将 store 添加到全局属性中
app.config.globalProperties.$store = store

app.mount('#app')
