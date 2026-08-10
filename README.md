# 🏢 中台原型项目 (Middle-Platform-Pages)

> 一个用于企业中台系统的交互原型项目，支持 GitHub Pages 直接预览。

---

## 📋 项目简介

这是一个基于 Vue 3 + Element Plus 技术栈的中台系统交互原型，包含需求预测、备货计划、采购计划、发货计划、采购单和发货单等核心业务模块。

**当前功能**：
- ✅ 需求预测
- ✅ 备货计划
- ✅ 采购计划
- ✅ 发货计划
- ✅ 采购单管理（含货权调整）
- ✅ 发货单管理（含差异明细、物流加工、装箱详情）
- ✅ 供应商库存（含货权调整）
- ✅ 会议纪要归档

**技术栈**：
- 前端框架：Vue 3（全局构建版本）
- UI 组件：Element Plus（全局构建版本）
- 部署方式：GitHub Pages（纯静态）

---

## 🗺️ 左侧导航结构

```
库存管理
  ├── 团队库存
  ├── 平台仓&海外仓
  └── 供应商库存

计划管理
  ├── 需求预测
  ├── 备货计划
  ├── 采购计划
  └── 发货计划

供应链协同
  ├── 采购单
  └── 发货单
```

- 所有页面统一浅色导航：顶部 global-bar（盾牌 logo） + shell 布局（sidebar 190px + main 1fr）
- 导航分组标题：`.nav-group-title`（带 emoji + 箭头图标）
- 菜单项：`.nav-item`（带 mini 图标 + `data-page-nav="路由key"`）
- 选中态：`.nav-item.active { background:#dff5ff; color:#1890ff; border-right:2px solid #1890ff }`

---

## 📎 项目核心约定

### ⚠️ 版本隔离

| 规则 | 说明 |
|------|------|
| `2.0 MP` 是独立项目 | 与 1.0 `Middle-Platform-Pages` 同级目录，**绝对禁止**将 2.0 MP 改动推送到本仓库 |
| 两个项目独立开发 | 修改其中一个项目时不得触碰另一个项目的文件 |

### 📝 文档同步规则

| 触发条件 | 操作 |
|----------|------|
| 开发中（日常改代码） | 正常改文件，**不改版本号**，不更新文档 |
| 你说「上传 GitHub Pages」 | **版本定型**：递增 VER → 更新 CHANGELOG / BUSINESS_LOGIC / UI_SPEC / README → 统一打包提交 |

### 🔐 Git 推送规则

- **绝对禁止**未经允许执行 `git push`
- 日常改动只做 `git add` + `git commit`，不 push
- 只有你说「推送到 GitHub」「push」等明确指令时才 push

---

## 📚 文档索引

| 文件 | 用途 |
|------|------|
| [CHANGELOG.md](file:///Users/kafeiyang/我的项目（焊捷）/Middle-Platform-Pages/docs/CHANGELOG.md) | 版本变更记录（完整历史，最权威） |
| [BUSINESS_LOGIC.md](file:///Users/kafeiyang/我的项目（焊捷）/Middle-Platform-Pages/docs/BUSINESS_LOGIC.md) | 各页面业务规则 + 状态流转 + 字段定义 |
| [UI_SPEC.md](file:///Users/kafeiyang/我的项目（焊捷）/Middle-Platform-Pages/docs/UI_SPEC.md) | UI/UX 交互规范（弹窗、表格、滚动等强制规则） |
| `docs/发货单产品方案确认文档.md` | 发货单功能版本确认 |
| `docs/发货单待确认问题清单.md` | 发货单待确认事项 |
| `docs/货权调整弹窗批量SKU调整-PRD.md` | 货权调整 PRD |
| `docs/中台项目功能清单.md` | 全项目功能梳理 |
| `docs/meeting-notes/` | 会议纪要归档（含命名规范） |
| `PRD/` | 产品需求文档（供应商库存 / 采购单货权调整） |

---## �� 目录结构

```
Middle-Platform-Pages/
├── pages/                              # 📁 各页面模块
│   ├── demand-forecast/                # 需求预测
│   │   └── index.html
│   ├── stock-plan/                     # 备货计划
│   │   ├── index.html
│   │   ├── app.js
│   │   └── styles.css
│   ├── purchase-plan/                  # 采购计划
│   │   ├── index.html
│   │   ├── app.js
│   │   └── styles.css
│   ├── purchase-orders/                # 采购单
│   │   ├── index.html
│   │   ├── app.js
│   │   ├── styles.css
│   │   ├── ownership.js                # 货权调整弹窗
│   │   └── ownership.css
│   ├── shipment-orders/                # 发货单
│   │   ├── index.html
│   │   ├── app.js
│   │   └── styles.css
│   ├── shipment-plan/                  # 发货计划
│   │   ├── index.html
│   │   ├── app.js
│   │   └── styles.css
│   └── supplier-inventory/             # 供应商库存
│       ├── index.html
│       ├── app.js
│       ├── styles.css
│       ├── ownership.js                # 货权调整弹窗
│       └── ownership.css
│
├── vendor/                             # 📁 共享依赖（所有页面共用）
│   ├── vue.global.prod.js
│   ├── element-plus.js
│   └── element-plus.css
│
├── docs/                               # 📁 文档
│   ├── CHANGELOG.md                    # 版本变更记录（完整历史）
│   ├── BUSINESS_LOGIC.md               # 业务逻辑与规则
│   ├── UI_SPEC.md                      # UI/UX 交互规范
│   ├── 发货单产品方案确认文档.md
│   ├── 发货单待确认问题清单.md
│   ├── 货权调整弹窗批量SKU调整-PRD.md
│   ├── 中台项目功能清单.md
│   └── meeting-notes/                  # 会议纪要
│       ├── README.md
│       └── *.txt / *.md
│
├── PRD/                                # � 产品需求文档
│   ├── 供应商库存货权调整-PRD.md
│   └── 采购单货权调整弹窗-PRD.md
│
├── app.js                              # 🏠 主路由（含版本号 VER）
├── index.html                          # 🏠 主入口
├── styles.css                          # 🏠 全局样式
├── .gitignore
└── README.md
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

**日常开发**（不改变版本号）：
```bash
git add . && git commit -m "描述你改了什么"
# 不 push，等你说「推送到 GitHub」时才 push
```

**版本发布**（你说「上传 GitHub Pages」时）：
```bash
# 递增 app.js 的 VER → 更新 CHANGELOG/BUSINESS_LOGIC/UI_SPEC/README → 提交 → push
git add . && git commit -m "feat: vx.x.x 版本说明" && git push
```

### 更新版本号（防止缓存问题）

在 [app.js](file:///Users/kafeiyang/我的项目（焊捷）/Middle-Platform-Pages/app.js#L1) 中修改 `VER` 变量：

```javascript
   const VER = '1.7.6';  // 每次上传前递增版本号
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
3. 在根目录 [app.js](file:///Users/kafeiyang/我的项目（焊捷）/Middle-Platform-Pages/app.js#L1) 中添加路由：
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
- 完整交互规范（弹窗规则、表格溢出处理、差异数量颜色等）见 [UI_SPEC.md](file:///Users/kafeiyang/我的项目（焊捷）/Middle-Platform-Pages/docs/UI_SPEC.md)

---

## 📚 相关资源

- **PM 工作流**：https://github.com/heiquanrenheiquanren-lab/PM-
- **Element Plus 文档**：https://element-plus.org/zh-CN/
- **Vue 3 文档**：https://cn.vuejs.org/

---

## 📝 更新日志

| 版本 | 日期 | 变更内容 |
|------|------|----------|
| v1.7.6 | 2026-08-09 | 货权调整重构：调入团队手动选择 + 公共库存支持；发货单差异值蓝色可点击下钻 |
| v1.7.5 | 2026-08-09 | 发货单大版本更新：新增已取消状态、差异明细弹窗、操作列重构、详情弹窗完善 |
| v1.7.0 | 2026-08-09 | 接入需求预测与新版备货计划；统一浅色导航 |
| v1.6.2 | 2026-08-09 | 货权调整弹窗全面重做（两步合一 + 搜索增强 + 团队字段） |
| v1.5.2 | 2026-08-08 | 新增 docs/meeting-notes/ 会议纪要归档目录 |
| v1.5.1 | 2026-08-08 | 发货单页面接入 + 统一浅色导航栏 |
| v1.5.0 | 2026-08-07 | 货权调整弹窗改为 Vue 3 + Element Plus 版 |
| v1.4.0 | 2026-08-07 | 修复缓存问题，刷新版本号 |
| v1.3.1 | 2026-08-07 | 初始版本 |

> 完整变更记录见 [CHANGELOG.md](file:///Users/kafeiyang/我的项目（焊捷）/Middle-Platform-Pages/docs/CHANGELOG.md)

---

*这个 README 帮助你快速识别和管理此项目。如果新增了重要功能，请记得更新此处的说明。*
