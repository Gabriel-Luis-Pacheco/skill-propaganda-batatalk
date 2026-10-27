// QUIZ 9:16 (TikTok/Reels, ~24 s): "Responde em 3 segundos" — três níveis (café, aeroporto,
// entrevista) com cronômetro. O espectador tenta responder em voz alta; o nível 3 não tem
// resposta pronta (vai para os comentários) e o Tato entra com a ajuda. O fim volta ao quadro 0
// para o vídeo rodar em loop. Palcos = UI real da prática (Exemplo animado); vozes = as finais.
import { E, clamp, lerp, inv, pulse, el, css, fade, camTrack, applyCamera, TatoActor, AudioList, Stage, tatoSpeech } from './kit.js';
import { residentMouth } from '../core/visemes.js';
import { bakeTato } from '../core/tato-motor.js';

export async function create(ctx) {
  const { W, H, overlay, voices: V } = ctx;
  const A = new AudioList();
  const d = (id) => V.lines[id].off - V.lines[id].on;
  const CD = 3.0;   // o cronômetro: 3 s de verdade

  // ------------------------------------------------------------ tempos
  const c = {};
  c.q1 = 0.15; c.q1End = c.q1 + d('soraAsk');
  c.cd1 = c.q1End + 0.22; c.ans1 = c.cd1 + CD;
  c.toGo = c.ans1 + 0.12; c.toGoEnd = c.toGo + d('learnerToGo');
  c.sw2 = c.toGoEnd + 0.25;                       // chicote para o aeroporto
  c.q2 = c.sw2 + 0.5; c.q2End = c.q2 + d('evelynAsk');
  c.cd2 = c.q2End + 0.22; c.ans2 = c.cd2 + CD;
  c.sw3 = c.ans2 + 1.45;                          // chicote para a entrevista
  c.q3 = c.sw3 + 0.5; c.q3End = c.q3 + d('priyaAsk');
  c.cd3 = c.q3End + 0.22; c.time3 = c.cd3 + CD;
  c.tato = c.time3 + 0.3; c.tatoLine = c.tato + 0.25; c.tatoLineEnd = c.tatoLine + d('tatoTravou');
  c.endCard = c.tatoLineEnd + 0.55;
  c.bora = c.endCard + 1.9; c.boraEnd = c.bora + d('tatoBora');
  const duration = +(c.boraEnd + 0.75).toFixed(3);
  c.loop = duration - 0.4;                        // volta ao quadro 0
  c.duration = duration;
  const WHIP = 0.42;

  // ------------------------------------------------------------ som
  A.voice('soraAsk', c.q1, V);
  A.voice('learnerToGo', c.toGo, V);
  A.voice('evelynAsk', c.q2, V);
  A.voice('priyaAsk', c.q3, V);
  A.voice('tatoTravou', c.tatoLine, V);
  A.voice('tatoBora', c.bora, V);
  A.cue('ambience', 0, { until: c.sw2 + 0.3 });
  const drops = [[c.cd1 - 0.05, c.ans1], [c.cd2 - 0.05, c.ans2], [c.cd3 - 0.05, c.time3]];
  A.cue('music', 0, { sections: [[0, 'quiz'], [c.endCard, 'end'], [duration, 'out']], drops, bpm: 118 });
  for (const [a] of drops) for (let k = 0; k < 3; k++) A.sfx(k === 2 ? 'tock' : 'tick', a + 0.05 + k, { gain: 0.55 });
  A.sfx('chip', c.ans1 + 0.02, { gain: 0.55 }); A.sfx('chip', c.ans2 + 0.02, { gain: 0.55 });
  A.sfx('buzz', c.time3, { gain: 0.5 });
  A.sfx('swoop', c.sw2 - 0.1, { gain: 0.6 }); A.sfx('swoop', c.sw3 - 0.1, { gain: 0.6 });
  A.sfx('pop', c.sw2 + WHIP, { gain: 0.4 }); A.sfx('pop', c.sw3 + WHIP, { gain: 0.4 });
  A.sfx('pop', c.tato, { gain: 0.45 });
  A.sfx('motif-end', c.endCard + 0.2);

  const captions = [
    { start: c.q1, end: c.q1End, who: 'Sora', text: V.lines.soraAsk.text, lang: 'en' },
    { start: c.toGo, end: c.toGoEnd, who: 'Você', text: V.lines.learnerToGo.text, lang: 'en' },
    { start: c.q2, end: c.q2End, who: 'Evelyn', text: V.lines.evelynAsk.text, lang: 'en' },
    { start: c.q3, end: c.q3End, who: 'Priya', text: V.lines.priyaAsk.text, lang: 'en' },
    { start: c.tatoLine, end: c.tatoLineEnd, who: 'Tato', text: V.lines.tatoTravou.text, lang: 'pt', inScene: true },
    { start: c.bora, end: c.boraEnd, who: 'Tato', text: V.lines.tatoBora.text, lang: 'pt', inScene: true },
  ];

  // ------------------------------------------------------------ palcos (UI real) num cartão
  const CARD = { x: 120, y: 640, w: 840, h: 575 };
  const card = el(overlay, 'div', '', '', { position: 'absolute', left: `${CARD.x}px`, top: `${CARD.y}px`, width: `${CARD.w}px`, height: `${CARD.h}px`, borderRadius: '44px', overflow: 'hidden', background: 'var(--cream)', boxShadow: '0 40px 80px -36px rgba(20,36,28,.55), 0 0 0 10px var(--paper)' });
  const sw = el(card, 'div', '', '', { position: 'absolute', left: '0px', top: '0px', transformOrigin: '0 0' });
  const VW = 390, VH = 693, GAP = 24;
  const LEVELS = [
    { ci: 1, pi: 0, turn: 3, q: 'soraAsk', at: c.q1, name: 'CAFÉ', head: 'Responde em <em>3 segundos</em> ⏱️', ans: 'To go, please.', tr: 'pra levar' },
    { ci: 4, pi: 1, turn: 1, q: 'evelynAsk', at: c.q2, name: 'AEROPORTO', head: 'Agora no <em>aeroporto</em> ✈️', ans: 'For two weeks.', tr: 'por duas semanas' },
    { ci: 6, pi: 0, turn: 0, q: 'priyaAsk', at: c.q3, name: 'ENTREVISTA', head: 'Último nível: <em>entrevista</em> 💼', ans: null },
  ];
  const stages = LEVELS.map((L, i) => new Stage(sw, { ci: L.ci, pi: L.pi, turn: L.turn, vw: VW, vh: VH, x: i * (VW + GAP), y: 0, cls: 'screen', radius: 0 }));
  await Promise.all(stages.map((s) => s.ready()));
  // enquadramento: do alto da cabeça do morador até o topo do dock (o rosto inteiro, o corpo e o
  // Tato-guia); a pergunta vai num balão grande fora do cartão — a do app fica pequena no celular
  const s = CARD.w / VW, visH = CARD.h / s;
  const frames = stages.map((st, i) => {
    st.frame({ phase: 'speaking', spoken: V.lines[LEVELS[i].q].text, show: { top: 1, line: 1, you: 0, dock: 1, shade: 1 } });
    const npc = st.rect('.pv2-stage [data-npc]') || { y: 211 };
    const top = npc.y - 26;
    return { cx: i * (VW + GAP) + VW / 2, cy: top + visH / 2, s };
  });
  const camKeys = [[0, frames[0]], [c.sw2, frames[0]], [c.sw2 + WHIP, frames[1], E.whip], [c.sw3, frames[1]], [c.sw3 + WHIP, frames[2], E.whip], [c.loop, frames[2]], [c.loop + 0.001, frames[0], () => 1]];
  const cam = camTrack(camKeys);
  // respiro: aproximação lenta durante cada cronômetro (tensão), sem mexer no chicote
  // aproximação contínua em cada nível (já se mexe no quadro 0: o feed decide nos primeiros 2 s);
  // no chicote a escala volta a 1 junto com o movimento
  const ZOOM = 0.12, lvl = [[0, c.sw2], [c.sw2 + WHIP, c.sw3], [c.sw3 + WHIP, c.endCard]];
  const push = (t) => {
    if (t >= c.sw2 && t < c.sw2 + WHIP) return lerp(1 + ZOOM, 1, E.whip(inv(c.sw2, c.sw2 + WHIP, t)));
    if (t >= c.sw3 && t < c.sw3 + WHIP) return lerp(1 + ZOOM, 1, E.whip(inv(c.sw3, c.sw3 + WHIP, t)));
    const [a, b] = lvl.find(([x, y]) => t >= x && t < y) || lvl[2];
    return 1 + ZOOM * clamp(inv(a, b, t));
  };

  // ------------------------------------------------------------ textos e peças
  const cream = el(overlay, 'div', 'layer', '', { width: `${W}px`, height: `${H}px`, background: 'transparent' });
  overlay.prepend(cream);
  const dots = el(overlay, 'div', '', '', { position: 'absolute', left: '540px', top: '300px', transform: 'translateX(-50%)', display: 'flex', gap: '14px', alignItems: 'center', whiteSpace: 'nowrap', font: '700 30px/1 var(--ui)', letterSpacing: '.12em', color: 'var(--forest)' });
  const dotEls = [0, 1, 2].map((i) => el(dots, 'span', '', String(i + 1), { width: '52px', height: '52px', borderRadius: '50%', display: 'grid', placeItems: 'center', background: '#EFE6CF', color: 'var(--forest)', font: '700 28px/1 var(--display)' }));
  const levelName = el(dots, 'span', '', '', { marginLeft: '10px' });
  const heads = LEVELS.map((L) => el(overlay, 'div', '', L.head, { position: 'absolute', left: '540px', top: '356px', transform: 'translateX(-50%)', font: '600 68px/1.04 var(--display)', color: 'var(--forest)', letterSpacing: '-.02em', whiteSpace: 'nowrap', textAlign: 'center' }));
  for (const h of heads) for (const em of h.querySelectorAll('em')) Object.assign(em.style, { fontStyle: 'normal', color: '#8A6400' });
  const comments = el(overlay, 'div', '', 'Essa você responde<br><em>nos comentários 👇</em>', { position: 'absolute', left: '540px', top: '300px', transform: 'translateX(-50%)', font: '600 64px/1.04 var(--display)', color: 'var(--forest)', letterSpacing: '-.02em', whiteSpace: 'nowrap', textAlign: 'center' });
  comments.querySelector('em').style.cssText = 'font-style:normal;color:#8A6400';
  const demo = el(overlay, 'div', 'label-demo', 'Exemplo animado');
  // a pergunta em letra grande (quem fala + o que fala), com rabicho apontando para o cartão
  const WHO = ['SORA · BARISTA', 'EVELYN · IMIGRAÇÃO', 'PRIYA · RECRUTADORA'];
  const bubbles = LEVELS.map((L, i) => {
    const n = el(overlay, 'div', '', `<small style="display:block;font:700 24px/1 var(--ui);letter-spacing:.14em;color:#2E7D4F;margin-bottom:10px">${WHO[i]}</small>${V.lines[L.q].text.split(' ').map((w) => `<span class="kw">${w}</span>`).join(' ')}`, { position: 'absolute', left: '540px', top: '452px', transform: 'translateX(-50%)', width: 'max-content', maxWidth: '840px', padding: '22px 36px 26px', borderRadius: '34px', background: '#FFFDF7', boxShadow: '0 20px 40px -24px rgba(20,36,28,.55)', font: '600 56px/1.08 var(--display)', color: 'var(--forest)', textAlign: 'center', letterSpacing: '-.01em', transformOrigin: '50% 100%' });
    el(n, 'i', '', '', { position: 'absolute', left: '50%', bottom: '-14px', width: '30px', height: '30px', background: '#FFFDF7', transform: 'translateX(-50%) rotate(45deg)', borderRadius: '4px' });
    return n;
  });
  // cronômetro
  const TIMER = { x: 540, y: 1100, r: 96 };
  const timer = el(overlay, 'div', '', '', { position: 'absolute', left: `${TIMER.x - TIMER.r - 18}px`, top: `${TIMER.y - TIMER.r - 18}px`, width: `${(TIMER.r + 18) * 2}px`, height: `${(TIMER.r + 18) * 2}px` });
  const C2 = 2 * Math.PI * TIMER.r;
  timer.innerHTML = `<svg width="${(TIMER.r + 18) * 2}" height="${(TIMER.r + 18) * 2}" viewBox="0 0 ${(TIMER.r + 18) * 2} ${(TIMER.r + 18) * 2}" style="overflow:visible"><circle cx="${TIMER.r + 18}" cy="${TIMER.r + 18}" r="${TIMER.r + 14}" fill="#FFFDF7" style="filter:drop-shadow(0 18px 26px rgba(20,36,28,.35))"/><circle cx="${TIMER.r + 18}" cy="${TIMER.r + 18}" r="${TIMER.r}" fill="none" stroke="#EFE6CF" stroke-width="18"/><circle data-arc cx="${TIMER.r + 18}" cy="${TIMER.r + 18}" r="${TIMER.r}" fill="none" stroke="#F8C637" stroke-width="18" stroke-linecap="round" stroke-dasharray="${C2.toFixed(1)}" transform="rotate(-90 ${TIMER.r + 18} ${TIMER.r + 18})"/><text data-num x="${TIMER.r + 18}" y="${TIMER.r + 18}" text-anchor="middle" dominant-baseline="central" font-family="Fredoka" font-weight="600" font-size="120" fill="#1C3A2B">3</text></svg>`;
  const arc = timer.querySelector('[data-arc]'), num = timer.querySelector('[data-num]');
  // respostas (pílula verde) e "tempo!"
  const answers = LEVELS.map((L) => L.ans ? el(overlay, 'div', '', `<span style="display:grid;place-items:center;width:64px;height:64px;border-radius:50%;background:#2E8B57;color:#fff;font:700 40px/1 var(--ui)">✓</span><span style="display:grid;gap:6px"><b style="font:600 60px/1 var(--display);color:var(--forest)">${L.ans}</b><small style="font:600 30px/1 var(--ui);color:#5B6A5D">(${L.tr})</small></span>`, { position: 'absolute', left: '540px', top: '1060px', display: 'flex', gap: '22px', alignItems: 'center', padding: '24px 40px 24px 26px', borderRadius: '999px', background: '#FFFDF7', boxShadow: '0 24px 44px -22px rgba(20,36,28,.6), 0 0 0 6px #BFE3C9', whiteSpace: 'nowrap', transformOrigin: '50% 50%' }) : null);
  const timeUp = el(overlay, 'div', '', '⏰ TEMPO!', { position: 'absolute', left: '540px', top: '1050px', padding: '20px 40px', borderRadius: '999px', background: '#E5533D', color: '#fff', font: '700 64px/1 var(--display)', letterSpacing: '.02em', whiteSpace: 'nowrap', transformOrigin: '50% 50%', boxShadow: '0 24px 44px -22px rgba(120,30,20,.6)' });
  // Tato (nível 3) e o balão dele
  const tato = new TatoActor(overlay, { id: 'quiz' });
  const say = el(overlay, 'div', 'sub', 'Travou? <span style="color:#F8D66E">O Tato ajuda.</span>');
  // convite final
  const endBox = el(overlay, 'div', 'layer', '', { width: `${W}px`, height: `${H}px` });
  el(endBox, 'div', 'layer', '', { width: `${W}px`, height: `${H}px`, background: 'radial-gradient(circle at 50% 46%, rgba(248,198,55,.30), rgba(248,198,55,0) 36%), var(--cream)' });
  const endBrand = el(endBox, 'div', 'brand', '<img src="/assets/icons/icon-512.png" alt=""><span>BataTalk</span>');
  const endQ = el(endBox, 'div', '', 'Até que nível<br>você chegou?', { position: 'absolute', left: '540px', top: '420px', transform: 'translateX(-50%)', font: '600 86px/1.02 var(--display)', color: 'var(--forest)', letterSpacing: '-.02em', textAlign: 'center', whiteSpace: 'nowrap' });
  const tatoEnd = new TatoActor(endBox, { id: 'quizEnd' });
  const endChip = el(endBox, 'div', '', 'Comenta <b>1</b>, <b>2</b> ou <b>3</b> 👇', { position: 'absolute', left: '540px', top: '1000px', transform: 'translateX(-50%)', padding: '20px 40px 22px', borderRadius: '999px', background: 'var(--butter)', boxShadow: '0 8px 0 var(--butter-deep), 0 24px 40px -18px rgba(120,80,0,.55)', font: '600 60px/1 var(--display)', color: 'var(--forest)', whiteSpace: 'nowrap' });
  const endFine = el(endBox, 'div', 'end__fine', 'Treine essas conversas <b>grátis</b> · <b>batatalk.com.br</b><br>sem cartão · no navegador<br><span class="ai">Vozes geradas por IA</span>', { left: '540px', top: '1118px', transform: 'translateX(-50%)', textAlign: 'center', fontSize: '32px' });

  // ------------------------------------------------------------ atuação
  const npcFrame = (L, t, i) => {
    const v = V.lines[L.q];
    const speaking = t >= L.at - 0.08 && t < L.at + d(L.q) + 0.12;
    const mouth = residentMouth(v, L.at, t, 0.85);
    const e = {};
    if (mouth) e.mouth = mouth;
    const last = v.words.at(-1), qa = L.at + last.t - v.on;
    const cdEnd = [c.ans1, c.ans2, c.time3][i];
    const raise = Math.max(pulse(t, qa - 0.08, L.at + d(L.q) + 0.6, 0.12, 0.35), i === 2 ? pulse(t, cdEnd, cdEnd + 1.6, 0.15, 0.4) * 0.8 : 0);
    if (raise > 0.01) e.brows = { y: 0.55 * raise };
    // esperando a resposta: cabeça levemente inclinada, olhar para "você"
    const waiting = t > L.at + d(L.q) && t < cdEnd + 0.2;
    e.head = { nod: i < 2 && t > cdEnd ? Math.sin(clamp(inv(cdEnd + 0.1, cdEnd + 0.7, t)) * Math.PI) * 5 : 0, rot: waiting ? 3 * E.inOut(inv(L.at + d(L.q), L.at + d(L.q) + 0.5, t)) : 0 };
    const blink = [L.at - 0.6, L.at + d(L.q) + 0.9, cdEnd - 0.9, cdEnd + 0.8].some((b) => t >= b && t < b + 0.13);
    const b = (Math.sin(t / 3.8 * Math.PI * 2 + i) + 1) / 2;
    const pose = speaking ? 'speak' : waiting ? 'wait' : 'listen';
    const expr = speaking ? 'smallSmile' : i < 2 && t > cdEnd ? 'smallSmile' : 'listening';
    return { npc: { pose, expr, overlay: e, blink, view: 'front' }, npcBreath: `scale(${(1 + 0.006 * b).toFixed(4)}, ${(1 + 0.012 * b).toFixed(4)})` };
  };
  const guide = bakeTato({ seed: 21, marks: false, moods: [[0, 'listening', { gaze: -2, markAlpha: 0 }]], gestures: [], blinks: [1.1, 4.4, 8.2, 12.6, 16.1], speech: [] }, duration);
  tato.bake({
    seed: 7, marks: false,
    moods: [[0, 'idle'], [c.tato, 'curious', { markAlpha: 0, gaze: -4 }], [c.tatoLine, 'speaking', { markAlpha: 0, gaze: -3 }], [c.tatoLineEnd, 'encouraging', { markAlpha: 0, arm: 36 }]],
    gestures: [[c.tato, 'hop'], [c.tatoLine + 1.2, 'nod']],
    blinks: [c.tato + 0.9, c.tatoLineEnd + 0.2],
    speech: [{ visemes: tatoSpeech(V.lines.tatoTravou, c.tatoLine) }],
  }, duration);
  tatoEnd.bake({
    seed: 3, marks: false,
    moods: [[0, 'idle'], [c.endCard + 0.1, 'greeting', { markAlpha: 0 }], [c.bora - 0.1, 'speaking', { markAlpha: 0 }], [c.boraEnd + 0.05, 'encouraging', { markAlpha: 0, arm: 40 }]],
    gestures: [[c.endCard + 0.1, 'hop'], [c.boraEnd - 0.2, 'wave']],
    blinks: [c.endCard + 1.2, c.boraEnd + 0.3],
    speech: [{ visemes: tatoSpeech(V.lines.tatoBora, c.bora) }],
  }, duration);

  // ------------------------------------------------------------ quadro
  const levelAt = (t) => (t < c.sw2 + WHIP * 0.5 ? 0 : t < c.sw3 + WHIP * 0.5 ? 1 : 2);
  const loopK = (t) => E.inOut(inv(c.loop, duration, t));   // 0 → 1 nos últimos 0,4 s
  function render(t) {
    const lk = loopK(t), lv = lk > 0 ? 0 : levelAt(t);
    // palcos: todos desenhados a cada quadro (o contrato de tempo do render exige)
    stages.forEach((st, i) => {
      const L = LEVELS[i];
      const speaking = t >= L.at - 0.05 && t < L.at + d(L.q);
      st.frame({ t, phase: speaking ? 'speaking' : 'listening', turn: L.turn, spoken: V.lines[L.q].text, show: { top: 1, line: 1, you: 0, dock: 0, shade: 1 }, guideBubble: 0, guideSay: '', status: 'Fale em inglês, do seu jeito.', tato: guide.pose(t), ...npcFrame(L, lk > 0 ? 0 : t, i) });
    });
    const cm0 = cam(t), cm = { ...cm0, s: cm0.s * (lk > 0 ? 1 : push(t)) };
    // a câmera mira o centro do cartão (não da tela)
    const v = `translate(${(CARD.w / 2).toFixed(2)}px, ${(CARD.h / 2).toFixed(2)}px) scale(${cm.s.toFixed(5)}) translate(${(-cm.cx).toFixed(2)}px, ${(-cm.cy).toFixed(2)}px)`;
    if (sw.style.transform !== v) sw.style.transform = v;
    // topo: níveis e manchete
    dotEls.forEach((n, i) => { const on = i <= lv; const bg = on ? '#F8C637' : '#EFE6CF'; if (n.style.background !== bg) { n.style.background = bg; } css(n, { transform: `scale(${(i === lv ? 1 + 0.18 * pulse(t, [0, c.sw2 + WHIP, c.sw3 + WHIP][i], [0, c.sw2 + WHIP, c.sw3 + WHIP][i] + 0.5, 0.12, 0.3) : 1).toFixed(3)})` }); });
    const nm = `NÍVEL ${lv + 1} DE 3 · ${LEVELS[lv].name}`; if (levelName.textContent !== nm) levelName.textContent = nm;
    const commentsK = lk > 0 ? 0 : pulse(t, c.time3 + 0.35, c.endCard + 0.2, 0.3, 0.25);
    heads.forEach((h, i) => {
      const a = i === 0 ? -1 : [0, c.sw2 + WHIP * 0.5, c.sw3 + WHIP * 0.5][i], b = i === 2 ? c.time3 + 0.3 : [c.sw2 + WHIP * 0.5, c.sw3 + WHIP * 0.5][i];
      const k = i === 0 && lk > 0 ? 1 : pulse(t, a, b, i === 0 ? 0.01 : 0.22, 0.12);
      fade(h, k * (1 - commentsK)); css(h, { transform: `translateX(-50%) translateY(${((1 - E.out(clamp(inv(a, a + 0.3, t)))) * (i ? 26 : 0)).toFixed(1)}px)` });
    });
    fade(comments, commentsK); css(comments, { transform: `translateX(-50%) scale(${((0.94 + 0.06 * E.spring(clamp(inv(c.time3 + 0.35, c.time3 + 0.8, t)))) * (1 + 0.025 * Math.sin(Math.max(0, t - c.time3) * 2 * Math.PI * 1.1))).toFixed(4)})` });
    fade(dots, 1 - commentsK);
    css(demo, { left: CARD.x + 22, top: CARD.y + 22 }); fade(demo, 0.95);
    bubbles.forEach((n, i) => {
      const a = i === 0 ? -1 : [0, c.sw2 + WHIP * 0.5, c.sw3 + WHIP * 0.5][i], b = i === 2 ? c.endCard : [c.sw2 + WHIP * 0.5, c.sw3 + WHIP * 0.5][i];
      const k = i === 0 && lk > 0 ? 1 : pulse(t, a, b, i === 0 ? 0.01 : 0.18, 0.1);
      fade(n, k); css(n, { transform: `translateX(-50%) scale(${(i ? 0.85 + 0.15 * E.spring(clamp(inv(a, a + 0.4, t))) : 1).toFixed(3)})` });
      // karaokê: a palavra acende quando é falada (antes, cinza legível)
      const v = V.lines[LEVELS[i].q];
      n.querySelectorAll('.kw').forEach((w, j) => {
        const at = LEVELS[i].at + (v.words[j]?.t ?? 0) - v.on - 0.04, on = lk > 0 ? 0 : clamp(inv(at, at + 0.12, t));
        const col = on > 0.5 ? '#1C3A2B' : '#8E9A90';
        if (w.style.color !== col) w.style.color = col;
        const sc = `scale(${(1 + 0.08 * pulse(t, at, at + 0.32, 0.08, 0.22)).toFixed(3)})`;
        if (w.style.transform !== sc) { w.style.display = 'inline-block'; w.style.transform = sc; }
      });
    });
    // cronômetro: 3, 2, 1 — o anel esvazia; no último segundo fica vermelho e treme de leve
    const win = lk > 0 ? null : drops.find(([a, b]) => t >= a && t < b + 0.12);
    if (win) {
      const [a, b] = win, k = clamp(inv(a + 0.05, b, t)), n = Math.max(1, 3 - Math.floor((t - a - 0.05) / 1));
      if (num.textContent !== String(n)) num.textContent = String(n);
      arc.setAttribute('stroke-dashoffset', (C2 * k).toFixed(1));
      const hot = n === 1; arc.setAttribute('stroke', hot ? '#E5533D' : '#F8C637');
      const beat = 1 + 0.08 * Math.exp(-((t - a - 0.05) % 1) * 7);
      const shake = hot ? Math.sin(t * 60) * 3 : 0;
      fade(timer, E.out(clamp(inv(a - 0.05, a + 0.2, t))) * (1 - clamp(inv(b, b + 0.12, t))));
      css(timer, { transform: `translateX(${shake.toFixed(2)}px) scale(${beat.toFixed(3)})` });
    } else fade(timer, 0);
    // respostas
    answers.forEach((n, i) => {
      if (!n) return;
      const a = [c.ans1, c.ans2][i], b = [c.sw2, c.sw3][i];
      const k = lk > 0 ? 0 : pulse(t, a, b + 0.1, 0.06, 0.18);
      fade(n, k); css(n, { transform: `translateX(-50%) scale(${(0.7 + 0.3 * E.spring(clamp(inv(a, a + 0.45, t)))).toFixed(3)})` });
    });
    const tu = lk > 0 ? 0 : pulse(t, c.time3, c.tato + 0.45, 0.05, 0.25);
    fade(timeUp, tu); css(timeUp, { transform: `translateX(-50%) scale(${(0.7 + 0.3 * E.spring(clamp(inv(c.time3, c.time3 + 0.4, t)))).toFixed(3)}) rotate(${(-3 * Math.sin(clamp(inv(c.time3, c.time3 + 0.5, t)) * Math.PI * 3)).toFixed(2)}deg)` });
    // Tato do nível 3: entra pela direita, ao pé do cartão; balão acima dele
    const tk = lk > 0 ? 0 : E.out(clamp(inv(c.tato, c.tato + 0.45, t))) * (1 - clamp(inv(c.endCard - 0.1, c.endCard + 0.25, t)));
    tato.frame(t, { x: 790 + (1 - tk) * 260, y: 1236, h: 330, o: tk > 0.001 ? 1 : 0 });
    fade(say, lk > 0 ? 0 : pulse(t, c.tatoLine - 0.05, c.endCard, 0.2, 0.2)); css(say, { top: 1120, left: '440px', fontSize: '46px' });
    // convite: cortina que sobe; no fim, o quadro volta ao começo (loop)
    // entra como cortina de baixo para cima; no loop sai do mesmo jeito, revelando o quadro 0
    const ek = clamp(inv(c.endCard - 0.06, c.endCard, t)) * (lk < 1 ? 1 : 0);
    fade(endBox, ek);
    css(endBox, { clipPath: `inset(${((1 - E.inOut(clamp(inv(c.endCard - 0.05, c.endCard + 0.45, t)))) * 100).toFixed(2)}% 0 ${(lk * 100).toFixed(2)}% 0)` });
    const ip = (x) => E.out(inv(x, x + 0.45, t));
    css(endBrand, { left: 540, top: 300 + (1 - ip(c.endCard + 0.1)) * 18, transform: 'translateX(-50%) scale(.9)' }); fade(endBrand, ip(c.endCard + 0.1));
    css(endQ, { transform: `translateX(-50%) translateY(${((1 - ip(c.endCard + 0.2)) * 24).toFixed(1)}px)` }); fade(endQ, ip(c.endCard + 0.2));
    tatoEnd.frame(t, { x: 540, y: 975, h: 350, o: ek > 0.001 ? 1 : 0 });
    css(endChip, { transform: `translateX(-50%) scale(${((0.8 + 0.2 * E.spring(clamp(inv(c.endCard + 0.5, c.endCard + 0.95, t)))) * (1 + 0.035 * Math.sin(Math.max(0, t - c.endCard - 1) * 2 * Math.PI * 1.2))).toFixed(4)})` }); fade(endChip, ip(c.endCard + 0.5));
    fade(endFine, ip(c.endCard + 0.8));
  }

  const samples = (t) => {
    const whip = [c.sw2, c.sw3].some((a) => t > a - 0.02 && t < a + WHIP + 0.02);
    return whip ? [16, 0.5] : 1;
  };
  window.__debug = { c, frames };
  return { duration, cues: c, captions, audio: A.items, samples, render, hook: { title: 'Responde em 3 segundos' }, safe: [120, 270, 960, 1248], async ready() { return true; } };
}
