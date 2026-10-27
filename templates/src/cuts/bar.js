// ESQUETE DO BAR 9:16 (TikTok/Reels, ~33 s): Priya e June, amigas, num bar de Batata City à noite.
// v2 (27/10), refeita pela pesquisa de retenção: a piada vem PRIMEIRO (abertura fria: "The book is
// on the table." + quadro-negro do 6º ano + "Amiga." em 3 s), um estímulo novo a cada 2–4 s, nada de
// respiro morto, e um fim que emenda no começo ("Então fala alguma coisa aí." → a frase de escola).
// Campo e contracampo, tranco de câmera nas piadas, falha digital no "trava tudo", celular em
// primeira pessoa com o app de verdade. Movimento calmo no resto (só a fala e o começo das frases
// mexem o corpo; os gestos grandes ganham mola).
import { E, clamp, lerp, inv, pulse, el, css, fade, TatoActor, AudioList, Stage } from './kit.js';
import { residentMouth, envAt } from '../core/visemes.js';
import { bakeTato } from '../core/tato-motor.js';
import { renderCharacter, EXPRESSIONS, mergeDesign } from '/character-rig.js';
import { DESIGNS } from '/character-designs.js';
import { barSVG, boardSVG, BAR } from './bar-room.js';
import { fastLine, align, segVoice, stick, buildPages, focusLines } from './creator.js';

const SPEED = 1.1, PAD_A = 0.03, PAD_B = 0.07;
const FAST = new Set(['barP1', 'barP2', 'barJ2', 'barJ4', 'barP5', 'barJ5', 'barP6', 'barP7', 'barP9', 'barJ8']);
// [arquivo, a, b, legenda, (o que se pronuncia)] — a e b em segundos do arquivo ORIGINAL
const SEG = {
  p3a: ['barP3', 0.03, 0.74, 'The book'],
  p3b: ['barP3', 1.26, 2.36, 'is on the table.'],
  j3: ['barJ3', 0.01, 0.63, 'Amiga.'],
  p1a: ['barP1', 0.0, 0.82, 'Ai,'],
  p1b: ['barP1', 1.86, 2.46, 'amiga…'],
  p2a: ['barP2', 0.01, 1.24, 'Eu leio.'],
  p2b: ['barP2', 1.57, 2.56, 'Eu escrevo.'],
  p2c: ['barP2', 3.23, 4.67, 'Mas na hora de falar…'],
  p2d: ['barP2', 5.52, 6.41, 'trava tudo.'],
  j4: ['barJ4', 0.06, 1.35, 'Treina no BataTalk.'],
  p5: ['barP5', 0.02, 0.86, 'No quê?'],
  j5b: ['barJ5', 1.4, 3.37, 'Você treina conversa em voz alta.'],
  j5c: ['barJ5', 6.43, 7.13, 'E se travar,'],
  j5d: ['barJ5', 7.65, 8.78, 'uma batata te ajuda.'],
  p6: ['barP6', 0.02, 1.19, 'Uma batata.'],
  j6: ['barJ6', 0.4, 0.94, 'Confia.'],
  p7a: ['barP7', 0.07, 0.72, 'Éé…'],
  p7b: ['barP7', 1.21, 2.11, 'peraí.'],
  p8: ['barP8', 0.06, 1.65, 'To go, please!'],
  p9a: ['barP9', 0.02, 0.76, 'Amiga!'],
  p9b: ['barP9', 1.46, 2.41, 'Eu falei!'],
  j7: ['barJ7', 0.17, 0.6, 'Falou.'],
  j8a: ['barJ8', 0.03, 3.35, 'batatalk.com.br', 'Bata Tók ponto com ponto bê erre'],
  j8b: ['barJ8', 3.71, 5.62, 'Dá pra começar de graça.'],
  j2: ['barJ2', 0.01, 2.08, 'Então fala alguma coisa aí.'],
};

// ------------------------------------------------------------------ as duas no mundo
// Mundo = tela no plano a dois (s = 1). A mesa alta tem tampo em y 1215.
const CH = {
  priya: { x: 330, k: 3.3, feet: 1610, eye: 1610 - 243 * 3.3 },
  june: { x: 760, k: 3.3, feet: 1610, eye: 1610 - 256.4 * 3.3 },
};
const TABLE_Y = 1215;
// enquadramentos {s, cx, cy}: os olhos de quem fala num ponto fixo da tela (corte de esquete)
const at = (who, s, ex, ey) => ({ s, cx: CH[who].x - (ex - 540) / s, cy: CH[who].eye - (ey - 960) / s });
const FR = {
  TWO: { s: 1, cx: 540, cy: 960 },
  P_MED: at('priya', 1.4, 470, 700), P_CU: at('priya', 2.0, 500, 720), P_XCU: at('priya', 2.9, 520, 760), P_CUF: at('priya', 2.0, 540, 720),
  J_MED: at('june', 1.4, 610, 700), J_CU: at('june', 2.0, 580, 720), J_XCU: at('june', 2.9, 560, 760), J_MEDF: at('june', 1.4, 540, 720), J_XCUF: at('june', 2.6, 540, 740),
};
// braços [braço, antebraço ABSOLUTO, mão, objeto?]; L = esquerda da tela. No 3/4 o braço do lado
// oposto ao olhar fica atrás do corpo: objeto vai sempre na mão da frente.
const POSE = {
  priya: {
    rest: { armL: [12, 0, 'rest'], armR: [14, -24, 'rest'] },
    face: { armL: [26, -158, 'open'], armR: [26, -160, 'open'] },          // mãos no rosto (o drama de quinta-feira)
    one: { armL: [12, 0, 'rest'], armR: [34, -150, 'point'] },
    two: { armL: [34, -150, 'point'], armR: [34, -150, 'point'] },
    drop: { armL: [18, 14, 'open'], armR: [18, 14, 'open'] },
    proud: { armL: [12, 0, 'rest'], armR: [22, -118, 'open'] },
    huh: { armL: [30, 100, 'open'], armR: [30, 100, 'open'] },
    cheer: { armL: [125, 150, 'fist'], armR: [125, 150, 'fist'] },
  },
  june: {
    rest: { armL: [10, -100, 'rest', 'mug'], armR: [8, 2, 'rest'] },
    sip: { armL: [-26, -172, 'rest', 'mug'], armR: [8, 2, 'rest'] },
    phone: { armL: [24, -110, 'rest', 'phone'], armR: [8, 2, 'rest'] },
  },
};
const DES = {
  priya: DESIGNS.priya,
  june: mergeDesign(DESIGNS.june, { colors: { ...DESIGNS.june.colors, phone: '#1D1B24', screen: '#CFE0FF' }, props: { ...DESIGNS.june.props, phone: { upright: true, reach: 0.2, dx: 2, dy: -4, grip: 'rest', thumb: true, front: false, shapes: [{ t: 'poly', pts: [[-12, -21, 4], [12, -21, 4], [12, 21, 4], [-12, 21, 4]], fill: 'phone' }, { t: 'poly', pts: [[-9.5, -18, 2], [9.5, -18, 2], [9.5, 18, 2], [-9.5, 18, 2]], fill: 'screen' }, { t: 'poly', pts: [[-6, -10, 1], [6, -10, 1], [6, -4, 1], [-6, -4, 1]], fill: 'phone' }] } } }),
};

export async function create(ctx) {
  const { W, H, overlay, voices: V } = ctx;
  const A = new AudioList();
  const d = (id) => V.lines[id].off - V.lines[id].on;
  const F = {};
  for (const [id] of Object.values(SEG)) F[id] ??= FAST.has(id) ? fastLine(V.lines[id], id) : V.lines[id];
  const who = (id) => (id.startsWith('barP') ? 'priya' : 'june');

  // ------------------------------------------------------------ montagem da fala
  const S = {}, c = {};
  let T = 0.05;
  const put = (key, gap = 0.1) => {
    T += gap;
    const [id, a0, b0, text, say] = SEG[key], f = F[id], sp = FAST.has(id) ? SPEED : 1;
    const a = Math.max(0, (a0 - PAD_A) / sp), b = (b0 + PAD_B) / sp;
    const words = align(say || text, f.spans, a0 / sp, b0 / sp);
    A.clip(id, T, a, b, V, { file: f.file });
    const off = T - a, w = who(id);
    S[key] = { key, id, who: w, at: T, end: T + b - a, a, b, voice: segVoice(f, a, b, words), words: words.map((x) => ({ w: x.w, t: x.t + off, e: x.e + off, who: w })), text, say: Boolean(say) };
    T = S[key].end;
    return S[key];
  };
  // 1. abertura fria: a piada primeiro (frase de escola → quadro-negro → "Amiga.")
  put('p3a', 0); put('p3b', 0.2);
  c.flash = S.p3b.at - 0.03; c.flashEnd = S.p3b.end + 0.16; T = c.flashEnd;
  put('j3', 0.03);
  c.hookEnd = S.j3.end + 0.1;
  // 2. o problema
  put('p1a', 0.14); put('p1b', 0.06);
  put('p2a', 0.12); put('p2b', 0.06); put('p2c', 0.1); put('p2d', 0.18);
  c.glitch = S.p2d.at - 0.02;
  // 3. a solução (e a batata)
  put('j4', 0.2); put('p5', 0.08);
  put('j5b', 0.1); put('j5c', 0.12); put('j5d', 0.08);
  put('p6', 0.2); put('j6', 0.22);
  c.tato = S.j6.end + 0.08;
  // 4. a prova: celular em primeira pessoa
  c.phone = c.tato + 0.82; c.sora = c.phone + 0.14; c.soraEnd = c.sora + d('soraAsk');
  A.voice('soraAsk', c.sora, V);
  T = c.soraEnd;
  put('p7a', 0.14); put('p7b', 0.14);
  c.tap = S.p7b.at + 0.04; c.hint = c.tap + 0.1;
  put('p8', 0.36);
  c.said = S.p8.end + 0.03; c.phoneEnd = c.said + 0.55; T = c.phoneEnd;
  // 5. a vitória e o convite
  put('p9a', 0.04); put('p9b', 0.08);
  put('j7', 0.16);
  put('j8a', 0.2); put('j8b', 0.08);
  // 6. o laço: a June devolve a pergunta pra quem assiste; o vídeo recomeça na resposta de escola
  put('j2', 0.28);
  const duration = +(S.j2.end + 0.2).toFixed(3);
  c.duration = duration;
  for (const [k, v] of Object.entries(S)) c[k] = +v.at.toFixed(3);
  const segs = Object.values(S);

  // ------------------------------------------------------------ som
  A.cue('music', 0, { sections: [[0, 'lofi'], [duration, 'out']], drops: [[0, S.p1a.at - 0.03], [c.glitch - 0.02, S.j4.at - 0.03], [S.p6.at - 0.08, c.tato - 0.02], [S.j2.at - 0.06, duration + 1]], bpm: 86 });
  A.cue('ambience', 0, { until: duration });
  A.sfx('whoosh', c.flash - 0.08, { gain: 0.45 }); A.sfx('dream', c.flash, { gain: 0.45 });
  A.sfx('thud', S.j3.at - 0.03, { gain: 0.62 });
  A.sfx('pop', S.p1a.at - 0.02, { gain: 0.3 });
  A.sfx('buzz', c.glitch + 0.02, { gain: 0.32 });
  A.sfx('pop', S.j4.at + 0.1, { gain: 0.3 });
  A.sfx('pop', S.p6.words[1].t, { gain: 0.35 }); A.sfx('pop', S.j6.at + 0.05, { gain: 0.35 });
  A.sfx('boing', c.tato + 0.05, { gain: 0.6 });
  A.sfx('swoop', c.phone - 0.12, { gain: 0.35 });
  A.sfx('tap', c.tap + 0.02, { gain: 0.5 }); A.sfx('rung', c.hint + 0.02, { gain: 0.35 });
  A.sfx('chip', c.said + 0.06, { gain: 0.6 });
  A.sfx('result', S.p9a.at, { gain: 0.45 });
  for (let i = 0; i < 4; i++) A.sfx('pop', S.p9a.at + 0.05 + i * 0.07, { gain: 0.25, pan: i % 2 ? 0.4 : -0.4 });
  A.sfx('motif-end', S.j8a.at + 0.1, { gain: 0.4 });
  A.sfx('pop', S.j8b.at, { gain: 0.35 });
  A.sfx('whoosh', S.j2.at - 0.1, { gain: 0.35 });
  const captions = [
    ...segs.map((s) => ({ start: s.at, end: s.end, who: s.who === 'priya' ? 'Priya' : 'June', text: s.text, lang: ['p3a', 'p3b', 'p8'].includes(s.key) ? 'en' : 'pt' })),
    { start: c.sora, end: c.soraEnd, who: 'Sora', text: V.lines.soraAsk.text, lang: 'en', inScene: true },
  ].sort((x, y) => x.start - y.start);

  // ------------------------------------------------------------ cena: bar, as duas, mesa, Tato
  const scene = el(overlay, 'div', 'layer', '', { width: `${W}px`, height: `${H}px`, overflow: 'hidden', background: '#1D4148' });
  const roomL = el(scene, 'div', 'layer', '', { width: `${BAR.w}px`, height: `${BAR.h}px` });
  const roomSrc = await rasterize(barSVG(), BAR.w, BAR.h, 2.4);
  el(roomL, 'img', '', '', { position: 'absolute', left: '0px', top: '0px', width: `${BAR.w}px`, height: `${BAR.h}px` }).src = roomSrc;
  const worldL = el(scene, 'div', 'layer', '', {});
  const box = {};
  for (const w of ['priya', 'june']) {
    const D = DES[w], vb = Math.max(250, D.height * 0.92), h = D.height + 38, C = CH[w];
    box[w] = el(worldL, 'div', '', '', { position: 'absolute', left: `${C.x - (vb / 2) * C.k}px`, top: `${C.feet - (D.height + 24) * C.k}px`, width: `${vb * C.k}px`, height: `${h * C.k}px` });
  }
  const tato = new TatoActor(worldL, { id: 'bar' });
  // mesa alta redonda na frente das duas; a limonada da Priya parada nela
  el(worldL, 'div', '', `<svg width="1000" height="760" viewBox="0 0 1000 760"><rect x="470" y="120" width="60" height="640" fill="#5E3B26"/><ellipse cx="500" cy="60" rx="470" ry="52" fill="#B9774A"/><path d="M30 60 a470 52 0 0 0 940 0 v28 a470 52 0 0 1 -940 0 z" fill="#8A5634"/><ellipse cx="500" cy="52" rx="440" ry="38" fill="#C98B5E"/><ellipse cx="380" cy="44" rx="160" ry="10" fill="#FFFFFF" opacity=".18"/></svg>`, { position: 'absolute', left: '40px', top: `${TABLE_Y - 60}px`, width: '1000px', height: '760px' });
  el(worldL, 'div', '', '<svg width="84" height="170" viewBox="0 0 84 170"><path d="M52 4 l14 -4 l-8 66" stroke="#FFFFFF" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M8 46 h68 l-7 118 h-54 z" fill="#E8F7FF" opacity=".55"/><path d="M11 76 h62 l-5 86 h-52 z" fill="#FF9FCB"/><circle cx="20" cy="52" r="17" fill="#FFE36E" stroke="#F2B33D" stroke-width="4"/><rect x="18" y="88" width="8" height="60" rx="4" fill="#FFFFFF" opacity=".35"/></svg>', { position: 'absolute', left: '410px', top: `${TABLE_Y - 150}px`, width: '84px', height: '170px' });
  el(scene, 'div', 'layer', '', { width: `${W}px`, height: `${H}px`, background: 'radial-gradient(ellipse 70% 55% at 50% 42%, rgba(0,0,0,0) 55%, rgba(8,16,28,.42) 100%), linear-gradient(90deg, rgba(255,95,184,.10), rgba(0,0,0,0) 35%, rgba(0,0,0,0) 65%, rgba(95,227,208,.10))' });
  const focus = el(scene, 'div', 'layer', focusLines(), { width: `${W}px`, height: `${H}px` });
  // falha digital do "trava tudo": faixas deslocadas em cor (tela que trava)
  const glitch = el(scene, 'div', 'layer', glitchBars(), { width: `${W}px`, height: `${H}px`, mixBlendMode: 'screen' });
  // confete do "Amiga! Eu falei!": sai dos punhos dela
  const confetti = el(scene, 'div', 'layer', '', { width: `${W}px`, height: `${H}px` });
  const CONF = (() => { let k = 5; const r = () => { k = (k * 9301 + 49297) % 233280; return k / 233280; }; return Array.from({ length: 46 }, (_, i) => ({ vx: (i % 2 ? 1 : -1) * (120 + r() * 520), vy: -1100 - r() * 700, spin: (r() - 0.5) * 900, c: ['#F8C637', '#FF8AD8', '#7FE3D5', '#FFFDF7', '#8A55F0'][i % 5], w: 14 + r() * 14, h: 8 + r() * 10, x0: i % 2 ? 470 : 190, y0: 640 })); })();
  const confEls = CONF.map((p) => el(confetti, 'i', '', '', { position: 'absolute', left: '0px', top: '0px', width: `${p.w.toFixed(0)}px`, height: `${p.h.toFixed(0)}px`, borderRadius: '3px', background: p.c }));

  // ------------------------------------------------------------ flashback: o quadro-negro do 6º ano
  const flash = el(scene, 'div', 'layer', '', { width: `${W}px`, height: `${H}px` });
  el(flash, 'img', '', '', { position: 'absolute', left: '0px', top: '0px', width: `${W}px`, height: `${H}px` }).src = await chalkBoard();
  el(flash, 'div', 'layer', '', { width: `${W}px`, height: `${H}px`, background: 'radial-gradient(ellipse 70% 60% at 50% 45%, rgba(0,0,0,0) 50%, rgba(40,26,10,.55) 100%)' });
  // o rótulo fica embaixo: o título do gancho continua lido no alto
  el(flash, 'div', '', '▶ flashback · 6º ano', { position: 'absolute', left: '540px', top: '1150px', transform: 'translateX(-50%)', font: '700 40px/1 var(--ui)', letterSpacing: '.06em', color: '#FFFDF7', padding: '10px 18px', borderRadius: '10px', background: 'rgba(20,20,20,.55)', whiteSpace: 'nowrap' });

  // ------------------------------------------------------------ celular em primeira pessoa (app, exemplo animado)
  const PH = { x: 46, y: 176, w: 988, h: 930, r: 80, bez: 24 };
  const phoneBg = el(scene, 'div', 'layer', '', { width: `${W}px`, height: `${H}px`, overflow: 'hidden' });
  el(phoneBg, 'img', '', '', { position: 'absolute', left: '-360px', top: '-340px', width: `${BAR.w}px`, height: `${BAR.h}px`, filter: 'blur(14px) brightness(.62)' }).src = roomSrc;
  // a mesa e a limonada desfocadas embaixo (ela está segurando o celular sobre a mesa)
  el(phoneBg, 'div', '', '<svg width="1400" height="760" viewBox="0 0 1400 760"><ellipse cx="700" cy="150" rx="760" ry="120" fill="#B9774A"/><rect x="0" y="150" width="1400" height="610" fill="#8A5634"/><ellipse cx="700" cy="140" rx="720" ry="96" fill="#C98B5E"/><rect x="250" y="-160" width="150" height="300" rx="20" fill="#FF9FCB" opacity=".85"/></svg>', { position: 'absolute', left: '-160px', top: '1340px', width: '1400px', height: '760px', filter: 'blur(16px) brightness(.8)' });
  const phone = el(scene, 'div', '', '', { position: 'absolute', left: `${PH.x}px`, top: `${PH.y}px`, width: `${PH.w}px`, height: `${PH.h}px`, borderRadius: `${PH.r}px`, background: '#15161C', boxShadow: '0 50px 90px -30px rgba(0,0,0,.75), inset 0 0 0 3px #2E3040', transformOrigin: '50% 60%' });
  const screen = el(phone, 'div', '', '', { position: 'absolute', left: `${PH.bez}px`, top: `${PH.bez}px`, width: `${PH.w - PH.bez * 2}px`, height: `${PH.h - PH.bez * 2}px`, borderRadius: `${PH.r - PH.bez}px`, overflow: 'hidden', background: 'var(--cream)' });
  // câmera frontal: um ponto na borda (o entalhe grande cobria a fala do barista)
  el(phone, 'i', '', '', { position: 'absolute', left: `${PH.w / 2 - 7}px`, top: '5px', width: '14px', height: '14px', borderRadius: '50%', background: '#2E3040' });
  const sw = el(screen, 'div', '', '', { position: 'absolute', left: '0px', top: '0px', transformOrigin: '0 0' });
  const VW = 390, VH = 693;
  const stage = new Stage(sw, { ci: 1, pi: 0, turn: 3, vw: VW, vh: VH, x: 0, y: 0, cls: 'screen', radius: 0 });
  await stage.ready();
  const SW = PH.w - PH.bez * 2, SH = PH.h - PH.bez * 2, cs = SW / VW, visH = SH / cs;
  stage.frame({ phase: 'speaking', spoken: 'For here or to go?', show: { top: 1, line: 1, you: 1, dock: 1, shade: 1 }, hintsShown: 0 });
  const lineR = stage.rect('.pv2-line') || { y: 74 };
  const dockHs = [0, 1].map((k) => { stage.frame({ phase: 'listening', spoken: 'For here or to go?', hintsShown: k }); return stage.rect('.pv2-dock')?.h || 230; });
  stage.frame({ phase: 'processing', spoken: 'For here or to go?', hintsShown: 0, said: 'To go, please!', chip: 'Entendido', guideSay: 'Boa! Sora entendeu.', guideBubble: 1 });
  const capR = stage.rect('[data-voice-caption]') || { y: 110 }, chipR = stage.rect('[data-v2-chip]') || { y: 400, h: 20 }, guideR = stage.rect('.pv2-guide__bubble') || { y: 300, h: 80 };
  const FQ = { cy: lineR.y - 6 + visH / 2 }, FD = { cy: VH - visH / 2 };
  const eBot = Math.max(chipR.y + chipR.h, guideR.y + guideR.h) + 22;
  const FE = { cy: Math.min(VH - visH / 2, Math.max(capR.y - 12 + visH / 2, eBot - visH / 2)) };
  const thumb = el(scene, 'div', '', '<svg width="210" height="260" viewBox="0 0 210 260"><path d="M40 260 C30 190 40 120 92 92 C132 70 168 86 172 120 C176 150 150 170 132 186 C116 200 112 230 118 260 Z" fill="#B57352"/><path d="M118 104 C134 92 158 98 160 116 C162 132 146 140 132 136 C118 132 108 116 118 104 Z" fill="#D9A08A"/></svg>', { position: 'absolute', left: '0px', top: `${PH.y + PH.h - 170}px`, width: '210px', height: '260px' });
  const demo = el(scene, 'div', 'label-demo', 'Exemplo animado', { background: 'rgba(255,253,247,.12)', border: '2px solid rgba(255,253,247,.28)', color: '#FFF3C9' });
  const trans = el(scene, 'div', '', '“pra comer aqui ou pra levar?”', { position: 'absolute', left: '540px', top: '1168px', transform: 'translate(-50%, -50%)', font: 'italic 500 44px/1.1 var(--display)', color: 'rgba(255,253,247,.92)', whiteSpace: 'nowrap' });
  const guide = bakeTato({
    seed: 41, marks: false,
    moods: [[0, 'listening', { gaze: -2, markAlpha: 0 }], [c.hint, 'encouraging', { markAlpha: 0, arm: 60 }], [S.p8.at - 0.1, 'listening', { gaze: -2, markAlpha: 0 }], [c.said + 0.05, 'proud', { markAlpha: 0, spark: 0.4 }]],
    gestures: [[c.hint + 0.05, 'point'], [c.said + 0.08, 'satisfied']],
    blinks: [c.phone + 0.8, c.hint + 0.9, c.said + 0.5], speech: [],
  }, duration);

  // ------------------------------------------------------------ textos
  const sticker = (html, style = {}) => { const n = el(overlay, 'div', '', html, { position: 'absolute', left: '0px', top: '0px', whiteSpace: 'nowrap', transformOrigin: '50% 50%', ...style }); fade(n, 0); return n; };
  const BOX = { padding: '16px 28px 18px', borderRadius: '22px', background: '#FFFDF7', color: '#1C3A2B', font: '600 54px/1.1 var(--display)', boxShadow: '0 14px 30px -16px rgba(0,0,0,.55)', textAlign: 'center' };
  const st = {
    hook: sticker('7 anos de inglês na escola…<br>e eu só sei falar isso:', { ...BOX, font: '600 56px/1.16 var(--display)' }),
    skull: sticker('💀', { font: '400 150px/1 var(--display)' }),
    tease: sticker('espera a batata 🥔', { font: '700 38px/1 var(--ui)', color: '#FFFDF7', padding: '12px 20px', borderRadius: '999px', background: 'rgba(20,20,28,.55)', border: '2px solid rgba(255,253,247,.35)' }),
    error: sticker('<div style="display:flex;align-items:center;gap:10px;padding:10px 16px;background:linear-gradient(90deg,#2F4C8C,#5B7BD6);color:#fff;font:700 30px/1 var(--ui);border-radius:12px 12px 0 0"><span>⚠</span><span>travou.exe</span><span style="margin-left:auto;padding:2px 10px;background:#E5533D;border-radius:6px">✕</span></div><div style="padding:22px 26px 18px;font:600 38px/1.2 var(--ui);color:#14241C">travou.exe parou<br>de responder 🧊</div><div style="display:flex;justify-content:flex-end;padding:0 22px 20px"><span style="padding:8px 26px;border:3px solid #2F4C8C;border-radius:10px;font:700 30px/1 var(--ui);color:#2F4C8C">OK</span></div>', { background: '#ECEFF6', borderRadius: '14px', boxShadow: '0 24px 40px -16px rgba(0,0,0,.7)', textAlign: 'left', minWidth: '520px' }),
    potato: sticker('🥔❓', { font: '400 120px/1 var(--display)' }),
    confia: sticker('confia 🤝', { ...BOX, font: '600 52px/1 var(--display)' }),
    falei: sticker('AMIGA EU FALEI 😭', { padding: '18px 34px 20px', borderRadius: '24px', background: '#1C3A2B', color: '#F8C637', font: '700 70px/1 var(--display)', border: '6px solid #FFFDF7', boxShadow: '0 20px 40px -18px rgba(0,0,0,.7)' }),
    url: sticker('batatalk.com.br', { padding: '18px 40px 20px', borderRadius: '999px', background: 'rgba(30,8,40,.55)', color: '#FFE6F6', font: '700 66px/1 var(--display)', border: '5px solid #FF8AD8', textShadow: '0 0 18px #FF5FB8, 0 0 36px #FF5FB8', boxShadow: '0 0 30px rgba(255,95,184,.55), inset 0 0 24px rgba(255,95,184,.35)' }),
    tag: sticker('marca a amiga do<br>“the book is on the table” 👇', { ...BOX, font: '600 46px/1.15 var(--display)' }),
    fine: sticker('Vozes geradas por IA · exemplos animados', { font: '600 32px/1 var(--ui)', color: '#FFFDF7', padding: '12px 22px', borderRadius: '14px', background: 'rgba(20,36,28,.72)' }),
  };
  // legenda palavra a palavra; a palavra da vez na cor de quem fala (Priya rosa, June manteiga)
  const cap = el(overlay, 'div', '', '', { position: 'absolute', left: '540px', top: '1165px', transform: 'translate(-50%, -50%)', textAlign: 'center', whiteSpace: 'nowrap', font: '700 76px/1.05 var(--display)', color: '#FFFDF7', letterSpacing: '-.005em', WebkitTextStroke: '14px #14241C', paintOrder: 'stroke fill', textShadow: '0 8px 0 rgba(20,36,28,.28)' });
  const PAGES = buildPages(segs.map((s) => (s.say ? [{ w: s.text, t: s.at + 0.02, e: s.end - 0.05, who: s.who }] : s.words)));
  const HI = { priya: '#FF9BD8', june: '#F8C637' };

  // ------------------------------------------------------------ direção das duas
  // chaves [t, pose, transição, curva]; expressão [t, expr]; olhar [t, [x, y], view]
  const K = { priya: { P: [], X: [], L: [] }, june: { P: [], X: [], L: [] } };
  const pk = (w, t, p, dur = 0.24, ease = 'inOut') => K[w].P.push([t, p, dur, ease]);
  const xk = (w, t, e) => K[w].X.push([t, e]);
  const lk = (w, t, l, view = w === 'priya' ? 'q34' : 'q34r') => K[w].L.push([t, l, view]);
  const DEADPAN = { eyes: { open: 0.55, lid: 6 }, brows: { y: -0.1 }, mouth: { curve: -0.05, w: 0.7 } };
  // Priya
  pk('priya', 0, 'proud', 0); xk('priya', 0, 'proud'); lk('priya', 0, [0.35, -0.35], 'front');
  pk('priya', S.p1a.at - 0.06, 'face', 0); xk('priya', S.p1a.at - 0.06, 'sad'); lk('priya', S.p1a.at - 0.06, [0.6, 0]);
  pk('priya', S.p2a.at - 0.05, 'one', 0.18, 'spring'); xk('priya', S.p2a.at - 0.05, 'proud'); lk('priya', S.p2a.at - 0.05, [0.2, 0], 'front');
  pk('priya', S.p2b.at - 0.04, 'two', 0.18, 'spring');
  pk('priya', S.p2c.at - 0.05, 'two', 0); xk('priya', S.p2c.at - 0.05, 'concerned'); lk('priya', S.p2c.at - 0.05, [0.5, 0.3]); lk('priya', S.p2c.at + 0.5, [0.6, 0]);
  pk('priya', S.p2d.at - 0.05, 'drop', 0); xk('priya', S.p2d.at - 0.05, { eyes: { open: 1.15, pupil: 0.55 }, brows: { y: 0.9 }, mouth: { t: 'wobble', w: 0.55 } }); lk('priya', S.p2d.at - 0.05, [0, 0], 'front');
  pk('priya', S.j4.at - 0.06, 'rest', 0); xk('priya', S.j4.at - 0.06, 'listening'); lk('priya', S.j4.at - 0.06, [0.6, 0]);
  pk('priya', S.p5.at - 0.05, 'huh', 0.16, 'spring'); xk('priya', S.p5.at - 0.05, 'confused');
  pk('priya', S.j5b.at, 'rest', 0.3); xk('priya', S.j5b.at, 'listening');
  xk('priya', S.j5d.at, 'concerned');
  pk('priya', S.p6.at - 0.08, 'rest', 0); xk('priya', S.p6.at - 0.08, 'annoyed'); lk('priya', S.p6.at - 0.08, [0, 0], 'front');
  lk('priya', S.j6.at, [0.6, 0]); xk('priya', c.tato + 0.1, 'surprised'); lk('priya', c.tato + 0.15, [0.75, 0.5]);
  pk('priya', c.phoneEnd, 'cheer', 0.16, 'spring'); xk('priya', c.phoneEnd, 'excited'); lk('priya', c.phoneEnd, [0, 0], 'front');
  pk('priya', S.j7.at - 0.06, 'rest', 0.4); xk('priya', S.j7.at - 0.06, 'laugh'); lk('priya', S.j7.at - 0.06, [0.6, 0]);
  // June
  pk('june', 0, 'rest', 0); xk('june', 0, 'listening'); lk('june', 0, [-0.6, 0]);
  pk('june', c.flashEnd, 'rest', 0); xk('june', c.flashEnd, DEADPAN); lk('june', c.flashEnd, [0, 0], 'front');
  lk('june', S.p1a.at - 0.06, [-0.6, 0]); pk('june', S.p1a.at - 0.06, 'sip', 0); xk('june', S.p1a.at - 0.06, 'neutral');
  pk('june', S.p2a.at, 'rest', 0.35);
  pk('june', S.j4.at - 0.06, 'phone', 0.26, 'spring'); xk('june', S.j4.at - 0.06, 'smallSmile');
  pk('june', S.j5c.at - 0.05, 'rest', 0); xk('june', S.j5c.at - 0.05, 'neutral');
  pk('june', S.j6.at - 0.08, 'rest', 0); xk('june', S.j6.at - 0.08, 'smallSmile');
  pk('june', c.tato + 0.2, 'sip', 0.3);
  pk('june', c.phoneEnd, 'rest', 0); xk('june', c.phoneEnd, 'smallSmile'); lk('june', c.phoneEnd, [-0.6, 0]);
  xk('june', S.j7.at - 0.06, 'proud'); pk('june', S.j7.end + 0.06, 'sip', 0.28);
  pk('june', S.j8a.at - 0.1, 'rest', 0); xk('june', S.j8a.at - 0.1, 'smallSmile'); lk('june', S.j8a.at - 0.1, [0, 0], 'front');
  xk('june', S.j2.at - 0.08, { eyes: { open: 0.75, low: 0.2 }, brows: { y: 0.35, rot: -6 }, mouth: { curve: 0.55, w: 0.8, asym: 0.4 } });
  for (const w of ['priya', 'june']) for (const L of Object.values(K[w])) L.sort((a, b) => a[0] - b[0]);
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
  const BLINK = { priya: [1.9, 6.1, 11.6, 15.2, 20.4, 24.9, 29.3, 32.0], june: [2.9, 5.2, 9.0, 13.9, 17.4, 22.6, 27.8, 31.4] };
  function draw(w, t) {
    const X = K[w].X; const expr = X[lastIdx(X, t)][1];
    const exprCurve = (typeof expr === 'string' ? EXPRESSIONS[expr]?.mouth?.curve : expr.mouth?.curve) ?? 0.1;
    const sg = segs.find((s) => s.who === w && t >= s.at - 0.04 && t <= s.end + 0.06);
    const { look, view } = lookOf(w, t);
    const ov = { eyes: { look: look.map((x) => +x.toFixed(3)) } };
    let lvl = 0, nod = 0, gest = 0;
    if (sg) {
      const m = residentMouth(sg.voice, sg.at, t, 0.95);
      if (m && m.t !== 'line') ov.mouth = { ...m, curve: Math.max(m.curve ?? 0, exprCurve * 0.6) };
      for (let k = -4; k <= 4; k++) lvl += envAt(sg.voice, t - sg.at + sg.a + k * 0.05) / 9;
      const u = (t - sg.words[0].t) / 0.45;
      if (u > 0 && u < 1) { const b = Math.sin(Math.PI * u); nod += 2 * b; gest += 4 * b; }
    }
    // a June tomando café: a boca fica fechada atrás da caneca
    if (w === 'june' && armOf('june', t, 'armL')[1] < -160) delete ov.mouth;
    const g = (a) => (a[2] === 'rest' ? a : [a[0], +(a[1] + gest).toFixed(2), a[2], a[3]]);
    const clean = (a) => a.filter((x) => x !== undefined).map((x) => (typeof x === 'number' ? +x.toFixed(2) : x));
    const ph = w === 'priya' ? 0 : 1.7;
    // o pulinho do "Amiga!" (gesto grande: aqui o corpo pode sair do chão)
    const hop = w === 'priya' && t > c.phoneEnd && t < c.phoneEnd + 0.5 ? 26 * Math.sin(Math.PI * (t - c.phoneEnd) / 0.5) : 0;
    const pose = {
      armL: clean(g(armOf(w, t, 'armL'))), armR: clean(g(armOf(w, t, 'armR'))),
      body: { rot: +(0.6 * Math.sin(t * 2 * Math.PI * 0.17 + ph)).toFixed(2), dy: +(-0.8 * lvl - 0.4 * Math.sin(t * 2 * Math.PI * 0.23 + ph) - hop).toFixed(2) },
      head: { nod: +nod.toFixed(2) },
    };
    const o = { pose, expr, overlay: ov, blink: BLINK[w].some((b) => t >= b && t < b + 0.12), view, headExtra: +(1.6 * Math.sin(t * 2 * Math.PI * 0.11 + ph)).toFixed(2) };
    const key = JSON.stringify(o);
    if (key !== box[w].dataset.k) { box[w].dataset.k = key; box[w].innerHTML = renderCharacter(DES[w], o).replace('<svg ', '<svg width="100%" height="100%" style="display:block;overflow:visible" '); }
  }

  // ------------------------------------------------------------ o Tato na mesa
  tato.bake({
    seed: 13, marks: false,
    moods: [[0, 'idle'], [c.tato, 'greeting', { markAlpha: 0 }], [c.tato + 0.7, 'cheeky', { markAlpha: 0 }], [c.phoneEnd, 'celebrating', { markAlpha: 0, spark: 0.7 }], [S.j8a.at, 'encouraging', { markAlpha: 0, arm: 90 }], [S.j2.at, 'cheeky', { markAlpha: 0 }]],
    gestures: [[c.tato + 0.3, 'wave'], [c.phoneEnd + 0.05, 'cheer']],
    blinks: [c.tato + 0.9, c.phoneEnd + 1.2, S.j8a.at + 1.1], speech: [],
  }, duration);
  const TATO = { x: 548, y: TABLE_Y + 8, h: 300 };
  const tatoU = (t) => (t - c.tato) / 0.5;
  const tatoY = (t) => { if (t < c.tato) return TATO.y + 420; const u = tatoU(t); return TATO.y + 420 * (u >= 1 ? 0 : Math.exp(-5.2 * u) * Math.cos(9.5 * u)); };

  // ------------------------------------------------------------ planos
  const shots = [
    ['bar', 0, c.flash, 'P_XCU', { creep: 0.05 }],
    ['flash', c.flash, c.flashEnd],
    ['bar', c.flashEnd, S.p1a.at - 0.06, 'J_XCU', { bump: c.flashEnd }],
    ['bar', S.p1a.at - 0.06, S.p2a.at - 0.05, 'P_MED'],
    ['bar', S.p2a.at - 0.05, S.p2c.at - 0.05, 'P_CUF'],
    ['bar', S.p2c.at - 0.05, S.p2d.at - 0.05, 'TWO'],
    ['bar', S.p2d.at - 0.05, S.j4.at - 0.06, 'P_XCU', { creep: 0.08 }],
    ['bar', S.j4.at - 0.06, S.p5.at - 0.05, 'J_MED'],
    ['bar', S.p5.at - 0.05, S.j5b.at - 0.05, 'P_CU', { bump: S.p5.at - 0.05, amp: 0.035 }],
    ['bar', S.j5b.at - 0.05, S.j5c.at - 0.05, 'TWO'],
    ['bar', S.j5c.at - 0.05, S.p6.at - 0.08, 'J_CU', { creep: 0.05 }],
    ['bar', S.p6.at - 0.08, S.j6.at - 0.08, 'P_CUF', { creep: 0.06, bump: S.p6.at - 0.08, amp: 0.04 }],
    ['bar', S.j6.at - 0.08, c.tato, 'J_CU'],
    ['bar', c.tato, c.phone, 'TWO', { bump: c.tato + 0.16, amp: 0.03 }],
    ['phone', c.phone, c.phoneEnd],
    ['bar', c.phoneEnd, S.p9b.at - 0.05, 'TWO', { bump: c.phoneEnd, shake: c.phoneEnd }],
    ['bar', S.p9b.at - 0.05, S.j7.at - 0.06, 'P_CUF'],
    ['bar', S.j7.at - 0.06, S.j8a.at - 0.1, 'J_CU'],
    ['bar', S.j8a.at - 0.1, S.j2.at - 0.08, 'J_MEDF', { creep: 0.04, bump: S.j8b.at - 0.02, amp: 0.04 }],
    ['bar', S.j2.at - 0.08, duration + 1, 'J_XCUF', { creep: 0.1 }],
  ].map(([kind, t0, t1, frame, o = {}]) => ({ kind, t0, t1, frame, ...o }));
  // o "Amiga." seco da abertura treme a câmera (com o "tum")
  shots[2].shake = c.flashEnd;
  const shotAt = (t) => shots.find((s) => t >= s.t0 && t < s.t1) || shots[shots.length - 1];
  function camAt(t, sh) {
    const f = FR[sh.frame], u = clamp(inv(sh.t0, sh.t1, t));
    // tranco de zoom na piada: entra 7 % maior e assenta em 0,3 s
    const kb = sh.bump != null && t >= sh.bump ? (sh.amp ?? 0.07) * Math.exp(-(t - sh.bump) * 9) : 0;
    const push = (1 + (sh.creep ?? 0.03) * E.inOut(u)) * (1 + kb);
    const ey = sh.frame.startsWith('P') ? CH.priya.eye : sh.frame.startsWith('J') ? CH.june.eye : f.cy;
    return { s: f.s * push, cx: f.cx, cy: f.cy + (ey - f.cy) * (1 - 1 / push) };
  }
  const shake = (t, sh) => { if (sh.shake == null || t < sh.shake) return [0, 0]; const k = t - sh.shake, a = 14 * Math.exp(-k * 11); return [a * Math.sin(k * 71), a * Math.cos(k * 59)]; };
  const hand = (t) => ({ x: 4 * Math.sin(t * 2 * Math.PI * 0.13), y: 3 * Math.sin(t * 2 * Math.PI * 0.11 + 2), r: 0.15 * Math.sin(t * 2 * Math.PI * 0.09 + 0.5) });
  const phoneCam = (t) => {
    const k1 = E.inOut(clamp(inv(S.p7a.at - 0.05, S.p7a.at + 0.32, t))), k2 = E.inOut(clamp(inv(c.said - 0.05, c.said + 0.32, t)));
    return lerp(lerp(FQ.cy, FD.cy, k1), FE.cy, k2);
  };
  const npcFrame = (t) => {
    const v = V.lines.soraAsk, speaking = t >= c.sora - 0.06 && t < c.soraEnd + 0.1, e = {};
    const mouth = residentMouth(v, c.sora, t, 0.85); if (mouth) e.mouth = mouth;
    const raise = pulse(t, c.soraEnd - 0.25, c.soraEnd + 0.9, 0.12, 0.35); if (raise > 0.01) e.brows = { y: 0.5 * raise };
    e.head = { nod: t > c.said ? Math.sin(clamp(inv(c.said, c.said + 0.6, t)) * Math.PI) * 5 : 0, rot: speaking ? 0 : 3 };
    const blink = [c.sora - 0.4, c.soraEnd + 0.7, c.hint + 0.6].some((b) => t >= b && t < b + 0.13);
    const b = (Math.sin(t / 3.8 * Math.PI * 2) + 1) / 2;
    return { npc: { pose: speaking ? 'speak' : 'listen', expr: speaking || t > c.said ? 'smallSmile' : 'listening', overlay: e, blink, view: 'front' }, npcBreath: `scale(${(1 + 0.006 * b).toFixed(4)}, ${(1 + 0.012 * b).toFixed(4)})` };
  };
  function stageFrame(t) {
    const helpOpen = t >= c.hint && t < c.said ? 1 : 0;
    const phase = t >= c.sora - 0.05 && t < c.soraEnd ? 'speaking' : t >= c.said ? 'processing' : 'listening';
    const kO = E.out(clamp(inv(c.hint, c.hint + 0.3, t))), kC = E.out(clamp(inv(c.said, c.said + 0.3, t)));
    const sg = [S.p7a, S.p7b, S.p8].find((s) => t >= s.at - 0.04 && t <= s.end + 0.06);
    const lv = sg ? envAt(sg.voice, t - sg.at + sg.a) : 0;
    const tapK = t >= c.tap - 0.05 && t <= c.tap + 0.45 ? inv(c.tap - 0.05, c.tap + 0.45, t) : 0;
    stage.frame({
      t, phase, turn: 3, beatsDone: t >= c.said ? 4 : 3, spoken: 'For here or to go?', clock: `0:${String(Math.min(59, 5 + Math.floor(Math.max(0, t - c.phone)))).padStart(2, '0')}`,
      captionPop: t < c.soraEnd ? inv(c.sora - 0.02, c.sora + 0.26, t) : 1,
      hintsShown: helpOpen, dockDelta: helpOpen ? (dockHs[0] - dockHs[1]) * (1 - kO) : t >= c.said ? (dockHs[1] - dockHs[0]) * (1 - kC) : 0, rungPop: helpOpen ? inv(c.hint, c.hint + 0.28, t) : null,
      voiceLevel: lv, status: phase === 'listening' ? 'Fale em inglês, do seu jeito.' : '',
      said: t >= c.said ? 'To go, please!' : '', saidPop: inv(c.said, c.said + 0.28, t),
      chip: t >= c.said ? 'Entendido' : '', chipPop: inv(c.said + 0.06, c.said + 0.36, t),
      guideSay: t >= c.said ? 'Boa! Sora entendeu.' : '', guideBubble: t >= c.said ? 1 : 0, guideBubblePop: t >= c.said ? inv(c.said + 0.1, c.said + 0.4, t) : null,
      show: { top: 1, line: 1, you: 1, dock: 1, shade: 1 }, tato: guide.pose(t), ...npcFrame(t),
      wave: '', uh: null, tap: tapK ? { sel: '.pv2-hint', k: tapK } : null,
      hintPress: pulse(t, c.tap - 0.02, c.tap + 0.16, 0.06, 0.1), micPress: 0, result: 0, resultPop: 0,
    });
  }

  // ------------------------------------------------------------ quadro
  const capCache = { i: -2, cur: -2 };
  function render(t) {
    const sh = shotAt(t), inBar = sh.kind === 'bar', inFlash = sh.kind === 'flash', inPhone = sh.kind === 'phone';
    fade(roomL, inBar ? 1 : 0); fade(worldL, inBar ? 1 : 0);
    if (inBar) {
      const cm = camAt(t, sh), hd = hand(t), [sx, sy] = shake(t, sh);
      const tw = `translate(${(540 + hd.x + sx).toFixed(2)}px, ${(960 + hd.y + sy).toFixed(2)}px) rotate(${hd.r.toFixed(3)}deg) scale(${cm.s.toFixed(5)}) translate(${(-cm.cx).toFixed(2)}px, ${(-cm.cy).toFixed(2)}px)`;
      if (worldL.style.transform !== tw) worldL.style.transform = tw;
      const rs = 0.8 * cm.s, rcx = BAR.cx + (cm.cx - 540) / 0.8, rcy = BAR.cy + (cm.cy - 960) / 0.8;
      const tr = `translate(${(540 + 0.6 * (hd.x + sx)).toFixed(2)}px, ${(960 + 0.6 * (hd.y + sy)).toFixed(2)}px) rotate(${hd.r.toFixed(3)}deg) scale(${rs.toFixed(5)}) translate(${(-rcx).toFixed(2)}px, ${(-rcy).toFixed(2)}px)`;
      if (roomL.style.transform !== tr) roomL.style.transform = tr;
      draw('priya', t); draw('june', t);
      tato.frame(t, { x: TATO.x, y: tatoY(t), h: TATO.h, o: t >= c.tato ? 1 : 0 });
      // sobe de trás do tampo (recorte abaixo da borda) e estica/amassa na mola
      const ty = tatoY(t), top = ty - TATO.h * (207 / 220), cut = Math.max(0, top + TATO.h - (TABLE_Y + 6));
      tato.n.style.clipPath = `inset(-40px -40px ${cut.toFixed(1)}px -40px)`;
      const u = tatoU(t), sq = t >= c.tato && u < 1.4 ? 0.12 * Math.exp(-3.6 * u) * Math.sin(9.5 * u) : 0;
      tato.n.style.transform = `scale(${(1 - sq).toFixed(4)}, ${(1 + sq).toFixed(4)})`;
    }
    // linhas de foco: o orgulho da abertura e o "Amiga." seco
    const fk = Math.max(pulse(t, -1, c.flash, 0.01, 0.02), pulse(t, c.flashEnd, S.j3.end + 0.2, 0.04, 0.2));
    fade(focus, fk * 0.72);
    if (fk > 0) css(focus, { transform: `rotate(${(Math.floor(t * 8) % 2 ? 1 : -1).toFixed(1)}deg) scale(1.05)`, transformOrigin: '50% 40%' });
    // a tela "trava" no "trava tudo": faixas que pulam de lugar e a imagem que treme em degraus
    const gk = t >= c.glitch && t < c.glitch + 0.34 ? 1 : 0;
    fade(glitch, gk ? 0.85 : 0);
    if (gk) { const step = Math.floor((t - c.glitch) * 30); css(glitch, { transform: `translate(${((step * 37) % 23 - 11).toFixed(0)}px, ${((step * 53) % 140 - 70).toFixed(0)}px)` }); css(scene, { filter: `hue-rotate(${((step % 3) * 40 - 40).toFixed(0)}deg) saturate(1.25)` }); }
    else if (scene.style.filter) scene.style.filter = '';
    // confete
    const ck = t - S.p9a.at; fade(confetti, inBar && ck > 0 && ck < 2.2 ? 1 : 0);
    if (ck > 0 && ck < 2.2) CONF.forEach((p, i) => { const x = p.x0 + p.vx * ck * 0.6, y = p.y0 + p.vy * ck + 1500 * ck * ck; css(confEls[i], { transform: `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${(p.spin * ck).toFixed(1)}deg)`, opacity: String(+Math.min(1, (2.2 - ck) * 2).toFixed(3)) }); });
    // flashback: clarão na entrada e leve balanço de filme antigo
    fade(flash, inFlash ? 1 : 0);
    if (inFlash) { const u = t - c.flash; css(flash, { transform: `scale(${(1.04 + 0.03 * clamp(u / 1.2)).toFixed(4)}) rotate(${(0.6 * Math.sin(u * 9)).toFixed(2)}deg)`, transformOrigin: '50% 50%', filter: `sepia(.35) saturate(.85) brightness(${(1 + 0.7 * Math.exp(-u * 16)).toFixed(3)})` }); }
    // celular
    for (const n of [phoneBg, phone, thumb, demo]) fade(n, inPhone ? 1 : 0);
    if (inPhone) {
      stageFrame(t);
      const cy = phoneCam(t);
      const v = `translate(${(SW / 2).toFixed(2)}px, ${(SH / 2).toFixed(2)}px) scale(${cs.toFixed(5)}) translate(${(-VW / 2).toFixed(2)}px, ${(-cy).toFixed(2)}px)`;
      if (sw.style.transform !== v) sw.style.transform = v;
      const k = E.out(clamp(inv(c.phone, c.phone + 0.22, t)));
      const fl = 6 * Math.sin((t - c.phone) * 2 * Math.PI * 0.4);
      css(phone, { transform: `translateY(${((1 - k) * 300 + fl).toFixed(1)}px) rotate(${(-1.5 + (1 - k) * 4).toFixed(2)}deg)` });
      css(thumb, { transform: `translateY(${((1 - k) * 300 + fl).toFixed(1)}px)` });
      css(demo, { left: PH.x + 10, top: PH.y - 56 });
    }
    fade(trans, inPhone ? pulse(t, c.sora + 0.25, S.p7a.at - 0.05, 0.18, 0.1) : 0);
    // adesivos
    const s = (n, t0, t1, x, y, rot = 0, sc = 1) => stick(n, t, t0, t1, { x, y, rot, s: sc });
    s(st.hook, -1, c.hookEnd, 540, 352, -2);
    s(st.skull, S.j3.at + 0.02, S.p1a.at - 0.1, 830, 560, 10);
    s(st.tease, c.hookEnd + 0.25, S.p2d.at - 0.1, 540, 300, 0, 0.95);
    s(st.error, c.glitch + 0.1, S.j4.at - 0.1, 540, 480, -2);
    s(st.potato, S.p6.words[1].t - 0.02, S.j6.at - 0.1, 830, 430, 8);
    s(st.confia, S.j6.at + 0.03, c.tato - 0.02, 300, 430, -6);
    s(st.falei, S.p9a.at + 0.05, S.j7.at - 0.1, 540, 400, -4);
    s(st.url, S.j8a.at, duration + 1, 540, 318, -2, 1 - 0.12 * E.inOut(clamp(inv(S.j2.at - 0.08, S.j2.at + 0.2, t))));
    s(st.tag, S.j8b.at, S.j2.at - 0.12, 540, 1010, 2, 0.92);
    s(st.fine, S.j8a.at + 0.3, duration + 1, 540, 412, 0, 0.9);
    // legenda (escondida no quadro-negro: a frase já está escrita nele)
    let pi = -1; for (let i = 0; i < PAGES.length; i++) if (t >= PAGES[i].start && t < PAGES[i].end) { pi = i; break; }
    const hideCap = inFlash;
    if (pi < 0 || hideCap) { fade(cap, 0); capCache.i = -1; }
    else {
      const pg = PAGES[pi], col = HI[pg.words[0].who] || '#F8C637';
      if (capCache.i !== pi) { capCache.i = pi; capCache.cur = -2; cap.innerHTML = pg.words.map((x, i) => `<span data-i="${i}">${x.w}</span>`).join(' '); }
      let cur = -1; pg.words.forEach((x, i) => { if (t >= x.t - 0.03) cur = i; });
      if (capCache.cur !== cur) { capCache.cur = cur; cap.querySelectorAll('span').forEach((n, i) => { n.style.color = i === cur ? col : '#FFFDF7'; }); }
      const k = E.out(clamp(inv(pg.start, pg.start + 0.1, t)));
      fade(cap, 1); css(cap, { transform: `translate(-50%, -50%) scale(${(0.88 + 0.12 * k).toFixed(4)})` });
    }
  }
  // desfoque de movimento só onde há movimento, e nunca num quadro cuja janela de captura cruze um
  // corte (somaria os dois planos: quadro "fantasma" com dois rostos)
  const CUTS = shots.map((x) => x.t0).filter((x) => x > 0);
  const samples = (t) => {
    if (CUTS.some((x) => Math.abs(t - x) < 0.02)) return 1;
    const near = (a, w0) => a != null && t > a && t < a + w0;
    if (near(c.flashEnd, 0.35) || near(c.tato, 0.6) || near(c.phone, 0.3) || near(S.p9a.at, 1.2) || near(c.glitch, 0.36) || near(S.p6.at - 0.08, 0.3) || near(S.p5.at - 0.05, 0.3)) return [8, 0.5];
    return 1;
  };
  return { duration, cues: c, captions, audio: A.items, samples, render, hook: { title: '7 anos de inglês na escola… e eu só sei falar isso:' }, safe: [120, 270, 960, 1248], async ready() { return true; } };
}

// ------------------------------------------------------------------ peças auxiliares
/** SVG → imagem (PNG em data URL), com desfoque leve de profundidade. */
async function rasterize(svg, w, h, blur = 0) {
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  const img = new Image(); img.src = url; await img.decode();
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); if (blur) g.filter = `blur(${blur}px)`; g.drawImage(img, 0, 0); URL.revokeObjectURL(url);
  const out = c.toDataURL('image/png'); c.width = c.height = 1;
  return out;
}
/** Faixas de falha digital (tela travando): retângulos finos em ciano e magenta, sem semente de tempo. */
function glitchBars() {
  let k = 17; const r = () => { k = (k * 9301 + 49297) % 233280; return k / 233280; };
  let s = '';
  for (let i = 0; i < 14; i++) { const y = r() * 1920, h = 8 + r() * 46, x = r() * 300 - 150, w = 600 + r() * 900; s += `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${w.toFixed(0)}" height="${h.toFixed(0)}" fill="${i % 2 ? '#00F0FF' : '#FF2BD6'}" opacity="${(0.25 + r() * 0.35).toFixed(2)}"/>`; }
  return `<svg width="1080" height="1920" viewBox="0 0 1080 1920" style="display:block">${s}</svg>`;
}
/** O quadro-negro com a frase em giz (várias passadas com deslocamento: textura de giz). */
async function chalkBoard() {
  const url = URL.createObjectURL(new Blob([boardSVG()], { type: 'image/svg+xml' }));
  const img = new Image(); img.src = url; await img.decode();
  const c = document.createElement('canvas'); c.width = 1080; c.height = 1920;
  const g = c.getContext('2d'); g.drawImage(img, 0, 0); URL.revokeObjectURL(url);
  await document.fonts.load('600 96px Fredoka');
  let k = 3; const r = () => { k = (k * 9301 + 49297) % 233280; return k / 233280; };
  const chalk = (text, x, y, size, rot = 0, alpha = 0.9) => {
    g.save(); g.translate(x, y); g.rotate(rot * Math.PI / 180); g.font = `600 ${size}px Fredoka`; g.textAlign = 'center'; g.textBaseline = 'middle';
    for (let i = 0; i < 7; i++) { g.globalAlpha = alpha * (i ? 0.16 : 0.75); g.fillStyle = '#F4F1E6'; g.fillText(text, (r() - 0.5) * 3.2, (r() - 0.5) * 3.2); }
    g.restore();
  };
  chalk('The book is', 540, 600, 100, -2);
  chalk('on the table.', 540, 730, 100, -1.5);
  chalk('Monday', 860, 420, 40, 0, 0.7);
  chalk('6º ano B', 220, 420, 40, 0, 0.7);
  const out = c.toDataURL('image/png'); c.width = c.height = 1;
  return out;
}
