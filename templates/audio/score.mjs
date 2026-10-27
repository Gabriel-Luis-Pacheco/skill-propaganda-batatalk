// Trilha da V8 pública: música original, ambiência do café, efeitos e vozes, montados
// a partir da linha do tempo do corte (generated/timeline-<cut>.json) — a mesma conta da
// imagem. Tudo sintetizado aqui (sem samples de terceiros): licença própria do projeto.
//
//   node v8-publica/audio/score.mjs --cut master
//
// Saída em v8-publica/audio/out/<cut>/: voices.wav, music.wav, ambience.wav, sfx.wav
// (stems, 48 kHz, 24 bits) e mix.wav (−15 LUFS integrados, teto −1,5 dBTP, medidos
// depois pelo FFmpeg em tools/qc.mjs). O motivo da onda são as três notas que sobem
// junto com as três palavras de "To go, please." (Ré–Fá♯–Lá).
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ffmpegPath from 'ffmpeg-static';
import { readWav } from './analyze-voices.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const cut = opt('--cut', 'master');
const SR = 48000;
const TL = JSON.parse(await readFile(path.join(root, 'generated', `timeline-${cut}.json`), 'utf8'));
const VOICES = JSON.parse(await readFile(path.join(root, 'generated', 'voices.json'), 'utf8'));
const DUR = TL.duration + 0.05;
const N = Math.ceil(DUR * SR);
const stem = () => [new Float32Array(N), new Float32Array(N)];
const music = stem(), amb = stem(), sfx = stem(), voices = stem();

// ------------------------------------------------------------------ utilidades
let seed = 12345;
const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const midi = (m) => 440 * 2 ** ((m - 69) / 12);
const NOTE = { D3: 50, Fs3: 54, A3: 57, B2: 47, G2: 43, A2: 45, D2: 38, Cs4: 61, D4: 62, E4: 64, Fs4: 66, G4: 67, A4: 69, B4: 71, Cs5: 73, D5: 74, E5: 76, Fs5: 78, G5: 79, A5: 81, B5: 83, D6: 86, Fs6: 90, A6: 93 };
const panLR = (p) => [Math.cos((p + 1) * Math.PI / 4), Math.sin((p + 1) * Math.PI / 4)];
function add(bus, t0, samples, gain = 1, pan = 0) {
  const [l, r] = panLR(pan), s0 = Math.round(t0 * SR);
  for (let i = 0; i < samples.length; i++) { const k = s0 + i; if (k < 0 || k >= N) continue; bus[0][k] += samples[i] * gain * l; bus[1][k] += samples[i] * gain * r; }
}
function render(dur, fn) { const n = Math.max(1, Math.round(dur * SR)), out = new Float32Array(n); for (let i = 0; i < n; i++) out[i] = fn(i / SR, i); return out; }
const env = (t, a, d, s, r, len) => (t < a ? t / a : t < a + d ? 1 - (1 - s) * (t - a) / d : t < len - r ? s : Math.max(0, s * (len - t) / r));
const expd = (t, tau) => Math.exp(-t / tau);
function onePoleLP(x, fc) { const a = Math.exp(-2 * Math.PI * fc / SR); let y = 0; const out = new Float32Array(x.length); for (let i = 0; i < x.length; i++) { y = (1 - a) * x[i] + a * y; out[i] = y; } return out; }
function onePoleHP(x, fc) { const lp = onePoleLP(x, fc); const out = new Float32Array(x.length); for (let i = 0; i < x.length; i++) out[i] = x[i] - lp[i]; return out; }
function biquadBP(x, f0, q) {
  const w = 2 * Math.PI * f0 / SR, al = Math.sin(w) / (2 * q), b0 = al, b2 = -al, a0 = 1 + al, a1 = -2 * Math.cos(w), a2 = 1 - al;
  const out = new Float32Array(x.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < x.length; i++) { const y = (b0 * x[i] + b2 * x2 - a1 * y1 - a2 * y2) / a0; x2 = x1; x1 = x[i]; y2 = y1; y1 = y; out[i] = y; }
  return out;
}
const noise = (n) => { const o = new Float32Array(n); for (let i = 0; i < n; i++) o[i] = rnd() * 2 - 1; return o; };

// ------------------------------------------------------------------ instrumentos
/** Marimba suave (FM com índice que cai): o timbre das notas e do motivo. */
const marimba = (f, len = 0.9, bright = 1) => render(len, (t) => { const idx = 1.6 * bright * expd(t, 0.06); return Math.sin(2 * Math.PI * f * t + idx * Math.sin(2 * Math.PI * f * 4 * t)) * expd(t, 0.28) * Math.min(1, t / 0.004) + 0.25 * Math.sin(2 * Math.PI * f * 2 * t) * expd(t, 0.12); });
/** Sino de vidro: sucesso, conclusão. */
const bell = (f, len = 1.6) => render(len, (t) => (Math.sin(2 * Math.PI * f * t + 0.9 * expd(t, 0.4) * Math.sin(2 * Math.PI * f * 3.5 * t)) * 0.8 + 0.2 * Math.sin(2 * Math.PI * f * 2.76 * t) * expd(t, 0.3)) * expd(t, 0.55) * Math.min(1, t / 0.003));
/** Pizzicato (Karplus–Strong): o "na ponta dos pés" do plano do nó. */
function pizz(f, len = 0.5) {
  const n = Math.round(len * SR), p = Math.max(2, Math.round(SR / f)), buf = noise(p).map((v) => v * 0.6), out = new Float32Array(n);
  for (let i = 0; i < n; i++) { const a = buf[i % p], b = buf[(i + 1) % p]; buf[i % p] = 0.5 * (a + b) * 0.994; out[i] = a * Math.min(1, i / 40); }
  return onePoleLP(out, 2600);
}
/** Pad quente: senos com harmônicos e desafinação leve; ataque/soltura lentos. */
function pad(freqs, len, { attack = 1.2, release = 1.4, bright = 0.3 } = {}) {
  return render(len, (t) => {
    let v = 0;
    for (const f of freqs) for (const d of [-0.0025, 0.0025]) { const ff = f * (1 + d), vib = 1 + 0.0018 * Math.sin(2 * Math.PI * 4.8 * t + f); v += Math.sin(2 * Math.PI * ff * vib * t) + bright * 0.35 * Math.sin(4 * Math.PI * ff * t) + bright * 0.12 * Math.sin(6 * Math.PI * ff * t); }
    return v / (freqs.length * 2.4) * env(t, attack, 0.1, 1, release, len);
  });
}
/** Piano elétrico (FM com índice que cai, trêmolo lento): os acordes do lofi do bar. */
const epiano = (freqs, len) => render(len, (t) => { let v = 0; for (const f of freqs) v += Math.sin(2 * Math.PI * f * t + 0.8 * Math.exp(-t / 0.35) * Math.sin(2 * Math.PI * f * t)) * Math.exp(-t / 1.8); return v / freqs.length * (1 + 0.16 * Math.sin(2 * Math.PI * 4.6 * t)) * Math.min(1, t / 0.006) * Math.min(1, Math.max(0, (len - t) / 0.15)); });
const bass = (f, len) => render(len, (t) => { const v = Math.sin(2 * Math.PI * f * t) + 0.18 * Math.sin(4 * Math.PI * f * t); return Math.tanh(v * 1.4) * env(t, 0.01, 0.2, 0.7, 0.12, len); });
const kick = () => render(0.32, (t) => Math.sin(2 * Math.PI * (45 * t + (120 - 45) * 0.045 * (1 - expd(t, 0.045)))) * expd(t, 0.11));
const rim = () => { const n = noise(Math.round(0.05 * SR)); return biquadBP(n, 1900, 3).map((v, i) => v * expd(i / SR, 0.012) * 2.2); };
const shaker = () => { const n = noise(Math.round(0.09 * SR)); return onePoleHP(n, 6500).map((v, i) => v * env(i / SR, 0.012, 0.02, 0.4, 0.05, 0.09)); };
/** O motivo da onda: três notas que sobem com portamento (a voz que "sai"). */
function motif(notes, gap = 0.18, len = 1.4, level = 1) {
  const total = gap * (notes.length - 1) + len;
  const fAt = (t) => { const k = Math.min(notes.length - 1, Math.floor(t / gap)); const u = Math.min(1, (t - k * gap) / 0.05); const a = midi(notes[Math.max(0, k - 1)] ?? notes[0]), b = midi(notes[k]); return k === 0 ? b : a + (b - a) * (u * u * (3 - 2 * u)); };
  let ph = 0, ph2 = 0;
  return render(total, (t) => { const f = fAt(t); ph += 2 * Math.PI * f / SR; ph2 += 2 * Math.PI * f * 2.001 / SR; const e = Math.min(1, t / 0.01) * expd(Math.max(0, t - gap * (notes.length - 1)), 0.55) * (0.85 + 0.15 * Math.sin(2 * Math.PI * 5.2 * t)); return (Math.sin(ph) * 0.8 + 0.25 * Math.sin(ph2)) * e * level; });
}

// ------------------------------------------------------------------ efeitos
const SFX = {
  knot: () => render(0.7, (t) => { const f = 520 - 180 * t + 40 * Math.sin(2 * Math.PI * 7 * t); return Math.sin(2 * Math.PI * f * t) * env(t, 0.03, 0.2, 0.5, 0.3, 0.7) * 0.5; }),
  tap: () => { const n = noise(Math.round(0.03 * SR)); return onePoleHP(n, 2500).map((v, i) => v * expd(i / SR, 0.004) * 0.9 + Math.sin(2 * Math.PI * 1250 * i / SR) * expd(i / SR, 0.012) * 0.5); },
  rung: () => render(0.22, (t) => Math.sin(2 * Math.PI * (880 + 600 * Math.min(1, t / 0.05)) * t) * expd(t, 0.06) * 0.55),
  chip: () => { const a = bell(midi(NOTE.A5), 0.9), b = bell(midi(NOTE.D6), 1.1), o = new Float32Array(a.length + Math.round(0.09 * SR)); a.forEach((v, i) => { o[i] += v * 0.45; }); b.forEach((v, i) => { const k = i + Math.round(0.09 * SR); if (k < o.length) o[k] += v * 0.45; }); return o; },
  result: () => { const ns = [NOTE.D5, NOTE.Fs5, NOTE.A5, NOTE.D6], o = new Float32Array(Math.round(2.2 * SR)); ns.forEach((m, k) => bell(midi(m), 1.8).forEach((v, i) => { const j = i + Math.round(k * 0.05 * SR); if (j < o.length) o[j] += v * 0.26; })); return o; },
  door: () => { const o = new Float32Array(Math.round(1.4 * SR)); [NOTE.A4, NOTE.D5, NOTE.Fs5].forEach((m, k) => marimba(midi(m), 0.9).forEach((v, i) => { const j = i + Math.round(k * 0.07 * SR); if (j < o.length) o[j] += v * 0.32; })); const air = onePoleLP(noise(o.length), 1800); for (let i = 0; i < o.length; i++) o[i] += air[i] * 0.05 * env(i / SR, 0.25, 0.1, 0.6, 0.8, 1.4); return o; },
  swoop: () => { const n = noise(Math.round(0.7 * SR)); const f = biquadBP(n, 900, 0.7); return f.map((v, i) => v * env(i / SR, 0.45, 0.05, 0.4, 0.2, 0.7) * 0.35); },
  untangle: () => { const len = 1.0, o = render(len, (t) => Math.sin(2 * Math.PI * (300 + 900 * t * t) * t) * env(t, 0.02, 0.1, 0.5, 0.25, len) * 0.22); const z = onePoleHP(noise(o.length), 3000); for (let i = 0; i < o.length; i++) o[i] += z[i] * 0.05 * env(i / SR, 0.3, 0.1, 0.7, 0.3, len); return o; },
  'motif-end': () => motif([NOTE.D5, NOTE.Fs5, NOTE.A5, NOTE.D6], 0.16, 2.4, 0.5),
  // abertura social: o "sonho" acende devagar; o corte para o balcão é seco e curto
  dream: () => { const len = 2.2, o = new Float32Array(Math.round(len * SR)); [NOTE.D6, NOTE.A5, NOTE.Fs6].forEach((m, k) => bell(midi(m), 1.6).forEach((v, i) => { const j = i + Math.round((0.15 + k * 0.22) * SR); if (j < o.length) o[j] += v * 0.16; })); const air = onePoleLP(noise(o.length), 2500); for (let i = 0; i < o.length; i++) o[i] += air[i] * 0.03 * env(i / SR, 0.6, 0.2, 0.6, 0.9, len); return o; },
  cut: () => { const n = noise(Math.round(0.12 * SR)); return onePoleLP(n, 900).map((v, i) => v * expd(i / SR, 0.03) * 0.9); },
  motif: () => motif([NOTE.D5, NOTE.Fs5, NOTE.A5], 0.16, 1.6, 0.42),
  // quiz: relógio (bloco de madeira), o último segundo mais agudo, "tempo!" e o pop dos textos
  tick: () => render(0.09, (t) => (Math.sin(2 * Math.PI * 1850 * t) * 0.8 + Math.sin(2 * Math.PI * 3700 * t) * 0.25) * expd(t, 0.014) * 0.8),
  tock: () => render(0.16, (t) => (Math.sin(2 * Math.PI * 2350 * t) * 0.8 + Math.sin(2 * Math.PI * 4700 * t) * 0.25) * expd(t, 0.03) * 0.9),
  buzz: () => onePoleLP(render(0.6, (t) => { const f = t < 0.24 ? 196 : 147; return (Math.sign(Math.sin(2 * Math.PI * f * t)) * 0.35 + Math.sin(2 * Math.PI * f * t) * 0.5) * env(t, 0.01, 0.05, 0.8, 0.15, 0.6) * 0.45; }), 1800),
  pop: () => render(0.14, (t) => Math.sin(2 * Math.PI * (520 + 1100 * t) * t) * expd(t, 0.035) * 0.55),
  // vlog: grilos (o silêncio constrangedor), "boing" do Tato aparecendo
  crickets: () => render(1.3, (t) => { const ph = t % 0.42, k = ph < 0.16 ? 0.5 - 0.5 * Math.cos(2 * Math.PI * ph / 0.16) : 0; const am = 0.5 + 0.5 * Math.sin(2 * Math.PI * 38 * t); return Math.sin(2 * Math.PI * (4400 + 120 * Math.sin(2 * Math.PI * 7 * t)) * t) * k * am * 0.22 * Math.min(1, (1.3 - t) / 0.2); }),
  boing: () => render(0.5, (t) => Math.sin(2 * Math.PI * (330 + 260 * Math.min(1, t / 0.08)) * t + 4 * Math.sin(2 * Math.PI * 14 * t) * expd(t, 0.2)) * expd(t, 0.18) * 0.5),
  // criadora: o disco arranha quando a música para, o "tum" da piada (saturado: o celular não toca
  // grave puro, só os harmônicos), o zoom de ênfase e o carimbo do "grátis"
  scratch: () => { let ph = 0; const n = noise(Math.round(0.34 * SR)); const o = render(0.34, (t, i) => { const k = t < 0.17 ? Math.sin(Math.PI * t / 0.17) : 0.65 * Math.sin(Math.PI * (t - 0.17) / 0.17); ph += (160 + 1250 * Math.abs(k)) / SR; return ((2 * (ph % 1) - 1) * 0.55 + n[i] * 0.45) * Math.abs(k); }); return biquadBP(o, 1300, 0.7); },
  thud: () => { let ph = 0; const z = onePoleLP(noise(Math.round(0.02 * SR)), 2500); return render(0.85, (t, i) => { ph += 2 * Math.PI * 55 * (1 + 1.8 * expd(t, 0.03)) / SR; return Math.tanh(2.4 * (Math.sin(ph) + 0.3 * Math.sin(2 * ph))) * expd(t, 0.28) * Math.min(1, t / 0.002) * 0.6 + (z[i] || 0) * expd(t, 0.006) * 0.5; }); },
  whoosh: () => { const n = noise(Math.round(0.32 * SR)); return biquadBP(n, 1500, 0.9).map((v, i) => v * env(i / SR, 0.16, 0.03, 0.5, 0.1, 0.32) * 0.5); },
  stamp: () => { const a = SFX.thud(), b = SFX.pop(); for (let i = 0; i < b.length; i++) a[i] += b[i] * 0.8; return a; },
};

// ------------------------------------------------------------------ vozes
function voiceStem() {
  for (const it of TL.audio.filter((a) => a.kind === 'voice')) {
    const file = path.join(root, it.file);
    if (!existsSync(file)) { console.warn('voz ausente', it.file); continue; }
    const { rate, samples } = readWav(require_(file));
    let x = rate === SR ? samples : resample(samples, rate, SR);
    x = onePoleHP(x, 85);
    // trecho de vlog: só [a, b] do arquivo, com 6 ms de rampa nas pontas (o corte não estala)
    if (it.clip) {
      const [ca, cb] = it.clip, i0 = Math.max(0, Math.round(ca * SR)), i1 = Math.min(x.length, Math.round(cb * SR));
      x = x.slice(i0, i1); const f = Math.round(0.006 * SR);
      for (let i = 0; i < f && i < x.length; i++) { const g = 0.5 - 0.5 * Math.cos(Math.PI * i / f); x[i] *= g; x[x.length - 1 - i] *= g; }
    }
    // nível de fala uniforme: RMS dos trechos com voz → −20 dBFS
    let s = 0, c = 0; for (const v of x) if (Math.abs(v) > 0.01) { s += v * v; c++; }
    const rms = Math.sqrt(s / Math.max(1, c)), g = 0.1 / Math.max(1e-4, rms) * (it.gain ?? 1);
    if (it.fx === 'inner') {
      // voz pensada: mais fechada e com uma cauda curta, para soar como pensamento e não como fala
      x = onePoleLP(x, 3400);
      const wet = new Float32Array(x.length + Math.round(0.6 * SR));
      for (const [d, a] of [[0.043, 0.32], [0.071, 0.24], [0.113, 0.18], [0.167, 0.12], [0.251, 0.08]]) { const k = Math.round(d * SR); for (let i = 0; i < x.length; i++) wet[i + k] += x[i] * a; }
      for (let i = 0; i < x.length; i++) wet[i] += x[i] * 0.85;
      x = wet;
    }
    add(voices, it.start, x, g * (it.fx === 'inner' ? 0.85 : 1), it.pan || 0);
  }
}
const require_ = (f) => readFileSyncCache.get(f) || (() => { const b = readFileSync(f); readFileSyncCache.set(f, b); return b; })();
import { readFileSync } from 'node:fs';
const readFileSyncCache = new Map();
function resample(x, from, to) { const n = Math.round(x.length * to / from), o = new Float32Array(n); for (let i = 0; i < n; i++) { const p = i * from / to, k = Math.floor(p), u = p - k; o[i] = (x[k] || 0) * (1 - u) + (x[k + 1] || 0) * u; } return o; }

// ------------------------------------------------------------------ música
const BEAT = 60 / 96, BAR = BEAT * 4;
const CHORDS = { D: [NOTE.D3, NOTE.A3, NOTE.Cs4, NOTE.E4, NOTE.Fs4], Bm: [NOTE.B2 + 12, NOTE.D4, NOTE.Fs4, NOTE.A4], G: [NOTE.G2 + 12, NOTE.B4 - 12, NOTE.D4, NOTE.Fs4], A: [NOTE.A2 + 12, NOTE.Cs4, NOTE.E4, NOTE.A4] };
const ROOT = { D: NOTE.D2, Bm: NOTE.B2 - 12, G: NOTE.G2, A: NOTE.A2 };
const PROG = ['D', 'Bm', 'G', 'A'];
function musicStem() {
  const sec = (TL.audio.find((a) => a.kind === 'cue' && a.name === 'music')?.sections) || [];
  const at = (name) => sec.find((s) => s[1] === name)?.[0];
  const next = (name) => { const i = sec.findIndex((s) => s[1] === name); return i >= 0 && sec[i + 1] ? sec[i + 1][0] : DUR; };
  const C = TL.cues || {};
  // pad do "Calma" até a resposta
  if (at('pad') != null) { const t0 = at('pad'), t1 = (at('lift') ?? next('pad')) + 0.6; add(music, t0, pad(CHORDS.D.map(midi), t1 - t0, { attack: 1.4, release: 1.0, bright: 0.25 }), 0.22); }
  // espaço da dica: notas soltas e baixas
  if (at('space') != null) { const t0 = at('space'), t1 = next('space'); for (let t = t0 + BEAT, k = 0; t < t1 - 0.2; t += BEAT * 2, k++) add(music, t, marimba(midi([NOTE.A4, NOTE.Fs4, NOTE.E4, NOTE.Fs4][k % 4]), 0.8, 0.6), 0.11, k % 2 ? 0.3 : -0.3); }
  // resposta: o motivo nasce das palavras do aluno
  const toGo = TL.audio.find((a) => a.kind === 'voice' && a.id === 'learnerToGo');
  if (toGo) {
    const v = VOICES.lines.learnerToGo; const words = v.words.map((w) => toGo.start + w.t);
    [NOTE.D5, NOTE.Fs5, NOTE.A5].forEach((m, k) => { if (words[k] != null) add(music, words[k] + 0.02, marimba(midi(m), 1.2, 0.9), 0.2, (k - 1) * 0.25); });
    if (at('lift') != null) { const t0 = at('lift') + 0.3, t1 = (at('world') ?? next('lift')) + 0.4; add(music, t0, pad([...CHORDS.G, NOTE.A4].map(midi), (t1 - t0) * 0.55, { attack: 0.5, release: 0.5, bright: 0.35 }), 0.2); add(music, t0 + (t1 - t0) * 0.5, pad(CHORDS.A.map(midi), (t1 - t0) * 0.55, { attack: 0.4, release: 0.6, bright: 0.35 }), 0.2); }
  }
  // mundo e portas: groove leve, 96 BPM, alinhado ao início do mundo
  const g0 = at('world'), g1 = at('pizz') ?? at('end') ?? DUR;
  if (g0 != null) {
    for (let b = 0, t = g0; t < g1 - 0.05; b++, t += BAR) {
      const ch = PROG[b % 4];
      add(music, t, pad(CHORDS[ch].map(midi), BAR + 0.3, { attack: 0.08, release: 0.3, bright: 0.4 }), 0.14);
      add(music, t, bass(midi(ROOT[ch]), BEAT * 1.6), 0.28); add(music, t + BEAT * 2, bass(midi(ROOT[ch]), BEAT * 1.2), 0.22); add(music, t + BEAT * 3.5, bass(midi(ROOT[ch] + 7), BEAT * 0.45), 0.16);
      for (let i = 0; i < 4; i++) { const tb = t + i * BEAT; if (tb >= g1) break; if (i % 2 === 0) add(music, tb, kick(), 0.42); else add(music, tb, rim(), 0.13, 0.15); add(music, tb + BEAT / 2, shaker(), 0.07, -0.2); add(music, tb, shaker(), 0.05, 0.2); }
      const arp = CHORDS[ch].slice(1).map((m) => m + 12);
      for (let i = 0; i < 8; i++) { const tb = t + i * BEAT / 2; if (tb >= g1) break; add(music, tb, marimba(midi(arp[(i * 3 + b) % arp.length]), 0.5, 0.7), 0.075, (i % 2 ? 0.35 : -0.35)); }
    }
  }
  // o nó: pizzicato na ponta dos pés; pausa no puxão; brilho quando solta
  if (at('pizz') != null) {
    const t0 = at('pizz'), t1 = at('end') ?? DUR, untie = TL.audio.find((a) => a.name === 'untangle')?.start ?? (t0 + 2);
    const seq = [NOTE.D4, NOTE.Fs4, NOTE.A4, NOTE.Fs4, NOTE.E4, NOTE.G4, NOTE.B4, NOTE.G4];
    for (let t = t0 + 0.25, k = 0; t < untie - 0.05; t += BEAT / 2, k++) add(music, t, pizz(midi(seq[k % seq.length]), 0.45), 0.34, k % 2 ? 0.2 : -0.2);
    add(music, untie + 0.55, pad([NOTE.D4, NOTE.Fs4, NOTE.A4, NOTE.D5].map(midi), 1.2, { attack: 0.05, release: 0.9, bright: 0.5 }), 0.12);
  }
  // quiz: groove de game show; nos cronômetros a bateria some e fica só um pedal grave (tensão),
  // e o compasso volta com bumbo na revelação
  if (at('quiz') != null) {
    const q = TL.audio.find((a) => a.kind === 'cue' && a.name === 'music');
    const QB = 60 / (q.bpm || 118), t0 = at('quiz'), t1 = at('end') ?? DUR, drops = q.drops || [];
    const inDrop = (t) => drops.some(([a, b]) => t >= a && t < b);
    for (let b = 0, t = t0; t < t1 - 0.05; b++, t += QB * 4) {
      const ch = PROG[b % 4], arp = CHORDS[ch].slice(1).map((m) => m + 12);
      for (let i = 0; i < 8; i++) {
        const tb = t + i * QB / 2; if (tb >= t1) break;
        if (inDrop(tb)) continue;
        if (i % 2 === 0) { const beat = i / 2; if (beat % 2 === 0) add(music, tb, kick(), 0.4); else add(music, tb, rim(), 0.15, 0.15); add(music, tb, bass(midi(ROOT[ch] + (beat === 3 ? 7 : 0)), QB * 0.85), 0.24); }
        add(music, tb, shaker(), 0.06, i % 2 ? -0.2 : 0.2);
        add(music, tb, marimba(midi(arp[(i * 3 + b) % arp.length]), 0.45, 0.7), 0.07, i % 2 ? 0.35 : -0.35);
      }
      if (!inDrop(t)) add(music, t, pad(CHORDS[ch].map(midi), QB * 4 + 0.2, { attack: 0.04, release: 0.25, bright: 0.45 }), 0.09);
    }
    for (const [a, b] of drops) {
      add(music, a, pad([NOTE.A2 + 12, NOTE.E4 - 12, NOTE.A4 - 12].map(midi), b - a + 0.1, { attack: 0.3, release: 0.15, bright: 0.2 }), 0.12);
      if (b < t1 - 0.1) add(music, b, kick(), 0.5);
    }
  }
  // vlog: batida leve de criadora (104 BPM), some nos "drops" (o silêncio da piada) e volta seca
  if (at('vlog') != null) {
    const q = TL.audio.find((a) => a.kind === 'cue' && a.name === 'music');
    const VB = 60 / (q.bpm || 104), t0 = at('vlog'), t1 = at('end') ?? DUR, drops = q.drops || [];
    const inDrop = (t) => drops.some(([a, b]) => t >= a - 0.02 && t < b);
    const prog = ['G', 'D', 'Bm', 'A'];
    for (let b = 0, t = t0; t < t1 - 0.05; b++, t += VB * 4) {
      const ch = prog[b % 4], arp = CHORDS[ch].slice(1).map((m) => m + 12);
      for (let i = 0; i < 8; i++) {
        const tb = t + i * VB / 2; if (tb >= t1 || inDrop(tb)) continue;
        if (i === 0 || i === 4 || i === 5) add(music, tb, kick(), i === 5 ? 0.22 : 0.34);
        if (i === 2 || i === 6) add(music, tb, rim(), 0.2, 0.1);
        add(music, tb, shaker(), 0.045, i % 2 ? -0.25 : 0.25);
        if (i % 2 === 0) add(music, tb, bass(midi(ROOT[ch] + (i === 6 ? 7 : 0)), VB * 0.8), 0.2);
        if (i !== 1 && i !== 5) add(music, tb, marimba(midi(arp[(i * 2 + b) % arp.length]), 0.4, 0.75), 0.055, i % 2 ? 0.3 : -0.3);
      }
      if (!inDrop(t)) add(music, t, pad(CHORDS[ch].map(midi), VB * 4 + 0.2, { attack: 0.05, release: 0.3, bright: 0.4 }), 0.07);
    }
  }
  // lofi: bar à noite (86 BPM, swing), piano elétrico em acordes de sétima que descem
  // (Gmaj7 · F♯m7 · Em7 · Dmaj7), baixo redondo, chiado de vinil; some nos "drops" da piada
  if (at('lofi') != null) {
    const q = TL.audio.find((a) => a.kind === 'cue' && a.name === 'music');
    const LB = 60 / (q.bpm || 86), t0 = at('lofi'), t1 = at('end') ?? DUR, drops = q.drops || [];
    const inDrop = (t) => drops.some(([a, b]) => t >= a - 0.02 && t < b);
    const CH = [[55, 59, 62, 66], [54, 57, 61, 64], [52, 55, 59, 62], [50, 54, 57, 61]], RT = [43, 42, 40, 38];
    for (let b = 0, t = t0; t < t1 - 0.05; b++, t += LB * 4) {
      const ch = CH[b % 4];
      for (let i = 0; i < 8; i++) {
        const beat = Math.floor(i / 2), tb = t + beat * LB + (i % 2 ? LB * 0.62 : 0);
        if (tb >= t1 || inDrop(tb)) continue;
        if (i % 2 === 0) {
          if (beat === 0 || (beat === 2 && b % 2)) add(music, tb, kick(), 0.3);
          if (beat === 1 || beat === 3) add(music, tb, rim(), 0.16, 0.1);
          add(music, tb, bass(midi(RT[b % 4] + (beat === 3 ? 7 : 0)), LB * 0.9), 0.17);
        }
        add(music, tb, shaker(), 0.032, i % 2 ? -0.25 : 0.25);
      }
      if (!inDrop(t)) add(music, t, epiano(ch.map(midi), LB * 4 + 0.3), 0.12);
      const tt = t + LB * 2.62; if (!inDrop(tt) && tt < t1) add(music, tt, epiano(ch.slice(1).map((m) => midi(m + 12)), LB * 1.2), 0.05, 0.2);
    }
    // vinil: estalos esparsos e chiado baixo, também no silêncio da piada (o "ar" do bar)
    const n = Math.round((t1 - t0) * SR), vin = new Float32Array(n), hiss = onePoleLP(noise(n), 5000);
    for (let i = 0; i < n; i++) vin[i] = hiss[i] * 0.006 + (rnd() < 0.00012 ? (rnd() * 2 - 1) * 0.35 : 0);
    add(music, t0, onePoleLP(vin, 7000), 1);
  }
  // convite: acorde cheio, motivo final, toque leve de bumbo e anel no fim
  if (at('end') != null) {
    const t0 = at('end'), len = DUR - t0;
    add(music, t0, pad([...CHORDS.D, NOTE.A4, NOTE.D5].map(midi), len, { attack: 0.6, release: Math.min(2.4, len * 0.5), bright: 0.35 }), 0.2);
    add(music, t0, bass(midi(NOTE.D2), len * 0.8), 0.2);
    add(music, t0 + 0.02, kick(), 0.3);
    const arp = [NOTE.D5, NOTE.Fs5, NOTE.A5, NOTE.E5];
    for (let i = 0, t = t0 + BEAT * 2; t < DUR - 2.4; i++, t += BEAT / 2) add(music, t, marimba(midi(arp[i % 4]), 0.6, 0.6), 0.06 * Math.min(1, (DUR - 2.4 - t) / 2), i % 2 ? 0.3 : -0.3);
  }
}

// ------------------------------------------------------------------ ambiência do café
function ambienceStem() {
  const a = TL.audio.find((x) => x.kind === 'cue' && x.name === 'ambience'); if (!a) return;
  const spans = [[a.start ?? 0, a.until ?? DUR]]; if (a.back != null) spans.push([a.back, a.backUntil ?? DUR]);
  for (const [t0, t1] of spans) {
    const len = t1 - t0, n = Math.round(len * SR);
    const murmur = biquadBP(onePoleLP(noise(n), 900), 380, 0.6);
    const chatter = biquadBP(noise(n), 1100, 3);
    const out = new Float32Array(n);
    for (let i = 0; i < n; i++) { const t = i / SR; const sway = 0.7 + 0.3 * Math.sin(2 * Math.PI * 0.23 * t + 1) * Math.sin(2 * Math.PI * 0.07 * t); const syl = 0.5 + 0.5 * Math.max(0, Math.sin(2 * Math.PI * 3.1 * t) * Math.sin(2 * Math.PI * 0.9 * t + 2)); out[i] = (murmur[i] * 2.2 * sway + chatter[i] * 0.35 * syl) * Math.min(1, t / 0.4, (len - t) / 0.6); }
    add(amb, t0, out, 0.5);
    // xícaras e colheres ao longe (posições com semente, nunca em cima de falas importantes)
    for (let t = t0 + 0.6; t < t1 - 0.4; t += 1.3 + rnd() * 2.2) add(amb, t, bell(2400 + rnd() * 1800, 0.5), 0.02 + rnd() * 0.02, rnd() * 1.6 - 0.8);
  }
}

// ------------------------------------------------------------------ montagem e mix
voiceStem(); musicStem(); ambienceStem();
// todo efeito entra com 2 ms de rampa (meio cosseno): um início em degrau é um clique de banda
// infinita, com pico entre amostras ~3 dB acima do pico das amostras (o "tap" fazia isso)
const softStart = (x) => { const r = Math.min(x.length, Math.round(0.002 * SR)); for (let i = 0; i < r; i++) x[i] *= 0.5 - 0.5 * Math.cos(Math.PI * i / r); return x; };
for (const it of TL.audio.filter((x) => x.kind === 'sfx')) { const f = SFX[it.name]; if (f) add(sfx, it.start, softStart(f(it)), it.gain ?? 0.5, it.pan ?? 0); }
// ducking: música e ambiência abaixam sob as vozes (envelope de 30 ms / 250 ms)
const venv = new Float32Array(N); { let e = 0; const at = Math.exp(-1 / (0.03 * SR)), rl = Math.exp(-1 / (0.25 * SR)); for (let i = 0; i < N; i++) { const x = Math.max(Math.abs(voices[0][i]), Math.abs(voices[1][i])); e = x > e ? at * e + (1 - at) * x : rl * e + (1 - rl) * x; venv[i] = e; } }
const mix = stem();
for (let i = 0; i < N; i++) {
  const duck = 1 / (1 + 6 * Math.min(1, venv[i] * 8));          // até ~ −17 dB quando a voz está cheia
  for (const ch of [0, 1]) mix[ch][i] = voices[ch][i] + music[ch][i] * (0.35 + 0.65 * duck) * 0.9 + amb[ch][i] * (0.5 + 0.5 * duck) * 0.55 + sfx[ch][i] * 0.8;
}
// loudness: mede (FFmpeg, EBU R128) e ajusta para −15 LUFS; depois limitador de pico verdadeiro
const outDir = path.join(here, 'out', cut);
await mkdir(outDir, { recursive: true });
function wav24(chs, file) {
  const n = chs[0].length, b = Buffer.alloc(44 + n * 6);
  b.write('RIFF', 0); b.writeUInt32LE(36 + n * 6, 4); b.write('WAVE', 8); b.write('fmt ', 12); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(2, 22); b.writeUInt32LE(SR, 24); b.writeUInt32LE(SR * 6, 28); b.writeUInt16LE(6, 32); b.writeUInt16LE(24, 34); b.write('data', 36); b.writeUInt32LE(n * 6, 40);
  for (let i = 0, o = 44; i < n; i++) for (const ch of chs) { const v = Math.max(-1, Math.min(1, ch[i])) * 8388607; b.writeIntLE(Math.round(v), o, 3); o += 3; }
  return writeFile(file, b);
}
function lufs(file) {
  const r = spawnSync(ffmpegPath, ['-hide_banner', '-nostats', '-i', file, '-af', 'ebur128=peak=true', '-f', 'null', '-'], { encoding: 'utf8' });
  const s = r.stderr || ''; const I = [...s.matchAll(/I:\s+(-?[\d.]+) LUFS/g)].pop(); const P = [...s.matchAll(/Peak:\s+(-?[\d.]+) dBFS/g)].pop();
  return { I: I ? +I[1] : NaN, TP: P ? +P[1] : NaN };
}
function limiter(chs, ceiling) {
  const n = chs[0].length, look = Math.round(0.0015 * SR), rel = Math.exp(-1 / (0.08 * SR));
  const peak = new Float32Array(n);
  for (let i = 0; i < n; i++) { let p = 0; for (const ch of chs) { const a = ch[i], b = ch[i + 1] ?? a; for (let k = 0; k <= 4; k++) p = Math.max(p, Math.abs(a + (b - a) * k / 4)); } peak[i] = p; }
  const gain = new Float32Array(n); let g = 1;
  for (let i = n - 1; i >= 0; i--) { let m = 0; for (let k = 0; k < look && i + k < n; k++) m = Math.max(m, peak[i + k]); const need = m > ceiling ? ceiling / m : 1; g = need < g ? need : rel * g + (1 - rel) * need; gain[i] = g; }
  // segunda passada para frente (ataque suave)
  let h = 1; for (let i = 0; i < n; i++) { h = gain[i] < h ? gain[i] : rel * h + (1 - rel) * gain[i]; for (const ch of chs) ch[i] *= h; }
}
for (const [name, chs] of [['voices', voices], ['music', music], ['ambience', amb], ['sfx', sfx]]) await wav24(chs, path.join(outDir, `${name}.wav`));
const tmp = path.join(outDir, 'mix-pre.wav');
await wav24(mix, tmp);
const m0 = lufs(tmp);
// --gain-from adA: usa o MESMO ganho de outro corte (ganchos B/C emendam no corpo do A sem degrau de nível)
const gainFrom = opt('--gain-from', null);
const target = -15, gain = gainFrom ? 10 ** (JSON.parse(await readFile(path.join(here, 'out', gainFrom, 'loudness.json'), 'utf8')).gainDb / 20) : 10 ** ((target - m0.I) / 20);
for (const ch of mix) for (let i = 0; i < N; i++) ch[i] *= gain;
// O detector do limitador interpola reto entre amostras; efeitos sintéticos muito agudos têm
// picos ENTRE amostras que ele não vê. Então o laço fecha no medidor de pico verdadeiro do
// FFmpeg (EBU R128, 4× sobreamostrado): passou de −2,0 dBTP (folga para o AAC, que soma alguns décimos), refaz do zero com teto menor.
const preLimit = mix.map((ch) => Float32Array.from(ch));
let ceilingDb = -1.8, m1;
for (let pass = 1; ; pass++) {
  mix.forEach((ch, k) => ch.set(preLimit[k]));
  limiter(mix, 10 ** (ceilingDb / 20));
  await wav24(mix, path.join(outDir, 'mix.wav'));
  m1 = lufs(path.join(outDir, 'mix.wav'));
  if (m1.TP <= -2.0 || pass >= 6) break;
  ceilingDb -= (m1.TP + 2.0) + 0.2;
}
m1.ceilingDb = +ceilingDb.toFixed(2);
console.log(`${cut}: pré ${m0.I.toFixed(1)} LUFS → ganho ${(20 * Math.log10(gain)).toFixed(1)} dB → mix ${m1.I.toFixed(1)} LUFS, pico verdadeiro ${m1.TP.toFixed(1)} dBTP (${(DUR).toFixed(2)} s) → ${path.relative(process.cwd(), outDir)}`);
await writeFile(path.join(outDir, 'loudness.json'), JSON.stringify({ cut, measuredBefore: m0, gainDb: 20 * Math.log10(gain), mix: m1, target: { I: -15, TP: -2.0 }, voiceSet: VOICES.set, provisional: VOICES.provisional }, null, 1));
