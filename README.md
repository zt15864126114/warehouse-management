# 智能仓储管理系统

基于 Vue 3 + Element Plus 的现代化仓储管理系统。

## 在线演示

访问 [https://你的用户名.github.io/warehouse-management/](https://你的用户名.github.io/warehouse-management/)

## 本地运行

1. 克隆项目
```bash
git clone https://github.com/你的用户名/warehouse-management.git
cd warehouse-management
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm run dev
```

4. 构建生产版本
```bash
npm run build
```

## 技术栈

- Vue 3
- Element Plus
- Vue Router
- Axios
- ECharts
- Mock.js

## 主要功能

- 系统概览
- 库存管理
- 入库管理
- 出库管理
- 监控系统

## 开发环境

- Node.js >= 16
- npm >= 7

## 项目结构

```
warehouse-management/
├── public/
├── src/
│   ├── assets/        # 静态资源
│   ├── components/    # 公共组件
│   ├── mock/         # 模拟数据
│   ├── router/       # 路由配置
│   ├── store/        # 状态管理
│   ├── utils/        # 工具函数
│   ├── views/        # 页面组件
│   ├── App.vue       # 根组件
│   └── main.js       # 入口文件
├── .github/          # GitHub Actions 配置
├── .gitignore        # Git 忽略配置
├── index.html        # HTML 模板
├── package.json      # 项目配置
├── README.md         # 项目说明
└── vite.config.js    # Vite 配置
```

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

[MIT](LICENSE)
