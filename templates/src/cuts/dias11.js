// "E SE VOCÊ FALASSE INGLÊS TODO DIA?" v11 (04/11): revisão do v10 por 14 agentes (review/v10/plano-v11.md). Base: v10 (~32 s, Reels): sem narrador. Roteiro em docs/roteiro-dias-v9.md (seção v10),
// decidido em 4 rodadas de crítica (Haiku e Sonnet). Eixo único: QUEM ESCUTA o inglês do Caio (porta → teto → a vizinha
// dormindo → um estranho → os amigos) e a regra: o inglês vaza. Nomes atuais do elenco do app: Caio (cam), Vera, Nina (nia),
// Marcos (malik), Beto (dante, de roupa comum). Mesmo motor de atuação do corte dias.js (molas, IK, expressões que se misturam).
import { E, clamp, lerp, inv, el, css, fade, AudioList } from './kit.js';
import { residentMouth } from '../core/visemes.js';
import { renderCharacter, EXPRESSIONS, mergeDesign } from '/character-rig.js';
import { DESIGNS } from '/character-designs.js';
import { align, segVoice } from './creator.js';
import { streetSVG } from './dias-scenes.js';
import { toiletSVG, floorsSVG } from './dias10-scenes.js';
import { barSVG } from './bar-room.js';
import { tableSVG } from './dias-scenes.js';
import { camSignature, camHome, camBare, camPJ, veraPJ, veraBroom, betoStreet } from './dias-outfits.js';

const LEAD = 0.025;
// [arquivo, a, b, texto ("|" = troca de página da legenda), quem]
const SEG = {
  n0: ['dzN0', 0.0, 2.0, 'E se você falasse inglês todo dia?', 'nar'],
  v3: ['dzV4', 0.0, 1.4, 'Cala a boca, Caio!', 'vera'],
  c6: ['dzC6', 0.6, 1.72, '…thank you!', 'cam'],
  w1: ['dzC1', 0.10, 0.72, 'hello…', 'cam'],
  a1: ['dzA1', 0.0, 0.62, 'Mais alto!', 'app'],
  c2: ['dzC2', 0.08, 0.80, 'HELLO!', 'cam'],
  c3: ['dzC3', 0.04, 3.52, "How are you?|I'm fine, thank you! And you?", 'cam'],
  v1: ['dzV1', 0.25, 1.10, '…Cansada.', 'vera'],
  c4: ['dzC4', 0.03, 2.10, "hey… what's up…", 'cam'],
  v2: ['dzV2', 0.0, 1.45, 'Not much. You?', 'vera'],
  a2: ['dzA2', 0.0, 0.62, 'Perfeito!', 'app'],
  b1: ['dzB1', 0.0, 1.60, 'Moço, a rodoviária?', 'beto'],
  c5: ['camC4', 0.1, 3.0, 'Go straight,|then left at the bakery!', 'cam'],
  b2: ['dzB2', 0.0, 2.26, '…Moço, eu falo português.', 'beto'],
  n1: ['dzN1', 0.25, 1.48, 'Fala inglês aí, Caio!', 'nina'],
  w2: ['dzC1', 0.10, 0.72, '…hello.', 'cam'],
  m1: ['dzM1', 0.02, 0.80, 'Mais alto!', 'marcos'],
};
const EN = new Set(['w1', 'c2', 'c3', 'c4', 'c6', 'c5', 'w2']);
const HI = { nar: '#F8C637', cam: '#7FE3D5', vera: '#FF9BD8', app: '#B8F27A', beto: '#FFB36B', nina: '#D3B4FF', marcos: '#F8C637' };
const NAME = { nar: 'Narrador', cam: 'Caio', vera: 'Vera', app: 'App', beto: 'Beto', nina: 'Nina', marcos: 'Marcos' };
// a palavra do punch (a única destacada) e a tradução pequena (só onde o espectador precisa)
const PUNCH = { c2: 'HELLO!', v1: '…Cansada.', v3: 'Caio!', c6: 'you!', b2: 'português.', m1: 'alto!' };
const TRANS = {};
const NOCAP = new Set(['n0', 'a1']); // o narrador já está no título; o "Mais alto!" do app aparece no balão do celular

// ------------------------------------------------------------------ poses (braços [braço, antebraço ABSOLUTO, mão, objeto?])
const POSE = {
  rest: { armL: [10, 4, 'rest'], armR: [10, 4, 'rest'] },
  phone: { armL: [10, 4, 'rest'], armR: [34, -128, 'rest', 'phone'] },
  phoneMouth: { armL: [16, -10, 'rest'], armR: [26, -160, 'rest', 'phone'] },
  phoneHide: { armL: [34, -150, 'open'], armR: [26, -160, 'rest', 'phone'] },
  flush: { armL: [64, 58, 'point'], armR: [34, -128, 'rest', 'phone'] },
  armsOut: { armL: [66, 40, 'open'], armR: [66, 40, 'open'] },
  cheerPhone: { armL: [128, 150, 'fist'], armR: [100, -200, 'rest', 'phone'] },
  proud: { armL: [10, 4, 'rest'], armR: [30, -140, 'rest', 'phone'] },
  clench: { armL: [22, -140, 'fist'], armR: [22, -140, 'fist'] },
  point: { armL: [10, 4, 'rest'], armR: [84, 92, 'point'] },
  pointL: { armL: [84, -92, 'point'], armR: [10, 4, 'rest'] },
  pointMeek: { armL: [10, 4, 'rest'], armR: [50, 40, 'point'] },
  explain: { armL: [38, -30, 'open'], armR: [40, -24, 'open'] },
  openWide: { armL: [78, -70, 'open'], armR: [78, -70, 'open'] },
  chest: { armL: [10, 4, 'rest'], armR: [20, -120, 'open'] },
  textbook: { armL: [26, -60, 'open'], armR: [26, -60, 'open'] },
  scratch: { armL: [10, 4, 'rest'], armR: [60, -168, 'open'] },
  laugh: { armL: [26, -120, 'open'], armR: [26, -120, 'open'] },
  laughBelly: { armL: [22, -26, 'open'], armR: [22, -26, 'open'] },
  wipe: { armL: [14, -20, 'rest'], armR: [46, -172, 'open'] },
  slamR: { armL: [22, -40, 'open'], armR: [36, -12, 'fist'] },
  mic: { armL: [34, -40, 'open'], armR: [52, -148, 'fist', 'shampoo'] },
  micUp: { armL: [62, -96, 'open'], armR: [74, -172, 'fist', 'shampoo'] },
  micDown: { armL: [10, 4, 'rest'], armR: [40, -120, 'fist', 'shampoo'] },
  shrink: { armL: [18, -150, 'fist'], armR: [18, -150, 'fist'] },
  forehead: { armL: [10, 4, 'rest'], armR: [44, -172, 'open'] },
  broomUp: { armL: [128, 150, 'fist'], armR: [128, 150, 'fist', 'broom'] },
  pointLeft: { armL: [84, 92, 'point'], armR: [10, 4, 'rest'] },
};
const DEADPAN = { eyes: { open: 0.55, lid: 6 }, brows: { y: -0.1 }, mouth: { curve: -0.05, w: 0.7 } };
const SHOCK = { eyes: { open: 1.15, pupil: 0.55 }, brows: { y: 0.95 }, mouth: { t: 'wobble', w: 0.55 } };
const ASLEEP = { eyes: { closed: 'blink' }, brows: { y: 0.1 }, mouth: { curve: 0.4, w: 0.7 } };
const SMUG = { eyes: { open: 0.7, low: 0.3 }, brows: { y: 0.3, rot: -4 }, mouth: { curve: 0.7, w: 0.9, asym: 0.3 } };
const WORRY = { eyes: { open: 1.05, look: [0.3, 0.2] }, brows: { y: 0.7, rot: -14 }, mouth: { curve: -0.4, w: 0.7 } };
const TIRED = { eyes: { open: 0.5, lid: 8, look: [0, -0.9] }, brows: { y: -0.3, rot: 6 }, mouth: { curve: -0.25, w: 0.6 } };
const OFFENDED = { eyes: { open: 0.62, lid: 4 }, brows: { y: 0.15, rot: 12 }, mouth: { curve: -0.35, w: 0.55, asym: 0.3 } };

// ---- utilidades de atuação (as mesmas do corte dias.js)
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

const eyeH = (D) => D.height * 0.62;
const place = (who, x, eye, k, D) => ({ who, x, k, eye, feet: eye + eyeH(D) * k, D });
const SCENES = {
  toilet: { svg: toiletSVG, w: 1440, h: 2400, chars: { cam: place('cam', 780, 1010, 3.1, camHome) } },
  day: { svg: () => floorsSVG('day'), w: 1440, h: 2700, chars: { cam: place('cam', 700, 600, 2.6, camBare), vera: place('vera', 640, 1750, 3.3, veraPJ) } },
  night: { svg: () => floorsSVG('night'), w: 1440, h: 2700, chars: { cam: place('cam', 330, 860, 3.0, camPJ), vera: place('vera', 330, 2080, 3.0, veraPJ), vera2: { ...place('vera', 1010, 1846, 3.0, veraBroom), vis: 'stand' } } },
  street: { svg: streetSVG, w: 1440, h: 2400, chars: { cam: place('cam', 420, 980, 3.1, camSignature), beto: place('beto', 1000, 1000, 3.0, betoStreet) } },
  bar: { svg: barSVG, w: 1800, h: 2600, chars: { cam: place('cam', 560, 1040, 3.0, camSignature), nia: place('nia', 950, 1070, 3.0, DESIGNS.nia), malik: place('malik', 1420, 1030, 3.0, DESIGNS.malik) } },
};

async function bitmap(svg, w, h, blur = 1.4) {
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
  // ------------------------------------------------------------ linha do tempo (cada fala inteira, sem corte nem esticada)
  const put = (key, gap = 0.12, o = {}) => {
    T += gap;
    const [id, a, b, raw, who] = SEG[key], text = raw.replace(/\|/g, ' ');
    const f = F[id];
    const words = align(text, f.spans, a, b);
    A.clip(id, T, a, b, V, { file: f.file, ...o });
    const off = T - a;
    S[key] = { key, id, who, at: T, end: T + b - a, a, b, voice: segVoice(f, a, b, words), words: words.map((x) => ({ w: x.w, t: x.t + off, e: x.e + off, who })), text, raw };
    T = S[key].end;
    return S[key];
  };
  // gancho: o narrador fala a pergunta por cima do Caio já no banheiro
  c.d1 = 0;
  put('n0', 0.1, { gain: 0.9 });
  // DIA 1: banheiro
  put('w1', 0.15, { gain: 1.0 });
  c.phone = S.w1.end + 0.05; T = c.phone + 0.22; put('a1', 0, { gain: 0.9, fx: 'phone' }); c.phoneEnd = S.a1.end + 0.32;
  c.feet = c.phoneEnd + 0.02; c.walk = c.feet + 0.5; c.flush = c.walk + 0.5;
  T = c.flush + 0.36; put('c2', 0, { gain: 1.3 });
  c.ding = S.c2.end + 0.12;
  // DIA 10: chuveiro em cima, a Vera embaixo (abre com o prédio cortado e os nomes)
  c.d10 = c.ding + 0.55; c.wideEnd = c.d10 + 1.2; T = c.d10 + 0.35; put('c3', 0);
  put('v1', 0.55, { gain: 1.0 });
  c.react10 = S.v1.end + 0.6;
  // DIA 100, 2h da manhã: ele fala inglês dormindo; a Vera acorda, bate a vassoura no teto e grita em inglês; ele responde dormindo
  c.d100 = c.react10 + 0.5; T = c.d100 + 0.35; put('c4', 0, { gain: 1.0 });
  c.wake = S.c4.end + 0.05; c.stand = c.wake + 0.5; c.bang = [c.stand + 0.12, c.stand + 0.34, c.stand + 0.56];
  T = c.stand + 0.72; put('v3', 0, { gain: 1.15 });
  put('c6', 0.45, { gain: 1.0 });
  // DIA 1000: a rua
  c.d1000 = S.c6.end + 0.65; T = c.d1000 + 0.5; put('b1', 0);
  put('c5', 0.25); put('b2', 0.6);
  // DIA 1001: o bar
  c.bar = S.b2.end + 0.8; T = c.bar + 0.35; put('n1', 0);
  c.freeze = S.n1.end + 0.05; put('w2', 0.5, { gain: 1.0 }); put('m1', 0.42, { gain: 1.0 });
  c.laugh = S.m1.end + 0.04; c.cta = S.m1.end + 0.5;
  const duration = +(c.cta + 1.6).toFixed(3);
  c.duration = duration;
  const segs = Object.values(S);
  for (const [k, v] of Object.entries(S)) c[k] = +v.at.toFixed(3);
  // cues que a trilha "dias" lê (estágios, acorde de cada dia, floreio final)
  c.card1 = 0.02; c.card2 = c.d10; c.card3 = c.d100; c.card4 = c.d1000; c.card5 = c.bar; c.endCard = c.cta;

  // ------------------------------------------------------------ som
  const DROPS = [[S.c3.end, S.v1.end + 0.25], [S.v3.end, S.c6.end + 0.3], [S.c5.end, S.b2.end + 0.45], [S.w2.at - 0.5, S.m1.at]];
  A.cue('music', 0, { sections: [[0, 'dias'], [duration, 'out']], drops: DROPS, bpm: 100, gain: 0.3, stages: [[0, 1], [c.d10, 2], [c.d100, 5], [c.d1000, 4], [c.bar, 3], [c.cta, 6]] });
  A.sfx('notif', S.a1.at - 0.16, { gain: 0.42 }); A.sfx('notif', S.m1.at - 0.16, { gain: 0.42 });
  A.sfx('step', c.feet - 0.05, { gain: 0.22, pan: 0.5 }); A.sfx('step', c.feet + 0.25, { gain: 0.22, pan: 0.5 });
  A.sfx('flush', c.flush, { gain: 0.45 });
  A.sfx('chip', c.ding, { gain: 0.5 });
  for (const t0 of [c.d10, c.d1000]) A.sfx('whoosh', t0 - 0.12, { gain: 0.2 });
  A.sfx('snore', c.d100 + 0.05, { gain: 0.35 }); A.sfx('snore', S.c4.end + 0.05, { gain: 0.3 });
  for (const b of c.bang) A.sfx('thud', b, { gain: 0.75 });
  A.sfx('sample', c.laugh, { file: 'audio/crowd-real/mixkit-424.wav', from: 0.55, len: 2.0, fadeOut: 0.7, gain: 0.6 });
  const captions = segs.map((s) => ({ start: s.at, end: s.end, who: NAME[s.who], text: s.text, lang: EN.has(s.key) ? 'en' : 'pt' })).sort((x, y) => x.start - y.start);

  // ------------------------------------------------------------ camadas das cenas
  const sceneL = {}, inst = [];
  for (const [name, sc] of Object.entries(SCENES)) {
    const L = el(overlay, 'div', 'layer', '', { width: `${W}px`, height: `${H}px`, overflow: 'hidden', background: '#000' });
    const world = el(L, 'div', '', '', { position: 'absolute', left: '0px', top: '0px', width: `${sc.w}px`, height: `${sc.h}px`, transformOrigin: '0 0' });
    el(world, 'img', '', '', { position: 'absolute', left: '0px', top: '0px', width: `${sc.w}px`, height: `${sc.h}px` }).src = await bitmap(sc.svg(), sc.w, sc.h, name === 'bar' ? 1.6 : 1.4);
    for (const [key, p] of Object.entries(sc.chars)) {
      const D = p.D, vb = Math.max(250, D.height * 0.92), h = D.height + 38;
      const n = el(world, 'div', '', '', { position: 'absolute', left: `${p.x - (vb / 2) * p.k}px`, top: `${p.feet - (D.height + 24) * p.k}px`, width: `${vb * p.k}px`, height: `${h * p.k}px`, transformOrigin: name === 'night' ? '50% 12%' : '50% 100%' });
      inst.push({ scene: name, key, p, n, id: `${name}.${key}` });
    }
    sceneL[name] = { L, world, sc, front: el(world, 'div', '', '', { position: 'absolute', left: '0px', top: '0px', width: `${sc.w}px`, height: `${sc.h}px`, pointerEvents: 'none' }) };
  }
  const wEl = (scene, html, style = {}, front = true) => el(front ? sceneL[scene].front : sceneL[scene].world, 'div', '', html, { position: 'absolute', ...style });
  // banheiro: fresta de luz debaixo da porta, a sombra dos chinelos que chega, o botão da descarga, o ✓ do app
  const gap = wEl('toilet', '', { left: '1024px', top: '1636px', width: '372px', height: '24px', background: '#FFF0BE', overflow: 'hidden', boxShadow: '0 0 18px 4px rgba(255,236,170,.55)' });
  const feet = el(gap, 'div', '', '<div style="position:absolute;left:70px;top:0;width:90px;height:24px;border-radius:12px;background:#3A2A1C"></div><div style="position:absolute;left:190px;top:0;width:90px;height:24px;border-radius:12px;background:#3A2A1C"></div>', { position: 'absolute', left: '0px', top: '0px', width: '372px', height: '24px' });
  const flushBtn = wEl('toilet', '', { left: '218px', top: '962px', width: '64px', height: '30px', borderRadius: '15px', background: '#C9CDD4', boxShadow: 'inset 0 -6px 0 #9AA0AE' });
  const check = (scene, x, y) => wEl(scene, '<svg width="150" height="150" viewBox="0 0 150 150"><circle cx="75" cy="75" r="66" fill="#3FB28D" stroke="#FFFDF7" stroke-width="10"/><path d="M42 78 l22 22 l46 -50" stroke="#FFFDF7" stroke-width="16" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>', { left: `${x}px`, top: `${y}px`, width: '150px', height: '150px', opacity: '0', transformOrigin: '50% 100%' });
  const check1 = check('toilet', 520, 620);
  const flushTxt = wEl('toilet', '<div style="font:700 92px/1 var(--display);color:#4FB6E8;-webkit-text-stroke:12px #FFFDF7;paint-order:stroke fill;transform:rotate(-8deg)">FLUSH!</div><svg width="300" height="150" viewBox="0 0 300 150" style="position:absolute;left:10px;top:330px"><path d="M30 40 q60 -40 120 0 t120 0 M50 90 q50 -30 100 0 t100 0" stroke="#7FC9E8" stroke-width="12" fill="none" stroke-linecap="round"/></svg>', { left: '70px', top: '830px', width: '360px', height: '520px', opacity: '0', transformOrigin: '30% 60%' });
  const pill = (scene, x, y, txt, bg) => wEl(scene, txt, { left: `${x}px`, top: `${y}px`, padding: '10px 34px 14px', borderRadius: '999px', background: bg, color: '#14241C', font: '700 70px/1 var(--display)', border: '6px solid #FFFDF7', boxShadow: '0 12px 24px -14px rgba(0,0,0,.6)', opacity: '0' });
  const lblCaio = pill('day', 930, 330, 'Caio', '#F8C637'), lblVera = pill('day', 890, 1560, 'Vera', '#C9B8F2');
  const dust = Array.from({ length: 14 }, (_, i) => wEl('night', '', { left: `${720 + ((i * 97) % 560)}px`, top: '1236px', width: `${8 + (i % 3) * 5}px`, height: `${8 + (i % 3) * 5}px`, borderRadius: '50%', background: '#CFC8E6', opacity: '0' }));
  // corte de piso de dia: vidro fosco do box (só no andar de cima), água e vapor
  wEl('day', '', { left: '0px', top: '696px', width: '1440px', height: '474px', background: 'linear-gradient(180deg, rgba(222,240,238,.78), rgba(196,226,222,.93))', borderTop: '16px solid #D5DCE2' });
  [200, 640, 1060].forEach((x, i) => wEl('day', '', { left: `${x}px`, top: '730px', width: `${34 + i * 12}px`, height: '430px', background: 'linear-gradient(180deg, rgba(255,255,255,.55), rgba(255,255,255,0))', borderRadius: '20px', transform: 'skewX(-8deg)' }));
  const water = wEl('day', '', { left: '780px', top: '-30px', width: '240px', height: '720px', overflow: 'hidden' }, false);
  const drops = Array.from({ length: 22 }, (_, i) => el(water, 'div', '', '', { position: 'absolute', left: `${(i * 37) % 220}px`, top: '0px', width: '5px', height: '70px', borderRadius: '3px', background: 'rgba(255,255,255,.75)' }));
  sceneL.day.world.insertBefore(water, inst.find((x) => x.id === 'day.cam').n);
  const steam = Array.from({ length: 5 }, (_, i) => wEl('day', '', { left: `${300 + i * 190}px`, top: '420px', width: '260px', height: '260px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,.55), rgba(255,255,255,0) 70%)' }, false));
  // corte de piso de noite: cobertores por cima dos corpos deitados, o celular aceso no travesseiro do Caio
  const blanket = (y, a, b) => wEl('night', Array.from({ length: 9 }, (_, i) => `<svg style="position:absolute;left:${80 + i * 96}px;top:${60 + (i % 3) * 70}px" width="40" height="40" viewBox="0 0 40 40"><path d="M20 2 l5 13 l14 1 l-11 9 l4 14 l-12 -8 l-12 8 l4 -14 l-11 -9 l14 -1z" fill="#FFE07A" opacity=".75"/></svg>`).join(''), { left: '560px', top: `${y}px`, width: '900px', height: '330px', borderRadius: '120px 40px 40px 120px', background: `linear-gradient(180deg, ${a}, ${b})`, boxShadow: 'inset 0 22px 0 rgba(255,255,255,.22), 0 18px 0 rgba(0,0,0,.18)', overflow: 'hidden' });
  blanket(460, '#3FA395', '#2F7F78'); const bl2 = blanket(1680, '#E58BB0', '#C76A92'); sceneL.night.world.insertBefore(bl2, inst.find((x) => x.id === 'night.vera2').n);
  const nPhone = wEl('night', '<div style="position:absolute;inset:0;border-radius:14px;background:#1B1F2A"></div><div style="position:absolute;left:8px;top:8px;right:8px;bottom:8px;border-radius:8px;background:#7FE3D5"></div>', { left: '640px', top: '440px', width: '110px', height: '62px', boxShadow: '0 0 60px 20px rgba(127,227,213,.0)' });
  const check2 = { style: {} }; nPhone.style.opacity = '0';
  const zzz = [0, 1, 2].map((i) => wEl('night', 'Z', { left: `${560 + (i % 2) * 20}px`, top: i < 2 ? '400px' : '1620px', font: '700 80px/1 var(--display)', color: '#FFF3C4', opacity: '0' }, false));
  // bar: balcão na frente
  wEl('bar', tableSVG().replace('width="1440" height="600"', 'width="1840" height="770"'), { left: '-20px', top: '1290px', width: '1840px', height: '770px' });
  const excl = (scene, x, y) => wEl(scene, '<svg width="90" height="150" viewBox="0 0 90 150"><rect x="28" y="6" width="34" height="86" rx="17" fill="#E2503A" stroke="#FFFDF7" stroke-width="8"/><circle cx="45" cy="124" r="17" fill="#E2503A" stroke="#FFFDF7" stroke-width="8"/></svg>', { left: `${x}px`, top: `${y}px`, width: '90px', height: '150px', transformOrigin: '50% 100%', opacity: '0' }, true);
  const exclStreet = excl('street', 560, 700), exclDay = excl('day', 860, 70);

  // ------------------------------------------------------------ textos (tudo no eixo central, dentro da área segura)
  const sticker = (html, style = {}) => { const n = el(overlay, 'div', '', html, { position: 'absolute', left: '0px', top: '0px', whiteSpace: 'nowrap', transformOrigin: '50% 50%', ...style }); fade(n, 0); return n; };
  const STROKE = { color: '#FFFDF7', WebkitTextStroke: '14px #14241C', paintOrder: 'stroke fill', textShadow: '0 8px 0 rgba(20,36,28,.28)', textAlign: 'center' };
  const title = sticker('E se você falasse<br>inglês todo dia?', { ...STROKE, font: '700 76px/1.1 var(--display)' });
  const chip = sticker('', { padding: '8px 30px 12px', borderRadius: '999px', background: '#14241C', color: '#F8C637', font: '700 54px/1 var(--display)', border: '5px solid #FFFDF7', boxShadow: '0 12px 24px -14px rgba(0,0,0,.7)', textAlign: 'center' });
  const cta = sticker('Quem aí fala inglês<br>escondido? 👀', { ...STROKE, font: '700 84px/1.1 var(--display)' });
  const phoneUI = el(overlay, 'div', '', `<div style="position:absolute;inset:0;border-radius:96px;background:#1B1F2A;box-shadow:0 60px 90px -30px rgba(0,0,0,.65)"></div>
    <div style="position:absolute;left:28px;top:28px;right:28px;bottom:28px;border-radius:72px;background:linear-gradient(180deg,#1C3A2B,#2F7F78);overflow:hidden">
      <div style="position:absolute;left:0;right:0;top:90px;text-align:center;font:700 66px/1 var(--display);color:#FFFDF7">Oi, Caio! 👋</div>
      <div style="position:absolute;left:0;right:0;top:180px;text-align:center;font:600 40px/1.2 var(--ui);color:#BFE9E0">fale em voz alta:</div>
      <div style="position:absolute;left:0;right:0;top:240px;text-align:center;font:700 74px/1 var(--display);color:#F8C637">Hello</div>
      <div id="mic" style="position:absolute;left:50%;top:420px;width:190px;height:190px;margin-left:-95px;border-radius:50%;background:#FFFDF7;display:flex;align-items:center;justify-content:center"><svg width="90" height="120" viewBox="0 0 80 110"><rect x="24" y="4" width="32" height="62" rx="16" fill="#1C3A2B"/><path d="M12 54 a28 28 0 0 0 56 0" stroke="#1C3A2B" stroke-width="7" fill="none"/><path d="M40 82 v20 M24 102 h32" stroke="#1C3A2B" stroke-width="7"/></svg></div>
      <div style="position:absolute;left:90px;right:90px;top:680px;height:34px;border-radius:17px;background:rgba(255,255,255,.2)"><div style="width:16%;height:100%;border-radius:17px;background:#E2503A"></div></div>
      <div id="bub" style="position:absolute;left:60px;right:60px;top:760px;padding:26px 0 30px;border-radius:40px;background:#FFFDF7;text-align:center;font:700 80px/1 var(--display);color:#E2503A">🔊 Mais alto!</div>
    </div>`, { position: 'absolute', left: '0px', top: '0px', width: '620px', height: '1060px', transformOrigin: '50% 50%' });
  fade(phoneUI, 0);
  const phMic = phoneUI.querySelector('#mic'), phBub = phoneUI.querySelector('#bub');
  const cap = el(overlay, 'div', '', '', { position: 'absolute', left: '540px', top: '1165px', width: '960px', transform: 'translate(-50%, -50%)', ...STROKE, font: '700 70px/1.12 var(--display)' });
  // páginas: uma por fala (ou mais, onde o texto tem "|"); a página fica até a próxima fala começar (máx. 0,5 s depois)
  const PAGES = [];
  for (const s of segs) {
    if (NOCAP.has(s.key)) continue;
    const parts = s.raw.split('|'); let wi = 0;
    parts.forEach((p, k) => {
      const n = p.trim().split(/\s+/).length, ws = s.words.slice(wi, wi + n); wi += n;
      PAGES.push({ s, text: p.trim(), start: (ws[0]?.t ?? s.at) - 0.06, end: k < parts.length - 1 ? (s.words[wi]?.t ?? s.end) - 0.06 : s.end + 0.5 });
    });
  }
  PAGES.sort((x, y) => x.start - y.start);
  for (let i = 0; i < PAGES.length - 1; i++) PAGES[i].end = Math.min(PAGES[i].end, PAGES[i + 1].start);
  const capHTML = (pg) => {
    const col = HI[pg.s.who], punch = PUNCH[pg.s.key];
    const words = pg.text.split(/\s+/).map((w) => (pg.s.who === 'app' || w === punch ? `<span style="color:${col}">${w}</span>` : w)).join(' ');
    const lead = pg.s.who === 'app' ? '<span style="font-size:.8em">🔊 </span>' : '';
    const tr = TRANS[pg.s.key] ? `<div style="margin-top:10px;font:600 50px/1.1 var(--ui);-webkit-text-stroke:10px #14241C;opacity:.95">${TRANS[pg.s.key]}</div>` : '';
    return `<div>${lead}${words}</div>${tr}`;
  };

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

  // ---- DIA 1: encostado na porta, sussurra; o app pede mais alto; a sombra dos chinelos; descarga; HELLO!
  init('toilet.cam', 'phoneMouth', WORRY, [0.5, 0.1]); tk('toilet.cam', 0, 0.3, 0);
  mv('toilet.cam', 'lean', 0, S.a1.end + 0.2, { rot: 5 });
  xk('toilet.cam', S.w1.at - 0.05, 'embarrassed', 0.15);
  xk('toilet.cam', S.a1.at + 0.05, SHOCK, 0.08); mv('toilet.cam', 'flinch', S.a1.at + 0.05, S.a1.at + 0.4, { amp: 1.2 }); pk('toilet.cam', S.a1.at + 0.05, 'phoneHide', 0.22);
  tk('toilet.cam', c.feet + 0.05, 0.75, 0.25); lk('toilet.cam', c.feet + 0.05, [0.9, 0.7]); xk('toilet.cam', c.feet + 0.05, WORRY, 0.12);
  tk('toilet.cam', c.walk - 0.1, -0.6, 0.3); lk('toilet.cam', c.walk - 0.1, [-0.8, 0.3]); xk('toilet.cam', c.walk - 0.1, SMUG, 0.2); pk('toilet.cam', c.walk - 0.1, 'phone', 0.25);
  mv('toilet.cam', 'walk', c.walk, c.walk + 0.5, { x0: 0, x1: -320, dir: -1, f: 3.2, lean: 4, hush: 0.6 });
  pk('toilet.cam', c.flush - 0.18, 'flush', 0.2); mv('toilet.cam', 'lean', c.flush - 0.2, c.flush + 0.3, { rot: -6 });
  pk('toilet.cam', S.c2.at - 0.12, 'cheerPhone', 0.18); xk('toilet.cam', S.c2.at - 0.08, 'excited', 0.08); mv('toilet.cam', 'hop', S.c2.at - 0.16, S.c2.at + 0.5, { h: 40 });
  tk('toilet.cam', S.c2.at - 0.1, 0, 0.25); lk('toilet.cam', S.c2.at - 0.1, [0, 0]);
  pk('toilet.cam', c.ding - 0.05, 'proud', 0.3); xk('toilet.cam', c.ding, SMUG, 0.2); lk('toilet.cam', c.ding, [0.5, 0.6]);
  // ---- DIA 10: canta o diálogo decorado; a Vera, de pijama, olha o teto
  const d10 = c.d10;
  init('day.cam', 'mic', 'excited', [0.2, 0]); mv('day.cam', 'sway', d10, S.c3.end, { amp: 4, f: 1.6 });
  pk('day.cam', W_('c3', 0) - 0.05, 'micUp', 0.26); pk('day.cam', W_('c3', 3) - 0.05, 'mic', 0.26); pk('day.cam', W_('c3', 5) - 0.05, 'micUp', 0.26); pk('day.cam', W_('c3', 7) - 0.05, 'textbook', 0.26);
  xk('day.cam', S.c3.end + 0.1, 'smallSmile', 0.2);
  xk('day.cam', S.v1.at + 0.05, SHOCK, 0.08); pk('day.cam', S.v1.at + 0.05, 'micDown', 0.2); lk('day.cam', S.v1.at + 0.05, [0, 1]); mv('day.cam', 'flinch', S.v1.at + 0.05, S.v1.at + 0.4, { amp: 1 });
  init('day.vera', 'clench', TIRED, [0, -1]); tk('day.vera', 0, 0.1, 0); pk('day.vera', S.v1.at - 0.35, 'forehead', 0.3);
  mv('day.vera', 'nod', S.c3.at + 0.4, S.c3.end, { amp: 1.2, f: 1.6 });
  xk('day.vera', S.v1.at - 0.1, DEADPAN, 0.2); mv('day.vera', 'lean', S.v1.at - 0.1, S.v1.end + 0.3, { rot: -3 });
  // ---- DIA 100: ele fala dormindo; ela acorda, levanta com a vassoura, bate três vezes no teto e grita; ele responde dormindo
  for (const id of ['night.cam', 'night.vera']) { init(id, 'rest', ASLEEP); mv(id, 'lie', 0, 1e6); mv(id, 'sleep', 0, 1e6); }
  xk('night.vera', c.wake, SHOCK, 0.06); lk('night.vera', c.wake, [0.4, -0.6]);
  init('night.vera2', 'broomUp', 'annoyed', [0, -1]);
  mv('night.vera2', 'bang', c.stand, S.v3.end, { times: c.bang });
  xk('night.vera2', S.v3.at - 0.05, 'annoyed', 0.1); lk('night.vera2', S.v3.at - 0.05, [0, -0.6]);
  xk('night.cam', S.c6.at - 0.1, { eyes: { closed: 'blink' }, brows: { y: 0.2 }, mouth: { curve: 0.85, w: 0.95 } }, 0.2);
  // ---- DIA 1000: rua
  const st = c.d1000;
  init('street.cam', 'rest', 'smallSmile', [0.6, 0]); tk('street.cam', 0, 0.25, 0);
  init('street.beto', 'rest', 'concerned', [-0.6, 0.1]); tk('street.beto', 0, -0.35, 0);
  mv('street.beto', 'walk', st + 0.02, st + 0.6, { x0: 700, x1: 0, dir: -1, f: 2.6, lean: 3 });
  xk('street.beto', S.b1.at - 0.05, 'speaking', 0.12); mv('street.beto', 'lean', S.b1.at - 0.1, S.b1.end, { rot: 3 });
  xk('street.cam', S.c5.at - 0.1, 'excited', 0.1); tk('street.cam', S.c5.at - 0.1, 0.4, 0.2);
  pk('street.cam', W_('c5', 0) - 0.04, 'point', 0.25); pk('street.cam', W_('c5', 3) - 0.06, 'armsOut', 0.25); pk('street.cam', W_('c5', 6) - 0.04, 'point', 0.25);
  mv('street.cam', 'lean', S.c5.at - 0.1, S.c5.end, { rot: 6 });
  xk('street.beto', S.c5.at + 0.3, 'confused', 0.2); xk('street.beto', S.c5.end + 0.1, DEADPAN, 0.25); lk('street.beto', S.c5.end + 0.1, [-0.7, 0]);
  xk('street.beto', S.b2.at - 0.05, 'annoyed', 0.2);
  xk('street.cam', S.b2.end + 0.05, SHOCK, 0.06); pk('street.cam', S.b2.end + 0.05, 'rest', 0.2); mv('street.cam', 'flinch', S.b2.end + 0.05, S.b2.end + 0.45, { amp: 1.3 });
  xk('street.cam', S.b2.end + 0.5, 'embarrassed', 0.2); pk('street.cam', S.b2.end + 0.55, 'pointMeek', 0.3); tk('street.cam', S.b2.end + 0.55, -0.3, 0.3);
  mv('street.cam', 'sweat', S.b2.end + 0.2, S.b2.end + 1.0);
  // ---- bar: a Nina pede, todos olham, ele trava e sussurra; o Marcos, rindo, "Mais alto!"
  const bb = c.bar;
  init('bar.cam', 'rest', 'smallSmile', [0.6, 0]); tk('bar.cam', 0, 0.3, 0);
  init('bar.nia', 'rest', 'listening', [-0.4, 0]); init('bar.malik', 'rest', 'listening', [-0.6, 0]); tk('bar.malik', 0, -0.3, 0);
  xk('bar.nia', S.n1.at - 0.05, 'excited', 0.12); pk('bar.nia', S.n1.at - 0.05, 'pointLeft', 0.25); lk('bar.nia', S.n1.at - 0.05, [-0.8, 0.05]); mv('bar.nia', 'lean', S.n1.at - 0.1, S.n1.end, { rot: -5 });
  for (const w of ['bar.nia', 'bar.malik']) { lk(w, c.freeze, [-0.8, 0.05]); xk(w, c.freeze + 0.1, 'smallSmile', 0.2); }
  xk('bar.cam', c.freeze, SHOCK, 0.06); pk('bar.cam', c.freeze + 0.05, 'shrink', 0.25); tk('bar.cam', c.freeze, 0, 0.2); lk('bar.cam', c.freeze, [0, 0.2]);
  xk('bar.cam', S.w2.at - 0.1, 'embarrassed', 0.15); mv('bar.cam', 'sweat', c.freeze, S.m1.end); mv('bar.cam', 'lean', S.w2.at - 0.15, S.m1.end, { rot: 4 });
  xk('bar.malik', S.m1.at - 0.05, 'laugh', 0.1); pk('bar.malik', S.m1.at - 0.05, 'explain', 0.2); mv('bar.malik', 'shake', S.m1.at, c.laugh + 1.4, { amp: 2.4, f: 7.5 });
  xk('bar.nia', c.laugh, 'laugh', 0.12); pk('bar.nia', c.laugh, 'laughBelly', 0.2); mv('bar.nia', 'shake', c.laugh, c.laugh + 1.6, { amp: 3, f: 7.5 });
  pk('bar.malik', c.laugh + 0.2, 'slamR', 0.2);
  xk('bar.cam', c.laugh + 0.25, 'laugh', 0.12); pk('bar.cam', c.laugh + 0.25, 'wipe', 0.25); mv('bar.cam', 'shake', c.laugh + 0.25, duration, { amp: 2.2, f: 7 });

  for (const K of Object.values(TR)) for (const m of K.M) if (m.type === 'walk') { const fq = m.f ?? 2.2; for (let k = 1, tt = m.t0 + 0.5 / fq; tt < m.t1 - 0.08; k++, tt += 0.5 / fq) A.sfx('step', tt, { gain: m.hush ? 0.2 : 0.28, pan: k % 2 ? -0.12 : 0.12 }); }
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
  function turnOf(K, t) { const Tn = K.T, i = lastIdx(Tn, t), [t1, v1, d1] = Tn[i]; if (!i || d1 === 0) return v1; return lerp(Tn[i - 1][1], v1, springResp(t - t1, 4.0 / d1, 0.72)); }
  function exprOf(D, K, t) { const X = K.X, i = lastIdx(X, t), [t1, e1, d1] = X[i], cur = resolveExpr(D, e1); if (!i || d1 === 0) return cur; return blendExpr(resolveExpr(D, X[i - 1][1]), cur, E.inOut(clamp((t - t1) / d1))); }
  function lookOf(K, t) { const L = K.L, i = lastIdx(L, t), [t1, l1] = L[i]; if (!i) return l1; const [, l0] = L[i - 1], k = E.inOut(clamp(inv(t1, t1 + 0.16, t))); return [lerp(l0[0], l1[0], k), lerp(l0[1], l1[1], k)]; }
  const whoOf = { cam: 'cam', vera: 'vera', vera2: 'vera', beto: 'beto', nia: 'nina', malik: 'marcos' };
  function applyMoves(K, t, a) {
    for (const m of K.M) {
      if (m.type === 'walk' && t > m.t1) a.x += m.x1;
      if (t < m.t0 || t > m.t1) continue;
      const u = clamp(inv(m.t0, m.t1, t)), tt = t - m.t0;
      switch (m.type) {
        case 'breath': a.body.dy += -0.45 * Math.sin(t * 2 * Math.PI * 0.24); a.sy *= 1 + 0.005 * Math.sin(t * 2 * Math.PI * 0.24); a.head.rot += 0.9 * Math.sin(t * 2 * Math.PI * 0.11); break;
        case 'lean': { const k = springResp(tt, 14, 0.55) * (1 - E.inOut(clamp((t - (m.t1 - 0.25)) / 0.25))); a.body.rot += m.rot * k; a.head.rot += m.rot * 0.35 * k; break; }
        case 'sway': a.body.rot += m.amp * Math.sin(t * 2 * Math.PI * m.f) * Math.min(1, tt / 0.3); a.head.rot -= m.amp * 0.5 * Math.sin(t * 2 * Math.PI * m.f - 0.5); break;
        case 'nod': a.head.nod += m.amp * Math.sin(t * 2 * Math.PI * m.f); break;
        case 'shake': { const env = Math.min(1, tt / 0.25) * (1 - clamp((t - (m.t1 - 0.4)) / 0.4)); a.body.rot += m.amp * Math.sin(t * 2 * Math.PI * m.f) * env; a.head.nod += m.amp * 0.8 * Math.abs(Math.sin(t * 2 * Math.PI * m.f)) * env; a.sy *= 1 + 0.01 * m.amp * Math.sin(t * 2 * Math.PI * m.f * 1.6) * env; break; }
        case 'flinch': { const k = Math.exp(-tt * 8) * Math.sin(tt * 40); a.x += m.amp * 10 * k; a.sy *= 1 - 0.05 * m.amp * Math.exp(-tt * 9); break; }
        case 'sweat': { const ph = clamp(inv(m.t0, m.t1, t)); a.headOver.push({ t: 'ellipse', x: 41, y: -6 + ph * 40, rx: 5, ry: 8, fill: 'tear', op: 1 - ph * 0.6 }); break; }
        case 'lie': a.rot += -90; break;
        case 'bang': for (const b of m.times) if (t >= b - 0.08 && t < b + 0.2) { const q = t < b ? (t - (b - 0.08)) / 0.08 : 1 - (t - b) / 0.2; a.y -= 26 * E.out(clamp(q)); a.sy *= 1 + 0.03 * clamp(q); } break;
        case 'sleep': a.sy *= 1 + 0.03 * Math.sin(t * 2 * Math.PI * 0.35); a.body.dy += -0.8 * Math.sin(t * 2 * Math.PI * 0.35); a.head.rot += 3; break;
        case 'hop': {
          const d = 0.14, fly = 0.36, q = tt;
          if (q < d) { const k = E.inOut(q / d); a.sy *= 1 - 0.08 * k; a.sx *= 1 + 0.05 * k; a.body.dy += 4 * k; }
          else if (q < d + fly) { const f = (q - d) / fly; a.y -= m.h * 4 * f * (1 - f); a.sy *= 1 + 0.06 * bell(f); a.sx *= 1 - 0.04 * bell(f); a.legL.lift = 4 * bell(f); a.legR.lift = 5 * bell(f); }
          else { const r = q - d - fly, k = Math.exp(-r * 9) * Math.cos(r * 28); a.sy *= 1 - 0.08 * k; a.sx *= 1 + 0.05 * k; a.body.dy += 4 * k; }
          break;
        }
        case 'walk': {
          const e = E.inOut(u), env = Math.min(1, Math.min(tt / 0.12, (m.t1 - t) / 0.14)), ph = (t - m.t0) * 2 * Math.PI * (m.f ?? 2.2), s = Math.sin(ph);
          a.x += lerp(m.x0, m.x1, e);
          a.legL.lift = Math.max(0, s) * 6 * env; a.legR.lift = Math.max(0, -s) * 6 * env;
          a.body.dy += -1.6 * Math.abs(s) * env; a.body.rot += ((m.lean ?? 3) * m.dir * 0.8 + 1.8 * s) * env;
          a.head.rot += 1.2 * s * env; a.head.turn += m.dir * 0.3 * env; a.y += -Math.abs(s) * 7 * env;
          const sw = 22 * env * (m.hush ? 0.5 : 1); a.arm = { w: env, L: [10 + sw * s, 4 + sw * 0.6 * s, 'rest'], R: [10 - sw * s, 4 - sw * 0.6 * s, 'rest'] };
          break;
        }
        default: break;
      }
    }
  }
  const BLINK = (k) => Array.from({ length: 12 }, (_, i) => 1.3 + i * 3.55 + k);
  function draw(I, t) {
    const K = TR[I.id];
    if (!K) return;
    const a = { x: 0, y: 0, rot: 0, sx: 1, sy: 1, body: { dx: 0, dy: 0, rot: 0 }, head: { rot: 0, nod: 0, turn: 0 }, legL: {}, legR: {}, headOver: [], arm: null, armBias: { L: 0, R: 0 }, mouth: null };
    applyMoves(K, t, a);
    a.head.turn += turnOf(K, t);
    const exprBase = exprOf(I.p.D, K, t), look = lookOf(K, t);
    const w = whoOf[I.key], sg = w && segs.find((s) => s.who === w && t >= s.at - 0.04 && t <= s.end + 0.06);
    const ov = { eyes: { look: look.map((x) => +x.toFixed(3)) } };
    let nod = 0, gest = 0;
    const exprCurve = exprBase?.mouth?.curve ?? 0.1;
    if (sg) {
      const m = residentMouth(sg.voice, sg.at, t + LEAD, I.scene === 'night' ? 0.5 : 0.95);
      if (m && m.t !== 'line') ov.mouth = { ...m, curve: Math.max(m.curve ?? 0, exprCurve * 0.6) };
      const u = (t - sg.words[0].t) / 0.45;
      if (u > 0 && u < 1) { const b = Math.sin(Math.PI * u); nod += 2 * b; gest += 3 * b; }
    }
    const mix = (base, o2, wgt) => (o2 && wgt > 0 ? [lerp(base[0], o2[0], wgt), lerp(base[1], o2[1], wgt), wgt > 0.5 ? o2[2] : base[2], wgt > 0.5 ? undefined : base[3]] : base);
    let L = armOf(K, t, 'armL'), R = armOf(K, t, 'armR');
    if (a.arm) { L = mix(L, a.arm.L, a.arm.w); R = mix(R, a.arm.R, a.arm.w); }
    const g = (x) => (x[2] === 'rest' && !x[3] ? x : [x[0], +(x[1] + gest).toFixed(2), x[2], x[3]]);
    const clean = (x) => x.filter((y) => y !== undefined).map((y) => (typeof y === 'number' ? +y.toFixed(2) : y));
    const rnd = (x) => +x.toFixed(2);
    const pose = { armL: clean(g(L)), armR: clean(g(R)), body: { dx: rnd(a.body.dx), dy: rnd(a.body.dy), rot: rnd(a.body.rot) }, head: { rot: rnd(a.head.rot), nod: rnd(a.head.nod + nod), turn: rnd(a.head.turn) }, legL: { lift: rnd(a.legL.lift || 0) }, legR: { lift: rnd(a.legR.lift || 0) }, headOver: a.headOver };
    const asleep = I.scene === 'night' && I.key !== 'vera2' && !(I.key === 'vera' && t >= c.wake);
    const o = { pose, expr: exprBase, overlay: ov, blink: !asleep && BLINK((I.id.length * 0.7) % 1.7).some((b) => t >= b && t < b + 0.12), view: 'front', headExtra: 0 };
    I.n.innerHTML = renderCharacter(I.p.D, o).replace('<svg ', '<svg width="100%" height="100%" style="display:block;overflow:visible" ');
    I.n.style.transform = `translate(${a.x.toFixed(1)}px, ${a.y.toFixed(1)}px) rotate(${a.rot.toFixed(2)}deg) scale(${a.sx.toFixed(4)}, ${a.sy.toFixed(4)})`;
  }

  // ------------------------------------------------------------ planos (câmera com mola e panorâmica)
  const FR = (sc, who, s, ex = 540, ey = 800) => { const p = SCENES[sc].chars[who]; return { s, cx: p.x - (ex - 540) / s, cy: p.eye - (ey - 960) / s }; };
  const shots = [];
  const shot = (scene, t0, t1, f, o = {}) => shots.push({ kind: 'scene', scene, t0, t1, f, ...o });
  shot('toilet', 0, c.feet + 0.02, FR('toilet', 'cam', 1.3, 560, 1190), { f2: FR('toilet', 'cam', 1.45, 560, 1170) });
  shot('toilet', c.feet + 0.02, c.walk - 0.05, { s: 2.3, cx: 1210, cy: 1435 }, { creep: 0.05 });
  shot('toilet', c.walk - 0.05, c.d10, { s: 1.0, cx: 600, cy: 1160 }, { bump: S.c2.at, amp: 0.06, shake: S.c2.at });
  shot('day', c.d10, c.wideEnd, { s: 0.8, cx: 720, cy: 1350 }, { f2: { s: 0.84, cx: 720, cy: 1350 } });
  const tilt0 = S.c3.end - 0.15, tilt1 = S.v1.at - 0.02;
  shot('day', c.wideEnd, tilt0, FR('day', 'cam', 1.3, 540, 1010), { creep: 0.04 });
  shot('day', tilt0, c.react10, FR('day', 'cam', 1.3, 540, 1010), { f2: FR('day', 'vera', 1.45, 540, 960), win: [tilt0, tilt1] });
  shot('day', c.react10, c.d100, FR('day', 'cam', 1.6, 540, 960), { bump: c.react10, amp: 0.05 });
  shot('night', c.d100, c.wake, { s: 0.8, cx: 720, cy: 1350 }, { creep: 0.04 });
  shot('night', c.wake, c.stand, { s: 1.45, cx: 560, cy: 1880 }, { bump: c.wake, amp: 0.05 });
  shot('night', c.stand, S.v3.end + 0.2, { s: 1.0, cx: 880, cy: 1700 }, { shakes: c.bang });
  shot('night', S.v3.end + 0.2, c.d1000, { s: 1.65, cx: 540, cy: 540 }, { creep: 0.05 });
  shot('street', c.d1000, S.c5.at - 0.05, { s: 1.05, cx: 720, cy: 1150 }, { f2: { s: 1.12, cx: 700, cy: 1150 } });
  shot('street', S.c5.at - 0.05, S.c5.end + 0.12, FR('street', 'cam', 1.55, 560, 880), { creep: 0.04 });
  shot('street', S.c5.end + 0.12, S.b2.end + 0.22, FR('street', 'beto', 1.6, 540, 940), { creep: 0.06 });
  shot('street', S.b2.end + 0.22, c.bar, FR('street', 'cam', 1.85, 540, 860), { bump: S.b2.end + 0.22, amp: 0.06 });
  shot('bar', c.bar, S.w2.at - 0.1, { s: 0.9, cx: 960, cy: 1250 }, { f2: { s: 1.0, cx: 900, cy: 1230 } });
  shot('bar', S.w2.at - 0.1, S.m1.at - 0.03, FR('bar', 'cam', 1.8, 540, 880), { creep: 0.07 });
  shot('bar', S.m1.at - 0.03, c.laugh + 0.5, FR('bar', 'malik', 1.7, 540, 900), { creep: 0.04 });
  shot('bar', c.laugh + 0.5, duration + 1, { s: 0.92, cx: 960, cy: 1290 }, { f2: { s: 0.98, cx: 900, cy: 1290 } });
  // ambiência por cena
  { const AMB = { toilet: 'room', day: 'water', night: 'dream', street: 'city', bar: 'murmur' }, spans = [];
    for (const sh2 of shots) { const kind = AMB[sh2.scene], last = spans[spans.length - 1]; if (last && last.kind === kind) last.t1 = Math.min(duration, sh2.t1); else spans.push({ t0: sh2.t0, t1: Math.min(duration, sh2.t1), kind }); }
    A.cue('ambience', 0, { place: 'dias', spans, gain: 0.45 }); }
  const hand = (t) => ({ x: 4 * Math.sin(t * 2 * Math.PI * 0.13), y: 3 * Math.sin(t * 2 * Math.PI * 0.11 + 2), r: 0.15 * Math.sin(t * 2 * Math.PI * 0.09 + 0.5) });

  // ------------------------------------------------------------ quadro
  const vign = el(overlay, 'div', 'layer', '', { width: `${W}px`, height: `${H}px`, background: 'radial-gradient(ellipse 72% 56% at 50% 44%, rgba(0,0,0,0) 56%, rgba(30,20,12,.32) 100%)' });
  const topShade = el(overlay, 'div', 'layer', '', { width: `${W}px`, height: `${H}px`, background: 'linear-gradient(180deg, rgba(14,20,18,.55) 0%, rgba(14,20,18,0) 38%)' });
  for (const n of [...Object.values(sceneL).map((s) => s.L), vign, topShade, phoneUI, title, chip, cta, cap]) overlay.append(n);
  const pin = (n, t, t0, t1, { x, y, s = 1 }) => {
    if (t < t0 - 0.001 || t > t1 + 0.16) { fade(n, 0); return; }
    const kIn = t0 <= 0 ? 1 : clamp(inv(t0, t0 + 0.3, t)), sp = t0 <= 0 ? 1 : E.spring(kIn), kOut = E.in(clamp(inv(t1, t1 + 0.16, t)));
    fade(n, Math.min(1, kIn * 5) * (1 - kOut));
    css(n, { left: x, top: y, transform: `translate(-50%, -50%) scale(${(s * (0.62 + 0.38 * sp) * (1 - 0.12 * kOut)).toFixed(4)})` });
  };
  const STAGES = [[0, 'DIA 1', 'no banheiro'], [c.d10, 'DIA 10', 'no chuveiro'], [c.d100, 'DIA 100', '2h da manhã'], [c.d1000, 'DIA 1000', 'na rua'], [c.bar, 'DIA 1001', 'no bar']];
  const capCache = { i: -2 };
  function render(t) {
    const sh = shots.find((x) => t >= x.t0 && t < x.t1) || shots[shots.length - 1], key = sh.scene;
    for (const [name, s] of Object.entries(sceneL)) fade(s.L, name === key ? 1 : 0);
    const sc = sceneL[key], u = sh.win ? clamp(inv(sh.win[0], sh.win[1], t)) : clamp(inv(sh.t0, sh.t1, t));
    let f = sh.f;
    if (sh.f2) { const e = E.camera(u); f = { s: Math.exp(lerp(Math.log(sh.f.s), Math.log(sh.f2.s), e)), cx: lerp(sh.f.cx, sh.f2.cx, e), cy: lerp(sh.f.cy, sh.f2.cy, e) }; }
    const kb = sh.bump != null && t >= sh.bump ? (sh.amp ?? 0.05) * Math.exp(-(t - sh.bump) * 9) : 0;
    const s = f.s * (1 + (sh.f2 ? 0 : (sh.creep ?? 0.03)) * E.inOut(u)) * (1 + kb);
    const hd = hand(t); let sx = 0, sy = 0;
    const hw = 540 / s + 10, hh = 960 / s + 10, fcx = Math.max(hw, Math.min(sc.sc.w - hw, f.cx)), fcy = Math.max(hh, Math.min(sc.sc.h - hh, f.cy));
    for (const sk of sh.shakes || (sh.shake != null ? [sh.shake] : [])) if (t >= sk) { const k = t - sk, am = 14 * Math.exp(-k * 10); sx += am * Math.sin(k * 71); sy += am * Math.cos(k * 59); }
    sc.world.style.transform = `translate(${(540 + hd.x + sx).toFixed(2)}px, ${(960 + hd.y + sy).toFixed(2)}px) rotate(${hd.r.toFixed(3)}deg) scale(${(s * 1.004).toFixed(5)}) translate(${(-fcx).toFixed(2)}px, ${(-fcy).toFixed(2)}px)`;
    for (const I of inst) if (I.scene === key) { const on = !I.p.vis || t >= c.stand; const lieOff = I.id === 'night.vera' && t >= c.stand; I.n.style.opacity = on && !lieOff ? '1' : '0'; if (on && !lieOff) draw(I, t); }
    if (key === 'toilet') {
      const pf = E.spring(clamp((t - c.flush) / 0.25));
      css(flushTxt, { opacity: t >= c.flush && t < c.flush + 1.0 ? '1' : '0', transform: `scale(${(0.4 + 0.6 * pf).toFixed(3)})` });
      css(feet, { transform: `translateX(${(lerp(420, 0, E.out(clamp(inv(c.feet - 0.1, c.feet + 0.35, t))))).toFixed(1)}px)` });
      const pr = pulse01(t, c.flush - 0.03, c.flush + 0.25);
      css(flushBtn, { transform: `scaleY(${(1 - 0.45 * pr).toFixed(3)})` });
      const pc = E.spring(clamp((t - c.ding) / 0.25));
      css(check1, { opacity: t >= c.ding ? '1' : '0', transform: `scale(${(0.3 + 0.7 * pc).toFixed(3)})` });
    }
    if (key === 'day') {
      const lw = t < c.wideEnd - 0.05 ? E.spring(clamp((t - (c.d10 + 0.15)) / 0.3)) : 0;
      for (const n of [lblCaio, lblVera]) css(n, { opacity: lw > 0 ? '1' : '0', transform: `scale(${(0.5 + 0.5 * lw).toFixed(3)})` });
      drops.forEach((d, i) => { const ph = ((t * 2.2 + i * 0.137) % 1); d.style.transform = `translateY(${(ph * 700 - 60).toFixed(0)}px)`; });
      steam.forEach((n, i) => { const ph = (t * 0.35 + i * 0.21) % 1; css(n, { transform: `translateY(${(-ph * 420).toFixed(0)}px) scale(${(0.8 + ph * 0.9).toFixed(3)})`, opacity: (0.7 * bell(ph)).toFixed(3) }); });
      const pp = E.spring(clamp((t - (S.v1.at + 0.05)) / 0.2));
      css(exclDay, { opacity: t >= S.v1.at + 0.05 && t < S.v1.end + 1.2 ? '1' : '0', transform: `scale(${(0.4 + 0.6 * pp).toFixed(3)})` });
    }
    if (key === 'night') {
      dust.forEach((d, i) => { let op = 0, y = 0; for (const b of c.bang) { const u2 = t - b - i * 0.012; if (u2 >= 0 && u2 < 1.1) { op = Math.max(op, 1 - u2 / 1.1); y = Math.max(y, u2 * 260 + 600 * u2 * u2); } } css(d, { opacity: op.toFixed(3), transform: `translateY(${y.toFixed(1)}px)` }); });
      zzz.forEach((z, i) => { const ph = ((t * 0.4 + i * 0.33) % 1); const on = i < 2 ? true : t < c.wake; css(z, { transform: `translate(${(ph * 120 + 8 * Math.sin(t * 3 + i)).toFixed(1)}px, ${(-ph * 260).toFixed(1)}px) scale(${(0.5 + ph * 0.8).toFixed(3)})`, opacity: on ? (0.9 * bell(ph)).toFixed(3) : '0' }); });
    }
    if (key === 'street') {
      const pp = E.spring(clamp((t - (S.b2.end + 0.05)) / 0.2));
      css(exclStreet, { opacity: t >= S.b2.end + 0.05 && t < S.b2.end + 0.9 ? '1' : '0', transform: `scale(${(0.4 + 0.6 * pp).toFixed(3)})` });
    }
    // título, chip do dia (entra grande no centro e sobe para o topo), pergunta final
    pin(title, t, 0, 2.3, { x: 540, y: 500 });
    // o celular do app sobe grande no centro: "Oi, Caio!", o microfone pulsando e o balão "Mais alto!"
    if (t >= c.phone - 0.02 && t <= c.phoneEnd + 0.25) {
      const kIn = Math.min(1.08, springResp(t - c.phone, 14, 0.6)), kOut = E.in(clamp((t - c.phoneEnd) / 0.22));
      fade(phoneUI, Math.min(1, kIn * 4) * (1 - kOut));
      css(phoneUI, { left: 540, top: lerp(1500, 900, Math.min(1, kIn)) + 700 * kOut, transform: `translate(-50%, -50%) rotate(${(-3 * (1 - Math.min(1, kIn))).toFixed(2)}deg)` });
      css(phMic, { transform: `scale(${(1 + 0.06 * Math.sin(t * 18)).toFixed(3)})` });
      const kb2 = E.spring(clamp((t - (S.a1.at - 0.05)) / 0.25));
      css(phBub, { opacity: t >= S.a1.at - 0.05 ? '1' : '0', transform: `scale(${(0.5 + 0.5 * kb2).toFixed(3)})` });
    } else fade(phoneUI, 0);
    let si = 0; STAGES.forEach(([t0], i) => { if (t >= t0) si = i; });
    const [t0, label, sub] = STAGES[si];
    if (chip.dataset.k !== label) { chip.dataset.k = label; chip.innerHTML = `${label}<div style="font:600 30px/1 var(--ui);color:#FFFDF7;margin-top:6px">${sub}</div>`; }
    const k = si === 0 ? clamp(inv(0.2, 0.75, t)) : clamp(inv(t0 + 0.05, t0 + 0.6, t));
    const ke = E.inOut(k), pop = si === 0 ? 1 : E.spring(clamp(inv(t0 - 0.02, t0 + 0.2, t)));
    fade(chip, t >= c.cta ? 1 - clamp((t - c.cta) / 0.2) : 1);
    css(chip, { left: 540, top: lerp(si === 0 ? 300 : 1165, 300, si === 0 ? 1 : ke), transform: `translate(-50%, -50%) scale(${(lerp(si === 0 ? 1 : 1.8, 1, si === 0 ? 1 : ke) * (0.7 + 0.3 * pop)).toFixed(4)})` });
    pin(cta, t, c.cta, duration + 1, { x: 540, y: 470 });
    fade(topShade, t < 2.6 ? 1 - clamp((t - 2.3) / 0.3) : t >= c.cta ? clamp((t - c.cta) / 0.3) : 0);
    // legenda: a fala inteira na tela, só a palavra do punch em cor (no corte de piso, em cima da laje)
    let pi = -1; for (let i = 0; i < PAGES.length; i++) if (t >= PAGES[i].start && t < PAGES[i].end) { pi = i; break; }
    if (pi < 0 || t >= c.cta - 0.05 || (t >= c.phone - 0.02 && t <= c.phoneEnd + 0.1)) { fade(cap, 0); capCache.i = -1; }
    else {
      const pg = PAGES[pi];
      if (capCache.i !== pi) { capCache.i = pi; cap.innerHTML = capHTML(pg); cap.style.transform = 'none'; capCache.fit = Math.min(1, 940 / Math.max(1, cap.scrollWidth)); }
      const kk = E.out(clamp(inv(pg.start, pg.start + 0.1, t)));
      const capY = (key === 'day' || key === 'night') && sh.f.s < 0.9 ? 845 : 1165;
      fade(cap, 1); css(cap, { top: capY, transform: `translate(-50%, -50%) scale(${((0.9 + 0.1 * kk) * (capCache.fit ?? 1)).toFixed(4)})` });
    }
  }
  const pulse01 = (t, a, b) => (t < a || t > b ? 0 : bell((t - a) / (b - a)));
  const CUTS = shots.map((x) => x.t0).filter((x) => x > 0);
  const FASTW = [[c.walk, c.walk + 0.55], [S.c2.at - 0.2, S.c2.at + 0.4], [c.d1000, c.d1000 + 0.75], [S.a1.at, S.a1.at + 0.4], [S.v1.at, S.v1.at + 0.4], [S.b2.end, S.b2.end + 0.45], [c.freeze, c.freeze + 0.3]];
  const samples = (t) => {
    if (CUTS.some((x) => Math.abs(t - x) < 0.02)) return 1;
    return FASTW.some(([a, b]) => t > a && t < b) ? [8, 0.5] : 1;
  };
  return { duration, cues: c, captions, audio: A.items, samples, render, hook: { title: 'E se você falasse inglês todo dia?' }, safe: [120, 270, 960, 1248], async ready() { return true; } };
}
