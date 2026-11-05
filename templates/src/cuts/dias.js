// "E SE O CAM TREINASSE INGLÊS TODO DIA?" (~56 s, Reels): narrador de causo + cartões de dia (1, 10, 100, 1000, 10.000)
// no formato dos vídeos "E se…?" que o dono mandou (@rmhkaiser, @esev0ce, @lunarcheeseee; ver docs/pesquisa-e-se-reels.md).
// Roteiro: docs/roteiro-dias-v5.md. Regra Gumball: o Cam tem 26 anos em todos os dias; nada envelhece.
// ANIMAÇÃO PRÓPRIA (pedido do dono: "mais fluidas, muito melhores que as do app"): em cima do rig, uma camada de atuação
// com mola e antecipação nos braços, expressões que se misturam, viradas de cabeça contínuas, passos de verdade (pernas por IK),
// pulos com agachada e esticada, tremor de choro e de risada, respiração, e câmera que anda junto.
// Tudo é função pura do tempo t. Cada cena é uma camada com seu próprio mundo (1440 × 2400) e a sua câmera.
import { E, clamp, lerp, inv, pulse, el, css, fade, AudioList } from './kit.js';
import { residentMouth } from '../core/visemes.js';
import { renderCharacter, EXPRESSIONS, mergeDesign } from '/character-rig.js';
import { DESIGNS } from '/character-designs.js';
import { align, segVoice, stick, buildPages, fastLine } from './creator.js';
import { WORLD, livingSVG, closetSVG, bathSVG, neighborSVG, dreamSVG, streetSVG, tableSVG } from './dias-scenes.js';
import { barSVG } from './bar-room.js';
import { camSignature, camHome, camBare, camPJ, danteTourist, veraRobe } from './dias-outfits.js';

const LEAD = 0.025;
// [arquivo, a, b, legenda, quem]; a e b em segundos do arquivo (as pausas longas do take ficam de fora)
const SEG = {
  n1: ['camN1', 0.19, 2.4, 'E se o Cam treinasse inglês todo dia?', 'nar'],
  c1a: ['camC1', 0.0, 1.8, 'Vou baixar um app de inglês.', 'cam'],
  c1b: ['camC1', 2.72, 4.02, 'Segunda eu começo.', 'cam'],
  n2a: ['camN2', 0.08, 0.85, 'E baixou.', 'nar'],
  n2b: ['camN2', 1.66, 2.35, 'Na hora.', 'nar'],
  n3a: ['camN3', 0.0, 0.62, 'Dia um.', 'nar'],
  n3b: ['camN3', 1.66, 3.68, 'O app pediu pra falar em voz alta.', 'nar'],
  n3c: ['camN3', 4.33, 5.25, 'Ele foi pro armário.', 'nar'],
  c2: ['camC2', 0.28, 0.82, 'Hello?', 'cam'],
  n4a: ['camN4', 0.0, 1.74, 'O app soltou confete.', 'nar'],
  n4b: ['camN4', 2.88, 3.62, 'Ele chorou.', 'nar'],
  n5a: ['camN5', 0.15, 1.1, 'Dia dez.', 'nar'],
  n5b: ['camN5', 1.6, 2.95, 'Já treinava no chuveiro.', 'nar'],
  v1: ['camV1', 0.36, 1.57, 'Tá tudo bem aí?', 'viz'],
  c3: ['camC3', 0.0, 2.2, "I'm fine, thank you! And you?", 'cam'],
  v2: ['camV2', 0.0, 1.6, 'Vou chamar o síndico.', 'viz'],
  n6a: ['camN6', 0.0, 0.85, 'Dia cem.', 'nar'],
  n6b: ['camN6', 1.33, 2.47, 'Sonhou em inglês.', 'nar'],
  n6c: ['camN6', 3.26, 4.12, 'Com legenda.', 'nar'],
  n7: ['camN7', 0.12, 2.8, 'Um gringo perdido pediu o caminho.', 'nar'],
  t1: ['camT1', 0.0, 1.93, 'Excuse me, bus station?', 'tur'],
  c4: ['camC4', 0.1, 3.0, 'Go straight, then left at the bakery!', 'cam'],
  t2: ['camT2', 0.0, 1.87, 'Cara, eu sou de Cascavel.', 'tur'],
  n8: ['camN8', 0.25, 2.95, 'Ele saiu andando igual quem ganhou a Copa.', 'nar'],
  n9a: ['camN9', 0.08, 0.82, 'Dia mil.', 'nar'],
  n9b: ['camN9', 1.62, 2.68, 'Ele ainda erra.', 'nar'],
  c5: ['camC5', 0.0, 1.93, 'I have twenty-six years!', 'cam'],
  n10: ['camN10', 0.0, 2.5, 'Só que agora ele ri junto.', 'nar'],
  n11a: ['camN11', 0.03, 1.35, 'Dia dez mil.', 'nar'],
  n11b: ['camN11', 1.95, 3.3, 'Ele ainda foi pro armário.', 'nar'],
  c2b: ['camC2', 0.28, 0.82, 'Hello?', 'cam'],
  n12: ['camN12', 0.1, 1.75, 'E chorou com o confete.', 'nar'],
};
const EN = new Set(['c2', 'c2b', 'c3', 't1', 'c4', 'c5']);
const HI = { nar: '#F8C637', cam: '#7FE3D5', viz: '#FF9BD8', tur: '#FFB36B' };
const NAME = { nar: 'Narrador', cam: 'Cam', viz: 'Marlene', tur: 'Turista' };

// ------------------------------------------------------------------ elenco, poses e atuação
// braços [braço, antebraço ABSOLUTO, mão, objeto?]; L = esquerda da tela
const POSE = {
  rest: { armL: [10, 4, 'rest'], armR: [10, 4, 'rest'] },
  phone: { armL: [10, 4, 'rest'], armR: [34, -128, 'rest', 'phone'] },
  phoneTalk: { armL: [44, -36, 'open'], armR: [34, -128, 'rest', 'phone'] },
  phoneWave: { armL: [92, 150, 'open'], armR: [34, -128, 'rest', 'phone'] },
  phoneChest: { armL: [10, 4, 'rest'], armR: [24, -150, 'rest', 'phone'] },
  clench: { armL: [22, -140, 'fist'], armR: [22, -140, 'fist'] },
  cheer: { armL: [128, 150, 'fist'], armR: [128, 150, 'fist'] },
  point: { armL: [10, 4, 'rest'], armR: [84, 92, 'point'] },
  pointL: { armL: [84, -92, 'point'], armR: [10, 4, 'rest'] },
  explain: { armL: [38, -30, 'open'], armR: [40, -24, 'open'] },
  openWide: { armL: [78, -70, 'open'], armR: [78, -70, 'open'] },
  shrug: { armL: [30, 100, 'open'], armR: [30, 100, 'open'] },
  chest: { armL: [10, 4, 'rest'], armR: [20, -120, 'open'] },
  textbook: { armL: [26, -60, 'open'], armR: [26, -60, 'open'] },
  map: { armL: [10, 4, 'rest'], armR: [44, -96, 'rest', 'map'] },
  mapUp: { armL: [20, -50, 'open'], armR: [70, -120, 'rest', 'map'] },
  scratch: { armL: [10, 4, 'rest'], armR: [60, -168, 'open'] },
  hip: { armL: [10, 4, 'rest'], armR: [10, 4, 'rest'] },
  laugh: { armL: [26, -120, 'open'], armR: [26, -120, 'open'] },
  laughBelly: { armL: [22, -26, 'open'], armR: [22, -26, 'open'] },
  wipe: { armL: [14, -20, 'rest'], armR: [46, -172, 'open'] },
  slamR: { armL: [22, -40, 'open'], armR: [36, -12, 'fist'] },
  slam: { armL: [46, -36, 'fist'], armR: [10, 4, 'rest'] },
  cover: { armL: [30, -160, 'open'], armR: [30, -160, 'open'] },
  glass: { armL: [96, -176, 'fist', 'glass'], armR: [10, 4, 'rest'] },
  mic: { armL: [34, -40, 'open'], armR: [52, -148, 'fist', 'shampoo'] },
  micUp: { armL: [62, -96, 'open'], armR: [74, -172, 'fist', 'shampoo'] },
};
const ACT = { cam: camSignature, dante: danteTourist, vera: veraRobe, malik: DESIGNS.malik, nia: DESIGNS.nia };
const DEADPAN = { eyes: { open: 0.55, lid: 6 }, brows: { y: -0.1 }, mouth: { curve: -0.05, w: 0.7 } };
const SHOCK = { eyes: { open: 1.15, pupil: 0.55 }, brows: { y: 0.95 }, mouth: { t: 'wobble', w: 0.55 } };
const ASLEEP = { eyes: { closed: 'blink' }, brows: { y: 0.1 }, mouth: { curve: 0.4, w: 0.7 } };
const SMUG = { eyes: { open: 0.7, low: 0.3 }, brows: { y: 0.3, rot: -4 }, mouth: { curve: 0.7, w: 0.9, asym: 0.3 } };
const WORRY = { eyes: { open: 1.05, look: [0.3, 0.2] }, brows: { y: 0.7, rot: -14 }, mouth: { curve: -0.4, w: 0.7 } };
const CRY = { eyes: { open: 0.8, look: [0, 0.4] }, brows: { y: 0.55, rot: -20 }, mouth: { t: 'wobble', curve: -0.7, w: 0.9 } };

// ---- utilidades de atuação
const springResp = (u, w = 15, z = 0.5) => { if (u <= 0) return 0; const wd = w * Math.sqrt(1 - z * z); return 1 - Math.exp(-z * w * u) * (Math.cos(wd * u) + ((z * w) / wd) * Math.sin(wd * u)); };
const bell = (u) => Math.sin(Math.PI * clamp(u));
const ampX = (e, k = 1) => {
  const o = JSON.parse(JSON.stringify(e || {}));
  if (o.brows) { if (o.brows.y != null) o.brows.y *= k; if (o.brows.rot != null) o.brows.rot *= k; }
  if (o.mouth) { if (o.mouth.curve != null) o.mouth.curve *= Math.min(1.25, k); if (o.mouth.open != null) o.mouth.open = Math.min(1, o.mouth.open * (0.55 + 0.45 * k)); }
  if (o.eyes?.open != null && o.eyes.open > 1) o.eyes.open = 1 + (o.eyes.open - 1) * k;
  if (o.eyes?.lid != null) o.eyes.lid *= k;
  if (o.head) { if (o.head.rot != null) o.head.rot *= k; if (o.head.nod != null) o.head.nod *= k; }
  return o;
};
const resolveExpr = (D, e) => (typeof e === 'string' ? mergeDesign(ampX(EXPRESSIONS[e] || {}, D.amp), D.expressions?.[e]) : e);
function blendExpr(a, b, k) {
  if (k <= 0) return a; if (k >= 1) return b;
  if (typeof a === 'number' && typeof b === 'number') return lerp(a, b, k);
  if (Array.isArray(a) && Array.isArray(b)) return a.map((x, i) => blendExpr(x, b[i] ?? x, k));
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const o = {};
    for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) o[key] = key in a && key in b ? blendExpr(a[key], b[key], k) : key in b ? b[key] : a[key];
    return o;
  }
  return k < 0.5 ? a : b;
}

// cenas: mundo, fundo, quem está nela (x, pé, escala)
const K0 = 3.0;
const eyeH = (D) => D.height * 0.62;
const place = (who, x, eye, k = K0, design) => { const D = design || ACT[who]; return { who, x, k, eye, feet: eye + eyeH(D) * k, D }; };
const SCENES = {
  living: { svg: livingSVG, w: WORLD.w, h: WORLD.h, chars: { cam: place('cam', 700, 960, 3.1, camHome) } },
  closet: { svg: closetSVG, w: WORLD.w, h: WORLD.h, chars: { cam: place('cam', 720, 1010, 3.1, camHome) } },
  bath: { svg: bathSVG, w: WORLD.w, h: WORLD.h, chars: { cam: place('cam', 700, 960, 3.1, camBare) } },
  neighbor: { svg: neighborSVG, w: WORLD.w, h: WORLD.h, chars: { vera: place('vera', 640, 1230, 3.3) } },
  dream: { svg: dreamSVG, w: WORLD.w, h: WORLD.h, chars: { cam: place('cam', 330, 2060, 3.0, camPJ) } },
  street: { svg: streetSVG, w: WORLD.w, h: WORLD.h, chars: { cam: place('cam', 420, 980, 3.1), dante: place('dante', 1000, 1000, 3.0) } },
  bar: { svg: barSVG, w: 1800, h: 2600, chars: { cam: place('cam', 560, 1040, 3.0), nia: place('nia', 950, 1070, 3.0), malik: place('malik', 1420, 1030, 3.0) } },
};

async function bitmap(svg, w, h, blur = 1.6) {
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  const img = new Image(); img.src = url; await img.decode();
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); g.filter = `blur(${blur}px)`; g.drawImage(img, 0, 0, w, h); URL.revokeObjectURL(url);
  const out = c.toDataURL('image/png'); c.width = c.height = 1;
  return out;
}

export async function create(ctx) {
  const { W, H, overlay, voices: V } = ctx;
  const A = new AudioList();
  const F = V.lines;
  const S = {}, c = {};
  let T = 0.05;
  // ------------------------------------------------------------ linha do tempo
  const SPEED = 1.1, fastF = {};
  const put = (key, gap = 0.12, o = {}) => {
    T += gap;
    const [id, a0, b0, text, who] = SEG[key], sp = /^camN/.test(id) ? SPEED : 1;
    const f = sp > 1 ? (fastF[id] ??= fastLine(F[id], id)) : F[id];
    const a = a0 / sp, b = b0 / sp;
    const words = align(text, f.spans, a, b);
    A.clip(id, T, a, b, V, { file: f.file, ...o });
    const off = T - a;
    S[key] = { key, id, who, at: T, end: T + b - a, a, b, voice: segVoice(f, a, b, words), words: words.map((x) => ({ w: x.w, t: x.t + off, e: x.e + off, who })), text };
    T = S[key].end;
    return S[key];
  };
  put('n1', 0); put('c1a', 0.15); put('c1b', 0.2);
  put('n2a', 0.3); put('n2b', 0.16);
  c.card1 = S.n2b.end + 0.08; T = c.card1 + 0.02; put('n3a', 0);
  c.card1End = S.n3a.end + 0.05; T = c.card1End; put('n3b', 0); put('n3c', 0.3);
  put('c2', 0.8, { gain: 0.85 });
  put('n4a', 0.16); c.confe1 = S.n4a.words.find((w) => /confete/.test(w.w)).t;
  put('n4b', 0.4);
  c.card2 = S.n4b.end + 0.25; T = c.card2 + 0.02; put('n5a', 0);
  c.card2End = S.n5a.end + 0.05; T = c.card2End; put('n5b', 0);
  c.knock = S.n5b.end + 0.22; T = c.knock + 0.28; put('v1', 0, { gain: 0.85 });
  put('c3', 0.08); c.silence = S.c3.end;
  put('v2', 0.5, { gain: 0.85 });
  c.card3 = S.v2.end + 0.4; T = c.card3 + 0.02; put('n6a', 0);
  c.card3End = S.n6a.end + 0.05; T = c.card3End; put('n6b', 0); put('n6c', 0.35);
  c.street = S.n6c.end + 0.3; T = c.street + 0.35; put('n7', 0); put('t1', 0.12); put('c4', 0.08); put('t2', 0.3); put('n8', 0.4);
  c.card4 = S.n8.end + 0.4; T = c.card4 + 0.02; put('n9a', 0);
  c.card4End = S.n9a.end + 0.05; T = c.card4End; put('n9b', 0); put('c5', 0.25);
  c.laugh = S.c5.end + 0.08; put('n10', 0.65);
  c.card5 = S.n10.end + 0.25; T = c.card5 + 0.02; put('n11a', 0);
  c.card5End = S.n11a.end + 0.05; T = c.card5End; put('n11b', 0); put('c2b', 0.35, { gain: 0.85 });
  c.confe2 = S.c2b.end + 0.28; put('n12', 0.6);
  c.endCard = S.n12.end + 0.3;
  const duration = +(c.endCard + 2.1).toFixed(3);
  c.duration = duration;
  const segs = Object.values(S);
  for (const [k, v] of Object.entries(S)) c[k] = +v.at.toFixed(3);
  c.doorClose = S.c2.at - 0.32; c.walkIn = c.doorClose - 0.9; c.livingOut = S.n3c.at + 0.2;
  const CRD = [c.card1, c.card2, c.card3, c.card4, c.card5];

  // ------------------------------------------------------------ som (trilha com arco por dia, riser + impacto nos cartões, foley, ambiência por cena)
  const DROPS = [[S.n2b.at - 0.08, S.n2b.end + 0.25], [S.n4b.at - 0.12, S.n4b.at + 0.5], [S.c3.end, S.v2.at], [S.n6c.at - 0.2, S.n6c.end + 0.3], [S.t2.at + 0.9, S.n8.at], [S.n10.at - 0.15, S.n10.at + 0.35], [S.n12.at - 0.1, S.n12.at + 0.6]];
  A.cue('music', 0, { sections: [[0, 'dias'], [duration, 'out']], drops: DROPS, bpm: 100 });
  A.sfx('tap', S.c1a.end - 0.15, { gain: 0.5 }); A.sfx('notif', S.n2a.at - 0.05, { gain: 0.38 }); A.sfx('pop', S.n2a.at - 0.05, { gain: 0.3 });
  for (const t0 of CRD) { A.sfx('riser', t0 - 0.5, { gain: 0.3, len: 0.5 }); A.sfx('impact', t0, { gain: 0.45 }); }
  A.sfx('whoosh', c.livingOut, { gain: 0.3 });
  A.sfx('doorshut', c.doorClose, { gain: 0.8 });
  A.sfx('riser', c.confe1 - 0.45, { gain: 0.22, len: 0.4 }); A.sfx('chip', c.confe1, { gain: 0.5 }); A.sfx('result', c.confe1 + 0.05, { gain: 0.26 }); A.sfx('boing', c.confe1 - 0.28, { gain: 0.3 });
  A.sfx('knock', c.knock, { gain: 0.8 }); A.sfx('boing', c.knock + 0.02, { gain: 0.28 });
  A.sfx('dream', S.n6b.at - 0.1, { gain: 0.35 });
  A.sfx('scratch', S.t2.at + 1.05, { gain: 0.5 });
  A.sfx('boing', S.n8.at + 0.05, { gain: 0.3 });
  A.sfx('sample', c.laugh, { file: 'audio/crowd-real/mixkit-424.wav', from: 0.55, len: 1.9, fadeOut: 0.7, gain: 0.7 });
  A.sfx('sample', c.laugh + 0.35, { file: 'audio/crowd-real/mixkit-460.wav', from: 0.2, len: 1.8, fadeOut: 0.8, gain: 0.55 });
  A.sfx('slap', c.laugh + 0.25, { gain: 0.45 });
  A.sfx('doorshut', c.card5End + 0.5, { gain: 0.8 });
  A.sfx('riser', c.confe2 - 0.45, { gain: 0.22, len: 0.4 }); A.sfx('chip', c.confe2, { gain: 0.5 }); A.sfx('result', c.confe2 + 0.05, { gain: 0.26 }); A.sfx('boing', c.confe2 - 0.28, { gain: 0.3 });
  const captions = segs.map((s) => ({ start: s.at, end: s.end, who: NAME[s.who], text: s.text, lang: EN.has(s.key) ? 'en' : 'pt' })).sort((x, y) => x.start - y.start);

  // ------------------------------------------------------------ camadas das cenas
  const sceneL = {};
  const inst = [];
  for (const [name, sc] of Object.entries(SCENES)) {
    const L = el(overlay, 'div', 'layer', '', { width: `${W}px`, height: `${H}px`, overflow: 'hidden', background: '#000' });
    const world = el(L, 'div', '', '', { position: 'absolute', left: '0px', top: '0px', width: `${sc.w}px`, height: `${sc.h}px`, transformOrigin: '0 0' });
    const svg = name === 'bar' ? barSVG() : name === 'living' ? livingSVG('back') : sc.svg();
    el(world, 'img', '', '', { position: 'absolute', left: '0px', top: '0px', width: `${sc.w}px`, height: `${sc.h}px` }).src = await bitmap(svg, sc.w, sc.h, name === 'bar' ? 1.6 : 1.4);
    for (const [key, p] of Object.entries(sc.chars)) {
      const D = p.D, vb = Math.max(250, D.height * 0.92), h = D.height + 38;
      const n = el(world, 'div', '', '', { position: 'absolute', left: `${p.x - (vb / 2) * p.k}px`, top: `${p.feet - (D.height + 24) * p.k}px`, width: `${vb * p.k}px`, height: `${h * p.k}px`, transformOrigin: '50% 100%' });
      inst.push({ scene: name, key, p, n, id: `${name}.${key}` });
    }
    if (name === 'dream') inst.find((x) => x.scene === 'dream').n.style.transformOrigin = '50% 12%';
    sceneL[name] = { L, world, sc, front: el(world, 'div', '', '', { position: 'absolute', left: '0px', top: '0px', width: `${sc.w}px`, height: `${sc.h}px`, pointerEvents: 'none' }) };
  }
  const wEl = (scene, html, style = {}, front = true) => el(front ? sceneL[scene].front : sceneL[scene].world, 'div', '', html, { position: 'absolute', ...style });
  // peças na frente dos personagens
  el(sceneL.living.front, 'img', '', '', { position: 'absolute', left: '0px', top: '0px', width: '1440px', height: '2400px' }).src = await bitmap(livingSVG('front'), 1440, 2400, 1.2);
  wEl('bar', tableSVG().replace('width="1440" height="600"', 'width="1840" height="770"'), { left: '-20px', top: '1290px', width: '1840px', height: '770px' });
  // box de vidro fosco: moldura de alumínio no topo, vidro com reflexos e gotas (sem a "placa" creme)
  wEl('bath', '', { left: '0px', top: '1196px', width: '1440px', height: '1204px', background: 'linear-gradient(180deg, rgba(222,240,238,.78), rgba(196,226,222,.93))', borderTop: '16px solid #D5DCE2', boxShadow: '0 -4px 0 #F6FBFC' });
  const water = wEl('bath', '', { left: '780px', top: '470px', width: '240px', height: '900px', overflow: 'hidden' }, false);
  const drops = Array.from({ length: 22 }, (_, i) => el(water, 'div', '', '', { position: 'absolute', left: `${(i * 37) % 220}px`, top: '0px', width: '5px', height: '70px', borderRadius: '3px', background: 'rgba(255,255,255,.75)' }));
  sceneL.bath.world.insertBefore(water, inst.find((x) => x.scene === 'bath').n);
  [200, 640, 1060].forEach((x, i) => wEl('bath', '', { left: `${x}px`, top: '1230px', width: `${34 + i * 12}px`, height: '1100px', background: 'linear-gradient(180deg, rgba(255,255,255,.55), rgba(255,255,255,0))', borderRadius: '20px', transform: 'skewX(-8deg)' }));
  const steam = Array.from({ length: 5 }, (_, i) => wEl('bath', '', { left: `${300 + i * 190}px`, top: '900px', width: '260px', height: '260px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,.55), rgba(255,255,255,0) 70%)' }, false));
  // cobertor por cima do corpo deitado (a cabeça fica no travesseiro, à esquerda)
  wEl('dream', Array.from({ length: 9 }, (_, i) => `<svg style="position:absolute;left:${80 + i * 96}px;top:${60 + (i % 3) * 70}px" width="40" height="40" viewBox="0 0 40 40"><path d="M20 2 l5 13 l14 1 l-11 9 l4 14 l-12 -8 l-12 8 l4 -14 l-11 -9 l14 -1z" fill="#FFE07A" opacity=".8"/></svg>`).join(''), { left: '560px', top: '1660px', width: '900px', height: '330px', borderRadius: '120px 40px 40px 120px', background: 'linear-gradient(180deg, #3FA395, #2F7F78)', boxShadow: 'inset 0 22px 0 #5FC2B2, 0 18px 0 rgba(0,0,0,.18)', overflow: 'hidden' });
  // sonho: balão com a legenda digitada
  const dreamBub = wEl('dream', `<div style="position:absolute;left:0;top:0;width:100%;height:100%;border-radius:150px;background:#FFFDF7;box-shadow:0 18px 0 rgba(0,0,0,.12)"></div><div style="position:absolute;left:0;top:34px;width:100%;text-align:center;font:600 58px/1.1 var(--display);color:#1C3A2B">Nice to meet you!</div><div id="sub" style="position:absolute;left:50%;top:240px;width:480px;height:88px;margin-left:-240px;border-radius:18px;background:#14241C;color:#FFFDF7;text-align:center;font:600 48px/88px var(--ui)"></div><div style="position:absolute;left:22px;top:254px;font:700 36px/1 var(--ui);background:#FFFDF7;color:#14241C;border-radius:8px;padding:6px 10px">CC</div>`, { left: '120px', top: '960px', width: '720px', height: '380px' }, false);
  const subEl = dreamBub.querySelector('#sub');
  const bubbleDots = [0, 1, 2].map((i) => wEl('dream', '', { left: `${300 + i * 22}px`, top: `${1510 - i * 62}px`, width: `${44 - i * 10}px`, height: `${44 - i * 10}px`, borderRadius: '50%', background: '#FFFDF7' }, false));
  const zzz = [0, 1, 2].map(() => wEl('dream', 'Z', { left: '600px', top: '1480px', font: '700 90px/1 var(--display)', color: '#FFF3C4', opacity: '0' }, false));
  // armário: a luz da porta (some quando a porta fecha) e as lágrimas
  const doorLight = wEl('closet', '', { left: '0px', top: '0px', width: '560px', height: '2400px', background: 'linear-gradient(90deg, rgba(255,233,176,.55), rgba(255,233,176,0))', transformOrigin: '0 50%' }, true);
  // marcas de exclamação e suor
  const excl = (scene, x, y) => wEl(scene, '<svg width="90" height="150" viewBox="0 0 90 150"><rect x="28" y="6" width="34" height="86" rx="17" fill="#E2503A" stroke="#FFFDF7" stroke-width="8"/><circle cx="45" cy="124" r="17" fill="#E2503A" stroke="#FFFDF7" stroke-width="8"/></svg>', { left: `${x}px`, top: `${y}px`, width: '90px', height: '150px', transformOrigin: '50% 100%', opacity: '0' }, true);
  const exclBath = excl('bath', 920, 560), exclNeighbor = excl('neighbor', 700, 790), exclStreet = excl('street', 360, 560);
  const _unusedSweat = wEl('street', '<svg width="60" height="90" viewBox="0 0 60 90"><path d="M30 4 C48 34 54 50 54 60 a24 24 0 0 1 -48 0 C6 50 12 34 30 4z" fill="#8FD3F4" stroke="#FFFDF7" stroke-width="6"/></svg>', { left: '560px', top: '640px', width: '60px', height: '90px', opacity: '0' }, true);

  // ------------------------------------------------------------ inserts: celular, cartões, confete, cartão final
  const phone = el(overlay, 'div', 'layer', '', { width: `${W}px`, height: `${H}px`, background: '#E4C195', overflow: 'hidden' });
  el(phone, 'div', 'layer', livingSVG('back').replace('width="1440" height="2400"', `width="${W * 1.4}" height="${H * 1.4}"`), { width: `${W}px`, height: `${H}px`, opacity: '0.35', filter: 'blur(10px)' });
  const pframe = el(phone, 'div', '', `<div style="position:absolute;inset:0;border-radius:90px;background:#1B1F2A;box-shadow:0 60px 90px -30px rgba(0,0,0,.6)"></div><div style="position:absolute;left:26px;top:26px;right:26px;bottom:26px;border-radius:70px;background:linear-gradient(180deg,#1C3A2B,#2F7F78);overflow:hidden"></div>
    <div id="ico" style="position:absolute;left:50%;top:240px;width:250px;height:250px;margin-left:-125px;border-radius:64px;box-shadow:0 16px 0 rgba(0,0,0,.22);overflow:hidden"><img src="/assets/batatalk-mascot.png" alt="" style="display:block;width:100%;height:100%;border-radius:64px"></div>
    <div id="dlt" style="position:absolute;left:0;right:0;top:560px;text-align:center;font:700 64px/1 var(--display);color:#FFFDF7">baixando…</div>
    <div style="position:absolute;left:90px;right:90px;top:690px;height:56px;border-radius:28px;background:rgba(255,255,255,.22)"></div>
    <div id="dlb" style="position:absolute;left:90px;top:690px;height:56px;border-radius:28px;background:#F8C637;width:0"></div>
    <div id="dlp" style="position:absolute;left:0;right:0;top:780px;text-align:center;font:600 54px/1 var(--ui);color:#FFFDF7">0%</div>
    `, { position: 'absolute', left: '210px', top: '330px', width: '660px', height: '1220px', transformOrigin: '50% 50%' });
  const dlb = pframe.querySelector('#dlb'), dlp = pframe.querySelector('#dlp'), dlt = pframe.querySelector('#dlt'), dlf = { style: {} }, ico = pframe.querySelector('#ico');
  const prompt = el(overlay, 'div', '', `<svg width="80" height="110" viewBox="0 0 80 110" style="vertical-align:middle;margin-right:18px"><rect x="24" y="4" width="32" height="62" rx="16" fill="#1C3A2B"/><path d="M12 54 a28 28 0 0 0 56 0" stroke="#1C3A2B" stroke-width="7" fill="none"/><path d="M40 82 v20 M24 102 h32" stroke="#1C3A2B" stroke-width="7"/></svg><span style="vertical-align:middle">fale em voz alta</span>`, { position: 'absolute', left: '0px', top: '0px', whiteSpace: 'nowrap', padding: '14px 32px 18px 26px', borderRadius: '26px', background: '#F8C637', color: '#1C3A2B', font: '700 52px/1.1 var(--display)', boxShadow: '0 14px 30px -16px rgba(0,0,0,.55)', transformOrigin: '50% 50%' });

  const banner = el(overlay, 'div', '', `<div style="display:flex;align-items:center;gap:30px"><div style="width:132px;height:132px;border-radius:34px;overflow:hidden;flex:none;box-shadow:0 8px 0 rgba(0,0,0,.16)"><img src="/assets/batatalk-mascot.png" alt="" style="display:block;width:100%;height:100%"></div><div style="flex:1;min-width:0"><div style="font:700 46px/1.1 var(--display);color:#1C3A2B;white-space:nowrap">app de inglês</div><div style="margin-top:14px;height:22px;border-radius:11px;background:rgba(28,58,43,.16);overflow:hidden"><div id="bnb" style="height:100%;width:0;border-radius:11px;background:#2F7F78"></div></div><div id="bnp" style="margin-top:10px;font:600 34px/1 var(--ui);color:#2F6F66;white-space:nowrap">baixando… 0%</div></div></div>`, { position: 'absolute', left: '0px', top: '0px', width: '860px', boxSizing: 'border-box', padding: '28px 36px', borderRadius: '44px', background: 'rgba(255,253,247,.97)', boxShadow: '0 22px 40px -18px rgba(0,0,0,.55)', transformOrigin: '50% 50%' });
  fade(banner, 0);
  const bnb = banner.querySelector('#bnb'), bnp = banner.querySelector('#bnp');
  const card = el(overlay, 'div', 'layer', '', { width: `${W}px`, height: `${H}px`, overflow: 'hidden' });
  const cardNum = el(card, 'div', '', '', { position: 'absolute', left: '0px', top: '640px', width: `${W}px`, textAlign: 'center', font: '700 380px/1 var(--display)', color: '#FFFDF7', transformOrigin: '50% 60%' });
  const cardLbl = el(card, 'div', '', 'DIA', { position: 'absolute', left: '0px', top: '470px', width: `${W}px`, textAlign: 'center', font: '700 150px/1 var(--display)', letterSpacing: '.12em', color: '#FFFDF7', opacity: '.9' });
  const cardCal = el(card, 'div', 'layer', '', { width: `${W}px`, height: `${H}px` });
  const CARDS = [
    { n: '1', bg: 'rgba(47,127,120,.66)' }, { n: '10', bg: 'rgba(231,123,79,.64)' }, { n: '100', bg: 'rgba(110,90,166,.66)' }, { n: '1000', bg: 'rgba(248,198,55,.66)', dark: true }, { n: '10.000', bg: 'rgba(28,58,43,.74)' },
  ];
  cardCal.innerHTML = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${Array.from({ length: 14 }, (_, k) => `<rect x="${-200 + k * 150}" y="0" width="70" height="${H}" fill="#FFFFFF" opacity="${(0.05 + (k % 3) * 0.02).toFixed(2)}" transform="skewX(-18)"/>`).join('')}</svg>`;
  const conf = document.createElement('canvas'); conf.width = W; conf.height = H; Object.assign(conf.style, { position: 'absolute', left: '0', top: '0', width: `${W}px`, height: `${H}px` }); overlay.append(conf);
  const cg = conf.getContext('2d');
  const confColors = ['#F8C637', '#FF8AD8', '#7FE3D5', '#E77B4F', '#FFFFFF', '#B5294C'];
  const pr = (i, k) => { const v = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return v - Math.floor(v); };
  function confetti(t, t0, ox, oy, dur = 2.4, n = 140) {
    const u = t - t0;
    if (u < 0 || u > dur) return false;
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (pr(i, 1) - 0.5) * 2.4, sp = 500 + pr(i, 2) * 900, vx = Math.cos(a) * sp, vy = Math.sin(a) * sp;
      const x = ox + vx * u * 0.9 + 60 * Math.sin(u * 5 + i), y = oy + vy * u + 1500 * u * u * 0.5;
      if (y > H + 40) continue;
      cg.save(); cg.translate(x, y); cg.rotate(u * (3 + pr(i, 3) * 8) + i);
      cg.fillStyle = confColors[i % 6]; cg.globalAlpha = 1 - clamp(inv(dur - 0.5, dur, u));
      cg.fillRect(-9, -5, 18, 10 + pr(i, 4) * 8); cg.restore();
    }
    return true;
  }
  const endL = el(overlay, 'div', 'layer', '', { width: `${W}px`, height: `${H}px`, background: 'radial-gradient(ellipse 70% 50% at 50% 45%, #2F7F78, #14241C)' });

  // ------------------------------------------------------------ textos
  const sticker = (html, style = {}) => { const n = el(overlay, 'div', '', html, { position: 'absolute', left: '0px', top: '0px', whiteSpace: 'nowrap', transformOrigin: '50% 50%', ...style }); fade(n, 0); return n; };
  const BOX = { padding: '16px 28px 18px', borderRadius: '22px', background: '#FFFDF7', color: '#1C3A2B', font: '600 50px/1.1 var(--display)', boxShadow: '0 14px 30px -16px rgba(0,0,0,.55)', textAlign: 'center' };
  const tag = sticker('<div style="font:700 30px/1 var(--ui);letter-spacing:.08em;color:#F8C637;margin-bottom:8px">CAM · 26 ANOS</div><div style="font:600 44px/1.05 var(--display)">2 cursos de inglês abandonados</div>', { padding: '16px 30px 20px', borderRadius: '22px', background: 'rgba(20,36,28,.92)', color: '#FFFDF7', textAlign: 'center', boxShadow: '0 14px 30px -16px rgba(0,0,0,.6)' });
  const hookIcons = [0, 1].map((i) => sticker(`<svg width="170" height="170" viewBox="0 0 170 170"><rect x="10" y="10" width="150" height="150" rx="38" fill="#9AA0AE"/><path d="M45 118 V58 q40 -14 40 10 q0 -24 40 -10 V118 q-40 -14 -40 6 q0 -20 -40 -6z" fill="#F4F4F4"/><circle cx="132" cy="38" r="28" fill="#E2503A" stroke="#FFFDF7" stroke-width="7"/><path d="M120 26 l24 24 M144 26 l-24 24" stroke="#FFFDF7" stroke-width="8" stroke-linecap="round"/></svg>`, { filter: 'drop-shadow(0 12px 10px rgba(0,0,0,.3))' }));
  const chip = sticker('', { padding: '8px 30px 12px', borderRadius: '999px', background: '#14241C', color: '#F8C637', font: '700 54px/1 var(--display)', border: '5px solid #FFFDF7', boxShadow: '0 12px 24px -14px rgba(0,0,0,.7)', minWidth: '250px', textAlign: 'center', boxSizing: 'border-box' });
  const endChips = [['DIA 1', '#2F7F78', '#FFFDF7'], ['DIA 10', '#E77B4F', '#FFFDF7'], ['DIA 100', '#6E5AA6', '#FFFDF7'], ['DIA 1000', '#F8C637', '#14241C']].map(([tx, bg, fg]) => sticker(tx, { width: '420px', boxSizing: 'border-box', padding: '20px 0 26px', textAlign: 'center', borderRadius: '36px', background: bg, color: fg, font: '700 92px/1 var(--display)', border: '7px solid #FFFDF7', boxShadow: '0 16px 30px -16px rgba(0,0,0,.6)' }));
  const ask = sticker('e você,<br>em que dia tá? 👇', { textAlign: 'center', color: '#FFFDF7', font: '700 92px/1.12 var(--display)', textShadow: '0 8px 0 rgba(0,0,0,.28)' });
  const fine = sticker('Vozes geradas por IA · exemplo animado', { font: '600 40px/1 var(--ui)', color: '#FFFDF7', padding: '12px 26px', borderRadius: '16px', background: 'rgba(20,36,28,.62)' });
  const capN = el(overlay, 'div', '', '', { position: 'absolute', left: '540px', top: '1165px', transform: 'translate(-50%, -50%)', textAlign: 'center', whiteSpace: 'nowrap', font: '700 78px/1.05 var(--display)', color: '#FFFDF7', letterSpacing: '.01em', textTransform: 'uppercase', WebkitTextStroke: '14px #14241C', paintOrder: 'stroke fill', textShadow: '0 8px 0 rgba(20,36,28,.28)' });
  const PAGES = buildPages(segs.map((s) => s.words));
  // nenhuma página termina em artigo, preposição ou palavra solta: a palavra vai para a página seguinte ("VOU CHAMAR / O SÍNDICO")
  const FW = new Set(['o', 'a', 'os', 'as', 'de', 'do', 'da', 'em', 'no', 'na', 'pro', 'pra', 'com', 'um', 'uma', 'e', 'que', 'eu', 'at', 'the', 'to', 'of', 'in', 'and']);
  const plain = (w) => w.toLowerCase().replace(/[^a-zà-ú]/gi, '');
  for (let pass = 0; pass < 2; pass++) for (let i = 0; i < PAGES.length - 1; i++) {
    const pg = PAGES[i], nx = PAGES[i + 1], last = pg.words[pg.words.length - 1];
    if (pg.words.length > 1 && FW.has(plain(last.w)) && nx.words[0].t - last.e < 0.45) { nx.words.unshift(pg.words.pop()); pg.end = pg.words[pg.words.length - 1].e + 0.14; nx.start = nx.words[0].t - 0.05; }
  }
  for (let i = 0; i < PAGES.length - 1; i++) PAGES[i].end = Math.min(PAGES[i].end, PAGES[i + 1].start);

  // ------------------------------------------------------------ atuação: trilhas por personagem
  const TR = {};
  const tr = (id) => (TR[id] ??= { P: [], X: [], T: [], L: [], M: [] });
  const pk = (id, t, name, dur = 0.3, ease = 'spring') => tr(id).P.push([t, name, dur, ease]);
  const xk = (id, t, e, dur = 0.14) => tr(id).X.push([t, e, dur]);
  const tk = (id, t, v, dur = 0.4) => tr(id).T.push([t, v, dur]);
  const lk = (id, t, l) => tr(id).L.push([t, l]);
  const mv = (id, type, t0, t1, o = {}) => tr(id).M.push({ type, t0, t1, ...o });
  const init = (id, pose, expr, look = [0, 0]) => { pk(id, 0, pose, 0, 'inOut'); xk(id, 0, expr, 0); tk(id, 0, 0, 0); lk(id, 0, look); mv(id, 'breath', 0, 1e6); };
  const W_ = (key, i) => S[key].words[i]?.t ?? S[key].at;
  const idle = (id, t0, t1, poses, step = 1.4) => { for (let k = 0, tt = t0; tt < t1; k++, tt += step) pk(id, tt, poses[k % poses.length], 0.4); };

  // ---- sala (dia 1): o polegar, a frase, a espiada nervosa, a saída de fininho
  init('living.cam', 'phone', DEADPAN, [0, 0.55]);
  mv('living.cam', 'thumb', 0, S.c1b.at, { amp: 5, f: 1.7 });
  pk('living.cam', S.c1a.at - 0.12, 'phoneTalk', 0.3); xk('living.cam', S.c1a.at - 0.05, 'speaking'); mv('living.cam', 'lean', S.c1a.at - 0.25, S.c1a.end + 0.1, { rot: 7 });
  pk('living.cam', S.c1b.at - 0.1, 'phoneWave', 0.28); xk('living.cam', S.c1b.at - 0.05, SMUG); lk('living.cam', S.c1b.at - 0.05, [0, 0.3]);
  mv('living.cam', 'lean', S.c1b.at - 0.2, S.c1b.end + 0.15, { rot: -9 }); mv('living.cam', 'wave', S.c1b.at - 0.05, S.c1b.end + 0.15, { amp: 24, f: 3.1, side: 'L' });
  pk('living.cam', S.n2a.at - 0.25, 'phone', 0.25);
  xk('living.cam', S.n2b.at - 0.5, DEADPAN, 0.2); lk('living.cam', S.n2b.at - 0.5, [0, 0]);
  const g0 = c.card1End;
  xk('living.cam', g0, WORRY, 0.18); pk('living.cam', g0, 'phoneChest', 0.3);
  lk('living.cam', g0 + 0.05, [-0.7, 0.1]); lk('living.cam', g0 + 0.6, [0.7, 0.1]); lk('living.cam', g0 + 1.15, [0, 0.5]);
  tk('living.cam', g0 + 0.05, -0.4, 0.3); tk('living.cam', g0 + 0.6, 0.4, 0.3); tk('living.cam', g0 + 1.15, 0, 0.3);
  mv('living.cam', 'shake', g0 + 0.8, S.n3c.at, { amp: 0.9, f: 7 });
  tk('living.cam', S.n3c.at - 0.05, 0.6, 0.25); lk('living.cam', S.n3c.at - 0.05, [0.7, 0]);
  mv('living.cam', 'lean', S.n3c.at - 0.2, S.n3c.at + 0.2, { rot: -6 });
  mv('living.cam', 'walk', c.livingOut - 0.05, c.livingOut + 0.85, { x0: 0, x1: 900, dir: 1, f: 3.0, lean: 5, hush: 0.6 });
  // ---- armário (dias 1 e 10.000)
  const closetDir = (id, tWalk, tClose, tHello, tConf, tCry, tEnd, walkIn) => {
    pk(id, 0, 'phone', 0, 'inOut'); xk(id, 0, WORRY, 0); tk(id, 0, 0, 0); lk(id, 0, [0, 0.5]); mv(id, 'breath', 0, 1e6);
    if (walkIn) mv(id, 'walk', tWalk, tClose, { x0: -620, x1: 0, dir: 1, f: 3.0, lean: 5, hush: 0.6 });
    tk(id, tClose - 0.05, -0.45, 0.22); lk(id, tClose - 0.05, [-0.7, 0.1]); mv(id, 'flinch', tClose, tClose + 0.35, { amp: 1 });
    tk(id, tClose + 0.35, 0, 0.35); lk(id, tClose + 0.35, [0, 0.55]);
    pk(id, tClose + 0.2, 'phoneChest', 0.3); mv(id, 'lean', tHello - 0.45, tHello + 0.7, { rot: 7 }); xk(id, tHello - 0.1, 'embarrassed');
    xk(id, tConf - 0.4, SHOCK, 0.1); mv(id, 'hop', tConf - 0.36, tConf + 0.55, { h: 95, arms: true });
    xk(id, tConf + 0.38, 'excited', 0.1); pk(id, tConf + 0.58, 'phoneChest', 0.35);
    xk(id, tCry - 0.3, CRY, 0.35); mv(id, 'shake', tCry - 0.3, tEnd, { amp: 1.7, f: 6.4 });
  };
  mv('closet.cam', 'tears', S.n4b.at - 0.15, c.card2); mv('closet2.cam', 'tears', S.n12.at - 0.15, c.endCard);
  closetDir('closet.cam', c.walkIn, c.doorClose, S.c2.at, c.confe1, S.n4b.at, c.card2, true);
  closetDir('closet2.cam', c.card5End, c.card5End + 0.5, S.c2b.at, c.confe2, S.n12.at, c.endCard, false);
  // ---- chuveiro e vizinha (dia 10)
  const b0 = c.card2End;
  init('bath.cam', 'rest', 'smallSmile', [0.3, 0.1]);
  mv('bath.cam', 'mime', b0, c.knock + 0.0);
  [[b0 + 0.05, 'mic'], [b0 + 0.6, 'micUp'], [b0 + 1.0, 'mic'], [b0 + 1.4, 'micUp']].forEach(([t, p]) => pk('bath.cam', t, p, 0.28));
  mv('bath.cam', 'sway', b0, c.knock + 0.0, { amp: 4, f: 0.9 }); xk('bath.cam', b0 + 0.1, 'excited', 0.2);
  xk('bath.cam', c.knock + 0.0, SHOCK, 0.08); pk('bath.cam', c.knock + 0.0, 'clench', 0.2); mv('bath.cam', 'hop', c.knock - 0.01, c.knock + 0.5, { h: 34 });
  tk('bath.cam', c.knock + 0.1, 0.55, 0.3); lk('bath.cam', c.knock + 0.1, [0.9, 0]);
  xk('bath.cam', S.c3.at - 0.05, 'excited', 0.15); tk('bath.cam', S.c3.at - 0.05, 0, 0.25); lk('bath.cam', S.c3.at - 0.05, [0, 0]);
  pk('bath.cam', W_('c3', 0) - 0.04, 'textbook', 0.25); pk('bath.cam', W_('c3', 1) - 0.04, 'chest', 0.25); pk('bath.cam', W_('c3', 2) - 0.04, 'openWide', 0.25); pk('bath.cam', W_('c3', 3) - 0.04, 'explain', 0.25);
  mv('bath.cam', 'sway', S.c3.at, S.c3.end, { amp: 5, f: 1.8 });
  xk('bath.cam', S.c3.end + 0.12, 'smallSmile', 0.3); pk('bath.cam', S.c3.end + 0.12, 'rest', 0.35);
  init('neighbor.vera', 'glass', 'listening', [-0.6, 0]); tk('neighbor.vera', 0, -0.55, 0); mv('neighbor.vera', 'lean', c.knock - 0.14, c.knock + 0.25, { rot: -6 });
  tk('neighbor.vera', S.v1.at - 0.15, 0, 0.3); xk('neighbor.vera', S.v1.at - 0.05, 'concerned'); pk('neighbor.vera', S.v1.at - 0.1, 'chest', 0.28); mv('neighbor.vera', 'lean', S.v1.at - 0.1, S.v1.end, { rot: -5 });
  xk('neighbor.vera', S.c3.at + 0.95, SHOCK, 0.08); pk('neighbor.vera', S.c3.at + 0.95, 'cover', 0.2); mv('neighbor.vera', 'hop', S.c3.at + 0.92, S.c3.at + 1.4, { h: 26 });
  xk('neighbor.vera', S.v2.at - 0.05, 'annoyed', 0.15); pk('neighbor.vera', S.v2.at - 0.08, 'point', 0.25); mv('neighbor.vera', 'lean', S.v2.at - 0.1, S.v2.end, { rot: -7 });
  pk('neighbor.vera', S.v2.end + 0.05, 'rest', 0.2); tk('neighbor.vera', S.v2.end + 0.05, -0.5, 0.2);
  mv('neighbor.vera', 'walk', S.v2.end + 0.04, S.v2.end + 0.5, { x0: 0, x1: -1100, dir: -1, f: 3.6, lean: 6, stomp: true });
  // ---- sonho (dia 100)
  init('dream.cam', 'rest', ASLEEP); mv('dream.cam', 'lie', 0, 1e6); mv('dream.cam', 'sleep', 0, 1e6);
  // ---- rua
  const st = c.street;
  init('street.cam', 'rest', 'smallSmile', [0.6, 0]); tk('street.cam', 0, 0.2, 0);
  init('street.dante', 'map', 'confused', [-0.6, 0.2]); tk('street.dante', 0, -0.35, 0);
  mv('street.dante', 'walk', st + 0.05, st + 1.0, { x0: 950, x1: 0, dir: -1, f: 2.6, lean: 3 });
  tk('street.cam', st + 0.7, 0.5, 0.35);
  pk('street.dante', S.t1.at - 0.08, 'mapUp', 0.3); mv('street.dante', 'lean', S.t1.at - 0.1, S.t1.end, { rot: 5 }); xk('street.dante', S.t1.at - 0.05, 'confused');
  pk('street.cam', S.c4.at - 0.1, 'rest', 0.1); xk('street.cam', S.c4.at - 0.05, 'excited'); tk('street.cam', S.c4.at - 0.05, 0.45, 0.2);
  pk('street.cam', W_('c4', 0) - 0.04, 'point', 0.25); pk('street.cam', W_('c4', 2) - 0.06, 'pointL', 0.25); pk('street.cam', W_('c4', 4) - 0.04, 'explain', 0.25);
  mv('street.cam', 'lean', S.c4.at - 0.1, S.c4.end, { rot: 6 }); mv('street.dante', 'nod', S.c4.at + 0.4, S.c4.end, { amp: 3, f: 2.2 });
  xk('street.dante', S.t2.at - 0.05, 'embarrassed', 0.1); pk('street.dante', S.t2.at - 0.05, 'scratch', 0.25); mv('street.dante', 'lean', S.t2.at, S.t2.end, { rot: -4 });
  mv('street.cam', 'sweat', S.t2.at + 1.3, S.t2.at + 2.2);
  xk('street.cam', S.t2.at + 1.12, SHOCK, 0.06); pk('street.cam', S.t2.at + 1.12, 'rest', 0.2); mv('street.cam', 'flinch', S.t2.at + 1.12, S.t2.at + 1.55, { amp: 1.4 });
  xk('street.cam', S.t2.end + 0.45, SMUG, 0.3); pk('street.cam', S.t2.end + 0.45, 'hip', 0.3); tk('street.cam', S.t2.end + 0.45, -0.45, 0.35);
  mv('street.cam', 'walk', S.n8.at + 0.15, c.card4 - 0.1, { x0: 0, x1: -760, dir: -1, f: 1.7, lean: -3, swagger: true });
  // ---- bar (dia 1000)
  const bb = c.card4End;
  init('bar.cam', 'rest', 'smallSmile', [0.6, 0]); tk('bar.cam', 0, 0.3, 0);
  init('bar.nia', 'rest', 'listening', [-0.4, 0]); init('bar.malik', 'rest', 'listening', [-0.6, 0]); tk('bar.malik', 0, -0.3, 0);
  pk('bar.cam', bb + 0.1, 'openWide', 0.3); mv('bar.cam', 'sway', bb, S.c5.at, { amp: 3, f: 0.8 });
  pk('bar.cam', S.c5.at - 0.1, 'chest', 0.25); xk('bar.cam', S.c5.at - 0.05, 'excited'); mv('bar.cam', 'lean', S.c5.at - 0.1, S.c5.end, { rot: -5 });
  for (const w of ['bar.nia', 'bar.malik']) {
    xk(w, S.c5.end + 0.1, 'confused', 0.15); lk(w, S.c5.end + 0.1, [w === 'bar.nia' ? 0.5 : -0.5, 0.1]);
    xk(w, c.laugh, 'laugh', 0.12); pk(w, c.laugh, 'laughBelly', 0.2); mv(w, 'shake', c.laugh, c.laugh + 2.2, { amp: 3.2, f: 7.5 });
  }
  pk('bar.malik', c.laugh + 0.25, 'slamR', 0.2);
  xk('bar.cam', S.c5.end + 0.12, 'embarrassed', 0.15); xk('bar.cam', c.laugh + 0.3, 'laugh', 0.12); pk('bar.cam', c.laugh + 0.3, 'wipe', 0.25); mv('bar.cam', 'shake', c.laugh + 0.3, c.laugh + 2.6, { amp: 2.6, f: 7 });

  idle('street.cam', st + 0.15, S.c4.at - 0.25, ['hip', 'chest', 'rest', 'explain'], 1.3);
  idle('bar.nia', bb + 0.15, S.c5.end, ['chest', 'rest'], 1.5); idle('bar.malik', bb + 0.45, S.c5.end, ['rest', 'chest'], 1.7);
  // passos (foley) em cada caminhada
  for (const K of Object.values(TR)) for (const m of K.M) if (m.type === 'walk') { const fq = m.f ?? 2.2; for (let k = 1, tt = m.t0 + 0.5 / fq; tt < m.t1 - 0.08; k++, tt += 0.5 / fq) A.sfx('step', tt, { gain: m.hush ? 0.22 : 0.3, pan: k % 2 ? -0.12 : 0.12 }); }
  for (const k of Object.values(TR)) { for (const a of [k.P, k.X, k.T, k.L]) a.sort((x, y) => x[0] - y[0]); }
  const lastIdx = (list, t) => { let i = 0; for (let j = 0; j < list.length; j++) if (list[j][0] <= t) i = j; return i; };
  function armOf(K, t, side) {
    const P = K.P, i = lastIdx(P, t), [t1, n1, d1, ease] = P[i], cur = POSE[n1][side];
    if (!i || d1 === 0) return cur;
    const prev = POSE[P[i - 1][1]][side], u = t - t1;
    const k = ease === 'spring' ? springResp(u, 4.4 / d1, 0.5) : E.inOut(clamp(u / d1));
    let a1 = lerp(prev[0], cur[0], k), a2 = lerp(prev[1], cur[1], k);
    const nx = P[i + 1];
    if (nx && nx[3] === 'spring' && t > nx[0] - 0.1 && t < nx[0]) { const w = 0.16 * bell((t - (nx[0] - 0.1)) / 0.1), nxp = POSE[nx[1]][side]; a1 += (cur[0] - nxp[0]) * w; a2 += (cur[1] - nxp[1]) * w; }
    return [a1, a2, k < 0.35 ? prev[2] : cur[2], k < 0.35 ? prev[3] : cur[3]];
  }
  function turnOf(K, t) {
    const Tn = K.T, i = lastIdx(Tn, t), [t1, v1, d1] = Tn[i];
    if (!i || d1 === 0) return v1;
    return lerp(Tn[i - 1][1], v1, springResp(t - t1, 4.0 / d1, 0.72));
  }
  function exprOf(D, K, t) {
    const X = K.X, i = lastIdx(X, t), [t1, e1, d1] = X[i], cur = resolveExpr(D, e1);
    if (!i || d1 === 0) return cur;
    return blendExpr(resolveExpr(D, X[i - 1][1]), cur, E.inOut(clamp((t - t1) / d1)));
  }
  function lookOf(K, t) {
    const L = K.L, i = lastIdx(L, t), [t1, l1] = L[i];
    if (!i) return l1;
    const [, l0] = L[i - 1], k = E.inOut(clamp(inv(t1, t1 + 0.16, t)));
    return [lerp(l0[0], l1[0], k), lerp(l0[1], l1[1], k)];
  }
  const whoOf = { cam: 'cam', vera: 'viz', dante: 'tur' };
  function applyMoves(K, t, a) {
    for (const m of K.M) {
      if (m.type === 'walk' && t > m.t1) a.x += m.x1;
      if (t < m.t0 || t > m.t1) continue;
      const u = clamp(inv(m.t0, m.t1, t)), tt = t - m.t0;
      switch (m.type) {
        case 'breath': a.body.dy += -0.45 * Math.sin(t * 2 * Math.PI * 0.24); a.sy *= 1 + 0.005 * Math.sin(t * 2 * Math.PI * 0.24); a.head.rot += 0.9 * Math.sin(t * 2 * Math.PI * 0.11); break;
        case 'thumb': a.armBias.R += m.amp * Math.sin(t * 2 * Math.PI * m.f); break;
        case 'wave': a.armBias[m.side] += m.amp * Math.sin(t * 2 * Math.PI * m.f) * bell(u) ** 0.5; break;
        case 'lean': { const k = springResp(tt, 14, 0.55) * (1 - E.inOut(clamp((t - (m.t1 - 0.25)) / 0.25))); a.body.rot += m.rot * k; a.head.rot += m.rot * 0.35 * k; break; }
        case 'sway': a.body.rot += m.amp * Math.sin(t * 2 * Math.PI * m.f) * Math.min(1, tt / 0.3); a.head.rot -= m.amp * 0.5 * Math.sin(t * 2 * Math.PI * m.f - 0.5); break;
        case 'nod': a.head.nod += m.amp * Math.sin(t * 2 * Math.PI * m.f); break;
        case 'shake': { const env = Math.min(1, tt / 0.25) * (1 - clamp((t - (m.t1 - 0.4)) / 0.4)); a.body.rot += m.amp * Math.sin(t * 2 * Math.PI * m.f) * env; a.head.nod += m.amp * 0.8 * Math.abs(Math.sin(t * 2 * Math.PI * m.f)) * env; a.sy *= 1 + 0.01 * m.amp * Math.sin(t * 2 * Math.PI * m.f * 1.6) * env; break; }
        case 'flinch': { const k = Math.exp(-tt * 8) * Math.sin(tt * 40); a.x += m.amp * 10 * k; a.sy *= 1 - 0.05 * m.amp * Math.exp(-tt * 9); break; }
        case 'tears': for (let i = 0; i < 2; i++) { const ph = (t * 1.7 + i * 0.5) % 1; a.headOver.push({ t: 'ellipse', x: i ? 17 : -17, y: 22 + ph * 34, rx: 4.6, ry: 7.2, fill: 'tear', op: 1 - ph }); } break;
        case 'sweat': { const ph = clamp(inv(m.t0, m.t1, t)); a.headOver.push({ t: 'ellipse', x: 41, y: -6 + ph * 40, rx: 5, ry: 8, fill: 'tear', op: 1 - ph * 0.6 }); break; }
        case 'mime': a.mouth = { t: 'open', open: 0.25 + 0.5 * Math.abs(Math.sin(t * 13)), curve: 0.4, w: 0.9 }; break;
        case 'lie': a.rot += -90; break;
        case 'sleep': a.sy *= 1 + 0.03 * Math.sin(t * 2 * Math.PI * 0.35); a.body.dy += -0.8 * Math.sin(t * 2 * Math.PI * 0.35); a.head.rot += 3; break;
        case 'hop': {
          // agachada (antecipação) → esticada no ar → queda com amassada → mola
          const d = 0.16, fly = 0.42, q = tt;
          if (q < d) { const k = E.inOut(q / d); a.sy *= 1 - 0.1 * k; a.sx *= 1 + 0.07 * k; a.body.dy += 4 * k; }
          else if (q < d + fly) { const f = (q - d) / fly; a.y -= m.h * 4 * f * (1 - f); a.sy *= 1 + 0.09 * bell(f); a.sx *= 1 - 0.05 * bell(f); a.legL.lift = 5 * bell(f); a.legR.lift = 6 * bell(f); if (m.arms) a.arm = { w: E.out(clamp(f * 3.2)) * (1 - E.in(clamp((f - 0.82) / 0.18))), L: [128, 150, 'fist'], R: [118, -210, 'rest', 'phone'] }; }
          else { const r = q - d - fly, k = Math.exp(-r * 9) * Math.cos(r * 28); a.sy *= 1 - 0.1 * k; a.sx *= 1 + 0.07 * k; a.body.dy += 4 * k; }
          break;
        }
        case 'walk': {
          const e = E.inOut(u), env = Math.min(1, Math.min(tt / 0.12, (m.t1 - t) / 0.14)), ph = (t - m.t0) * 2 * Math.PI * (m.f ?? 2.2), s = Math.sin(ph);
          a.x += lerp(m.x0, m.x1, e);
          a.legL.lift = Math.max(0, s) * 6 * env; a.legR.lift = Math.max(0, -s) * 6 * env;
          a.body.dy += -1.6 * Math.abs(s) * env; a.body.rot += ((m.lean ?? 3) * m.dir * 0.8 + 1.8 * s) * env + (m.swagger ? 3.5 * Math.sin(ph * 0.5) : 0);
          a.head.rot += 1.2 * s * env; a.head.turn += m.dir * 0.3 * env; a.y += -Math.abs(s) * 7 * env;
          const sw = 22 * env * (m.hush ? 0.5 : 1); a.arm = { w: env, L: [10 + sw * s, 4 + sw * 0.6 * s, 'rest'], R: [10 - sw * s, 4 - sw * 0.6 * s, 'rest'] };
          if (m.swagger) { a.arm = { w: env, L: [30 + 20 * s, -10 + 14 * s, 'fist'], R: [30 - 20 * s, -10 - 14 * s, 'fist'] }; a.body.dy += -2 * env; }
          if (m.stomp) a.y += 5 * Math.abs(Math.cos(ph)) * env;
          break;
        }
        default: break;
      }
    }
  }
  const BLINK = (k) => [1.3 + k, 4.9 + k, 8.4 + k, 12.1 + k, 15.6 + k, 19.2 + k, 22.8 + k, 26.3 + k, 29.9 + k, 33.5 + k, 37.1 + k, 40.7 + k, 44.3 + k, 47.9 + k, 51.4 + k, 55 + k];
  function draw(I, t, id = I.id) {
    const K = TR[id];
    if (!K) return;
    const a = { x: 0, y: 0, rot: 0, sx: 1, sy: 1, body: { dx: 0, dy: 0, rot: 0 }, head: { rot: 0, nod: 0, turn: 0 }, legL: {}, legR: {}, headOver: [], arm: null, armBias: { L: 0, R: 0 }, mouth: null };
    applyMoves(K, t, a);
    a.head.turn += turnOf(K, t);
    const exprBase = exprOf(I.p.D, K, t);
    const look = lookOf(K, t);
    const w = whoOf[I.key], sg = w && segs.find((s) => s.who === w && t >= s.at - 0.04 && t <= s.end + 0.06);
    const ov = { eyes: { look: look.map((x) => +x.toFixed(3)) } };
    let nod = 0, gest = 0;
    const exprCurve = exprBase?.mouth?.curve ?? 0.1;
    if (sg) {
      const m = residentMouth(sg.voice, sg.at, t + LEAD, 0.95);
      if (m && m.t !== 'line') ov.mouth = { ...m, curve: Math.max(m.curve ?? 0, exprCurve * 0.6) };
      const u = (t - sg.words[0].t) / 0.45;
      if (u > 0 && u < 1) { const b = Math.sin(Math.PI * u); nod += 2 * b; gest += 3 * b; }
    }
    if (a.mouth) ov.mouth = a.mouth;
    const mix = (base, o2, wgt) => (o2 && wgt > 0 ? [lerp(base[0], o2[0], wgt), lerp(base[1], o2[1], wgt), wgt > 0.5 ? o2[2] : base[2], wgt > 0.5 ? undefined : base[3]] : base);
    let L = armOf(K, t, 'armL'), R = armOf(K, t, 'armR');
    L = [L[0] + a.armBias.L * 0.4, L[1] + a.armBias.L, L[2], L[3]]; R = [R[0] + a.armBias.R * 0.2, R[1] + a.armBias.R, R[2], R[3]];
    if (a.arm) { L = mix(L, a.arm.L, a.arm.w); R = mix(R, a.arm.R, a.arm.w); }
    const g = (x) => (x[2] === 'rest' && !x[3] ? x : [x[0], +(x[1] + gest).toFixed(2), x[2], x[3]]);
    const clean = (x) => x.filter((y) => y !== undefined).map((y) => (typeof y === 'number' ? +y.toFixed(2) : y));
    const rnd = (x) => +x.toFixed(2);
    const ph = id.length * 0.7;
    const pose = { armL: clean(g(L)), armR: clean(g(R)), body: { dx: rnd(a.body.dx), dy: rnd(a.body.dy), rot: rnd(a.body.rot) }, head: { rot: rnd(a.head.rot), nod: rnd(a.head.nod + nod), turn: rnd(a.head.turn) }, legL: { lift: rnd(a.legL.lift || 0) }, legR: { lift: rnd(a.legR.lift || 0) }, headOver: a.headOver };
    const o = { pose, expr: exprBase, overlay: ov, blink: BLINK(ph % 1.7).some((b) => t >= b && t < b + 0.12), view: 'front', headExtra: 0 };
    I.n.innerHTML = renderCharacter(I.p.D, o).replace('<svg ', '<svg width="100%" height="100%" style="display:block;overflow:visible" ');
    I.n.style.transform = `translate(${a.x.toFixed(1)}px, ${a.y.toFixed(1)}px) rotate(${a.rot.toFixed(2)}deg) scale(${a.sx.toFixed(4)}, ${a.sy.toFixed(4)})`;
    I.pos = { x: a.x, y: a.y, rot: a.body.rot };
  }

  // ------------------------------------------------------------ planos (câmera com mola e panorâmica)
  const FR = (sc, who, s, ex = 540, ey = 800) => { const p = SCENES[sc].chars[who]; return { s, cx: p.x - (ex - 540) / s, cy: p.eye - (ey - 960) / s }; };
  const wide = (sc, s = 1.0) => ({ s, cx: SCENES[sc].w / 2, cy: SCENES[sc].h / 2 });
  const shots = [];
  const shot = (scene, t0, t1, f, o = {}) => shots.push({ kind: 'scene', scene, t0, t1, f, ...o });
  // sala
  shot('living', 0, S.n1.end + 0.2, FR('living', 'cam', 1.2, 540, 1030), { f2: FR('living', 'cam', 1.38, 540, 1030) });
  shot('living', S.n1.end + 0.2, S.c1a.end + 0.1, FR('living', 'cam', 1.55, 540, 1000), { bump: S.c1a.at + 0.3, amp: 0.04 });
  shot('living', S.c1a.end + 0.1, S.n2a.end + 0.1, FR('living', 'cam', 1.7, 540, 1000), { creep: 0.05 });
  shot('living', S.n2a.end + 0.1, c.card1, FR('living', 'cam', 1.85, 540, 1000), { bump: S.n2b.at, amp: 0.05 });
  shots.push({ kind: 'card', t0: c.card1, t1: c.card1End, i: 0 });
  // dia 1: sala (espiada nervosa) e armário
  shot('living', c.card1End, c.livingOut + 0.45, FR('living', 'cam', 1.5, 540, 1050), { f2: FR('living', 'cam', 1.35, 600, 1050) });
  shot('closet', c.livingOut + 0.45, S.c2.at - 0.05, { s: 1.0, cx: 720, cy: 1200 }, { f2: { s: 1.45, cx: 720, cy: 1120 } });
  shot('closet', S.c2.at - 0.05, c.confe1 - 0.42, FR('closet', 'cam', 2.05, 540, 820), { creep: 0.07 });
  shot('closet', c.confe1 - 0.42, S.n4b.at - 0.1, FR('closet', 'cam', 1.35, 540, 880), { bump: c.confe1, amp: 0.07 });
  shot('closet', S.n4b.at - 0.1, c.card2, FR('closet', 'cam', 2.1, 540, 820), { creep: 0.06 });
  shots.push({ kind: 'card', t0: c.card2, t1: c.card2End, i: 1 });
  // chuveiro / vizinha
  shot('bath', c.card2End, S.n5b.end - 0.1, FR('bath', 'cam', 1.3, 540, 780), { f2: FR('bath', 'cam', 1.5, 540, 780) });
  shot('neighbor', S.n5b.end - 0.1, c.knock + 0.04, FR('neighbor', 'vera', 1.6, 540, 800), { creep: 0.04 });
  shot('bath', c.knock + 0.04, S.v1.at - 0.05, FR('bath', 'cam', 1.55, 540, 790), { shake: c.knock });
  shot('neighbor', S.v1.at - 0.05, S.c3.at + 0.05, FR('neighbor', 'vera', 1.7, 540, 800), { f2: FR('neighbor', 'vera', 1.85, 540, 800) });
  shot('bath', S.c3.at + 0.05, S.c3.end + 0.35, FR('bath', 'cam', 1.5, 540, 780), { bump: S.c3.at + 0.2, amp: 0.04 });
  shot('neighbor', S.c3.end + 0.35, c.card3, FR('neighbor', 'vera', 1.75, 540, 800), { bump: S.v2.at, amp: 0.05, shake: S.v2.at });
  shots.push({ kind: 'card', t0: c.card3, t1: c.card3End, i: 2 });
  // sonho
  shot('dream', c.card3End, S.n6c.at - 0.1, { s: 1.0, cx: 540, cy: 1540 }, { f2: { s: 1.1, cx: 540, cy: 1540 } });
  shot('dream', S.n6c.at - 0.1, c.street, { s: 1.15, cx: 540, cy: 1500 }, { creep: 0.04 });
  // rua
  shot('street', c.street, S.t1.at - 0.1, wide('street', 1.0), { f2: { s: 1.12, cx: 760, cy: 1200 } });
  shot('street', S.t1.at - 0.1, S.c4.at - 0.1, FR('street', 'dante', 1.5, 450, 990), { creep: 0.04 });
  shot('street', S.c4.at - 0.1, S.t2.at - 0.1, FR('street', 'cam', 1.7, 520, 820), { creep: 0.04 });
  shot('street', S.t2.at - 0.1, S.t2.at + 1.15, FR('street', 'dante', 1.6, 540, 1010), { creep: 0.04 });
  shot('street', S.t2.at + 1.15, S.t2.end + 0.55, FR('street', 'cam', 1.9, 540, 820), { bump: S.t2.at + 1.15, amp: 0.07 });
  shot('street', S.t2.end + 0.55, c.card4, { s: 1.05, cx: 720, cy: 1200 }, { f2: { s: 1.15, cx: 480, cy: 1200 } });
  shots.push({ kind: 'card', t0: c.card4, t1: c.card4End, i: 3 });
  // bar
  shot('bar', c.card4End, S.c5.at - 0.1, { s: 0.88, cx: 960, cy: 1260 }, { f2: { s: 0.98, cx: 900, cy: 1240 } });
  shot('bar', S.c5.at - 0.1, S.c5.end + 0.1, FR('bar', 'cam', 1.7, 520, 820), { creep: 0.04 });
  shot('bar', S.c5.end + 0.1, S.c5.end + 0.6, { s: 0.85, cx: 900, cy: 1200 }, { bump: c.laugh, amp: 0.05, shake: c.laugh });
  shot('bar', S.c5.end + 0.6, S.c5.end + 1.05, FR('bar', 'nia', 1.9, 540, 820), { creep: 0.05 });
  shot('bar', S.c5.end + 1.05, S.n10.at + 0.2, FR('bar', 'malik', 1.9, 540, 820), { creep: 0.05 });
  shot('bar', S.n10.at + 0.2, c.card5, FR('bar', 'cam', 1.9, 520, 820), { creep: 0.06 });
  shots.push({ kind: 'card', t0: c.card5, t1: c.card5End, i: 4 });
  // armário (dia 10.000)
  shot('closet2', c.card5End, S.c2b.at - 0.2, { s: 1.0, cx: 720, cy: 1200 }, { f2: { s: 1.5, cx: 720, cy: 1120 } });
  shot('closet2', S.c2b.at - 0.2, c.confe2 - 0.42, FR('closet', 'cam', 2.0, 540, 820), { creep: 0.08 });
  shot('closet2', c.confe2 - 0.42, c.endCard, FR('closet', 'cam', 1.4, 540, 880), { bump: c.confe2, amp: 0.07 });
  shots.push({ kind: 'end', t0: c.endCard, t1: duration + 1 });
  // ambiência por cena (o cartão já pertence à cena seguinte)
  { const AMB = { living: 'room', closet: 'hush', closet2: 'hush', bath: 'water', neighbor: 'room', dream: 'dream', street: 'city', bar: 'murmur' }, spans = [];
    shots.forEach((sh2, i) => { const eff = sh2.kind === 'card' ? shots[i + 1] : sh2; if (!eff || eff.kind !== 'scene') return; const kind = AMB[eff.scene], last = spans[spans.length - 1]; if (last && last.kind === kind && Math.abs(last.t1 - sh2.t0) < 0.02) last.t1 = sh2.t1; else spans.push({ t0: sh2.t0, t1: sh2.t1, kind }); });
    A.cue('ambience', 0, { place: 'dias', spans }); }
  const shotAt = (t) => shots.find((s) => t >= s.t0 && t < s.t1) || shots[shots.length - 1];
  const hand = (t) => ({ x: 4 * Math.sin(t * 2 * Math.PI * 0.13), y: 3 * Math.sin(t * 2 * Math.PI * 0.11 + 2), r: 0.15 * Math.sin(t * 2 * Math.PI * 0.09 + 0.5) });

  // ------------------------------------------------------------ quadro
  const capCache = { i: -2, cur: -2 };
  const dayAt = (t) => (t < c.card1End ? 0 : t < c.card2End ? 1 : t < c.card3End ? 2 : t < c.card4End ? 3 : t < c.card5End ? 4 : 5);
  const DAYS = ['', 'DIA 1', 'DIA 10', 'DIA 100', 'DIA 1000', 'DIA 10.000'];
  const SKYTINT = ['rgba(120,150,190,.2)', 'rgba(255,238,170,.10)', 'rgba(255,190,90,.14)', 'rgba(255,140,80,.2)', 'rgba(255,214,150,.1)', 'rgba(255,220,170,.1)'];
  const tint = el(overlay, 'div', 'layer', '', { width: `${W}px`, height: `${H}px` });
  const glow = el(overlay, 'div', 'layer', '', { width: `${W}px`, height: `${H}px` });
  const dark = el(overlay, 'div', 'layer', '', { width: `${W}px`, height: `${H}px`, background: 'radial-gradient(ellipse 60% 44% at 50% 46%, rgba(10,10,20,0) 0%, rgba(8,8,18,.46) 62%, rgba(4,4,12,.74) 100%)' });
  const vign = el(overlay, 'div', 'layer', '', { width: `${W}px`, height: `${H}px`, background: 'radial-gradient(ellipse 72% 56% at 50% 44%, rgba(0,0,0,0) 56%, rgba(30,20,12,.32) 100%)' });
  for (const n of [...Object.values(sceneL).map((s) => s.L), phone, card, endL, tint, dark, glow, vign, conf, prompt, banner, ...hookIcons, chip, tag, ...endChips, ask, fine, capN]) overlay.append(n);
  fade(prompt, 0);
  const sub = 'Prazer em conhecer!';
  const cp = (id) => inst.find((x) => x.id === id)?.pos || { x: 0, y: 0, rot: 0 };
  // adesivo centralizado: entra com mola (escala), sai com fade; nenhuma rotação e nenhum balanço
  const pin = (n, t, t0, t1, { x, y, s = 1 }) => {
    if (t < t0 - 0.001 || t > t1 + 0.16) { fade(n, 0); return; }
    const kIn = t0 < 0 ? 1 : clamp(inv(t0, t0 + 0.3, t)), sp = t0 < 0 ? 1 : E.spring(kIn), kOut = E.in(clamp(inv(t1, t1 + 0.16, t)));
    fade(n, Math.min(1, kIn * 5) * (1 - kOut));
    css(n, { left: x, top: y, transform: `translate(-50%, -50%) scale(${(s * (0.62 + 0.38 * sp) * (1 - 0.12 * kOut)).toFixed(4)})` });
  };
  function render(t) {
    const idx = Math.max(0, shots.findIndex((x) => t >= x.t0 && t < x.t1)), sh = shots[idx] || shots[shots.length - 1];
    const isCard = sh.kind === 'card', under = isCard ? shots[Math.min(shots.length - 1, idx + 1)] : sh;
    const ts = isCard ? under.t0 : t;
    const showScene = under.kind === 'scene', key = under.scene === 'closet2' ? 'closet' : under.scene;
    for (const [name, s] of Object.entries(sceneL)) { const on = showScene && name === key; fade(s.L, on ? 1 : 0); s.L.style.filter = on && isCard ? 'blur(16px) brightness(.8)' : ''; }
    fade(phone, 0); fade(card, isCard ? 1 : 0); fade(endL, sh.kind === 'end' ? 1 : 0);
    cg.clearRect(0, 0, W, H);
    if (showScene) {
      const sc = sceneL[key], u = clamp(inv(under.t0, under.t1, ts));
      let f = under.f;
      if (under.f2) { const e = E.camera(u); f = { s: Math.exp(lerp(Math.log(under.f.s), Math.log(under.f2.s), e)), cx: lerp(under.f.cx, under.f2.cx, e), cy: lerp(under.f.cy, under.f2.cy, e) }; }
      const kb = under.bump != null && ts >= under.bump ? (under.amp ?? 0.05) * Math.exp(-(ts - under.bump) * 9) : 0;
      const s = f.s * (1 + (under.f2 ? 0 : (under.creep ?? 0.03)) * E.inOut(u)) * (1 + kb);
      const hd = hand(ts); let sx = 0, sy = 0;
      const hw = 540 / s + 10, hh = 960 / s + 10, fcx = Math.max(hw, Math.min(sc.sc.w - hw, f.cx)), fcy = Math.max(hh, Math.min(sc.sc.h - hh, f.cy));
      if (under.shake != null && ts >= under.shake) { const k = ts - under.shake, am = 16 * Math.exp(-k * 10); sx = am * Math.sin(k * 71); sy = am * Math.cos(k * 59); }
      sc.world.style.transform = `translate(${(540 + hd.x + sx).toFixed(2)}px, ${(960 + hd.y + sy).toFixed(2)}px) rotate(${hd.r.toFixed(3)}deg) scale(${(s * 1.004).toFixed(5)}) translate(${(-fcx).toFixed(2)}px, ${(-fcy).toFixed(2)}px)`;
      for (const I of inst) if (I.scene === key) draw(I, ts, key === 'closet' && ts >= c.card5End ? 'closet2.cam' : I.id);
      if (key === 'bath') {
        drops.forEach((d, i) => { const ph = ((ts * 2.2 + i * 0.137) % 1); d.style.transform = `translateY(${(ph * 880 - 60).toFixed(0)}px)`; });
        steam.forEach((n, i) => { const ph = (ts * 0.35 + i * 0.21) % 1; css(n, { transform: `translateY(${(-ph * 520).toFixed(0)}px) scale(${(0.8 + ph * 0.9).toFixed(3)})`, opacity: (0.7 * bell(ph)).toFixed(3) }); });
        const pop = E.spring(clamp((ts - c.knock) / 0.2));
        css(exclBath, { opacity: ts >= c.knock && ts < c.knock + 1.0 ? '1' : '0', transform: `scale(${(0.4 + 0.6 * pop).toFixed(3)})` });
      }
      if (key === 'neighbor') {
        const pp = E.spring(clamp((ts - (S.c3.at + 0.95)) / 0.2));
        css(exclNeighbor, { opacity: ts >= S.c3.at + 0.95 && ts < S.c3.at + 1.8 ? '1' : '0', transform: `scale(${(0.4 + 0.6 * pp).toFixed(3)})` });
      }
      if (key === 'dream') {
        const p = E.out(clamp(inv(S.n6b.at - 0.1, S.n6b.at + 0.4, ts)));
        css(dreamBub, { opacity: p.toFixed(3), transform: `scale(${Math.min(1, 0.6 + 0.4 * E.spring(p)).toFixed(3)}) translateY(${((1 - p) * 40).toFixed(1)}px)` });
        bubbleDots.forEach((d, i) => { d.style.opacity = String(clamp(inv(S.n6b.at - 0.1 + i * 0.1, S.n6b.at + 0.1 + i * 0.1, ts))); });
        subEl.textContent = sub.slice(0, Math.floor(clamp((ts - (S.n6b.at + 0.25)) / 0.9) * sub.length));
        zzz.forEach((z, i) => { const ph = ((ts * 0.4 + i * 0.33) % 1); css(z, { transform: `translate(${(ph * 120 + 8 * Math.sin(ts * 3 + i)).toFixed(1)}px, ${(-ph * 280).toFixed(1)}px) scale(${(0.5 + ph * 0.8).toFixed(3)})`, opacity: (0.9 * bell(ph)).toFixed(3) }); });
      }
      if (key === 'closet') {
        const dc = ts < c.card5End ? c.doorClose : c.card5End + 0.5;
        const k = E.inOut(clamp((ts - (dc - 0.3)) / 0.3));
        css(doorLight, { transform: `scaleX(${(1 - k).toFixed(3)})`, opacity: (1 - k).toFixed(3) });
      }
      if (key === 'street') {
        const pp = E.spring(clamp((ts - (S.t2.at + 1.15)) / 0.2));
        css(exclStreet, { opacity: ts >= S.t2.at + 1.15 && ts < S.t2.at + 2.0 ? '1' : '0', transform: `scale(${(0.4 + 0.6 * pp).toFixed(3)})` });
      }
    }
    // luz do celular no armário (escuro + brilho)
    const inCloset = showScene && key === 'closet';
    const dcN = ts < c.card5End ? c.doorClose : c.card5End + 0.5;
    const lit = inCloset ? E.inOut(clamp((ts - (dcN - 0.3)) / 0.3)) : 0;
    fade(dark, isCard ? 0 : lit);
    const flash = inCloset ? Math.max(pulse(ts, c.confe1 - 0.05, c.confe1 + 0.9, 0.05, 0.5), pulse(ts, c.confe2 - 0.05, c.confe2 + 0.9, 0.05, 0.5)) : 0;
    css(glow, { background: `radial-gradient(ellipse 50% 36% at 50% 52%, rgba(127,227,213,${(lit * (0.2 + 0.2 * flash)).toFixed(3)}), rgba(127,227,213,0) 70%)`, opacity: inCloset && !isCard ? '1' : '0' });
    const d = dayAt(t);
    css(tint, { background: SKYTINT[d], opacity: showScene && !inCloset ? '1' : '0' });
    fade(vign, showScene ? 1 : 0);
    // cartão do dia: o número cai no centro REAL do quadro, por cima da próxima cena desfocada
    if (isCard) {
      const C = CARDS[sh.i], u = t - sh.t0, k = springResp(u, 16, 0.42);
      card.style.background = C.bg; cardNum.textContent = C.n; cardNum.style.color = C.dark ? '#14241C' : '#FFFDF7'; cardLbl.style.color = C.dark ? '#14241C' : '#FFFDF7';
      const big = C.n.length > 4 ? 250 : C.n.length > 3 ? 300 : 380;
      css(cardNum, { fontSize: `${big}px`, top: big === 380 ? '800px' : big === 300 ? '830px' : '860px', transform: `scale(${(0.3 + 0.7 * k).toFixed(4)})` });
      css(cardLbl, { fontSize: '120px', top: '680px', transform: `translateY(${((1 - E.out(clamp(inv(0, 0.25, u)))) * -50).toFixed(1)}px)`, opacity: E.out(clamp(inv(0, 0.25, u))).toFixed(3) });
      css(cardCal, { opacity: '0.45', transform: `translateX(${((u * 220) % 300).toFixed(1)}px)` });
    } else if (inCloset) {
      confetti(t, c.confe1, W / 2, 1180, 2.3, 150); confetti(t, c.confe2, W / 2, 1180, 2.3, 150);
    }
    // banner de download por cima do Cam (o rosto dele fica sempre em cena)
    { const b0 = S.c1b.at - 0.12, b1 = S.n2b.at + 0.1;
      if (t >= b0 && t <= b1 + 0.3) {
        const kIn = Math.min(1.12, springResp(t - b0, 15, 0.55)), kOut = E.in(clamp((t - b1) / 0.22)), p = E.inOut(clamp(inv(S.c1b.at, S.n2a.at - 0.05, t)));
        bnb.style.width = `${(p * 100).toFixed(1)}%`; bnp.textContent = p >= 0.995 ? 'instalado ✓' : `baixando… ${Math.round(p * 100)}%`;
        fade(banner, Math.min(1, kIn * 4) * (1 - kOut));
        css(banner, { left: 540, top: lerp(250, 420, Math.min(1, kIn)) - 150 * kOut, transform: `translate(-50%, -50%) scale(${(0.9 + 0.1 * Math.min(1.05, kIn)).toFixed(4)})` });
      } else fade(banner, 0); }
    // rótulos e HUD: tudo no eixo central, sem inclinação
    pin(tag, t, -1, S.c1a.at - 0.1, { x: 540, y: 335 });
    hookIcons.forEach((n, i) => { const u = (t - (0.45 + 0.3 * i)) / 1.2; if (u < 0 || u > 1) { fade(n, 0); return; } const dx = i ? 1 : -1; css(n, { left: 540 + dx * (260 * u + 40 * Math.sin(u * 3)), top: 1090 - 900 * u + 1150 * u * u, transform: `translate(-50%, -50%) rotate(${(dx * u * 420).toFixed(1)}deg) scale(${(0.55 + 0.5 * Math.min(1, u * 4)).toFixed(3)})` }); fade(n, 1 - clamp((u - 0.72) / 0.28)); });
    chip.innerHTML = DAYS[d] || '';
    pin(chip, t, d ? [c.card1End, c.card2End, c.card3End, c.card4End, c.card5End][d - 1] + 0.04 : 9e9, d && d < 5 ? [c.card2, c.card3, c.card4, c.card5][d - 1] - 0.2 : c.endCard - 0.1, { x: 540, y: 300, s: 0.95 });
    pin(prompt, t, c.card1End + 0.05, S.n3c.at - 0.1, { x: 540, y: 440 });
    [[310, 840], [770, 840], [310, 1000], [770, 1000]].forEach(([x, y], i) => pin(endChips[i], t, c.endCard + 0.1 + i * 0.025, duration + 1, { x, y }));
    pin(ask, t, c.endCard + 0.02, duration + 1, { x: 540, y: 560 });
    pin(fine, t, c.endCard + 0.5, duration + 1, { x: 540, y: 1190, s: 0.9 });
    // legenda palavra por palavra (caixa alta, palavra da vez em cor)
    let pi = -1; for (let i = 0; i < PAGES.length; i++) if (t >= PAGES[i].start && t < PAGES[i].end) { pi = i; break; }
    if (pi < 0 || isCard || sh.kind === 'end') { fade(capN, 0); capCache.i = -1; }
    else {
      const pg = PAGES[pi], col = HI[pg.words[0].who] || '#F8C637';
      if (capCache.i !== pi) { capCache.i = pi; capCache.cur = -2; capN.innerHTML = pg.words.map((x, i) => `<span data-i="${i}">${x.w}</span>`).join(' '); capN.style.transform = 'none'; capCache.fit = Math.min(1, 930 / Math.max(1, capN.offsetWidth)); }
      let cur = -1; pg.words.forEach((x, i) => { if (t >= x.t - 0.03) cur = i; });
      if (capCache.cur !== cur) { capCache.cur = cur; capN.querySelectorAll('span').forEach((n, i) => { n.style.color = i === cur ? col : '#FFFDF7'; }); }
      const k = E.out(clamp(inv(pg.start, pg.start + 0.1, t)));
      fade(capN, 1); css(capN, { top: showScene && key === 'dream' ? 1010 : 1165, transform: `translate(-50%, -50%) scale(${((0.88 + 0.12 * k) * (capCache.fit ?? 1)).toFixed(4)})` });
    }
  }
  const CUTS = shots.map((x) => x.t0).filter((x) => x > 0);
  const FASTW = [[c.card1, c.card1 + 0.4], [c.card2, c.card2 + 0.4], [c.card3, c.card3 + 0.4], [c.card4, c.card4 + 0.4], [c.card5, c.card5 + 0.4], [c.knock - 0.05, c.knock + 0.45], [c.confe1 - 0.4, c.confe1 + 0.3], [c.confe2 - 0.4, c.confe2 + 0.3], [c.livingOut, c.livingOut + 0.5], [c.walkIn, c.walkIn + 0.4], [S.v2.end + 0.08, S.v2.end + 0.5], [c.laugh, c.laugh + 0.4], [S.t2.at, S.t2.at + 0.3]];
  const samples = (t) => {
    if (CUTS.some((x) => Math.abs(t - x) < 0.02)) return 1;
    return FASTW.some(([a, b]) => t > a && t < b) ? [8, 0.5] : 1;
  };
  return { duration, cues: c, captions, audio: A.items, samples, render, hook: { title: 'E se o Cam treinasse inglês todo dia?' }, safe: [120, 270, 960, 1248], async ready() { return true; } };
}
