import fs from 'node:fs';

const NM = process.env.MERMAID_NODE_MODULES || '/Users/kafeiyang/.workbuddy/binaries/node/workspace/node_modules';
const { JSDOM } = await import(`${NM}/jsdom/lib/api.js`);

const file = process.argv[2];
if (!file) {
  console.error('usage: node check-mermaid.mjs <markdown-file>');
  process.exit(2);
}

const md = fs.readFileSync(file, 'utf8');
const blocks = [...md.matchAll(/```mermaid\r?\n([\s\S]*?)```/g)].map(m => m[1]);
console.log(`found ${blocks.length} mermaid block(s)`);

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', { pretendToBeVisual: true });
global.window = dom.window;
global.document = dom.window.document;
try {
  Object.defineProperty(global, 'navigator', { value: dom.window.navigator, configurable: true });
} catch { /* node 24 已有只读 navigator，忽略 */ }
global.HTMLElement = dom.window.HTMLElement;
global.SVGElement = dom.window.SVGElement;
global.DOMPurify = undefined;

const { default: mermaid } = await import(`${NM}/mermaid/dist/mermaid.core.mjs`);
mermaid.initialize({ startOnLoad: false, securityLevel: 'loose' });

let failed = 0;
for (let i = 0; i < blocks.length; i++) {
  const code = blocks[i].trim();
  const first = code.split('\n')[0].trim();
  try {
    await mermaid.parse(code);
    console.log(`  [OK]   block ${i + 1} (${first})`);
  } catch (e) {
    failed++;
    console.log(`  [FAIL] block ${i + 1} (${first})`);
    console.log(`         ${String(e.message || e).split('\n').slice(0, 6).join('\n         ')}`);
  }
}

console.log(failed ? `\n${failed} block(s) invalid` : '\nall blocks parsed successfully');
process.exit(failed ? 1 : 0);
