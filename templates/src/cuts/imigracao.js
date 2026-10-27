// AO PÉ DA LETRA NA IMIGRAÇÃO 9:16 (Reels primeiro, ~28 s): a Mina chega ao Bata Airport e responde
// à oficial (a Evelyn, que atende a Imigração no app: character-places.js) traduzindo expressões
// brasileiras ao pé da letra. A vaquinha vira "a little cow", o cavalinho da chuva vira um cavalo de
// verdade e "chutei o balde" vira "I kicked the bucket", que em inglês quer dizer MORRER. O Tato pula
// do balcão, sopra a frase certa, a Evelyn carimba o passaporte (com as anotações dela: 1 vaca, 1
// cavalo, viva) e a Mina devolve a pergunta pra quem assiste; "Next!" emenda no começo.
// Formato: "erro → reação do personagem" (references/20, 22, 23), com o produto dentro da piada.
// Balões de pensamento mostram o que a oficial imagina (funciona sem som); a tradução brasileira
// aparece em pílulas; movimento calmo; campo e contracampo; um tranco por piada.
import { E, clamp, lerp, inv, pulse, el, css, fade, TatoActor, AudioList, tatoSpeech } from './kit.js';
import { residentMouth, envAt } from '../core/visemes.js';
import { renderCharacter, EXPRESSIONS, mergeDesign } from '/character-rig.js';
import { DESIGNS } from '/character-designs.js';
import { airportSVG, AIRPORT } from './airport-room.js';
import { fastLine, align, segVoice, stick, buildPages, focusLines } from './creator.js';

const SPEED = 1.1, PAD_A = 0.03, PAD_B = 0.07, LEAD = 0.025;
const FAST = new Set(['imeE1', 'imeE3', 'imeE5', 'imeT1', 'imeM6']);
// [arquivo, a, b, legenda] — a e b em segundos do arquivo ORIGINAL (o acelerado divide por 1,1)
const SEG = {
  e1: ['imeE1', 0.06, 2.17, "Who's paying for your trip?"],
  m1: ['imeM1', 0.04, 2.11, 'My friends made a little cow!'],
  e2: ['imeE2', 0.15, 1.02, 'A cow.'],
  e3: ['imeE3', 0.16, 1.72, 'Do you plan to work here?'],
  m2a: ['imeM2', 0.03, 0.52, 'No, no…'],
  m2b: ['imeM2', 0.97, 2.83, 'I took my little horse out of the rain.'],
  e4: ['imeE4', 0.0, 1.31, 'And a horse.'],
  e5: ['imeE5', 0.12, 2.27, 'And your job back home?'],
  m3: ['imeM3', 0.0, 1.12, 'I kicked the bucket!'],
  e6a: ['imeE6', 0.22, 0.75, 'You…'],
  e6b: ['imeE6', 1.52, 1.97, 'died?'],
  m4a: ['imeM4', 0.04, 0.43, 'Pera…'],
  m4b: ['imeM4', 1.33, 1.77, 'o quê?!'],
  t1a: ['imeT1', 0.36, 1.92, 'Kick the bucket é morrer!'],
  t1b: ['imeT1', 2.16, 2.46, 'Fala:'],
  t1c: ['imeT1', 2.98, 4.07, 'I quit my job.'],
  m5: ['imeM5', 0.02, 0.94, 'I quit my job!'],
  e7: ['imeE7', 0.04, 1.96, 'Welcome to Batata City.'],
  m6: ['imeM6', 0.01, 2.17, 'E você, ia traduzir qual?'],
  e8: ['imeE8', 0.13, 0.85, 'Next!'],
};
const EN = new Set(['e1', 'm1', 'e2', 'e3', 'm2a', 'm2b', 'e4', 'e5', 'm3', 'e6a', 'e6b', 'm5', 'e7', 'e8']);

// ------------------------------------------------------------------ as duas no mundo
// Mundo = tela no plano a dois (s = 1). A Evelyn fica atrás do balcão (tampo em y 1290); a Mina,
// do lado do viajante. eyeH = altura dos olhos no rig (unidades acima dos pés).
const COUNTER_TOP = 1290;
const CH = {
  mina: { x: 300, k: 3.5, eyeH: 186, eye: 1000 },
  evelyn: { x: 830, k: 3.5, eyeH: 186, eye: 980 },
};
for (const c of Object.values(CH)) c.feet = c.eye + c.eyeH * c.k;
const at = (who, s, ex, ey) => ({ s, cx: CH[who].x - (ex - 540) / s, cy: CH[who].eye - (ey - 960) / s });
const TATO = { x: 655, y: COUNTER_TOP + 8, h: 300 };
const FR = {
  TWO: { s: 1, cx: 565, cy: 1050 },
  MED2: { s: 1.15, cx: 565, cy: 990 - (800 - 960) / 1.15 },
  M_CU: at('mina', 1.9, 470, 800), M_CUF: at('mina', 1.7, 540, 840),
  E_MED: at('evelyn', 1.45, 620, 780), E_BUB: at('evelyn', 1.45, 700, 820), E_CU: at('evelyn', 1.9, 610, 800),
  E_XCU: at('evelyn', 2.5, 540, 740), E_CUF: at('evelyn', 1.7, 540, 840),
  T_CU: { s: 1.9, cx: TATO.x, cy: (TATO.y - 0.6 * TATO.h) - (820 - 960) / 1.9 },
};
// braços [braço, antebraço ABSOLUTO, mão, objeto?]; L = esquerda da tela. No 3/4 o braço do lado
// oposto ao olhar fica atrás do corpo: a Mina (olha para a direita) segura o passaporte na direita;
// a Evelyn (olha para a esquerda) carimba com a esquerda.
const POSE = {
  mina: {
    rest: { armL: [10, 4, 'rest'], armR: [16, -50, 'rest', 'passport'] },
    proud: { armL: [10, 4, 'rest'], armR: [22, -118, 'rest', 'passport'] },
    wave: { armL: [10, 4, 'rest'], armR: [46, -14, 'rest', 'passport'] },
    tada: { armL: [10, 4, 'rest'], armR: [104, 150, 'rest', 'passport'] },
    huh: { armL: [30, 100, 'open'], armR: [30, 100, 'rest', 'passport'] },
    cheer: { armL: [120, 140, 'fist'], armR: [120, 150, 'rest', 'passport'] },
  },
  evelyn: {
    desk: { armL: [36, -70, 'rest'], armR: [14, -40, 'rest'] },
    shock: { armL: [34, 120, 'open'], armR: [34, 120, 'open'] },
    raise: { armL: [118, 150, 'fist', 'stamp'], armR: [14, -40, 'rest'] },
    slam: { armL: [46, -36, 'fist', 'stamp'], armR: [14, -40, 'rest'] },
    point: { armL: [80, 70, 'point'], armR: [14, -40, 'rest'] },
  },
};
const DES = {
  mina: mergeDesign(DESIGNS.mina, { colors: { ...DESIGNS.mina.colors, passport: '#1F3B63', gold: '#E8C46A' }, props: { ...DESIGNS.mina.props, passport: { upright: true, reach: 0.2, dx: 2, dy: -4, grip: 'rest', thumb: true, front: false, shapes: [{ t: 'poly', pts: [[-11, -15, 3], [11, -15, 3], [11, 15, 3], [-11, 15, 3]], fill: 'passport' }, { t: 'poly', pts: [[0, -6, 1], [5, 0, 1], [0, 6, 1], [-5, 0, 1]], fill: 'gold' }] } } }),
  evelyn: mergeDesign(DESIGNS.evelyn, { colors: { ...DESIGNS.evelyn.colors, stampKnob: '#8A5A3C', stampNeck: '#5E3B26', stampBase: '#D9343F' }, props: { ...DESIGNS.evelyn.props, stamp: { upright: true, reach: 0.15, dx: 0, dy: 2, grip: 'fist', thumb: false, front: false, shapes: [{ t: 'poly', pts: [[-7, -30, 6], [7, -30, 6], [7, -18, 6], [-7, -18, 6]], fill: 'stampKnob' }, { t: 'poly', pts: [[-3, -18, 1], [3, -18, 1], [3, -4, 1], [-3, -4, 1]], fill: 'stampNeck' }, { t: 'poly', pts: [[-13, -4, 2], [13, -4, 2], [13, 6, 2], [-13, 6, 2]], fill: 'stampBase' }] } } }),
};
const DEADPAN = { eyes: { open: 0.55, lid: 6 }, brows: { y: -0.1 }, mouth: { curve: -0.05, w: 0.7 } };
const SHOCK = { eyes: { open: 1.15, pupil: 0.55 }, brows: { y: 0.95 }, mouth: { t: 'wobble', w: 0.55 } };
const SLY = { eyes: { open: 0.75, low: 0.2 }, brows: { y: 0.35, rot: -6 }, mouth: { curve: 0.55, w: 0.8, asym: 0.4 } };
const AGHAST = { eyes: { open: 1.2, pupil: 0.5 }, brows: { y: 1.0 }, mouth: { open: 0.75, curve: -0.25, w: 0.5 } };

export async function create(ctx) {
  const { W, H, overlay, voices: V } = ctx;
  const A = new AudioList();
  const F = {};
  for (const [id] of Object.values(SEG)) F[id] ??= FAST.has(id) ? fastLine(V.lines[id], id) : V.lines[id];
  const who = (id) => (id.startsWith('imeE') ? 'evelyn' : id.startsWith('imeT') ? 'tato' : 'mina');

  // ------------------------------------------------------------ montagem da fala
  const S = {}, c = {};
  let T = 0.05;
  const put = (key, gap = 0.1) => {
    T += gap;
    const [id, a0, b0, text] = SEG[key], f = F[id], sp = FAST.has(id) ? SPEED : 1;
    const a = Math.max(0, (a0 - PAD_A) / sp), b = (b0 + PAD_B) / sp;
    const words = align(text, f.spans, a0 / sp, b0 / sp);
    A.clip(id, T, a, b, V, { file: f.file });
    const off = T - a, w = who(id);
    S[key] = { key, id, who: w, at: T, end: T + b - a, a, b, voice: segVoice(f, a, b, words), words: words.map((x) => ({ w: x.w, t: x.t + off, e: x.e + off, who: w })), text };
    T = S[key].end;
    return S[key];
  };
  // 1. vaquinha
  put('e1', 0); put('m1', 0.12);
  c.bub1 = S.m1.end + 0.02;
  put('e2', 0.32);
  // 2. cavalinho da chuva
  put('e3', 0.42); put('m2a', 0.1); put('m2b', 0.1);
  c.bub2 = S.m2b.end + 0.02;
  put('e4', 0.32);
  // 3. chutei o balde
  put('e5', 0.4); put('m3', 0.1);
  c.drop = S.m3.end + 0.02;
  put('e6a', 0.5); put('e6b', 0.32);
  c.ghost = S.e6b.end + 0.1;
  put('m4a', 0.28); put('m4b', 0.14);
  // 4. o Tato sopra a frase certa
  c.tato = S.m4b.end + 0.12;
  put('t1a', 0.45); put('t1b', 0.12); put('t1c', 0.16);
  put('m5', 0.22);
  // 5. carimbo (com as anotações dela) e a pergunta pra quem assiste
  c.raise = S.m5.end + 0.1; c.stamp = c.raise + 0.42;
  T = c.stamp - 0.02; put('e7', 0);
  c.insertEnd = S.e7.end + 0.14;
  T = c.insertEnd; put('m6', 0.12);
  // 6. o laço: "Next!" e o vídeo recomeça na primeira pergunta
  put('e8', 0.32);
  const duration = +(S.e8.end + 0.24).toFixed(3);
  c.duration = duration;
  for (const [k, v] of Object.entries(S)) c[k] = +v.at.toFixed(3);
  const segs = Object.values(S);

  // ------------------------------------------------------------ som
  A.cue('music', 0, { sections: [[0, 'vlog'], [duration, 'out']], drops: [[c.drop, c.tato - 0.05], [S.e8.at - 0.06, duration + 1]], bpm: 104 });
  A.cue('ambience', 0, { until: duration });
  A.sfx('pop', c.bub1, { gain: 0.42 }); A.sfx('tick', S.e2.end + 0.06, { gain: 0.3 });
  A.sfx('pop', c.bub2, { gain: 0.42 }); A.sfx('tick', S.e4.end + 0.06, { gain: 0.3 });
  A.sfx('scratch', c.drop, { gain: 0.6 });
  A.sfx('thud', S.e6b.at - 0.02, { gain: 0.62 });
  A.sfx('dream', c.ghost, { gain: 0.38 });
  A.sfx('boing', c.tato + 0.05, { gain: 0.6 });
  A.sfx('pop', S.t1c.at, { gain: 0.3 });
  A.sfx('chip', S.m5.end + 0.02, { gain: 0.5 });
  A.sfx('whoosh', c.stamp - 0.12, { gain: 0.35 }); A.sfx('stamp', c.stamp + 0.02, { gain: 0.8 });
  A.sfx('motif-end', S.m6.at + 0.15, { gain: 0.4 });
  A.sfx('whoosh', S.e8.at - 0.1, { gain: 0.3 });
  const NAME = { mina: 'Mina', evelyn: 'Evelyn', tato: 'Tato' };
  const captions = segs.map((s) => ({ start: s.at, end: s.end, who: NAME[s.who], text: s.text, lang: EN.has(s.key) ? 'en' : 'pt' })).sort((x, y) => x.start - y.start);

  // ------------------------------------------------------------ cena: imigração, as duas, balcão, Tato
  const scene = el(overlay, 'div', 'layer', '', { width: `${W}px`, height: `${H}px`, overflow: 'hidden', background: '#E9E1CF' });
  const roomL = el(scene, 'div', 'layer', '', { width: `${AIRPORT.w}px`, height: `${AIRPORT.h}px` });
  el(roomL, 'img', '', '', { position: 'absolute', left: '0px', top: '0px', width: `${AIRPORT.w}px`, height: `${AIRPORT.h}px` }).src = await airportBitmap();
  const worldL = el(scene, 'div', 'layer', '', {});
  const box = {};
  const mkBox = (w) => { const D = DES[w], vb = Math.max(250, D.height * 0.92), h = D.height + 38, C = CH[w]; box[w] = el(worldL, 'div', '', '', { position: 'absolute', left: `${C.x - (vb / 2) * C.k}px`, top: `${C.feet - (D.height + 24) * C.k}px`, width: `${vb * C.k}px`, height: `${h * C.k}px` }); };
  mkBox('evelyn');
  const tato = new TatoActor(worldL, { id: 'ime' });
  // balcão da imigração na frente da Evelyn (cobre ela da cintura para baixo); monitor e carimbo em cima
  el(worldL, 'div', '', counterSVG(), { position: 'absolute', left: '560px', top: `${COUNTER_TOP - 130}px`, width: '700px', height: '900px' });
  const deskStamp = el(worldL, 'div', '', '<svg width="60" height="60" viewBox="0 0 60 60"><ellipse cx="30" cy="12" rx="15" ry="11" fill="#8A5A3C"/><rect x="25" y="18" width="10" height="20" fill="#5E3B26"/><rect x="10" y="36" width="40" height="14" rx="4" fill="#D9343F"/></svg>', { position: 'absolute', left: '935px', top: `${COUNTER_TOP - 56}px`, width: '60px', height: '60px' });
  mkBox('mina');
  // o "fantasma" da Mina (kick the bucket = morrer): sobe da cabeça dela com uma auréola
  const ghost = el(worldL, 'div', '', '<div style="position:absolute;left:50%;top:0;transform:translateX(-50%);width:130px;height:30px;border:8px solid #FFF3B0;border-radius:50%;box-shadow:0 0 22px #FFF3B0"></div><div style="font:400 190px/1 var(--display);text-align:center;margin-top:14px">👻</div>', { position: 'absolute', left: '0px', top: '0px', width: '200px', height: '250px', opacity: '0' });
  // luz do fim de tarde entrando pela janela (esquerda) + vinheta
  el(scene, 'div', 'layer', '', { width: `${W}px`, height: `${H}px`, background: 'radial-gradient(ellipse 72% 56% at 50% 44%, rgba(0,0,0,0) 56%, rgba(40,30,20,.32) 100%), linear-gradient(100deg, rgba(255,214,150,.16), rgba(0,0,0,0) 45%)' });
  const focus = el(scene, 'div', 'layer', focusLines(), { width: `${W}px`, height: `${H}px` });

  // ------------------------------------------------------------ insert: o passaporte carimbado
  const insert = el(scene, 'div', 'layer', '', { width: `${W}px`, height: `${H}px`, background: '#4F7F8C', overflow: 'hidden' });
  const page = el(insert, 'div', '', passportPage(), { position: 'absolute', left: '70px', top: '300px', width: '940px', height: '1180px', borderRadius: '34px', background: '#F3ECD9', boxShadow: '0 40px 70px -30px rgba(0,0,0,.6)', overflow: 'hidden', transformOrigin: '50% 50%' });
  el(page, 'div', '', 'VISAS · VISTOS', { position: 'absolute', left: '60px', top: '48px', font: '700 34px/1 var(--display)', letterSpacing: '.12em', color: '#B9A47A' });
  const note = el(page, 'div', '', '<div style="font:600 30px/1 var(--ui);letter-spacing:.06em;opacity:.7;margin-bottom:18px">visitor notes:</div><div>1 cow ✓</div><div>1 horse ✓</div><div>alive ✓</div>', { position: 'absolute', left: '470px', top: '420px', width: '400px', padding: '34px 36px', background: '#F8E27A', color: '#1C3A2B', font: '600 54px/1.25 var(--display)', boxShadow: '0 18px 30px -14px rgba(0,0,0,.45)', transform: 'rotate(4deg)' });
  const stampMark = el(page, 'div', '', '<div style="font:700 104px/1 var(--display);letter-spacing:.04em">WELCOME</div><div style="font:700 40px/1.2 var(--display);letter-spacing:.14em;margin-top:10px">BATA AIRPORT ✈</div><div style="font:600 34px/1.2 var(--display);letter-spacing:.1em;margin-top:6px">27 OCT 2026</div>', { position: 'absolute', left: '70px', top: '96px', padding: '30px 44px 34px', border: '10px double #D9343F', borderRadius: '30px', color: '#D9343F', textAlign: 'center', transformOrigin: '50% 50%', mixBlendMode: 'multiply' });

  // ------------------------------------------------------------ textos
  const sticker = (html, style = {}) => { const n = el(overlay, 'div', '', html, { position: 'absolute', left: '0px', top: '0px', whiteSpace: 'nowrap', transformOrigin: '50% 50%', ...style }); fade(n, 0); return n; };
  const BOX = { padding: '16px 28px 18px', borderRadius: '22px', background: '#FFFDF7', color: '#1C3A2B', font: '600 54px/1.1 var(--display)', boxShadow: '0 14px 30px -16px rgba(0,0,0,.55)', textAlign: 'center' };
  const PILL = (expr) => `<div style="font:700 28px/1 var(--ui);letter-spacing:.08em;text-transform:uppercase;color:#F8C637;margin-bottom:8px">ao pé da letra</div><div style="font:600 50px/1.05 var(--display)">“${expr}”</div>`;
  const PSTYLE = { padding: '16px 30px 20px', borderRadius: '22px', background: 'rgba(28,58,43,.92)', color: '#FFFDF7', textAlign: 'center', boxShadow: '0 14px 30px -16px rgba(0,0,0,.6)' };
  const bubble = (emoji, line) => sticker(`<svg width="470" height="330" viewBox="0 0 470 330" style="position:absolute;left:0;top:0;overflow:visible"><path d="M96 238 C28 236 18 150 78 130 C58 70 128 26 182 58 C210 8 300 6 330 58 C384 26 458 62 440 128 C496 150 482 236 410 238 Z" fill="#FFFDF7" stroke="#14241C" stroke-width="8" stroke-linejoin="round"/><circle cx="392" cy="276" r="18" fill="#FFFDF7" stroke="#14241C" stroke-width="7"/><circle cx="430" cy="312" r="10" fill="#FFFDF7" stroke="#14241C" stroke-width="6"/></svg><div style="position:absolute;left:0;top:30px;width:470px;text-align:center;font:400 134px/1 var(--display)">${emoji}</div><div style="position:absolute;left:0;top:172px;width:470px;text-align:center;font:600 40px/1 var(--display);color:#1C3A2B">${line}</div>`, { width: '470px', height: '330px' });
  const st = {
    hook: sticker('brasileira na imigração<br>traduzindo TUDO ao pé da letra 💀', { ...BOX, font: '600 54px/1.16 var(--display)' }),
    p1: sticker(PILL('fizeram uma vaquinha'), PSTYLE),
    p2: sticker(PILL('tirei o cavalinho da chuva'), PSTYLE),
    p3: sticker(PILL('chutei o balde'), PSTYLE),
    b1: bubble('🐄', 'a little… cow?'),
    b2: bubble('🐴☔', 'a horse… in the rain?'),
    fact: sticker('<span style="color:#F8C637">“kick the bucket”</span><br>= MORRER em inglês 💀', { padding: '18px 32px 20px', borderRadius: '24px', background: '#1C3A2B', color: '#FFFDF7', font: '700 54px/1.12 var(--display)', textAlign: 'center', border: '6px solid #FFFDF7', boxShadow: '0 20px 40px -18px rgba(0,0,0,.7)' }),
    right: sticker('<span style="color:#1C3A2B">“I quit my job”</span> = pedi demissão ✅', { ...BOX, font: '600 46px/1.1 var(--display)', background: '#F8C637' }),
    url: sticker('<div style="font:700 64px/1 var(--display)">batatalk.com.br</div><div style="font:600 34px/1.1 var(--ui);margin-top:12px;color:#1C3A2B">ensaie a imigração antes 🥔</div>', { padding: '18px 40px 20px', borderRadius: '30px', background: '#F8C637', color: '#14241C', textAlign: 'center', border: '5px solid #FFFDF7', boxShadow: '0 18px 36px -16px rgba(0,0,0,.6)' }),
    fine: sticker('Vozes geradas por IA · exemplos animados', { font: '600 32px/1 var(--ui)', color: '#FFFDF7', padding: '10px 20px', borderRadius: '14px', background: 'rgba(20,36,28,.74)' }),
  };
  // legenda palavra a palavra; a palavra da vez na cor de quem fala
  const cap = el(overlay, 'div', '', '', { position: 'absolute', left: '540px', top: '1165px', transform: 'translate(-50%, -50%)', textAlign: 'center', whiteSpace: 'nowrap', font: '700 76px/1.05 var(--display)', color: '#FFFDF7', letterSpacing: '-.005em', WebkitTextStroke: '14px #14241C', paintOrder: 'stroke fill', textShadow: '0 8px 0 rgba(20,36,28,.28)' });
  const PAGES = buildPages(segs.map((s) => s.words));
  const HI = { mina: '#7FE3D5', evelyn: '#FF9A8A', tato: '#F8C637' };

  // ------------------------------------------------------------ direção das duas
  const K = { mina: { P: [], X: [], L: [] }, evelyn: { P: [], X: [], L: [] } };
  const pk = (w, t, p, dur = 0.24, ease = 'inOut') => K[w].P.push([t, p, dur, ease]);
  const xk = (w, t, e) => K[w].X.push([t, e]);
  const lk = (w, t, l, view = w === 'mina' ? 'q34' : 'q34r') => K[w].L.push([t, l, view]);
  // Mina: orgulhosa de cada resposta; só entende no "died?"
  pk('mina', 0, 'rest', 0); xk('mina', 0, 'smallSmile'); lk('mina', 0, [0.6, 0]);
  pk('mina', S.m1.at - 0.06, 'proud', 0.2, 'spring'); xk('mina', S.m1.at - 0.06, 'proud');
  pk('mina', c.bub1, 'rest', 0.3); xk('mina', c.bub1, 'smallSmile');
  pk('mina', S.m2a.at - 0.06, 'wave', 0.18, 'spring'); xk('mina', S.m2a.at - 0.06, 'laugh');
  xk('mina', S.m2b.at - 0.04, 'proud'); pk('mina', S.m2b.end + 0.05, 'rest', 0.3);
  xk('mina', c.bub2, 'smallSmile');
  pk('mina', S.m3.at - 0.06, 'tada', 0.18, 'spring'); xk('mina', S.m3.at - 0.06, 'excited');
  pk('mina', S.e6b.end + 0.02, 'rest', 0.3); xk('mina', S.e6b.end + 0.02, 'confused');
  pk('mina', S.m4a.at - 0.06, 'huh', 0.16, 'spring'); xk('mina', S.m4a.at - 0.06, SHOCK); lk('mina', S.m4a.at - 0.06, [0, 0], 'front');
  lk('mina', S.m4b.end + 0.05, [0.6, -0.4]);
  pk('mina', c.tato, 'rest', 0.3); xk('mina', c.tato + 0.08, 'surprised'); lk('mina', c.tato + 0.12, [0.5, 0.45]);
  xk('mina', S.t1c.at, 'concerned');
  pk('mina', S.m5.at - 0.05, 'cheer', 0.16, 'spring'); xk('mina', S.m5.at - 0.05, 'excited'); lk('mina', S.m5.at - 0.05, [0.6, 0]);
  pk('mina', S.m5.end + 0.3, 'rest', 0.35); xk('mina', S.m5.end + 0.3, 'laugh');
  pk('mina', c.insertEnd, 'rest', 0); xk('mina', c.insertEnd, SLY); lk('mina', c.insertEnd, [0, 0], 'front');
  // Evelyn: rotina seca, anota, choque, carimbo, "Next!"
  pk('evelyn', 0, 'desk', 0); xk('evelyn', 0, 'neutral'); lk('evelyn', 0, [-0.4, 0.45]);
  lk('evelyn', S.e1.end - 0.1, [-0.6, 0]); xk('evelyn', S.m1.at, 'listening');
  xk('evelyn', c.bub1, DEADPAN); lk('evelyn', S.e2.end + 0.02, [-0.25, 0.65]);
  xk('evelyn', S.e3.at - 0.06, 'neutral'); lk('evelyn', S.e3.at - 0.06, [-0.6, 0]);
  xk('evelyn', S.m2b.at, 'listening');
  xk('evelyn', c.bub2, DEADPAN); lk('evelyn', S.e4.end + 0.02, [-0.25, 0.65]);
  xk('evelyn', S.e5.at - 0.06, 'neutral'); lk('evelyn', S.e5.at - 0.06, [-0.6, 0]);
  xk('evelyn', S.m3.at, 'listening');
  pk('evelyn', c.drop + 0.1, 'shock', 0.16, 'spring'); xk('evelyn', c.drop + 0.1, AGHAST);
  lk('evelyn', c.ghost + 0.1, [-0.6, -0.55]);
  pk('evelyn', c.tato, 'desk', 0.4); xk('evelyn', c.tato + 0.1, 'surprised'); lk('evelyn', c.tato + 0.12, [-0.55, 0.45]);
  xk('evelyn', S.t1c.at, 'listening'); lk('evelyn', S.m5.at, [-0.6, 0]);
  pk('evelyn', c.raise, 'raise', 0.3, 'out'); xk('evelyn', c.raise, 'smallSmile');
  pk('evelyn', c.stamp - 0.1, 'slam', 0.1, 'in');
  pk('evelyn', c.insertEnd, 'desk', 0); xk('evelyn', c.insertEnd, 'smallSmile');
  pk('evelyn', S.e8.at - 0.08, 'point', 0.18, 'spring'); xk('evelyn', S.e8.at - 0.08, 'neutral'); lk('evelyn', S.e8.at - 0.08, [0, 0], 'front');
  for (const w of ['mina', 'evelyn']) for (const L of Object.values(K[w])) L.sort((a, b) => a[0] - b[0]);
  const lastIdx = (list, t) => { let i = 0; for (let j = 0; j < list.length; j++) if (list[j][0] <= t) i = j; return i; };
  function armOf(w, t, side) {
    const P = K[w].P, i = lastIdx(P, t), [t1, n1, d1, ease] = P[i], cur = POSE[w][n1][side];
    if (!d1 || !i) return cur;
    const prev = POSE[w][P[i - 1][1]][side], k = E[ease](clamp(inv(t1, t1 + d1, t)));
    return [lerp(prev[0], cur[0], k), lerp(prev[1], cur[1], k), k < 0.5 ? prev[2] : cur[2], k < 0.5 ? prev[3] : cur[3]];
  }
  function lookOf(w, t) {
    const L = K[w].L, i = lastIdx(L, t), [t1, l1, v1] = L[i];
    if (!i) return { look: l1, view: v1 };
    const [, l0] = L[i - 1], k = E.inOut(clamp(inv(t1, t1 + 0.16, t)));
    return { look: [lerp(l0[0], l1[0], k), lerp(l0[1], l1[1], k)], view: v1 };
  }
  const BLINK = { mina: [1.7, 5.6, 9.4, 13.4, 17.0, 20.6, 25.0, 28.3], evelyn: [2.6, 6.6, 10.4, 14.2, 20.1, 23.6, 28.8] };
  function draw(w, t) {
    const X = K[w].X; const expr = X[lastIdx(X, t)][1];
    const exprCurve = (typeof expr === 'string' ? EXPRESSIONS[expr]?.mouth?.curve : expr.mouth?.curve) ?? 0.1;
    const sg = segs.find((s) => s.who === w && t >= s.at - 0.04 && t <= s.end + 0.06);
    const { look, view } = lookOf(w, t);
    const ov = { eyes: { look: look.map((x) => +x.toFixed(3)) } };
    let lvl = 0, nod = 0, gest = 0;
    if (sg) {
      // a boca vai 1–2 quadros à frente do som
      const m = residentMouth(sg.voice, sg.at, t + LEAD, 0.95);
      if (m && m.t !== 'line') ov.mouth = { ...m, curve: Math.max(m.curve ?? 0, exprCurve * 0.6) };
      // o "You… died?" é de boca aberta de susto, nunca de sorriso
      if (ov.mouth && w === 'evelyn' && (sg.key === 'e6a' || sg.key === 'e6b')) ov.mouth = { ...ov.mouth, open: 0.45 + 0.7 * (ov.mouth.open ?? 0.2), curve: -0.2, w: 0.85 };
      for (let k = -4; k <= 4; k++) lvl += envAt(sg.voice, t - sg.at + sg.a + k * 0.05) / 9;
      const u = (t - sg.words[0].t) / 0.45;
      if (u > 0 && u < 1) { const b = Math.sin(Math.PI * u); nod += 2 * b; gest += 4 * b; }
    }
    const g = (a) => (a[2] === 'rest' && !a[3] ? a : [a[0], +(a[1] + gest).toFixed(2), a[2], a[3]]);
    const clean = (a) => a.filter((x) => x !== undefined).map((x) => (typeof x === 'number' ? +x.toFixed(2) : x));
    const ph = w === 'mina' ? 0 : 1.7;
    // o pulinho do "I quit my job!" (gesto grande: o corpo sai do chão)
    const hop = w === 'mina' && t > S.m5.at - 0.05 && t < S.m5.at + 0.45 ? 22 * Math.sin(Math.PI * (t - S.m5.at + 0.05) / 0.5) : 0;
    // o recuo da Evelyn no "died?"
    const recoil = w === 'evelyn' && t > c.drop + 0.1 ? 10 * Math.exp(-(t - c.drop - 0.1) * 5) : 0;
    const pose = {
      armL: clean(g(armOf(w, t, 'armL'))), armR: clean(g(armOf(w, t, 'armR'))),
      body: { rot: +(0.6 * Math.sin(t * 2 * Math.PI * 0.17 + ph) - recoil * 0.4).toFixed(2), dy: +(-0.8 * lvl - 0.4 * Math.sin(t * 2 * Math.PI * 0.23 + ph) - hop).toFixed(2) },
      head: { nod: +nod.toFixed(2) },
    };
    const o = { pose, expr, overlay: ov, blink: BLINK[w].some((b) => t >= b && t < b + 0.12), view, headExtra: +(1.6 * Math.sin(t * 2 * Math.PI * 0.11 + ph)).toFixed(2) };
    const key = JSON.stringify(o);
    if (key !== box[w].dataset.k) { box[w].dataset.k = key; box[w].innerHTML = renderCharacter(DES[w], o).replace('<svg ', '<svg width="100%" height="100%" style="display:block;overflow:visible" '); }
  }

  // ------------------------------------------------------------ o Tato no balcão
  const tatoParts = [S.t1a, S.t1b, S.t1c];
  tato.bake({
    seed: 23, marks: false,
    moods: [[0, 'idle'], [c.tato, 'greeting', { markAlpha: 0 }], [S.t1a.at, 'encouraging', { markAlpha: 0, arm: 70 }], [S.m5.at, 'celebrating', { markAlpha: 0, spark: 0.7 }], [S.m5.end + 0.5, 'proud', { markAlpha: 0 }]],
    gestures: [[c.tato + 0.25, 'wave'], [S.t1c.at, 'point'], [S.m5.at + 0.05, 'cheer']],
    blinks: [c.tato + 0.9, S.t1c.end + 0.3, S.m5.end + 0.8],
    speech: [{ visemes: tatoParts.flatMap((p) => tatoSpeech(p.voice, p.at - LEAD)) }],
  }, duration);
  const tatoU = (t) => (t - c.tato) / 0.5;
  // missão cumprida: depois do "I quit my job!" ele afunda de volta no balcão (o carimbo fica livre)
  c.tatoOut = c.raise - 0.3;
  const tatoY = (t) => {
    if (t < c.tato) return TATO.y + 420;
    if (t >= c.tatoOut) return TATO.y + 420 * E.in(clamp((t - c.tatoOut) / 0.3));
    const u = tatoU(t); return TATO.y + 420 * (u >= 1 ? 0 : Math.exp(-5.2 * u) * Math.cos(9.5 * u));
  };

  // ------------------------------------------------------------ planos
  const shots = [
    ['room', 0, S.m1.at - 0.05, 'MED2', { creep: 0.04 }],
    ['room', S.m1.at - 0.05, c.bub1 - 0.02, 'M_CU', { bump: S.m1.words[4].t, amp: 0.035 }],
    ['room', c.bub1 - 0.02, S.e3.at - 0.06, 'E_BUB', { bump: S.e2.at, amp: 0.04 }],
    ['room', S.e3.at - 0.06, S.m2a.at - 0.05, 'E_MED'],
    ['room', S.m2a.at - 0.05, c.bub2 - 0.02, 'M_CU', { creep: 0.05 }],
    ['room', c.bub2 - 0.02, S.e5.at - 0.06, 'E_BUB', { bump: S.e4.at, amp: 0.04 }],
    ['room', S.e5.at - 0.06, S.m3.at - 0.05, 'MED2', { creep: 0.06 }],
    ['room', S.m3.at - 0.05, c.drop + 0.12, 'M_CU', { bump: S.m3.words[3].t, amp: 0.05 }],
    ['room', c.drop + 0.12, S.e6b.end + 0.12, 'E_XCU', { bump: S.e6b.at, amp: 0.06, shake: S.e6b.at, creep: 0.1 }],
    ['room', S.e6b.end + 0.12, c.tato + 0.6, 'MED2', { bump: c.tato + 0.16, amp: 0.03 }],
    ['room', c.tato + 0.6, S.m5.at - 0.05, 'T_CU', { creep: 0.05 }],
    ['room', S.m5.at - 0.05, c.raise - 0.02, 'M_CU', { bump: S.m5.at, amp: 0.04, shake: S.m5.at }],
    ['room', c.raise - 0.02, c.stamp - 0.02, 'E_CU'],
    ['insert', c.stamp - 0.02, c.insertEnd],
    ['room', c.insertEnd, S.e8.at - 0.06, 'M_CUF', { creep: 0.05 }],
    ['room', S.e8.at - 0.06, duration + 1, 'E_CUF', { bump: S.e8.at, amp: 0.035 }],
  ].map(([kind, t0, t1, frame, o = {}]) => ({ kind, t0, t1, frame, ...o }));
  const shotAt = (t) => shots.find((s) => t >= s.t0 && t < s.t1) || shots[shots.length - 1];
  function camAt(t, sh) {
    const f = FR[sh.frame], u = clamp(inv(sh.t0, sh.t1, t));
    const kb = sh.bump != null && t >= sh.bump ? (sh.amp ?? 0.05) * Math.exp(-(t - sh.bump) * 9) : 0;
    const push = (1 + (sh.creep ?? 0.03) * E.inOut(u)) * (1 + kb);
    // o zoom empurra em direção aos olhos de quem está no plano (o olhar não sai do lugar)
    const ey = sh.frame.startsWith('M_') ? CH.mina.eye : sh.frame.startsWith('E_') ? CH.evelyn.eye : f.cy;
    return { s: f.s * push, cx: f.cx, cy: f.cy + (ey - f.cy) * (1 - 1 / push) };
  }
  const shake = (t, sh) => { if (sh.shake == null || t < sh.shake) return [0, 0]; const k = t - sh.shake, a = 14 * Math.exp(-k * 11); return [a * Math.sin(k * 71), a * Math.cos(k * 59)]; };
  const hand = (t) => ({ x: 4 * Math.sin(t * 2 * Math.PI * 0.13), y: 3 * Math.sin(t * 2 * Math.PI * 0.11 + 2), r: 0.15 * Math.sin(t * 2 * Math.PI * 0.09 + 0.5) });

  // ------------------------------------------------------------ quadro
  const capCache = { i: -2, cur: -2 };
  function render(t) {
    const sh = shotAt(t), inRoom = sh.kind === 'room', inInsert = sh.kind === 'insert';
    fade(roomL, inRoom ? 1 : 0); fade(worldL, inRoom ? 1 : 0);
    if (inRoom) {
      const cm = camAt(t, sh), hd = hand(t), [sx, sy] = shake(t, sh);
      const tw = `translate(${(540 + hd.x + sx).toFixed(2)}px, ${(960 + hd.y + sy).toFixed(2)}px) rotate(${hd.r.toFixed(3)}deg) scale(${cm.s.toFixed(5)}) translate(${(-cm.cx).toFixed(2)}px, ${(-cm.cy).toFixed(2)}px)`;
      if (worldL.style.transform !== tw) worldL.style.transform = tw;
      const rs = 0.8 * cm.s, rcx = AIRPORT.cx + (cm.cx - 565) / 0.8, rcy = AIRPORT.cy + (cm.cy - 1050) / 0.8;
      const tr = `translate(${(540 + 0.6 * (hd.x + sx)).toFixed(2)}px, ${(960 + 0.6 * (hd.y + sy)).toFixed(2)}px) rotate(${hd.r.toFixed(3)}deg) scale(${rs.toFixed(5)}) translate(${(-rcx).toFixed(2)}px, ${(-rcy).toFixed(2)}px)`;
      if (roomL.style.transform !== tr) roomL.style.transform = tr;
      draw('mina', t); draw('evelyn', t);
      // o carimbo sai da mesa quando a Evelyn pega
      fade(deskStamp, t >= c.raise && t < c.insertEnd ? 0 : 1);
      tato.frame(t, { x: TATO.x, y: tatoY(t), h: TATO.h, o: t >= c.tato && t < c.tatoOut + 0.32 ? 1 : 0 });
      const ty = tatoY(t), top = ty - TATO.h * (207 / 220), cut = Math.max(0, top + TATO.h - (COUNTER_TOP + 6));
      tato.n.style.clipPath = `inset(-40px -40px ${cut.toFixed(1)}px -40px)`;
      const u = tatoU(t), sq = t >= c.tato && u < 1.4 ? 0.12 * Math.exp(-3.6 * u) * Math.sin(9.5 * u) : 0;
      tato.n.style.transform = `scale(${(1 - sq).toFixed(4)}, ${(1 + sq).toFixed(4)})`;
      // o fantasma sobe da cabeça da Mina e some quando o Tato aparece
      const gk = t - c.ghost;
      if (gk > 0 && t < c.tato + 0.5) {
        const rise = E.out(clamp(gk / 1.3)), o = Math.min(clamp(gk / 0.25), 1 - clamp(inv(c.tato, c.tato + 0.4, t)));
        css(ghost, { left: CH.mina.x - 100 + 12 * Math.sin(gk * 2 * Math.PI * 0.8), top: CH.mina.eye - 300 - 150 * rise, opacity: (0.9 * o).toFixed(3) });
      } else if (ghost.style.opacity !== '0') ghost.style.opacity = '0';
    }
    // linhas de foco: a vitória da Mina e o choque da oficial
    const fk = Math.max(pulse(t, S.m3.words[3].t - 0.02, c.drop, 0.04, 0.06), pulse(t, c.drop + 0.12, S.e6b.end + 0.12, 0.02, 0.05));
    fade(focus, inRoom ? fk * 0.72 : 0);
    if (fk > 0) css(focus, { transform: `rotate(${(Math.floor(t * 8) % 2 ? 1 : -1).toFixed(1)}deg) scale(1.05)`, transformOrigin: '50% 40%' });
    // insert: o carimbo desce (passa do tamanho, assenta), a página treme
    fade(insert, inInsert ? 1 : 0);
    if (inInsert) {
      const u = t - c.stamp;
      const land = clamp(inv(-0.1, 0.03, u)), sc = 1.55 - 0.55 * E.in(land), sh2 = u > 0.03 ? 10 * Math.exp(-(u - 0.03) * 14) : 0;
      css(stampMark, { transform: `rotate(-9deg) scale(${sc.toFixed(4)})`, opacity: (land > 0.98 ? 0.92 : 0.35 * land).toFixed(3) });
      css(page, { transform: `translate(${(sh2 * Math.sin(u * 80)).toFixed(1)}px, ${(sh2 * Math.cos(u * 64)).toFixed(1)}px) scale(${(1.0 + 0.04 * clamp(inv(0, 1.6, u))).toFixed(4)})` });
      css(note, { transform: `rotate(${(4 + 1.5 * Math.exp(-Math.max(0, u) * 6) * Math.sin(u * 30)).toFixed(2)}deg)` });
    }
    // adesivos
    const s = (n, t0, t1, x, y, rot = 0, sc = 1) => stick(n, t, t0, t1, { x, y, rot, s: sc });
    s(st.hook, -1, S.m1.at + 0.38, 540, 352, -2);
    s(st.p1, S.m1.at + 0.45, c.bub1 - 0.04, 540, 330, -1.5);
    s(st.b1, c.bub1 + 0.02, S.e3.at - 0.1, 280, 480, -3, 1.12);
    s(st.p2, S.m2b.at + 0.2, c.bub2 - 0.04, 540, 330, 1.5);
    s(st.b2, c.bub2 + 0.02, S.e5.at - 0.1, 280, 480, 3, 1.12);
    s(st.p3, S.m3.at + 0.15, c.drop + 0.08, 540, 330, -1.5);
    s(st.fact, S.e6b.end + 0.16, c.tato + 0.55, 640, 345, -2);
    s(st.right, S.t1c.at + 0.05, S.m5.end + 0.1, 540, 330, 2, 0.95);
    s(st.url, S.m6.at - 0.05, duration + 1, 540, 345, -2);
    s(st.fine, S.m6.at + 0.25, duration + 1, 540, 455, 0, 0.85);
    // legenda
    let pi = -1; for (let i = 0; i < PAGES.length; i++) if (t >= PAGES[i].start && t < PAGES[i].end) { pi = i; break; }
    if (pi < 0) { fade(cap, 0); capCache.i = -1; }
    else {
      const pg = PAGES[pi], col = HI[pg.words[0].who] || '#F8C637';
      if (capCache.i !== pi) { capCache.i = pi; capCache.cur = -2; cap.innerHTML = pg.words.map((x, i) => `<span data-i="${i}">${x.w}</span>`).join(' '); }
      let cur = -1; pg.words.forEach((x, i) => { if (t >= x.t - 0.03) cur = i; });
      if (capCache.cur !== cur) { capCache.cur = cur; cap.querySelectorAll('span').forEach((n, i) => { n.style.color = i === cur ? col : '#FFFDF7'; }); }
      const k = E.out(clamp(inv(pg.start, pg.start + 0.1, t)));
      fade(cap, 1); css(cap, { transform: `translate(-50%, -50%) scale(${(0.88 + 0.12 * k).toFixed(4)})` });
    }
  }
  // desfoque de movimento só onde há movimento, e nunca num quadro cuja janela cruze um corte
  const CUTS = shots.map((x) => x.t0).filter((x) => x > 0);
  const samples = (t) => {
    if (CUTS.some((x) => Math.abs(t - x) < 0.02)) return 1;
    const near = (a, w0) => a != null && t > a && t < a + w0;
    if (near(c.tato, 0.6) || near(c.drop + 0.12, 0.3) || near(S.m5.at - 0.05, 0.5) || near(S.m3.at - 0.06, 0.3) || near(c.stamp - 0.02, 0.25) || near(S.m4a.at - 0.06, 0.25)) return [8, 0.5];
    return 1;
  };
  return { duration, cues: c, captions, audio: A.items, samples, render, hook: { title: 'brasileira na imigração traduzindo TUDO ao pé da letra' }, safe: [120, 270, 960, 1248], async ready() { return true; } };
}

// ------------------------------------------------------------------ peças auxiliares
/** O balcão da cabine (700 × 900, tampo em y 130): monitor de costas, tampo claro, painel com a
 *  faixa vermelha da Evelyn e o pictograma do passaporte. */
function counterSVG() {
  return `<svg width="700" height="900" viewBox="0 0 700 900" style="display:block">
<rect x="478" y="0" width="176" height="122" rx="12" fill="#26232B"/><rect x="486" y="8" width="160" height="106" rx="8" fill="#332F3A"/><rect x="552" y="118" width="30" height="16" fill="#3A3646"/>
<rect x="0" y="130" width="700" height="34" rx="10" fill="#EDEBD6"/><rect x="8" y="133" width="684" height="6" rx="3" fill="#FFFFFF" opacity=".6"/><rect x="0" y="160" width="700" height="18" fill="#CFC9B0"/>
<rect x="16" y="178" width="668" height="722" fill="#658D96"/><rect x="16" y="178" width="668" height="18" fill="#D9343F"/>
<rect x="52" y="230" width="596" height="640" rx="20" fill="#5A8590"/><rect x="52" y="230" width="596" height="640" rx="20" fill="none" stroke="#7FA7B0" stroke-width="4" opacity=".6"/>
<rect x="318" y="420" width="64" height="86" rx="10" fill="#FFF5CF"/><circle cx="350" cy="452" r="14" fill="none" stroke="#658D96" stroke-width="6"/><rect x="332" y="478" width="36" height="7" rx="3" fill="#658D96"/>
</svg>`;
}
/** A página de vistos do passaporte (940 × 1180): papel creme com guilhoché. */
function passportPage() {
  let p = '';
  for (let i = 0; i < 26; i++) { const y = 90 + i * 42; p += `<path d="M0 ${y} C160 ${y - 26} 320 ${y + 26} 470 ${y} S780 ${y - 26} 940 ${y}" stroke="#E4D7B8" stroke-width="3" fill="none"/>`; }
  return `<svg width="940" height="1180" viewBox="0 0 940 1180" style="position:absolute;left:0;top:0">${p}<rect x="0" y="0" width="940" height="1180" fill="none" stroke="#D9C9A3" stroke-width="10"/></svg>`;
}
/** A imigração rasterizada uma vez, com os textos na fonte da marca e um desfoque de profundidade. */
async function airportBitmap() {
  const url = URL.createObjectURL(new Blob([airportSVG()], { type: 'image/svg+xml' }));
  const img = new Image(); img.src = url; await img.decode();
  const c = document.createElement('canvas'); c.width = AIRPORT.w; c.height = AIRPORT.h;
  const g = c.getContext('2d'); g.drawImage(img, 0, 0); URL.revokeObjectURL(url);
  await Promise.all(AIRPORT.texts.map((x) => document.fonts.load(x.font)));
  for (const x of AIRPORT.texts) {
    g.save(); g.font = x.font; g.fillStyle = x.color; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    if (x.spacing) g.letterSpacing = `${x.spacing}px`;
    g.fillText(x.text, x.x, x.y); g.restore();
  }
  const c2 = document.createElement('canvas'); c2.width = AIRPORT.w; c2.height = AIRPORT.h;
  const g2 = c2.getContext('2d'); g2.filter = 'blur(2.3px)'; g2.drawImage(c, 0, 0);
  const out = c2.toDataURL('image/png');
  c.width = c.height = c2.width = c2.height = 1;
  return out;
}
