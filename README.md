# 🏢 中台原型项目 (Middle-Platform-Pages)

> 一个用于企业中台系统的交互原型项目，支持 GitHub Pages 直接预览。

---

## 📋 项目简介

这是一个基于 Vue 3 + Element Plus 技术栈的中台系统交互原型，包含采购单管理、采购计划、发货计划、备货计划等核心业务模块。

**当前功能**：
- ✅ 采购单管理（含货权调整弹窗优化）
- ✅ 采购计划
- ✅ 发货计划
- ✅ 备货计划
- ✅ 发货单
- ✅ 会议纪要归档目录

**技术栈**：
- 前端框架：Vue 3（全局构建版本）
- UI 组件：Element Plus（全局构建版本）
- 部署方式：GitHub Pages（纯静态）

---

## 📂 目录结构

```
Middle-Platform-Pages/
├── pages/                              # 📁 各页面模块
│   ├── purchase-orders/                # 采购单页面
│   │   ├── index.html                   # 页面结构
│   │   ├── app.js                       # 页面逻辑
│   │   ├── ownership.js                 # 货权弹窗逻辑
│   │   ├── ownership.css                # 货权弹窗样式
│   │   └── styles.css                   # 页面样式
│   ├── purchase-plan/                  # 采购计划页面
│   ├── shipment-plan/                  # 发货计划页面
│   └── stock-plan/                     # 备货计划页面
│
├── vendor/                             # 📁 共享依赖（所有页面共用）
│   ├── vue.global.prod.js              # Vue 3
│   ├── element-plus.js                 # Element Plus
│   └── element-plus.css                # Element Plus 样式
│
├── docs/                               # 📁 需求文档 & 项目资料
│   ├── meeting-notes/                  # 会议纪要归档
│   │   ├── README.md                   # 命名规范 + 模板说明
│   │   └── 2026-08-08-示例-发货单功能确认.md  # 填写示例
│   ├── CHANGELOG.md                    # 📌 项目记忆文档（所有变更记录）
│   └── 货权调整弹窗批量SKU调整-PRD.md
│
├── app.js                              # 🏠 主入口（含版本号）
├── index.html                          # 🏠 主入口
├── styles.css                          # 🏠 全局样式
└── .gitignore                          # Git 忽略规则
```

---

## 🔗 访问地址

- **GitHub Pages 预览**：https://heiquanrenheiquanren-lab.github.io/Middle-Platform-Pages
- **GitHub 仓库**：https://github.com/heiquanrenheiquanren-lab/Middle-Platform-Pages

---

## 🚀 快速上手

### 本地预览

1. 用浏览器直接打开 `index.html`
2. 或者启动本地服务器：
   ```bash
   # Python 3
   python3 -m http.server 8000
   
   # 然后访问
   http://localhost:8000
   ```

### 提交到 GitHub

```bash
# 1. 添加修改的文件
git add .

# 2. 提交（写清楚改了什么）
git commit -m "描述你改了什么"

# 3. 推送到 GitHub
git push
```

### 更新版本号（防止缓存问题）

在 [app.js](file:///Users/kafeiyang/中台/Middle-Platform-Pages/app.js#L1) 中修改 `VER` 变量：

```javascript
const VER = '1.5.2';  // 每次上传前递增版本号
```

---

## 📝 新增页面规范

### 添加新页面

1. 在 `pages/` 下创建新文件夹，如 `pages/new-module/`
2. 按以下结构创建文件：
   ```
   pages/new-module/
   ├── index.html
   ├── app.js
   └── styles.css
   ```
3. 在根目录 [app.js](file:///Users/kafeiyang/中台/Middle-Platform-Pages/app.js#L1) 中添加路由：
   ```javascript
   const pages = {
     ...现有页面...,
     newModule: './pages/new-module/index.html?v=${VER}'
   };
   ```
4. 在 `index.html` 的导航菜单中添加新入口

### 添加新弹窗/组件

在对应页面文件夹下创建：
```
pages/purchase-orders/
├── popup-name.js     ← 弹窗逻辑
└── popup-name.css    ← 弹窗样式
```

---

## 🎨 UI 规范

- 设计风格：Element Plus 企业后台风格
- 组件库：Element Plus（el-table、el-dialog、el-form 等）
- 配色方案：沿用 Element Plus 默认主题色

---

## 📚 相关资源

- **PM 工作流**：https://github.com/heiquanrenheiquanren-lab/PM-
- **Element Plus 文档**：https://element-plus.org/zh-CN/
- **Vue 3 文档**：https://cn.vuejs.org/

---

## 📝 更新日志

| 版本 | 日期 | 变更内容 |
|------|------|----------|
| v1.5.2 | 2026-08-08 | 新增 docs/meeting-notes/ 会议纪要归档目录（含命名规范和模板） |
| v1.5.1 | 2026-08-08 | 发货单页面接入 + 统一浅色导航栏 |
| v1.5.0 | 2026-08-07 | 货权调整弹窗改为 Vue 3 + Element Plus 版 |
| v1.4.0 | 2026-08-07 | 修复缓存问题，刷新版本号 |
| v1.3.1 | 2026-08-07 | 初始版本 |

---

*这个 README 帮助你快速识别和管理此项目。如果新增了重要功能，请记得更新此处的说明。*
