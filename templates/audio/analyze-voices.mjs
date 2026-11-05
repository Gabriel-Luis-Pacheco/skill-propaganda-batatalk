// Mede cada fala (envelope, início/fim da voz, pausas internas e tempos estimados
// de palavra) e grava generated/voices.json + generated/voices.js, que o filme e a
// trilha leem. Nenhum tempo do filme é digitado à mão: tudo sai daqui.
//
//   node v8-publica/audio/analyze-voices.mjs [--set rehearsal|final]
//
// Tempos de palavra: quando existe audio/voices/<set>/<id>.words.json (por exemplo,
// vindo de uma transcrição com timestamps), ele é usado. Sem isso, as palavras são
// distribuídas pelos trechos com voz, proporcionais às sílabas, e o início de cada
// uma é puxado para o ataque de energia mais próximo. É uma estimativa: serve para
// visemas e cortes, não substitui alinhamento fonético.
import { readFile, writeFile, mkdir, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const set = opt('--set', existsSync(path.join(here, 'voices', 'final')) ? 'final' : existsSync(path.join(here, 'voices', 'rehearsal-fit')) ? 'rehearsal-fit' : 'rehearsal');

// Texto de cada fala (o que o personagem diz) e quem diz. Uma fonte só.
export const LINES = {
  soraAsk:       { who: 'sora',    lang: 'en', text: 'For here or to go?' },
  learnerUh:     { who: 'learner', lang: 'pt', text: 'Uh…' },
  learnerToGo:   { who: 'learner', lang: 'en', text: 'To go, please.' },
  soraReact:     { who: 'sora',    lang: 'en', text: 'Perfect. Coming right up!' },
  evelynAsk:     { who: 'evelyn',  lang: 'en', text: 'How long will you be staying?' },
  priyaAsk:      { who: 'priya',   lang: 'en', text: 'Tell me a little about yourself.' },
  learnerThink:  { who: 'learner', lang: 'en', text: 'To go, please! Extra hot, thanks!' },
  learnerThinkShort: { who: 'learner', lang: 'en', text: 'To go, please!' },
  tatoCalma:     { who: 'tato',    lang: 'pt', text: 'Calma. Aqui é treino.' },
  tatoDesenrolo: { who: 'tato',    lang: 'pt', text: 'Se enrolar, eu desenrolo.' },
  tatoBora:      { who: 'tato',    lang: 'pt', text: 'Bora de novo?' },
  tatoCTA:       { who: 'tato',    lang: 'pt', text: 'BataTalk. Comece grátis.' },
  tatoTreino:    { who: 'tato',    lang: 'pt', text: 'Ainda bem que aqui é treino.' },
  tatoTravou:    { who: 'tato',    lang: 'pt', text: 'Travou? O Tato ajuda.' },
  tatoPratique:  { who: 'tato',    lang: 'pt', text: 'BataTalk. Pratique inglês falando.' },
  tatoQuiz:      { who: 'tato',    lang: 'pt', text: 'Quiz de inglês! Três perguntas pra testar seu nível.' },
  minaHook: { who: 'mina', lang: 'pt', text: 'Gente. Lançaram um site pra treinar inglês falando… e eu só descubro agora?' },
  minaDezAnos: { who: 'mina', lang: 'pt', text: 'Dez anos estudando inglês. Entendo série sem legenda. Aí o barista pergunta isso:' },
  minaPraIsso: { who: 'mina', lang: 'pt', text: 'Dez anos. Pra isso.' },
  minaTreina: { who: 'mina', lang: 'pt', text: 'No BataTalk você treina essa conversa antes. Em voz alta, com o barista, com a oficial da imigração…' },
  minaSeTravar: { who: 'mina', lang: 'pt', text: 'E se travar…' },
  minaSopra: { who: 'mina', lang: 'pt', text: 'Ele sempre aparece. Sopra uma dica, e quem responde é você.' },
  minaGratis: { who: 'mina', lang: 'pt', text: 'São catorze cidades, e dá pra começar de graça. Sem cartão, direto no navegador.' },
  minaCTA: { who: 'mina', lang: 'pt', text: 'batatalk.com.br. Comenta aí a pergunta que te trava. A minha você já viu.' },
  // esquete do bar (Priya e June)
  barP1: { who: 'priya', lang: 'pt', text: 'Ai, amiga… eu queria tanto falar inglês direito.' },
  barJ1: { who: 'june', lang: 'pt', text: 'E por que não fala?' },
  barP2: { who: 'priya', lang: 'pt', text: 'Eu leio. Eu escrevo. Mas na hora de falar… trava tudo.' },
  barJ2: { who: 'june', lang: 'pt', text: 'Então fala alguma coisa aí.' },
  barP3: { who: 'priya', lang: 'en', text: 'The book is on the table.' },
  barJ3: { who: 'june', lang: 'pt', text: 'Amiga.' },
  barP4: { who: 'priya', lang: 'pt', text: 'Eu sei.' },
  barJ4: { who: 'june', lang: 'pt', text: 'Treina no BataTalk.' },
  barP5: { who: 'priya', lang: 'pt', text: 'No quê?' },
  barJ5: { who: 'june', lang: 'pt', text: 'É um site. Você treina conversa em voz alta: no café, no aeroporto… E se travar, uma batata te ajuda.' },
  barP6: { who: 'priya', lang: 'pt', text: 'Uma batata.' },
  barJ6: { who: 'june', lang: 'pt', text: 'Confia.' },
  barP7: { who: 'priya', lang: 'pt', text: 'Éé… peraí.' },
  barP8: { who: 'priya', lang: 'en', text: 'To go, please!' },
  barP9: { who: 'priya', lang: 'pt', text: 'Amiga! Eu falei!' },
  barJ7: { who: 'june', lang: 'pt', text: 'Falou.' },
  barJ8: { who: 'june', lang: 'pt', text: 'batatalk.com.br. Dá pra começar de graça.' },
  // "ao pé da letra na imigração" (27/10): Mina na imigração do Bata Airport, Evelyn é a oficial
  imeE1: { who: 'evelyn', lang: 'en', text: "Who's paying for your trip?" },
  imeM1: { who: 'mina', lang: 'en', text: 'My friends made a little cow!' },
  imeE2: { who: 'evelyn', lang: 'en', text: 'A cow.' },
  imeE3: { who: 'evelyn', lang: 'en', text: 'Do you plan to work here?' },
  imeM2: { who: 'mina', lang: 'en', text: 'No, no… I took my little horse out of the rain.' },
  imeE4: { who: 'evelyn', lang: 'en', text: 'And a horse.' },
  imeE5: { who: 'evelyn', lang: 'en', text: 'And your job back home?' },
  imeM3: { who: 'mina', lang: 'en', text: 'I kicked the bucket!' },
  imeE6: { who: 'evelyn', lang: 'en', text: 'You… died?' },
  imeM4: { who: 'mina', lang: 'pt', text: 'Pera… o quê?!' },
  imeT1: { who: 'tato', lang: 'pt', text: 'Kick the bucket é morrer! Fala: I quit my job.' },
  imeM5: { who: 'mina', lang: 'en', text: 'I quit my job!' },
  imeE7: { who: 'evelyn', lang: 'en', text: 'Welcome to Batata City.' },
  imeM6: { who: 'mina', lang: 'pt', text: 'E você, ia traduzir qual?' },
  imeE8: { who: 'evelyn', lang: 'en', text: 'Next!' },
  // "stand-up dos falsos amigos" (27/10): o Jax no palco
  sJ1: { who: 'jax', lang: 'pt', text: 'Minha namorada gringa provou a feijoada da minha mãe… e falou: Exquisite!' },
  sJ2: { who: 'jax', lang: 'pt', text: 'Minha mãe tirou o prato.' },
  sJ3: { who: 'jax', lang: 'pt', text: 'Ela, nervosa: I love novels!' },
  sJ4: { who: 'jax', lang: 'pt', text: 'Novela?! Senta aqui, minha filha.' },
  sJ5: { who: 'jax', lang: 'pt', text: 'Devolveu o prato. Com farofa.' },
  sJ6: { who: 'jax', lang: 'pt', text: 'Aí minha mãe: pergunta se ela pretende casar com você!' },
  sJ7: { who: 'jax', lang: 'pt', text: 'Eu traduzi: Do you pretend to marry me?' },
  sJ8: { who: 'jax', lang: 'pt', text: 'Tipo… pro visto?' },
  sJ9: { who: 'jax', lang: 'pt', text: 'Minha mãe tirou o prato… e a panela.' },
  sJ10: { who: 'jax', lang: 'pt', text: 'Hoje eu treino antes, no BataTalk. Em voz alta. E quando eu travo, uma batata me sopra uma dica.' },
  sJ11: { who: 'jax', lang: 'pt', text: 'Fala isso pra minha mãe.' },
  sT1: { who: 'tato', lang: 'pt', text: 'E exquisite é elogio, tá?' },
  // stand-up v3 (28/10): blocos corridos do gpt-audio-1.5 (voz cedar), cortados nos respiros
  sv3a: { who: 'jax', lang: 'pt', text: 'Eu estudei inglês sete anos na escola. Sete anos. Primeiro dia de intercâmbio, na porta da escola: PUSH. Meu cérebro leu: puxe. Puxei. Puxei com força. Puxei com fé. Aí veio uma criança de seis anos… e empurrou. Com um dedo.' },
  sv3b: { who: 'jax', lang: 'pt', text: 'Na entrevista de emprego, eu arrasei: I pretend to work here for many years. Pretend é fingir. Eu prometi, olhando no olho do cara, que ia fingir que trabalho. Fui contratado. Pra gerente.' },
  sv3c: { who: 'jax', lang: 'pt', text: 'Hoje eu treino antes, num site. Quando eu travo, aparece uma batata pra me ajudar. Uma batata, gente. E o danado fala inglês melhor que eu.' },
  // "Dia 1, dia 10, dia 100, dia 1000" (03/11): gpt-audio-1.5, uma fala por pedido
  diaSoraQ: { who: 'sora', lang: 'en', text: 'For here or to go?' },
  diaSoraQ2: { who: 'sora', lang: 'en', text: 'For here or to go?' },
  diaSoraCut: { who: 'sora', lang: 'en', text: 'For here or—' },
  diaSoraReact: { who: 'sora', lang: 'en', text: 'Perfect. Coming right up!' },
  diaSoraGosto: { who: 'sora', lang: 'en', text: 'Finally, someone with taste!' },
  diaSoraFor: { who: 'sora', lang: 'en', text: 'For here?' },
  diaMinaA: { who: 'mina', lang: 'en', text: 'T-to go…?' },
  diaMinaPt: { who: 'mina', lang: 'pt', text: 'Eu sobrevivi.' },
  diaMinaDez: { who: 'mina', lang: 'en', text: 'To go, please.' },
  diaMinaCem: { who: 'mina', lang: 'en', text: 'To go, extra hot! Love the new playlist!' },
  diaMinaMil: { who: 'mina', lang: 'en', text: 'For here.' },
  diaMinaFim: { who: 'mina', lang: 'pt', text: 'O difícil foi o dia um.' },
  diaTatoSopra: { who: 'tato', lang: 'en', text: 'To go! To go!' },
  diaTatoDez: { who: 'tato', lang: 'pt', text: 'Dia dez.' },
  diaTatoCem: { who: 'tato', lang: 'pt', text: 'Dia cem.' },
  diaTatoMil: { who: 'tato', lang: 'pt', text: 'Dia mil.' },
  diaTatoSeu: { who: 'tato', lang: 'pt', text: 'E o seu dia um?' },
  diaTatoCTA: { who: 'tato', lang: 'pt', text: 'BataTalk. Comece grátis.' },
  // "E se você treinasse inglês todo dia?" v10 (04/11)
  dzV4: { who: 'vera', lang: 'pt', text: 'Cala a boca, Caio!' },
  dzN0: { who: 'tato', lang: 'pt', text: "E se você falasse inglês todo dia?" },
  dzV3: { who: 'vera', lang: 'en', text: "Shut up, Caio!" },
  dzC6: { who: 'cam', lang: 'en', text: "…thank you!" },
  dzC1: { who: 'cam', lang: 'en', text: "Hello…" },
  dzA1: { who: 'app', lang: 'pt', text: "Mais alto!" },
  dzC2: { who: 'cam', lang: 'en', text: "Hello!" },
  dzC3: { who: 'cam', lang: 'en', text: "How are you? I'm fine, thank you! And you?" },
  dzV1: { who: 'vera', lang: 'pt', text: "…Cansada." },
  dzC4: { who: 'cam', lang: 'en', text: "Hey… what's up…" },
  dzV2: { who: 'vera', lang: 'en', text: "Not much. You?" },
  dzA2: { who: 'app', lang: 'pt', text: "Perfeito!" },
  dzB1: { who: 'dante', lang: 'pt', text: "Moço, a rodoviária?" },
  dzB2: { who: 'dante', lang: 'pt', text: "…Moço, eu falo português." },
  dzN1: { who: 'nia', lang: 'pt', text: "Fala inglês aí, Caio!" },
  dzM1: { who: 'malik', lang: 'pt', text: "Mais alto!" },
  // "E se o Cam treinasse inglês todo dia?" (03/11)
  camN1: { who: 'tato', lang: 'pt', text: "E se o Cam treinasse inglês todo dia?" },
  camC1: { who: 'cam', lang: 'pt', text: "Vou baixar um app de inglês. Segunda eu começo." },
  camN2: { who: 'tato', lang: 'pt', text: "E baixou. Na hora." },
  camN3: { who: 'tato', lang: 'pt', text: "Dia um. O app pediu pra falar em voz alta. Ele foi pro armário." },
  camC2: { who: 'cam', lang: 'en', text: "Hello?" },
  camN4: { who: 'tato', lang: 'pt', text: "O app soltou confete. Ele chorou." },
  camN5: { who: 'tato', lang: 'pt', text: "Dia dez. Já treinava no chuveiro." },
  camV1: { who: 'vera', lang: 'pt', text: "Tá tudo bem aí?" },
  camC3: { who: 'cam', lang: 'en', text: "I'm fine, thank you! And you?" },
  camV2: { who: 'vera', lang: 'pt', text: "Vou chamar o síndico." },
  camN6: { who: 'tato', lang: 'pt', text: "Dia cem. Sonhou em inglês. Com legenda." },
  camN7: { who: 'tato', lang: 'pt', text: "Um gringo perdido pediu o caminho." },
  camT1: { who: 'dante', lang: 'en', text: "Excuse me, bus station?" },
  camC4: { who: 'cam', lang: 'en', text: "Go straight, then left at the bakery!" },
  camT2: { who: 'dante', lang: 'pt', text: "Cara, eu sou de Cascavel." },
  camN8: { who: 'tato', lang: 'pt', text: "Ele saiu andando igual quem ganhou a Copa." },
  camN9: { who: 'tato', lang: 'pt', text: "Dia mil. Ele ainda erra." },
  camC5: { who: 'cam', lang: 'en', text: "I have twenty-six years!" },
  camN10: { who: 'tato', lang: 'pt', text: "Só que agora ele ri junto." },
  camN11: { who: 'tato', lang: 'pt', text: "Dia dez mil. Ele ainda foi pro armário." },
  camN12: { who: 'tato', lang: 'pt', text: "E chorou com o confete." },
  // "A confiança do gringo" (28/10): gpt-audio-1.5, uma fala por pedido (vozes do produto: Sora echo, Dante ash)
  cfS1: { who: 'sora', lang: 'en', text: 'Hi! What can I get you?' },
  cfM1: { who: 'mina', lang: 'en', text: 'Hi! Can I get an iced latte with oat milk and a croissant, please?' },
  cfM2: { who: 'mina', lang: 'en', text: 'Sorry, my English is so bad…' },
  cfS2: { who: 'sora', lang: 'en', text: "It's… perfect?" },
  cfD1: { who: 'dante', lang: 'pt', text: 'Oi! Eu querer… pão de queijo. Obrigado!' },
  cfP1: { who: 'priya', lang: 'pt', text: 'Gente, ele fala português!' },
  cfD2: { who: 'dante', lang: 'pt', text: 'Fluente.' },
  cfT1: { who: 'tato', lang: 'pt', text: 'Você fala melhor que ele.' },
  cfM3: { who: 'mina', lang: 'en', text: 'I know.' },
};

export function readWav(buf) {
  if (buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WAVE') throw new Error('not a WAV');
  let off = 12, fmt = null, data = null;
  while (off + 8 <= buf.length) {
    const id = buf.toString('ascii', off, off + 4), size = buf.readUInt32LE(off + 4);
    if (id === 'fmt ') fmt = { format: buf.readUInt16LE(off + 8), channels: buf.readUInt16LE(off + 10), rate: buf.readUInt32LE(off + 12), bits: buf.readUInt16LE(off + 22) };
    if (id === 'data') { data = buf.subarray(off + 8, off + 8 + size); break; }
    off += 8 + size + (size % 2);
  }
  if (!fmt || !data) throw new Error('WAV without fmt/data');
  const { channels, rate, bits, format } = fmt, frames = Math.floor(data.length / (channels * bits / 8));
  const out = new Float32Array(frames);
  for (let i = 0; i < frames; i++) {
    let v = 0;
    for (let c = 0; c < channels; c++) {
      const p = (i * channels + c) * bits / 8;
      v += format === 3 ? data.readFloatLE(p) : bits === 16 ? data.readInt16LE(p) / 32768 : bits === 24 ? (data.readIntLE(p, 3) / 8388608) : data.readInt32LE(p) / 2147483648;
    }
    out[i] = v / channels;
  }
  return { rate, samples: out };
}

/** Altura da voz (f0, mediana em Hz) nos quadros de 10 ms com voz — autocorrelação a ~16 kHz.
 *  Só documenta o elenco (quem soa grave/agudo); não entra em nenhum tempo do filme. */
export function medianF0({ rate, samples }, frames) {
  const f = Math.max(1, Math.round(rate / 16000)), r = rate / f;
  const x = new Float32Array(Math.floor(samples.length / f));
  for (let i = 0; i < x.length; i++) { let s = 0; for (let k = 0; k < f; k++) s += samples[i * f + k]; x[i] = s / f; }
  const win = Math.round(r * 0.04), lo = Math.floor(r / 400), hi = Math.ceil(r / 60), hop = r / 100, out = [];
  for (const k of frames) {
    const a = Math.round(k * hop); if (a + win + hi >= x.length) continue;
    let e0 = 0; for (let i = 0; i < win; i++) e0 += x[a + i] * x[a + i];
    if (e0 <= 1e-9) continue;
    const c = new Float32Array(hi + 1);
    let best = 0;
    for (let L = lo; L <= hi; L++) { let s = 0, e1 = 0; for (let i = 0; i < win; i++) { s += x[a + i] * x[a + i + L]; e1 += x[a + i + L] * x[a + i + L]; } c[L] = s / Math.sqrt(e0 * e1 || 1); if (c[L] > best) best = c[L]; }
    if (best < 0.6) continue;
    // o primeiro pico perto do máximo (evita escolher o dobro do período)
    let lag = 0; for (let L = lo + 1; L < hi; L++) if (c[L] >= 0.9 * best && c[L] >= c[L - 1] && c[L] >= c[L + 1]) { lag = L; break; }
    if (lag) out.push(r / lag);
  }
  out.sort((p, q) => p - q);
  return out.length ? Math.round(out[Math.floor(out.length / 2)]) : null;
}

const syllables = (w) => Math.max(1, (w.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').match(/[aeiouy]+/g) || []).length);

export function analyze({ rate, samples }, text) {
  const hop = Math.round(rate / 100), n = Math.floor(samples.length / hop);
  const env = new Float32Array(n);
  for (let k = 0; k < n; k++) { let s = 0; for (let i = k * hop; i < (k + 1) * hop; i++) s += samples[i] * samples[i]; env[k] = Math.sqrt(s / hop); }
  const peak = Math.max(...env) || 1e-6, thr = peak * 0.06;
  let on = env.findIndex((v) => v > thr); if (on < 0) on = 0;
  let off = n - 1; while (off > on && env[off] <= thr) off--;
  // trechos com voz (pausas internas > 90 ms separam)
  const spans = []; let a = null, quiet = 0;
  for (let k = on; k <= off; k++) {
    if (env[k] > thr) { if (a === null) a = k; quiet = 0; }
    else if (a !== null && ++quiet > 9) { spans.push([a, k - quiet]); a = null; quiet = 0; }
  }
  if (a !== null) spans.push([a, off]);
  // ataques: subida de energia
  const onsets = [];
  for (let k = on + 2; k <= off; k++) if (env[k] > thr * 1.6 && env[k] - env[k - 2] > peak * 0.12) { onsets.push(k); k += 6; }
  const words = String(text).replace(/[“”"]/g, '').split(/\s+/).filter(Boolean);
  const syl = words.map(syllables), total = syl.reduce((x, y) => x + y, 0);
  const voiced = spans.reduce((s, [x, y]) => s + (y - x + 1), 0) || 1;
  // posição de cada palavra no "tempo com voz", depois volta para o tempo real
  const toReal = (v) => { let acc = 0; for (const [x, y] of spans) { const len = y - x + 1; if (v <= acc + len) return x + (v - acc); acc += len; } return off; };
  let cum = 0;
  const timed = words.map((w, i) => {
    const s0 = toReal(voiced * (cum / total)); cum += syl[i]; const s1 = toReal(voiced * (cum / total));
    const near = onsets.reduce((best, o) => Math.abs(o - s0) < Math.abs(best - s0) ? o : best, Math.round(s0));
    const start = Math.abs(near - s0) < 12 ? near : s0;
    return { w, t: +(start / 100).toFixed(3), e: +(s1 / 100).toFixed(3) };
  });
  for (let i = 0; i + 1 < timed.length; i++) timed[i].e = Math.min(timed[i].e, timed[i + 1].t);
  const voicedFrames = []; for (let k = on; k <= off; k++) if (env[k] > thr * 2) voicedFrames.push(k);
  return {
    duration: +(samples.length / rate).toFixed(3), on: +(on / 100).toFixed(3), off: +((off + 1) / 100).toFixed(3),
    f0: medianF0({ rate, samples }, voicedFrames),
    spans: spans.map(([x, y]) => [+(x / 100).toFixed(2), +((y + 1) / 100).toFixed(2)]),
    words: timed, peak: +peak.toFixed(4),
    env: Array.from(env.slice(on, off + 1), (v) => +(v / peak).toFixed(3)),   // 100 Hz, normalizado, de on até off
  };
}

async function main() {
  const dir = path.join(here, 'voices', set);
  const out = {}, missing = [];
  for (const [id, line] of Object.entries(LINES)) {
    const file = path.join(dir, `${id}.wav`);
    if (!existsSync(file)) { missing.push(id); continue; }
    const wav = readWav(await readFile(file));
    const a = analyze(wav, line.text);
    const wordsFile = path.join(dir, `${id}.words.json`);
    if (existsSync(wordsFile)) a.words = JSON.parse(await readFile(wordsFile, 'utf8')), a.wordsSource = 'timestamps';
    else a.wordsSource = 'estimated';
    out[id] = { ...line, set, file: `audio/voices/${set}/${id}.wav`, ...a };
    console.log(`${id.padEnd(14)} ${a.on.toFixed(2)}–${a.off.toFixed(2)} s  (${(a.off - a.on).toFixed(2)} s falados)  f0 ${a.f0 ?? '?'} Hz  ${a.words.map((w) => `${w.w}@${w.t}`).join(' ')}`);
  }
  const gen = path.join(here, '..', 'generated');
  await mkdir(gen, { recursive: true });
  const doc = { set, provisional: set !== 'final', made: new Date().toISOString(), lines: out, missing };
  await writeFile(path.join(gen, 'voices.json'), JSON.stringify(doc, null, 1));
  await writeFile(path.join(gen, 'voices.js'), `// gerado por audio/analyze-voices.mjs — não edite\nwindow.V8_VOICES = ${JSON.stringify(doc)};\n`);
  if (missing.length) console.log('faltando:', missing.join(', '));
  console.log(`conjunto: ${set}${set !== 'final' ? ' (ENSAIO — não é voz final)' : ''}`);
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
