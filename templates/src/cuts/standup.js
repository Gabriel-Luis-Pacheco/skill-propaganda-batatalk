// STAND-UP DOS FALSOS AMIGOS 9:16 (Reels primeiro, ~40 s): o Jax, morador de Batata City que no app
// trabalha na Casa de Show de Neon Purê, aqui é um comediante brasileiro numa Tiny Gig. A namorada
// gringa dele almoça na casa da mãe, e três palavras que parecem português fazem a mãe tirar o prato
// ("exquisite"), devolver com farofa ("novels" → novela) e tirar de novo, junto com a panela
// ("pretend" → "Tipo… pro visto?"). Ele conta que hoje treina antes no BataTalk; o Tato sobe da caixa
// de retorno e sopra que "exquisite" é elogio; "Fala isso pra minha mãe." emenda no começo.
// Base: os clipes de inglês do Rafi Bastos (lógica literal de quem aprende → consequência concreta →
// fecho na maior risada) e a risada da plateia, que deixa a piada mais engraçada (Cai et al., 2019).
// Formato do clipe de stand-up: holofote, parede de tijolo, legenda grande com a palavra-chave em
// amarelo; imitações com a cabeça virada (a mãe para um lado, a gringa para o outro); movimento calmo.
import { E, clamp, lerp, inv, pulse, el, css, fade, TatoActor, AudioList, tatoSpeech } from './kit.js';
import { residentMouth, envAt } from '../core/visemes.js';
import { renderCharacter, EXPRESSIONS, mergeDesign } from '/character-rig.js';
import { DESIGNS } from '/character-designs.js';
import { STAGE, stageSVG, crowdBackSVG, crowdHeads, wedgeSVG, standSVG, stoolSVG, frontTableSVG, plateSVG, potSVG } from './standup-room.js';
import { align, segVoice, stick, buildPages, focusLines } from './creator.js';

const PAD_A = 0.03, PAD_B = 0.07, LEAD = 0.025;
// [arquivo, a, b, legenda, velocidade] — a e b em segundos do arquivo ORIGINAL; a preparação vai a
// 1,2×, o resto a 1,1×, e o inglês que é a piada fica no tempo natural (references/08)
const SEG = {
  j1a: ['sJ1', 0.03, 1.57, 'Minha namorada gringa', 1.2],
  j1b: ['sJ1', 1.85, 3.75, 'provou a feijoada da minha mãe…', 1.2],
  j1c: ['sJ1', 5.27, 6.19, '“Exquisite!”', 1],
  j2a: ['sJ2', 0.03, 1.12, 'Minha mãe', 1.1],
  j2b: ['sJ2', 1.4, 2.45, 'tirou o prato.', 1.1],
  j3a: ['sJ3', 0.13, 1.59, 'Ela, nervosa:', 1.1],
  j3b: ['sJ3', 2.08, 3.83, '“I love novels!”', 1],
  j4a: ['sJ4', 0.02, 0.63, '“Novela?!”', 1.1],
  j5a: ['sJ5', 0.05, 2.0, 'Devolveu o prato.', 1.1],
  j5b: ['sJ5', 2.54, 3.98, 'Com farofa.', 1.1],
  j6a: ['sJ6', 0.01, 1.34, 'Aí minha mãe:', 1.2],
  j6b: ['sJ6', 1.85, 4.85, '“Pergunta se ela pretende casar com você!”', 1.2],
  j7a: ['sJ7', 0.01, 1.14, 'Eu traduzi:', 1.1],
  j7b: ['sJ7', 1.6, 3.86, '“Do you pretend to marry me?”', 1],
  j8a: ['sJ8', 0.03, 0.42, '“Tipo…', 1],
  j8b: ['sJ8', 1.06, 1.71, 'pro visto?”', 1],
  j9a: ['sJ9', 0.04, 2.21, 'Minha mãe tirou o prato…', 1.1],
  j9b: ['sJ9', 2.97, 3.96, 'e a panela.', 1.1],
  j10a: ['sJ10', 0.02, 1.99, 'Hoje eu treino antes,', 1.2],
  j10b: ['sJ10', 2.42, 3.62, 'no BataTalk.', 1.2],
  t1a: ['sT1', 0.01, 1.23, 'E exquisite', 1.1],
  t1b: ['sT1', 1.69, 3.07, 'é elogio, tá?', 1.1],
  j11: ['sJ11', 0.3, 2.27, 'Fala isso pra minha mãe.', 1.1],
};
// as palavras que parecem português ficam amarelas na legenda (a "parte da piada", como nos clipes)
const FALSE_FRIEND = /^[“"]?(exquisite|novels|novela|pretend)/i;

/** A fala acelerada sem mudar o tom (tools/voice-fast.mjs): envelope reamostrado, trechos divididos. */
function speedLine(v, id, sp) {
  if (sp === 1) return v;
  const env = [];
  for (let j = 0; j * sp <= v.env.length - 1; j++) { const x = j * sp, k = Math.floor(x), u = x - k; env.push(v.env[k] * (1 - u) + (v.env[k + 1] ?? v.env[k]) * u); }
  return { ...v, file: `audio/voices/final/${sp === 1.1 ? 'fast' : `fast-${sp}`}/${id}.wav`, on: v.on / sp, off: v.off / sp, spans: v.spans.map(([a, b]) => [a / sp, b / sp]), env };
}

// ------------------------------------------------------------------ o palco no mundo
// Mundo = tela no plano aberto (s = 1, centro em (540, 1000)). O Jax fica no centro do palco, pés em
// y 1500; a caixa de retorno na boca do palco, à direita; o pedestal vazio atrás, o banquinho à esquerda.
const JAX = { x: 520, k: 2.25, feet: 1500, eyeH: 255 };
JAX.eye = JAX.feet - JAX.eyeH * JAX.k;
const WEDGE = { x: 720, y: 1548, w: 300 };
const TATO = { x: 870, y: 1592, h: 250 };
const atJ = (s, ex, ey) => ({ s, cx: JAX.x - (ex - 540) / s, cy: JAX.eye - (ey - 960) / s });
const FR = {
  WIDE: { s: 1, cx: 540, cy: 1000 },
  // o rig tem cabeça grande (1/3 da altura): "close" aqui é rosto + tronco, "close extremo" é o rosto
  MEDW: atJ(1.9, 540, 870), MED: atJ(2.2, 540, 830), CU: atJ(2.8, 540, 800), XCU: atJ(3.6, 540, 750),
  MEDT: { s: 1.3, cx: 640, cy: JAX.eye + 330 },
  TWO: { s: 1.55, cx: 650, cy: JAX.eye + 250 },
  // o close do Tato: centrado nele, o Jax fica fora do quadro (à esquerda)
  T_CU: { s: 2.3, cx: TATO.x + 45, cy: TATO.y - 0.62 * TATO.h + 60 },
};
// braços [braço, antebraço ABSOLUTO, mão, objeto?]; L = esquerda da tela. A mão da esquerda da tela
// (a direita dele) segura o microfone embaixo do queixo o tempo todo; a outra gesticula.
// (ângulos a partir de "reto para baixo": positivo = para fora, negativo = cruzando o corpo)
const MIC = [18, -148, 'fist', 'mic'];
const ARM = {
  rest: [10, 6, 'rest'], explain: [30, 80, 'open'], chef: [26, -165, 'fist'], yank: [70, 120, 'fist'],
  heart: [16, -112, 'open'], cup: [22, -156, 'open'], present: [50, 70, 'open'], chin: [18, -142, 'point'],
  palm: [36, 120, 'open'], down: [28, 40, 'open'], shrug: [40, 95, 'open'],
};
const DES = {
  jax: mergeDesign(DESIGNS.jax, {
    colors: { ...DESIGNS.jax.colors, micBody: '#2E2B36', micBand: '#9AA3AE', micGrille: '#C9CED6', micShine: '#F2F4F7' },
    props: { ...DESIGNS.jax.props, mic: { upright: true, reach: 0.1, dx: 0, dy: -2, grip: 'fist', thumb: true, front: false, shapes: [
      { t: 'poly', pts: [[-4.2, -12, 2], [4.2, -12, 2], [3.2, 18, 2], [-3.2, 18, 2]], fill: 'micBody' },
      { t: 'poly', pts: [[-5.4, -16, 1.5], [5.4, -16, 1.5], [5.4, -11, 1.5], [-5.4, -11, 1.5]], fill: 'micBand' },
      { t: 'circle', x: 0, y: -24, r: 8.6, fill: 'micGrille' },
      { t: 'circle', x: -2.6, y: -26.6, r: 2.8, fill: 'micShine' },
    ] } },
  }),
  mina: DESIGNS.mina, june: DESIGNS.june, malik: DESIGNS.malik,
};
const POSH = { eyes: { open: 0.5, lid: 5, look: [0.3, -0.3] }, brows: { y: 0.55, rot: -4 }, mouth: { curve: 0.45, w: 0.7 } };
const DEADPAN = { eyes: { open: 0.55, lid: 6 }, brows: { y: -0.1 }, mouth: { curve: -0.05, w: 0.7 } };
const SUSP = { eyes: { open: 0.62, lid: 3, look: [-0.45, 0] }, brows: { y: -0.15, rot: 9 }, mouth: { curve: -0.12, w: 0.6, asym: 0.45 } };
const TIRED = { eyes: { open: 0.5, lid: 7 }, brows: { y: 0.15, rot: -6 }, mouth: { curve: -0.12, w: 0.65 } };

export async function create(ctx) {
  const { W, H, overlay, voices: V } = ctx;
  const A = new AudioList();
  const F = {};
  const fileOf = (id, sp) => (F[`${id}@${sp}`] ??= speedLine(V.lines[id], id, sp));

  // ------------------------------------------------------------ montagem da fala
  const S = {}, c = {};
  let T = 0.05;
  const put = (key, gap = 0.1) => {
    T += gap;
    const [id, a0, b0, text, sp] = SEG[key], f = fileOf(id, sp);
    const a = Math.max(0, (a0 - PAD_A) / sp), b = (b0 + PAD_B) / sp;
    const words = align(text, f.spans, a0 / sp, b0 / sp);
    A.clip(id, T, a, b, V, { file: f.file });
    const off = T - a, who = id === 'sT1' ? 'tato' : 'jax';
    S[key] = { key, id, who, at: T, end: T + b - a, a, b, voice: segVoice(f, a, b, words), words: words.map((x) => ({ w: x.w, t: x.t + off, e: x.e + off, who, ff: FALSE_FRIEND.test(x.w) })), text };
    T = S[key].end;
    return S[key];
  };
  // 1. exquisite → a mãe tira o prato
  put('j1a', 0); put('j1b', 0.08); put('j1c', 0.22);
  c.chuckle = S.j1c.end + 0.04;
  put('j2a', 0.3); put('j2b', 0.1);
  c.yank1 = S.j2b.words[0].t;
  c.laugh1 = S.j2b.end + 0.02;
  // 2. novels → "Novela?!" → devolveu o prato, com farofa
  put('j3a', 0.85); put('j3b', 0.12);
  put('j4a', 0.3);
  c.laugh2 = S.j4a.end + 0.02;
  put('j5a', 0.45); put('j5b', 0.16);
  c.back = S.j5a.words[0].t; c.farofa = S.j5b.words[1].t;
  c.laugh3 = S.j5b.end + 0.02;
  // 3. pretend → "Tipo… pro visto?" → o prato e a panela
  put('j6a', 0.95); put('j6b', 0.08);
  put('j7a', 0.24); put('j7b', 0.16);
  c.pretend = S.j7b.words.find((w) => /pretend/i.test(w.w))?.t ?? S.j7b.at + 0.6;
  put('j8a', 0.42); put('j8b', 0.22);
  c.laugh4 = S.j8b.end + 0.02;
  put('j9a', 1.15); put('j9b', 0.38);
  c.yank2 = S.j9a.words[2].t; c.pot = S.j9b.words[2].t;
  c.laugh5 = S.j9b.end + 0.02;
  // 4. o produto: ele treina antes; o Tato sobe da caixa de retorno e sopra a dica
  put('j10a', 1.45); put('j10b', 0.1);
  c.tato = S.j10b.end + 0.12;
  put('t1a', 0.7); put('t1b', 0.1);
  // 5. o fecho (emenda no começo do vídeo: a mãe e a feijoada)
  put('j11', 0.28);
  c.laugh6 = S.j11.end + 0.02;
  const duration = +(S.j11.end + 1.45).toFixed(3);
  c.duration = duration;
  for (const [k, v] of Object.entries(S)) c[k] = +v.at.toFixed(3);
  const segs = Object.values(S);

  // ------------------------------------------------------------ som: sala, risadas, aplausos (sem música no set)
  A.cue('ambience', 0, { until: duration, place: 'club' });
  A.sfx('laugh', c.chuckle, { size: 0.12, len: 0.9, seed: 3, gain: 1.7 });
  A.sfx('laugh', c.laugh1, { size: 0.72, len: 1.5, seed: 11, gain: 1.7 });
  A.sfx('laugh', c.laugh2, { size: 0.42, len: 1.0, seed: 17, gain: 1.7 });
  A.sfx('laugh', c.laugh3, { size: 0.8, len: 1.6, seed: 23, gain: 1.7 });
  A.sfx('laugh', c.laugh4, { size: 0.92, len: 1.8, seed: 29, gain: 1.7 });
  A.sfx('laugh', c.laugh5, { size: 1, len: 2.3, seed: 37, gain: 1.7 });
  A.sfx('applause', c.laugh5 + 0.35, { size: 0.75, len: 1.9, seed: 41, gain: 1.4 });
  A.sfx('laugh', c.tato + 0.18, { size: 0.5, len: 1.1, seed: 43, gain: 1.7 });
  A.sfx('applause', c.tato + 0.3, { size: 0.35, len: 1.0, seed: 47, gain: 1.4 });
  A.sfx('laugh', c.laugh6, { size: 0.82, len: 1.6, seed: 53, gain: 1.7 });
  A.sfx('pop', S.j2a.at, { gain: 0.32 });
  A.sfx('whoosh', c.yank1 - 0.04, { gain: 0.42 });
  A.sfx('whoosh', c.back - 0.1, { gain: 0.32 });
  A.sfx('pop', c.farofa, { gain: 0.3 });
  A.sfx('pop', S.j9a.at, { gain: 0.3 });
  A.sfx('whoosh', c.yank2 - 0.04, { gain: 0.42 });
  A.sfx('whoosh', c.pot - 0.04, { gain: 0.5 }); A.sfx('thud', c.pot + 0.02, { gain: 0.45 });
  A.sfx('boing', c.tato + 0.04, { gain: 0.6 });
  A.sfx('pop', S.t1a.at + 0.05, { gain: 0.25 });
  A.sfx('motif-end', S.j11.end + 0.25, { gain: 0.42 });
  const NAME = { jax: 'Jax', tato: 'Tato' };
  const captions = segs.map((s) => ({ start: s.at, end: s.end, who: NAME[s.who], text: s.text, lang: 'pt' })).sort((x, y) => x.start - y.start);

  // ------------------------------------------------------------ cena 1: o palco
  const scene = el(overlay, 'div', 'layer', '', { width: `${W}px`, height: `${H}px`, overflow: 'hidden', background: '#2A2230' });
  const roomL = el(scene, 'div', 'layer', '', { width: `${STAGE.w}px`, height: `${STAGE.h}px` });
  el(roomL, 'img', '', '', { position: 'absolute', left: '0px', top: '0px', width: `${STAGE.w}px`, height: `${STAGE.h}px` }).src = await bitmap(stageSVG(), STAGE.w, STAGE.h, STAGE.texts, 2.3);
  const worldL = el(scene, 'div', 'layer', '', {});
  // o pedestal vazio fica do lado do microfone (à esquerda): o lado direito é do Tato
  el(worldL, 'div', '', standSVG(), { position: 'absolute', left: `${JAX.x - 200}px`, top: `${JAX.feet - 742 * 0.95 + 4}px`, width: '160px', height: '760px', transform: 'scale(.95)', transformOrigin: '0 0' });
  el(worldL, 'div', '', stoolSVG(), { position: 'absolute', left: `${JAX.x - 420}px`, top: `${JAX.feet - 510 * 0.98 + 6}px`, width: '220px', height: '520px', transform: 'scale(.98)', transformOrigin: '0 0' });
  const box = {};
  const mkBox = (w, parent, C) => { const D = DES[w], vb = Math.max(250, D.height * 0.92), h = D.height + 38; box[w] = el(parent, 'div', '', '', { position: 'absolute', left: `${C.x - (vb / 2) * C.k}px`, top: `${C.feet - (D.height + 24) * C.k}px`, width: `${vb * C.k}px`, height: `${h * C.k}px` }); };
  mkBox('jax', worldL, JAX);
  const tato = new TatoActor(worldL, { id: 'sup' });
  el(worldL, 'div', '', wedgeSVG(), { position: 'absolute', left: `${WEDGE.x}px`, top: `${WEDGE.y}px`, width: '300px', height: '170px' });
  // a plateia de costas em primeiro plano (só aparece no plano aberto)
  const heads = crowdHeads().map((h) => ({ ...h, n: el(worldL, 'div', '', h.svg, { position: 'absolute', left: `${(h.x - 150 * h.s).toFixed(0)}px`, top: `${(h.y - 150 * h.s).toFixed(0)}px`, transformOrigin: '50% 90%' }) }));
  // holofote: a luz quente que vem da plateia + vinheta
  el(scene, 'div', 'layer', '', { width: `${W}px`, height: `${H}px`, background: 'radial-gradient(ellipse 70% 52% at 50% 42%, rgba(0,0,0,0) 55%, rgba(24,14,22,.42) 100%)' });
  const focus = el(scene, 'div', 'layer', focusLines(), { width: `${W}px`, height: `${H}px` });

  // ------------------------------------------------------------ cena 2: a primeira fila (contraplano)
  const front = el(overlay, 'div', 'layer', '', { width: `${W}px`, height: `${H}px`, overflow: 'hidden' });
  el(front, 'img', '', '', { position: 'absolute', left: '0px', top: '0px', width: `${W}px`, height: `${H}px` }).src = await bitmap(crowdBackSVG(), W, H, [], 2.6);
  const frontW = el(front, 'div', 'layer', '', { width: `${W}px`, height: `${H}px`, transformOrigin: '50% 45%' });
  // olhos em y ≈ 790–830 (olho ≈ 0,72 da altura do rig); a mesa cobre do peito para baixo
  const ROW = { mina: { x: 215, k: 3.0, feet: 830 + 186 * 3.0 }, june: { x: 545, k: 2.9, feet: 790 + 235 * 2.9 }, malik: { x: 870, k: 3.0, feet: 810 + 210 * 3.0 } };
  for (const w of ['mina', 'june', 'malik']) mkBox(w, frontW, ROW[w]);
  el(frontW, 'div', '', frontTableSVG(), { position: 'absolute', left: '-80px', top: '1100px', width: '1240px', height: '760px' });
  el(front, 'div', 'layer', '', { width: `${W}px`, height: `${H}px`, background: 'linear-gradient(180deg, rgba(255,217,160,.14), rgba(0,0,0,0) 40%), radial-gradient(ellipse 80% 60% at 50% 45%, rgba(0,0,0,0) 60%, rgba(14,10,20,.45) 100%)' });

  // ------------------------------------------------------------ textos
  const sticker = (html, style = {}) => { const n = el(overlay, 'div', '', html, { position: 'absolute', left: '0px', top: '0px', whiteSpace: 'nowrap', transformOrigin: '50% 50%', ...style }); fade(n, 0); return n; };
  const BOX = { padding: '16px 28px 18px', borderRadius: '22px', background: '#FFFDF7', color: '#1C3A2B', font: '600 54px/1.1 var(--display)', boxShadow: '0 14px 30px -16px rgba(0,0,0,.55)', textAlign: 'center' };
  const PILL = (word, html) => `<div style="font:700 28px/1 var(--ui);letter-spacing:.1em;text-transform:uppercase;color:#F8C637;margin-bottom:10px">falso amigo</div><div style="font:600 50px/1.08 var(--display)"><span style="color:#F8C637">${word}</span> = ${html}</div>`;
  const PSTYLE = { padding: '16px 30px 20px', borderRadius: '22px', background: 'rgba(28,58,43,.94)', color: '#FFFDF7', textAlign: 'center', boxShadow: '0 14px 30px -16px rgba(0,0,0,.6)', border: '4px solid rgba(255,253,247,.9)' };
  const st = {
    hook: sticker('<div style="font:700 30px/1 var(--ui);letter-spacing:.14em;color:#2E6BFF;margin-bottom:12px">🎤 STAND-UP</div>palavras em inglês que<br>fingem ser português 💀', { ...BOX, font: '600 56px/1.14 var(--display)' }),
    p1: sticker(PILL('exquisite', 'requintado ✨'), PSTYLE),
    p2: sticker(PILL('novels', 'romances (livros) 📖'), PSTYLE),
    p3: sticker(PILL('pretend', 'FINGIR 💀'), PSTYLE),
    url: sticker('<div style="font:700 64px/1 var(--display)">batatalk.com.br</div><div style="font:600 34px/1.1 var(--ui);margin-top:12px;color:#1C3A2B">treine a conversa antes 🥔</div>', { padding: '18px 40px 20px', borderRadius: '30px', background: '#F8C637', color: '#14241C', textAlign: 'center', border: '5px solid #FFFDF7', boxShadow: '0 18px 36px -16px rgba(0,0,0,.6)' }),
    ask: sticker('qual palavra já te traiu? 👇', { ...BOX, font: '600 46px/1.1 var(--display)' }),
    fine: sticker('Vozes geradas por IA · exemplos animados', { font: '600 32px/1 var(--ui)', color: '#FFFDF7', padding: '10px 20px', borderRadius: '14px', background: 'rgba(20,36,28,.78)' }),
  };
  // o prato e a panela: adesivos que a "mão da mãe" puxa para fora do quadro
  const plate = sticker(plateSVG(false), { width: '360px', height: '300px' });
  const plateF = sticker(plateSVG(true), { width: '360px', height: '300px' });
  const pot = sticker(potSVG(), { width: '380px', height: '300px' });
  // legenda palavra a palavra; a palavra da vez na cor de quem fala, o falso amigo sempre amarelo
  const cap = el(overlay, 'div', '', '', { position: 'absolute', left: '540px', top: '1165px', transform: 'translate(-50%, -50%)', textAlign: 'center', whiteSpace: 'nowrap', font: '700 76px/1.05 var(--display)', color: '#FFFDF7', letterSpacing: '-.005em', WebkitTextStroke: '14px #14241C', paintOrder: 'stroke fill', textShadow: '0 8px 0 rgba(20,36,28,.28)' });
  const PAGES = buildPages(segs.map((s) => s.words));
  const HI = { jax: '#9CC2FF', tato: '#F8C637' }, FF = '#F8C637';

  // ------------------------------------------------------------ direção do Jax (pose, rosto, olhar)
  const K = { P: [], X: [], L: [] };
  const pk = (t, p, dur = 0.24, ease = 'inOut') => K.P.push([t, p, dur, ease]);
  const xk = (t, e) => K.X.push([t, e]);
  const lk = (t, l, turn = 0) => K.L.push([t, l, turn]);
  pk(0, 'explain', 0); xk(0, 'speaking'); lk(0, [0, 0]);
  // a gringa provando: cabeça para a direita, "beijo de chef", olhos semicerrados
  pk(S.j1c.at - 0.12, 'chef', 0.2, 'spring'); xk(S.j1c.at - 0.1, POSH); lk(S.j1c.at - 0.12, [0.35, -0.2], 0.16);
  pk(S.j2a.at - 0.05, 'rest', 0.3); xk(S.j2a.at - 0.06, DEADPAN); lk(S.j2a.at - 0.06, [0, 0]);
  pk(c.yank1 - 0.06, 'yank', 0.18, 'spring');
  pk(c.laugh1 + 0.15, 'rest', 0.4); xk(c.laugh1 + 0.1, 'smallSmile');
  pk(S.j3a.at - 0.05, 'explain', 0.24); xk(S.j3a.at - 0.05, 'speaking');
  // a gringa nervosa tentando agradar
  pk(S.j3b.at - 0.08, 'palm', 0.2, 'spring'); xk(S.j3b.at - 0.08, 'excited'); lk(S.j3b.at - 0.08, [0.35, 0], 0.16);
  // a mãe encantada: cabeça para o outro lado, mão no peito
  pk(S.j4a.at - 0.08, 'heart', 0.18, 'spring'); xk(S.j4a.at - 0.08, 'surprised'); lk(S.j4a.at - 0.08, [-0.35, -0.1], -0.16);
  xk(S.j4a.end, 'laugh');
  pk(S.j5a.at - 0.06, 'down', 0.26); xk(S.j5a.at - 0.06, 'proud'); lk(S.j5a.at - 0.06, [0, 0]);
  pk(c.farofa - 0.08, 'present', 0.2, 'spring'); xk(c.farofa - 0.05, 'smallSmile');
  pk(c.laugh3 + 0.2, 'rest', 0.4);
  pk(S.j6a.at - 0.05, 'explain', 0.24); xk(S.j6a.at - 0.05, 'speaking'); lk(S.j6a.at - 0.05, [0, 0]);
  // a mãe empolgada cochichando: mão em concha
  pk(S.j6b.at - 0.06, 'cup', 0.2, 'spring'); xk(S.j6b.at - 0.06, 'excited'); lk(S.j6b.at - 0.06, [-0.35, 0], -0.16);
  // ele, orgulhoso do próprio inglês
  pk(S.j7a.at - 0.05, 'palm', 0.24); xk(S.j7a.at - 0.05, 'proud'); lk(S.j7a.at - 0.05, [0, -0.15]);
  // a gringa desconfiada: dedo no queixo, olho de lado
  pk(S.j8a.at - 0.1, 'chin', 0.2, 'spring'); xk(S.j8a.at - 0.1, SUSP); lk(S.j8a.at - 0.1, [0.4, 0], 0.18);
  pk(c.laugh4 + 0.2, 'rest', 0.4); xk(c.laugh4 + 0.15, 'smallSmile'); lk(c.laugh4 + 0.15, [0, 0]);
  xk(S.j9a.at - 0.06, DEADPAN);
  pk(c.yank2 - 0.06, 'yank', 0.18, 'spring');
  pk(S.j9b.at - 0.04, 'rest', 0.3); xk(S.j9b.at - 0.04, TIRED);
  pk(c.laugh5 + 0.3, 'rest', 0.4); xk(c.laugh5 + 0.3, 'laugh');
  pk(S.j10a.at - 0.05, 'explain', 0.26); xk(S.j10a.at - 0.05, 'speaking'); lk(S.j10a.at - 0.05, [0, 0]);
  pk(S.j10b.at - 0.05, 'present', 0.24); xk(S.j10b.end, 'smallSmile');
  // o Tato sobe: o Jax olha para baixo, surpreso, e escuta
  pk(c.tato + 0.05, 'down', 0.3); xk(c.tato + 0.08, 'surprised'); lk(c.tato + 0.08, [0.55, 0.5], 0.12);
  // abaixa a mão antes do close do Tato (senão o braço entra pelo alto do quadro dele)
  pk(c.tato + 0.33, 'rest', 0.25);
  xk(S.t1a.at + 0.3, 'listening');
  // e para a câmera, cansado
  pk(S.j11.at - 0.08, 'shrug', 0.28); xk(S.j11.at - 0.08, TIRED); lk(S.j11.at - 0.08, [0, 0]);
  xk(c.laugh6 + 0.35, 'smallSmile');
  for (const L of Object.values(K)) L.sort((a, b) => a[0] - b[0]);
  const lastIdx = (list, t) => { let i = 0; for (let j = 0; j < list.length; j++) if (list[j][0] <= t) i = j; return i; };
  function armR(t) {
    const P = K.P, i = lastIdx(P, t), [t1, n1, d1, ease] = P[i], cur = ARM[n1];
    if (!d1 || !i) return cur;
    const prev = ARM[P[i - 1][1]], k = E[ease](clamp(inv(t1, t1 + d1, t)));
    return [lerp(prev[0], cur[0], k), lerp(prev[1], cur[1], k), k < 0.5 ? prev[2] : cur[2]];
  }
  function lookOf(t) {
    const L = K.L, i = lastIdx(L, t), [t1, l1, tu1] = L[i];
    if (!i) return { look: l1, turn: tu1 };
    const [, l0, tu0] = L[i - 1], k = E.inOut(clamp(inv(t1, t1 + 0.18, t)));
    return { look: [lerp(l0[0], l1[0], k), lerp(l0[1], l1[1], k)], turn: lerp(tu0, tu1, k) };
  }
  const BLINK = [1.9, 5.9, 9.6, 12.9, 16.4, 20.2, 24.1, 27.9, 31.5, 35.2, 38.6, 41.6];
  const exprCurveOf = (expr) => (typeof expr === 'string' ? EXPRESSIONS[expr]?.mouth?.curve : expr.mouth?.curve) ?? 0.1;
  function drawJax(t) {
    const expr = K.X[lastIdx(K.X, t)][1];
    const sg = segs.find((s) => s.who === 'jax' && t >= s.at - 0.04 && t <= s.end + 0.06);
    const { look, turn } = lookOf(t);
    const ov = { eyes: { look: look.map((x) => +x.toFixed(3)) } };
    let lvl = 0, nod = 0, gest = 0;
    if (sg) {
      const m = residentMouth(sg.voice, sg.at, t + LEAD, 0.95);
      // na cara de paisagem a boca fala sem sorrir (a piada sai seca)
      const ec = exprCurveOf(expr);
      if (m && m.t !== 'line') ov.mouth = { ...m, curve: ec < 0 ? ec : Math.max(m.curve ?? 0, ec * 0.6) };
      for (let k = -4; k <= 4; k++) lvl += envAt(sg.voice, t - sg.at + sg.a + k * 0.05) / 9;
      const u = (t - sg.words[0].t) / 0.45;
      if (u > 0 && u < 1) { const b = Math.sin(Math.PI * u); nod += 2 * b; gest += 4 * b; }
    }
    const a = armR(t), g = a[2] === 'rest' ? a : [a[0], +(a[1] + gest).toFixed(2), a[2]];
    const clean = (x) => x.filter((v) => v !== undefined).map((v) => (typeof v === 'number' ? +v.toFixed(2) : v));
    // risada dele junto com a plateia no "e a panela" (sobe e desce devagar, sem tremer)
    const laughBob = t > c.laugh5 + 0.3 && t < c.laugh5 + 1.6 ? 2.2 * Math.sin((t - c.laugh5 - 0.3) * 2 * Math.PI * 1.6) * Math.sin(Math.PI * (t - c.laugh5 - 0.3) / 1.3) : 0;
    const pose = {
      armL: clean(MIC), armR: clean(g),
      body: { rot: +(0.7 * Math.sin(t * 2 * Math.PI * 0.16) + 2 * turn).toFixed(2), dy: +(-0.8 * lvl - 0.4 * Math.sin(t * 2 * Math.PI * 0.21) - laughBob).toFixed(2) },
      head: { nod: +nod.toFixed(2), turn: +turn.toFixed(3) },
    };
    const o = { pose, expr, overlay: ov, blink: BLINK.some((b) => t >= b && t < b + 0.12), view: 'front', headExtra: +(1.4 * Math.sin(t * 2 * Math.PI * 0.11) + 22 * turn).toFixed(2) };
    paint('jax', o);
  }
  function paint(w, o) {
    const key = JSON.stringify(o);
    if (key !== box[w].dataset.k) { box[w].dataset.k = key; box[w].innerHTML = renderCharacter(DES[w], o).replace('<svg ', '<svg width="100%" height="100%" style="display:block;overflow:visible" '); }
  }
  // a primeira fila: Mina ri fácil, a June segura e depois cede, o Malik (o cético) só sorri na primeira
  // e gargalha na segunda
  const ROWPOSE = {
    mina: { laugh: { armL: [16, -120, 'open'], armR: [14, -60, 'rest'] } },
    june: { laugh: { armL: [12, -40, 'rest'], armR: [18, -118, 'fist'] } },
    malik: { cross: { armL: [14, -84, 'fist'], armR: [14, -80, 'fist'] }, laugh: { armL: [20, -70, 'open'], armR: [26, -96, 'open'] } },
  };
  function drawRow(t, big) {
    const u = big ? t - c.laugh5 : t - c.laugh3;
    for (const [w, ph] of [['mina', 0], ['june', 1.1], ['malik', 2.3]]) {
      const laughing = w === 'mina' || big || (w === 'june' && u > 0.35);
      const shake = laughing ? (big ? 3 : 2) * Math.sin(u * 2 * Math.PI * 1.8 + ph) : 0;
      const expr = w === 'malik' && !big ? { eyes: { open: 0.7 }, mouth: { curve: 0.35, w: 0.8, asym: 0.3 } } : laughing ? 'laugh' : 'smallSmile';
      const arms = w === 'malik' ? (big ? ROWPOSE.malik.laugh : ROWPOSE.malik.cross) : ROWPOSE[w].laugh;
      paint(w, { pose: { ...arms, body: { rot: +(1.2 * Math.sin(u * 1.3 + ph)).toFixed(2), dy: +(-Math.abs(shake)).toFixed(2) }, head: { nod: +(laughing ? 2 + shake * 0.6 : 0).toFixed(2) } }, expr, overlay: { eyes: { look: [w === 'mina' ? 0.2 : w === 'malik' ? -0.25 : 0, -0.35] } }, blink: Math.abs(((u + ph) % 2.6) - 1.3) < 0.06, view: 'front', headExtra: +(w === 'june' ? -3 : w === 'mina' ? 3 : 0).toFixed(2) });
    }
  }

  // ------------------------------------------------------------ o Tato na caixa de retorno
  const tatoParts = [S.t1a, S.t1b];
  tato.bake({
    seed: 29, marks: false,
    moods: [[0, 'idle'], [c.tato, 'greeting', { markAlpha: 0 }], [S.t1a.at, 'cheeky', { markAlpha: 0 }], [S.t1b.end + 0.2, 'proud', { markAlpha: 0 }]],
    gestures: [[c.tato + 0.25, 'wave'], [S.t1a.at + 0.1, 'point']],
    blinks: [c.tato + 0.9, S.t1b.end + 0.4],
    speech: [{ visemes: tatoParts.flatMap((p) => tatoSpeech(p.voice, p.at - LEAD)) }],
  }, duration);
  // missão cumprida: depois da dica ele afunda de volta na caixa (o último plano é só do Jax)
  c.tatoOut = S.t1b.end + 0.05;
  const tatoY = (t) => {
    if (t < c.tato) return TATO.y + 360;
    if (t >= c.tatoOut) return TATO.y + 360 * E.in(clamp((t - c.tatoOut) / 0.3));
    const u = (t - c.tato) / 0.5; return TATO.y + 360 * (u >= 1 ? 0 : Math.exp(-5.2 * u) * Math.cos(9.5 * u));
  };

  // ------------------------------------------------------------ planos
  const shots = [
    ['stage', 0, S.j2a.at - 0.04, 'MEDW', { creep: 0.06, bump: S.j1c.at + 0.05, amp: 0.03 }],
    ['stage', S.j2a.at - 0.04, c.laugh1 + 0.12, 'CU', { creep: 0.05, bump: S.j2b.words[2]?.t ?? S.j2b.at, amp: 0.045 }],
    ['stage', c.laugh1 + 0.12, S.j3a.at - 0.04, 'WIDE', { creep: 0.02 }],
    ['stage', S.j3a.at - 0.04, S.j4a.at - 0.04, 'MED', { creep: 0.05 }],
    ['stage', S.j4a.at - 0.04, S.j5a.at - 0.04, 'CU', { bump: S.j4a.at + 0.05, amp: 0.04 }],
    ['stage', S.j5a.at - 0.04, c.laugh3 + 0.1, 'MED', { creep: 0.04, bump: c.farofa, amp: 0.03 }],
    ['front', c.laugh3 + 0.1, S.j6a.at - 0.04],
    ['stage', S.j6a.at - 0.04, S.j7a.at - 0.04, 'MED', { creep: 0.06 }],
    ['stage', S.j7a.at - 0.04, S.j8a.at - 0.04, 'CU', { creep: 0.04, bump: c.pretend, amp: 0.035 }],
    ['stage', S.j8a.at - 0.04, c.laugh4 + 0.12, 'XCU', { creep: 0.06 }],
    ['stage', c.laugh4 + 0.12, S.j9a.at - 0.04, 'WIDE', { creep: 0.02 }],
    ['stage', S.j9a.at - 0.04, S.j9b.at - 0.04, 'MED', { creep: 0.05 }],
    ['stage', S.j9b.at - 0.04, c.laugh5 + 0.3, 'XCU', { bump: c.pot, amp: 0.06, shake: c.pot }],
    ['front', c.laugh5 + 0.3, S.j10a.at - 0.04, null, { big: true }],
    ['stage', S.j10a.at - 0.04, c.tato + 0.6, 'MEDT', { creep: 0.04, bump: c.tato + 0.15, amp: 0.03 }],
    // a dica do Tato em close (no plano a dois ele caía na faixa da legenda do post, y > 1248)
    ['stage', c.tato + 0.6, S.j11.at - 0.04, 'T_CU', { creep: 0.06 }],
    ['stage', S.j11.at - 0.04, duration + 1, 'MEDW', { creep: 0.05, bump: S.j11.at + 0.1, amp: 0.025 }],
  ].map(([kind, t0, t1, frame, o = {}]) => ({ kind, t0, t1, frame, ...o }));
  const shotAt = (t) => shots.find((s) => t >= s.t0 && t < s.t1) || shots[shots.length - 1];
  function camAt(t, sh) {
    const f = FR[sh.frame], u = clamp(inv(sh.t0, sh.t1, t));
    const kb = sh.bump != null && t >= sh.bump ? (sh.amp ?? 0.05) * Math.exp(-(t - sh.bump) * 9) : 0;
    const push = (1 + (sh.creep ?? 0.03) * E.inOut(u)) * (1 + kb);
    // o zoom empurra em direção aos olhos do Jax (o olhar não sai do lugar)
    const ey = ['WIDE', 'MEDT', 'TWO', 'T_CU'].includes(sh.frame) ? f.cy : JAX.eye;
    return { s: f.s * push, cx: f.cx, cy: f.cy + (ey - f.cy) * (1 - 1 / push) };
  }
  const shake = (t, sh) => { if (sh.shake == null || t < sh.shake) return [0, 0]; const k = t - sh.shake, a = 12 * Math.exp(-k * 11); return [a * Math.sin(k * 71), a * Math.cos(k * 59)]; };
  const hand = (t) => ({ x: 4 * Math.sin(t * 2 * Math.PI * 0.13), y: 3 * Math.sin(t * 2 * Math.PI * 0.11 + 2), r: 0.15 * Math.sin(t * 2 * Math.PI * 0.09 + 0.5) });
  // risadas visíveis: as cabeças da plateia balançam (devagar) durante as risadas
  const LAUGHS = [[c.chuckle, 0.9, 0.12], [c.laugh1, 1.5, 0.72], [c.laugh2, 1.0, 0.42], [c.laugh3, 1.6, 0.8], [c.laugh4, 1.8, 0.92], [c.laugh5, 2.3, 1], [c.tato + 0.18, 1.1, 0.5], [c.laugh6, 1.6, 0.82]];
  const laughAt = (t) => LAUGHS.reduce((m, [t0, len, sz]) => (t > t0 && t < t0 + len + 0.4 ? Math.max(m, sz * Math.min(1, (t - t0) / 0.15, (t0 + len + 0.4 - t) / 0.5)) : m), 0);

  // ------------------------------------------------------------ quadro
  const capCache = { i: -2, cur: -2 };
  function render(t) {
    const sh = shotAt(t), onStage = sh.kind === 'stage', inFront = sh.kind === 'front';
    fade(roomL, onStage ? 1 : 0); fade(worldL, onStage ? 1 : 0);
    if (onStage) {
      const cm = camAt(t, sh), hd = hand(t), [sx, sy] = shake(t, sh);
      const tw = `translate(${(540 + hd.x + sx).toFixed(2)}px, ${(960 + hd.y + sy).toFixed(2)}px) rotate(${hd.r.toFixed(3)}deg) scale(${cm.s.toFixed(5)}) translate(${(-cm.cx).toFixed(2)}px, ${(-cm.cy).toFixed(2)}px)`;
      if (worldL.style.transform !== tw) worldL.style.transform = tw;
      const rs = 0.8 * cm.s, rcx = STAGE.cx + (cm.cx - 540) / 0.8, rcy = STAGE.cy + (cm.cy - 1000) / 0.8;
      const tr = `translate(${(540 + 0.6 * (hd.x + sx)).toFixed(2)}px, ${(960 + 0.6 * (hd.y + sy)).toFixed(2)}px) rotate(${hd.r.toFixed(3)}deg) scale(${rs.toFixed(5)}) translate(${(-rcx).toFixed(2)}px, ${(-rcy).toFixed(2)}px)`;
      if (roomL.style.transform !== tr) roomL.style.transform = tr;
      drawJax(t);
      tato.frame(t, { x: TATO.x, y: tatoY(t), h: TATO.h, o: t >= c.tato && t < c.tatoOut + 0.32 ? 1 : 0, flip: true });
      const top = tatoY(t) - TATO.h * (207 / 220), cut = Math.max(0, top + TATO.h - (WEDGE.y + 22));
      tato.n.style.clipPath = `inset(-40px -40px ${cut.toFixed(1)}px -40px)`;
      const tu = (t - c.tato) / 0.5, sq = t >= c.tato && tu < 1.4 ? 0.12 * Math.exp(-3.6 * tu) * Math.sin(9.5 * tu) : 0;
      tato.n.style.transform = `scaleX(-1) scale(${(1 - sq).toFixed(4)}, ${(1 + sq).toFixed(4)})`;
      const lv = sh.frame === 'WIDE' ? laughAt(t) : 0;
      // no close do Tato a câmera está "no palco": as cabeças da plateia saem do quadro
      const headsOn = sh.frame !== 'T_CU' ? 'visible' : 'hidden';
      for (const [i, h] of heads.entries()) {
        if (h.n.style.visibility !== headsOn) h.n.style.visibility = headsOn;
        const b = lv * (4 + 3 * (i % 3)) * Math.abs(Math.sin(t * 2 * Math.PI * (1.5 + 0.17 * (i % 4)) + i));
        const v = `translateY(${(-b).toFixed(1)}px) rotate(${(lv * 2.2 * Math.sin(t * 3.1 + i)).toFixed(2)}deg)`;
        if (h.n.style.transform !== v) h.n.style.transform = v;
      }
    }
    fade(front, inFront ? 1 : 0);
    if (inFront) {
      const u = clamp(inv(sh.t0, sh.t1, t));
      css(frontW, { transform: `scale(${(1 + 0.04 * E.inOut(u)).toFixed(4)})` });
      drawRow(t, !!sh.big);
    }
    // linhas de foco no "e a panela"
    const fk = pulse(t, c.pot - 0.02, c.laugh5 + 0.3, 0.04, 0.1);
    fade(focus, onStage ? fk * 0.6 : 0);
    if (fk > 0) css(focus, { transform: `rotate(${(Math.floor(t * 8) % 2 ? 1 : -1).toFixed(1)}deg) scale(1.05)`, transformOrigin: '50% 40%' });
    // adesivos (cada um termina de sair antes do corte seguinte: nada encolhendo em cima de outro rosto)
    const s = (n, t0, t1, x, y, rot = 0, sc = 1) => stick(n, t, t0, t1, { x, y, rot, s: sc });
    s(st.hook, -1, S.j1c.at - 0.25, 540, 385, -2);
    s(st.p1, c.laugh1 + 0.2, S.j4a.at - 0.24, 540, 360, -1.5);
    s(st.p2, c.laugh3 + 0.15, S.j7a.at - 0.24, 540, 360, 1.5);
    s(st.p3, c.laugh4 + 0.1, S.j9b.at - 0.24, 540, 360, -1.5);
    // cartão final dentro da zona segura: pergunta e aviso no alto; o endereço entra no lugar da
    // legenda quando a última fala acaba
    s(st.ask, S.j11.at + 0.1, duration + 1, 540, 335, 1.5, 0.95);
    s(st.fine, S.j11.end + 0.4, duration + 1, 540, 448, 0, 0.82);
    s(st.url, S.j11.end + 0.18, duration + 1, 540, 1150, -2, 0.92);
    // o prato: entra no "Minha mãe", sai voando no "tirou"; volta no "Devolveu" (com farofa no
    // "farofa"); entra de novo e sai no segundo "tirou"; a panela sai voando no "panela"
    const fly = (n, tIn, tOut, x, y, rot, sc, dir = 1) => {
      if (t < tIn - 0.001 || t > tOut + 0.36) { fade(n, 0); return; }
      const k = E.spring(clamp(inv(tIn, tIn + 0.3, t))), o = clamp(inv(tOut, tOut + 0.34, t)), ko = E.in(o);
      fade(n, Math.min(1, (t - tIn) / 0.06) * (1 - clamp(inv(tOut + 0.26, tOut + 0.36, t))));
      css(n, { left: x + dir * 900 * ko, top: y - 160 * ko + 60 * ko * ko, transform: `translate(-50%, -50%) rotate(${(rot + dir * 70 * ko + 1.4 * Math.sin((t - tIn) * 4.4)).toFixed(2)}deg) scale(${(sc * (0.4 + 0.6 * k)).toFixed(4)})` });
    };
    // (um estado por janela de tempo; o prato fica no alto à direita, longe do rosto)
    const backEnd = c.laugh3 + 0.1 - 0.18;
    if (t >= S.j2a.at - 0.001 && t <= c.yank1 + 0.36) fly(plate, S.j2a.at, c.yank1, 830, 470, -6, 0.72);
    else if (t >= c.back - 0.1 && t < c.farofa) {
      // volta deslizando da direita no "Devolveu"
      const k = E.out(clamp(inv(c.back - 0.1, c.back + 0.35, t)));
      fade(plate, 1); css(plate, { left: 830 + 700 * (1 - k), top: 520, transform: `translate(-50%, -50%) rotate(${(-6 + 30 * (1 - k)).toFixed(2)}deg) scale(0.74)` });
    } else if (t >= S.j9a.at - 0.001 && t <= c.yank2 + 0.36) fly(plate, S.j9a.at, c.yank2, 840, 540, -6, 0.7);
    else fade(plate, 0);
    // com farofa: o prato com farofa fica até o fim da risada
    if (t >= c.farofa && t < backEnd + 0.16) {
      const k = E.spring(clamp(inv(c.farofa, c.farofa + 0.3, t))), ko = E.in(clamp(inv(backEnd, backEnd + 0.16, t)));
      fade(plateF, 1 - ko); css(plateF, { left: 830, top: 520, transform: `translate(-50%, -50%) rotate(${(-6 + 1.4 * Math.sin((t - c.farofa) * 4.4)).toFixed(2)}deg) scale(${(0.74 * (0.94 + 0.06 * k) * (1 - 0.45 * ko)).toFixed(4)})` });
    } else fade(plateF, 0);
    // a panela só aparece no "e a panela" (antes estragaria a piada) e sai voando no fim da palavra
    fly(pot, S.j9b.at - 0.02, c.pot + 0.1, 860, 560, 4, 0.7);
    // legenda
    let pi = -1; for (let i = 0; i < PAGES.length; i++) if (t >= PAGES[i].start && t < PAGES[i].end) { pi = i; break; }
    if (pi < 0) { fade(cap, 0); capCache.i = -1; }
    else {
      const pg = PAGES[pi], col = HI[pg.words[0].who] || '#F8C637';
      if (capCache.i !== pi) { capCache.i = pi; capCache.cur = -2; cap.innerHTML = pg.words.map((x, i) => `<span data-i="${i}">${x.w}</span>`).join(' '); }
      let cur = -1; pg.words.forEach((x, i) => { if (t >= x.t - 0.03) cur = i; });
      if (capCache.cur !== cur) { capCache.cur = cur; cap.querySelectorAll('span').forEach((n, i) => { n.style.color = pg.words[i].ff ? FF : i === cur ? col : '#FFFDF7'; }); }
      const k = E.out(clamp(inv(pg.start, pg.start + 0.1, t)));
      fade(cap, 1); css(cap, { transform: `translate(-50%, -50%) scale(${(0.88 + 0.12 * k).toFixed(4)})` });
    }
  }
  // desfoque de movimento só onde há movimento, e nunca num quadro cuja janela cruze um corte
  const CUTS = shots.map((x) => x.t0).filter((x) => x > 0);
  const samples = (t) => {
    if (CUTS.some((x) => Math.abs(t - x) < 0.02)) return 1;
    const near = (a, w0) => a != null && t > a && t < a + w0;
    if (near(c.tato, 0.6) || near(c.yank1, 0.4) || near(c.yank2, 0.4) || near(c.pot, 0.4) || near(c.back - 0.1, 0.4)) return [8, 0.5];
    return 1;
  };
  return { duration, cues: c, captions, audio: A.items, samples, render, hook: { title: 'palavras em inglês que fingem ser português' }, safe: [120, 270, 960, 1248], async ready() { return true; } };
}

/** SVG rasterizado uma vez (textos na fonte da marca, neon com brilho), com desfoque de profundidade. */
async function bitmap(svg, w, h, texts, blur) {
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  const img = new Image(); img.src = url; await img.decode();
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); g.drawImage(img, 0, 0); URL.revokeObjectURL(url);
  await Promise.all(texts.map((x) => document.fonts.load(x.font)));
  for (const x of texts) {
    g.save(); g.font = x.font; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    if (x.spacing) g.letterSpacing = `${x.spacing}px`;
    if (x.glow) { g.shadowColor = x.glow; for (const b of [x.blur, x.blur * 0.5, 8]) { g.shadowBlur = b; g.fillStyle = x.glow; g.fillText(x.text, x.x, x.y); } g.shadowBlur = 0; }
    g.fillStyle = x.color; g.fillText(x.text, x.x, x.y); g.restore();
  }
  const c2 = document.createElement('canvas'); c2.width = w; c2.height = h;
  const g2 = c2.getContext('2d'); g2.filter = `blur(${blur}px)`; g2.drawImage(c, 0, 0);
  const out = c2.toDataURL('image/png');
  c.width = c.height = c2.width = c2.height = 1;
  return out;
}

// peças reaproveitadas pelo stand-up v3 (src/cuts/standup3.js)
export { JAX, WEDGE, TATO, FR, MIC, ARM, DES, POSH, DEADPAN, SUSP, TIRED, LEAD, speedLine, bitmap };
