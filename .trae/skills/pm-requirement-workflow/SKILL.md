---
name: pm-requirement-workflow
description: "PM需求工作流：将业务输入转为结构化需求产出（方案建模/PRD/HTML原型/验收）。触发：用户说PM需求工作流、需求入口、资料整理、需求澄清、价值评估、方案建模、PRD生成、HTML高保真原型、PRD逆向检查、验收前置，或要求使用轻量/标准/复杂需求工作流。"
---

# PM Requirement Workflow

Use this skill to help a product manager turn rough business input into structured requirement outputs. The workflow has nine modules:

1. 需求入口确认
2. 资料整理
3. 需求澄清
4. 价值评估
5. 方案建模
6. PRD 生成
7. HTML 高保真原型
8. PRD 逆向检查
9. 验收前置

Do not add formal modules for 范围收缩 or 上线复盘. The user intentionally removed them from the main workflow.

## Operating Rules

- Treat the user's specified demand mode as authoritative: `轻量`, `标准`, or `复杂`.
- Do not decide the demand mode for the user. If the selected mode appears too light, warn about complexity signals and let the user decide.
- If no demand mode is provided and the user wants the workflow to run, ask for the mode before producing full workflow output.
- If the user specifies a current stage, execute only that stage unless they ask for multiple stages.
- If the user does not specify a current stage, suggest the most suitable next stage and explain why before proceeding.
- Do not expand the requirement scope. Work only on the current requested demand.
- Keep confirmed facts, AI inferences, and open questions separate.
- Never write AI inference as confirmed business rule.
- If information is incomplete, continue with a useful draft and list 待确认问题.
- For finance, tax, audit, procurement, inventory, reconciliation, invoice, settlement, supplier, or cross-system work, explicitly check data口径, permissions, compliance, state transitions, and audit trail.

## Reference Routing

Read only the references needed for the user's requested stage:

- For the overall process, modes, and strong rules: read `references/workflow-blueprint.md`.
- For module-specific prompt templates or stage execution: read `references/module-prompts.md`.
- For PRD generation or PRD structure questions: read `references/prd-template.md`.
- For HTML high-fidelity prototype work: read `references/prototype-rules.md`.
- For acceptance standards, test cases, launch checks, or operation manuals: read `references/acceptance-template.md`.

## Stage Guidance

When running a stage, produce practical PM artifacts, not generic advice. Keep output depth aligned with the demand mode:

- `轻量`: concise output, focus on change points, impact surface, risks, and acceptance.
- `标准`: complete workflow output for normal backend/product requirements.
- `复杂`: strengthen business process, role permissions, data objects, state rules, exceptions, system relationships, finance/tax/audit compliance, supply-chain value, and acceptance coverage.

## HTML Prototype Rules

When generating an HTML prototype:

- Select the delivery mode from the user's intent:
  - Use a single self-contained `.html` file for a new quick-review prototype or when the user explicitly requests a single file.
  - Use a GitHub Pages-ready static folder for an existing prototype version iteration, multi-page prototype, or any request to upload, share, or publish through GitHub Pages.
- Treat the user's requested directory tree and existing GitHub Pages URL paths as authoritative. Do not add an outer version folder.
- In GitHub Pages mode, use only static HTML, CSS, and JavaScript; use relative paths; keep each requested page's `index.html`, `app.js`, and `styles.css` together; and make the root `index.html` directly runnable.
- In GitHub Pages mode, also create a ZIP with the same contents, provide the root `index.html` for preview, record the version number, list changes and upload/replace files, and verify every page, style, script, navigation link, and core interaction.
- Follow Element Plus + Vue 3 enterprise backend design language.
- Use mock data only.
- Make core interactions clickable and stateful. Static mockups are not sufficient.
- Include realistic backend interactions such as filter, pagination, add, edit, view, delete/void/disable, modal/drawer, validation, feedback messages, empty states, and role differences when relevant.
- After prototype creation, list PRD issues discovered while building the prototype.

## Review Rules

For PRD 逆向检查, switch into a skeptical review stance. Lead with problems, sorted by severity. Do not rewrite the PRD unless the user asks for revision after reviewing the findings.
