import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const chromePath = [
  process.env.CHROME_BIN,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
].find((path) => path && existsSync(path));
const widths = [2048, 1440, 1024];
const contentTypes = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png' };

if (!chromePath) {
  console.error('找不到 Chrome（可通过 CHROME_BIN 指定浏览器路径）');
  process.exit(1);
}

const delay = (ms) => new Promise((done) => setTimeout(done, ms));
const server = createServer((request, response) => {
  const path = resolve(root, `.${decodeURIComponent(new URL(request.url, 'http://localhost').pathname)}`);
  if (!path.startsWith(`${root}${sep}`) || !existsSync(path)) {
    response.writeHead(404).end();
    return;
  }
  response.setHeader('Content-Type', `${contentTypes[extname(path)] || 'application/octet-stream'}; charset=utf-8`);
  response.end(readFileSync(path));
});

const profile = mkdtempSync(join(tmpdir(), 'inventory-query-layout-'));
let chrome;
let socket;

try {
  await new Promise((done) => server.listen(0, '127.0.0.1', done));
  chrome = spawn(chromePath, [
    '--headless=new', '--disable-gpu', '--disable-extensions', '--no-first-run',
    '--remote-allow-origins=*', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'
  ], { stdio: 'ignore' });

  const portFile = join(profile, 'DevToolsActivePort');
  let port;
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (existsSync(portFile)) {
      port = Number(readFileSync(portFile, 'utf8').split('\n')[0]);
      break;
    }
    if (chrome.exitCode !== null) throw new Error('Chrome 启动失败');
    await delay(100);
  }
  if (!port) throw new Error('Chrome 调试端口启动超时');

  const pageUrl = `http://127.0.0.1:${server.address().port}/pages/inventory-flow/index.html`;
  const target = await (await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(pageUrl)}`, { method: 'PUT' })).json();
  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((done, fail) => {
    socket.addEventListener('open', done, { once: true });
    socket.addEventListener('error', fail, { once: true });
  });

  let nextId = 0;
  const pending = new Map();
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    const task = pending.get(message.id);
    if (!task) return;
    pending.delete(message.id);
    if (message.error) task.reject(new Error(message.error.message));
    else task.resolve(message.result);
  });
  const send = (method, params = {}) => new Promise((resolveTask, rejectTask) => {
    const id = ++nextId;
    pending.set(id, { resolve: resolveTask, reject: rejectTask });
    socket.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async (expression) => {
    const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
    return result.result.value;
  };

  await send('Runtime.enable');
  await send('Page.enable');
  await send('Page.navigate', { url: pageUrl });
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt += 1) {
    ready = await evaluate("!!document.querySelector('#app:not([v-cloak]) .query-date-item .el-date-editor') && document.querySelectorAll('.query-actions button').length === 2");
    if (ready) break;
    await delay(100);
  }
  if (!ready) throw new Error('库存流水筛选区加载超时');

  for (const width of widths) {
    await send('Emulation.setDeviceMetricsOverride', { width, height: 800, deviceScaleFactor: 1, mobile: false });
    await evaluate('new Promise(done => requestAnimationFrame(() => requestAnimationFrame(done)))');
    const layout = await evaluate(`(() => {
      const panel = document.querySelector('.query-panel').getBoundingClientRect();
      const date = document.querySelector('.query-date-item').getBoundingClientRect();
      const buttons = [...document.querySelectorAll('.query-actions button')].map(el => el.getBoundingClientRect());
      const items = [...document.querySelectorAll('.query-grid > .query-item, .query-tail > .query-item')]
        .map(el => el.getBoundingClientRect());
      const rows = [...new Set(items.map(rect => Math.round(rect.top)))];
      return {
        panel: { left: panel.left, right: panel.right },
        date: { left: date.left, right: date.right, top: date.top, width: date.width },
        buttons: buttons.map(rect => ({ left: rect.left, right: rect.right, top: rect.top })),
        rows: rows.length,
        overflow: document.querySelector('.query-grid').scrollWidth > document.querySelector('.query-grid').clientWidth + 1
      };
    })()`);
    const [query, reset] = layout.buttons;
    const failures = [];
    if (layout.date.width < 260 || layout.date.width > 360) failures.push(`日期框宽度 ${layout.date.width}px`);
    if (layout.rows > 2) failures.push(`筛选区占用 ${layout.rows} 行`);
    if (layout.overflow) failures.push('筛选区横向溢出');
    if (Math.abs(query.top - reset.top) > 2 || Math.abs(query.top - layout.date.top) > 2) failures.push('日期、查询、重置未在同一行');
    if (layout.date.right > query.left || query.right > reset.left) failures.push('日期或按钮发生重叠');
    if (Math.abs(query.left - layout.date.right - 8) > 2 || Math.abs(reset.left - query.right - 8) > 2) failures.push('日期与按钮间距不符合 8px 规范');
    if (layout.date.left < layout.panel.left || reset.right > layout.panel.right) failures.push('日期或按钮超出查询卡片');
    if (failures.length) throw new Error(`${width}px 验收失败：${failures.join('；')}`);
    console.log(`${width}px 通过：日期 ${Math.round(layout.date.width)}px，${layout.rows} 行，查询/重置同排可见`);
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  socket?.close();
  if (chrome && chrome.exitCode === null) {
    chrome.kill();
    await Promise.race([once(chrome, 'close'), delay(3000)]);
  }
  await new Promise((done) => server.close(done));
  rmSync(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
}
