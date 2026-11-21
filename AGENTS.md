# 项目协作与研发规范（Middle-Platform-Pages）

本文件用于为 AI 助手提供本项目（供应链中台原型与需求文档库）的常驻上下文与执行铁律。

## 1. 需求思考与 PM 工作流入口
- 涉及**需求分析、方案设计、PRD 生成、HTML 高保真原型、PRD 逆向检查、验收前置**时，必须先读取并遵循 `.agents/skills/pm-requirement-workflow/SKILL.md` 及其 `references/` 下的对应规范（如 `prd-template.md`、`workflow-blueprint.md`、`prototype-rules.md`、`acceptance-template.md`）。
- 涉及页面改动或三块结构校验时，参考 `.agents/skills/ui-page-change/SKILL.md`。
- **需求模式以用户指定为准**（`轻量` / `标准` / `复杂`）：
  - 未指定模式且需要跑完整流程或写 PRD 时，先向用户确认模式，不擅自决定或收缩范围。
  - 严格区分**已确认事实**、**AI 推测**（必须标注“推测/待确认”）与**待确认问题**，严禁将推测写成确定业务规则。

## 2. 必读业务与 UI 规范
- 业务逻辑知识库：`docs/BUSINESS_LOGIC.md`
- UI 与交互设计规范：`docs/UI_SPEC.md`（例如：列表「品名」列前置商品缩略图/占位图规范、弹窗骨架与底部统计胶囊规范等）
- 项目目录与更新约定：`README.md`

## 3. 原型修改与交付验证铁律
- 每次修改 `pages/` 下的 HTML / CSS / JS 交互后，**禁止只做 `node --check` 语法检查就交付**。
- 交付前**必须**起本地临时 HTTP 服务并使用本机 Chrome + Playwright（无头模式）运行真实点击流验证：
  - 覆盖本次新增或修改的按钮、表头全选、行勾选、弹窗/确认框、表单保存与状态流转；
  - 检查无 JS `pageerror` 与非预期报错后再向用户汇报结果。
- 模板与事件绑定同步修改时，须逐一核对模板中的 `data-*` 钩子在 `bindXxx()` 中均有对应监听，防止漏绑。

## 4. PRD 与文档落盘规范
- 页面级需求、字段、弹窗、交互、提示文案与验收标准写入 `PRD/` 目录，遵循 `.agents/skills/pm-requirement-workflow/references/prd-template.md`。
- PRD 中的流程图统一使用 **Mermaid 代码块**（```` ```mermaid ````）。
- 仅属于页面展示或交互细节的内容只写对应 PRD；涉及跨模块长期遵守的业务规则变更时，先与用户确认后再写入 `docs/BUSINESS_LOGIC.md`。

