# Entregas e postagem

## Pastas

- `C:/Users/pache/Downloads/BataTalk-TikTok-21-videos/` — uma subpasta por vídeo (`01_…` a `21_…` para a família/variações; `00_<NOME>` para os vídeos novos: `00_DESAFIO_3S_VIRAL`, `00_QUIZ_RAPIDO_3_PERGUNTAS`, `00_MINA_CRIADORA_BATATALK`, `00_BAR_PRIYA_E_JUNE`). Cada uma: o `.mp4` + `legenda-e-hashtags.txt`.
- Projeto: `batatalk-launch-video/entrega/v8-publica/tiktok/` (MP4, `.pt-BR.vtt`, `.transcricao.md`, `LEGENDAS-TIKTOK.md`, `PESQUISA-RETENCAO-TIKTOK.md`).
- Sempre enviar o MP4 e o txt no chat depois de copiar (`cmp` para garantir cópia idêntica).

## Estrutura do `legenda-e-hashtags.txt`

1. Legenda TikTok (curta) + hashtags.
2. Legenda Reels + hashtags (≤ 5).
3. Comentário para fixar.
4. Texto alternativo do Instagram.
5. Dicas: selo de IA; capa = primeiro quadro; não cortar o final quando há laço; responder a primeira hora; link no perfil no Instagram; personagem ≠ depoimento; bebidas sem álcool quando houver bar.

## Variações e reaproveitamento

- O dono quer muitos vídeos **diferentes**; variações de gancho são aceitas para teste (A2–A5, B2–B4, C2, S2 no motor `director.js`: `titleLines`, `kickers`, `travouHtml`).
- Reaproveitar versões antigas boas (V7 15 s, V6 "até alguém falar", "entender", "só não sabia", V3 pão de queijo, V6 completo) com `tools/vertical-wrap.mjs` (faixa creme + gancho em Fredoka por drawtext).
- Escolher os melhores, não só os últimos.

## Depois de postar

Medir no painel do TikTok: retenção nos 3 s, tempo médio, % até o fim, repetições, comentários, compartilhamentos, salvamentos. Comparar versões (ex.: bar v1 44 s × v2 35,6 s). Responder comentários como a marca/personagem; boas respostas viram vídeos de resposta.

## Ritmo de postagem e teste (sugestões para o dono decidir)

- **Constância vence superprodução**: as séries que cresceram postavam cerca de 3 vídeos por semana (Chikn Nuggit); guias de marca falam em 3–5 por semana ([Hootsuite](https://blog.hootsuite.com/tiktok-marketing/)). O Duolingo só estourou no 39º vídeo (`references/04-casos-e-concorrentes.md`).
- **Diversidade no feed**: não repetir o formato do post anterior (esquete → quiz → trend curta → série).
- **Teste de gancho**: mude a abertura de verdade (texto, primeira fala, primeiro plano), não só a cor. No Instagram, use os Reels de teste. Compare **taxa de pulo / retenção em 3 s**, tempo médio, % até o fim, envios e comentários.
- **Primeira hora**: responder comentários como a marca ou o personagem; os melhores comentários viram vídeos de resposta ("O Tato responde").
- A skill só **sugere**: postar, impulsionar, comentar em perfis de terceiros e mandar mensagem é com o dono.

## Diagnóstico de alcance baixo (fazer antes de mudar o conteúdo)

1. **A conta está elegível?**
   - Instagram: Configurações → Conta → **Status da conta**. Mostra se conta e posts podem ser recomendados a não seguidores e dá para contestar ([Instagram Creators](https://creators.instagram.com/blog/instagram-recommendations-eligibility-tips-creators), [TechCrunch](https://techcrunch.com/2022/12/07/instagrams-new-transparency-tools-will-tell-you-if-your-content-is-ineligible-to-be-recommended/)).
   - TikTok: **Status da conta / Verificação da conta** na Central de segurança, mais as notificações. Conta que viola repetidamente os padrões do Para Você fica temporariamente inelegível, com aviso e direito de recurso ([Newsroom TikTok](https://newsroom.tiktok.com/en-us/supporting-creators-with-an-updated-account-enforcement-system), [TechCrunch](https://techcrunch.com/2023/02/02/tiktok-introduces-a-strike-system-for-violations-tests-a-feature-to-refresh-the-for-you-feed/)).
   - **Vídeo com 0 visualizações num app e centenas no outro** (o Desafio: 0 no TikTok × 1.258 no Instagram) aponta para restrição ou análise naquela plataforma, não para conteúdo ruim.
2. **De onde vieram as views?** Fonte de tráfego (Para Você / Explorar × perfil × seguindo) e porcentagem de não seguidores. Se quase nada vem do Para Você, o problema é de distribuição.
3. **Quem viu ficou?** Retenção nos 3 s ou taxa de pulo, tempo médio, % até o fim e a curva de retenção (onde cai). Se cai no começo, o problema é o gancho; se cai no meio, é o ritmo; se ninguém comenta, falta pergunta fácil ou motivo.
4. **Espere 24–48 h** antes de julgar um vídeo novo; não apague e reposte o mesmo vídeo (duplicata); poste com constância.
5. Só então mude o conteúdo, dobrando a aposta no que mais reteve e foi mais enviado.

### Primeira leitura dos nossos números (27/10/2026, 11h39)
| Vídeo | Instagram (views) | TikTok (views / curtidas / comentários) |
|---|---|---|
| Desafio 3s ("Responde em 3 segundos") | **1.258** | 0 (dado anterior; não aparece mais na lista) |
| Mina criadora (44 s) | 422 | 114 / 5 / 0 |
| Quiz rápido | 279 | não está na lista |
| Bar v2 (postado às 9h31, cerca de 2 h antes) | 235 | 27 / 1 / 0 |
| Tato "Eu depois de ficar fluente…" | 108 | — |
| Social 15 s "Meu inglês na cabeça: perfeito" | — | **408 / 23 / 0** |
| "MY PRONOUNS ARE U.S.A" | — | 99 / 1 / 0 |

O que se pode concluir com 5–6 vídeos (amostra pequena; só o Desafio se destaca de verdade):
- No Instagram ganhou o formato **participativo** (pergunta no quadro 0 e na capa, cronômetro, "responde"). No TikTok ganhou o **curto e identificável** (15 s).
- O mesmo vídeo vai 4–9× melhor no Instagram do que no TikTok → investigar a conta do TikTok (passo 1).
- Zero comentários em tudo: falta comunidade. Comentário fixado, resposta rápida e o Tato comentando em criadores (sugestão para o dono).
- O "ficar fluente" teve o pior resultado e é uma promessa que a skill proíbe.
