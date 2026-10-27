// Antes de renderizar: varre um corte inteiro pelo MESMO protocolo de captura do render (CDP,
// quadro de aquecimento) e conta pixels transparentes. O render tira o canal alfa, então todo
// pixel transparente vira preto no MP4 (cantos que o compositor deixou sem pintar).
//   node v8-publica/tools/alpha-scan.mjs --cut master --format 9x16 [--step 0.5]
//   node v8-publica/tools/alpha-scan.mjs --all [--step 0.5]
import { chromium } from 'playwright';
import sharp from 'sharp';
import { CAPTURE_ARGS, WARMUP } from './chrome.mjs';
import { serve } from './serve.mjs';

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const step = +opt('--step', 0.5);
const jobs = args.includes('--all')
  ? [['master', '16x9'], ['master', '9x16'], ['landing', '16x9'], ['landing', '9x16'], ['social', '9x16'], ['adA', '9x16'], ['adB', '9x16'], ['adC', '9x16'], ['bumper', '9x16']]
  : [[opt('--cut', 'master'), opt('--format', '9x16')]];
const srv = await serve();
const browser = await chromium.launch({ channel: 'msedge', headless: true, args: CAPTURE_ARGS });
let bad = 0;
for (const [cut, format] of jobs) {
  const W = format === '9x16' ? 1080 : 1920, H = format === '9x16' ? 1920 : 1080;
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  await page.goto(`${srv.url}/batatalk-launch-video/v8-publica/film.html?format=${format}&cut=${cut}`, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.waitForFunction(() => window.__filmReady || window.__filmError, null, { timeout: 120000 });
  const err = await page.evaluate(() => window.__filmError);
  if (err) { console.log(`${cut} ${format}: ERRO ${err}`); bad++; await page.close(); continue; }
  await page.evaluate(() => window.__film.ready());
  const duration = await page.evaluate(() => window.__film.duration);
  const cdp = await page.context().newCDPSession(page);
  const hits = [];
  let n = 0;
  for (let t = 0; t <= duration - 1 / 30; t = +(t + step).toFixed(3)) {
    await page.evaluate((x) => window.__film.seek(x), t);
    await cdp.send('Page.captureScreenshot', WARMUP);
    const shot = await cdp.send('Page.captureScreenshot', { format: 'png', optimizeForSpeed: true });
    const { data } = await sharp(Buffer.from(shot.data, 'base64')).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    let clear = 0;
    for (let p = 3; p < data.length; p += 4) if (data[p] < 250) clear++;
    if (clear) hits.push(`${t.toFixed(2)} s: ${clear} px`);
    n++;
  }
  bad += hits.length;
  console.log(`${cut} ${format}: ${n} instantes, ${hits.length ? `${hits.length} com pixels transparentes → ${hits.slice(0, 8).join(' · ')}` : 'nenhum pixel transparente'}`);
  await page.close();
}
await browser.close(); await srv.close();
process.exitCode = bad ? 1 : 0;
