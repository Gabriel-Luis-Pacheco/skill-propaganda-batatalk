// BANCO DE RISADAS da plateia do stand-up (TTS pago — só com autorização explícita do dono).
// Cada voz do modelo ri duas vezes (gargalhada e risada contida); o score.mjs empilha várias,
// com atrasos, alturas e lados diferentes, por cima de uma "cama" de risadas sintéticas, e faz a
// plateia. Sem transcrição (risada não tem palavra para conferir): só a duração e o nível.
//
//   V8P_TTS_AUTORIZADO=1 node --env-file=../.env v8-publica/tools/crowd-voices.mjs
//   (12 vozes × 2 takes ≈ 60 s de áudio ≈ US$ 0,015)
// Saída: v8-publica/audio/voices/crowd/<voz>_<estilo>.wav (48 kHz, mono) + crowd.json.
import ffmpegPath from 'ffmpeg-static';
import { spawn } from 'node:child_process';
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

if (process.env.V8P_TTS_AUTORIZADO !== '1') {
  console.error('Parado: TTS pago exige autorização explícita (V8P_TTS_AUTORIZADO=1). Nada foi gerado.');
  process.exit(2);
}
const key = process.env.OPENAI_API_KEY;
if (!key) { console.error('OPENAI_API_KEY ausente (rode com node --env-file=../.env).'); process.exit(2); }
const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(here, '..', 'audio', 'voices', 'crowd');
const MODEL = 'gpt-4o-mini-tts-2025-12-15';
const VOICES = ['alloy', 'ash', 'ballad', 'coral', 'echo', 'fable', 'nova', 'onyx', 'sage', 'shimmer', 'marin', 'cedar'];
const STYLES = {
  big: { input: 'HAHAHAHAHA! Hahahaha… hahaha!', how: 'Isto não é fala: é uma gargalhada espontânea de uma pessoa sentada na plateia de um show de stand-up, que acabou de ouvir uma piada ótima. Ria de verdade, com respiração e fôlego: explode, segura e vai diminuindo. Sem palavras e sem ler "ha ha" de forma mecânica.' },
  small: { input: 'Hahaha… haha.', how: 'Isto não é fala: é uma risada curta e contida de uma pessoa na plateia de um show de stand-up, rindo pelo nariz no começo e abrindo um pouco no fim. Espontânea, natural, sem palavras.' },
};

await mkdir(outDir, { recursive: true });
const exists = (f) => access(f).then(() => true, () => false);
const run = (argv) => new Promise((resolve, reject) => {
  const p = spawn(ffmpegPath, argv, { stdio: ['ignore', 'pipe', 'pipe'] });
  const out = []; let err = '';
  p.stdout.on('data', (d) => out.push(d)); p.stderr.on('data', (d) => { err += d; });
  p.on('close', (c) => (c === 0 ? resolve(Buffer.concat(out)) : reject(new Error(err.slice(-800)))));
});
const pcm = async (file) => { const b = await run(['-hide_banner', '-loglevel', 'error', '-i', file, '-f', 'f32le', '-ac', '1', '-ar', '48000', '-']); return new Float32Array(b.buffer, b.byteOffset, b.length / 4); };

const log = {};
for (const voice of VOICES) for (const [style, s] of Object.entries(STYLES)) {
  const id = `${voice}_${style}`, file = path.join(outDir, `${id}.wav`);
  if (!(await exists(file))) {
    let ok = false;
    for (let attempt = 1; attempt <= 5 && !ok; attempt++) {
      const r = await fetch('https://api.openai.com/v1/audio/speech', { method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: MODEL, voice, input: s.input, instructions: s.how, response_format: 'wav' }) });
      if (r.status === 429 || r.status >= 500) { await new Promise((z) => setTimeout(z, 1500 * attempt)); continue; }
      if (!r.ok) throw new Error(`TTS ${id}: ${r.status} ${(await r.text()).slice(0, 300)}`);
      const raw = file.replace(/\.wav$/, '.src.wav');
      await writeFile(raw, Buffer.from(await r.arrayBuffer()));
      await run(['-hide_banner', '-loglevel', 'error', '-y', '-i', raw, '-ac', '1', '-ar', '48000', '-c:a', 'pcm_s16le', file]);
      ok = true;
    }
    if (!ok) throw new Error(`TTS ${id}: sem resposta`);
  }
  // duração com som, nível e a "pulsação" da risada (sílabas por segundo no envelope de 10 ms)
  const x = await pcm(file), hop = 480, env = [];
  for (let i = 0; i + hop <= x.length; i += hop) { let e = 0; for (let k = 0; k < hop; k++) e += x[i + k] * x[i + k]; env.push(Math.sqrt(e / hop)); }
  const peak = Math.max(...env), on = env.findIndex((v) => v > peak * 0.08), off = env.length - [...env].reverse().findIndex((v) => v > peak * 0.08);
  let bursts = 0; for (let i = on + 1; i < off; i++) if (env[i] > peak * 0.35 && env[i - 1] <= peak * 0.35) bursts++;
  const dur = (off - on) / 100;
  log[id] = { voice, style, dur: +dur.toFixed(2), on: +(on / 100).toFixed(2), off: +(off / 100).toFixed(2), bursts, rate: +(bursts / Math.max(0.1, dur)).toFixed(1), peak: +peak.toFixed(3) };
  console.log(`${id.padEnd(16)} ${dur.toFixed(2)} s  ${bursts} rajadas (${log[id].rate}/s)  pico ${peak.toFixed(3)}`);
}
await writeFile(path.join(outDir, 'crowd.json'), JSON.stringify({ model: MODEL, made: new Date().toISOString(), takes: log }, null, 1));
