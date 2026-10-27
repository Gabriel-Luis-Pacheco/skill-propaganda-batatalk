// Legendas (WebVTT) e transcrição de cada corte, a partir da MESMA linha do tempo do
// filme (generated/timeline-<cut>.json). Falas em inglês ficam em inglês (é o que se
// pratica), com a tradução curta entre colchetes só onde ajuda a entender sem som;
// narração do Tato em português. Também gera a descrição dos sons e das telas.
//   node v8-publica/tools/captions.mjs --cut master [--out entrega/v8-publica]
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..'), lv = path.resolve(root, '..');
const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const cuts = opt('--cut', 'master').split(',');
const outDir = path.resolve(lv, opt('--out', 'entrega/v8-publica'));
const names = { master: 'V8_PUBLICA_MASTER', social: 'V8_PUBLICA_SOCIAL_9x16', adA: 'V8_PUBLICA_AD_A_9x16', adB: 'V8_PUBLICA_AD_B_9x16', adC: 'V8_PUBLICA_AD_C_9x16', landing: 'V8_PUBLICA_LANDING', bumper: 'V8_PUBLICA_BUMPER_9x16', quiz: 'V8_TIKTOK_DESAFIO_3S_9x16', erros: 'V8_TIKTOK_ERROS_9x16', quiz2: 'V8_TIKTOK_QUIZ_RAPIDO_9x16', creator: 'V8_TIKTOK_MINA_CRIADORA_9x16', bar: 'V8_TIKTOK_BAR_AMIGAS_9x16' };
// tradução curta, só das falas em inglês que decidem a cena
const PT = { 'For here or to go?': 'Para comer aqui ou para levar?', 'To go, please.': 'Para levar, por favor.', 'Perfect. Coming right up!': 'Perfeito. Já sai!', 'How long will you be staying?': 'Quanto tempo você vai ficar?', 'Tell me a little about yourself.': 'Fale um pouco sobre você.', 'To go, please! Extra hot, thanks!': 'Para levar, por favor! Bem quente, obrigado!', 'To go, please!': 'Para levar, por favor!' };
const ts = (t) => { const ms = Math.max(0, Math.round(t * 1000)); const h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, s = Math.floor(ms / 1000) % 60; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(ms % 1000).padStart(3, '0')}`; };
await mkdir(outDir, { recursive: true });
for (const cut of cuts) {
  const tl = JSON.parse(await readFile(path.join(root, 'generated', `timeline-${cut}.json`), 'utf8'));
  const caps = tl.captions.slice().sort((a, b) => a.start - b.start);
  const voiceNote = tl.provisional ? 'Vozes de ENSAIO (provisórias).' : 'Vozes geradas por IA (TTS).';
  let vtt = `WEBVTT\nKind: captions\nLanguage: pt-BR\n\nNOTE BataTalk V8 pública — falas em inglês com tradução curta; narração do Tato em português. Exemplo animado da prática. ${voiceNote}\n\n`;
  caps.forEach((c, i) => {
    const end = Math.max(c.end + 0.35, c.start + 1.1);
    const next = caps[i + 1]?.start ?? Infinity;
    const e = Math.min(end, next - 0.02);
    const tr = c.lang === 'en' && PT[c.text] ? `\n<i>[${PT[c.text]}]</i>` : '';
    vtt += `${i + 1}\n${ts(c.start)} --> ${ts(e)}\n<v ${c.who}>${c.text}${tr}\n\n`;
  });
  let md = `# Transcrição — ${names[cut] || (cut.startsWith('tt') ? `V8_TIKTOK_${cut.slice(2)}_9x16` : cut)}\n\nDuração: ${tl.duration.toFixed(1)} s. ${tl.provisional ? 'Vozes de ENSAIO (provisórias); o texto é o final.' : 'Vozes geradas por IA (TTS).'}\nCena: exemplo animado da prática do BataTalk no Café Central (Batata City); Sora é o barista, o Tato é o coach.\n\n`;
  const mmss = (t) => ts(t).slice(3, 10);   // mm:ss.d
  for (const c of caps) md += `- **${mmss(c.start)} · ${c.who}:** ${c.text}${c.lang === 'en' && PT[c.text] ? ` _(${PT[c.text]})_` : ''}\n`;
  const cues = tl.cues || {};
  md += '\n## O que aparece sem som\n\n';
  if (tl.cut === 'bar') {
    md = md.replace('Cena: exemplo animado da prática do BataTalk no Café Central (Batata City); Sora é o barista, o Tato é o coach.', 'Cena: esquete com a Priya e a June (moradoras animadas de Batata City), amigas num bar à noite, bebidas sem álcool; corte para um exemplo animado da prática no celular (Sora é o barista, o Tato é o coach). Abertura fria (a piada primeiro) e final que emenda no começo.');
    md += [
      [0, 'Close da Priya, orgulhosa, com linhas de foco. Texto: “7 anos de inglês na escola… e eu só sei falar isso:”. Legenda palavra a palavra (rosa = Priya, amarelo = June)'],
      [cues.flash, 'Flashback: quadro-negro do 6º ano com “The book is on the table.”'],
      [cues.j3, 'A June, de cara de paisagem: “Amiga.” 💀 (tranco de câmera)'],
      [cues.p1a, 'A Priya, com as mãos no rosto; adesivo “espera a batata 🥔”; ela conta nos dedos: “Eu leio. Eu escrevo.”'],
      [cues.glitch, 'A imagem “trava” (falha digital) e aparece a janela “travou.exe parou de responder 🧊”'],
      [cues.j4, 'A June mostra o celular: “Treina no BataTalk.”'],
      [cues.p6, 'A Priya olha para a câmera: “Uma batata.” 🥔❓ · June: “Confia.” 🤝'],
      [cues.tato, 'O Tato surge de trás da mesa e acena'],
      [cues.phone, 'Celular em primeira pessoa (selo “Exemplo animado”): o barista Sora pergunta “For here or to go?” (tradução: “pra comer aqui ou pra levar?”); a Priya trava (“Éé… peraí.”), toca na ajuda (PALAVRAS ÚTEIS: to go · for here) e responde “To go, please!” → “✓ Entendido · Boa! Sora entendeu.”'],
      [cues.p9a, 'Confete: “AMIGA EU FALEI 😭”'],
      [cues.j8a, 'A June para a câmera: “batatalk.com.br” em neon · “Vozes geradas por IA · exemplos animados” · “Dá pra começar de graça.” · “marca a amiga do “the book is on the table” 👇”'],
      [cues.j2, 'Close da June para a câmera: “Então fala alguma coisa aí.” (o vídeo recomeça na frase de escola)'],
    ].map(([t, txt]) => `- ${mmss(t)} — ${txt}
`).join('');
    const base = names[cut];
    await writeFile(path.join(outDir, `${base}.pt-BR.vtt`), vtt);
    await writeFile(path.join(outDir, `${base}.transcricao.md`), md);
    console.log(`${cut}: ${caps.length} falas → ${base}`);
    continue;
  }
  if (tl.cut === 'creator') {
    md = md.replace('Cena: exemplo animado da prática do BataTalk no Café Central (Batata City); Sora é o barista, o Tato é o coach.', 'Cena: a Mina (moradora animada de Batata City) grava um vídeo no quarto apresentando o BataTalk, em formato de vlog; cortes para exemplos animados da prática (Sora é o barista, o Tato é o coach).');
    const at = (txt) => caps.find((x) => x.text === txt)?.start ?? 0;
    md += [
      [0, 'A Mina com as mãos no rosto. Texto: “🚨 LANÇOU · um site pra treinar inglês FALANDO 🗣️”. Legenda palavra a palavra durante todo o vídeo'],
      [at('Dez anos estudando inglês.'), '“10 ANOS 📚” · “📺 sem legenda”'],
      [cues.cafe, 'Corte para o app (selo “Exemplo animado”): o barista Sora pergunta “For here or to go?” — tradução na tela: “pra comer aqui ou pra levar?”'],
      [cues.freeze, 'A Mina congela: “🦗 silêncio constrangedor”, gota de suor, a música para'],
      [at('Dez anos.'), '“Dez anos. Pra isso.” com zoom e linhas de foco'],
      [at('No BataTalk'), 'Selo do BataTalk; corte para o app: a conversa com o barista e o microfone ouvindo (“em voz alta”)'],
      [cues.tato, 'O Tato pula para dentro do quarto: balão “Travou? O Tato ajuda.”'],
      [cues.help, 'App: toque em “Preciso de ajuda”, a dica aparece (PALAVRAS ÚTEIS: to go · for here); a pessoa responde “To go, please.” → “✓ Entendido” · “Boa! Sora entendeu.” · o barista: “Perfect. Coming right up!” (“perfeito, já sai!”)'],
      [cues.map, 'Mapa de Batata City rolando, contador até “14 cidades 🗺️”'],
      [at('e dá pra começar de graça.'), '“GRÁTIS” · “sem cartão 💳” · “no navegador 🌐”'],
      [at('batatalk.com.br'), '“batatalk.com.br” · “comenta a sua 👇” · balão “SORA · BARISTA: For here or to go? 😅” · “Vozes geradas por IA · exemplos animados”'],
    ].map(([t, txt]) => `- ${mmss(t)} — ${txt}\n`).join('');
    const base = names[cut];
    await writeFile(path.join(outDir, `${base}.pt-BR.vtt`), vtt);
    await writeFile(path.join(outDir, `${base}.transcricao.md`), md);
    console.log(`${cut}: ${caps.length} falas → ${base}`);
    continue;
  }
  if (tl.cut === 'quiz2') {
    md = md.replace('Cena: exemplo animado da prática do BataTalk no Café Central (Batata City); Sora é o barista, o Tato é o coach.', 'Cena: quiz de inglês de múltipla escolha; o Tato apresenta.');
    md += [
      [0, 'Título: “QUIZ DE INGLÊS · 3 perguntas pra testar seu nível 🧠” (o Tato fala o título)'],
      [cues.q1, 'PERGUNTA 1 DE 3: Como se diz “eu concordo”? A) I agree. B) I’m agree. — cronômetro de 3 s'],
      [cues.rev1, 'Resposta: A) I agree. — “I’m agree” não existe 😅'],
      [cues.q2, 'PERGUNTA 2 DE 3: “Pull” na porta quer dizer… A) Empurre B) Puxe — cronômetro de 3 s'],
      [cues.rev2, 'Resposta: B) Puxe — empurre é push 🚪'],
      [cues.q3, 'PERGUNTA 3 DE 3: No restaurante, pra pedir a conta: A) The check, please. B) The account, please. — cronômetro de 3 s'],
      [cues.rev3, 'Resposta: A) The check, please. — account é conta de banco 🏦'],
      [cues.endCard, '“Quantas você acertou? 👇” · “Comenta 0, 1, 2 ou 3” · Tato: “Bora de novo?” · Treine inglês falando · grátis · batatalk.com.br · Voz gerada por IA'],
    ].map(([t, txt]) => `- ${mmss(t)} — ${txt}\n`).join('');
    const base = names[cut];
    await writeFile(path.join(outDir, `${base}.pt-BR.vtt`), vtt);
    await writeFile(path.join(outDir, `${base}.transcricao.md`), md);
    console.log(`${cut}: ${caps.length} falas → ${base}`);
    continue;
  }
  if (tl.cut === 'erros') {
    md = md.replace('Cena: exemplo animado da prática do BataTalk no Café Central (Batata City); Sora é o barista, o Tato é o coach.', 'Cena: erro comum → resposta certa, em duas perguntas reais da prática do BataTalk (café, aeroporto); exemplos animados.');
    md += [
      [0, 'Texto: “Se você responder “YES” aqui, errou 😬”. Legenda: “For here or to go?”'],
      [cues.wrong1, '✕ “Yes!” — é pra escolher: aqui ou pra levar'],
      [cues.right1, '✓ “To go, please.” (pra levar, por favor)'],
      [cues.sw2, '“E no aeroporto? ✈️”. Legenda: “How long will you be staying?”'],
      [cues.wrong2, '✕ “In a hotel.” — ela perguntou quanto tempo, não onde'],
      [cues.right2, '✓ “For two weeks.” (por duas semanas)'],
      [cues.endCard, '“Salva pra não travar lá fora 🔖” · Tato: “Se enrolar, eu desenrolo.” · “Você responderia “yes”? 👇” · Treine essas conversas grátis · batatalk.com.br · sem cartão · no navegador · Vozes geradas por IA'],
    ].map(([t, txt]) => `- ${mmss(t)} — ${txt}\n`).join('');
    const base = names[cut];
    await writeFile(path.join(outDir, `${base}.pt-BR.vtt`), vtt);
    await writeFile(path.join(outDir, `${base}.transcricao.md`), md);
    console.log(`${cut}: ${caps.length} falas → ${base}`);
    continue;
  }
  if (tl.cut === 'quiz') {
    // desafio: cenas e textos de tela próprios (não é a história do café)
    md = md.replace('Cena: exemplo animado da prática do BataTalk no Café Central (Batata City); Sora é o barista, o Tato é o coach.', 'Cena: desafio de 3 níveis com exemplos animados da prática do BataTalk (café, aeroporto, entrevista); o Tato é o coach.');
    md += [
      [0, 'Texto: “Responde em 3 segundos ⏱️” · NÍVEL 1 DE 3 · CAFÉ. Balão: SORA · BARISTA “For here or to go?”'],
      [cues.cd1, 'Cronômetro 3 · 2 · 1. Resposta: ✓ “To go, please.” (pra levar)'],
      [cues.sw2, '“Agora no aeroporto ✈️” · NÍVEL 2 DE 3. Balão: EVELYN · IMIGRAÇÃO “How long will you be staying?”'],
      [cues.cd2, 'Cronômetro 3 · 2 · 1. Resposta: ✓ “For two weeks.” (por duas semanas)'],
      [cues.sw3, '“Último nível: entrevista 💼” · NÍVEL 3 DE 3. Balão: PRIYA · RECRUTADORA “Tell me a little about yourself.”'],
      [cues.time3, '⏰ TEMPO! “Essa você responde nos comentários 👇”. O Tato entra: “Travou? O Tato ajuda.”'],
      [cues.endCard, '“Até que nível você chegou?” · “Comenta 1, 2 ou 3 👇” · Treine essas conversas grátis · batatalk.com.br · sem cartão · no navegador · Vozes geradas por IA'],
      [cues.loop, 'O quadro volta ao início (loop).'],
    ].map(([t, txt]) => `- ${mmss(t)} — ${txt}\n`).join('');
    const base = names[cut];
    await writeFile(path.join(outDir, `${base}.pt-BR.vtt`), vtt);
    await writeFile(path.join(outDir, `${base}.transcricao.md`), md);
    console.log(`${cut}: ${caps.length} falas → ${base}`);
    continue;
  }
  const beats = [];
  // abertura de cada corte (o que está escrito na tela, não o que a linha do tempo poderia ter)
  const HOOK = tl.hook ? { title: tl.hook.title, kickers: tl.hook.kickers, travou: tl.hook.travou } : { master: { title: 'Entendi. Só não saiu.' }, adA: { title: 'Entendi. Só não saiu.' }, social: { kickers: ['MEU INGLÊS NA CABEÇA', 'MEU INGLÊS NO BALCÃO'] }, adB: { kickers: ['Na cabeça é uma coisa.', 'No balcão, é outra.'] }, adC: { travou: 'Travou? O Tato ajuda.' } }[tl.cut] || {};
  if (tl.cut === 'bumper') {
    beats.push([0, 'O Tato em quadro, sobre um halo amarelo; a onda entra pela esquerda e vira o chão dele.'], [cues.cat ?? 0.75, 'Categoria: “Pratique inglês falando.”'], [cues.brand ?? 1.5, 'Marca: BataTalk.'], [cues.cta ?? 2.4, 'Convite: Começar grátis · Sem cartão · no navegador.']);
  } else {
    if (HOOK.kickers) beats.push([0, `Faixa: “${HOOK.kickers[0]}”. Pensamento (balão de nuvem): a resposta confiante imaginada — é pensamento, não resultado.`], [cues.cut ?? 0, `Faixa: “${HOOK.kickers[1]}”. O café de verdade: o Sora pergunta.`]);
    if (HOOK.title) beats.push([cues.title, `Texto: “${HOOK.title}” — o “Uh…” vira um nó amarelo (metáfora do filme).`]);
    else if (cues.uh != null) beats.push([cues.uh, 'O “Uh…” vira um nó amarelo (metáfora do filme).']);
    if (HOOK.travou && cues.travou != null) beats.push([cues.travou, `Texto: “${HOOK.travou}” — a ajuda abre na hora, com o Tato apontando o botão.`]);
  }
  if (cues.card != null) beats.push([0, 'Texto: “Veja como é uma conversa no BataTalk”.']);
  if (cues.brand != null && !['landing', 'bumper'].includes(tl.cut)) beats.push([cues.brand, 'Marca: BataTalk · “Pratique inglês falando.”']);
  if (cues.tap != null) beats.push([cues.tap, 'Toque no botão de ajuda (“Preciso de ajuda”; no celular, o “?”): aparece “PALAVRAS ÚTEIS · to go · for here” sob o objetivo “Diga se é para levar ou tomar aqui”.']);
  if (cues.rung2 != null) beats.push([cues.rung2, 'Segundo degrau: “COMO COMEÇAR · Termine com: “… please.””.']);
  if (cues.said != null) beats.push([cues.said, 'A fala transcrita “To go, please.” e o retorno do Tato: “✓ Entendido · Boa! Sora entendeu.”']);
  if (cues.result != null && !['social', 'bumper'].includes(tl.cut)) beats.push([cues.result, 'Conclusão real do app: “Você conseguiu. Café Central: situação resolvida.”']);
  if (cues.world != null) beats.push([cues.world, 'A onda vira caminho no mapa de Batata City: “Uma conversa de cada vez.” Portas: “Na viagem.” (Evelyn, imigração) e “No trabalho.” (Priya, entrevista).']);
  // landing: a contagem vem do mesmo catálogo do produto que o filme lê (kit.js → mapImage)
  if (cues.map != null) {
    const { CITY_DATA } = await import(pathToFileURL(path.resolve(lv, '..', 'city-experience.js')).href);
    beats.push([cues.map, `Mapa de Batata City: “${CITY_DATA.length} cidades, ${CITY_DATA.reduce((n, c) => n + c.pois.length, 0)} lugares. O primeiro de cada cidade é grátis.”`]);
  }
  if (cues.s7 != null) beats.push([cues.s7, 'O Tato desfaz com todo o cuidado o nozinho que sobrou.']);
  if (cues.end != null) beats.push([cues.end, tl.cut === 'landing' ? 'Final: “Pratique inglês falando.” · Comece grátis: 1 conversa guiada por dia · sem cartão · no navegador · batatalk.com.br' : 'Final: BataTalk · “Fale inglês. O Tato tá do seu lado.” · Começar grátis · Sem cartão · no navegador · batatalk.com.br']);
  for (const [t, d] of beats.sort((a, b) => a[0] - b[0])) md += `- ${mmss(t)} — ${d}\n`;
  const base = names[cut] || (cut.startsWith('tt') ? `V8_TIKTOK_${cut.slice(2)}_9x16` : cut);
  await writeFile(path.join(outDir, `${base}.pt-BR.vtt`), vtt);
  await writeFile(path.join(outDir, `${base}.transcricao.md`), md);
  console.log(`${cut}: ${caps.length} falas → ${path.relative(lv, path.join(outDir, base + '.pt-BR.vtt'))}`);
}
