#!/usr/bin/env node
// Revisa um roteiro (ou legenda de post) em pt-BR antes de gastar com vozes e render.
// Uso: node scripts/lint-roteiro.mjs roteiro.md [--post] [--wps 2.9]
//   Falas: linhas "Nome: texto" (aceita "- **Nome**: texto"). Sem falas, analisa o texto todo.
//   --post  checa também a legenda do post (hashtags ≤ 5, aviso de IA, personagem ≠ depoimento).
// Sai com código 1 se houver ERRO (risco legal ou de verdade do produto); AVISO não bloqueia.
import fs from 'node:fs';

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith('--'));
if (!file) {
  console.error('uso: node scripts/lint-roteiro.mjs <roteiro.md> [--post] [--wps 2.9]');
  process.exit(2);
}
const post = args.includes('--post');
const wpsArg = args.indexOf('--wps');
const WPS = wpsArg >= 0 ? Number(args[wpsArg + 1]) : 2.9; // pt-BR conversado a 1,1× fica perto de 2,8–3,1 palavras/s
const text = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
const lines = text.split('\n');

const ERR = [], WARN = [];
// \b do JS não vê "é", "ã" etc. como letra: troca por fronteira Unicode.
const B = '(?:(?<=[\\p{L}\\d])(?![\\p{L}\\d])|(?<![\\p{L}\\d])(?=[\\p{L}\\d]))';
const rx = (re) => new RegExp(re.source.replaceAll('\\b', B), re.flags.replace('u', '') + 'u');
const at = (i) => `${file}:${i + 1}`;

// Verdade do produto e CONAR: erro.
const legal = [
  [/\b(a|o) melhor(es)?\b(?! amig)/i, 'superlativo sem prova ("a melhor"): CONAR exige comprovação'],
  [/\b(n[ºo°]\.? ?1|número 1|primeir[oa] do brasil)\b/i, 'ranking sem prova'],
  [/\bgaranti(do|da|mos)\b/i, 'promessa de resultado'],
  [/\bfluent[ea]s? em \d+|\bfluência em \d+|\bem \d+ (dias|semanas|meses)\b/i, 'promessa de fluência ou prazo'],
  [/\b100 ?%/i, 'número absoluto sem prova'],
  [/\bsem esforço\b|\baprend(a|e) rápido\b/i, 'promessa de facilidade'],
  [/\b(cerveja|chope|drinks?|vinho|caipirinha|vodka|gin|tequila|shot)\b/i, 'bebida alcoólica (público jovem: limonada e café)'],
  [/\b(eu|a gente) (aprendi|aprendemos) .*\b(com|no) batatalk\b/i, 'parece depoimento de cliente (personagem ≠ cliente)'],
];
// Tiques de IA e de anúncio: aviso.
const tics = [
  [/\bnão (é|são|era)\b[^.!?\n]{1,60}[,;:—–-]\s*(é|são|era)\b/i, '"não é X, é Y" (paralelismo de IA)'],
  [/\bnão (só|apenas)\b[^.!?\n]{1,80}\bmas( também)?\b/i, '"não só X, mas Y"'],
  [/\bsem [^,.\n]{1,25}, sem [^,.\n]{1,25},? (e )?sem\b/i, 'lista "sem X, sem Y, sem Z"'],
  [/—|\s–\s/, 'travessão de efeito (use vírgula ou ponto)'],
  [/\b(revolucion\w*|transformador\w*|jornada|potencializ\w*|desbloque\w*|inovador\w*|imersiv\w*|incríve(l|is)|game ?changer|próximo nível)\b/i, 'palavra inflada'],
  [/\b(no fim do dia|faz toda a diferença|você já se perguntou|descubra (agora|como)|neste vídeo)\b/i, 'clichê de locutor/IA'],
  [/\b(oi gente|olá pessoal|fala galera)\b/i, 'abertura que perde o primeiro segundo'],
  [/\b(\p{L}{3,}), (\p{L}{3,}) e (\p{L}{3,})\b/iu, 'possível trio automático (confira se é regra de três com quebra)'],
];
for (const list of [legal, tics]) for (const r of list) r[0] = rx(r[0]);
const slang = /\b(tankar|cringe|delulu|flopar|flopou|gag|slay|pocou|serviu|hype|random|farmar aura|aura|baddie|bait|main character|old)\b/gi;
const slangRx = rx(slang);

const speaker = /^\s*(?:[-*]\s*)?\**([\p{L} .]{1,24}?)\**\s*:\s*(.+)$/u;
const falas = [];
lines.forEach((l, i) => {
  if (/^\s*(#|\||```|>)/.test(l)) return;
  for (const [re, msg] of legal) if (re.test(l)) ERR.push(`${at(i)}  ${msg}: "${l.trim().slice(0, 90)}"`);
  for (const [re, msg] of tics) if (re.test(l)) WARN.push(`${at(i)}  ${msg}: "${l.trim().slice(0, 90)}"`);
  const n = (l.match(slangRx) || []).length;
  if (n > 1) WARN.push(`${at(i)}  ${n} gírias na mesma linha (máx. 1, e só na boca de quem fala assim)`);
  const m = l.match(speaker);
  // Rótulos de documento ("**Sinal**:", "Formato:") não são personagens.
  const label = /^(https?|nota|obs|texto|tela|som|plano|corte|sinal|formato|exemplo|gancho|jogo|virada|custo|regra|tom|ideia|fonte|emoção|vozes|prova|ativos|duração|plataforma)$/i;
  if (m && !label.test(m[1].trim())) falas.push({ i, who: m[1].trim(), say: m[2] });
});

// Tempo estimado e ritmo.
const words = (s) => s.replace(/\[[^\]]*\]|\([^)]*\)/g, ' ').split(/\s+/).filter((w) => /\p{L}/u.test(w)).length;
const body = falas.length ? falas.map((f) => f.say) : lines.filter((l) => !/^\s*(#|\|)/.test(l));
const total = body.reduce((n, s) => n + words(s), 0);
const secs = total / WPS;
const long = falas.filter((f) => words(f.say) > 18);
for (const f of long) WARN.push(`${at(f.i)}  fala longa (${words(f.say)} palavras): quebre em duas batidas ou corte`);
if (falas.length) {
  const first = falas[0];
  if (words(first.say) > 14) WARN.push(`${at(first.i)}  a primeira fala demora (${words(first.say)} palavras): a piada/valor tem que chegar em < 3 s`);
  const who = new Map();
  for (const f of falas) who.set(f.who, (who.get(f.who) || 0) + 1);
  if (who.size === 1 && falas.length > 4) WARN.push('um personagem só: confira se não virou monólogo de anúncio');
}

// Legenda do post.
if (post) {
  const tags = (text.match(/(^|\s)#[\p{L}\d_]+/gu) || []).length;
  const blocks = text.split(/^=== .* ===$/m).length - 1;
  const perBlock = blocks > 1 ? Math.ceil(tags / Math.max(1, blocks - 2)) : tags;
  if (perBlock > 5) ERR.push(`hashtags demais (${perBlock} por versão): Instagram aceita 5`);
  if (/#(fyp|foryou|viral|parati|foryoupage)\b/i.test(text)) WARN.push('hashtag genérica (#fyp/#viral) não ajuda: use 3–5 específicas');
  if (!/\bIA\b|intelig[êe]ncia artificial/i.test(text)) ERR.push('falta o aviso de vozes/conteúdo de IA nas dicas do post');
  if (!/personage(m|ns)|não é depoimento/i.test(text)) WARN.push('lembre que os personagens não são clientes ("não é depoimento")');
}

const pad = (s) => `  ${s}`;
console.log(`roteiro: ${file}`);
console.log(`falas: ${falas.length}  palavras: ${total}  tempo falado estimado: ${secs.toFixed(1)} s a ${WPS} palavras/s`);
if (secs > 34) console.log(pad(`acima de 34 s só de fala: o vídeo final vai passar disso (pausas e reações somam). Corte ou justifique.`));
if (ERR.length) { console.log(`\nERROS (${ERR.length}) — resolva antes de gerar voz:`); ERR.forEach((e) => console.log(pad(e))); }
if (WARN.length) { console.log(`\nAVISOS (${WARN.length}) — leia em voz alta e decida:`); WARN.forEach((w) => console.log(pad(w))); }
if (!ERR.length && !WARN.length) console.log('\nnada encontrado. Ainda assim leia em voz alta: o linter não sente graça.');
process.exit(ERR.length ? 1 : 0);
