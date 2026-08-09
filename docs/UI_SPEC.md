# UI/UX 交互规范 · 中台原型项目

> **用途**：做任何页面、弹窗、表格、表单的改动前，先查这份规范。记录了与产品经理多次迭代后沉淀下来的交互习惯和视觉偏好。
>
> **更新规则**：每次用户指出新的 UI 问题或偏好，立即补充到对应章节。

---

## 一、弹窗通用规范

### 1.1 宽度适配
- 弹窗宽度必须与内容匹配，去掉字段后必须等比加宽剩余列，**禁止右侧留大片空白**
- 如果去掉字段导致内容变窄，优先缩小弹窗 `width`（如 86vw → 74vw），再配合加宽剩余列
- 批量弹窗比单条弹窗多一列来源标识（如发货单号），宽度需相应更大

### 1.2 批量 vs 单条差异化
| 维度 | 单条弹窗 | 批量弹窗 |
|---|---|---|
| 标题 | `功能名｜单据号` | `批量功能名` |
| 额外列 | 无 | 来源单据号列 |
| 顶部 | 简洁操作栏 | 汇总栏（X张单/Y个SKU/Z件） |
| 快捷按钮 | 「一键填满」 | 「一键全部填充」 |

### 1.3 信息分层
- 批量弹窗顶部必须有汇总栏，蓝底渐变背景，一目了然
- 汇总栏格式：`可操作单据 X 张 · SKU Y 个 · 合计 Z 件`

---

## 二、表格列规范

### 2.1 列合并原则（减少横向滚动）
- 多个关联字段合并为一列，单元格内分行显示
- 典型合并模式：

| 合并前 | 合并后 |
|---|---|
| 在库量 + 在库（待发）量 + 在途／在产量 + 总量 | **库存明细**（4行：在库量/在库（待发）量/在途／在产量/总量） |
| 累计提货 + 剩余可提 | **提货进度**（2行） |
| 已加工 + 可加工 | **加工进度**（2行） |

### 2.2 字段名称
- **合并后不改字段原名**，保持与原始表头一致
- 例：合并后仍然叫「在库量」而不是「在库」

### 2.3 固定列
- 左侧固定：勾选框 + SKU + 单据号（批量模式）
- 右侧固定：操作输入列（如本次提货数量、本次加工数量）
- **用户不应横向滚动才能填写输入框**

### 2.4 单元格合并
- 父行（如组合SKU）的 SKU 列向下跨行合并，覆盖所有子件行
- 子件行在 SKU 列不显示内容，仅在「子件SKU」列显示
- 子件格式：`子SKU编码 ×配比`（如 `SPU-2003-A ×1`）
- 组合 SKU 下方挂一个蓝色小标签「组合」

### 2.5 只显示相关数据
- 弹窗中不展示与当前操作无关的行（如加工弹窗不显示非组合SKU）
- 不展示与当前操作无关的列（用户要求去掉的列直接移除）

### 2.6 表格溢出与横向滚动（**强制规范，违反一次返工一次**）

> **背景**：采购计划页面曾因容器多层 `overflow:hidden` + Grid `min-width:auto` 默认值，导致操作列及其后所有列被裁剪不可见，调试花费大量时间。**所有带 el-table 的页面必须遵守以下规则。**

#### 2.6.1 根本原因（三层叠加问题）
1. **查询面板/表单层**：查询区如果设置了 `min-width` 但自身没有 `overflow-x:auto`，会把整个页面撑宽，导致外层 Grid 宽度计算错误
2. **Grid/Flex 容器层**：CSS Grid 子元素默认 `min-width:auto`，即使内部表格设置了 `overflow-x:auto` 也无法收缩，会被内容撑破父容器
3. **Element Plus el-table 层**：
   - 外层容器 `.el-table` 或父包装 div 如果设置了 `overflow:hidden`，会把 el-scrollbar 的横向滚动条裁剪掉
   - `.el-table__body-wrapper` / `.el-table__header-wrapper` 内部的 `.el-scrollbar__wrap` 会被 Element Plus JS 动态设置为 `overflow-x:hidden`，必须用 `!important` 强制覆盖

#### 2.6.2 必须遵守的布局层级（从外到内）

| 层级 | 元素 | 必须设置 | 禁止设置 |
|---|---|---|---|
| 1. 最外层内容区 | `.main`（Grid 容器）| `display:grid; grid-template-rows:...; min-width:0; min-height:0` | 固定 `width` / 固定 `min-width` |
| 2. 业务区容器 | `.stock-business`（Grid 子项）| `min-width:0; min-height:0; overflow:auto` | 无 |
| 3. 表格包装容器 | `.xxx-table` | `width:100%; min-width:0` | `overflow:hidden`（会裁剪滚动条）|
| 4. el-table 本体 | `.el-table` | `width:100%`；圆角在这一层实现 | 无 |
| 5. el-table 滚动容器 | `.el-table__body-wrapper` / `.el-table__header-wrapper` | `overflow-x:auto !important` | 无 |
| 6. el-scrollbar 滚动条 | `.el-scrollbar__wrap`（body/header 内部）| `overflow-x:auto !important` | 无 |
| 7. table 标签 | `table` | `min-width:XXXpx !important; width:XXXpx !important`（根据列宽总和设定）| 无 |
| 8. 查询面板/表单 | `.query-panel` | 如果内部表单总宽超过容器，必须自己 `overflow-x:auto` | 不能让表单撑宽外层容器 |
| 9. 操作按钮栏 | `.action-strip` | `min-width:0; overflow-x:auto; white-space:nowrap` | 无 |
| 10. 状态标签栏 | `.status-bar` | `min-width:0; overflow-x:auto` | 无 |

#### 2.6.3 标准 CSS 模板（每个带表格的业务页必须套用）

```css
/* Grid 子项必须 min-width:0，否则无法收缩 */
.stock-business{min-width:0;min-height:0;overflow:auto;background:#f5f7fa;padding:0 14px 18px}

/* 查询面板自己处理横向滚动，不能撑宽页面 */
.stock-business .query-panel{min-width:0;overflow-x:auto}

/* 操作栏、状态栏也要自己处理溢出 */
.stock-business .action-strip{min-width:0;height:48px;padding:0;border-bottom:1px solid #ebeef5;background:#fff;overflow-x:auto;white-space:nowrap}
.stock-business .status-bar{min-width:0;height:47px;padding:0 14px;background:#fff;overflow-x:auto}

/* 表格容器：不能加 overflow:hidden（会裁滚动条）*/
.stock-business-table{min-width:0;background:#fff;border:1px solid #ebeef5;border-radius:6px;width:100%}
.stock-business-table > .el-table{border-radius:6px;overflow:hidden}
.stock-business-table .el-table{width:100%}

/* 强制启用横向滚动（Element Plus 会动态覆盖，必须 !important）*/
.stock-business-table .el-table .el-table__body-wrapper,
.stock-business-table .el-table .el-table__header-wrapper{overflow-x:auto!important}
.stock-business-table .document-table .el-table__body-wrapper .el-scrollbar__wrap,
.stock-business-table .document-table .el-table__header-wrapper .el-scrollbar__wrap{overflow-x:auto!important}

/* 表格最小宽度 = 所有列的 min-width 之和 + 边框，防止列被压缩 */
.stock-business-table .document-table table{min-width:1060px!important;width:1060px!important}
.stock-business-table .detail-box .el-table table{min-width:1420px!important;width:1420px!important}
```

#### 2.6.4 列宽策略
- **优先使用 `min-width`** 而非固定 `width`，让表格在宽屏下自动分配剩余空间
- **序号/复选框/日期/操作列** 可使用固定 `width`
- **长文本列**（如品名、备注）必须开启 `show-overflow-tooltip`，并配合单元格 ellipsis
- **操作列** 必须留足空间（至少 `min-width="180"`），按钮多时考虑用「更多」下拉

#### 2.6.5 调试时必查项（浏览器 Console）
写完表格后必须在控制台执行以下检查，确认横向滚动正常：
```js
// 1. 检查容器宽度链路
const main = document.querySelector('.main');
const business = document.querySelector('.stock-business');
const tableWrap = document.querySelector('.stock-business-table');
const wrap = document.querySelector('.document-table .el-table__body-wrapper .el-scrollbar__wrap');
console.log({
  mainW: main?.offsetWidth,
  businessW: business?.offsetWidth,
  tableWrapW: tableWrap?.offsetWidth,
  wrapSw: wrap?.scrollWidth,    // 内容宽度
  wrapCw: wrap?.clientWidth,    // 可视宽度
  hasHScroll: wrap?.scrollWidth > wrap?.clientWidth,  // 应有滚动条时为 true
  overflowX: getComputedStyle(wrap).overflowX  // 必须是 "auto" 或 "scroll"
});
// 验证：wrapSw > wrapCw 时，overflowX 必须是 auto/scroll，且页面底部能看到横向滚动条
```

---

## 三、交互操作规范

### 3.1 快捷操作
- 需要批量填写的弹窗必须提供「一键填满」/「一键全部填充」按钮
- 必须提供「清空」按钮恢复归零
- 一键填满后自动勾选所有可操作行

### 3.2 搜索过滤
- 数据超过 5 行的弹窗应提供搜索输入框
- 批量弹窗提供 SKU + 单据号两个搜索维度
- 搜索时保留匹配行及其关联子行，不拆散父子关系
- 搜索框旁有「清除筛选」按钮

### 3.3 弹窗排序
- 批量模式按单据号排序，同一单据的组合品靠在一起

### 3.4 发货弹窗
- 表格列出所有 SKU的发货明细（非仅含单一类型的筛选弹窗）
- 差异列带有悬浮问号提示，解释正负含义
- 底部汇总：已选 SKU数 + 本次发货总计 + 提交后状态标签
- 快捷按钮：「按剩余可发数量填充」
- 当发货数量与提货数量不一致时，差异原因列为必填（显示红色星号）

### 3.5 手动完结弹窗
- **单条模式**：标题含单据号 + 顶部信息卡（状态/申报/已发/已收/未收）
- **批量模式**：标题为「批量手动完结」+ 顶部仅显示选中单据数量
- **必填表单**：完结原因（下拉选择）+ 备注（多行输入框，选填，300 字上限）

### 3.6 货权调整弹窗
- **不展示单一来源汇总**：因用户可能一次勾选多个采购单/多团队的 SKU，顶部不显示「来源采购单 / 来源货权 / 来源团队 / 可调整在途数」等固定信息
- **采购单号搜索**：下拉选择单号类型（易仓 / 领星 / 跟踪号）+ 输入框，默认「采购单号（易仓）」
- **唯一列表，来源与调入同表**：查询结果列表同时展示来源信息和调入信息输入框，不再分「搜索结果」和「已选 SKU」两个表格
- **来源信息列**：来源 SKU、采购单号、品名、来源平台/店铺/团队、采购数、在途数、可调整数
- **调入信息列**：调入平台、调入店铺、调入 SellerSKU/ASIN、调入团队、调入数量
- **调入团队只读自动带出**：根据所选调入平台自动显示对应团队，不可选择不可编辑；未选平台时显示「—」（灰色）
- **批量工具栏**：勾选多行后，可批量应用平台/店铺，或按可调整数填充数量；仅对勾选行生效
- **不展示匹配状态列**：无在途数量的 SKU 直接过滤掉，不在结果中展示
- **校验在提交时统一进行**：错误用消息提示具体 SKU 及原因
- **底部无模拟提交失败**：仅保留重置、取消、确认调整

---

## 四、视觉规范

### 4.1 设计体系
- Element Plus + Vue 3 企业后台风格
- 配色克制，不花哨
- 中文文案自然，适合真实业务系统

### 4.2 汇总栏样式
```css
background: linear-gradient(135deg, #f0f7ff 0%, #ecf5ff 100%);
border: 1px solid #b3d8ff;
border-radius: 8px;
```

### 4.3 嵌套单元格
- 多行数据用 `.nested-cell`（line-height: 1.7）
- 最后一行（如总量）用虚线分隔 `.nested-total`（border-top: dashed）

---

## 五、改动检查清单

每次改动完成后，自查以下项：

- [ ] 去掉列/字段后，剩余列宽度是否填满弹窗？右侧有无空白？
- [ ] 固定列是否正常工作？输入框能否不滚动直接看到？
- [ ] 合并列中的字段名是否保持了原名？
- [ ] 子件格式是否带 `×配比`？
- [ ] 批量弹窗有无汇总栏？单条弹窗标题是否含单据号？
- [ ] 有无「一键填满」和「清空」按钮？
- [ ] 非相关数据是否已过滤？（如加工弹窗无普通SKU）
- [ ] 搜索框是否在数据超过 5 行时存在？
- [ ] **表格横向滚动（强制必查）**：
  - [ ] 所有 Grid/Flex 子项容器（`.stock-business`、表格包装层、查询面板）是否都加了 `min-width:0`？
  - [ ] 表格包装容器是否**没有**设置 `overflow:hidden`？（会裁剪滚动条）
  - [ ] `.el-table__body-wrapper` / `.el-scrollbar__wrap` 是否强制 `overflow-x:auto !important`？
  - [ ] `table` 标签是否设置了正确的 `min-width`（等于所有列 min-width 之和）？
  - [ ] 查询面板/操作栏/状态栏是否自己处理了 `overflow-x:auto`，不会撑宽外层？
  - [ ] 控制台验证：`wrap.scrollWidth > wrap.clientWidth` 时 `getComputedStyle(wrap).overflowX === "auto"`，且横向滚动到底能看到操作列所有按钮？
  - [ ] 在窄屏（缩小浏览器窗口到 1200px 以下）时是否出现横向滚动条且可滚动看到所有列？
