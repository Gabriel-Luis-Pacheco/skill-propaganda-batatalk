# Templates (código que funcionou)

Cópias dos arquivos de `batatalk-launch-video/v8-publica/` em 27/10/2026, com os cortes "dias" e o `score.mjs` atualizados em 05/11/2026. Eles dependem do resto daquele renderizador (film.html, stage.html, tools/render.mjs, build.mjs, qc.mjs, stills.mjs, verify-determinism.mjs, export-timeline.mjs) e do rig do produto na raiz do site (`character-rig.js`, `character-designs.js`, `tato-guide.js`, `world-map.js`, `city-experience.js`).

| Arquivo | O que é |
|---|---|
| `folha-de-batidas.md` | modelo da folha de batidas (tempo, plano, fala, intenção, texto na tela, som, sinal) com checagens |
| `legenda-e-hashtags.txt` | modelo do txt de entrega (TikTok, Reels, comentário fixado, alt text, dicas) |
| `src/cuts/imigracao.js` + `airport-room.js` | "ao pé da letra na imigração" (Reels, 30 s): balões de pensamento, pílulas de tradução, fantasma, Tato que pula do balcão, insert do carimbo com bilhete, laço; boca 1 quadro à frente do som |
| `src/cuts/imigracao-tt.js` | o corte do TikTok (13 s) do mesmo esquete, só o "chutei o balde": importa cenário, personagens e vozes de `imigracao.js` (nenhum TTS novo); mostra como tirar um corte curto de um Reel |
| `src/cuts/standup.js` + `standup-room.js` | "stand-up dos falsos amigos" (Reels, ~42 s): palco com holofote, neon e plateia de costas; microfone na mão do rig (prop `mic`); imitações com a cabeça virada; prato/panela que saem voando; contraplano da primeira fila; Tato que sobe da caixa de retorno; falas a 1,2× na preparação e no tempo natural no inglês da piada (`speedLine`) |
| `tools/crowd-voices.mjs` | banco de risadas sintéticas da plateia (TTS pago). **Reprovado pelo dono ("robotizada")**: use as gravações reais da Mixkit com `A.sfx('sample', …)` |
| `src/cuts/standup3.js` | **o stand-up aprovado (v3)**: porta PUSH + entrevista "pretend" + batata. Voz em blocos corridos (gpt-audio-1.5), risada real só no punch, porta que treme e abre, carimbo CONTRATADO → GERENTE, legenda que sobe quando o Tato está embaixo. Importa o palco de `standup.js` |
| `tools/voice-audio.mjs` | voz com o modelo de áudio da OpenAI (Chat Completions, `gpt-audio-1.5`): um bloco por piada, a transcrição volta para conferir se leu palavra por palavra |
| `src/cuts/bar.js` + `bar-room.js` | esquete do bar v2 (Priya e June): abertura fria, campo e contracampo, tranco/tremida, travou.exe, Tato que sobe da mesa, celular em primeira pessoa, laço; `samples()` seguro nos cortes |
| `src/cuts/creator.js` + `room.js` | vídeo falado da Mina (vlog animado no quarto); exporta `fastLine`, `align`, `segVoice`, `stick`, `buildPages`, `focusLines` |
| `src/cuts/quiz2.js`, `quiz.js` | Quiz rápido e Desafio 3s |
| `src/cuts/dias11.js` + `dias10-scenes.js` + `dias-scenes.js` + `dias-outfits.js` | **o Reel campeão "E se você falasse inglês todo dia?"** (v11/v12, 35 s; ver `references/24`). Tem:<br>• narrador só no gancho<br>• celular grande do app (camada DOM)<br>• FLUSH!<br>• banheiro com fresta e chinelos<br>• prédio cortado (`floorsSVG`, recortes aninhados, mundo de 2700)<br>• panorâmica dentro do plano (`win`)<br>• personagens deitados (`lie`) e duas instâncias por estado (`vis`)<br>• vassoura (`veraBroom`, `bang`, `shakes`)<br>• chip do dia com rótulo de lugar<br>• legenda com só o punch em cor, que sobe para a laje |
| `src/cuts/dias10.js` | o v10 (sem narrador; o Dia 100 com o app dando "Perfeito!" foi reprovado depois) |
| `src/cuts/dias.js` | o v2. Tem:<br>• narrador de causo<br>• cartões de dia sobre a cena desfocada<br>• banner de download<br>• `pin()` centralizado<br>• legenda que não termina em artigo<br>• trilha `dias` com arco |
| `audio/score.mjs` (04/11) | acrescenta:<br>• seção `dias` com `stages` e `gain`<br>• `diasAmbience` por cena, com `gain`<br>• efeitos `flush`, `snore`, `step`, `knock`, `riser`, `impact`, `notif`, `slap`, `chirp` e `doorshut`<br>• voz com `fx: 'phone'` |
| `src/cuts/kit.js` (04/11) | `AudioList.clip` passa `fx` para a trilha |
| `src/cuts/kit.js` | kit comum (`AudioList.clip` para cortes de voz) |
| `src/film.js`, `stage-layer.js`, `visemes.js` | registro dos cortes, palco da UI real, boca por visemas |
| `audio/score.mjs` | trilhas `vlog`/`lofi`/`quiz`, efeitos (scratch, thud, whoosh, stamp, crickets, boing…), recortes de voz, mix |
| `audio/analyze-voices.mjs`, `picks.json` | análise das vozes e os takes escolhidos |
| `tools/voice-final.mjs` | TTS (só com `V8P_TTS_AUTORIZADO=1` e `--env-file`; personas Mina, priyaBR, June…) |
| `tools/voice-fast.mjs` | versões 1,1× |
| `tools/captions.mjs` | VTT + transcrição com "o que aparece sem som" |
| `tools/black-scan.mjs` | varredura de preto puro (lê o fps real) |
| `tools/alpha-scan.mjs`, `safezone-check.mjs`, `vertical-wrap.mjs` | checagens e embrulho 9:16 de versões antigas |
