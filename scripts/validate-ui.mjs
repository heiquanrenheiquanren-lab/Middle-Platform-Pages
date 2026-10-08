import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';

const root = process.cwd();
const files = {
  kit: 'ui-kit.css',
  kitScript: 'ui-kit.js',
  navigation: 'navigation.css',
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
  const product = read(files.product);
  const mapping = read(files.mapping);
  const mappingApp = read(files.mappingApp);
  ['--ui-query-gap', '--ui-button-gap', '.ui-query-card', '.ui-action-row', '.ui-dialog--import', '.ui-import__steps'].forEach((token) => {
    if (!kit.includes(token)) errors.push(`UI Kit 未定义必需组件或变量：${token}`);
  });
  if (!navigation.includes('@import url("./ui-kit.css")')) errors.push('navigation.css 未加载 ui-kit.css。');
  ['ui-page-canvas', 'ui-query-card', 'ui-query-flow', 'ui-action-row', 'ui-list-card'].forEach((className) => {
    if (!product.includes(className)) errors.push(`产品列表未接入共享组件：${className}`);
    if (!mapping.includes(className)) errors.push(`海外仓 SKU 映射未接入共享组件：${className}`);
  });
  if (!mapping.includes('../../ui-kit.js')) errors.push('海外仓 SKU 映射未加载共享 UI Kit 脚本。');
  if (!mappingApp.includes('UIKit.openImportDialog')) errors.push('海外仓 SKU 映射导入弹窗未复用 UIKit.openImportDialog。');
  if (/window\.confirm\s*\(/.test(mappingApp)) errors.push('海外仓 SKU 映射仍在使用浏览器原生确认框。');
  ['pushButton', 'pushMenuPanel', 'ui-dialog--progress', 'ui-progress-table'].forEach((token) => {
    if (!`${product}\n${read('pages/product-list/app.js')}`.includes(token)) errors.push(`产品 ERP 推送未接入共享进度组件：${token}`);
  });
  pageIndexes.forEach((page) => {
    const html = read(page);
    if (!html.includes('data-ui-kit-page="standard"')) errors.push(`${page} 未标记为 UI Kit 页面。`);
    if (!html.includes('class="ui-page-canvas"')) errors.push(`${page} 未接入 UI Kit 页面底色。`);
    if (!html.includes('navigation.css?v=1.7.70')) errors.push(`${page} 未加载当前版本的共享导航和 UI Kit。`);
  });
}
if (errors.length) {
  console.error('UI 验收未通过：');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}
console.log('UI 结构验收通过：共享组件、变量与导入弹窗均已接入。');
execFileSync(process.execPath, [resolve(root, 'scripts/check-inventory-flow-layout.mjs')], { stdio: 'inherit' });
