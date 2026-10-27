// Boca pela fala: cada palavra (com início/fim medidos em audio/analyze-voices.mjs)
// vira uma sequência de visemas por grupos de letras; a abertura ainda é modulada
// pelo envelope real da voz naquele instante (energia), sem substituir a forma.
// Cinco formas, como o rig do produto (character-motion.js → VISEMES).
const norm = (w) => w.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z]/g, '');
const GROUPS = [
  [/^(ou|oo|ow|ao|au|o|u|w)/, 'O'],
  [/^(ai|ay|a)/, 'A'],
  [/^(ee|ea|ei|ey|e|i|y)/, 'E'],
  [/^(m|b|p)/, 'M'],
  [/^(f|v)/, 'F'],
  [/^(th|sh|ch|ph|ck|ng|[a-z])/, 'C'],
];
function letters(word) {
  const out = []; let w = norm(word);
  if (/^ph/.test(w)) w = 'f' + w.slice(2);
  while (w.length) {
    for (const [re, v] of GROUPS) { const m = w.match(re); if (m) { out.push(v); w = w.slice(m[0].length); break; } }
  }
  // consoantes juntas viram uma só batida; a última vogal manda no fim da palavra
  return out.filter((v, i) => !(v === 'C' && out[i - 1] === 'C'));
}

/** [[t, viseme], …] em segundos do arquivo de voz (palavras com t/e). */
export function visemeKeys(words, { from = 0 } = {}) {
  const keys = [];
  for (const { w, t, e } of words) {
    const seq = letters(w); if (!seq.length) continue;
    const dur = Math.max(0.08, e - t), step = dur / seq.length;
    seq.forEach((v, i) => keys.push([from + t + i * step, v]));
    keys.push([from + e - Math.min(0.05, step * 0.3), seq[seq.length - 1]]);
    keys.push([from + e + 0.06, 'M']);
  }
  return keys.sort((a, b) => a[0] - b[0]);
}

// Formas para o rig dos moradores (mesmos números de character-motion.js).
export const RIG_MOUTH = {
  M: { t: 'line', curve: 0.1, w: 0.9, open: 0 },
  A: { t: 'open', open: 0.55, curve: 0.25, w: 1.0 },
  E: { t: 'open', open: 0.3, curve: 0.4, w: 1.15 },
  O: { t: 'o', open: 0.6, w: 0.55 },
  F: { t: 'open', open: 0.18, curve: 0.2, w: 0.85 },
  C: { t: 'open', open: 0.32, curve: 0.3, w: 0.95 },
};
// Para o Tato: [abertura, largura] nos canais do motor (mouth .06–1.45, wide −.5–.8).
export const TATO_MOUTH = { M: [0.08, 0.05], A: [1.12, 0.22], E: [0.62, 0.55], O: [0.82, -0.42], F: [0.28, 0.12], C: [0.48, 0.18] };

/** Envelope (100 Hz, a partir de `on` do arquivo) → nível 0..1 em t (segundos do arquivo). */
export function envAt(voice, t) {
  if (!voice?.env?.length) return 0;
  const x = (t - voice.on) * 100; if (x < 0 || x >= voice.env.length - 1) return 0;
  const i = Math.floor(x), k = x - i; return voice.env[i] * (1 - k) + voice.env[i + 1] * k;
}

/** Visemas do Tato prontos para o motor: [[t, abertura, largura], …] no tempo do filme. */
export function tatoSpeech(voice, start) {
  const keys = visemeKeys(voice.words, { from: start - voice.on });
  return keys.map(([t, v]) => { const [o, w] = TATO_MOUTH[v]; const lvl = envAt(voice, t - start + voice.on); return [t, v === 'M' ? o : o * (0.55 + 0.45 * Math.min(1, lvl * 1.4)), w]; });
}

/** Boca do morador em t (tempo do filme) para uma fala que começa em `start`. */
export function residentMouth(voice, start, t, amp = 0.85) {
  const local = t - start + voice.on;
  if (local < voice.on - 0.05 || local > voice.off + 0.12) return null;
  const keys = visemeKeys(voice.words);
  let cur = keys[0]; for (const k of keys) { if (k[0] <= local) cur = k; else break; }
  const shape = { ...RIG_MOUTH[cur?.[1] || 'M'] };
  const lvl = envAt(voice, local);
  if (shape.open != null) shape.open = shape.open * amp * (0.5 + 0.5 * Math.min(1, lvl * 1.5));
  return shape;
}
