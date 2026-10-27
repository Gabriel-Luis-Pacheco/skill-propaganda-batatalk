---
name: propaganda-batatalk
description: Cria, revisa e entrega vídeos curtos de propaganda do BataTalk para TikTok e Reels — esquetes com o elenco de Batata City, vídeo de criadora (vlog animado), quiz, variações de gancho — no renderizador próprio do repositório (batatalk-launch-video/v8-publica). Baseada em pesquisa sobre algoritmo (Meta Reels/TikTok For You), psicologia de quem assiste (olhar, emoção, identificação, compartilhamento), Duolingo/concorrentes/marcas de outros nichos, trends do momento, banco de ideias, ofício de comédia (jogo da cena), falas humanas anti-"cara de IA", visual autoral, animação calma, som, QC técnico, legendas do post e placar de qualidade antes de renderizar. Use para qualquer pedido de vídeo, propaganda, TikTok, Reels, esquete, roteiro, legenda de post ou revisão de vídeo do BataTalk.
---

# Propaganda BataTalk — vídeos curtos que prendem, sem mentir

Esta skill junta tudo o que funcionou (e o que deu errado) na produção dos vídeos do BataTalk para TikTok e Reels em outubro de 2026: a família V8 pública, as variações de gancho, o Desafio 3s, o Quiz rápido, o vídeo falado da Mina e o esquete do bar (Priya e June). Junta também a pesquisa de algoritmo, de psicologia do espectador, de casos que viralizaram, de comédia, de visual e de legendas. **Leia os arquivos de `references/` antes de agir.** Os detalhes, os números e as fontes estão lá.

## A ideia central em 6 linhas

1. **O algoritmo é um espelho do espectador.** O Reels prevê se a pessoa vai pular em 2 s, assistir mais que 95% dos vídeos do mesmo tamanho, comentar, compartilhar, mandar no direct ou fora do app, seguir e usar o áudio. O TikTok ranqueia por interações, tempo assistido, se a pessoa assistiu até o fim e originalidade (`references/11`).
2. **Quem assiste olha primeiro para rostos, olhos e movimento**, em ~200 ms. A emoção do personagem passa para quem assiste, e passa mais quando o personagem é simpático (`references/16`).
3. **As pessoas compartilham o que dá emoção forte** (rir, se surpreender, sentir orgulho) **e o que diz algo sobre elas** ("isso é a gente") (`references/12`).
4. **Prende quem tem causa e efeito.** Cada batida liga à anterior com "mas" ou "então", a lacuna é curta e a piada vem no tempo certo, com pausa e reação (`references/14`, `references/19`).
5. **Soa gente**: subtexto, oralidade, cada personagem com seu jeito de falar, sem tique de IA (`references/15`).
6. **Parece BataTalk**: ativos distintivos (Tato, paleta, Fredoka, motivo sonoro), vetor autoral, movimento calmo e técnica impecável (`references/13`, `references/18`).
7. **Aja como criador, não como anunciante.** O Duolingo só cresceu quando parou de dar aula e transformou o mascote em personagem. O primeiro sucesso deles foram comentários, e o primeiro vídeo que estourou foi o 39º. Muitas tentativas pequenas, rápidas e nativas, com um universo que o público quer acompanhar (`references/21`, `references/22`, `references/23`).

## Quando usar

Qualquer pedido de vídeo, propaganda, TikTok, Reels, esquete, roteiro ou legenda de post do BataTalk. Também a revisão de um vídeo já feito: "melhora o pace", "deixa mais engajado", "as legendas têm que ser as melhores".

## Fluxo (siga nesta ordem)

1. **Verdade do produto e limites** → `references/01-marca-produto-e-verdade.md`.
   - Só afirmações verdadeiras: grátis para começar, sem cartão, no navegador, 14 cidades, conversa em voz alta, dica do Tato.
   - Nada de "a melhor", depoimento falso ou resultado inventado.
   - Vozes de IA sempre avisadas.
2. **Orçamento e permissões antes de gastar.**
   - TTS pago só com autorização explícita e dentro do teto combinado. Histórico: teto de US$ 0,10, depois ampliado pelo dono para US$ 0,20 no total; gasto até 27/10 ≈ US$ 0,11.
   - Se o vídeo novo precisa de vozes novas e o teto não cobre, **pergunte antes** (AskUserQuestion com opções e custo estimado).
   - Prefira reaproveitar falas já geradas (`picks.json`) quando servirem.
3. **Briefing + 3 conceitos** → `references/20-placar-e-briefing.md`.
   - Preencha o briefing: dor específica, emoção-alvo, motivo para mandar a alguém, gatilho do dia a dia, prova do produto, ativos.
   - Escreva 3 ideias (gancho + virada + prova) e escolha uma.
   - Comece pelo **banco de ideias** (`references/23-banco-de-ideias.md`) e pela lógica dos casos (`references/17-casos-que-viralizaram.md`, `references/21-duolingo-e-concorrentes-a-fundo.md`): o mascote como personagem, o app como prova rápida e não como discurso, os comentários como roteiro.
   - **Cheque o momento** (`references/22-trends-e-cultura-do-momento.md`): pesquise de novo as trends da semana (a lista lá tem data), passe no filtro VIBES e use áudio original.
4. **Roteiro / folha de batidas** → `references/14-roteiros-que-prendem.md`, `references/19-oficio-de-comedia-e-historia.md`, `references/12-psicologia-e-viralizacao.md`, `references/16-ciencia-do-espectador.md`, `references/15-falas-humanas-anti-slop.md`, `references/02-roteiro-e-humor.md`, `references/03-retencao-tiktok.md`, `references/11-algoritmo-reels-e-tiktok.md`.
   - Abertura fria: a piada ou o valor no quadro 0, com rosto, texto-gancho e voz.
   - 21–34 s, algo novo a cada 2–4 s, reengajamento no meio.
   - Pausa de 0,2–0,5 s antes da piada; reação segurada; etiquetas.
   - Final que emenda no começo.
   - Pergunta fácil para comentar e marca-a-amiga.
   - Pt-BR falado de verdade, com uma impressão digital para cada personagem.
   - Teste da Pixar ("Era uma vez… até que finalmente") e teste "mas/então".
   - Esquete = **jogo da cena**: realidade base → primeira coisa estranha → escalar 2–3 vezes → virada.
   - Anote a **intenção** de cada fala (o que o personagem quer naquela frase).
5. **Placar antes de produzir** → pontue o roteiro e o storyboard no placar de `references/20`.
   - Mínimo de 33 de 44 pontos, e nenhum item ★ com 0.
   - Se não passar, reescreva. Não "conserte na animação".
6. **Vozes** → `references/05-pipeline-tecnico.md`.
   - Comandos: voice-final, picks, analyze-voices e voice-fast 1,1×.
   - Cortes nos respiros com `AudioList.clip`; palavras realinhadas por sílabas.
   - Direção de voz como atuação, não leitura (`references/15`).
7. **Cena, rig e animação** → `references/06-animacao-e-rig.md`, `references/13-animacao-de-qualidade.md`, `references/18-visual-sem-cara-generica.md`.
   - Visual: vetor chapado (nunca pintura, foto ou IA raster); o Tato é o único volumétrico; uma luz por cena; mundo vivo com objetos que têm piada; profundidade.
   - Rostos e olhos: olhos no terço superior; um rosto dominante por plano; movimento só onde você quer o olhar.
   - **Movimento calmo**: o corpo segue a fala suavizada; cabeça e mãos se mexem no começo das frases; gestos grandes com antecipação e mola; nada tremendo.
   - Atuação e boca: a emoção aparece no rosto antes da ação. A boca vai 1–2 quadros à frente do som. B/M/P fecham. Não animar cada letra.
   - Rosto em close ou plano médio enquanto fala.
8. **Som** → `references/07-som.md`.
   - Voz desde o quadro 0.
   - Música cai antes da piada (silêncio de comédia).
   - Efeitos de meme próprios; motivo sonoro Ré–Fá♯–Lá.
   - −15 LUFS, pico ≤ −2 dBTP.
9. **Revisão por quadros, render e QC técnico** → `references/08-qc-e-armadilhas.md`.
   - Antes do render: `tools/stills.mjs --sheet`, correções, **verify-determinism**, **alpha-scan**, exportar a linha do tempo, mixar.
   - Render em segundo plano com `V8P_HASH_SCOPE=film`, depois montar.
   - Depois do render: **qc + black-scan + safezone + folha de 1–2 quadros por segundo + quadros em volta de cada corte**.
   - Pontue o placar de novo com o vídeo pronto.
10. **Legenda do post, hashtags, comentário fixado, texto alternativo** → `references/04-legendas-do-post.md`.
    - Versão TikTok (palavras-chave buscáveis) e versão Reels (manda pra amiga).
    - No máximo 5 hashtags.
11. **Entregue** → `references/09-entregas-e-postagem.md`.
    - Pasta `Downloads/BataTalk-TikTok-21-videos/00_<NOME>/` com o `.mp4` e `legenda-e-hashtags.txt`.
    - Envie o arquivo no chat.
    - Atualize `LEGENDAS-TIKTOK.md`, `PROGRESSO.md` e a transcrição (`tools/captions.mjs`).
12. **Feche com a verdade e com o ciclo de métricas.**
    - Diga o que foi checado, o que ninguém ouviu ou assistiu ainda, quanto gastou e as fontes da pesquisa, com links.
    - Proponha o pós-postagem de `references/20` §4: anotar retenção 3 s, % assistida, envios e comentários em 24–72 h; os comentários viram o próximo roteiro.

## Regras que não se quebram

- **Verdade e lei.**
  - Sem superlativo sem prova ("a melhor" → CONAR/TJSP exigem prova), sem depoimento falso, sem promessa de fluência ou prazo.
  - Personagens são personagens: diga no post que não é depoimento de cliente.
  - "Exemplo animado" nas telas do app; "Vozes geradas por IA" no vídeo; selo de IA no TikTok.
- **Bebida alcoólica**: não. Bar = limonada e café (público jovem, regras de anúncio).
- **Personagem da marca**: o Tato ajuda e nunca humilha. Nenhuma piada que rebaixe o espectador ou um grupo; a vergonha é leve e compartilhada (violação benigna).
- **Não publicar, não impulsionar, não comprar mídia, não mandar mensagem.** Quem posta é o dono.
- **Nunca ler nem servir `.env`.** A chave entra só via `node --env-file=../.env`.
- **Não sobrescrever entregas antigas** sem querer. Não mexer na landing nem em analytics de produção. Não "consertar" o produto para o anúncio parecer verdade.
- **Não editar fontes do filme durante um render.** O render aborta de propósito: `generated/` e todo `.js/.mjs/.css/.html/.json/.wav` de `v8-publica` fora de `tools/` e `audio/out` entram no hash.
- **Feedback do dono vale como regra.**
  - Movimento calmo, sem tremor.
  - Não postar o mesmo vídeo várias vezes; variações de gancho servem para testar.
  - "Usa as versões antigas também, escolhe as melhores."
  - "Faz o máximo de vídeos diferentes."
  - Quando ele diz "encerra/tá bom assim", pare e só leve o aprendizado para os próximos.

## Checklist antes de entregar (o resumo do placar)

**Primeiros 2 segundos** (o Reels prevê "pular em 2 s")
- [ ] Rosto expressivo, falando, olhos no terço superior; texto-gancho curto no quadro 0 (ele é a capa); som desde o início
- [ ] A piada ou a promessa entendida sem som e sem contexto do app

**Retenção** (tempo assistido relativo, assistir até o fim, repetir)
- [ ] 21–34 s (ou justificado), nenhuma pausa morta > 0,5 s, estímulo novo a cada 2–4 s
- [ ] "Mas/então" entre as batidas; lacuna curta (< 15 s) aberta e fechada
- [ ] Pausa antes da piada, reação segurada com vida, final em laço

**Emoção e identificação** (comentar, compartilhar, mandar no direct)
- [ ] Emoção de alta ativação **visível no rosto** do personagem
- [ ] Detalhe específico brasileiro ("isso sou eu"); motivo claro para **mandar** a alguém
- [ ] Pergunta fácil para comentar + marca-a-amiga

**Humano e autoral**
- [ ] Nenhum tique de IA ("não é X, é Y", trio automático, tom de anúncio); cada personagem soa diferente
- [ ] Visual sem cara genérica: paleta da marca, uma luz, mundo vivo, profundidade; Tato presente num momento-chave; endereço no fim
- [ ] Animação: antecipação nas ações grandes, poses claras, olhos no mesmo terço entre cortes, nada tremendo

**Técnico e entrega**
- [ ] Legenda palavra a palavra na cor de quem fala, fora do rosto, na zona segura (x 120–960, y 270–1248)
- [ ] Determinismo PASS, alpha-scan limpo, QC PASS (h264/bt709/aac 48k, −15 LUFS ±1,5, pico ≤ −1 dBTP), black-scan 0, sem quadro "fantasma" nos cortes
- [ ] Arquivo limpo para cada rede (sem marca d'água cruzada TikTok→Reels); áudio original reutilizável
- [ ] `legenda-e-hashtags.txt` com versões TikTok e Reels, ≤ 5 hashtags, comentário para fixar, alt text, avisos
- [ ] Formato nativo da plataforma (POV, reação, dueto, resposta a comentário) e nada que pareça anúncio de TV; só o BataTalk faria este vídeo
- [ ] Placar ≥ 33/44, sem ★ zerado; gasto de TTS informado; fontes citadas

## Mapa de arquivos desta skill

| Arquivo | O que tem |
|---|---|
| `references/01-marca-produto-e-verdade.md` | fatos do produto, o que pode e não pode dizer, elenco com pronomes e vozes, estilo de arte, preferências do dono |
| `references/02-roteiro-e-humor.md` | estrutura de roteiro, humanizer/anti-slop, humor geração Z, memes (VIBES), roteiros prontos que funcionaram |
| `references/03-retencao-tiktok.md` | pesquisa de retenção e engajamento com fontes e força da evidência; Duolingo e concorrentes |
| `references/04-legendas-do-post.md` | pesquisa e modelo da legenda do post, hashtags, comentário fixado, alt text |
| `references/05-pipeline-tecnico.md` | renderizador, comandos na ordem, vozes TTS, cortes de voz, legendas/VTT, render em segundo plano |
| `references/06-animacao-e-rig.md` | API do rig, poses, vistas 3/4, objetos, enquadramentos, tranco e tremida, falha digital, Tato, confete |
| `references/07-som.md` | trilhas sintetizadas, efeitos, silêncios de comédia, mix e loudness |
| `references/08-qc-e-armadilhas.md` | TODOS os erros que aconteceram e como foram corrigidos |
| `references/09-entregas-e-postagem.md` | pastas, txt, dados do TikTok do dono, dicas de postagem |
| `references/10-historico-de-casos.md` | linha do tempo do chat: pedidos, decisões, correções, acertos |
| `references/11-algoritmo-reels-e-tiktok.md` | o que o Reels e o TikTok medem (fontes oficiais: cartão de sistema da Meta, regras do For You), atualização 2026 (Mosseri, originalidade, Reels de teste, EUA × Brasil no TikTok, rótulos de IA), estudo de viralização, regras práticas |
| `references/12-psicologia-e-viralizacao.md` | ciência de prender e de compartilhar (Berger & Milkman, STEPPS, Loewenstein, McGraw) + checklist |
| `references/13-animacao-de-qualidade.md` | 12 princípios de animação aplicados ao rig, atuação, câmera, checklist |
| `references/14-roteiros-que-prendem.md` | "mas/então", esqueleto de 30 s, tipos de gancho, ferramentas de retenção, revisão |
| `references/15-falas-humanas-anti-slop.md` | tiques de IA e trocas, como gente fala, identificação, direção de voz, teste final |
| `references/16-ciencia-do-espectador.md` | rastreamento ocular (rostos, olhos, movimento), contágio emocional, efeito de redundância e legenda, ativos distintivos, gatilhos de identificação |
| `references/17-casos-que-viralizaram.md` | Duolingo (e o estudo de 519 posts), Ryanair, Lu do Magalu, mascotes, manual do MrBeast, nossos próprios dados |
| `references/18-visual-sem-cara-generica.md` | sinais de visual genérico e o que fazer no BataTalk, detalhes que tiram o "tosco", composição 9:16 e zonas seguras, ativos |
| `references/19-oficio-de-comedia-e-historia.md` | molde da Pixar, preparação e virada, pausa, etiquetas, regra de três × trio de IA, callback, ritmo de esquete |
| `references/20-placar-e-briefing.md` | briefing, 3 conceitos, placar de 22 critérios (mínimo 33/44), ciclo de métricas pós-postagem, Reels de teste, comentários do Tato |
| `references/21-duolingo-e-concorrentes-a-fundo.md` | como o Duolingo fez de fato (comentários, 39º vídeo, Flicker/Flash/Flare, "Duo morreu", o erro do "AI-first", a Lily, o perfil BR); concorrentes de idiomas; Ryanair, Scrub Daddy, Liquid Death, Nutter Butter, Oreo, Audible, Duracell, Chikn Nuggit |
| `references/22-trends-e-cultura-do-momento.md` | TikTok Next 2026, Mosseri e a "crueza como prova", rótulos de IA, formatos de out/2026, cultura do "inglês de brasileiro", gírias com regras, filtro VIBES (com data: pesquise de novo) |
| `references/23-banco-de-ideias.md` | 14 ideias prontas para briefing (séries, identificação, desafios, histórias com lacuna, momento, bastidores) |
| `templates/` | código real dos cortes e ferramentas que funcionaram (copiar para `batatalk-launch-video/v8-publica/`) |
