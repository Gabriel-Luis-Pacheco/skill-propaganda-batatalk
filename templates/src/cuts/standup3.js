// STAND-UP DOS FALSOS AMIGOS v3 9:16 (Reels, ~46 s). Refeito a partir do feedback do dono (28/10):
// "piadas péssimas e sem sentido", "risadas fora de contexto", "pouco humano", "risada robotizada".
// O que mudou (pesquisa: Afonso Padilha "Bilíngue não praticante", Rafi Bastos, método de Greg Dean):
// - o erro é sempre DO Jax, contado como lembrança, uma situação por piada: a porta "PUSH" (puxou com
//   força, com fé, e uma criança de seis anos empurrou com um dedo) e a entrevista ("I pretend to work
//   here for many years" → pretend é fingir → fui contratado… pra gerente); o fecho é a batata que
//   ajuda e "fala inglês melhor que eu";
// - a voz é um bloco corrido por piada (gpt-audio-1.5, voz cedar, tools/voice-audio.mjs), cortada só
//   nas pausas mortas; as pausas de comediante antes do punch ficam;
// - risada de plateia de verdade (Mixkit, licença de efeitos gratuita), só depois de punch real.
import { E, clamp, lerp, inv, pulse, el, css, fade, TatoActor, AudioList } from './kit.js';
import { residentMouth, envAt } from '../core/visemes.js';
import { renderCharacter, EXPRESSIONS } from '/character-rig.js';
import { STAGE, stageSVG, crowdBackSVG, crowdHeads, wedgeSVG, standSVG, stoolSVG, frontTableSVG } from './standup-room.js';
import { align, segVoice, stick, buildPages, focusLines } from './creator.js';
import { JAX, WEDGE, TATO, FR, MIC, ARM as ARM0, DES, DEADPAN, TIRED, LEAD, bitmap } from './standup.js';

const PAD_A = 0.03, PAD_B = 0.07;
// [arquivo, a, b, legenda] — a e b em segundos do take (trechos com voz medidos em voices.json)
const SEG = {
  a1: ['sv3a', 0.02, 2.42, 'Eu estudei inglês sete anos na escola.'],
  a2: ['sv3a', 2.79, 3.47, 'Sete anos.'],
  a3: ['sv3a', 4.25, 6.5, 'Primeiro dia de intercâmbio, na porta da escola:'],
  a4: ['sv3a', 6.93, 7.24, 'PUSH.'],
  a5: ['sv3a', 7.75, 9.06, 'Meu cérebro leu: puxe.'],
  a6: ['sv3a', 9.57, 9.92, 'Puxei.'],
  a7: ['sv3a', 10.28, 11.44, 'Puxei com força.'],
  a8: ['sv3a', 11.87, 12.76, 'Puxei com fé.'],
  a9: ['sv3a', 13.35, 15.04, 'Aí veio uma criança de seis anos…'],
  a10: ['sv3a', 15.39, 15.92, 'e empurrou.'],
  a11: ['sv3a', 16.25, 16.76, 'Com um dedo.'],
  b1: ['sv3b', 0.2, 2.29, 'Na entrevista de emprego, eu arrasei:'],
  b2: ['sv3b', 2.64, 5.34, '“I pretend to work here for many years.”'],
  b3: ['sv3b', 6.05, 7.18, 'Pretend é fingir.'],
  b4: ['sv3b', 8.07, 11.98, 'Eu prometi, olhando no olho do cara, que ia fingir que trabalho.'],
  b5: ['sv3b', 13.12, 13.98, 'Fui contratado.'],
  b6: ['sv3b', 14.44, 15.06, 'Pra gerente.'],
  c1: ['sv3c', 0.01, 1.97, 'Hoje eu treino antes, num site.'],
  c2: ['sv3c', 2.69, 6.12, 'Quando eu travo, aparece uma batata pra me ajudar.'],
  c3: ['sv3c', 6.65, 8.0, 'Uma batata, gente.'],
  c4: ['sv3c', 8.76, 10.45, 'E o danado fala inglês melhor que eu.'],
};
// as palavras que parecem português ficam amarelas na legenda
const FALSE_FRIEND = /^[“"]?(push|puxe|pretend)/i;
// gestos da mão livre: a porta puxada (estende e traz), o dedo, a mão no peito da promessa
const ARM = { ...ARM0, grab: [44, 64, 'fist'], pull: [20, -58, 'fist'], finger: [30, 150, 'point'], kid: [26, 30, 'rest'] };
const FAITH = { eyes: { open: 0.08 }, brows: { y: 0.7, rot: -6 }, mouth: { curve: 0.05, w: 0.6 } };
const BRAG = { eyes: { open: 0.85, look: [0, -0.1] }, brows: { y: 0.4 }, mouth: { curve: 0.45, w: 0.8 } };
const SINCERE = { eyes: { open: 1.05, look: [0, 0] }, brows: { y: 0.55, rot: -8 }, mouth: { curve: 0.15, w: 0.7 } };
// risadas de plateia de verdade (Mixkit, Sound Effects Free License): arquivo, início, duração
const LAUGH = {
  small: 'audio/crowd-real/mixkit-424.wav', big: 'audio/crowd-real/mixkit-460.wav', long: 'audio/crowd-real/mixkit-423.wav',
  applause: 'audio/crowd-real/mixkit-422.wav', endClap: 'audio/crowd-real/mixkit-512.wav',
};

export async function create(ctx) {
  const { W, H, overlay, voices: V } = ctx;
  const A = new AudioList();

  // ------------------------------------------------------------ montagem da fala
  const S = {}, c = {};
  let T = 0.05;
  const put = (key, gap) => {
    T += gap;
    const [id, a0, b0, text] = SEG[key], f = V.lines[id];
    const a = Math.max(0, a0 - PAD_A), b = b0 + PAD_B;
    const words = align(text, f.spans, a0, b0);
    A.clip(id, T, a, b, V, { file: f.file });
    const off = T - a;
    S[key] = { key, id, who: 'jax', at: T, end: T + b - a, a, b, voice: segVoice(f, a, b, words), words: words.map((x) => ({ w: x.w, t: x.t + off, e: x.e + off, who: 'jax', ff: FALSE_FRIEND.test(x.w) })), text };
    T = S[key].end;
  };
  // 1. a porta: sete anos de inglês, PUSH, puxei com fé, a criança empurrou com um dedo
  put('a1', 0); put('a2', 0.3); put('a3', 0.4); put('a4', 0.35); put('a5', 0.3);
  put('a6', 0.3); put('a7', 0.3); put('a8', 0.32);
  c.chuckle = S.a8.end + 0.02;
  put('a9', 0.6); put('a10', 0.35); put('a11', 0.3);
  c.laugh1 = S.a11.end + 0.02;
  // 2. a entrevista: "I pretend to work here" → fingir → contratado… pra gerente
  put('b1', 1.35); put('b2', 0.3); put('b3', 0.45); put('b4', 0.45);
  c.laugh2 = S.b4.end + 0.02;
  put('b5', 1.05); put('b6', 0.45);
  c.laugh3 = S.b6.end + 0.02;
  // 3. o produto: a batata que ajuda (e fala inglês melhor que ele)
  put('c1', 1.6); put('c2', 0.4);
  c.tato = S.c2.words[5].t - 0.12;
  put('c3', 0.55); put('c4', 0.5);
  c.laugh4 = S.c4.end + 0.02;
  c.endCard = S.c4.end + 0.25;
  const duration = +(S.c4.end + 1.95).toFixed(3);
  c.duration = duration;
  for (const [k, v] of Object.entries(S)) c[k] = +v.at.toFixed(3);
  const segs = Object.values(S);
  const pulls = [S.a6.words[0].t, S.a7.words[0].t, S.a8.words[0].t];

  // ------------------------------------------------------------ som: sala, risada de verdade só no punch
  A.cue('ambience', 0, { until: duration, place: 'club' });
  A.sfx('sample', c.chuckle, { file: LAUGH.small, from: 0.15, len: 1.15, fadeOut: 0.5, gain: 0.42 });
  A.sfx('sample', c.laugh1, { file: LAUGH.big, from: 0.2, len: 2.6, fadeOut: 0.9, gain: 0.85 });
  A.sfx('sample', c.laugh2, { file: LAUGH.small, from: 0.55, len: 1.6, fadeOut: 0.6, gain: 0.62 });
  A.sfx('sample', c.laugh3, { file: LAUGH.applause, from: 0.7, len: 3.0, fadeOut: 1.0, gain: 0.9 });
  A.sfx('sample', S.c3.end + 0.02, { file: LAUGH.small, from: 2.1, len: 0.9, fadeOut: 0.45, gain: 0.32 });
  A.sfx('sample', c.laugh4, { file: LAUGH.long, from: 0.15, len: 2.0, fadeOut: 0.9, gain: 0.78 });
  A.sfx('sample', c.laugh4 + 0.55, { file: LAUGH.endClap, from: 1.0, len: 1.6, fadeOut: 0.8, gain: 0.3 });
  A.sfx('pop', S.a4.at - 0.22, { gain: 0.3 });
  for (const p of pulls) A.sfx('tap', p + 0.06, { gain: 0.32 });
  A.sfx('whoosh', S.a10.words[1].t - 0.05, { gain: 0.32 });
  A.sfx('pop', S.b3.at + 0.05, { gain: 0.25 });
  A.sfx('stamp', S.b5.words[1].t, { gain: 0.5 });
  A.sfx('stamp', S.b6.words[1].t, { gain: 0.62 });
  A.sfx('boing', c.tato + 0.04, { gain: 0.55 });
  A.sfx('motif-end', c.endCard + 0.2, { gain: 0.4 });
  const captions = segs.map((s) => ({ start: s.at, end: s.end, who: 'Jax', text: s.text, lang: 'pt' })).sort((x, y) => x.start - y.start);

  // ------------------------------------------------------------ cena 1: o palco (o mesmo do corte anterior)
  const scene = el(overlay, 'div', 'layer', '', { width: `${W}px`, height: `${H}px`, overflow: 'hidden', background: '#2A2230' });
  const roomL = el(scene, 'div', 'layer', '', { width: `${STAGE.w}px`, height: `${STAGE.h}px` });
  el(roomL, 'img', '', '', { position: 'absolute', left: '0px', top: '0px', width: `${STAGE.w}px`, height: `${STAGE.h}px` }).src = await bitmap(stageSVG(), STAGE.w, STAGE.h, STAGE.texts, 2.3);
  const worldL = el(scene, 'div', 'layer', '', {});
  el(worldL, 'div', '', standSVG(), { position: 'absolute', left: `${JAX.x - 200}px`, top: `${JAX.feet - 742 * 0.95 + 4}px`, width: '160px', height: '760px', transform: 'scale(.95)', transformOrigin: '0 0' });
  el(worldL, 'div', '', stoolSVG(), { position: 'absolute', left: `${JAX.x - 420}px`, top: `${JAX.feet - 510 * 0.98 + 6}px`, width: '220px', height: '520px', transform: 'scale(.98)', transformOrigin: '0 0' });
  const box = {};
  const mkBox = (w, parent, C) => { const D = DES[w], vb = Math.max(250, D.height * 0.92), h = D.height + 38; box[w] = el(parent, 'div', '', '', { position: 'absolute', left: `${C.x - (vb / 2) * C.k}px`, top: `${C.feet - (D.height + 24) * C.k}px`, width: `${vb * C.k}px`, height: `${h * C.k}px` }); };
  mkBox('jax', worldL, JAX);
  const tato = new TatoActor(worldL, { id: 'sup3' });
  el(worldL, 'div', '', wedgeSVG(), { position: 'absolute', left: `${WEDGE.x}px`, top: `${WEDGE.y}px`, width: '300px', height: '170px' });
  const heads = crowdHeads().map((h) => ({ ...h, n: el(worldL, 'div', '', h.svg, { position: 'absolute', left: `${(h.x - 150 * h.s).toFixed(0)}px`, top: `${(h.y - 150 * h.s).toFixed(0)}px`, transformOrigin: '50% 90%' }) }));
  el(scene, 'div', 'layer', '', { width: `${W}px`, height: `${H}px`, background: 'radial-gradient(ellipse 70% 52% at 50% 42%, rgba(0,0,0,0) 55%, rgba(24,14,22,.42) 100%)' });
  const focus = el(scene, 'div', 'layer', focusLines(), { width: `${W}px`, height: `${H}px` });

  // ------------------------------------------------------------ cena 2: a primeira fila (contraplano)
  const front = el(overlay, 'div', 'layer', '', { width: `${W}px`, height: `${H}px`, overflow: 'hidden' });
  el(front, 'img', '', '', { position: 'absolute', left: '0px', top: '0px', width: `${W}px`, height: `${H}px` }).src = await bitmap(crowdBackSVG(), W, H, [], 2.6);
  const frontW = el(front, 'div', 'layer', '', { width: `${W}px`, height: `${H}px`, transformOrigin: '50% 45%' });
  const ROW = { mina: { x: 215, k: 3.0, feet: 830 + 186 * 3.0 }, june: { x: 545, k: 2.9, feet: 790 + 235 * 2.9 }, malik: { x: 870, k: 3.0, feet: 810 + 210 * 3.0 } };
  for (const w of ['mina', 'june', 'malik']) mkBox(w, frontW, ROW[w]);
  el(frontW, 'div', '', frontTableSVG(), { position: 'absolute', left: '-80px', top: '1100px', width: '1240px', height: '760px' });
  el(front, 'div', 'layer', '', { width: `${W}px`, height: `${H}px`, background: 'linear-gradient(180deg, rgba(255,217,160,.14), rgba(0,0,0,0) 40%), radial-gradient(ellipse 80% 60% at 50% 45%, rgba(0,0,0,0) 60%, rgba(14,10,20,.45) 100%)' });

  // ------------------------------------------------------------ textos e adesivos
  const sticker = (html, style = {}) => { const n = el(overlay, 'div', '', html, { position: 'absolute', left: '0px', top: '0px', whiteSpace: 'nowrap', transformOrigin: '50% 50%', ...style }); fade(n, 0); return n; };
  const BOX = { padding: '16px 28px 18px', borderRadius: '22px', background: '#FFFDF7', color: '#1C3A2B', font: '600 54px/1.1 var(--display)', boxShadow: '0 14px 30px -16px rgba(0,0,0,.55)', textAlign: 'center' };
  const PILL = (word, html) => `<div style="font:700 28px/1 var(--ui);letter-spacing:.1em;text-transform:uppercase;color:#F8C637;margin-bottom:10px">falso amigo</div><div style="font:600 50px/1.08 var(--display)"><span style="color:#F8C637">${word}</span> = ${html}</div>`;
  const PSTYLE = { padding: '16px 30px 20px', borderRadius: '22px', background: 'rgba(28,58,43,.94)', color: '#FFFDF7', textAlign: 'center', boxShadow: '0 14px 30px -16px rgba(0,0,0,.6)', border: '4px solid rgba(255,253,247,.9)' };
  const STAMP = (txt) => `<div style="font:700 92px/1 var(--display);letter-spacing:.04em">${txt}</div>`;
  const SSTYLE = { padding: '22px 40px 26px', border: '10px double #D9343F', borderRadius: '26px', color: '#D9343F', background: 'rgba(255,253,247,.94)', textAlign: 'center', boxShadow: '0 18px 36px -18px rgba(0,0,0,.6)' };
  const st = {
    hook: sticker('<div style="font:700 30px/1 var(--ui);letter-spacing:.14em;color:#2E6BFF;margin-bottom:12px">🎤 STAND-UP</div>7 anos de inglês na escola<br>e eu perdi pra uma porta 💀', { ...BOX, font: '600 54px/1.14 var(--display)' }),
    p1: sticker(PILL('PUSH', 'empurre 🚪'), PSTYLE),
    p2: sticker(PILL('pretend', 'FINGIR 💀'), PSTYLE),
    hired: sticker(STAMP('CONTRATADO ✅'), SSTYLE),
    boss: sticker(STAMP('GERENTE 👔'), SSTYLE),
    ask: sticker('qual palavra em inglês<br>já te enganou? 👇', { ...BOX, font: '600 46px/1.12 var(--display)' }),
    url: sticker('<div style="font:700 64px/1 var(--display)">batatalk.com.br</div><div style="font:600 34px/1.1 var(--ui);margin-top:12px;color:#1C3A2B">treine a conversa antes 🥔</div>', { padding: '18px 40px 20px', borderRadius: '30px', background: '#F8C637', color: '#14241C', textAlign: 'center', border: '5px solid #FFFDF7', boxShadow: '0 18px 36px -16px rgba(0,0,0,.6)' }),
    fine: sticker('Vozes geradas por IA · exemplos animados', { font: '600 32px/1 var(--ui)', color: '#FFFDF7', padding: '10px 20px', borderRadius: '14px', background: 'rgba(20,36,28,.78)' }),
  };
  // a porta de vidro com a plaqueta "PUSH": treme a cada "Puxei" e abre no "e empurrou"
  const door = sticker(`<div style="position:relative;width:250px;height:350px">
<div style="position:absolute;inset:0;border-radius:14px;background:#3E4652"></div>
<div style="position:absolute;left:16px;top:16px;right:16px;bottom:16px;border-radius:8px;background:linear-gradient(160deg,#CFEAF4,#9CC9DA)"></div>
<div style="position:absolute;left:40px;top:40px;width:22px;height:200px;border-radius:8px;background:#FFFFFF;opacity:.45;transform:rotate(12deg)"></div>
<div style="position:absolute;left:150px;top:150px;width:18px;height:120px;border-radius:9px;background:#9AA3AE;box-shadow:inset -4px 0 0 #6E7681"></div>
<div style="position:absolute;left:44px;top:96px;width:162px;padding:8px 0 10px;border-radius:10px;background:#F3F4F6;border:4px solid #6E7681;text-align:center;font:700 54px/1 var(--display);color:#1F2937;letter-spacing:.06em">PUSH</div></div>`, { width: '250px', height: '350px' });
  // legenda palavra a palavra; a palavra da vez em azul-claro, o falso amigo sempre amarelo
  const cap = el(overlay, 'div', '', '', { position: 'absolute', left: '540px', top: '1165px', transform: 'translate(-50%, -50%)', textAlign: 'center', whiteSpace: 'nowrap', font: '700 76px/1.05 var(--display)', color: '#FFFDF7', letterSpacing: '-.005em', WebkitTextStroke: '14px #14241C', paintOrder: 'stroke fill', textShadow: '0 8px 0 rgba(20,36,28,.28)' });
  const PAGES = buildPages(segs.map((s) => s.words));

  // ------------------------------------------------------------ direção do Jax
  const K = { P: [], X: [], L: [] };
  const pk = (t, p, dur = 0.24, ease = 'inOut') => K.P.push([t, p, dur, ease]);
  const xk = (t, e) => K.X.push([t, e]);
  const lk = (t, l, turn = 0) => K.L.push([t, l, turn]);
  pk(0, 'explain', 0); xk(0, BRAG); lk(0, [0, 0]);
  pk(S.a2.at - 0.08, 'palm', 0.22, 'spring'); xk(S.a2.at - 0.08, 'proud');
  pk(S.a3.at - 0.05, 'explain', 0.26); xk(S.a3.at - 0.05, 'speaking');
  pk(S.a4.at - 0.12, 'present', 0.2, 'spring'); xk(S.a4.at - 0.1, 'surprised'); lk(S.a4.at - 0.12, [0.45, -0.45], 0.12);
  pk(S.a5.at - 0.05, 'chin', 0.24); xk(S.a5.at - 0.05, 'smallSmile'); lk(S.a5.at - 0.05, [0, 0]);
  // puxa a porta três vezes, cada vez mais forte (estende o braço e traz para o peito)
  for (const [i, p] of pulls.entries()) { pk(p - 0.16, 'grab', 0.12); pk(p - 0.02, 'pull', 0.14 + 0.03 * i, 'spring'); }
  xk(pulls[1] - 0.05, 'frustrated'); xk(pulls[2] - 0.05, FAITH);
  pk(S.a9.at - 0.06, 'kid', 0.26); xk(S.a9.at - 0.06, 'speaking'); lk(S.a9.at - 0.06, [0.2, 0.35]);
  pk(S.a10.at - 0.06, 'present', 0.2); lk(S.a10.at - 0.06, [0, 0]);
  pk(S.a11.at - 0.1, 'finger', 0.2, 'spring'); xk(S.a11.at - 0.08, DEADPAN);
  pk(c.laugh1 + 0.3, 'rest', 0.4); xk(c.laugh1 + 0.25, 'laugh');
  pk(S.b1.at - 0.06, 'palm', 0.26); xk(S.b1.at - 0.06, BRAG);
  pk(S.b2.at - 0.06, 'explain', 0.24); xk(S.b2.at - 0.06, 'proud');
  pk(S.b3.at - 0.06, 'rest', 0.3); xk(S.b3.at - 0.06, DEADPAN);
  pk(S.b4.at - 0.06, 'heart', 0.24); xk(S.b4.at - 0.06, SINCERE);
  xk(S.b4.words[S.b4.words.length - 4].t, 'smallSmile');
  pk(S.b5.at - 0.06, 'shrug', 0.26); xk(S.b5.at - 0.06, 'smallSmile');
  pk(S.b6.at - 0.06, 'rest', 0.3); xk(S.b6.at - 0.06, TIRED);
  pk(S.c1.at - 0.06, 'explain', 0.26); xk(S.c1.at - 0.06, 'speaking');
  // a batata aparece: ele olha para a caixa de retorno
  pk(c.tato - 0.05, 'down', 0.3); xk(c.tato + 0.05, 'surprised'); lk(c.tato + 0.05, [0.55, 0.5], 0.12);
  xk(c.tato + 0.6, 'smallSmile');
  pk(S.c3.at - 0.06, 'down', 0.2); xk(S.c3.at - 0.06, DEADPAN); lk(S.c3.at - 0.06, [0, 0]);
  pk(S.c4.at - 0.06, 'shrug', 0.28); xk(S.c4.at - 0.06, TIRED);
  xk(c.laugh4 + 0.2, 'laugh'); pk(c.laugh4 + 0.3, 'rest', 0.4);
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
  const BLINK = [2.6, 6.1, 9.9, 14.2, 18.4, 22.0, 26.3, 30.1, 33.8, 37.6, 41.3, 44.6];
  const exprCurveOf = (expr) => (typeof expr === 'string' ? EXPRESSIONS[expr]?.mouth?.curve : expr.mouth?.curve) ?? 0.1;
  function paint(w, o) {
    const key = JSON.stringify(o);
    if (key !== box[w].dataset.k) { box[w].dataset.k = key; box[w].innerHTML = renderCharacter(DES[w], o).replace('<svg ', '<svg width="100%" height="100%" style="display:block;overflow:visible" '); }
  }
  function drawJax(t) {
    const expr = K.X[lastIdx(K.X, t)][1];
    const sg = segs.find((s) => t >= s.at - 0.04 && t <= s.end + 0.06);
    const { look, turn } = lookOf(t);
    const ov = { eyes: { look: look.map((x) => +x.toFixed(3)) } };
    let lvl = 0, nod = 0, gest = 0;
    if (sg) {
      const m = residentMouth(sg.voice, sg.at, t + LEAD, 0.95), ec = exprCurveOf(expr);
      if (m && m.t !== 'line') ov.mouth = { ...m, curve: ec < 0 ? ec : Math.max(m.curve ?? 0, ec * 0.6) };
      for (let k = -4; k <= 4; k++) lvl += envAt(sg.voice, t - sg.at + sg.a + k * 0.05) / 9;
      const u = (t - sg.words[0].t) / 0.45;
      if (u > 0 && u < 1) { const b = Math.sin(Math.PI * u); nod += 2 * b; gest += 4 * b; }
    }
    const a = armR(t), g = a[2] === 'rest' ? a : [a[0], +(a[1] + gest).toFixed(2), a[2]];
    const clean = (x) => x.filter((v) => v !== undefined).map((v) => (typeof v === 'number' ? +v.toFixed(2) : v));
    // o corpo inclina para trás a cada puxão (mais forte no "com fé"); ri junto com a plateia, devagar
    let lean = 0;
    for (const [i, p] of pulls.entries()) if (t > p - 0.05 && t < p + 0.5) lean = Math.max(lean, (3 + 2.5 * i) * Math.sin(Math.PI * (t - p + 0.05) / 0.55));
    const lb = (t0) => (t > t0 + 0.3 && t < t0 + 1.6 ? 2 * Math.sin((t - t0 - 0.3) * 2 * Math.PI * 1.5) * Math.sin(Math.PI * (t - t0 - 0.3) / 1.3) : 0);
    const pose = {
      armL: clean(MIC), armR: clean(g),
      body: { rot: +(0.7 * Math.sin(t * 2 * Math.PI * 0.16) + 2 * turn - lean).toFixed(2), dy: +(-0.8 * lvl - 0.4 * Math.sin(t * 2 * Math.PI * 0.21) - lb(c.laugh1) - lb(c.laugh4)).toFixed(2) },
      head: { nod: +nod.toFixed(2), turn: +turn.toFixed(3) },
    };
    paint('jax', { pose, expr, overlay: ov, blink: BLINK.some((b) => t >= b && t < b + 0.12) || (expr === FAITH), view: 'front', headExtra: +(1.4 * Math.sin(t * 2 * Math.PI * 0.11) + 22 * turn).toFixed(2) });
  }
  // a primeira fila na risada grande: todos rindo, o Malik (o cético) inclusive
  const ROWPOSE = { mina: { armL: [16, -120, 'open'], armR: [14, -60, 'rest'] }, june: { armL: [12, -40, 'rest'], armR: [18, -118, 'fist'] }, malik: { armL: [20, -70, 'open'], armR: [26, -96, 'open'] } };
  function drawRow(t, t0) {
    const u = t - t0;
    for (const [w, ph] of [['mina', 0], ['june', 1.1], ['malik', 2.3]]) {
      const shake = 2.6 * Math.sin(u * 2 * Math.PI * 1.7 + ph);
      paint(w, { pose: { ...ROWPOSE[w], body: { rot: +(1.2 * Math.sin(u * 1.3 + ph)).toFixed(2), dy: +(-Math.abs(shake)).toFixed(2) }, head: { nod: +(2 + shake * 0.6).toFixed(2) } }, expr: 'laugh', overlay: { eyes: { look: [w === 'mina' ? 0.2 : w === 'malik' ? -0.25 : 0, -0.35] } }, blink: Math.abs(((u + ph) % 2.6) - 1.3) < 0.06, view: 'front', headExtra: w === 'june' ? -3 : w === 'mina' ? 3 : 0 });
    }
  }

  // ------------------------------------------------------------ o Tato sobe da caixa de retorno (e fica)
  tato.bake({
    seed: 31, marks: false,
    moods: [[0, 'idle'], [c.tato, 'greeting', { markAlpha: 0 }], [S.c3.at, 'cheeky', { markAlpha: 0 }], [S.c4.at + 0.4, 'proud', { markAlpha: 0 }]],
    gestures: [[c.tato + 0.25, 'wave'], [S.c4.at + 0.7, 'wave'], [c.endCard + 0.4, 'cheer']],
    blinks: [c.tato + 0.9, S.c4.at + 0.3, c.endCard + 1.0],
    speech: [],
  }, duration);
  const tatoY = (t) => { if (t < c.tato) return TATO.y + 360; const u = (t - c.tato) / 0.5; return TATO.y + 360 * (u >= 1 ? 0 : Math.exp(-5.2 * u) * Math.cos(9.5 * u)); };

  // ------------------------------------------------------------ planos
  const shots = [
    ['stage', 0, S.a4.at - 0.04, 'MEDW', { creep: 0.06 }],
    ['stage', S.a4.at - 0.04, S.a6.at - 0.04, 'CU', { bump: S.a4.at + 0.05, amp: 0.04 }],
    ['stage', S.a6.at - 0.04, S.a9.at - 0.04, 'MED', { bumps: pulls }],
    ['stage', S.a9.at - 0.04, S.a11.at - 0.04, 'CU', { creep: 0.04 }],
    ['stage', S.a11.at - 0.04, c.laugh1 + 0.15, 'XCU', { bump: S.a11.at + 0.05, amp: 0.05 }],
    ['stage', c.laugh1 + 0.15, S.b1.at - 0.04, 'WIDE', { creep: 0.02 }],
    ['stage', S.b1.at - 0.04, S.b3.at - 0.04, 'MED', { creep: 0.05 }],
    ['stage', S.b3.at - 0.04, S.b4.at - 0.04, 'CU', { bump: S.b3.at + 0.05, amp: 0.035 }],
    ['stage', S.b4.at - 0.04, S.b5.at - 0.04, 'MED', { creep: 0.06 }],
    ['stage', S.b5.at - 0.04, S.b6.at - 0.04, 'CU', { bump: S.b5.words[1].t, amp: 0.04 }],
    ['stage', S.b6.at - 0.04, c.laugh3 + 0.35, 'XCU', { bump: S.b6.words[1].t, amp: 0.06, shake: S.b6.words[1].t }],
    ['front', c.laugh3 + 0.35, S.c1.at - 0.04],
    ['stage', S.c1.at - 0.04, S.c3.at - 0.04, 'MEDT', { creep: 0.05, bump: c.tato + 0.1, amp: 0.03 }],
    ['stage', S.c3.at - 0.04, S.c4.at - 0.04, 'CU', { creep: 0.04 }],
    ['stage', S.c4.at - 0.04, c.endCard, 'MEDT', { creep: 0.05 }],
    ['stage', c.endCard, duration + 1, 'WIDE', { creep: 0.03 }],
  ].map(([kind, t0, t1, frame, o = {}]) => ({ kind, t0, t1, frame, ...o }));
  const shotAt = (t) => shots.find((s) => t >= s.t0 && t < s.t1) || shots[shots.length - 1];
  function camAt(t, sh) {
    const f = FR[sh.frame], u = clamp(inv(sh.t0, sh.t1, t));
    let kb = sh.bump != null && t >= sh.bump ? (sh.amp ?? 0.05) * Math.exp(-(t - sh.bump) * 9) : 0;
    for (const b of sh.bumps || []) if (t >= b) kb = Math.max(kb, 0.03 * Math.exp(-(t - b) * 9));
    const push = (1 + (sh.creep ?? 0.03) * E.inOut(u)) * (1 + kb);
    const ey = ['WIDE', 'MEDT'].includes(sh.frame) ? f.cy : JAX.eye;
    return { s: f.s * push, cx: f.cx, cy: f.cy + (ey - f.cy) * (1 - 1 / push) };
  }
  const shake = (t, sh) => { if (sh.shake == null || t < sh.shake) return [0, 0]; const k = t - sh.shake, a = 12 * Math.exp(-k * 11); return [a * Math.sin(k * 71), a * Math.cos(k * 59)]; };
  const hand = (t) => ({ x: 4 * Math.sin(t * 2 * Math.PI * 0.13), y: 3 * Math.sin(t * 2 * Math.PI * 0.11 + 2), r: 0.15 * Math.sin(t * 2 * Math.PI * 0.09 + 0.5) });
  // a plateia de costas balança devagar nas risadas (só aparece no plano aberto)
  const LAUGHS = [[c.chuckle, 1.1, 0.25], [c.laugh1, 2.6, 0.9], [c.laugh2, 1.6, 0.6], [c.laugh3, 3.0, 1], [c.laugh4, 2.0, 0.85]];
  const laughAt = (t) => LAUGHS.reduce((m, [t0, len, sz]) => (t > t0 && t < t0 + len ? Math.max(m, sz * Math.min(1, (t - t0) / 0.15, (t0 + len - t) / 0.6)) : m), 0);

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
      tato.frame(t, { x: TATO.x, y: tatoY(t), h: TATO.h, o: t >= c.tato ? 1 : 0, flip: true });
      const top = tatoY(t) - TATO.h * (207 / 220), cut = Math.max(0, top + TATO.h - (WEDGE.y + 22));
      tato.n.style.clipPath = `inset(-40px -40px ${cut.toFixed(1)}px -40px)`;
      const tu = (t - c.tato) / 0.5, sq = t >= c.tato && tu < 1.4 ? 0.12 * Math.exp(-3.6 * tu) * Math.sin(9.5 * tu) : 0;
      tato.n.style.transform = `scaleX(-1) scale(${(1 - sq).toFixed(4)}, ${(1 + sq).toFixed(4)})`;
      const lv = sh.frame === 'WIDE' ? laughAt(t) : 0;
      for (const [i, h] of heads.entries()) {
        const b = lv * (4 + 3 * (i % 3)) * Math.abs(Math.sin(t * 2 * Math.PI * (1.5 + 0.17 * (i % 4)) + i));
        const v = `translateY(${(-b).toFixed(1)}px) rotate(${(lv * 2.2 * Math.sin(t * 3.1 + i)).toFixed(2)}deg)`;
        if (h.n.style.transform !== v) h.n.style.transform = v;
      }
    }
    fade(front, inFront ? 1 : 0);
    if (inFront) { css(frontW, { transform: `scale(${(1 + 0.04 * E.inOut(clamp(inv(sh.t0, sh.t1, t)))).toFixed(4)})` }); drawRow(t, sh.t0); }
    const fk = pulse(t, S.b6.words[1].t - 0.02, c.laugh3 + 0.35, 0.04, 0.1);
    fade(focus, onStage ? fk * 0.6 : 0);
    if (fk > 0) css(focus, { transform: `rotate(${(Math.floor(t * 8) % 2 ? 1 : -1).toFixed(1)}deg) scale(1.05)`, transformOrigin: '50% 40%' });
    // adesivos (cada um termina de sair antes do corte seguinte)
    const s = (n, t0, t1, x, y, rot = 0, sc = 1) => stick(n, t, t0, t1, { x, y, rot, s: sc });
    s(st.hook, -1, S.a3.at + 0.35, 540, 385, -2);
    s(st.p1, c.laugh1 + 0.3, S.b3.at - 0.24, 540, 360, -1.5);
    s(st.p2, S.b3.at + 0.08, S.b5.at - 0.24, 540, 360, 1.5);
    s(st.hired, S.b5.words[1].t, S.b6.at - 0.22, 540, 420, -8, 0.82);
    s(st.boss, S.b6.words[1].t, c.laugh3 + 0.12, 540, 420, -8, 0.95);
    s(st.ask, c.endCard + 0.05, duration + 1, 540, 330, 1.5, 0.95);
    s(st.url, c.endCard + 0.3, duration + 1, 540, 500, -2, 0.92);
    s(st.fine, c.endCard + 0.55, duration + 1, 540, 618, 0, 0.82);
    // a porta: entra antes do "PUSH", treme a cada "Puxei", abre no "empurrou" e sai antes do close
    const dIn = S.a4.at - 0.22, dOpen = S.a10.words[1].t - 0.04, dOut = S.a11.at - 0.22;
    if (t < dIn || t > dOut + 0.16) fade(door, 0);
    else {
      const k = E.spring(clamp(inv(dIn, dIn + 0.3, t))), ko = E.in(clamp(inv(dOut, dOut + 0.16, t)));
      let jx = 0; for (const p of pulls) if (t > p && t < p + 0.35) jx += 10 * Math.exp(-(t - p) * 9) * Math.sin((t - p) * 60);
      const open = E.out(clamp(inv(dOpen, dOpen + 0.3, t)));
      fade(door, (1 - ko) * Math.min(1, (t - dIn) / 0.06));
      css(door, { left: 830 + jx, top: 500, transform: `translate(-50%, -50%) perspective(900px) rotateY(${(-68 * open).toFixed(1)}deg) rotate(${(-3 + 1.2 * Math.sin((t - dIn) * 4)).toFixed(2)}deg) scale(${(0.84 * (0.4 + 0.6 * k) * (1 - 0.45 * ko)).toFixed(4)})`, transformOrigin: '0% 50%' });
    }
    // legenda
    let pi = -1; for (let i = 0; i < PAGES.length; i++) if (t >= PAGES[i].start && t < PAGES[i].end) { pi = i; break; }
    if (pi < 0) { fade(cap, 0); capCache.i = -1; }
    else {
      const pg = PAGES[pi];
      if (capCache.i !== pi) { capCache.i = pi; capCache.cur = -2; cap.innerHTML = pg.words.map((x, i) => `<span data-i="${i}">${x.w}</span>`).join(' '); }
      let cur = -1; pg.words.forEach((x, i) => { if (t >= x.t - 0.03) cur = i; });
      if (capCache.cur !== cur) { capCache.cur = cur; cap.querySelectorAll('span').forEach((n, i) => { n.style.color = pg.words[i].ff ? '#F8C637' : i === cur ? '#9CC2FF' : '#FFFDF7'; }); }
      const k = E.out(clamp(inv(pg.start, pg.start + 0.1, t)));
      // com o Tato embaixo (plano com a caixa de retorno) a legenda sobe para não cobrir a cabeça dele
      fade(cap, 1); css(cap, { top: onStage && sh.frame === 'MEDT' && t >= c.tato - 0.3 ? 1010 : 1165, transform: `translate(-50%, -50%) scale(${(0.88 + 0.12 * k).toFixed(4)})` });
    }
  }
  const CUTS = shots.map((x) => x.t0).filter((x) => x > 0);
  const samples = (t) => {
    if (CUTS.some((x) => Math.abs(t - x) < 0.02)) return 1;
    const near = (a, w0) => a != null && t > a && t < a + w0;
    if (near(c.tato, 0.6) || pulls.some((p) => near(p - 0.16, 0.4)) || near(S.a10.words[1].t - 0.04, 0.35)) return [8, 0.5];
    return 1;
  };
  return { duration, cues: c, captions, audio: A.items, samples, render, hook: { title: '7 anos de inglês na escola e eu perdi pra uma porta' }, safe: [120, 270, 960, 1248], async ready() { return true; } };
}
