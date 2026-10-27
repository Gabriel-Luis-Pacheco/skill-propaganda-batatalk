#!/usr/bin/env node
// Placar de qualidade (references/10-placar-e-briefing.md): 22 critérios, 0–2 cada.
// Passa com ≥ 33/44 e nenhum item ★ com 0. Itens binários só aceitam 0 ou 2.
// Uso:
//   node scripts/placar.mjs --modelo > placar.json   # gera o arquivo para preencher
//   node scripts/placar.mjs placar.json              # calcula e mostra o que falta
import fs from 'node:fs';

const C = [
  [1, true, false, 'Quadro 0: rosto em close/plano médio + texto-gancho + algo acontecendo'],
  [2, true, false, 'Piada/valor nos 3 primeiros segundos'],
  [3, false, false, 'Duração adequada ao formato (21–34 s no esquete)'],
  [4, true, false, 'Uma ideia só; "mas/então" entre as batidas (jogo da cena que escala)'],
  [5, false, false, 'Estímulo novo a cada 2–4 s'],
  [6, false, false, 'Emoção de alta ativação clara e visível no rosto'],
  [7, false, false, 'Lacuna curta aberta e fechada (< 15 s)'],
  [8, true, false, 'Identificação com detalhe específico brasileiro'],
  [9, true, false, 'Falas humanas, impressão digital por personagem'],
  [10, false, false, 'Pausa antes da piada + reação segurada'],
  [11, false, false, 'Motivo para mandar a alguém / marcar'],
  [12, false, false, 'Pergunta fácil para comentar'],
  [13, false, false, 'Final forte (pico-fim) / laço'],
  [14, true, true, 'Verdade do produto, CONAR, avisos de IA'],
  [15, false, false, 'Ativos da marca (Tato, paleta, som, endereço)'],
  [16, true, false, 'Animação calma; poses fortes; antecipação'],
  [17, false, false, 'Visual não genérico'],
  [18, false, false, 'Legenda legível, na cor de quem fala, zona segura'],
  [19, true, true, 'Técnico: determinismo, alpha, QC, black-scan, sem fantasma'],
  [20, false, false, 'Som: voz desde o início, silêncios de comédia, −15 LUFS'],
  [21, false, false, 'Originalidade: só o BataTalk faria este vídeo'],
  [22, false, false, 'Formato nativo da plataforma / trend viva que passou no VIBES'],
];
const MIN = 33;

const arg = process.argv[2];
if (!arg || arg === '--modelo') {
  const tpl = { video: 'nome-do-video', fase: 'roteiro | storyboard | mp4', notas: {} };
  for (const [n, , , label] of C) { tpl[n] = null; tpl.notas[n] = label; }
  console.log(JSON.stringify(tpl, null, 2));
  process.exit(arg ? 0 : 2);
}

const s = JSON.parse(fs.readFileSync(arg, 'utf8'));
let total = 0;
const zeros = [], bad = [], empty = [], low = [];
for (const [n, star, bin, label] of C) {
  const v = s[n];
  if (v === null || v === undefined) { empty.push(`${n}. ${label}`); continue; }
  if (![0, 1, 2].includes(v) || (bin && v === 1)) { bad.push(`${n}. ${label} → ${v} (${bin ? 'binário: 0 ou 2' : '0, 1 ou 2'})`); continue; }
  total += v;
  if (star && v === 0) zeros.push(`${n}★ ${label}`);
  else if (v < 2) low.push(`${n}${star ? '★' : ''} ${label} (${v})`);
}
const max = C.length * 2;
const ok = !empty.length && !bad.length && !zeros.length && total >= MIN;
console.log(`${s.video || arg} — fase ${s.fase || '?'}: ${total}/${max} (mínimo ${MIN}) → ${ok ? 'PASSA' : 'NÃO PASSA'}`);
if (empty.length) console.log(`\nsem nota:\n  ${empty.join('\n  ')}`);
if (bad.length) console.log(`\nnota inválida:\n  ${bad.join('\n  ')}`);
if (zeros.length) console.log(`\nobrigatórios zerados (bloqueiam):\n  ${zeros.join('\n  ')}`);
if (low.length) console.log(`\nonde ganhar pontos:\n  ${low.join('\n  ')}`);
process.exit(ok ? 0 : 1);
