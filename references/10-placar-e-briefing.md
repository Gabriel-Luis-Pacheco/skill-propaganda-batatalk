# Placar de qualidade e modelo de briefing

## 1. Briefing (preencha antes de escrever uma linha)

```
Objetivo do vídeo: (alcance / comentários / envios / cliques no site)
Plataforma principal: (TikTok / Reels / ambas — versões diferentes?)
Para quem: (ex.: brasileiro 18–30 que estudou inglês na escola e trava pra falar)
A dor específica: (uma frase, com detalhe real)
A emoção-alvo (alta ativação): (risada / surpresa / orgulho / alívio)
O gatilho do dia a dia que vai lembrar o vídeo: (frase, lugar, som)
Por que alguém MANDARIA isso pra outra pessoa:
Personagens e impressão digital de fala de cada um:
A prova do produto (que tela do app, que verdade):
Ativos da marca presentes: (Tato, paleta, motivo sonoro, endereço)
Restrições: (TTS: teto e gasto atual; verdade/CONAR; sem álcool; avisos de IA)
Métrica de sucesso e comparação: (ex.: retenção 3 s e % assistida vs. vídeo X)
```

## 2. Três conceitos antes de escolher

Escreva 3 ideias diferentes (gancho em uma linha + virada + prova) e escolha pela tabela abaixo. Guarde as outras como variações para teste.

## 3. Placar (0, 1 ou 2 em cada item; **mínimo 33 de 44 para renderizar**, e nenhum item obrigatório (★) com 0)

| # | Critério | 0 | 1 | 2 |
|---|---|---|---|---|
| 1★ | Quadro 0: rosto em close/plano médio + texto-gancho + algo acontecendo | falta | parcial | tudo |
| 2★ | Piada/valor nos 3 primeiros segundos | > 6 s | 3–6 s | < 3 s |
| 3 | Duração adequada | > 45 s sem motivo | 35–45 s | 21–34 s |
| 4★ | Uma ideia só; "mas/então" entre as batidas (jogo da cena que escala) | "e depois" / duas ideias | quase | tudo causal, uma ideia |
| 5 | Estímulo novo a cada 2–4 s | buracos > 6 s | alguns | sempre |
| 6 | Emoção de alta ativação clara | não | fraca | forte e visível no rosto |
| 7 | Lacuna curta aberta e fechada | nenhuma | longa demais | < 15 s |
| 8★ | Identificação ("isso sou eu") com detalhe específico brasileiro | genérico | médio | específico |
| 9★ | Falas humanas (sem tiques de IA, impressão digital por personagem) | cara de IA | ok | soa gente |
| 10 | Pausa antes da piada + reação segurada | não | às vezes | sempre |
| 11 | Motivo para mandar a alguém / marcar | não | fraco | claro |
| 12 | Pergunta fácil para comentar | não | aberta demais | fácil e com opções |
| 13 | Final forte (pico-fim) / laço | morno | forte | laço que emenda |
| 14★ | Verdade do produto, CONAR, avisos de IA | falha | — | ok |
| 15 | Ativos da marca presentes (Tato, paleta, som, endereço) | nenhum | alguns | todos |
| 16★ | Animação calma, sem tremor; poses fortes; antecipação | treme | ok | profissional |
| 17 | Visual não genérico (mundo vivo, cor com intenção, profundidade) | genérico | ok | autoral |
| 18 | Legenda legível, na cor de quem fala, fora do rosto, zona segura | falha | ok | perfeita |
| 19★ | Técnico: determinismo, alpha, QC, black-scan, sem fantasma nos cortes | falha | — | tudo PASS |
| 20 | Som: voz desde o início, silêncios de comédia, efeitos de meme, −15 LUFS | falha | ok | marcante |
| 21 | Originalidade: só o BataTalk faria este vídeo (elenco, mundo, piada própria; áudio original) | genérico/repost | parece nosso | inconfundível |
| 22 | Formato nativo: usa um formato da plataforma (POV, "my reaction if", dueto, resposta a comentário) ou uma trend viva que passou no VIBES | anúncio de TV | nativo | nativo + do momento |

Itens com "—" são binários (0 ou 2).

## 4. Depois de postar (o ciclo que melhora o próximo)

1. Em 24–72 h, anotar: views, retenção 3 s / taxa de pulo, tempo médio, % assistida, repetições, comentários, compartilhamentos/envios, salvamentos, seguidores ganhos.
2. Comparar com o vídeo anterior parecido e com a variação de gancho.
3. Ler os comentários: frases reais viram roteiro do próximo vídeo (o "briefing" do Duolingo).
4. Registrar no `references/19-historico.md` o que funcionou e o que não.
5. Testar ganchos sem cansar quem já segue: no Instagram, sugerir ao dono os **Reels de teste** (vão primeiro para quem não segue) e comparar um teste só com outros testes.
6. Sugerir ao dono **comentários do Tato** (em personagem) para ele publicar em vídeos de criadores de inglês e de intercâmbio: foi assim que o Duolingo começou. A skill só escreve os textos; quem publica é o dono.

## 5. Ferramentas do placar

- `node scripts/placar.mjs --modelo > placar.json` gera o arquivo para preencher. `node scripts/placar.mjs placar.json` soma, bloqueia ★ zerado e nota inválida (os itens 14 e 19 só aceitam 0 ou 2) e lista onde ganhar pontos.
- Pontue **três vezes**: no roteiro (itens 1–15, 21, 22; os outros entram com a nota esperada), no storyboard/folha de quadros e no MP4 pronto.
- `node scripts/lint-roteiro.mjs roteiro.md` acha os riscos legais (ERRO) e os tiques de IA (AVISO) e estima o tempo falado. Com `--post`, checa também o txt da legenda. Ele não sente graça: a leitura em voz alta continua obrigatória.

## 6. Revisar um vídeo que já existe ("melhora o pace", "deixa mais engajado")

1. **Assista como espectador**: folha de 1–2 quadros por segundo + quadros em volta de cada corte (`references/16-qc-e-armadilhas.md`). Anote o tempo da primeira risada, a primeira fala e cada pausa morta > 0,5 s.
2. **Mapa de retenção no papel**: para cada trecho de 3 s, o que há de novo (corte, piada, adesivo, som)? Os buracos são onde as pessoas saem.
3. **Pontue no placar** e ordene os problemas: primeiro os ★, depois os de maior peso para o algoritmo (2 s iniciais, duração, envio, laço).
4. **Lista de correções em ordem de impacto** (exemplo real do bar v1 → v2: piada aos 13 s → abertura fria; 44 s → 35,6 s; sem laço → laço; sem pedido de comentário → marca-a-amiga + comentário fixado).
5. Reaproveite o que existe (vozes em `picks.json`, cenários, cortes) antes de gastar. Diga o custo antes, se houver.
6. Refaça, rode o QC inteiro, pontue o MP4 de novo e compare os placares (antes × depois).
