const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs');
const http = require('http');
const path = require('path');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.cjs': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.wasm': 'application/wasm',
  '.swf': 'application/x-shockwave-flash',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.mp3': 'audio/mpeg',
  '.svg': 'image/svg+xml',
};

let customSwfDir = null;

function resolveSwfDirs() {
  const dirs = [];
  if (customSwfDir) dirs.push(customSwfDir);
  if (process.env.PORTABLE_EXECUTABLE_DIR) {
    dirs.push(path.join(process.env.PORTABLE_EXECUTABLE_DIR, 'swf'));
    dirs.push(process.env.PORTABLE_EXECUTABLE_DIR);
  }
  const exeDir = path.dirname(app.getPath('exe'));
  dirs.push(path.join(exeDir, 'swf'));
  dirs.push(exeDir);
  dirs.push(path.join(__dirname, '..', 'dist', 'swf'));
  return dirs;
}

function startLocalServer() {
  const distDir = path.join(__dirname, '..', 'dist');
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const cleanUrl = decodeURIComponent((req.url || '/').split('?')[0]);
      const rel = cleanUrl === '/' ? 'index.html' : cleanUrl.replace(/^\/+/, '');

      if (rel.startsWith('swf/')) {
        const swfName = path.basename(rel);
        for (const dir of resolveSwfDirs()) {
          const candidate = path.join(dir, swfName);
          if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
            const ext = path.extname(candidate).toLowerCase();
            res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
            fs.createReadStream(candidate).pipe(res);
            return;
          }
        }
        res.writeHead(404);
        res.end('SWF not found');
        return;
      }

      const filePath = path.join(distDir, rel);
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
        fs.createReadStream(filePath).pipe(res);
        return;
      }
      res.writeHead(404);
      res.end('Not found');
    });

    server.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      resolve({ server, port: addr.port });
    });
  });
}

async function createWindow() {
  const { port } = await startLocalServer();
  const win = new BrowserWindow({
    width: 1280,
    height: 780,
    backgroundColor: '#08090c',
    autoHideMenuBar: true,
    title: 'Crazy Zombie 10.0 — Fanmade Studio Edition (Ruffle Engine)',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  win.loadURL(`http://127.0.0.1:${port}/index.html`);
}

ipcMain.handle('cz10:pickSwfFolder', async () => {
  const res = await dialog.showOpenDialog({
    title: 'Chọn thư mục chứa Mike.swf, lib.swf & snd.swf (Crazy Zombie 9.0 gốc)',
    properties: ['openDirectory'],
  });
  if (res.canceled || !res.filePaths.length) return null;
  customSwfDir = res.filePaths[0];
  return customSwfDir;
});

app.whenReady().then(createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
