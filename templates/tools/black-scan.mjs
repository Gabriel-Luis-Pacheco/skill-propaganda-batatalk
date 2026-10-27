// Varredura de TODOS os quadros de um MP4 entregue atrás de preto puro: a paleta do filme não tem
// preto (o mais escuro é o verde #14241c), então pixels com max(R,G,B) ≤ 6 são cantos sem recorte
// ou blocos não rasterizados (o defeito intermitente T10 do relatório). Quadros a 1/4 da resolução.
//   node v8-publica/tools/black-scan.mjs entrega/v8-publica/V8_PUBLICA_MASTER_9x16.mp4 [--min 12]
// → lista os instantes com mais de --min pixels pretos (na escala reduzida) e a caixa onde estão.
import ffmpegPath from 'ffmpeg-static';
import { spawn, spawnSync } from 'node:child_process';
import path from 'node:path';

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const files = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--min');
const MIN = +opt('--min', 12);
// o fps de verdade de cada arquivo (os vídeos do TikTok saem a 60): o tempo do quadro é n / fps
const fpsOf = (file) => { const r = spawnSync(ffmpegPath, ['-hide_banner', '-i', file], { encoding: 'utf8' }); const m = /(\d+(?:\.\d+)?) fps/.exec(r.stderr || ''); return m ? +m[1] : 30; };
let bad = 0;
for (const file of files) {
  const vertical = /9x16/.test(file), w = vertical ? 270 : 480, h = vertical ? 480 : 270, size = w * h * 3;
  const FPS = fpsOf(file);
  const ff = spawn(ffmpegPath, ['-hide_banner', '-loglevel', 'error', '-i', file, '-vf', `scale=${w}:${h}:flags=area`, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-']);
  let buf = Buffer.alloc(0), n = 0;
  const hits = [];
  ff.stdout.on('data', (chunk) => {
    buf = Buffer.concat([buf, chunk]);
    while (buf.length >= size) {
      const f = buf.subarray(0, size); buf = buf.subarray(size);
      let count = 0, x0 = w, y0 = h, x1 = -1, y1 = -1;
      for (let p = 0, i = 0; p < size; p += 3, i++) {
        if (f[p] <= 6 && f[p + 1] <= 6 && f[p + 2] <= 6) {
          count++; const x = i % w, y = (i / w) | 0;
          if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
        }
      }
      if (count > MIN) hits.push({ t: +(n / FPS).toFixed(3), count, box: [x0 * 4, y0 * 4, (x1 + 1) * 4, (y1 + 1) * 4] });
      n++;
    }
  });
  await new Promise((res) => ff.on('close', res));
  bad += hits.length;
  console.log(`${path.basename(file)}: ${n} quadros, ${hits.length} com preto puro${hits.length ? '' : ' — limpo'}`);
  for (const h of hits.slice(0, 12)) console.log(`  ${h.t.toFixed(3)} s · ${h.count} px · caixa ${h.box.join(',')}`);
  if (hits.length > 12) console.log(`  … mais ${hits.length - 12}`);
}
process.exitCode = bad ? 1 : 0;
