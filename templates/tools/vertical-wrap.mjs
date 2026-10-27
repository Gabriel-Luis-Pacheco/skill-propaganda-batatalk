// Versões verticais (TikTok) de ganchos antigos em 16:9 (entrega/HOOK_*.mp4, V6): o vídeo inteiro,
// sem cortar texto, sob uma faixa creme com a frase do gancho em letra grande (o texto do próprio
// vídeo fica pequeno demais no celular). Tudo dentro da zona segura (y 270–1248).
//   node v8-publica/tools/vertical-wrap.mjs
import ffmpegPath from 'ffmpeg-static';
import { spawnSync } from 'node:child_process';
import { mkdir, writeFile, copyFile, mkdtemp } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const lv = path.resolve(here, '..', '..'), repo = path.resolve(lv, '..');
const out = path.join(lv, 'entrega', 'v8-publica', 'tiktok');
await mkdir(out, { recursive: true });
// [fonte 16:9, saída, linha 1 (verde), linha 2 (dourado)]
const JOBS = [
  ['entrega/HOOK_A.mp4', 'V6_TIKTOK_ENTENDER_9x16.mp4', 'Entender é uma coisa.', 'Falar é outra.'],
  ['entrega/HOOK_B.mp4', 'V6_TIKTOK_ATE_ALGUEM_FALAR_9x16.mp4', 'Você entende inglês.', 'Até alguém falar com você.'],
  ['entrega/HOOK_C.mp4', 'V6_TIKTOK_SO_NAO_SABIA_9x16.mp4', 'Você entendeu tudo.', 'Só não sabia o que responder.'],
];
// caminhos sem espaço para o drawtext (o filtro não aceita bem aspas/espaços em fontfile)
const tmp = await mkdtemp(path.join(os.tmpdir(), 'v8p-wrap-'));
const font = path.join(tmp, 'fredoka-600.ttf');
await copyFile(path.join(repo, 'assets', 'fonts', 'fredoka-600.ttf'), font);
const esc = (p) => p.replace(/\\/g, '/').replace(/:/g, '\\:');
for (const [src, name, l1, l2] of JOBS) {
  const t1 = path.join(tmp, `${name}-1.txt`), t2 = path.join(tmp, `${name}-2.txt`);
  await writeFile(t1, l1); await writeFile(t2, l2);
  const size2 = l2.length > 24 ? 60 : 68;
  const fc = [
    'color=c=0xFBF6EA:s=1080x1920:r=30[bg]',
    '[0:v]fps=30,scale=1080:-2:flags=lanczos[fg]',
    '[bg][fg]overlay=0:600:shortest=1[v0]',
    `[v0]drawtext=fontfile='${esc(font)}':textfile='${esc(t1)}':fontsize=68:fontcolor=0x1C3A2B:x=(w-text_w)/2:y=380,` +
    `drawtext=fontfile='${esc(font)}':textfile='${esc(t2)}':fontsize=${size2}:fontcolor=0x8A6400:x=(w-text_w)/2:y=470,format=yuv420p[v]`,
  ].join(';');
  const r = spawnSync(ffmpegPath, ['-hide_banner', '-loglevel', 'error', '-y', '-i', path.join(lv, src), '-filter_complex', fc, '-map', '[v]', '-map', '0:a',
    '-c:v', 'libx264', '-profile:v', 'high', '-crf', '18', '-preset', 'slow', '-tune', 'animation',
    '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', '-color_range', 'tv',
    '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-ac', '2', '-movflags', '+faststart', path.join(out, name)], { stdio: 'inherit' });
  if (r.status !== 0) process.exit(r.status || 1);
  console.log(`ok: ${path.relative(lv, path.join(out, name))} ← ${src}`);
}
