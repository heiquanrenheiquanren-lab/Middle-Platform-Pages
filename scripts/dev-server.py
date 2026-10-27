#!/usr/bin/env python3
"""本地原型开发服务器：所有响应带 no-cache 头，杜绝浏览器缓存旧版页面/脚本。

用法：python3 scripts/dev-server.py [端口]   # 默认 8765
需在仓库根目录（Middle-Platform-Pages 的上一级）启动，保持 /Middle-Platform-Pages/... 路径不变。
"""
import http.server
import socketserver
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8765


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()


class ThreadingTCPServer(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True


if __name__ == '__main__':
    with ThreadingTCPServer(('0.0.0.0', PORT), NoCacheHandler) as httpd:
        print(f'Serving (no-cache) on http://localhost:{PORT}')
        httpd.serve_forever()
