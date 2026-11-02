#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""把带 mermaid 代码块的 markdown 转成自包含 HTML 预览页。

用法：
  python3 scripts/md-preview.py <input.md> <output.html> [标题]
依赖：浏览器联网加载 marked / mermaid CDN。
"""
import base64
import html
import sys
from pathlib import Path

TEMPLATE = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>__TITLE__</title>
<style>
  :root{--ink:#1f2329;--ink-2:#51565d;--ink-3:#8a9099;--line:#e5e7eb;--bg:#fff;--bg-2:#f7f8fa;--accent:#2b6cb0}
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg-2);color:var(--ink);font:15px/1.75 -apple-system,BlinkMacSystemFont,"PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif}
  .page{max-width:960px;margin:0 auto;padding:48px 40px 80px;background:var(--bg);min-height:100vh;box-shadow:0 0 0 1px var(--line)}
  h1{font-size:28px;line-height:1.35;margin:0 0 8px;letter-spacing:-.01em}
  h2{font-size:21px;margin:44px 0 14px;padding-top:22px;border-top:1px solid var(--line)}
  h3{font-size:17px;margin:30px 0 10px;color:#111}
  p{margin:10px 0}
  a{color:var(--accent)}
  blockquote{margin:14px 0;padding:10px 16px;border-left:3px solid #d6dbe3;background:var(--bg-2);color:var(--ink-2);font-size:14px;border-radius:0 4px 4px 0}
  blockquote p{margin:3px 0}
  table{border-collapse:collapse;width:100%;margin:14px 0;font-size:13.5px;display:block;overflow-x:auto}
  th,td{border:1px solid var(--line);padding:7px 12px;text-align:left;vertical-align:top}
  th{background:var(--bg-2);font-weight:600;white-space:nowrap}
  td code,th code,p code,li code{background:#f2f4f7;border-radius:3px;padding:1px 5px;font-size:12.5px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:#c0341d}
  pre{background:#f6f8fa;border:1px solid var(--line);border-radius:6px;padding:14px 16px;overflow-x:auto;font-size:13px;line-height:1.6;margin:14px 0}
  pre code{background:none;padding:0;color:var(--ink);font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
  ul,ol{padding-left:22px;margin:10px 0}
  li{margin:5px 0}
  hr{border:0;border-top:1px solid var(--line);margin:34px 0}
  strong{font-weight:600;color:#111}
  .mermaid{background:#fbfcfd;border:1px solid var(--line);border-radius:8px;padding:20px;margin:18px 0;overflow-x:auto;text-align:center}
  .mermaid svg{max-width:none;height:auto}
  .fig-hint{margin:-10px 0 18px;color:var(--ink-3);font-size:11.5px;text-align:right}
  .mermaid-err{background:#fff5f5;border-color:#f3c2c2;color:#c0341d;font-size:13px;text-align:left;white-space:pre-wrap}
  #status{position:fixed;right:18px;bottom:16px;background:rgba(31,35,41,.86);color:#fff;font-size:12px;padding:6px 12px;border-radius:14px;opacity:0;transition:opacity .3s}
  #status.show{opacity:1}
  @media(max-width:720px){.page{padding:28px 18px 60px}h1{font-size:23px}}
  @media print{body{background:#fff}.page{box-shadow:none;max-width:none}}
</style>
</head>
<body>
<div class="page" id="root">正在解析文档…</div>
<div id="status"></div>
<script src="https://cdn.jsdelivr.net/npm/marked@12/marked.min.js"></script>
<script type="module">
const B64 = "__B64__";
const raw = new TextDecoder().decode(Uint8Array.from(atob(B64), c => c.charCodeAt(0)));
const root = document.getElementById('root');

if (!window.marked) {
  root.innerHTML = '<p style="color:#c0341d">marked 加载失败，请检查网络后刷新。</p>';
} else {
  root.innerHTML = marked.parse(raw, { gfm: true, breaks: false });
}

// 把 ```mermaid 代码块替换成待渲染容器
const codes = root.querySelectorAll('pre > code.language-mermaid');
codes.forEach(code => {
  const box = document.createElement('div');
  box.className = 'mermaid';
  box.textContent = code.textContent;
  code.parentElement.replaceWith(box);
});

const status = document.getElementById('status');
const setStatus = (t) => { status.textContent = t; status.classList.add('show'); };

try {
  const { default: mermaid } = await import('https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs');
  mermaid.initialize({
    startOnLoad: false,
    theme: 'base',
    themeVariables: {
      fontFamily: '-apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif',
      fontSize: '14px',
      primaryColor: '#eef4fb',
      primaryBorderColor: '#7ba7d4',
      primaryTextColor: '#1f2329',
      lineColor: '#7d8a99',
      secondaryColor: '#f4f6f8',
      tertiaryColor: '#ffffff',
      clusterBkg: '#fafbfc',
      edgeLabelBackground: '#ffffff'
    },
    flowchart: { curve: 'basis', htmlLabels: true, padding: 14, nodeSpacing: 42, rankSpacing: 52, useMaxWidth: false },
    sequence: { actorMargin: 30, boxMargin: 8, messageMargin: 32, noteMargin: 10, useMaxWidth: false },
    state: { nodeSpacing: 44, rankSpacing: 46, useMaxWidth: false }
  });

  const blocks = root.querySelectorAll('.mermaid');
  let ok = 0, bad = 0;
  for (let i = 0; i < blocks.length; i++) {
    const el = blocks[i];
    const src = el.textContent;
    try {
      const { svg } = await mermaid.render('mmd-' + i, src);
      el.innerHTML = svg;
      ok++;
    } catch (e) {
      bad++;
      el.classList.add('mermaid-err');
      el.textContent = '流程图 ' + (i + 1) + ' 渲染失败：' + (e && e.message ? e.message : e);
    }
  }

  // 超出容器宽度的图，补一行横向滚动提示
  blocks.forEach(el => {
    if (el.scrollWidth > el.clientWidth + 20) {
      const hint = document.createElement('div');
      hint.className = 'fig-hint';
      hint.textContent = '← 图较宽，可横向滚动 →';
      el.after(hint);
    }
  });
  setStatus('已渲染 ' + ok + ' 张流程图' + (bad ? '，' + bad + ' 张失败' : ''));
  setTimeout(() => status.classList.remove('show'), 3200);
} catch (e) {
  setStatus('mermaid 加载失败，请检查网络');
  console.error(e);
}
</script>
</body>
</html>
"""


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(2)
    src = Path(sys.argv[1])
    dst = Path(sys.argv[2])
    title = sys.argv[3] if len(sys.argv) > 3 else src.stem

    text = src.read_text(encoding="utf-8")
    b64 = base64.b64encode(text.encode("utf-8")).decode("ascii")
    out = TEMPLATE.replace("__TITLE__", html.escape(title)).replace("__B64__", b64)
    dst.write_text(out, encoding="utf-8")
    print(f"written: {dst} ({len(out) / 1024:.0f} KB)")


if __name__ == "__main__":
    main()
