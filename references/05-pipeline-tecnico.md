# Pipeline técnico (repositório do site, pasta `batatalk-launch-video/v8-publica/`)

## Arquitetura

- **Renderizador próprio**: `film.html?format=9x16&cut=<corte>` monta o filme; cada corte é um módulo em `src/cuts/<corte>.js` registrado em `src/film.js` (`CUTS`). Contrato `window.__film = { duration, fps, width, height, samples(t), seek(t), ready(), captions, cues, audio, hook }`.
- **Tudo é função pura do tempo t** (sem GSAP, sem relógio). `seek(t)` desenha qualquer quadro em qualquer ordem — verificado por `tools/verify-determinism.mjs`.
- **UI real do app**: `stage.html` em iframe (`src/stage-layer.js`, classe `Stage`), viewport 390×693 no 9:16, dirigido por `stage.frame({...})` com o estado COMPLETO a cada quadro (fase, turn, spoken, hintsShown, dockDelta, rungPop, voiceLevel, said, chip, guideSay, guideBubble, show, tato, npc, npcBreath, wave, uh, tap, hintPress…). Rects úteis via `stage.rect(sel)`: `.pv2-line` (y 74–162), `[data-npc]`, `.pv2-dock`, `[data-v2-chip]`, `.pv2-guide__bubble`, `.pv2-hint`, `.pv2-mic`.
- **Captura**: Playwright/Edge + CDP, quadro de aquecimento 8×8 antes de cada captura, desfoque de movimento por subquadros (`samples(t)` → `1` ou `[n, obturador]`, subquadros em ±obturador/2 de quadro), grão aplicado no Node, pedaços de 2 s sem perdas (x264rgb), cache por hash das fontes.
- **Kit** (`src/cuts/kit.js`): `E` (easing: in/out/inOut/spring/camera/whip), `clamp/lerp/inv/pulse`, `el/css/fade`, `TatoActor` (bake/frame), `AudioList` (`voice`, `clip`, `sfx`, `cue`), `Stage`, `mapImage('tall'|'wide', px)`, `tatoSpeech`.
- **Rig do produto** importado da raiz: `/character-rig.js` (`renderCharacter`, `EXPRESSIONS`, `mergeDesign`), `/character-designs.js` (`DESIGNS`), `/tato-guide.js` (`tatoFigure`).

## Ordem dos comandos (rodar a partir de `batatalk-launch-video/`)

```bash
# 1. vozes (TTS pago: só com autorização; cache por take, não regrava o que existe)
V8P_TTS_AUTORIZADO=1 node --env-file=../.env v8-publica/tools/voice-final.mjs
#    fixe escolhas em v8-publica/audio/voices/final/picks.json e rode de novo (sem custo)
node v8-publica/audio/analyze-voices.mjs          # → generated/voices.js (adicione os ids novos na lista)
node v8-publica/tools/voice-fast.mjs id1 id2       # versões 1,1× em audio/voices/final/fast/
# 2. revisão
node v8-publica/tools/stills.mjs --cut <c> --format 9x16 --sheet --cues --out v8-publica/review/<c> 0 1.5 3 …
node v8-publica/tools/verify-determinism.mjs --cut <c> --format 9x16
node v8-publica/tools/alpha-scan.mjs --cut <c> --format 9x16 --step 0.5
# 3. linha do tempo e som (ANTES do render: generated/ entra no hash)
node v8-publica/tools/export-timeline.mjs --cut <c> --format 9x16
node v8-publica/audio/score.mjs --cut <c>
# 4. render em segundo plano (~20–25 min para 35–45 s a 60 fps)
V8P_HASH_SCOPE=film node v8-publica/tools/render.mjs --cut <c> --format 9x16 > v8-publica/logs/render-<c>.log 2>&1
node v8-publica/tools/build.mjs --cut <c> --format 9x16 --fps 60 --out entrega/v8-publica/tiktok/<NOME>.mp4
# 5. QC
node v8-publica/tools/qc.mjs entrega/v8-publica/tiktok/<NOME>.mp4
node v8-publica/tools/black-scan.mjs entrega/v8-publica/tiktok/<NOME>.mp4
node v8-publica/tools/safezone-check.mjs entrega/v8-publica/tiktok/<NOME>.mp4 --t 0.2,5,10,…
node v8-publica/tools/captions.mjs --cut <c> --out entrega/v8-publica/tiktok   # VTT + transcrição (adicione o nome no mapa `names` e o bloco de "O que aparece sem som")
```

`V8P_HASH_SCOPE=film` limita o hash às fontes do filme (outra sessão costuma editar `app.js`/onboarding na raiz e abortaria o render).

## Vozes

- Modelo `gpt-4o-mini-tts-2025-12-15`, Whisper por take, `picks.json` fixa o take. Uma persona (bloco de identidade) por personagem + `how` por fala; `say:` quando a pronúncia difere ("Bata Tók ponto com ponto bê erre").
- **Escolha de take sem ouvir**: transcrição tem que bater (o TTS às vezes REPETE a frase — "Uma batata. Uma batata." — ou inventa riso/lixo no fim); altura perto da mediana do personagem; duração/spans coerentes. Lixo depois da fala → corte com `clip`.
- **Custo**: ~US$ 0,025 por 16 takes curtos; ~US$ 0,03 por 34 takes (17 falas × 2). Teto definido pelo dono (US$ 0,10 → US$ 0,20 total). Informe o gasto acumulado.
- **1,1× sem mudar o tom** (`atempo`), ritmo de vlog; mantenha natural o inglês que é a piada e respostas de uma palavra.
- **Cortes nos respiros**: segmentos `[arquivo, a, b, legenda, say?]` em segundos do arquivo original, folga −0,03/+0,07, `/1,1` no acelerado; `AudioList.clip(id, at, a, b, V, {file})`; cada trecho é normalizado em RMS no mixer.
- **Palavras**: o Whisper erra tempos de palavras curtas nesses takes; realinhe por sílabas dentro dos trechos com voz (`align`), crie a fala do trecho com `segVoice` (env reindexado) — a boca (`residentMouth`) e a legenda karaokê usam isso.
- **Nunca** coloque comando de TTS depois de um patch na mesma chamada de shell (já destruiu takes uma vez).

## Legenda palavra a palavra (no vídeo)

`buildPages`: até 3 palavras por página, quebra na pontuação, palavra da vez colorida (na cor de quem fala: Priya `#FF9BD8`, June `#F8C637`, Mina manteiga), Fredoka 700 76–78 px, contorno 14 px `#14241C` com `paint-order: stroke fill`, y ≈ 1165 (centro), escondida onde a fala já está escrita (quadro-negro). No plano aberto com o Tato embaixo, subir para y ≈ 1010.

## Entrega

Pasta `Downloads/BataTalk-TikTok-21-videos/00_<NOME>/` com `<arquivo>.mp4` + `legenda-e-hashtags.txt`; cópia em `entrega/v8-publica/tiktok/`; `LEGENDAS-TIKTOK.md`; `PROGRESSO.md`.
