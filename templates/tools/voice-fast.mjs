// Versões aceleradas (1,1×, sem mudar o tom) das falas em português dos vídeos curtos: ritmo de
// vlog, como o "1.1x" que criadores usam. Saída em audio/voices/final/fast/<id>.wav.
//   node v8-publica/tools/voice-fast.mjs            (falas da Mina e do esquete do bar)
//   node v8-publica/tools/voice-fast.mjs barP1 barJ5 (só estas)
//   node v8-publica/tools/voice-fast.mjs --speed 1.2 sJ1 sJ6 (outra velocidade: em fast-1.2/)
import ffmpegPath from 'ffmpeg-static';
import { spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
export const SPEED = 1.1;
const argv = process.argv.slice(2), si = argv.indexOf('--speed');
const speed = si >= 0 ? Number(argv.splice(si, 2)[1]) : SPEED;
const dir = path.join(here, '..', 'audio', 'voices', 'final'), out = path.join(dir, speed === SPEED ? 'fast' : `fast-${speed}`);
// o inglês da Priya (P3, P8) e as respostas de uma palavra da June (J3, J6, J7) ficam no tempo natural
export const FAST_IDS = ['minaHook', 'minaDezAnos', 'minaPraIsso', 'minaTreina', 'minaSeTravar', 'minaSopra', 'minaGratis', 'minaCTA',
  'barP1', 'barJ1', 'barP2', 'barJ2', 'barP4', 'barJ4', 'barP5', 'barJ5', 'barP6', 'barP7', 'barP9', 'barJ8'];
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}` || process.argv[1]?.endsWith('voice-fast.mjs')) {
  mkdirSync(out, { recursive: true });
  const ids = argv.length ? argv : FAST_IDS;
  for (const id of ids) {
    const r = spawnSync(ffmpegPath, ['-hide_banner', '-loglevel', 'error', '-y', '-i', path.join(dir, `${id}.wav`), '-filter:a', `atempo=${speed}`, '-ac', '1', '-ar', '48000', '-c:a', 'pcm_s16le', path.join(out, `${id}.wav`)]);
    if (r.status !== 0) { console.error(r.stderr?.toString()); process.exit(1); }
    console.log(`ok ${id}`);
  }
}
