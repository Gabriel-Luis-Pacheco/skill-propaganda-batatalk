# Templates (código que funcionou)

Cópias dos arquivos de `batatalk-launch-video/v8-publica/` em 27/10/2026. Eles dependem do resto daquele renderizador (film.html, stage.html, tools/render.mjs, build.mjs, qc.mjs, stills.mjs, verify-determinism.mjs, export-timeline.mjs) e do rig do produto na raiz do site (`character-rig.js`, `character-designs.js`, `tato-guide.js`, `world-map.js`, `city-experience.js`).

| Arquivo | O que é |
|---|---|
| `folha-de-batidas.md` | modelo da folha de batidas (tempo, plano, fala, intenção, texto na tela, som, sinal) com checagens |
| `legenda-e-hashtags.txt` | modelo do txt de entrega (TikTok, Reels, comentário fixado, alt text, dicas) |
| `src/cuts/bar.js` + `bar-room.js` | esquete do bar v2 (Priya e June): abertura fria, campo e contracampo, tranco/tremida, travou.exe, Tato que sobe da mesa, celular em primeira pessoa, laço; `samples()` seguro nos cortes |
| `src/cuts/creator.js` + `room.js` | vídeo falado da Mina (vlog animado no quarto); exporta `fastLine`, `align`, `segVoice`, `stick`, `buildPages`, `focusLines` |
| `src/cuts/quiz2.js`, `quiz.js` | Quiz rápido e Desafio 3s |
| `src/cuts/kit.js` | kit comum (`AudioList.clip` para cortes de voz) |
| `src/film.js`, `stage-layer.js`, `visemes.js` | registro dos cortes, palco da UI real, boca por visemas |
| `audio/score.mjs` | trilhas `vlog`/`lofi`/`quiz`, efeitos (scratch, thud, whoosh, stamp, crickets, boing…), recortes de voz, mix |
| `audio/analyze-voices.mjs`, `picks.json` | análise das vozes e os takes escolhidos |
| `tools/voice-final.mjs` | TTS (só com `V8P_TTS_AUTORIZADO=1` e `--env-file`; personas Mina, priyaBR, June…) |
| `tools/voice-fast.mjs` | versões 1,1× |
| `tools/captions.mjs` | VTT + transcrição com "o que aparece sem som" |
| `tools/black-scan.mjs` | varredura de preto puro (lê o fps real) |
| `tools/alpha-scan.mjs`, `safezone-check.mjs`, `vertical-wrap.mjs` | checagens e embrulho 9:16 de versões antigas |
