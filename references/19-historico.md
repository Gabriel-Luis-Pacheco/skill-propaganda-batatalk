# Histórico do chat (out/2026): pedidos, decisões, correções, acertos

1. **Família V8 pública** (briefing `batatalk-launch-video/PROMPT-CLAUDE-CODE-V8.md`): 11 MP4s (master, social, anúncios A/B/C, landing, bumper) com a UI real da prática, Tato e moradores. TTS autorizado pelo dono ("autorizo TTS… até US$ 0,10"). Vozes ~US$ 0,055. Armadilhas de cantos pretos (T12), aquecimento, desfoque adaptativo, hash.
2. **"Cadê o vídeo? Me mande todos."** → enviar os arquivos, não só descrever.
3. **"O máximo de vídeos pro TikTok, só bons"** → 9 variações de gancho + versões antigas boas (V7/V6/V3) embrulhadas em 9:16.
4. **"Não iguais… se mudar levemente dá pra postar, pra testar"** → variações de gancho valem; evitar repetir o mesmo vídeo.
5. **"Use das outras versões… escolha as melhores, não só do último"** → curadoria entre todas as versões.
6. **"Cadê as legendas e #?"** → `LEGENDAS-TIKTOK.md`. **"Cria uma pasta no Downloads, subpasta por vídeo + txt"** → `Downloads/BataTalk-TikTok-21-videos/`.
7. **"1 vídeo pra viralizar"** → Desafio dos 3 segundos (26 s).
8. **"Pesquisa skills e engajamento e faz outro totalmente novo"** + dados do TikTok (Social 407 views era o melhor; zero comentários) → Quiz. Correção do dono: "for here or to go" é complexo e sem contexto; quer título "quiz de inglês com 3 perguntas pra testar seu nível" e perguntas simples → Quiz rápido (I agree / Puxe / The check). **"Tem que ter uma voz no início"** → Tato fala o título.
9. **Vídeo falado (criadora) com a Mina, formato Any Malu** ("LANÇOU A MELHOR PLATAFORMA…" → sem superlativo), roteiro com humanizer, cenário do quarto, pesquisa de reels → 44,9 s. Vozes da Mina `nova` 1,1×, cortes nos respiros. Erros: imagem do quarto não decodificava (atributo HTML), quadros-fantasma (descoberto depois).
10. **"Pq a personagem fica tremendo tanto?"** → regra do movimento calmo. **"Encerra, tá bom assim, só melhora nas próximas"** → parar o render, não reentregar, guardar o aprendizado.
11. **Esquete do bar com Priya e June** ("ai amiga, queria tanto falar inglês…, sei ler e escrever mas não sei falar"), geração Z, "usa tudo do outro e faz melhor". Pedido de orçamento de TTS (dono aprovou +US$ 0,10). 17 falas × 2 takes (~US$ 0,03). Bebidas sem álcool. Lore: no app elas falam inglês; aqui viram atrizes brasileiras.
12. **"Revise e melhore o vídeo. Pace. Pesquise profundamente (criadores, concorrentes, Duolingo)"** → v2: abertura fria com a piada, 44 → 35,6 s, travou.exe, tranco/tremida, laço final, documento de pesquisa. Erros achados no MP4: quadro-fantasma nos cortes, preto puro na falha digital, black-scan em fps errado — corrigidos e re-renderizados.
13. **"As legendas têm que ser as melhores possíveis, pesquisa"** → legenda TikTok/Reels separadas, ≤ 5 hashtags, comentário fixado da marca, alt text.
14. **"Junta tudo e faz uma skill"** → este repositório.
15. **"Pesquisa muito mais: algoritmo do Reels e do TikTok, vídeos que viralizam, animação, psicologia de prender, roteiros que prendem, falas humanizadas, anti AI slop"** → guias 11–15.
16. **"Pesquisa ainda mais… psicologia de quem assiste e como prender… visualmente, sem ser genérico e tosco. Seja proativo"** → fontes primárias (cartão de sistema do Reels da Meta com as previsões "pular em 2 s", "assistir mais que 95% de reels do mesmo tamanho", envios, uso do áudio; regras de elegibilidade do For You) no guia 11; guias novos 16 (rastreamento ocular, contágio emocional, redundância × aprendiz de língua, ativos distintivos), 17 (Duolingo/519 posts, Ryanair, Lu do Magalu, mascotes, manual do MrBeast), 18 (visual anti-genérico), 19 (comédia e história), 20 (briefing + placar mínimo 30/40 + ciclo de métricas). SKILL.md reescrito em volta de briefing → 3 conceitos → placar → produção → métricas.
17. **"Pesquisa muito mais… concorrentes, trends, melhores TikToks e Reels, coisas do momento, Duolingo e outros nichos. Mas antes pesquisa muito mais"** → atualização 2026 do algoritmo (Mosseri, originalidade, Reels de teste; o TikTok dos EUA retreinado pela Oracle, mas o Brasil segue no modelo global; rótulos de IA) e estudo de viralização (close, texto, POV) no guia 11; guias novos 21 (Duolingo a fundo + concorrentes + outros nichos), 22 (trends e cultura de out/2026, gírias, VIBES, com data), 23 (14 ideias prontas); jogo da cena e meta-análise de humor no 19; Ed Hooks e sincronia labial no 13; placar com 22 critérios (mínimo 33/44).

18. **"Analisa e revisa tudo e melhora completamente a skill"** → auditoria: o Duolingo estava em 3 guias, roteiro em 2, anti-IA em 2, VIBES em 2, o guia de algoritmo repetia sinais; havia contradições (pico −2 × −1 dBTP, pausa 0,2–0,4 × 0,2–0,5 s); o SKILL.md tinha 16 KB e mandava ler 8 guias para escrever um roteiro. Reorganização sem perda de texto: 23 guias viraram 19 na ordem do trabalho; roteador por tipo de pedido; fluxo A–F; procedimento para revisar vídeo pronto; ritmo de postagem; ferramentas `scripts/lint-roteiro.mjs` e `scripts/placar.mjs` (testadas com o roteiro do bar v2 e com um roteiro ruim de propósito); modelos de folha de batidas e de txt da legenda.

19. **"Analisa isto. Estamos indo mal… o TikTok tá cortando alcance e o Insta não divulga nem retém"** (prints de 27/10, 11h39) → diagnóstico em `references/18` (§ Diagnóstico de alcance baixo): o Desafio teve 1.258 no Instagram e 0 no TikTok; o mesmo vídeo vai 4–9× melhor no Instagram; formato participativo e curto ganham; zero comentários; o "ficar fluente" foi o pior. Próximo passo: o dono confere o Status da conta nas duas redes e manda os prints de retenção e fonte de tráfego.

20. **"Pesquise e consuma vários vídeos do TikTok que divulgam coisas… esquetes, animações… e depois pesquise a fundo todos os concorrentes de inglês, como se posicionam, como vendem, como vencer"** → coleta de 112 vídeos com métricas e roteiros (`references/20`); descoberta de que 4 dos 8 vídeos do TikTok estavam privados; o Comigo (capivara, 2,5 mi de views com a fundadora) e o motor de criadores da Praktika; o mapa de concorrentes com plano em duas fases (`references/21`); receitas separadas para TikTok e Instagram (`references/22`).

21. **"Pesquisa muito sobre o algoritmo do Instagram, como fazer Reels bons, concorrentes… as informações do Instagram têm que equivaler às do TikTok e depois superar, pois lá estamos tendo mais resultado"** → `references/23`: algoritmo oficial, Socialinsider (9,8 mi de Reels: pico em 45–60 s), Metricool (Reels ganham em compartilhamento), 224 posts medidos de 31 contas pela página de incorporação (número público = 30–80% do painel), Instagram × TikTok lado a lado; três receitas de Instagram em `references/22`; Instagram como rede principal no SKILL.md.

22. **"Pega uma ideia ou formato de vídeo que já viralizou muito no Reels e faz adaptado pro BataTalk… faça 1 e faça o melhor Reel possível pra postar agora"** → 5 opções consideradas (ao pé da letra/erro→reação, expectativa×realidade, Desafio v2, POV atendente, tipos de brasileiro); escolhido "ao pé da letra na imigração" (Mina + Evelyn, que atende a Imigração no app; chutar o balde = kick the bucket = morrer). Produção completa com o placar e o lint antes, TTS ~US$ 0,03 (total ~0,14 de 0,20), cenário novo da imigração, balões de pensamento, fantasma, Tato, carimbo com o bilhete como piada de retorno, laço "Next!". Template em `templates/src/cuts/imigracao.js`.

23. **"Faz o corte de 12–14 s para o TikTok só com o chutei o balde, sem gastar voz nova"** → `imigracao-tt.js` (13,2 s): gancho "nunca traduza ‘chutei o balde’ na imigração 💀", pergunta → erro → "You… died?" + fantasma → Tato → carimbo com cartão final (endereço + "qual expressão você ia traduzir? 👇") → "Next!". Mesmas vozes (US$ 0 de TTS). QC PASS, 0 preto puro, cortes limpos.

24. **"Pega tudo que temos na conversa de conhecimento que ainda não está na skill e coloca lá"** → entraram: onde conferir a verdade no código (character-places, city-experience e plans; a Imigração não é o encontro grátis), o custo por take de TTS e o gasto ≈ US$ 0,14, o banco de expressões ao pé da letra, a conferência da trilha por formas de onda, o mosaico de cortes e a capa por ffmpeg, e o status dos dois vídeos prontos com o que pedir depois de postar.

25. **"Faça um Reels de stand-up com piadas sobre palavras parecidas entre inglês e português; ele é um brasileiro fazendo stand-up"** (imagem do Jax) + no meio: **"Pesquisa stand-ups com piadas sobre inglês que deram certo, como foram feitos, quais piadas"** → pesquisa no YouTube pelo navegador do app, com o roteiro de cada clipe tirado da legenda automática (`entrega/v8-publica/tiktok/PESQUISA-STANDUP-INGLES.md`). Os campeões são os clipes do Rafi Bastos: 2,4–8,5 mi de views, 25–60 s, tema na 1ª frase, lógica literal de quem aprende, consequência concreta com comida, fecho na maior risada. Reel "Stand-up dos falsos amigos" (≈ 42 s):
    - o Jax como comediante brasileiro (quebra de lore avisada) na Casa de Show de Neon Purê;
    - a gringa almoça na casa da mãe; o prato é o termômetro: "exquisite" → tirou o prato; "novels" → "Novela?!" → devolveu com farofa; "pretend" → "Tipo… pro visto?" → tirou o prato e a panela;
    - o Tato sobe da caixa de retorno ("E exquisite é elogio, tá?") e o Jax fecha com "Fala isso pra minha mãe.";
    - a primeira fila (Mina, June e Malik) ri; plateia feita com banco de risadas TTS + risada e aplauso sintéticos.

    Placar no roteiro: 41/44. TTS ≈ US$ 0,078 (o dobro do previsto: takes longos), **acumulado ≈ US$ 0,22, acima do teto**. Template em `templates/src/cuts/standup.js`.

26. **"As piadas ficaram péssimas e sem sentido"**, **"as risadas fora de contexto"**, **"tá muito pouco humano"**, **"use piadas que seres humanos achariam graça… pesquise muito… inspire-se em piadas que já viralizaram… a risada ficou robotizada, as vozes não estão boas"**. O dono reprovou a v1 inteira (o placar 41/44 não pegou nada disso). Furos achados:
    - a gringa falava inglês e depois respondia em português;
    - o erro era da mãe, não do Jax;
    - a dica do Tato corrigia algo que não era erro dele;
    - imitações numa voz só;
    - piada com três saltos de raciocínio;
    - risada sintética, inclusive fora do punch.

    Pesquisa nova: o especial "Bilíngue não praticante" do Afonso Padilha (2,1 mi) e "O dia que eu fui pra Orlando" (5,5 mi), mais o método de Greg Dean (`entrega/v8-publica/tiktok/PESQUISA-STANDUP-INGLES.md` §7). O dono aprovou o roteiro v3 por escrito antes da produção:
    - **a porta**: sete anos de inglês, "PUSH", "meu cérebro leu: puxe", "puxei com força, puxei com fé", e uma criança de seis anos empurrou com um dedo;
    - **a entrevista**: "I pretend to work here for many years", pretend é fingir, "prometi olhando no olho do cara", fui contratado… pra gerente;
    - **o fecho**: "aparece uma batata pra me ajudar. Uma batata, gente. E o danado fala inglês melhor que eu".

    Voz: o dono mandou usar "as melhores possíveis" da OpenAI → **gpt-audio-1.5** (Chat Completions com saída de áudio, voz `cedar`). Cada piada é um bloco corrido, cortado só nas pausas mortas (`tools/voice-audio.mjs`). A transcrição veio idêntica nos 6 takes; 1.791 tokens de áudio ≈ US$ 0,12, autorizado pelo dono acima do teto. Risadas: gravações reais da Mixkit (5 WAVs baixados com permissão, licença de efeitos gratuita para redes e anúncios), só depois de punch. Corte `standup3` (`src/cuts/standup3.js`, ≈ 46 s).

27. **"Eu amei. Só dá pra ajustar algumas leves coisas… o som ambiente de chiado, talvez o pace de algumas partes… revisa tudo e corrige"** → v3 revisada (43,9 s):
    - o chiado era a ambiência sintética (−25 dBFS nas pausas): saiu, e o piso nas pausas foi a −120 dBFS;
    - o volume pulava entre trechos do mesmo take: agora normaliza o take inteiro (`normWhole`);
    - pace: fala a 1,05× e as pausas mortas mais curtas, incluindo 0,41 s no meio de "olhando no olho do cara"; as pausas de comediante antes do punch ficaram;
    - saíram os "toc" nos puxões e o 🚪, que virava quadradinho.

    **O que agradou**: piadas de gente (a porta, o "pretend", a batata), voz do gpt-audio, risada real.

28. **"faz um reels incrível e que vai viralizar… o que acontece se você começar a estudar inglês todo dia? 1 dia, 10, 100, 1000"** (03–05/11): **o Reel campeão (3.650 views)**. Tudo em `24` (regras), `25` (revisão com agentes), `26` (pesquisa) e `casos/e-se-dias/` (documentos brutos e as mensagens do dono). A sequência:
    - "faz tipo esses" (@rmhkaiser "E se tu acordasse com telecinese?", @esev0ce, @lunarcheeseee) e "NÃO usa o For here or to go";
    - "o foco NÃO é divulgar o BataTalk, só um Reels engraçado"; "não precisa envelhecer, é tipo Gumball";
    - "animações melhores e mais fluidas", "cenários e roupas bem feitos", "mãos não atravessam nada";
    - "usa o ícone do app, não essa logo horrível";
    - v1 → "pacing, trilha, bugs, títulos e textos muito esquisitos e descentralizados" → v2 (`pin()` centralizado, cartões sobre a cena, trilha com arco, ambiência por cena);
    - "analise criticamente", "lança muitos Haikus", "faça mais rodadas", "refaz com o Sonnet", "pesquisa onde a IA erra em roteiro, legenda e hashtag, e algoritmo, crescimento, ritmo e gancho" → 6 rodadas com 45 agentes; o roteiro foi do v6 ao v10 no papel;
    - "Sim, produz o v10" + "usa os nomes novos dos personagens" (Caio, Vera, Nina, Marcos, Beto);
    - "ficou bom, mas tem pontos no sense pra quem é leigo… narrador no começo?" → revisão sobre os **quadros reais** com 14 agentes → v11 (celular grande do app, FLUSH!, prédio cortado com nomes, vassoura no teto, narrador só no gancho, "Quem aí fala inglês escondido?");
    - "**o intuito é só ser divertido, engraçado, compartilhável, viralizador**";
    - "por que a Vera falou em inglês?" → v12 com "Cala a boca, Caio!" em português.

    Gasto de voz: ≈ US$ 0,07 no total (gpt-audio-1.5, 37 falas × 2 tomadas, 3 rodadas autorizadas). Armadilhas: render com EBUSY, build de cache antigo, sussurro baixo demais, braços cruzando o corpo, câmera presa na borda do mundo (tudo em `16` e `13`).

## O que agradou

Pesquisa embasando cada decisão; proatividade; skill organizada e com ferramentas; várias opções; vídeos que parecem nativos; personagens com personalidade; humor de meme brasileiro; acabamento técnico (QC, área segura). **(03–05/11)** O formato "E se…? dia 1/10/100/1000" com piada por marco; uma regra de jogo que escala; "Moço, eu falo português"; a vassoura no teto com o "…thank you!" dormindo; revisão por muitos agentes, Haiku e Sonnet, sobre os quadros reais; nomes do app no elenco.

## O que desagradou

Tremor dos personagens; perguntas difíceis/sem contexto; vídeos longos e lentos (master 40 views); repetir o mesmo vídeo; parar sem entregar; não mostrar os arquivos. **(03–05/11)** Texto descentralizado, inclinado ou balançando; cenas sem causa ("confete do celular, que??"); personagem falando inglês sem motivo; logo genérica em vez do ícone do app; personagem envelhecendo; responder "terminou?" sem conferir o log do render.
