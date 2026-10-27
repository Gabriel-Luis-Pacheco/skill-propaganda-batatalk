// QUIZ RÁPIDO 9:16 (TikTok/Reels, ~18 s): título "Quiz de inglês · 3 perguntas pra testar seu
// nível", depois três perguntas de múltipla escolha (erros clássicos e falsos cognatos), 3 s de
// cronômetro cada, revelação com explicação curta; o Tato apresenta e reage. Fim: "Quantas você
// acertou? Comenta 0, 1, 2 ou 3". Sem palco do app: é um quiz de inglês, não demonstração do produto.
import { E, clamp, inv, pulse, el, css, fade, TatoActor, AudioList, tatoSpeech } from './kit.js';

export async function create(ctx) {
  const { W, H, overlay, voices: V } = ctx;
  const A = new AudioList();
  const d = (id) => V.lines[id].off - V.lines[id].on;
  const Q = [
    { q: 'Como se diz<br><b>“eu concordo”</b>?', opts: ['I agree.', 'I’m agree.'], ok: 0, why: '“I’m agree” não existe 😅' },
    { q: '<b>“Pull”</b> na porta<br>quer dizer…', opts: ['Empurre', 'Puxe'], ok: 1, why: 'empurre é <b>push</b> 🚪' },
    { q: 'No restaurante,<br>pra pedir <b>a conta</b>:', opts: ['The check, please.', 'The account, please.'], ok: 0, why: '<b>account</b> é conta de banco 🏦' },
  ];
  // ------------------------------------------------------------ tempos
  const T = 3.0, READ = 0.35, SHOW = 1.45, GAP = 0.3;
  // o Tato abre falando (gancho em voz): o título fica enquanto ele fala
  const c = { title: 0, voice: 0.08 };
  c.voiceEnd = c.voice + d('tatoQuiz'); c.titleEnd = c.voiceEnd + 0.05;
  let t0 = c.titleEnd;
  Q.forEach((q, i) => { q.in = t0; q.cd = t0 + READ; q.rev = q.cd + T; q.out = q.rev + SHOW; t0 = q.out + GAP * (i < 2 ? 1 : 0); c[`q${i + 1}`] = q.in; c[`rev${i + 1}`] = q.rev; });
  c.endCard = Q[2].out + 0.1;
  c.bora = c.endCard + 1.25; c.boraEnd = c.bora + d('tatoBora');
  const duration = +(c.boraEnd + 1.3).toFixed(3);
  c.duration = duration;

  // ------------------------------------------------------------ som
  const drops = Q.map((q) => [q.cd - 0.05, q.rev]);
  A.cue('music', 0, { sections: [[0, 'quiz'], [c.endCard, 'end'], [duration, 'out']], drops, bpm: 124 });
  A.sfx('motif', 0.05, { gain: 0.35 });
  A.voice('tatoQuiz', c.voice, V);
  Q.forEach((q) => {
    A.sfx('pop', q.in, { gain: 0.45 });
    for (let k = 0; k < 3; k++) A.sfx(k === 2 ? 'tock' : 'tick', q.cd + k, { gain: 0.55 });
    A.sfx('chip', q.rev + 0.02, { gain: 0.6 });
  });
  A.sfx('swoop', c.endCard - 0.08, { gain: 0.5 });
  A.sfx('motif-end', c.endCard + 0.2);
  A.voice('tatoBora', c.bora, V);
  const captions = [{ start: c.voice, end: c.voiceEnd, who: 'Tato', text: V.lines.tatoQuiz.text, lang: 'pt', inScene: true }, { start: c.bora, end: c.boraEnd, who: 'Tato', text: V.lines.tatoBora.text, lang: 'pt', inScene: true }];

  // ------------------------------------------------------------ cenário e peças
  const bg = el(overlay, 'div', 'layer', '', { width: `${W}px`, height: `${H}px`, background: 'radial-gradient(circle at 50% 30%, #FFF6D6 0, #FBF6EA 55%)' });
  void bg;
  const sun = el(overlay, 'div', 'layer', '', { width: `${W}px`, height: `${H}px`, background: 'repeating-conic-gradient(from 0deg at 50% 36%, rgba(248,198,55,.10) 0 9deg, rgba(248,198,55,0) 9deg 18deg)' });
  // título
  const tBadge = el(overlay, 'div', '', 'QUIZ DE INGLÊS', { position: 'absolute', left: '540px', top: '360px', transform: 'translateX(-50%)', padding: '18px 36px 20px', borderRadius: '22px', background: '#1C3A2B', color: '#F8C637', font: '700 70px/1 var(--display)', letterSpacing: '.03em', whiteSpace: 'nowrap', boxShadow: '0 10px 0 #0F2219' });
  const tSub = el(overlay, 'div', '', '3 perguntas pra<br>testar seu nível 🧠', { position: 'absolute', left: '540px', top: '500px', transform: 'translateX(-50%)', font: '600 82px/1.04 var(--display)', color: '#1C3A2B', textAlign: 'center', whiteSpace: 'nowrap', letterSpacing: '-.02em' });
  // perguntas
  const prog = el(overlay, 'div', '', '', { position: 'absolute', left: '540px', top: '300px', transform: 'translateX(-50%)', display: 'flex', gap: '12px', alignItems: 'center', font: '700 30px/1 var(--ui)', letterSpacing: '.12em', color: '#1C3A2B', whiteSpace: 'nowrap' });
  const progTxt = el(prog, 'span', '', '');
  const qEls = Q.map((q) => {
    const n = el(overlay, 'div', '', q.q, { position: 'absolute', left: '540px', top: '360px', transform: 'translateX(-50%)', font: '600 76px/1.06 var(--display)', color: '#1C3A2B', textAlign: 'center', whiteSpace: 'nowrap', letterSpacing: '-.02em' });
    for (const b of n.querySelectorAll('b')) Object.assign(b.style, { color: '#8A6400', fontWeight: '700' });
    return n;
  });
  const optEls = Q.map((q) => q.opts.map((o, j) => el(overlay, 'div', '', `<span data-l style="display:grid;place-items:center;width:64px;height:64px;border-radius:18px;background:#EFE6CF;color:#1C3A2B;font:700 38px/1 var(--display);flex:none">${'AB'[j]}</span><span data-t style="font:600 58px/1 var(--display)">${o}</span><span data-m style="margin-left:auto;font:800 46px/1 var(--ui);opacity:0"></span>`, { position: 'absolute', left: '540px', width: '760px', boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: '24px', padding: '22px 30px 22px 22px', borderRadius: '28px', background: '#FFFDF7', color: '#1C3A2B', boxShadow: '0 8px 0 #E2D6B8, 0 22px 36px -24px rgba(20,36,28,.5)', transformOrigin: '50% 50%' })));
  const whyEls = Q.map((q) => { const n = el(overlay, 'div', '', q.why, { position: 'absolute', left: '540px', top: '960px', transform: 'translateX(-50%)', font: '600 44px/1.1 var(--display)', color: '#1C3A2B', whiteSpace: 'nowrap' }); for (const b of n.querySelectorAll('b')) b.style.color = '#2E7D4F'; return n; });
  // cronômetro: barra que esvazia
  const bar = el(overlay, 'div', '', '<i data-fill style="position:absolute;left:0;top:0;bottom:0;border-radius:999px;background:#F8C637"></i><b data-n style="position:absolute;right:-78px;top:50%;transform:translateY(-50%);font:700 52px/1 var(--display);color:#1C3A2B">3</b>', { position: 'absolute', left: '200px', top: '962px', width: '600px', height: '26px', borderRadius: '999px', background: '#EFE6CF' });
  const fill = bar.querySelector('[data-fill]'), barN = bar.querySelector('[data-n]');
  // Tato apresentador
  const tato = new TatoActor(overlay, { id: 'quiz2' });
  // convite
  const endBox = el(overlay, 'div', 'layer', '', { width: `${W}px`, height: `${H}px` });
  el(endBox, 'div', 'layer', '', { width: `${W}px`, height: `${H}px`, background: 'radial-gradient(circle at 50% 50%, rgba(248,198,55,.25), rgba(248,198,55,0) 40%), #1C3A2B' });
  const endQ = el(endBox, 'div', '', 'Quantas você<br>acertou? 👇', { position: 'absolute', left: '540px', top: '330px', transform: 'translateX(-50%)', font: '600 92px/1.02 var(--display)', color: '#FFFDF7', textAlign: 'center', whiteSpace: 'nowrap', letterSpacing: '-.02em' });
  const endChip = el(endBox, 'div', '', 'Comenta <b>0</b>, <b>1</b>, <b>2</b> ou <b>3</b>', { position: 'absolute', left: '540px', top: '1000px', transform: 'translateX(-50%)', padding: '20px 40px 22px', borderRadius: '999px', background: 'var(--butter)', boxShadow: '0 8px 0 var(--butter-deep)', font: '600 58px/1 var(--display)', color: 'var(--forest)', whiteSpace: 'nowrap' });
  const endFine = el(endBox, 'div', 'end__fine', 'Treine inglês <b style="color:#F8C637">falando</b> · grátis · <b style="color:#F8C637">batatalk.com.br</b><br><span class="ai">Voz gerada por IA</span>', { left: '540px', top: '1120px', transform: 'translateX(-50%)', textAlign: 'center', fontSize: '32px', color: 'rgba(255,253,247,.85)' });
  const tatoEnd = new TatoActor(endBox, { id: 'quiz2End' });
  const endSay = el(endBox, 'div', 'sub', 'Bora de novo?');

  tato.bake({
    seed: 12, marks: false,
    moods: [[0, 'speaking', { markAlpha: 0 }], [c.voiceEnd, 'encouraging', { markAlpha: 0, arm: 30 }], ...Q.flatMap((q) => [[q.cd, 'curious', { markAlpha: 0, gaze: -3, gazeY: -3 }], [q.rev, 'proud', { markAlpha: 0, spark: .35 }], [q.rev + 0.9, 'listening', { markAlpha: 0 }]])],
    gestures: [[0.05, 'hop'], ...Q.map((q) => [q.rev + 0.05, 'satisfied'])],
    blinks: [1.2, ...Q.map((q) => q.cd + 1.6)],
    speech: [{ visemes: tatoSpeech(V.lines.tatoQuiz, c.voice) }],
  }, duration);
  tatoEnd.bake({
    seed: 2, marks: false,
    moods: [[0, 'idle'], [c.endCard + 0.05, 'greeting', { markAlpha: 0 }], [c.bora - 0.05, 'speaking', { markAlpha: 0 }], [c.boraEnd + 0.05, 'encouraging', { markAlpha: 0, arm: 40 }]],
    gestures: [[c.endCard + 0.05, 'hop'], [c.boraEnd, 'wave']],
    blinks: [c.endCard + 1.0, c.boraEnd + 0.5],
    speech: [{ visemes: tatoSpeech(V.lines.tatoBora, c.bora) }],
  }, duration);

  // ------------------------------------------------------------ quadro
  function render(t) {
    const tk = 1 - E.in(clamp(inv(c.titleEnd - 0.25, c.titleEnd, t)));
    fade(tBadge, tk); fade(tSub, tk);
    // o que ele fala pulsa: "Quiz de inglês" no selo, "Três perguntas…" na frase
    const vq = V.lines.tatoQuiz, wAt = (k) => c.voice + vq.words[k].t - vq.on;
    const pb = pulse(t, wAt(0) - 0.05, wAt(0) + 0.55, 0.08, 0.3), ps = pulse(t, wAt(3) - 0.35, wAt(3) + 0.35, 0.08, 0.3);
    css(tBadge, { transform: `translateX(-50%) rotate(-2deg) scale(${(1 + 0.03 * Math.sin(t * 2 * Math.PI * 1.3) + 0.1 * pb).toFixed(4)})` });
    css(tSub, { transform: `translateX(-50%) translateY(${((1 - tk) * -30).toFixed(1)}px) scale(${(1 + 0.06 * ps).toFixed(4)})` });
    css(sun, { transform: `rotate(${(t * 6).toFixed(2)}deg)`, transformOrigin: '50% 36%' }); fade(sun, t < c.endCard ? 1 : 0);
    const cur = Q.findIndex((q) => t >= q.in - 0.05 && t < q.out + 0.05);
    fade(prog, cur >= 0 ? 1 : 0);
    if (cur >= 0) { const s = `PERGUNTA ${cur + 1} DE 3`; if (progTxt.textContent !== s) progTxt.textContent = s; }
    Q.forEach((q, i) => {
      const k = pulse(t, q.in, q.out, 0.22, 0.2);
      const slide = (1 - E.out(clamp(inv(q.in, q.in + 0.35, t)))) * 80 - E.in(clamp(inv(q.out - 0.2, q.out, t))) * 80;
      fade(qEls[i], k); css(qEls[i], { transform: `translateX(calc(-50% + ${slide.toFixed(1)}px))` });
      const revK = clamp(inv(q.rev, q.rev + 0.15, t));
      optEls[i].forEach((n, j) => {
        const appear = E.out(clamp(inv(q.in + 0.08 + j * 0.08, q.in + 0.4 + j * 0.08, t)));
        const ok = j === q.ok;
        fade(n, k * (revK > 0 && !ok ? 1 - 0.55 * revK : 1));
        const bgc = revK > 0.5 ? (ok ? '#D9F2E1' : '#FBE1DC') : '#FFFDF7';
        if (n.style.background !== bgc) n.style.background = bgc;
        const sh = revK > 0.5 ? (ok ? '0 8px 0 #2E8B57' : '0 8px 0 #E5533D') : '0 8px 0 #E2D6B8';
        n.style.boxShadow = `${sh}, 0 22px 36px -24px rgba(20,36,28,.5)`;
        const m = n.querySelector('[data-m]'); const mt = ok ? '✓' : '✕';
        if (m.textContent !== mt) m.textContent = mt; m.style.color = ok ? '#2E8B57' : '#E5533D'; m.style.opacity = String(+revK.toFixed(3));
        const pop = ok ? 1 + 0.07 * pulse(t, q.rev, q.rev + 0.5, 0.08, 0.35) : 1;
        const shake = !ok && t > q.rev ? Math.sin((t - q.rev) * 50) * 10 * Math.exp(-(t - q.rev) * 6) : 0;
        css(n, { top: 640 + j * 150, transform: `translateX(calc(-50% + ${(slide + shake + (1 - appear) * 60).toFixed(1)}px)) scale(${pop.toFixed(3)})` });
      });
      fade(whyEls[i], pulse(t, q.rev + 0.2, q.out, 0.2, 0.2));
    });
    // barra do cronômetro
    const qi = Q.findIndex((q) => t >= q.cd - 0.05 && t < q.rev + 0.1);
    if (qi >= 0) {
      const q = Q[qi], k = clamp(inv(q.cd, q.rev, t)), n = Math.max(1, 3 - Math.floor((t - q.cd) / 1));
      fill.style.width = `${((1 - k) * 100).toFixed(2)}%`;
      fill.style.background = n === 1 ? '#E5533D' : '#F8C637';
      if (barN.textContent !== String(n)) barN.textContent = String(n);
      fade(bar, clamp(inv(q.cd - 0.05, q.cd + 0.1, t)) * (1 - clamp(inv(q.rev, q.rev + 0.1, t))));
      css(barN, { transform: `translateY(-50%) scale(${(1 + 0.18 * Math.exp(-((t - q.cd) % 1) * 7)).toFixed(3)})` });
    } else fade(bar, 0);
    // Tato apresentador: grande no título, pequeno no canto durante as perguntas
    const big = 1 - E.inOut(clamp(inv(c.titleEnd - 0.3, c.titleEnd + 0.2, t)));
    const tx = 540 + (850 - 540) * (1 - big), ty = 1180 + (1236 - 1180) * (1 - big), th = 300 + (230 - 300) * (1 - big);
    tato.frame(t, { x: tx, y: ty, h: th, o: t < c.endCard ? 1 : 0 });
    // convite
    const ek = E.inOut(clamp(inv(c.endCard - 0.05, c.endCard + 0.4, t)));
    fade(endBox, ek > 0 ? 1 : 0); css(endBox, { clipPath: `inset(${((1 - ek) * 100).toFixed(2)}% 0 0 0)` });
    const ip = (x) => E.out(inv(x, x + 0.45, t));
    fade(endQ, ip(c.endCard + 0.1)); css(endQ, { transform: `translateX(-50%) translateY(${((1 - ip(c.endCard + 0.1)) * 24).toFixed(1)}px)` });
    tatoEnd.frame(t, { x: 540, y: 900, h: 330, o: ek > 0.001 ? 1 : 0 });
    fade(endSay, pulse(t, c.bora - 0.05, duration + 1, 0.15, 0.1)); css(endSay, { top: 905, fontSize: '42px' });
    fade(endChip, ip(c.endCard + 0.5)); css(endChip, { transform: `translateX(-50%) scale(${((0.8 + 0.2 * E.spring(clamp(inv(c.endCard + 0.5, c.endCard + 0.95, t)))) * (1 + 0.03 * Math.sin(Math.max(0, t - c.endCard - 1) * 2 * Math.PI * 1.2))).toFixed(4)})` });
    fade(endFine, ip(c.endCard + 0.8));
  }
  const samples = (t) => (t > c.endCard - 0.06 && t < c.endCard + 0.42 ? [10, 0.5] : 1);
  return { duration, cues: c, captions, audio: A.items, samples, render, hook: { title: 'Quiz de inglês: 3 perguntas pra testar seu nível' }, safe: [120, 270, 960, 1248], async ready() { return true; } };
}
