import { spawn } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const portIndex = process.argv.indexOf('--port');
const port = portIndex < 0 ? 5173 : Number(process.argv[portIndex + 1]);
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('请选择 1024–65535 之间的预览端口。');
const address = `http://127.0.0.1:${port}/`;
const noOpen = process.argv.includes('--no-open');
let server;

async function isGameRunning() {
  let response;
  try { response = await fetch(address, { signal: AbortSignal.timeout(1500) }); }
  catch { return false; }
  const html = await response.text();
  if (response.ok && html.includes('<title>百味录</title>')) return true;
  throw new Error(`${port} 端口正被其他页面使用。可加 --port 5174 指定其他端口。`);
}

function browserExecutable() {
  if (process.env.BAIWEI_BROWSER_PATH && existsSync(process.env.BAIWEI_BROWSER_PATH)) return process.env.BAIWEI_BROWSER_PATH;
  const candidates = [
    join(process.env.ProgramFiles ?? 'C:/Program Files', 'Google/Chrome/Application/chrome.exe'),
    join(process.env.LOCALAPPDATA ?? '', 'Google/Chrome/Application/chrome.exe'),
    join(process.env['ProgramFiles(x86)'] ?? 'C:/Program Files (x86)', 'Microsoft/Edge/Application/msedge.exe'),
    join(process.env.ProgramFiles ?? 'C:/Program Files', 'Microsoft/Edge/Application/msedge.exe'),
  ];
  return candidates.find(existsSync);
}

async function main() {
  if (!await isGameRunning()) {
    server = spawn(process.execPath, [join(root, 'node_modules/vite/bin/vite.js'), '--configLoader', 'native', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], { cwd: root, stdio: 'inherit', windowsHide: true });
    server.on('error', error => { console.error(error.message); process.exitCode = 1; });
    let ready = false;
    for (let attempt = 0; attempt < 100; attempt++) {
      if (server.exitCode !== null) throw new Error('预览服务退出，请检查上面的启动信息。');
      if (await isGameRunning()) { ready = true; break; }
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    if (!ready) throw new Error('预览服务未在等待时间内就绪。');
  }
  console.log(`本地预览：${address}`);
  if (!noOpen) {
    const executable = browserExecutable();
    if (!executable) throw new Error('未找到 Chrome 或 Edge。可直接用本机浏览器打开上面的地址，或通过 BAIWEI_BROWSER_PATH 指定浏览器。');
    const profile = join(root, '.tmp/local-browser-profile');
    mkdirSync(profile, { recursive: true });
    const browser = spawn(executable, [`--user-data-dir=${profile}`, '--new-window', '--no-first-run', '--no-default-browser-check', '--window-size=1440,900', address], { detached: true, stdio: 'ignore', windowsHide: false });
    await new Promise((resolve, reject) => { browser.once('spawn', resolve); browser.once('error', reject); });
    browser.unref();
    console.log('已打开本机浏览器；预览使用工程内独立的浏览器目录。');
  }
  if (server) {
    console.log('关闭预览服务：Ctrl+C。');
    for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => server.kill());
    await new Promise(resolve => server.once('exit', code => { process.exitCode = code ?? 0; resolve(); }));
  }
}

main().catch(error => { server?.kill(); console.error(error.message); process.exitCode = 1; });
