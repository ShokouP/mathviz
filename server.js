/**
 * mathviz — 极简静态开发服务器
 * 端口 8100，绑 0.0.0.0，打印本机与局域网入口便于手机访问。
 * 纯 Node 标准库，零依赖。
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = 8100;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.map': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
};

// 安全：禁止路径穿越
function safeJoin(reqPath) {
  const decoded = decodeURIComponent(reqPath.split('?')[0].replace(/#/g, ''));
  const rel = decoded.startsWith('/') ? decoded.slice(1) : decoded;
  const resolved = path.resolve(ROOT, rel);
  if (!resolved.startsWith(ROOT)) return null;
  return resolved;
}

function guessFile(fullPath) {
  if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) return fullPath;
  // 目录 → 尝试 index.html
  const idx = path.join(fullPath, 'index.html');
  if (fs.existsSync(idx)) return idx;
  return null;
}

const server = http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('405 Method Not Allowed');
  }
  const full = safeJoin(req.url);
  if (!full) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('403 Forbidden');
  }
  const file = guessFile(full);
  if (!file) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('404 Not Found');
  }
  const ext = path.extname(file).toLowerCase();
  const mime = MIME[ext] || 'application/octet-stream';
  try {
    const data = fs.readFileSync(file);
    res.writeHead(200, {
      'Content-Type': mime,
      'Cache-Control': 'no-cache',
      'Content-Length': data.length,
    });
    if (req.method === 'HEAD') return res.end();
    res.end(data);
  } catch (e) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('500 Internal Server Error');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  const nets = require('os').networkInterfaces();
  const ips = ['127.0.0.1'];
  Object.values(nets).forEach((list) => {
    (list || []).forEach((n) => {
      if (n.family === 'IPv4' && !n.internal) ips.push(n.address);
    });
  });
  console.log('mathviz dev server:');
  ips.forEach((ip) => console.log(`  http://${ip}:${PORT}/`));
  console.log(`  (listening on 0.0.0.0:${PORT}, Ctrl+C to stop)`);
});
