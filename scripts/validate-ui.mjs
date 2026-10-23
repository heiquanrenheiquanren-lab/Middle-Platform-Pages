import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';

const root = process.cwd();
const files = {
  kit: 'ui-kit.css',
  kitScript: 'ui-kit.js',
  navigation: 'navigation.css',
  documentList: 'document-list.css',
  product: 'pages/product-list/index.html',
  mapping: 'pages/overseas-sku-mapping/index.html',
  mappingApp: 'pages/overseas-sku-mapping/app.js'
};
const errors = [];
const read = (file) => readFileSync(resolve(root, file), 'utf8');

const pageIndexes = readdirSync(resolve(root, 'pages'), { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && existsSync(resolve(root, 'pages', entry.name, 'index.html')))
  .map((entry) => `pages/${entry.name}/index.html`);

Object.values(files).forEach((file) => { if (!existsSync(resolve(root, file))) errors.push(`缺少共享 UI 文件：${file}`); });
if (!errors.length) {
  const kit = read(files.kit);
  const navigation = read(files.navigation);
  const documentList = read(files.documentList);
  const product = read(files.product);
  const mapping = read(files.mapping);
  const mappingApp = read(files.mappingApp);
  ['--ui-query-gap', '--ui-button-gap', '.ui-query-card', '.ui-action-row', '.ui-dialog--import', '.ui-import__steps'].forEach((token) => {
    if (!kit.includes(token)) errors.push(`UI Kit 未定义必需组件或变量：${token}`);
  });
  if (!navigation.includes('@import url("./ui-kit.css")')) errors.push('navigation.css 未加载 ui-kit.css。');
  if (!/\.document-list\s+th:nth-child\(2\)[\s\S]*?text-overflow:\s*clip\s*!important/.test(documentList)) errors.push('document-list.css 未禁用展开辅助列的省略号。');
  if (!/\.document-list\s+\.document-expand::after[\s\S]*?content:\s*none\s*!important/.test(documentList)) errors.push('document-list.css 未清除展开控件的尾随内容。');
  ['pickup-orders', 'processing-orders', 'transfer-orders', 'inventory-adjustments'].forEach((pageName) => {
    const html = read(`pages/${pageName}/index.html`);
    if (!html.includes('document-list.css?v=1.0.1')) errors.push(`${pageName} 未加载当前版本的单据列表共享样式。`);
    if (!html.includes('document-list')) errors.push(`${pageName} 的主列表未使用 document-list 共享类。`);
  });
  ['ui-page-canvas', 'ui-query-card', 'ui-query-flow', 'ui-action-row', 'ui-list-card'].forEach((className) => {
    if (!product.includes(className)) errors.push(`产品列表未接入共享组件：${className}`);
    if (!mapping.includes(className)) errors.push(`海外仓 SKU 映射未接入共享组件：${className}`);
  });
  if (!mapping.includes('../../ui-kit.js')) errors.push('海外仓 SKU 映射未加载共享 UI Kit 脚本。');
  if (!mappingApp.includes('UIKit.openImportDialog')) errors.push('海外仓 SKU 映射导入弹窗未复用 UIKit.openImportDialog。');
  if (/window\.confirm\s*\(/.test(mappingApp)) errors.push('海外仓 SKU 映射仍在使用浏览器原生确认框。');
  ['pushButton', 'pushMenuPanel', 'pushRecordsButton', 'GlobalSyncCenter'].forEach((token) => {
    if (!`${product}\n${read('pages/product-list/app.js')}`.includes(token)) errors.push(`产品 ERP 推送未接入共享同步中心：${token}`);
  });
  ['global-sync.css', 'global-sync.js'].forEach((token) => {
    if (!product.includes(token)) errors.push(`产品页未加载共享同步中心资源：${token}`);
  });
  const syncScript = read('global-sync.js');
  if (!syncScript.includes('sync-drawer')) errors.push('产品推送记录未使用右侧抽屉。');
  if (/data-sync-(?:search|reset|sku|target|status|start|end)/.test(syncScript)) errors.push('产品推送记录抽屉仍包含查询功能。');
  if (!read('global-sync.css').includes('width:50vw')) errors.push('产品推送记录抽屉未使用页面宽度的二分之一。');
  ['data-sync-copy', '复制失败SKU', '记录只保留 7 天'].forEach((token) => {
    if (!syncScript.includes(token)) errors.push(`产品推送失败明细缺少操作：${token}`);
  });
  if (/data-sync-retry|重试推送|失败时间/.test(syncScript)) errors.push('产品推送失败明细仍包含已移除的重试或失败时间功能。');
  const productApp = read('pages/product-list/app.js');
  ['SKU批量修改模板.xlsx', "accepted:'.xlsx'", '请勿修改表头，请使用标准模板填写 SKU 编码和需要修改的字段；留空字段不会覆盖原有信息。支持.xlsx文件，单次仅导入一个文件。'].forEach((token) => {
    if (!productApp.includes(token)) errors.push(`产品批量修改未统一使用 xlsx：${token}`);
  });
  if (!productApp.includes('未填写字段则保持原值，不同 SKU 需要设置不同值时请使用“导入修改”，保存修改后无效 SKU 不影响其他有效 SKU 保存')) errors.push('产品手工批量修改提示文案不正确。');
  if (productApp.includes('手工修改会将所填字段统一应用到全部有效 SKU。')) errors.push('产品批量编辑标题下仍保留旧说明。');
  pageIndexes.forEach((page) => {
    const html = read(page);
    if (!html.includes('data-ui-kit-page="standard"')) errors.push(`${page} 未标记为 UI Kit 页面。`);
    if (!html.includes('class="ui-page-canvas"')) errors.push(`${page} 未接入 UI Kit 页面底色。`);
    if (!html.includes('navigation.css?v=1.7.92')) errors.push(`${page} 未加载当前版本的共享导航和 UI Kit。`);
  });
}
if (errors.length) {
  console.error('UI 验收未通过：');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}
console.log('UI 结构验收通过：共享组件、变量与导入弹窗均已接入。');
execFileSync(process.execPath, [resolve(root, 'scripts/check-inventory-flow-layout.mjs')], { stdio: 'inherit' });
