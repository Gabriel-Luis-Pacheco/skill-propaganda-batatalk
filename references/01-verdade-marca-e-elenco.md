# Marca, produto e verdade

## O que o BataTalk é (pode dizer)

- Site para **treinar conversa em inglês falando, em voz alta**, com moradores de Batata City (barista no café, imigração no aeroporto, entrevista de emprego…).
- **Quando você trava, o Tato (a batata coach) sopra uma dica** — e quem responde é você. No app: botão "Preciso de ajuda" (no celular aparece só "?"), degrau 1 "PALAVRAS ÚTEIS · to go · for here", degrau 2 "COMO COMEÇAR · Termine com: “… please.”". Não existe "To go = para levar" como string no produto: não desenhar isso.
- **14 cidades, 58 lugares.** Primeiro lugar de cada cidade grátis.
- **Dá pra começar de graça. Sem cartão. Direto no navegador.** Plano grátis = 1 conversa guiada por dia (beta: `LAUNCH_MODE=free_beta`).
- Endereço falado: "Bata Tók ponto com ponto bê erre" (no TTS, escreva `say:` assim). "BataTalk" pronuncia-se "Bata Tók".
- A reação final do Sora no app é gerada por modelo; no filme usamos a fala plausível "Perfect. Coming right up!" dentro de "Exemplo animado".

## O que NÃO pode

- Superlativo sem prova ("a melhor plataforma") — CONAR/TJSP exigem comprovação. Troque por algo verdadeiro e mais nativo ("Lançaram um site pra treinar inglês falando…").
- Depoimento/resultado inventado ("aprendi em 2 semanas"), antes/depois de eficácia sem aprovação (política em `company/marketing/CLAIMS_AND_CAMPAIGNS_POLICY.md`).
- Fingir que personagem é cliente real. Na legenda/dicas: "A Mina/Priya/June são personagens do BataTalk, não é depoimento de cliente."
- Álcool em conteúdo de marca para público jovem (bar = limonada + café).
- Copiar personagem/estilo/bordão de terceiros: "estilo Any Malu" = só o FORMATO (vlog animado no quarto, cortes, zooms, efeitos), nunca o design, nome ou falas dela.
- Mudar o produto para o anúncio parecer verdade.

## Avisos obrigatórios

- No vídeo: "Vozes geradas por IA · exemplos animados" (≥ 32 px no 9:16 para ler a 360 px) e selo "Exemplo animado" nas telas do app.
- No TikTok: ativar o selo "Conteúdo gerado por IA".

## Copy em pt-BR

Tudo que fala com o espectador é pt-BR (título, adesivo, legenda, oferta). Inglês só no que o aluno pratica (diálogo). Correção do dono já em 09/2026.

## Elenco (character-cast.js / character-designs.js)

| Personagem | Pronomes | Idade | Essência | Voz TTS usada |
|---|---|---|---|---|
| Tato (batata coach) | ele | — | coach caloroso, brincalhão; único volumétrico | `cedar` (pt) |
| Mina Haddad | ela | 21 | atenção quieta; jardineira jade, bob preto | `nova` (pt, persona criadora 21 anos) |
| Priya Raman | ela | 32 | controle; blazer ameixa, crachá; chora toda quinta no reality "Love Harbour"; fala em listas ("Duas coisas.") | `coral` (EN recrutadora; pt dramática no bar, persona `priyaBR`) |
| June Park | ela | 35 | franqueza calma, humor seco, tatuadora, caneca; frases curtas | `alloy` (pt, persona calma grave) |
| Sora Nakamura | ele | 27 | barista do Café Central; pergunta "For here or to go?" | `ash` (EN) |
| Evelyn Shaw | ela | 72 | imigração ("How long will you be staying?") | `sage` (EN) |
| aluno/learner | — | 26 | brasileiro praticando | `marin` (EN com sotaque leve) |

Outros moradores: Jax, Malik, Vera, Cam, Gus, Nia, Dante. **Nunca deduza pronome pela aparência — leia `character-cast.js`.** No app, Priya/June/Sora são NPCs que falam inglês; num esquete eles podem virar "atores" brasileiros (avise o dono da quebra de lore se for relevante).

## Estilo de arte (decisões do dono)

- **Um estilo só: vetor chapado.** Nunca pintura, foto ou cena raster de IA. O Tato é a exceção com volume.
- SVG de arte não tem `<text>` (como `<img>` não carrega fonte): textos vão no canvas depois de rasterizar, ou em HTML por cima.
- O dono rejeita o "simples e feio" e o "cara de IA/amador": riqueza, universo, acabamento nível Duolingo.
- Mudanças de visual de personagem só em `character-designs.js` (nunca editar PNG).
