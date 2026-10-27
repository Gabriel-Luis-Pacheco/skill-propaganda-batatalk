// CRIADORA 9:16 (TikTok/Reels, ~43 s): a Mina, moradora de Batata City, grava no quarto um vídeo
// apresentando o BataTalk no formato de vlog animado — fala olhando para a câmera, corte seco a
// cada frase, zoom de ênfase, efeitos, cortes para a tela do app (exemplo animado) e o Tato
// pulando para dentro do quarto. Gancho → a história do barista (dez anos de inglês e travou) →
// o produto → grátis → convite. A voz dela é TTS a 1,1× (tools/voice-fast.mjs), cortada nos
// respiros (AudioList.clip); a boca, a cabeça e as mãos andam pelas palavras de cada trecho.
import { E, clamp, lerp, inv, pulse, el, css, fade, TatoActor, AudioList, Stage, tatoSpeech, mapImage } from './kit.js';
import { residentMouth, envAt } from '../core/visemes.js';
import { bakeTato } from '../core/tato-motor.js';
import { renderCharacter, EXPRESSIONS } from '/character-rig.js';
import { DESIGNS } from '/character-designs.js';
import { roomSVG, ROOM } from './room.js';

const SPEED = 1.1, PAD_A = 0.03, PAD_B = 0.07;
// [arquivo, a, b, legenda, (o que ela pronuncia, se a legenda for diferente)] — a e b em segundos
// do arquivo ORIGINAL (o acelerado divide por 1,1); medidos nos trechos com voz de cada take
const SEG = {
  hook1: ['minaHook', 0.04, 0.58, 'Gente.'],
  hook2: ['minaHook', 1.03, 3.73, 'Lançaram um site pra treinar inglês falando…'],
  hook3: ['minaHook', 4.28, 5.51, 'e eu só descubro agora?'],
  dez1: ['minaDezAnos', 0.03, 2.22, 'Dez anos estudando inglês.'],
  dez2: ['minaDezAnos', 2.78, 4.55, 'Entendo série sem legenda.'],
  dez3: ['minaDezAnos', 5.18, 6.70, 'Aí o barista pergunta isso:'],
  pra1: ['minaPraIsso', 0.03, 0.91, 'Dez anos.'],
  pra2: ['minaPraIsso', 1.43, 1.98, 'Pra isso.'],
  tr1: ['minaTreina', 0.02, 1.33, 'No BataTalk'],
  tr2: ['minaTreina', 1.9, 4.19, 'você treina essa conversa antes.'],
  tr3: ['minaTreina', 4.6, 5.46, 'Em voz alta,'],
  tr4: ['minaTreina', 5.81, 6.53, 'com o barista,'],
  trav: ['minaSeTravar', 0.49, 1.36, 'E se travar…'],
  so1: ['minaSopra', 0.01, 1.17, 'Ele sempre aparece.'],
  so2: ['minaSopra', 1.49, 4.21, 'Sopra uma dica, e quem responde é você.'],
  gr1: ['minaGratis', 0.02, 1.77, 'São catorze cidades,'],
  gr2: ['minaGratis', 2.14, 3.59, 'e dá pra começar de graça.'],
  gr3: ['minaGratis', 4.07, 6.31, 'Sem cartão, direto no navegador.'],
  cta1: ['minaCTA', 0.03, 3.35, 'batatalk.com.br', 'Bata Tók ponto com ponto bê erre'],
  cta2: ['minaCTA', 3.92, 5.87, 'Comenta aí a pergunta que te trava.'],
  cta3: ['minaCTA', 6.47, 8.01, 'A minha você já viu.'],
};

// ------------------------------------------------------------------ voz → palavras e boca
const syl = (w) => Math.max(1, (w.normalize('NFD').replace(/[^a-zA-Z]/g, '').toLowerCase().match(/[aeiouy]+/g) || []).length);
/** A fala acelerada: o mesmo take a 1,1× (envelope reamostrado, trechos com voz divididos). */
function fastLine(v, id) {
  const env = [];
  for (let j = 0; j * SPEED <= v.env.length - 1; j++) { const x = j * SPEED, k = Math.floor(x), u = x - k; env.push(v.env[k] * (1 - u) + (v.env[k + 1] ?? v.env[k]) * u); }
  return { ...v, file: `audio/voices/final/fast/${id}.wav`, on: v.on / SPEED, off: v.off / SPEED, spans: v.spans.map(([a, b]) => [a / SPEED, b / SPEED]), env };
}
/** Palavras distribuídas pelos trechos com voz de [a, b], pelo número de sílabas. O Whisper
 *  marca mal o tempo de palavras curtas nestes takes ("site" com duração zero); o envelope não erra. */
function align(text, spans, a, b) {
  const words = text.split(/\s+/).filter(Boolean);
  let act = spans.map(([x, y]) => [Math.max(x, a), Math.min(y, b)]).filter(([x, y]) => y - x > 0.02);
  if (!act.length) act = [[a, b]];
  const total = act.reduce((s, [x, y]) => s + y - x, 0);
  const at = (u, start) => { let r = u * total; for (const [x, y] of act) { if (start ? r < y - x : r <= y - x) return x + r; r -= y - x; } return act[act.length - 1][1]; };
  const wts = words.map((w) => syl(w) + 0.35), sum = wts.reduce((s, x) => s + x, 0);
  let acc = 0;
  return words.map((w, i) => { const t = at(acc / sum, true); acc += wts[i]; return { w, t, e: at(acc / sum, false) }; });
}
/** Um trecho [a, b] da fala como uma fala própria (on = a): o que residentMouth e tatoSpeech esperam. */
function segVoice(v, a, b, words) {
  const i0 = Math.round((a - v.on) * 100);
  const env = i0 >= 0 ? v.env.slice(i0) : [...new Array(-i0).fill(0), ...v.env];
  return { ...v, on: a, off: b, env, words };
}

// ------------------------------------------------------------------ Mina no mundo
// O rig do produto (viewBox −125 −282 250 296) em escala K: pés em y 1816, olhos em y 700,
// cabeça de 262 a 916. No plano médio (s = 1) o mundo coincide com a tela.
const K = 6, Y0 = 124;
const FR = {
  WIDE: { s: 0.94, cx: 650, cy: 960 },
  MED: { s: 1, cx: 540, cy: 960 },
  MED2: { s: 1.12, cx: 548, cy: 932 },
  CLOSE: { s: 1.42, cx: 540, cy: 855 },
  XCLOSE: { s: 1.95, cx: 540, cy: 803 },
};
// braços: [ângulo do braço, ângulo ABSOLUTO do antebraço, mão] (character-rig.js); L = esquerda da tela
const POSE = {
  rest: { armL: [10, 4, 'rest'], armR: [10, 4, 'rest'] },
  gente: { armL: [100, -165, 'open'], armR: [100, -165, 'open'] },
  explain: { armL: [34, -32, 'open'], armR: [36, -22, 'open'] },
  shrug: { armL: [30, 100, 'open'], armR: [30, 100, 'open'] },
  ten: { armL: [118, 150, 'open'], armR: [118, 150, 'open'] },
  chest: { armL: [10, 4, 'rest'], armR: [20, -120, 'open'] },
  pointR: { armL: [12, -20, 'rest'], armR: [84, 92, 'point'] },
  frozen: { armL: [16, 10, 'open'], armR: [16, 10, 'open'] },
  tada: { armL: [62, 115, 'open'], armR: [62, 115, 'open'] },
  thumbR: { armL: [16, -40, 'rest'], armR: [50, 60, 'point'] },
  cheer: { armL: [120, 140, 'fist'], armR: [120, 140, 'fist'] },
  count1: { armL: [24, -150, 'point'], armR: [10, 4, 'rest'] },
  count2: { armL: [24, -150, 'point'], armR: [24, -150, 'point'] },
  up: { armL: [10, 4, 'rest'], armR: [120, 150, 'point'] },
  down: { armL: [16, -40, 'rest'], armR: [40, 20, 'point'] },
  shy: { armL: [22, -140, 'fist'], armR: [10, -30, 'rest'] },
};
const FROZEN = { eyes: { open: 1.15, pupil: 0.58 }, brows: { y: 0.95 }, mouth: { t: 'wobble', w: 0.55 } };

export async function create(ctx) {
  const { W, H, overlay, voices: V } = ctx;
  const A = new AudioList();
  const d = (id) => V.lines[id].off - V.lines[id].on;
  const F = {};
  for (const [id] of Object.values(SEG)) F[id] ??= fastLine(V.lines[id], id);

  // ------------------------------------------------------------ montagem da fala (tempos)
  const S = {}, c = {};
  let T = 0.04;
  const put = (key, gap = 0.07) => {
    T += gap;
    const [id, a0, b0, text, say] = SEG[key], f = F[id];
    const a = Math.max(0, (a0 - PAD_A) / SPEED), b = (b0 + PAD_B) / SPEED;
    const words = align(say || text, f.spans, a0 / SPEED, b0 / SPEED);
    A.clip(id, T, a, b, V, { file: f.file });
    const off = T - a;
    S[key] = { key, id, at: T, end: T + b - a, a, b, voice: segVoice(f, a, b, words), words: words.map((w) => ({ w: w.w, t: w.t + off, e: w.e + off })), text, say: Boolean(say) };
    T = S[key].end;
    return S[key];
  };
  put('hook1', 0); put('hook2'); put('hook3');
  put('dez1', 0.15); put('dez2'); put('dez3');
  // corte para o app: o barista pergunta
  c.cafe = T + 0.06; c.sora = c.cafe + 0.16; c.soraEnd = c.sora + d('soraAsk');
  A.voice('soraAsk', c.sora, V);
  // o silêncio constrangedor
  c.freeze = c.soraEnd + 0.08; c.freezeEnd = c.freeze + 1.08; T = c.freezeEnd;
  put('pra1', 0.04); put('pra2', 0.3);
  put('tr1', 0.2);
  c.app = S.tr1.end + 0.05;
  put('tr2', 0.1); put('tr3'); put('tr4');
  c.appEnd = S.tr4.end + 0.06;
  put('trav', 0.1);
  // o Tato pula para dentro do quarto e fala em dois trechos do take ("Travou?" · "O Tato ajuda.")
  c.tato = S.trav.end + 0.06;
  const TT = V.lines.tatoTravou, tatoParts = [];
  T = c.tato + 0.24;
  for (const [i, [a, b, text]] of [[0.26, 0.9, 'Travou?'], [1.29, 2.52, 'O Tato ajuda.']].entries()) {
    if (i) T += 0.14;
    const words = align(text, TT.spans, a + PAD_A, b - PAD_B);
    A.clip('tatoTravou', T, a, b, V);
    tatoParts.push({ at: T, end: T + b - a, voice: segVoice(TT, a, b, words), words: words.map((w) => ({ w: w.w, t: w.t - a + T, e: w.e - a + T })), text });
    T += b - a;
  }
  c.tatoLine = tatoParts[0].at; c.tatoLineEnd = T;
  put('so1', 0.16);
  c.help = S.so1.end + 0.05;
  put('so2', 0.1);
  c.tap = S.so2.words[1].t - 0.05; c.hint = c.tap + 0.1;   // a dica abre no "dica"
  c.toGo = S.so2.end + 0.1; c.toGoEnd = c.toGo + d('learnerToGo');
  A.voice('learnerToGo', c.toGo, V);
  c.said = c.toGoEnd + 0.04;
  // o mesmo barista, agora com resposta: a história fecha
  c.react = c.said + 0.42; c.reactEnd = c.react + d('soraReact');
  A.voice('soraReact', c.react, V);
  c.map = c.reactEnd + 0.12; T = c.map;
  put('gr1', 0.1);
  c.mapEnd = S.gr1.end + 0.05;
  put('gr2', 0.1); put('gr3');
  put('cta1', 0.16); put('cta2', 0.12); put('cta3', 0.12);
  c.laugh = S.cta3.end + 0.02;
  const duration = +(c.laugh + 0.88).toFixed(3);
  c.duration = duration;
  const learnerWords = align('To go, please.', V.lines.learnerToGo.spans, V.lines.learnerToGo.on, V.lines.learnerToGo.off).map((w) => ({ w: w.w, t: w.t - V.lines.learnerToGo.on + c.toGo, e: w.e - V.lines.learnerToGo.on + c.toGo }));

  // ------------------------------------------------------------ som
  A.cue('music', 0, { sections: [[0, 'vlog'], [duration, 'out']], drops: [[c.freeze - 0.02, S.tr1.at - 0.02]], bpm: 104 });
  A.sfx('swoop', c.cafe - 0.14, { gain: 0.4 });
  A.sfx('scratch', c.freeze - 0.02, { gain: 0.5 });
  A.sfx('crickets', c.freeze + 0.12, { gain: 0.55 });
  A.sfx('thud', S.pra2.at - 0.02, { gain: 0.55 });
  A.sfx('whoosh', S.hook3.words[S.hook3.words.length - 1].t - 0.08, { gain: 0.4 });
  A.sfx('swoop', c.app - 0.14, { gain: 0.35 });
  A.sfx('boing', c.tato, { gain: 0.6 });
  A.sfx('swoop', c.help - 0.14, { gain: 0.35 });
  A.sfx('tap', c.tap + 0.02, { gain: 0.5 });
  A.sfx('rung', c.hint + 0.02, { gain: 0.35 });
  A.sfx('chip', c.said + 0.06, { gain: 0.55 });
  A.sfx('whoosh', c.map - 0.06, { gain: 0.4 });
  A.sfx('stamp', S.gr2.words[S.gr2.words.length - 1].t - 0.04, { gain: 0.6 });
  A.sfx('pop', S.gr3.at + 0.02, { gain: 0.4 }); A.sfx('pop', S.gr3.words[2].t, { gain: 0.4 });
  A.sfx('pop', S.cta1.at, { gain: 0.45 });
  A.sfx('pop', S.cta2.words[1].t, { gain: 0.4 });
  A.sfx('pop', S.cta3.words[3].t, { gain: 0.42 });
  A.sfx('motif-end', c.laugh - 0.1, { gain: 0.5 });
  const segs = Object.values(S);
  const captions = [
    ...segs.map((s) => ({ start: s.at, end: s.end, who: 'Mina', text: s.text, lang: 'pt' })),
    { start: c.sora, end: c.soraEnd, who: 'Sora', text: V.lines.soraAsk.text, lang: 'en', inScene: true },
    { start: c.react, end: c.reactEnd, who: 'Sora', text: V.lines.soraReact.text, lang: 'en', inScene: true },
    ...tatoParts.map((p) => ({ start: p.at, end: p.end, who: 'Tato', text: p.text, lang: 'pt', inScene: true })),
    { start: c.toGo, end: c.toGoEnd, who: 'Você', text: 'To go, please.', lang: 'en' },
  ].sort((x, y) => x.start - y.start);

  // ------------------------------------------------------------ cena: quarto + Mina + Tato
  const scene = el(overlay, 'div', 'layer', '', { width: `${W}px`, height: `${H}px`, overflow: 'hidden', background: '#F1CDBC' });
  const roomL = el(scene, 'div', 'layer', '', { width: `${ROOM.w}px`, height: `${ROOM.h}px` });
  const roomImg = el(roomL, 'img', '', '', { position: 'absolute', left: '0px', top: '0px', width: `${ROOM.w}px`, height: `${ROOM.h}px` });
  roomImg.src = await roomBitmap();
  await roomImg.decode();
  const worldL = el(scene, 'div', 'layer', '', {});
  // sombra macia dela na parede (separa a figura do fundo)
  el(worldL, 'div', '', '', { position: 'absolute', left: '20px', top: '240px', width: '1040px', height: '1640px', borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(120,52,60,.20), rgba(120,52,60,0))' });
  const minaBox = el(worldL, 'div', '', '', { position: 'absolute', left: `${540 - 125 * K}px`, top: `${Y0}px`, width: `${250 * K}px`, height: `${296 * K}px` });
  const tato = new TatoActor(worldL, { id: 'creator' });
  const sweat = el(worldL, 'div', '', '<svg viewBox="0 0 40 60" width="76" height="114"><path d="M20 2 C26 18 38 30 38 42 A18 18 0 0 1 2 42 C2 30 14 18 20 2Z" fill="#9FD8F2"/><path d="M12 40 a9 9 0 0 0 9 10" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".85"/></svg>', { position: 'absolute', width: '76px', height: '114px' });
  const vignette = el(scene, 'div', 'layer', '', { width: `${W}px`, height: `${H}px`, background: 'radial-gradient(ellipse 78% 62% at 50% 44%, rgba(0,0,0,0) 58%, rgba(70,24,34,.30) 100%)' });
  void vignette;
  // linhas de foco (mangá): no "agora?" e no "Pra isso."
  const focus = el(scene, 'div', 'layer', focusLines(), { width: `${W}px`, height: `${H}px` });

  // ------------------------------------------------------------ app (exemplo animado) num cartão
  // o selo "Exemplo animado" fica acima do cartão (dentro dele cobria o nome do barista no app)
  const CARD = { x: 50, y: 334, w: 980, h: 776 };
  const cardBg = el(scene, 'div', 'layer', skylineSVG(), { width: `${W}px`, height: `${H}px`, background: 'radial-gradient(circle at 50% 30%, #2C5A43 0, #1C3A2B 62%)' });
  const card = el(scene, 'div', '', '', { position: 'absolute', left: `${CARD.x}px`, top: `${CARD.y}px`, width: `${CARD.w}px`, height: `${CARD.h}px`, borderRadius: '46px', overflow: 'hidden', background: 'var(--cream)', boxShadow: '0 44px 90px -30px rgba(0,0,0,.6), 0 0 0 10px var(--paper)', transformOrigin: '50% 50%' });
  const sw = el(card, 'div', '', '', { position: 'absolute', left: '0px', top: '0px', transformOrigin: '0 0' });
  const VW = 390, VH = 693;
  const stage = new Stage(sw, { ci: 1, pi: 0, turn: 3, vw: VW, vh: VH, x: 0, y: 0, cls: 'screen', radius: 0 });
  await stage.ready();
  const cs = CARD.w / VW, visH = CARD.h / cs;
  // enquadramentos dentro do cartão: a fala do barista (topo) + ele; o dock (microfone, ajuda);
  // e, na resposta, da fala até o selo "Entendido"
  stage.frame({ phase: 'speaking', spoken: 'For here or to go?', show: { top: 1, line: 1, you: 1, dock: 1, shade: 1 }, hintsShown: 0 });
  const lineR = stage.rect('.pv2-line') || { y: 74 };
  const dockHs = [0, 1].map((k) => { stage.frame({ phase: 'listening', spoken: 'For here or to go?', hintsShown: k }); return stage.rect('.pv2-dock')?.h || 230; });
  stage.frame({ phase: 'speaking', spoken: 'Perfect. Coming right up!', hintsShown: 0, said: 'To go, please.', chip: 'Entendido', guideSay: 'Boa! Sora entendeu.', guideBubble: 1 });
  const capR = stage.rect('[data-voice-caption]') || { y: 110 }, chipR = stage.rect('[data-v2-chip]') || { y: 400, h: 20 };
  const FQ = { cx: VW / 2, cy: lineR.y - 6 + visH / 2, s: cs };
  const FD = { cx: VW / 2, cy: VH - visH / 2, s: cs };
  // resposta: primeiro o selo (embaixo), depois sobe para a fala do barista quando ele responde
  const eTop = capR.y - 12, eBot = chipR.y + chipR.h + 26, fits = eBot - eTop <= visH;
  const FE1 = { cx: VW / 2, cy: fits ? (eTop + eBot) / 2 : eBot - visH / 2, s: cs };
  const FE2 = { cx: VW / 2, cy: fits ? FE1.cy : eTop + visH / 2, s: cs };
  const demo = el(scene, 'div', 'label-demo', 'Exemplo animado', { background: 'rgba(255,253,247,.12)', border: '2px solid rgba(255,253,247,.28)', color: '#FFF3C9' });
  // tradução curta das falas do barista, no lugar da legenda (a fala em inglês está na tela do app)
  const TR = [[c.sora + 0.25, c.freeze + 0.08, '“pra comer aqui ou pra levar?”'], [c.react + 0.2, c.map + 0.08, '“perfeito, já sai!”']];
  const trans = TR.map(([, , txt]) => el(scene, 'div', '', txt, { position: 'absolute', left: '540px', top: '1168px', transform: 'translate(-50%, -50%)', font: 'italic 500 44px/1.1 var(--display)', color: 'rgba(255,253,247,.9)', whiteSpace: 'nowrap' }));
  const guide = bakeTato({
    seed: 31, marks: false,
    moods: [[0, 'listening', { gaze: -2, markAlpha: 0 }], [c.hint, 'encouraging', { markAlpha: 0, arm: 60 }], [c.toGo - 0.1, 'listening', { gaze: -2, markAlpha: 0 }], [c.said + 0.05, 'proud', { markAlpha: 0, spark: 0.4 }]],
    gestures: [[c.hint + 0.05, 'point'], [c.said + 0.08, 'satisfied']],
    blinks: [c.cafe + 0.9, c.app + 1.4, c.app + 3.2, c.help + 1.1, c.said + 0.6],
    speech: [],
  }, duration);

  // ------------------------------------------------------------ mapa (14 cidades)
  const map = await mapImage('tall', 1400);
  const mapL = el(scene, 'div', 'layer', '', { width: `${map.layout.w}px`, height: `${map.layout.h}px` });
  el(mapL, 'img', '', '', { position: 'absolute', left: '0px', top: '0px', width: `${map.layout.w}px`, height: `${map.layout.h}px` }).src = map.img.src;

  // ------------------------------------------------------------ textos: título, adesivos, legenda
  const sticker = (html, style = {}) => { const n = el(overlay, 'div', '', html, { position: 'absolute', left: '0px', top: '0px', whiteSpace: 'nowrap', transformOrigin: '50% 50%', ...style }); fade(n, 0); return n; };
  const BOX = { padding: '16px 28px 18px', borderRadius: '22px', background: '#FFFDF7', color: '#1C3A2B', font: '600 54px/1.08 var(--display)', boxShadow: '0 14px 30px -16px rgba(20,36,28,.55)', textAlign: 'center' };
  const PILL = { padding: '14px 30px 16px', borderRadius: '999px', font: '700 50px/1 var(--display)', boxShadow: '0 8px 0 rgba(20,36,28,.18)' };
  const st = {
    lancou: sticker('🚨 LANÇOU', { ...PILL, background: '#E5533D', color: '#FFFDF7', letterSpacing: '.03em', font: '700 58px/1 var(--display)' }),
    title: sticker('um site pra treinar<br>inglês <b style="color:#2E7D4F">FALANDO</b> 🗣️', { ...BOX, font: '600 62px/1.08 var(--display)' }),
    dez: sticker('10 ANOS 📚', { ...PILL, background: '#F8C637', color: '#1C3A2B', boxShadow: '0 8px 0 #DFA518' }),
    serie: sticker('📺 sem legenda', { ...BOX, font: '600 48px/1 var(--display)' }),
    silence: sticker('🦗 <i>silêncio constrangedor</i>', { font: '600 50px/1 var(--display)', color: '#FFFDF7', padding: '14px 28px 16px', borderRadius: '18px', background: 'rgba(20,36,28,.78)' }),
    brand: sticker('<img src="/assets/icons/icon-512.png" alt="" style="width:66px;height:66px;border-radius:18px;display:block"><span>BataTalk</span>', { display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 28px 12px 12px', borderRadius: '999px', background: '#FFFDF7', color: '#1C3A2B', font: '600 54px/1 var(--display)', boxShadow: '0 16px 30px -14px rgba(20,36,28,.55)' }),
    bubble: sticker('Travou?<br><b style="color:#2E7D4F">O Tato ajuda.</b>', { padding: '18px 30px 20px', borderRadius: '30px', background: '#FFFDF7', color: '#1C3A2B', font: '600 46px/1.12 var(--display)', textAlign: 'center', boxShadow: '0 18px 34px -18px rgba(20,36,28,.6)' }),
    cities: sticker('<span data-n>2</span> cidades 🗺️', { ...PILL, background: '#F8C637', color: '#1C3A2B', font: '700 66px/1 var(--display)', boxShadow: '0 9px 0 #DFA518' }),
    gratis: sticker('GRÁTIS', { padding: '16px 40px 18px', borderRadius: '24px', background: '#1C3A2B', color: '#F8C637', font: '700 112px/1 var(--display)', letterSpacing: '.04em', border: '8px solid #FFFDF7', boxShadow: '0 22px 40px -18px rgba(20,36,28,.7)' }),
    card: sticker('sem cartão 💳', { ...BOX, font: '600 56px/1 var(--display)' }),
    nav: sticker('no navegador 🌐', { ...BOX, font: '600 56px/1 var(--display)' }),
    url: sticker('batatalk.com.br', { ...PILL, padding: '18px 40px 20px', background: '#1C3A2B', color: '#F8C637', font: '700 64px/1 var(--display)', border: '6px solid #FFFDF7', boxShadow: '0 20px 40px -18px rgba(20,36,28,.7)' }),
    comenta: sticker('comenta a sua 👇', { ...BOX, font: '600 50px/1 var(--display)' }),
    callback: sticker('<small style="display:block;font:700 22px/1 var(--ui);letter-spacing:.14em;color:#2E7D4F;margin-bottom:8px">SORA · BARISTA</small>For here or to go? 😅', { ...BOX, font: '600 48px/1.05 var(--display)' }),
    fine: sticker('Vozes geradas por IA · exemplos animados', { font: '600 32px/1 var(--ui)', color: '#FFFDF7', padding: '12px 22px', borderRadius: '14px', background: 'rgba(20,36,28,.72)' }),
  };
  for (const b of [st.bubble, st.callback]) el(b, 'i', '', '', { position: 'absolute', left: '64px', bottom: '-13px', width: '28px', height: '28px', background: '#FFFDF7', transform: 'rotate(45deg)', borderRadius: '4px' });
  const citiesN = st.cities.querySelector('[data-n]');
  // legenda palavra a palavra (estilo das legendas automáticas): 1–3 palavras por vez, a da vez em manteiga
  const cap = el(overlay, 'div', '', '', { position: 'absolute', left: '540px', top: '1165px', transform: 'translate(-50%, -50%)', textAlign: 'center', whiteSpace: 'nowrap', font: '700 78px/1.05 var(--display)', color: '#FFFDF7', letterSpacing: '-.005em', WebkitTextStroke: '14px #14241C', paintOrder: 'stroke fill', textShadow: '0 8px 0 rgba(20,36,28,.28)' });
  const PAGES = buildPages([...segs.map((s) => (s.say ? [{ w: s.text, t: s.at + 0.02, e: s.end - 0.05 }] : s.words)), learnerWords]);

  // ------------------------------------------------------------ direção da Mina
  const PK = [], XK = [], LK = [];
  const pk = (t, name, dur = 0) => PK.push([t, name, dur]);
  const xk = (t, expr) => XK.push([t, expr]);
  const lk = (t, look, turn = 0) => LK.push([t, look, turn]);
  const w = (key, i) => S[key].words[Math.min(i, S[key].words.length - 1)].t;
  pk(0, 'gente'); xk(0, 'excited'); lk(0, [0, 0]);
  pk(S.hook2.at - 0.03, 'explain'); xk(S.hook2.at - 0.03, 'smallSmile'); pk(w('hook2', 6) - 0.1, 'tada', 0.2);
  pk(S.hook3.at - 0.03, 'shrug'); xk(S.hook3.at - 0.03, 'annoyed'); xk(w('hook3', 4) - 0.04, 'surprised');
  pk(S.dez1.at - 0.05, 'ten'); xk(S.dez1.at - 0.05, 'proud');
  pk(S.dez2.at - 0.03, 'chest'); xk(S.dez2.at - 0.03, 'proud'); lk(S.dez2.at - 0.03, [0.35, -0.2]); lk(w('dez2', 2), [0, 0]);
  pk(S.dez3.at - 0.03, 'explain'); xk(S.dez3.at - 0.03, 'smallSmile'); pk(w('dez3', 4) - 0.08, 'pointR', 0.18); lk(w('dez3', 4), [0.7, 0], 0.15);
  pk(c.freeze, 'frozen'); xk(c.freeze, FROZEN); lk(c.freeze, [0, 0]);
  pk(S.pra1.at - 0.03, 'rest'); xk(S.pra1.at - 0.03, 'annoyed');
  pk(S.pra2.at - 0.08, 'rest'); xk(S.pra2.at - 0.08, 'sad');
  pk(S.tr1.at - 0.05, 'tada'); xk(S.tr1.at - 0.05, 'excited');
  pk(c.appEnd, 'frozen'); xk(c.appEnd, 'concerned'); lk(c.appEnd, [-0.4, 0.3]);
  pk(c.tato + 0.08, 'gente', 0.12); xk(c.tato + 0.06, 'surprised'); lk(c.tato + 0.1, [0.9, 0.35], 0.22);
  xk(c.tatoLine + 0.3, 'smallSmile');
  pk(S.so1.at - 0.08, 'thumbR', 0.22); xk(S.so1.at - 0.06, 'annoyed'); lk(S.so1.at - 0.04, [0, 0], 0);
  pk(c.mapEnd, 'cheer'); xk(c.mapEnd, 'excited'); lk(c.mapEnd, [0, 0]);
  pk(S.gr3.at - 0.03, 'count1'); xk(S.gr3.at - 0.03, 'smallSmile'); pk(w('gr3', 2) - 0.1, 'count2', 0.16);
  pk(S.cta1.at - 0.06, 'up'); xk(S.cta1.at - 0.06, 'smallSmile'); lk(S.cta1.at - 0.06, [0.45, -0.6], 0.1); lk(S.cta1.at + 0.9, [0, 0], 0);
  pk(S.cta2.at - 0.06, 'down'); xk(S.cta2.at - 0.06, 'smallSmile'); lk(S.cta2.words[2].t, [0.4, 0.7]); lk(S.cta2.words[4].t, [0, 0]);
  pk(S.cta3.at - 0.06, 'shy'); xk(S.cta3.at - 0.06, 'embarrassed'); xk(c.laugh - 0.15, 'laugh');
  PK.sort((a, b) => a[0] - b[0]); XK.sort((a, b) => a[0] - b[0]); LK.sort((a, b) => a[0] - b[0]);
  const lastKey = (list, t) => { let k = list[0]; for (const x of list) { if (x[0] <= t) k = x; else break; } return k; };
  function arm(t, side) {
    let i = 0; for (let j = 0; j < PK.length; j++) if (PK[j][0] <= t) i = j;
    const [t1, n1, d1] = PK[i], cur = POSE[n1][side];
    if (!d1 || !i) return cur;
    const prev = POSE[PK[i - 1][1]][side], k = E.inOut(clamp(inv(t1, t1 + d1, t)));
    return [lerp(prev[0], cur[0], k), lerp(prev[1], cur[1], k), k < 0.5 ? prev[2] : cur[2]];
  }
  function look(t) {
    let i = 0; for (let j = 0; j < LK.length; j++) if (LK[j][0] <= t) i = j;
    const [t1, l1, tr1] = LK[i]; if (!i) return { look: l1, turn: tr1 };
    const [, l0, tr0] = LK[i - 1], k = E.inOut(clamp(inv(t1, t1 + 0.16, t)));
    return { look: [lerp(l0[0], l1[0], k), lerp(l0[1], l1[1], k)], turn: lerp(tr0, tr1, k) };
  }
  const BLINKS = [1.9, 4.5, 6.75, 9.2, c.freezeEnd - 0.42, S.tr1.at + 0.7, S.tr2.at + 1.6, c.tatoLine + 0.1, S.so1.at + 0.75, c.mapEnd + 1.1, S.gr3.at + 1.5, S.cta1.at + 1.7, S.cta2.at + 0.9];
  const blinkAt = (t) => BLINKS.some((b) => t >= b && t < b + (b === c.freezeEnd - 0.42 ? 0.24 : 0.12));
  const activeSeg = (t) => segs.find((s) => t >= s.at - 0.04 && t <= s.end + 0.06);
  function minaFrame(t) {
    const expr = lastKey(XK, t)[1];
    const exprCurve = (typeof expr === 'string' ? EXPRESSIONS[expr]?.mouth?.curve : expr.mouth?.curve) ?? 0.1;
    const sg = activeSeg(t);
    const { look: lv, turn } = look(t);
    const ov = { eyes: { look: lv.map((x) => +x.toFixed(3)) } };
    let lvl = 0, nod = 0, gest = 0;
    if (sg) {
      const m = residentMouth(sg.voice, sg.at, t, 0.95);
      if (m && m.t !== 'line') ov.mouth = { ...m, curve: Math.max(m.curve ?? 0, exprCurve * 0.6) };
      // nível da voz suavizado (média de ±0,2 s): o corpo acompanha a frase, não cada sílaba
      for (let k = -4; k <= 4; k++) lvl += envAt(sg.voice, t - sg.at + sg.a + k * 0.05) / 9;
      // cabeça e mãos marcam só o começo da frase, um movimento lento
      const u = (t - sg.words[0].t) / 0.45;
      if (u > 0 && u < 1) { const b = Math.sin(Math.PI * u); nod += 2 * b; gest += 4 * b; }
    }
    const frozen = t >= c.freeze && t < c.freezeEnd;
    const tilt = frozen ? 0 : 2.4 * Math.sin(t * 2 * Math.PI * 0.23 + 0.6) + (sg ? 1.6 * Math.sin(sg.at * 7.3) : 0);
    const armL = arm(t, 'armL'), armR = arm(t, 'armR');
    const g = (a) => (a[2] === 'rest' ? a : [a[0], +(a[1] + gest).toFixed(2), a[2]]);
    const pose = {
      armL: g(armL).map((x) => (typeof x === 'number' ? +x.toFixed(2) : x)), armR: g(armR).map((x) => (typeof x === 'number' ? +x.toFixed(2) : x)),
      body: { rot: +(frozen ? 0 : 0.7 * Math.sin(t * 2 * Math.PI * 0.18)).toFixed(2), dy: +(-0.8 * lvl - (frozen ? 0 : 0.4 * Math.sin(t * 2 * Math.PI * 0.25))).toFixed(2) },
      head: { nod: +(nod).toFixed(2), turn: +turn.toFixed(3) },
      legL: { x: 10 }, legR: { x: 10 },
    };
    const o = { pose, expr, overlay: ov, blink: blinkAt(t), headExtra: +tilt.toFixed(2) };
    const key = JSON.stringify(o);
    if (key !== minaBox.dataset.k) { minaBox.dataset.k = key; minaBox.innerHTML = renderCharacter(DESIGNS.mina, o).replace('<svg ', '<svg width="100%" height="100%" style="display:block;overflow:visible" '); }
  }

  // ------------------------------------------------------------ Tato no quarto
  const TATO = { x: 900, y: 1450, h: 400 };
  tato.bake({
    seed: 9, marks: false,
    moods: [[0, 'idle'], [c.tato, 'surprised', { markAlpha: 0 }], [c.tatoLine - 0.05, 'speaking', { markAlpha: 0 }], [c.tatoLineEnd + 0.05, 'cheeky', { markAlpha: 0 }], [S.so1.end, 'greeting', { markAlpha: 0 }], [c.mapEnd, 'celebrating', { markAlpha: 0, spark: 0.6 }], [S.gr3.at, 'proud', { markAlpha: 0 }], [S.cta1.at, 'encouraging', { markAlpha: 0, arm: 100 }], [S.cta3.at, 'laughing', { markAlpha: 0 }]],
    gestures: [[c.tato + 0.42, 'pop'], [S.so1.at + 0.25, 'wave'], [c.mapEnd + 0.1, 'cheer'], [S.cta1.at + 0.1, 'point']],
    blinks: [c.tatoLineEnd + 0.3, S.so1.at + 0.9, c.mapEnd + 1.6, S.cta1.at + 1.4, S.cta2.at + 1.2],
    speech: [{ visemes: tatoParts.flatMap((p) => tatoSpeech(p.voice, p.at)) }],
  }, duration);
  // entrada: sobe de baixo do quadro com mola (passa do ponto e assenta)
  const tatoY = (t) => { if (t < c.tato) return 2300; const u = (t - c.tato) / 0.5; return TATO.y + (2300 - TATO.y) * (u >= 1 ? 0 : Math.exp(-5.2 * u) * Math.cos(9.5 * u)); };

  // ------------------------------------------------------------ planos
  const shots = [
    ['mina', 0, S.hook2.at - 0.03, 'CLOSE'],
    ['mina', S.hook2.at - 0.03, S.hook3.at - 0.03, 'MED'],
    ['mina', S.hook3.at - 0.03, S.dez1.at - 0.05, 'CLOSE', { punch: [w('hook3', 4) - 0.06, 'XCLOSE'] }],
    ['mina', S.dez1.at - 0.05, S.dez2.at - 0.03, 'MED2'],
    ['mina', S.dez2.at - 0.03, S.dez3.at - 0.03, 'CLOSE'],
    ['mina', S.dez3.at - 0.03, c.cafe, 'MED'],
    ['card', c.cafe, c.freeze],
    ['mina', c.freeze, S.pra1.at - 0.03, 'XCLOSE', { creep: 0.08 }],
    ['mina', S.pra1.at - 0.03, S.pra2.at - 0.08, 'CLOSE'],
    ['mina', S.pra2.at - 0.08, S.tr1.at - 0.05, 'XCLOSE', { creep: 0.06 }],
    ['mina', S.tr1.at - 0.05, c.app, 'MED'],
    ['card', c.app, c.appEnd],
    ['mina', c.appEnd, c.tato, 'CLOSE'],
    ['mina', c.tato, c.help, 'WIDE'],
    ['card', c.help, c.map],
    ['map', c.map, c.mapEnd],
    ['mina', c.mapEnd, S.gr3.at - 0.03, 'MED'],
    ['mina', S.gr3.at - 0.03, S.cta1.at - 0.06, 'CLOSE'],
    ['mina', S.cta1.at - 0.06, S.cta2.at - 0.06, 'MED2'],
    ['mina', S.cta2.at - 0.06, S.cta3.at - 0.06, 'CLOSE'],
    ['mina', S.cta3.at - 0.06, duration + 1, 'XCLOSE', { creep: 0.05 }],
  ].map(([kind, t0, t1, frame, o = {}]) => ({ kind, t0, t1, frame, ...o }));
  const shotAt = (t) => shots.find((s) => t >= s.t0 && t < s.t1) || shots[shots.length - 1];
  function camAt(t, sh) {
    let f = FR[sh.frame];
    if (sh.punch && t >= sh.punch[0]) { const k = E.out(clamp(inv(sh.punch[0], sh.punch[0] + 0.14, t))), g = FR[sh.punch[1]]; f = { s: Math.exp(lerp(Math.log(f.s), Math.log(g.s), k)), cx: lerp(f.cx, g.cx, k), cy: lerp(f.cy, g.cy, k) }; }
    // aproximação contínua dentro do plano (o quadro nunca para), mais forte nos silêncios
    const u = clamp(inv(sh.t0, sh.t1, t)), push = 1 + (sh.creep ?? 0.035) * E.inOut(u);
    return { s: f.s * push, cx: f.cx, cy: f.cy + (700 - f.cy) * (1 - 1 / push) };
  }
  // câmera na mão: deriva lenta em px de tela e um giro mínimo
  const hand = (t) => ({ x: 4 * Math.sin(t * 2 * Math.PI * 0.13), y: 3 * Math.sin(t * 2 * Math.PI * 0.11 + 2), r: 0.15 * Math.sin(t * 2 * Math.PI * 0.09 + 0.5) });
  const cardCam = (t) => {
    if (t < c.app) return FQ;
    if (t < c.help) { const down = clamp(inv(S.tr3.at - 0.1, S.tr3.at + 0.3, t)) - clamp(inv(S.tr4.at - 0.05, S.tr4.at + 0.35, t)); const k = E.inOut(down); return { cx: FQ.cx, cy: lerp(FQ.cy, FD.cy, k), s: cs }; }
    // ajuda: o dock inteiro; na resposta, sobe para a fala, o selo e o barista
    const k1 = E.inOut(clamp(inv(c.said - 0.05, c.said + 0.4, t))), k2 = E.inOut(clamp(inv(c.react - 0.1, c.react + 0.35, t)));
    return { cx: VW / 2, cy: lerp(lerp(FD.cy, FE1.cy, k1), FE2.cy, k2), s: cs };
  };
  const npcFrame = (t) => {
    const [lid, l0, l1] = t >= c.react - 0.1 ? ['soraReact', c.react, c.reactEnd] : ['soraAsk', c.sora, c.soraEnd];
    const v = V.lines[lid], speaking = t >= l0 - 0.06 && t < l1 + 0.1;
    const mouth = residentMouth(v, l0, t, 0.85), e = {};
    if (mouth) e.mouth = mouth;
    const raise = pulse(t, c.soraEnd - 0.25, c.soraEnd + 0.9, 0.12, 0.35);
    if (raise > 0.01) e.brows = { y: 0.5 * raise };
    const nodK = t > S.tr4.at && t < S.tr4.end + 0.5 ? Math.sin(clamp(inv(S.tr4.at, S.tr4.at + 0.6, t)) * Math.PI) * 5 : t > c.said ? Math.sin(clamp(inv(c.said, c.said + 0.6, t)) * Math.PI) * 5 : 0;
    e.head = { nod: nodK, rot: speaking ? 0 : 3 };
    const blink = [c.sora - 0.5, c.soraEnd + 0.6, c.app + 1.1, c.app + 2.9, c.help + 0.7, c.help + 2.4, c.said + 0.5].some((b) => t >= b && t < b + 0.13);
    const b = (Math.sin(t / 3.8 * Math.PI * 2) + 1) / 2;
    return { npc: { pose: speaking ? 'speak' : 'listen', expr: speaking ? 'smallSmile' : t > c.said ? 'smallSmile' : 'listening', overlay: e, blink, view: 'front' }, npcBreath: `scale(${(1 + 0.006 * b).toFixed(4)}, ${(1 + 0.012 * b).toFixed(4)})` };
  };
  function stageFrame(t) {
    const helpOpen = t >= c.hint && t < c.said ? 1 : 0;
    const replying = t >= c.react - 0.02;
    const phase = (t >= c.sora - 0.05 && t < c.soraEnd) || replying ? 'speaking' : t >= c.said ? 'processing' : 'listening';
    const kO = E.out(clamp(inv(c.hint, c.hint + 0.3, t))), kC = E.out(clamp(inv(c.said, c.said + 0.3, t)));
    const vo = (t >= S.tr3.at - 0.02 && t <= S.tr3.end + 0.05) ? envAt(S.tr3.voice, t - S.tr3.at + S.tr3.a) : 0;
    const lv = t >= c.toGo - 0.05 && t <= c.toGoEnd + 0.1 ? envAt(V.lines.learnerToGo, t - c.toGo + V.lines.learnerToGo.on) : vo;
    const tapK = t >= c.tap - 0.05 && t <= c.tap + 0.45 ? inv(c.tap - 0.05, c.tap + 0.45, t) : 0;
    stage.frame({
      t, phase, turn: 3, beatsDone: t >= c.said ? 4 : 3, spoken: replying ? 'Perfect. Coming right up!' : 'For here or to go?', clock: `0:${String(Math.min(59, 5 + Math.floor(Math.max(0, t - c.cafe)))).padStart(2, '0')}`,
      captionPop: replying ? inv(c.react, c.react + 0.28, t) : t < c.soraEnd ? inv(c.sora - 0.02, c.sora + 0.26, t) : 1,
      hintsShown: helpOpen, dockDelta: helpOpen ? (dockHs[0] - dockHs[1]) * (1 - kO) : t >= c.said ? (dockHs[1] - dockHs[0]) * (1 - kC) : 0, rungPop: helpOpen ? inv(c.hint, c.hint + 0.28, t) : null,
      voiceLevel: lv, status: phase === 'listening' ? 'Fale em inglês, do seu jeito.' : '',
      said: t >= c.said ? 'To go, please.' : '', saidPop: inv(c.said, c.said + 0.28, t),
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
    const sh = shotAt(t);
    const inMina = sh.kind === 'mina', inCard = sh.kind === 'card', inMap = sh.kind === 'map';
    // ---- quarto, Mina e Tato (sempre desenhados quando visíveis; câmera de cada plano)
    fade(roomL, inMina ? 1 : 0); fade(worldL, inMina ? 1 : 0);
    if (inMina) {
      const cm = camAt(t, sh), hd = hand(t);
      const tw = `translate(${(540 + hd.x).toFixed(2)}px, ${(960 + hd.y).toFixed(2)}px) rotate(${hd.r.toFixed(3)}deg) scale(${cm.s.toFixed(5)}) translate(${(-cm.cx).toFixed(2)}px, ${(-cm.cy).toFixed(2)}px)`;
      if (worldL.style.transform !== tw) worldL.style.transform = tw;
      const rs = 0.8 * cm.s, rcx = ROOM.cx + (cm.cx - 540) / 0.8, rcy = ROOM.cy + (cm.cy - 960) / 0.8;
      const tr = `translate(${(540 + 0.6 * hd.x).toFixed(2)}px, ${(960 + 0.6 * hd.y).toFixed(2)}px) rotate(${hd.r.toFixed(3)}deg) scale(${rs.toFixed(5)}) translate(${(-rcx).toFixed(2)}px, ${(-rcy).toFixed(2)}px)`;
      if (roomL.style.transform !== tr) roomL.style.transform = tr;
      minaFrame(t);
      const tOn = t >= c.tato;
      tato.frame(t, { x: TATO.x, y: tatoY(t), h: TATO.h, o: tOn ? 1 : 0 });
      // gota de suor no silêncio (escorre devagar)
      const sk = pulse(t, c.freeze + 0.25, c.freezeEnd + 0.02, 0.12, 0.05);
      fade(sweat, sk); css(sweat, { left: 680, top: 480 + 60 * clamp(inv(c.freeze + 0.25, c.freezeEnd, t)) });
    }
    const fk = Math.max(pulse(t, w('hook3', 4) - 0.06, S.hook3.end + 0.05, 0.05, 0.12), pulse(t, S.pra2.at - 0.08, S.pra2.end + 0.25, 0.04, 0.2));
    fade(focus, fk * 0.85);
    if (fk > 0) css(focus, { transform: `rotate(${(Math.floor(t * 12) % 2 ? 1.5 : -1.5).toFixed(1)}deg) scale(${(1.04 + 0.03 * (Math.floor(t * 12) % 2)).toFixed(3)})`, transformOrigin: '50% 40%' });
    // ---- app
    fade(cardBg, inCard ? 1 : 0); fade(card, inCard ? 1 : 0); fade(demo, inCard ? 0.95 : 0);
    if (inCard) {
      stageFrame(t);
      const cm = cardCam(t);
      const v = `translate(${(CARD.w / 2).toFixed(2)}px, ${(CARD.h / 2).toFixed(2)}px) scale(${cm.s.toFixed(5)}) translate(${(-cm.cx).toFixed(2)}px, ${(-cm.cy).toFixed(2)}px)`;
      if (sw.style.transform !== v) sw.style.transform = v;
      const k = E.out(clamp(inv(sh.t0, sh.t0 + 0.2, t)));
      css(card, { transform: `scale(${(0.86 + 0.14 * k).toFixed(4)}) rotate(${((1 - k) * -2).toFixed(2)}deg)` });
      css(demo, { left: CARD.x + 8, top: CARD.y - 58 });
    }
    trans.forEach((n, i) => fade(n, inCard ? pulse(t, TR[i][0], TR[i][1], 0.18, 0.05) : 0));
    // ---- mapa: rolagem rápida pelas 14 cidades
    fade(mapL, inMap ? 1 : 0);
    if (inMap) {
      const u = E.inOut(clamp(inv(c.map, c.mapEnd, t))), ms = W / map.layout.w;
      const my = lerp(H / ms / 2, map.layout.h - H / ms / 2, u);
      css(mapL, { transform: `translate(540px, 960px) scale(${ms.toFixed(5)}) translate(${(-map.layout.w / 2).toFixed(2)}px, ${(-my).toFixed(2)}px)` });
      const n = String(Math.round(lerp(2, map.cities, clamp(inv(c.map + 0.1, c.mapEnd - 0.25, t)))));
      if (citiesN.textContent !== n) citiesN.textContent = n;
    }
    // ---- adesivos
    const s = (n, t0, t1, x, y, rot = 0, sc = 1) => stick(n, t, t0, t1, { x, y, rot, s: sc });
    // título: inteiro no quadro 0 (é a capa no feed)
    s(st.lancou, -1, S.dez1.at - 0.1, 540, 322, -3);
    s(st.title, -1, S.dez1.at - 0.1, 540, 456, 0);
    s(st.dez, w('dez1', 0) - 0.02, S.dez1.end + 0.05, 290, 380, -6);
    s(st.serie, S.dez2.at + 0.05, S.dez2.end + 0.05, 790, 400, 5);
    s(st.silence, c.freeze + 0.3, c.freezeEnd - 0.02, 540, 1165, -2);
    s(st.brand, S.tr1.words[1].t - 0.06, S.tr1.end + 0.06, 540, 330, -3);
    s(st.bubble, c.tatoLine - 0.04, S.so1.at - 0.02, 722, 925, 3, 0.95);
    s(st.cities, c.map + 0.08, c.mapEnd - 0.17, 540, 330, -3);
    // o carimbo fica até o fim da frase seguinte, menor, para "sem cartão" e "no navegador" entrarem embaixo
    s(st.gratis, S.gr2.words[S.gr2.words.length - 1].t - 0.04, S.gr3.end + 0.1, 540, lerp(400, 330, E.inOut(clamp(inv(S.gr3.at - 0.05, S.gr3.at + 0.25, t)))), -8, 1 - 0.3 * E.inOut(clamp(inv(S.gr3.at - 0.05, S.gr3.at + 0.25, t))));
    s(st.card, S.gr3.at + 0.02, S.gr3.end + 0.1, 290, 480, -5);
    s(st.nav, w('gr3', 2) - 0.02, S.gr3.end + 0.1, 790, 580, 4);
    s(st.url, S.cta1.at, duration + 1, 540, 318, -2, 1 - 0.14 * E.inOut(clamp(inv(S.cta2.at - 0.06, S.cta2.at + 0.2, t))));
    s(st.comenta, S.cta2.words[1].t - 0.02, S.cta2.end + 0.15, 790, 1010, 5);
    s(st.callback, S.cta3.words[3].t - 0.05, duration + 1, 330, 470, -4);
    s(st.fine, c.laugh - 0.5, duration + 1, 540, 1220, 0);
    // ---- legenda
    let pi = -1; for (let i = 0; i < PAGES.length; i++) if (t >= PAGES[i].start && t < PAGES[i].end) { pi = i; break; }
    const silent = t >= c.freeze && t < c.freezeEnd;
    if (pi < 0 || silent) { fade(cap, 0); capCache.i = -1; }
    else {
      const pg = PAGES[pi];
      if (capCache.i !== pi) { capCache.i = pi; capCache.cur = -2; cap.innerHTML = pg.words.map((x, i) => `<span data-i="${i}">${x.w}</span>`).join(' '); }
      let cur = -1; pg.words.forEach((x, i) => { if (t >= x.t - 0.03) cur = i; });
      if (capCache.cur !== cur) { capCache.cur = cur; cap.querySelectorAll('span').forEach((n, i) => { n.style.color = i === cur ? '#F8C637' : '#FFFDF7'; }); }
      const k = E.out(clamp(inv(pg.start, pg.start + 0.1, t)));
      // no plano aberto (Mina + Tato) a legenda sobe para o colo dela e não cobre o Tato
      fade(cap, 1); css(cap, { top: inMina && sh.frame === 'WIDE' ? 1010 : 1165, transform: `translate(-50%, -50%) scale(${(0.88 + 0.12 * k).toFixed(4)})` });
    }
  }
  // nunca num quadro cuja janela de captura cruze um corte (somaria os dois planos)
  const CUTS = shots.map((x) => x.t0).filter((x) => x > 0);
  const samples = (t) => {
    if (CUTS.some((x) => Math.abs(t - x) < 0.02)) return 1;
    const near = (a, w0 = 0.22) => t > a && t < a + w0;
    if (near(c.cafe) || near(c.app) || near(c.help) || (t > c.tato && t < c.tato + 0.6) || (t > c.map - 0.02 && t < c.mapEnd) || near(w('hook3', 4) - 0.06, 0.16)) return [8, 0.5];
    return 1;
  };
  return { duration, cues: c, captions, audio: A.items, samples, render, hook: { title: 'Lançaram um site pra treinar inglês falando' }, safe: [120, 270, 960, 1248], async ready() { return true; } };
}

// ------------------------------------------------------------------ peças auxiliares
/** Adesivo: entra com mola (passa do tamanho e assenta), balança de leve, sai encolhendo. */
function stick(n, t, t0, t1, { x, y, rot = 0, s = 1 }) {
  if (t < t0 - 0.001 || t > t1 + 0.16) { fade(n, 0); return; }
  const kIn = t0 < 0 ? 1 : clamp(inv(t0, t0 + 0.3, t)), sp = t0 < 0 ? 1 : E.spring(kIn);
  const kOut = E.in(clamp(inv(t1, t1 + 0.16, t)));
  const sc = s * (0.35 + 0.65 * sp) * (1 - 0.45 * kOut);
  const r = rot + 1.6 * Math.sin((t - Math.max(0, t0)) * 2 * Math.PI * 0.7);
  fade(n, Math.min(1, kIn * 5) * (1 - kOut));
  css(n, { left: x, top: y, transform: `translate(-50%, -50%) rotate(${r.toFixed(2)}deg) scale(${sc.toFixed(4)})` });
}
/** Páginas da legenda: até 3 palavras, quebra na pontuação; cada página some quando a próxima entra. */
function buildPages(lists) {
  const out = [];
  for (const words of lists) {
    let cur = [];
    words.forEach((x, i) => {
      cur.push(x);
      const len = cur.map((y) => y.w).join(' ').length;
      if (cur.length >= 3 || /[.,?!…:]$/.test(x.w) || len > 15 || i === words.length - 1) { out.push({ words: cur, start: cur[0].t - 0.05, end: cur[cur.length - 1].e + 0.14 }); cur = []; }
    });
  }
  out.sort((a, b) => a.start - b.start);
  for (let i = 0; i < out.length - 1; i++) out[i].end = Math.min(out[i].end, out[i + 1].start);
  return out;
}
/** Linhas de foco de mangá: triângulos finos das bordas para o centro (rosto livre). */
function focusLines() {
  let k = 7; const r = () => { k = (k * 9301 + 49297) % 233280; return k / 233280; };
  let p = '';
  for (let i = 0; i < 110; i++) {
    const a = (i / 110) * Math.PI * 2 + r() * 0.03, w = 0.004 + r() * 0.01, r0 = 620 + r() * 260, r1 = 1500;
    const P = (ang, rad) => `${(540 + Math.cos(ang) * rad).toFixed(1)} ${(760 + Math.sin(ang) * rad * 1.25).toFixed(1)}`;
    p += `M${P(a, r0)} L${P(a - w, r1)} L${P(a + w, r1)} Z `;
  }
  return `<svg width="1080" height="1920" viewBox="0 0 1080 1920" style="display:block"><path d="${p}" fill="#FFFDF7" opacity=".82"/></svg>`;
}
/** Fundo dos cortes para o app: o horizonte de Batata City em verde-escuro, janelas acesas
 *  (enche a faixa de baixo, que no celular fica sob a legenda da postagem). */
function skylineSVG() {
  let k = 3; const r = () => { k = (k * 9301 + 49297) % 233280; return k / 233280; };
  let s = '', x = -20;
  while (x < 1100) {
    const w = 60 + r() * 90, h = 160 + r() * 300;
    s += `<rect x="${x.toFixed(0)}" y="${(1920 - h).toFixed(0)}" width="${w.toFixed(0)}" height="${(h + 20).toFixed(0)}" rx="10" fill="#163023"/>`;
    for (let wy = 1920 - h + 26; wy < 1900; wy += 40) for (let wx = x + 14; wx < x + w - 18; wx += 26) if (r() > 0.62) s += `<rect x="${wx.toFixed(0)}" y="${wy.toFixed(0)}" width="10" height="15" rx="2" fill="#F8C637" opacity="${(0.25 + r() * 0.4).toFixed(2)}"/>`;
    x += w + 8;
  }
  return `<svg width="1080" height="1920" viewBox="0 0 1080 1920" style="position:absolute;left:0;top:0">${s}</svg>`;
}
/** O quarto rasterizado uma vez, com os textos na fonte da marca e um desfoque leve de profundidade. */
async function roomBitmap() {
  const url = URL.createObjectURL(new Blob([roomSVG()], { type: 'image/svg+xml' }));
  const img = new Image(); img.src = url; await img.decode();
  const c = document.createElement('canvas'); c.width = ROOM.w; c.height = ROOM.h;
  const g = c.getContext('2d'); g.drawImage(img, 0, 0); URL.revokeObjectURL(url);
  await Promise.all(ROOM.texts.map((x) => document.fonts.load(x.font)));
  const { cx, cy, rot } = ROOM.poster;
  for (const x of ROOM.texts) {
    g.save(); g.translate(cx, cy); g.rotate(rot * Math.PI / 180);
    g.font = x.font; g.fillStyle = x.color; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    if (x.spacing) g.letterSpacing = `${x.spacing}px`;
    g.fillText(x.text, x.x - cx, x.y - cy); g.restore();
  }
  const c2 = document.createElement('canvas'); c2.width = ROOM.w; c2.height = ROOM.h;
  const g2 = c2.getContext('2d'); g2.filter = 'blur(2.2px)'; g2.drawImage(c, 0, 0);
  const out = c2.toDataURL('image/png');
  c.width = c.height = c2.width = c2.height = 1;
  return out;
}

// peças reaproveitadas pelo esquete do bar (src/cuts/bar.js)
export { fastLine, align, segVoice, stick, buildPages, focusLines };
