// VOZES FINAIS da V8 pública (TTS pago — só roda com autorização explícita do dono do projeto).
// Mesmo método da V7 (tools/voice7.mjs): uma voz e UM bloco de persona por personagem; cada
// fala dita inteira, no ritmo natural (o filme nunca corta nem estica fala final); N takes por
// fala; fica o take cuja transcrição bate e cuja altura está mais perto da mediana do
// personagem. As falas decisivas do Tato saem em três interpretações (briefing §9):
// acolhedor e contido · seco e divertido · ritmo alternativo natural.
//
//   V8P_TTS_AUTORIZADO=1 node --env-file=../.env v8-publica/tools/voice-final.mjs
//   (custo estimado: 14 falas × 3 takes ≈ 90 s de áudio + transcrição ≈ US$ 0,05–0,10)
// Saída: v8-publica/audio/voices/final/<id>.wav + <id>.words.json (+ takes/). Depois:
//   node v8-publica/audio/analyze-voices.mjs        (passa a usar o conjunto "final")
//   node v8-publica/tools/export-timeline.mjs --cut master,social,adA,adB,adC,landing,bumper
//   node v8-publica/audio/score.mjs --cut <corte>    (adB/adC com --gain-from adA)
//   bash v8-publica/tools/render-all.sh 30
// picks.json em audio/voices/final/ força um take: {"tatoCalma": 2}.
import ffmpegPath from 'ffmpeg-static';
import { spawn } from 'node:child_process';
import { access, mkdir, readFile, writeFile, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

if (process.env.V8P_TTS_AUTORIZADO !== '1') {
  console.error('Parado: TTS pago exige autorização explícita (V8P_TTS_AUTORIZADO=1). Nada foi gerado.');
  process.exit(2);
}
const key = process.env.OPENAI_API_KEY;
if (!key) { console.error('OPENAI_API_KEY ausente (rode com node --env-file=../.env).'); process.exit(2); }
const here = path.dirname(fileURLToPath(import.meta.url));
const lv = path.resolve(here, '..', '..');
const outDir = path.join(here, '..', 'audio', 'voices', 'final'), takeDir = path.join(outDir, 'takes');
const MODELS = ['gpt-4o-mini-tts-2025-12-15', 'gpt-4o-mini-tts'];
const TAKES = +(process.env.TAKES || 3);

// ------------------------------------------------------------------ elenco
const PERSONA = {
  learner: 'Voice identity — the SAME person in every line: a Brazilian adult (26) practising English; warm, mid-low, natural voice; a real person at a café counter, not an actress or announcer. English with a light, plausible Brazilian accent (open vowels, Brazilian rhythm) — never a caricature. Close microphone, quiet room, natural breaths.',
  sora: 'Voice identity: Sora, a friendly young male barista at Café Central in Batata City, mid-shift. Casual, warm, quick; a barista talking to a customer, never an advertising narrator. Natural American English. Close-ish microphone, no background noise.',
  evelyn: 'Voice identity: Evelyn, an experienced immigration officer at an airport desk, a woman in her sixties. Calm, polite, professional, unhurried; kind but official. Natural American English. Close microphone, no background noise.',
  priya: 'Voice identity: Priya, a friendly recruiter opening a job interview, a woman in her thirties. Interested, encouraging, clear; natural American English with relaxed warmth. Close microphone, no background noise.',
  mina: 'Identidade de voz — a MESMA pessoa em todas as falas: Mina, 21 anos, estudante brasileira gravando um vídeo pro TikTok no quarto dela, falando direto pra câmera com uma amiga. Português do Brasil nativo, voz feminina jovem, rápida, expressiva, engraçada e um pouco irônica; sorriso que se ouve. Nunca locutora de comercial, nunca professora, nunca robótica. Microfone de celular próximo, quarto silencioso.',
  tato: 'Identidade de voz — o MESMO personagem em todas as falas: o Tato, uma batata simpática que é o coach de conversação do aluno no BataTalk. Português do Brasil nativo, voz masculina leve, calorosa e brincalhona, sorriso que se ouve; nunca locutor de comercial, nunca professor lendo devagar, nunca robótico. Microfone próximo, sala silenciosa.',
  // esquete do bar (26/10): Priya e June, amigas, à noite; a Priya é a dramática, a June é a calma de humor seco
  priyaBR: 'Identidade de voz — a MESMA pessoa em todas as falas: Priya, mulher brasileira de trinta e poucos anos, num bar à noite contando um drama pra melhor amiga. Português do Brasil nativo, voz feminina expressiva, dramática do jeito engraçado (reclama rindo de si mesma), ritmo rápido de conversa de verdade, jeito de internet; nunca locutora, nunca professora, nunca robótica. Quando fala inglês, é com sotaque brasileiro de quem aprendeu na escola. Microfone próximo, sem ruído.',
  june: 'Identidade de voz — a MESMA pessoa em todas as falas: June, mulher brasileira de trinta e poucos anos, tatuadora, a amiga calma. Português do Brasil nativo, voz grave e quente, frases curtas e simples, humor seco (cara de paisagem), pausas confortáveis; carinhosa sem ser melosa; nunca locutora, nunca professora, nunca robótica. Microfone próximo, sem ruído.',
};
const CAST = { learner: 'marin', sora: 'ash', evelyn: 'sage', priya: 'coral', tato: 'cedar', mina: 'nova', priyaBR: 'coral', june: 'alloy' };
// três interpretações por fala decisiva do Tato (um take de cada)
const TATO3 = ['Interpretação 1 — acolhedor e contido: calmo, perto, como quem tira o peso da situação.', 'Interpretação 2 — seco e divertido: humor leve, timing de piada curta, sem exagero.', 'Interpretação 3 — ritmo alternativo natural: um pouco mais solto e rápido, conversa de verdade.'];
const LINES = {
  soraAsk: { who: 'sora', text: 'For here or to go?', how: 'Looking up from the register at the customer: friendly, quick, routine; a light rise on "go".' },
  learnerToGo: { who: 'learner', text: 'To go, please.', how: 'The answer finally comes out after a hesitation: careful on "To go", then relieved, a small smile on "please".' },
  soraReact: { who: 'sora', text: 'Perfect. Coming right up!', how: 'Warm, quick, already turning to make the drink. Natural pause after "Perfect."' },
  evelynAsk: { who: 'evelyn', text: 'How long will you be staying?', how: 'Routine immigration question, polite and calm.' },
  priyaAsk: { who: 'priya', text: 'Tell me a little about yourself.', how: 'Opening the interview, genuinely interested, encouraging.' },
  learnerThink: { who: 'learner', text: 'To go, please! Extra hot, thanks!', how: 'Her imagined, perfect answer in her head: confident, bright, fluent, a little dreamy — clearly a fantasy, close to the mic.' },
  learnerThinkShort: { who: 'learner', text: 'To go, please!', how: 'Her imagined, perfect answer in her head: confident and bright, a little dreamy, close to the mic.' },
  tatoCalma: { who: 'tato', text: 'Calma. Aqui é treino.', how: 'Ele percebe que o aluno travou e alivia a tensão.', three: true },
  tatoTreino: { who: 'tato', text: 'Ainda bem que aqui é treino.', how: 'Comentário cúmplice logo depois do "Uh…".', three: true },
  tatoDesenrolo: { who: 'tato', text: 'Se enrolar, eu desenrolo.', how: 'Promessa leve enquanto desfaz um nozinho com cuidado.', three: true },
  tatoBora: { who: 'tato', text: 'Bora de novo?', how: 'Convite animado para tentar outra vez.' },
  tatoCTA: { who: 'tato', text: 'BataTalk. Comece grátis.', how: 'Assinatura curta e calorosa: o nome com orgulho, uma pausa, o convite com sorriso. "BataTalk" pronunciado “Bata Tók”.', three: true },
  tatoTravou: { who: 'tato', text: 'Travou? O Tato ajuda.', how: 'Pergunta solidária e resposta confiante.' },
  tatoPratique: { who: 'tato', text: 'BataTalk. Pratique inglês falando.', how: 'Assinatura do bumper: o nome com orgulho, a categoria clara. "BataTalk" pronunciado “Bata Tók”.', three: true },
  // gancho do quiz do TikTok (26/10, pedido do fundador: "uma voz falando no início")
  // vídeo de criadora (26/10): a Mina apresenta o BataTalk como vlogueira; 2 takes por fala (teto de TTS)
  minaHook: { who: 'mina', takes: 2, text: 'Gente. Lançaram um site pra treinar inglês falando… e eu só descubro agora?', how: 'Abre o vídeo já no meio da indignação, rindo de si mesma: "Gente." curto e seco; depois acelera; a pergunta final indignada e engraçada.' },
  minaDezAnos: { who: 'mina', takes: 2, text: 'Dez anos estudando inglês. Entendo série sem legenda. Aí o barista pergunta isso:', how: 'Contando vantagem de brincadeira, orgulhosa nas duas primeiras frases; muda para suspense em "Aí o barista pergunta isso".' },
  minaPraIsso: { who: 'mina', takes: 2, text: 'Dez anos. Pra isso.', how: 'Seca, decepcionada consigo mesma, pausa entre as duas frases; comédia de timing, quase sem entonação.' },
  minaTreina: { who: 'mina', takes: 2, text: 'No BataTalk você treina essa conversa antes. Em voz alta, com o barista, com a oficial da imigração…', how: 'Animada, explicando pra uma amiga, ritmo rápido; "BataTalk" pronunciado “Bata Tók”; termina em suspensão.' },
  minaSeTravar: { who: 'mina', takes: 2, text: 'E se travar…', how: 'Suspense curto e brincalhão, como quem vai apresentar alguém que vai aparecer.' },
  minaSopra: { who: 'mina', takes: 2, text: 'Ele sempre aparece. Sopra uma dica, e quem responde é você.', how: 'Primeira frase olhando de lado, divertida e meio ranzinza; a segunda com firmeza e sorriso.' },
  minaGratis: { who: 'mina', takes: 2, text: 'São catorze cidades, e dá pra começar de graça. Sem cartão, direto no navegador.', how: 'Empolgada com a parte boa, rápida, sorrindo.' },
  minaCTA: { who: 'mina', takes: 2, text: 'batatalk.com.br. Comenta aí a pergunta que te trava. A minha você já viu.', say: 'Bata Tók ponto com ponto bê erre. Comenta aí a pergunta que te trava. A minha você já viu.', how: 'O endereço claro e rápido; o pedido de comentário caloroso; a última frase com um sorriso cúmplice, quase rindo.' },
  tatoQuiz: { who: 'tato', text: 'Quiz de inglês! Três perguntas pra testar seu nível.', how: 'Abertura de quiz de rede social: animado e desafiador, convidando para um jogo rápido; energia alta mas natural, sem gritar, sem tom de locutor.', three: true },
  // esquete do bar (26/10, pedido do fundador): "ai amiga, queria tanto falar inglês…"; 2 takes por fala
  barP1: { who: 'priyaBR', takes: 2, text: 'Ai, amiga… eu queria tanto falar inglês direito.', how: 'Abre o vídeo já no meio do drama: suspiro longo no "Ai, amiga…", choramingando de brincadeira, exagerada e engraçada.' },
  barJ1: { who: 'june', takes: 2, text: 'E por que não fala?', how: 'Calma, curiosa, sem julgamento; pergunta simples.' },
  barP2: { who: 'priyaBR', takes: 2, text: 'Eu leio. Eu escrevo. Mas na hora de falar… trava tudo.', how: 'Contando nos dedos, orgulhosa nas duas primeiras frases; quebra em "Mas na hora de falar…"; "trava tudo" desanimado e cômico.' },
  barJ2: { who: 'june', takes: 2, text: 'Então fala alguma coisa aí.', how: 'Desafio tranquilo, meio sorrindo, provocando a amiga.' },
  barP3: { who: 'priyaBR', takes: 2, lang: 'en', text: 'The book is on the table.', how: 'Ela respira fundo e solta a frase de livro didático com muito orgulho, devagar e bem articulada, com sotaque brasileiro de escola, como quem acha que arrasou. Say it slowly and proudly, Brazilian school accent.' },
  barJ3: { who: 'june', takes: 2, text: 'Amiga.', how: 'Uma palavra só, seca, cara de paisagem, decepção carinhosa.' },
  barP4: { who: 'priyaBR', takes: 2, text: 'Eu sei.', how: 'Envergonhada, rindo de si mesma, baixinho.' },
  barJ4: { who: 'june', takes: 2, text: 'Treina no BataTalk.', how: 'Conselho óbvio, simples e certeiro; "BataTalk" pronunciado “Bata Tók”.' },
  barP5: { who: 'priyaBR', takes: 2, text: 'No quê?', how: 'Confusa, rápida.' },
  barJ5: { who: 'june', takes: 2, text: 'É um site. Você treina conversa em voz alta: no café, no aeroporto… E se travar, uma batata te ajuda.', how: 'Explicando com calma e naturalidade, ritmo de conversa; a última frase dita com a maior seriedade do mundo (o humor está em levar a sério).' },
  barP6: { who: 'priyaBR', takes: 2, text: 'Uma batata.', how: 'Repete incrédula, seca, olhando para a câmera; pausa curta antes de "batata".' },
  barJ6: { who: 'june', takes: 2, text: 'Confia.', how: 'Uma palavra, calma e convicta, quase sorrindo.' },
  barP7: { who: 'priyaBR', takes: 2, text: 'Éé… peraí.', how: 'Travou na hora de responder em inglês: hesitação nervosa, puxando o "Éé…", depois um "peraí" baixinho.' },
  barP8: { who: 'priyaBR', takes: 2, lang: 'en', text: 'To go, please!', how: 'Ela lê a dica e acerta: animada e um pouco surpresa consigo mesma, sotaque brasileiro leve. Bright and relieved.' },
  barP9: { who: 'priyaBR', takes: 2, text: 'Amiga! Eu falei!', how: 'Explosão de alegria, gritinho de vitória rindo; energia alta sem estourar.' },
  barJ7: { who: 'june', takes: 2, text: 'Falou.', how: 'Calma e orgulhosa da amiga, sorriso que se ouve; uma palavra.' },
  barJ8: { who: 'june', takes: 2, text: 'batatalk.com.br. Dá pra começar de graça.', say: 'Bata Tók ponto com ponto bê erre. Dá pra começar de graça.', how: 'Olhando para a câmera, tranquila e seca, dica de amiga; nada de tom de propaganda.' },
};

// ------------------------------------------------------------------ áudio
await mkdir(takeDir, { recursive: true });
const exists = (f) => access(f).then(() => true, () => false);
const run = (argv) => new Promise((resolve, reject) => {
  const p = spawn(ffmpegPath, argv, { stdio: ['ignore', 'pipe', 'pipe'] });
  const out = []; let err = '';
  p.stdout.on('data', (d) => out.push(d)); p.stderr.on('data', (d) => { err += d; });
  p.on('close', (c) => (c === 0 ? resolve(Buffer.concat(out)) : reject(new Error(err.slice(-800)))));
});
const toWav = (src, dst) => run(['-hide_banner', '-loglevel', 'error', '-y', '-i', src, '-ac', '1', '-ar', '48000', '-c:a', 'pcm_s16le', dst]);
const pcm = async (file) => { const b = await run(['-hide_banner', '-loglevel', 'error', '-i', file, '-f', 'f32le', '-ac', '1', '-ar', '48000', '-']); return new Float32Array(b.buffer, b.byteOffset, b.length / 4); };
function pitch(x) {
  const SR = 48000, N = 1920, f0s = [];
  for (let i = 0; i + N < x.length; i += N / 2) {
    let e = 0; for (let k = 0; k < N; k++) e += x[i + k] * x[i + k];
    if (Math.sqrt(e / N) < 0.03) continue;
    let best = 0, lag = 0;
    for (let L = Math.floor(SR / 400); L <= Math.floor(SR / 70); L++) { let c = 0; for (let k = 0; k < N - L; k += 2) c += x[i + k] * x[i + k + L]; if (c > best) { best = c; lag = L; } }
    if (lag && best / e > 0.3) f0s.push(SR / lag);
  }
  f0s.sort((a, b) => a - b);
  return f0s.length ? f0s[Math.floor(f0s.length / 2)] : 0;
}
let MODEL = null;
async function tts(line, n, file) {
  const instructions = `${PERSONA[line.who]}\nEsta fala / This line: ${line.how}${line.three ? `\n${TATO3[(n - 1) % 3]}` : ''}`;
  for (const model of MODEL ? [MODEL] : MODELS) {
    for (let attempt = 1; attempt <= 5; attempt++) {
      const r = await fetch('https://api.openai.com/v1/audio/speech', { method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model, voice: CAST[line.who], input: (line.say || line.text).replace('BataTalk', 'Bata Tók'), instructions, response_format: 'wav' }) });
      if (r.status === 429 || r.status >= 500) { await new Promise((s) => setTimeout(s, 1500 * attempt)); continue; }
      if (!r.ok) { const t = await r.text(); if (!MODEL && /model/i.test(t)) break; throw new Error(`TTS ${line.text}: ${r.status} ${t.slice(0, 300)}`); }
      MODEL = model;
      const raw = file.replace(/\.wav$/, '.src.wav');
      await writeFile(raw, Buffer.from(await r.arrayBuffer()));
      await toWav(raw, file);
      return;
    }
  }
  throw new Error('nenhum modelo de TTS aceitou o pedido');
}
async function words(file, prompt, lang) {
  const form = new FormData();
  form.append('file', new Blob([await readFile(file)], { type: 'audio/wav' }), path.basename(file));
  form.append('model', 'whisper-1'); form.append('response_format', 'verbose_json'); form.append('timestamp_granularities[]', 'word'); form.append('prompt', prompt);
  if (lang) form.append('language', lang);
  const r = await fetch('https://api.openai.com/v1/audio/transcriptions', { method: 'POST', headers: { Authorization: `Bearer ${key}` }, body: form });
  if (!r.ok) throw new Error(`transcrição ${file}: ${r.status}`);
  const j = await r.json();
  return { text: j.text, words: (j.words || []).map((w) => ({ w: w.word, t: +w.start.toFixed(3), e: +w.end.toFixed(3) })) };
}
const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z ]/g, ' ').split(/\s+/).filter(Boolean);
const match = (a, b) => { const A = norm(a.replace('BataTalk', 'Bata Tok')), B = new Set(norm(b)); return A.length ? A.filter((w) => B.has(w)).length / A.length : 1; };

// ------------------------------------------------------------------ gravar e julgar
const takes = {};
for (const [id, line] of Object.entries(LINES)) {
  takes[id] = [];
  for (let n = 1; n <= (line.takes || TAKES); n++) {
    const f = path.join(takeDir, `${id}_${n}.wav`), m = f.replace(/\.wav$/, '.json');
    if (!(await exists(f))) {
      await tts(line, n, f);
      const x = await pcm(f), tr = await words(f, line.say || line.text, line.lang || (['tato', 'mina', 'priyaBR', 'june'].includes(line.who) ? 'pt' : 'en'));
      await writeFile(m, JSON.stringify({ f0: pitch(x), ...tr, interpretation: line.three ? TATO3[(n - 1) % 3] : null }, null, 1));
      console.log(`  take ${id}_${n}  “${tr.text}”`);
    }
    takes[id].push({ n, file: f, ...JSON.parse(await readFile(m, 'utf8')) });
  }
}
const med = {};
for (const who of Object.keys(CAST)) {
  const f = Object.entries(takes).filter(([id]) => LINES[id].who === who).flatMap(([, t]) => t.map((x) => x.f0)).filter(Boolean).sort((a, b) => a - b);
  med[who] = f[Math.floor(f.length / 2)] || 0;
}
const picksFile = path.join(outDir, 'picks.json');
const picks = (await exists(picksFile)) ? JSON.parse(await readFile(picksFile, 'utf8')) : {};
const log = {};
for (const [id, line] of Object.entries(LINES)) {
  const scored = takes[id].map((t) => ({ ...t, ok: match(line.say || line.text, t.text), dp: t.f0 && med[line.who] ? Math.abs(Math.log(t.f0 / med[line.who])) : 1 }));
  scored.sort((a, b) => (b.ok >= 0.8) - (a.ok >= 0.8) || a.dp - b.dp);
  const best = picks[id] ? scored.find((t) => t.n === picks[id]) : scored[0];
  await copyFile(best.file, path.join(outDir, `${id}.wav`));
  // o Whisper costuma pôr a 1ª palavra em 0 s: ela começa onde a voz começa de fato (boca não abre antes do som)
  const x = await pcm(best.file); let on = 0; while (on < x.length && Math.abs(x[on]) < 0.01) on++;
  const w = best.words.map((v) => ({ ...v }));
  if (w.length) { w[0].t = Math.max(w[0].t, +(on / 48000).toFixed(3)); for (let j = 1; j < w.length; j++) w[j].t = Math.max(w[j].t, w[j - 1].t + 0.05); }
  await writeFile(path.join(outDir, `${id}.words.json`), JSON.stringify(w, null, 1));
  log[id] = { take: best.n, f0: Math.round(best.f0), match: +best.ok.toFixed(2), text: best.text, interpretation: best.interpretation, voice: CAST[line.who] };
  console.log(`${id.padEnd(18)} take ${best.n}  f0 ${Math.round(best.f0)} Hz (mediana ${Math.round(med[line.who])})  bate ${best.ok.toFixed(2)}  “${best.text}”`);
}
// o "Uh…" continua o take da V7 (mesma voz marin do aluno)
await copyFile(path.join(lv, 'audio', 'voice7', 'learnerUh.wav'), path.join(outDir, 'learnerUh.wav'));
await writeFile(path.join(outDir, 'final.json'), JSON.stringify({ model: MODEL, made: new Date().toISOString(), cast: CAST, picks: log, note: 'Ouça os takes em takes/ e fixe escolhas em picks.json antes de renderizar.' }, null, 1));
console.log(`modelo ${MODEL || '(takes em cache)'} → ${path.relative(lv, outDir)}`);
