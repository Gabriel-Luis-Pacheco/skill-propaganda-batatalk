// Checagens de §10 sobre um MP4 9:16 ENTREGUE (não o animatic):
//  1) sobreposição aproximada da interface das plataformas (zonas que o app cobre);
//  2) os mesmos quadros na largura em que a pessoa vê no celular: 360 e 390 px CSS.
// Zonas (1080×1920): topo 0–270 (perfil, "patrocinado", progresso); base 1248–1920
// (legenda da postagem, CTA do anúncio); trilho direito x ≥ 960 entre y 760 e 1640
// (curtir/comentar/compartilhar). São a união das especificações publicadas por Meta
// (14% topo / 35% base / 6% lados) e TikTok (~120 px laterais, trilho à direita) —
// uma aproximação, não a garantia de um placement específico.
//   node v8-publica/tools/safezone-check.mjs entrega/v8-publica/V8_PUBLICA_SOCIAL_9x16.mp4 --t 1.5,4.6,8.2,10.4,12.6,15.8
// → review/qc/safezone-<arquivo>.jpg e review/qc/phone360-<arquivo>.jpg, phone390-…
import ffmpegPath from 'ffmpeg-static';
import sharp from 'sharp';
import { spawnSync } from 'node:child_process';
import { mkdtemp, rm, mkdir } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const file = path.resolve(args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--t'));
const times = opt('--t', '1,4,8,12').split(',').map(Number);
const base = path.basename(file, '.mp4');
const outDir = path.join(here, '..', 'review', 'qc');
await mkdir(outDir, { recursive: true });
const tmp = await mkdtemp(path.join(os.tmpdir(), 'v8p-safe-'));
const frames = [];
for (const [i, t] of times.entries()) {
  const png = path.join(tmp, `${i}.png`);
  spawnSync(ffmpegPath, ['-hide_banner', '-loglevel', 'error', '-y', '-ss', String(t), '-i', file, '-frames:v', '1', png]);
  frames.push({ t, png });
}
const zones = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920">
  <rect x="0" y="0" width="1080" height="270" fill="#d0312d" fill-opacity=".28"/>
  <rect x="0" y="1248" width="1080" height="672" fill="#d0312d" fill-opacity=".28"/>
  <rect x="960" y="760" width="120" height="880" fill="#d0312d" fill-opacity=".28"/>
  <rect x="120" y="270" width="840" height="978" fill="none" stroke="#1f7a3e" stroke-width="6" stroke-dasharray="18 12"/>
  <g font-family="Arial" font-size="30" fill="#fff" stroke="#000" stroke-width="1"><text x="20" y="160">perfil · patrocinado</text><text x="20" y="1330">legenda da postagem · CTA</text><text x="972" y="820" font-size="22">botões</text></g>
</svg>`;
const label = (w, txt) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="26"><rect width="100%" height="100%" fill="#14241c"/><text x="8" y="18" font-family="Arial" font-size="15" fill="#fffdf7">${txt}</text></svg>`);
// 1) zonas
{
  const tw = 270, th = 480, tiles = [];
  for (const [i, f] of frames.entries()) {
    // o sharp reduz antes de compor: compõe em tamanho cheio primeiro, reduz depois
    const full = await sharp(f.png).composite([{ input: Buffer.from(zones) }]).png().toBuffer();
    tiles.push({ input: await sharp(full).resize(tw, th).toBuffer(), left: i * tw, top: 26 });
    tiles.push({ input: label(tw, `${f.t.toFixed(2)} s`), left: i * tw, top: 0 });
  }
  await sharp({ create: { width: tw * frames.length, height: th + 26, channels: 3, background: '#14241c' } }).composite(tiles).jpeg({ quality: 85 }).toFile(path.join(outDir, `safezone-${base}.jpg`));
}
// 2) celular: a largura em px CSS que a pessoa vê (o aparelho pode ter mais pixels físicos, nunca mais espaço)
for (const w of [360, 390]) {
  const h = Math.round(w * 1920 / 1080), tiles = [];
  for (const [i, f] of frames.entries()) {
    tiles.push({ input: await sharp(f.png).resize(w, h, { kernel: 'lanczos3' }).toBuffer(), left: i * (w + 8), top: 26 });
    tiles.push({ input: label(w, `${f.t.toFixed(2)} s · ${w} px`), left: i * (w + 8), top: 0 });
  }
  await sharp({ create: { width: (w + 8) * frames.length, height: h + 26, channels: 3, background: '#14241c' } }).composite(tiles).jpeg({ quality: 88 }).toFile(path.join(outDir, `phone${w}-${base}.jpg`));
}
await rm(tmp, { recursive: true, force: true });
console.log(`ok: review/qc/safezone-${base}.jpg, phone360-${base}.jpg, phone390-${base}.jpg (${times.join(', ')} s)`);
