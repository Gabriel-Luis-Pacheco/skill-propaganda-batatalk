---
name: propaganda-batatalk
description: Cria, revisa e entrega vídeos curtos de propaganda do BataTalk para TikTok e Reels — esquetes com o elenco de Batata City, vídeo de criadora (vlog animado), quiz, variações de gancho — no renderizador próprio do repositório (batatalk-launch-video/v8-publica). Cobre roteiro (gancho, humor geração Z, anti-"cara de IA", verdade do produto e CONAR), vozes TTS autorizadas, animação do rig (movimento calmo), som, render, QC técnico, legendas do post, hashtags e entrega em pastas. Use para qualquer pedido de vídeo, propaganda, TikTok, Reels, esquete, legenda de post ou revisão de vídeo do BataTalk.
---

# Propaganda BataTalk — vídeos curtos que prendem, sem mentir

Esta skill junta tudo o que funcionou (e o que deu errado) na produção dos vídeos do BataTalk para TikTok e Reels em outubro de 2026: a família V8 pública, as variações de gancho, o Desafio 3s, o Quiz rápido, o vídeo falado da Mina e o esquete do bar (Priya e June), mais a pesquisa de retenção e de legendas. **Leia os arquivos de `references/` antes de agir**; eles têm os detalhes, os números e as fontes.

## Quando usar

Qualquer pedido de vídeo/propaganda/TikTok/Reels/esquete/legenda de post do BataTalk, ou de revisão de um vídeo já feito ("melhora o pace", "deixa mais engajado", "as legendas têm que ser as melhores").

## Fluxo (siga nesta ordem)

1. **Entenda o pedido e a verdade do produto** → `references/01-marca-produto-e-verdade.md`. Só afirmações verdadeiras (grátis para começar, sem cartão, no navegador, 14 cidades, conversa em voz alta, dica do Tato). Nada de "a melhor", depoimento falso, resultado inventado. Vozes de IA sempre avisadas.
2. **Confira orçamento e permissões antes de gastar** → TTS pago só com autorização explícita e dentro do teto combinado (histórico: teto US$ 0,10, depois ampliado pelo dono para US$ 0,20 no total; gasto até 27/10 ≈ US$ 0,11). Se o vídeo novo precisa de vozes novas e o teto não cobre, **pergunte antes** (AskUserQuestion com opções e custo estimado).
3. **Pesquise e escreva o roteiro** → `references/02-roteiro-e-humor.md` + `references/03-retencao-tiktok.md`. Regras de ouro: a piada/valor no primeiro quadro (abertura fria), 21–34 s, algo novo a cada 2–4 s, final que emenda no começo, pergunta fácil para comentar, marca-a-amiga para compartilhar. Escreva em pt-BR natural (humanizer: sem "não é X, é Y", sem trio forçado, sem tom de anúncio).
4. **Vozes** → `references/05-pipeline-tecnico.md` (voice-final, picks, analyze-voices, voice-fast 1,1×, cortes nos respiros com `AudioList.clip`, palavras realinhadas por sílabas).
5. **Cena, rig e animação** → `references/06-animacao-e-rig.md`. Vetor chapado (nunca pintura/foto/IA raster), o Tato é o único volumétrico. **Movimento calmo**: nada de tremer a cada palavra; só a fala suavizada e o começo das frases mexem o corpo; gestos grandes com mola.
6. **Som** → `references/07-som.md` (trilhas sintetizadas `vlog`/`lofi`/`quiz`, silêncios de comédia, efeitos de meme próprios, −15 LUFS, pico ≤ −2 dBTP).
7. **Revise por quadros antes de renderizar** (`tools/stills.mjs --sheet`), corrija, **verify-determinism** e **alpha-scan**, exporte a linha do tempo, mixe, renderize em segundo plano (`V8P_HASH_SCOPE=film`), monte, **qc + black-scan + safezone + folha de 1–2 quadros por segundo + quadros em volta de cada corte**. → `references/08-qc-e-armadilhas.md`.
8. **Legenda do post, hashtags, comentário fixado, texto alternativo** → `references/04-legendas-do-post.md`.
9. **Entregue** → `references/09-entregas-e-postagem.md`: pasta em `Downloads/BataTalk-TikTok-21-videos/00_<NOME>/` com o `.mp4` e `legenda-e-hashtags.txt`; envie o arquivo no chat; atualize `LEGENDAS-TIKTOK.md`, `PROGRESSO.md` e a transcrição (`tools/captions.mjs`).
10. **Diga a verdade no fechamento**: o que foi checado, o que ninguém ouviu/assistiu ainda, quanto gastou, e as fontes da pesquisa com links.

## Regras que não se quebram

- **Verdade e lei**: sem superlativo sem prova ("a melhor" → CONAR/TJSP exigem prova), sem depoimento falso, sem promessa de fluência/prazo. Personagens são personagens: diga no post que não é depoimento de cliente. "Exemplo animado" nas telas do app. "Vozes geradas por IA" no vídeo e selo de IA no TikTok.
- **Bebida alcoólica**: não. Bar = limonada e café (público jovem, regras de anúncio).
- **Não publicar, não impulsionar, não comprar mídia, não mandar mensagem** — quem posta é o dono.
- **Nunca ler nem servir `.env`**; a chave entra só via `node --env-file=../.env`.
- **Não sobrescrever entregas antigas** sem querer; não mexer na landing nem em analytics de produção; não "consertar" o produto para o anúncio parecer verdade.
- **Não editar fontes do filme durante um render** (o render aborta de propósito; `generated/` e todo `.js/.mjs/.css/.html/.json/.wav` de `v8-publica` fora de `tools/` e `audio/out` entram no hash).
- **Feedback do dono vale como regra**: movimento calmo (sem tremor); não postar o mesmo vídeo várias vezes, mas variações de gancho servem para testar; "usa as versões antigas também, escolhe as melhores"; "faz o máximo de vídeos diferentes"; quando ele diz "encerra/tá bom assim", pare e só leve o aprendizado para os próximos.

## Atalho de checklist (antes de entregar)

- [ ] Piada/valor no quadro 0, rosto e voz desde o início, texto-gancho no quadro 0 (é a capa)
- [ ] 21–34 s (ou justificado), nenhuma pausa morta > 0,5 s, estímulo novo a cada 2–4 s
- [ ] Final em laço ou na piada; pergunta fácil + marca-a-amiga
- [ ] Legenda palavra a palavra na cor de quem fala; textos dentro da zona segura (x 120–960, y 270–1248)
- [ ] Determinismo PASS, alpha-scan limpo, QC PASS (h264/bt709/aac 48k, −15 LUFS ±1,5, pico ≤ −1 dBTP), black-scan 0, sem quadro "fantasma" nos cortes
- [ ] `legenda-e-hashtags.txt` com versões TikTok e Reels, ≤ 5 hashtags, comentário para fixar, alt text, avisos
- [ ] Gasto de TTS informado; fontes da pesquisa citadas

## Mapa de arquivos desta skill

| Arquivo | O que tem |
|---|---|
| `references/01-marca-produto-e-verdade.md` | fatos do produto, o que pode/não pode dizer, elenco com pronomes e vozes, estilo de arte, preferências do dono |
| `references/02-roteiro-e-humor.md` | estrutura de roteiro, humanizer/anti-slop, humor geração Z, memes (VIBES), roteiros prontos que funcionaram |
| `references/03-retencao-tiktok.md` | pesquisa de retenção/engajamento com fontes e força da evidência; Duolingo e concorrentes |
| `references/04-legendas-do-post.md` | pesquisa e modelo da legenda do post, hashtags, comentário fixado, alt text |
| `references/05-pipeline-tecnico.md` | renderizador, comandos na ordem, vozes TTS, cortes de voz, legendas/VTT, render em segundo plano |
| `references/06-animacao-e-rig.md` | API do rig, poses, vistas 3/4, objetos, enquadramentos, tranco/tremida, falha digital, Tato, confete |
| `references/07-som.md` | trilhas sintetizadas, efeitos, silêncios de comédia, mix e loudness |
| `references/08-qc-e-armadilhas.md` | TODOS os erros que aconteceram e como foram corrigidos |
| `references/09-entregas-e-postagem.md` | pastas, txt, dados do TikTok do dono, dicas de postagem |
| `references/10-historico-de-casos.md` | linha do tempo do chat: pedidos, decisões, correções, acertos |
| `templates/` | código real dos cortes e ferramentas que funcionaram (copiar para `batatalk-launch-video/v8-publica/`) |
