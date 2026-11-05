# Auditoria crítica do v1 (03/11, MP4 assistido a 2 quadros por segundo) e plano do v2

Pedido do dono: melhorar pacing, trilha, bugs de animação, títulos e textos "muito esquisitos e descentralizados", cenas estranhas, "cada detalhezinho perfeito", com pesquisa e as melhores skills.
Skills usadas: ai-video-director (QA artístico: assistir sem pausa, mudo, só áudio, evidence ledger), captions-and-clipping (legenda palavra por palavra, ~2 linhas, centralizada), ai-music-and-sound (música por beats do vídeo, SFX nos cortes, licença), hyperframes-animation (regras de movimento: spring, antecipação, follow-through), viral-reverse-engineering (mecanismo, não superfície), propaganda-batatalk. Web: guias de zona segura 2026 (Meta: 14% topo, 35% base, 6% lados; área comum ≈ 900×1400 centrada; legenda a ~65–70% da altura), ritmo de comédia curta (3–5 s por plano; esquetes 21–34 s), mix (diálogo −6 a −3 dB de pico, SFX ~−12, ambiência −18 a −24, música ~−18, ducking), música de comédia cartoon (110–130 BPM, pizzicato/marimba/ukulele).

## Evidence ledger (tempo → o que se vê → causa → correção)

| Tempo | Observado | Severidade | Correção no v2 |
|---|---|---|---|
| 0–2,3 | rótulo inclinado cobre o cabelo; Cam estático e pequeno | P1 | rótulo centralizado sem inclinação, Cam mais baixo no quadro, ação no gancho |
| 4,3–7,7 | 3,4 s de inserto do celular (tela vazia, sem personagem) | P1 pacing | banner de download por cima do Cam (50% da duração, rosto sempre visível) |
| 7,7–8,6 / 16,2–17,2 / … | 5 cartões cheios (≈4,5 s) param a história; número alto, metade de baixo vazia | P1 pacing | cartão vira sobreposição sobre a próxima cena desfocada, 0,6 s, centralizado na vertical |
| 9–11 | etiqueta "fale em voz alta" inclinada, sobre o cabelo, piscando | P1 texto | pílula centralizada abaixo do HUD, sem inclinação, espaço livre acima da cabeça |
| todos | chip "DIA N" no canto superior esquerdo (x 250) bate em cabelo/chapéu/balão | P1 texto | HUD único, centralizado no topo (x 540), sem inclinação |
| todos | adesivos balançam (rotação senoidal contínua em `stick`) | P1 texto | `pin()` próprio: mola de entrada, nenhuma rotação, nenhum balanço |
| 12–15 | armário muito escuro, cabelo some no fundo (Cam parece careca) | P1 cena | fundo mais claro, luz de recorte atrás da cabeça, vinheta mais leve |
| 17–24 | chuveiro: peito nu com "bolinhas", braços finos, "placa" creme que parece bancada | P1 cena/bug | Cam de roupão, parede de box de vidro fosco com moldura, shampoo como microfone |
| 19–25 | Marlene em pé sobre a cama; copo no queixo (parece beber); sala vazia 1 s | P1 cena | cama atrás, ela no chão, copo no ouvido; sem quadro vazio |
| 26–31 | sonho: Cam minúsculo na faixa verde, balão sem contexto | P1 cena | Cam deitado de lado no travesseiro, cama desenhada, balão em cima da cabeça |
| 31–37 | rua: dois personagens parados por 6 s | P1 pacing/animação | entrada do turista já em movimento, idle com troca de pose, gestos |
| 43–50 | bar: bloco marrom liso ocupa ~30% do quadro; Cam abraça o próprio corpo (mãos sobrepostas) | P1 cena/bug | balcão com frente decorada; limpar os olhos / mão na barriga separada; cortes para reações |
| 41,5; 47,4; 37 | chip sobre o chapéu/neon | P1 texto | HUD central |
| 57,1–59,3 | cartão final: chips inclinados e desalinhados; 0,45 s com um chip sozinho; muito vazio | P1 texto | grade 2×2 centrada, tamanhos iguais, pergunta grande, sem chip solitário |
| legendas | quebra de página em "VOU CHAMAR O / SÍNDICO", "E CHOROU COM / O CONFETE" | P2 texto | quebrador que nunca termina página em artigo/preposição |
| áudio | trilha única (lofi) para o vídeo todo, sem arco; SFX genérico; ambiência de café em tudo | P1 áudio | trilha nova com arco por dia (esparso → groove → cheia → nostálgica), riser + impacto nos cartões, foley (passos, porta, batida, água), ambiência por cena |

Itens que dependem de playback com som: UNKNOWN até ouvir no celular (o agente não ouve áudio).

## Regras de texto que o v2 segue (viral, não decoração)
- Tudo centrado no eixo vertical (x = 540), nenhum adesivo inclinado ou balançando; só mola de entrada (scale) e fade.
- Um único HUD (DIA N) no topo central, dentro da zona segura (y ≈ 300).
- Legenda: 2–4 palavras, caixa alta, centralizada, ~65% da altura, palavra da vez colorida; nunca termina a página em artigo.
- Cartão do dia: número centralizado na altura real do quadro, sobre a cena desfocada (não tela cheia lisa).
- Nada de texto sobre o rosto: o enquadramento garante cabeça livre abaixo do HUD.
