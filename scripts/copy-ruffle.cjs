const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'node_modules', '@ruffle-rs', 'ruffle');
const dstDir = path.join(__dirname, '..', 'dist', 'ruffle');

if (!fs.existsSync(srcDir)) {
  console.warn('[copy-ruffle] @ruffle-rs/ruffle not found in node_modules, skipping.');
  process.exit(0);
}

fs.mkdirSync(dstDir, { recursive: true });
for (const entry of fs.readdirSync(srcDir)) {
  const src = path.join(srcDir, entry);
  const dst = path.join(dstDir, entry);
  if (fs.statSync(src).isFile()) {
    fs.copyFileSync(src, dst);
  }
}
console.log('[copy-ruffle] Copied Ruffle WASM runtime to dist/ruffle/ for 100% offline EXE playback.');
