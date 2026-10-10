import { createRequire } from 'module';
const require = createRequire('/opt/npm-tools/node_modules/');
const { chromium } = require('playwright');
export async function open(path = '/tools/inspect.html', opts = {}) {
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--disable-web-security', '--allow-file-access-from-files'] });
  const page = await browser.newPage({ viewport: opts.viewport || { width: 1280, height: 720 } });
  page.on('console', m => { const t = m.text(); if (!/Download the React|THREE.FBXLoader: .*not supported|Vertex has more than 4/.test(t)) console.log('[page]', t.slice(0, 600)); });
  page.on('pageerror', e => console.log('[pageerror]', e.message));
  await page.goto((opts.base || 'http://localhost:8765') + path);
  return { browser, page };
}
