// AO PÉ DA LETRA NA IMIGRAÇÃO — corte do TikTok (~13 s): só o "chutei o balde". Receita TikTok
// "erro → reação" (references/22): a oficial pergunta do emprego → "I kicked the bucket!" → "You…
// died?" (um fantasminha sobe da Mina) → o Tato sopra "I quit my job" → carimbo, cartão final e
// "Next!", que emenda na pergunta do começo. Mesmas vozes, cenário e personagens do Reel
// (src/cuts/imigracao.js): nenhum TTS novo.
import { E, clamp, lerp, inv, pulse, el, css, fade, TatoActor, AudioList, tatoSpeech } from './kit.js';
import { residentMouth, envAt } from '../core/visemes.js';
import { renderCharacter, EXPRESSIONS } from '/character-rig.js';
import { AIRPORT } from './airport-room.js';
import { fastLine, align, segVoice, stick, buildPages, focusLines } from './creator.js';
import { CH, FR, POSE, DES, TATO, COUNTER_TOP, SEG, FAST, SPEED, PAD_A, PAD_B, LEAD, SHOCK, AGHAST, counterSVG, passportPage, airportBitmap } from './imigracao.js';

const EN = new Set(['e5', 'm3', 'e6a', 'e6b', 'm5', 'e8']);

export async function create(ctx) {
  const { W, H, overlay, voices: V } = ctx;
  const A = new AudioList();
  const USED = ['e5', 'm3', 'e6a', 'e6b', 'm4a', 'm4b', 't1a', 't1b', 't1c', 'm5', 'e8'];
  const F = {};
  for (const k of USED) { const id = SEG[k][0]; F[id] ??= FAST.has(id) ? fastLine(V.lines[id], id) : V.lines[id]; }
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
  put('e5', 0); put('m3', 0.1);
  c.drop = S.m3.end + 0.02;
  put('e6a', 0.42); put('e6b', 0.3);
  c.ghost = S.e6b.end + 0.08;
  put('m4a', 0.22); put('m4b', 0.12);
  c.tato = S.m4b.end + 0.1;
  put('t1a', 0.36); put('t1b', 0.1); put('t1c', 0.14);
  put('m5', 0.18);
  c.raise = S.m5.end + 0.06; c.stamp = c.raise + 0.34;
  T = c.stamp + 0.3; put('e8', 0);
  const duration = +(S.e8.end + 0.3).toFixed(3);
  c.duration = duration;
  for (const [k, v] of Object.entries(S)) c[k] = +v.at.toFixed(3);
  const segs = Object.values(S);

  // ------------------------------------------------------------ som
  A.cue('music', 0, { sections: [[0, 'vlog'], [duration, 'out']], drops: [[c.drop, c.tato - 0.05]], bpm: 104 });
  A.cue('ambience', 0, { until: duration });
  A.sfx('scratch', c.drop, { gain: 0.6 });
  A.sfx('thud', S.e6b.at - 0.02, { gain: 0.62 });
  A.sfx('dream', c.ghost, { gain: 0.38 });
  A.sfx('boing', c.tato + 0.05, { gain: 0.6 });
  A.sfx('pop', S.t1c.at, { gain: 0.3 });
  A.sfx('chip', S.m5.end + 0.02, { gain: 0.5 });
  A.sfx('whoosh', c.stamp - 0.12, { gain: 0.35 }); A.sfx('stamp', c.stamp + 0.02, { gain: 0.8 });
  A.sfx('motif-end', c.stamp + 0.3, { gain: 0.4 });
  const NAME = { mina: 'Mina', evelyn: 'Evelyn', tato: 'Tato' };
  const captions = segs.map((s) => ({ start: s.at, end: s.end, who: NAME[s.who], text: s.text, lang: EN.has(s.key) ? 'en' : 'pt' })).sort((x, y) => x.start - y.start);

  // ------------------------------------------------------------ cena (a mesma do Reel)
  const scene = el(overlay, 'div', 'layer', '', { width: `${W}px`, height: `${H}px`, overflow: 'hidden', background: '#E9E1CF' });
  const roomL = el(scene, 'div', 'layer', '', { width: `${AIRPORT.w}px`, height: `${AIRPORT.h}px` });
  el(roomL, 'img', '', '', { position: 'absolute', left: '0px', top: '0px', width: `${AIRPORT.w}px`, height: `${AIRPORT.h}px` }).src = await airportBitmap();
  const worldL = el(scene, 'div', 'layer', '', {});
  const box = {};
  const mkBox = (w) => { const D = DES[w], vb = Math.max(250, D.height * 0.92), h = D.height + 38, C = CH[w]; box[w] = el(worldL, 'div', '', '', { position: 'absolute', left: `${C.x - (vb / 2) * C.k}px`, top: `${C.feet - (D.height + 24) * C.k}px`, width: `${vb * C.k}px`, height: `${h * C.k}px` }); };
  mkBox('evelyn');
  const tato = new TatoActor(worldL, { id: 'imett' });
  el(worldL, 'div', '', counterSVG(), { position: 'absolute', left: '560px', top: `${COUNTER_TOP - 130}px`, width: '700px', height: '900px' });
  const deskStamp = el(worldL, 'div', '', '<svg width="60" height="60" viewBox="0 0 60 60"><ellipse cx="30" cy="12" rx="15" ry="11" fill="#8A5A3C"/><rect x="25" y="18" width="10" height="20" fill="#5E3B26"/><rect x="10" y="36" width="40" height="14" rx="4" fill="#D9343F"/></svg>', { position: 'absolute', left: '935px', top: `${COUNTER_TOP - 56}px`, width: '60px', height: '60px' });
  mkBox('mina');
  const ghost = el(worldL, 'div', '', '<div style="position:absolute;left:50%;top:0;transform:translateX(-50%);width:130px;height:30px;border:8px solid #FFF3B0;border-radius:50%;box-shadow:0 0 22px #FFF3B0"></div><div style="font:400 190px/1 var(--display);text-align:center;margin-top:14px">👻</div>', { position: 'absolute', left: '0px', top: '0px', width: '200px', height: '250px', opacity: '0' });
  el(scene, 'div', 'layer', '', { width: `${W}px`, height: `${H}px`, background: 'radial-gradient(ellipse 72% 56% at 50% 44%, rgba(0,0,0,0) 56%, rgba(40,30,20,.32) 100%), linear-gradient(100deg, rgba(255,214,150,.16), rgba(0,0,0,0) 45%)' });
  const focus = el(scene, 'div', 'layer', focusLines(), { width: `${W}px`, height: `${H}px` });

  // ------------------------------------------------------------ insert: o carimbo e o cartão final
  const insert = el(scene, 'div', 'layer', '', { width: `${W}px`, height: `${H}px`, background: '#4F7F8C', overflow: 'hidden' });
  const page = el(insert, 'div', '', passportPage(), { position: 'absolute', left: '70px', top: '430px', width: '940px', height: '1180px', borderRadius: '34px', background: '#F3ECD9', boxShadow: '0 40px 70px -30px rgba(0,0,0,.6)', overflow: 'hidden', transformOrigin: '50% 50%' });
  el(page, 'div', '', 'VISAS · VISTOS', { position: 'absolute', left: '60px', top: '48px', font: '700 34px/1 var(--display)', letterSpacing: '.12em', color: '#B9A47A' });
  const stampMark = el(page, 'div', '', '<div style="font:700 104px/1 var(--display);letter-spacing:.04em">WELCOME</div><div style="font:700 40px/1.2 var(--display);letter-spacing:.14em;margin-top:10px">BATA AIRPORT ✈</div><div style="font:600 34px/1.2 var(--display);letter-spacing:.1em;margin-top:6px">27 OCT 2026</div>', { position: 'absolute', left: '150px', top: '110px', padding: '30px 44px 34px', border: '10px double #D9343F', borderRadius: '30px', color: '#D9343F', textAlign: 'center', transformOrigin: '50% 50%', mixBlendMode: 'multiply' });

  // ------------------------------------------------------------ textos
  const sticker = (html, style = {}) => { const n = el(overlay, 'div', '', html, { position: 'absolute', left: '0px', top: '0px', whiteSpace: 'nowrap', transformOrigin: '50% 50%', ...style }); fade(n, 0); return n; };
  const BOX = { padding: '16px 28px 18px', borderRadius: '22px', background: '#FFFDF7', color: '#1C3A2B', font: '600 54px/1.1 var(--display)', boxShadow: '0 14px 30px -16px rgba(0,0,0,.55)', textAlign: 'center' };
  const st = {
    hook: sticker('nunca traduza “chutei o balde”<br>na imigração 💀', { ...BOX, font: '600 56px/1.16 var(--display)' }),
    p3: sticker('<div style="font:700 28px/1 var(--ui);letter-spacing:.08em;text-transform:uppercase;color:#F8C637;margin-bottom:8px">ao pé da letra</div><div style="font:600 50px/1.05 var(--display)">“chutei o balde”</div>', { padding: '16px 30px 20px', borderRadius: '22px', background: 'rgba(28,58,43,.92)', color: '#FFFDF7', textAlign: 'center', boxShadow: '0 14px 30px -16px rgba(0,0,0,.6)' }),
    fact: sticker('<span style="color:#F8C637">“kick the bucket”</span><br>= MORRER em inglês 💀', { padding: '18px 32px 20px', borderRadius: '24px', background: '#1C3A2B', color: '#FFFDF7', font: '700 54px/1.12 var(--display)', textAlign: 'center', border: '6px solid #FFFDF7', boxShadow: '0 20px 40px -18px rgba(0,0,0,.7)' }),
    right: sticker('<span style="color:#1C3A2B">“I quit my job”</span> = pedi demissão ✅', { ...BOX, font: '600 46px/1.1 var(--display)', background: '#F8C637' }),
    url: sticker('<div style="font:700 64px/1 var(--display)">batatalk.com.br</div><div style="font:600 34px/1.1 var(--ui);margin-top:12px;color:#1C3A2B">ensaie a imigração antes 🥔</div>', { padding: '18px 40px 20px', borderRadius: '30px', background: '#F8C637', color: '#14241C', textAlign: 'center', border: '5px solid #FFFDF7', boxShadow: '0 18px 36px -16px rgba(0,0,0,.6)' }),
    ask: sticker('qual expressão você<br>ia traduzir? 👇', { ...BOX, font: '600 52px/1.12 var(--display)' }),
    fine: sticker('Vozes geradas por IA · exemplos animados', { font: '600 32px/1 var(--ui)', color: '#FFFDF7', padding: '10px 20px', borderRadius: '14px', background: 'rgba(20,36,28,.74)' }),
  };
  const cap = el(overlay, 'div', '', '', { position: 'absolute', left: '540px', top: '1165px', transform: 'translate(-50%, -50%)', textAlign: 'center', whiteSpace: 'nowrap', font: '700 76px/1.05 var(--display)', color: '#FFFDF7', letterSpacing: '-.005em', WebkitTextStroke: '14px #14241C', paintOrder: 'stroke fill', textShadow: '0 8px 0 rgba(20,36,28,.28)' });
  const PAGES = buildPages(segs.map((s) => s.words));
  const HI = { mina: '#7FE3D5', evelyn: '#FF9A8A', tato: '#F8C637' };

  // ------------------------------------------------------------ direção das duas
  const K = { mina: { P: [], X: [], L: [] }, evelyn: { P: [], X: [], L: [] } };
  const pk = (w, t, p, dur = 0.24, ease = 'inOut') => K[w].P.push([t, p, dur, ease]);
  const xk = (w, t, e) => K[w].X.push([t, e]);
  const lk = (w, t, l, view = w === 'mina' ? 'q34' : 'q34r') => K[w].L.push([t, l, view]);
  pk('mina', 0, 'rest', 0); xk('mina', 0, 'smallSmile'); lk('mina', 0, [0.6, 0]);
  pk('mina', S.m3.at - 0.06, 'tada', 0.18, 'spring'); xk('mina', S.m3.at - 0.06, 'excited');
  pk('mina', S.e6b.end + 0.02, 'rest', 0.3); xk('mina', S.e6b.end + 0.02, 'confused');
  pk('mina', S.m4a.at - 0.06, 'huh', 0.16, 'spring'); xk('mina', S.m4a.at - 0.06, SHOCK); lk('mina', S.m4a.at - 0.06, [0, 0], 'front');
  lk('mina', S.m4b.end + 0.05, [0.6, -0.4]);
  pk('mina', c.tato, 'rest', 0.3); xk('mina', c.tato + 0.08, 'surprised'); lk('mina', c.tato + 0.12, [0.5, 0.45]);
  xk('mina', S.t1c.at, 'concerned');
  pk('mina', S.m5.at - 0.05, 'cheer', 0.16, 'spring'); xk('mina', S.m5.at - 0.05, 'excited'); lk('mina', S.m5.at - 0.05, [0.6, 0]);
  pk('mina', S.m5.end + 0.3, 'rest', 0.35); xk('mina', S.m5.end + 0.3, 'laugh');
  pk('evelyn', 0, 'desk', 0); xk('evelyn', 0, 'neutral'); lk('evelyn', 0, [-0.6, 0]);
  xk('evelyn', S.m3.at, 'listening');
  pk('evelyn', c.drop + 0.1, 'shock', 0.16, 'spring'); xk('evelyn', c.drop + 0.1, AGHAST);
  lk('evelyn', c.ghost + 0.1, [-0.6, -0.55]);
  pk('evelyn', c.tato, 'desk', 0.4); xk('evelyn', c.tato + 0.1, 'surprised'); lk('evelyn', c.tato + 0.12, [-0.55, 0.45]);
  xk('evelyn', S.t1c.at, 'listening'); lk('evelyn', S.m5.at, [-0.6, 0]);
  pk('evelyn', c.raise, 'raise', 0.26, 'out'); xk('evelyn', c.raise, 'smallSmile');
  pk('evelyn', c.stamp - 0.1, 'slam', 0.1, 'in');
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
  const BLINK = { mina: [1.3, 7.9, 12.5], evelyn: [1.7, 6.6, 10.1] };
  function draw(w, t) {
    const X = K[w].X; const expr = X[lastIdx(X, t)][1];
    const exprCurve = (typeof expr === 'string' ? EXPRESSIONS[expr]?.mouth?.curve : expr.mouth?.curve) ?? 0.1;
    const sg = segs.find((s) => s.who === w && t >= s.at - 0.04 && t <= s.end + 0.06);
    const { look, view } = lookOf(w, t);
    const ov = { eyes: { look: look.map((x) => +x.toFixed(3)) } };
    let lvl = 0, nod = 0, gest = 0;
    if (sg) {
      const m = residentMouth(sg.voice, sg.at, t + LEAD, 0.95);
      if (m && m.t !== 'line') ov.mouth = { ...m, curve: Math.max(m.curve ?? 0, exprCurve * 0.6) };
      if (ov.mouth && w === 'evelyn' && (sg.key === 'e6a' || sg.key === 'e6b')) ov.mouth = { ...ov.mouth, open: 0.45 + 0.7 * (ov.mouth.open ?? 0.2), curve: -0.2, w: 0.85 };
      for (let k = -4; k <= 4; k++) lvl += envAt(sg.voice, t - sg.at + sg.a + k * 0.05) / 9;
      const u = (t - sg.words[0].t) / 0.45;
      if (u > 0 && u < 1) { const b = Math.sin(Math.PI * u); nod += 2 * b; gest += 4 * b; }
    }
    const g = (a) => (a[2] === 'rest' && !a[3] ? a : [a[0], +(a[1] + gest).toFixed(2), a[2], a[3]]);
    const clean = (a) => a.filter((x) => x !== undefined).map((x) => (typeof x === 'number' ? +x.toFixed(2) : x));
    const ph = w === 'mina' ? 0 : 1.7;
    const hop = w === 'mina' && t > S.m5.at - 0.05 && t < S.m5.at + 0.45 ? 22 * Math.sin(Math.PI * (t - S.m5.at + 0.05) / 0.5) : 0;
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
  tato.bake({
    seed: 29, marks: false,
    moods: [[0, 'idle'], [c.tato, 'greeting', { markAlpha: 0 }], [S.t1a.at, 'encouraging', { markAlpha: 0, arm: 70 }], [S.m5.at, 'celebrating', { markAlpha: 0, spark: 0.7 }]],
    gestures: [[c.tato + 0.25, 'wave'], [S.t1c.at, 'point'], [S.m5.at + 0.05, 'cheer']],
    blinks: [c.tato + 0.9, S.t1c.end + 0.3],
    speech: [{ visemes: [S.t1a, S.t1b, S.t1c].flatMap((p) => tatoSpeech(p.voice, p.at - LEAD)) }],
  }, duration);
  const tatoU = (t) => (t - c.tato) / 0.5;
  c.tatoOut = c.raise - 0.26;
  const tatoY = (t) => {
    if (t < c.tato) return TATO.y + 420;
    if (t >= c.tatoOut) return TATO.y + 420 * E.in(clamp((t - c.tatoOut) / 0.26));
    const u = tatoU(t); return TATO.y + 420 * (u >= 1 ? 0 : Math.exp(-5.2 * u) * Math.cos(9.5 * u));
  };

  // ------------------------------------------------------------ planos
  const shots = [
    ['room', 0, S.m3.at - 0.05, 'MED2', { creep: 0.05 }],
    ['room', S.m3.at - 0.05, c.drop + 0.12, 'M_CU', { bump: S.m3.words[3].t, amp: 0.05 }],
    ['room', c.drop + 0.12, S.e6b.end + 0.12, 'E_XCU', { bump: S.e6b.at, amp: 0.06, shake: S.e6b.at, creep: 0.1 }],
    ['room', S.e6b.end + 0.12, c.tato + 0.6, 'MED2', { bump: c.tato + 0.16, amp: 0.03 }],
    ['room', c.tato + 0.6, S.m5.at - 0.05, 'T_CU', { creep: 0.05 }],
    ['room', S.m5.at - 0.05, c.raise - 0.02, 'M_CU', { bump: S.m5.at, amp: 0.04, shake: S.m5.at }],
    ['room', c.raise - 0.02, c.stamp - 0.02, 'E_CU'],
    ['insert', c.stamp - 0.02, duration + 1],
  ].map(([kind, t0, t1, frame, o = {}]) => ({ kind, t0, t1, frame, ...o }));
  const shotAt = (t) => shots.find((s) => t >= s.t0 && t < s.t1) || shots[shots.length - 1];
  function camAt(t, sh) {
    const f = FR[sh.frame], u = clamp(inv(sh.t0, sh.t1, t));
    const kb = sh.bump != null && t >= sh.bump ? (sh.amp ?? 0.05) * Math.exp(-(t - sh.bump) * 9) : 0;
    const push = (1 + (sh.creep ?? 0.03) * E.inOut(u)) * (1 + kb);
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
      fade(deskStamp, t >= c.raise ? 0 : 1);
      tato.frame(t, { x: TATO.x, y: tatoY(t), h: TATO.h, o: t >= c.tato && t < c.tatoOut + 0.28 ? 1 : 0 });
      const ty = tatoY(t), top = ty - TATO.h * (207 / 220), cut = Math.max(0, top + TATO.h - (COUNTER_TOP + 6));
      tato.n.style.clipPath = `inset(-40px -40px ${cut.toFixed(1)}px -40px)`;
      const u = tatoU(t), sq = t >= c.tato && u < 1.4 ? 0.12 * Math.exp(-3.6 * u) * Math.sin(9.5 * u) : 0;
      tato.n.style.transform = `scale(${(1 - sq).toFixed(4)}, ${(1 + sq).toFixed(4)})`;
      const gk = t - c.ghost;
      if (gk > 0 && t < c.tato + 0.5) {
        const rise = E.out(clamp(gk / 1.3)), o = Math.min(clamp(gk / 0.25), 1 - clamp(inv(c.tato, c.tato + 0.4, t)));
        css(ghost, { left: CH.mina.x - 100 + 12 * Math.sin(gk * 2 * Math.PI * 0.8), top: CH.mina.eye - 300 - 150 * rise, opacity: (0.9 * o).toFixed(3) });
      } else if (ghost.style.opacity !== '0') ghost.style.opacity = '0';
    }
    const fk = Math.max(pulse(t, S.m3.words[3].t - 0.02, c.drop, 0.04, 0.06), pulse(t, c.drop + 0.12, S.e6b.end + 0.12, 0.02, 0.05));
    fade(focus, inRoom ? fk * 0.72 : 0);
    if (fk > 0) css(focus, { transform: `rotate(${(Math.floor(t * 8) % 2 ? 1 : -1).toFixed(1)}deg) scale(1.05)`, transformOrigin: '50% 40%' });
    fade(insert, inInsert ? 1 : 0);
    if (inInsert) {
      const u = t - c.stamp;
      const land = clamp(inv(-0.1, 0.03, u)), sc = 1.55 - 0.55 * E.in(land), sh2 = u > 0.03 ? 10 * Math.exp(-(u - 0.03) * 14) : 0;
      css(stampMark, { transform: `rotate(-9deg) scale(${sc.toFixed(4)})`, opacity: (land > 0.98 ? 0.92 : 0.35 * land).toFixed(3) });
      css(page, { transform: `translate(${(sh2 * Math.sin(u * 80)).toFixed(1)}px, ${(sh2 * Math.cos(u * 64)).toFixed(1)}px) scale(${(1.0 + 0.04 * clamp(inv(0, 1.6, u))).toFixed(4)})` });
    }
    // adesivos: cada um termina de sair antes do corte seguinte
    const s = (n, t0, t1, x, y, rot = 0, sc = 1) => stick(n, t, t0, t1, { x, y, rot, s: sc });
    s(st.hook, -1, S.m3.at - 0.22, 540, 352, -2);
    s(st.p3, S.m3.at + 0.15, c.drop - 0.06, 540, 330, -1.5);
    s(st.fact, S.e6b.end + 0.16, c.tato + 0.42, 640, 345, -2);
    s(st.right, S.t1c.at + 0.05, S.m5.end - 0.1, 540, 330, 2, 0.95);
    s(st.url, c.stamp + 0.12, duration + 1, 540, 345, -2);
    s(st.ask, c.stamp + 0.3, duration + 1, 540, 990, 2);
    s(st.fine, c.stamp + 0.45, duration + 1, 540, 1088, 0, 0.85);
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
  const CUTS = shots.map((x) => x.t0).filter((x) => x > 0);
  const samples = (t) => {
    if (CUTS.some((x) => Math.abs(t - x) < 0.02)) return 1;
    const near = (a, w0) => a != null && t > a && t < a + w0;
    if (near(c.tato, 0.6) || near(c.drop + 0.12, 0.3) || near(S.m5.at - 0.05, 0.5) || near(S.m3.at - 0.06, 0.3) || near(c.stamp - 0.02, 0.25) || near(S.m4a.at - 0.06, 0.25)) return [8, 0.5];
    return 1;
  };
  return { duration, cues: c, captions, audio: A.items, samples, render, hook: { title: 'nunca traduza “chutei o balde” na imigração' }, safe: [120, 270, 960, 1248], async ready() { return true; } };
}
