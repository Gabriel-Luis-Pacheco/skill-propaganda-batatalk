# skill-propaganda-batatalk

## Motion Studio — mais 15 skills integradas (14/11/2026)

A propaganda agora contém os [**15 arquivos `SKILL.md` de Charlie947**](vendor/motion-graphics-charlie947/), com licença MIT. Isso inclui `brand-intake`, `reference-to-motion`, `motion-effects`, `launch-video`, `reel-export` e todos os demais workflows. O [guia 32](references/32-motion-studio-integrado.md) também incorpora um catálogo autoral baseado nos 17 estilos do Awesome Claude e define quando usar as skills oficiais de Remotion, sem impor a instalação nem copiar textos sem licença de redistribuição identificada.

**Uso:** a skill continua sendo a diretora de criação do BataTalk e preserva o Tato, o elenco, a animação de personagem, a comédia e o renderer `v8-publica`. Os novos módulos entram para brief, direção, motion de UI, gráficos, 3D, launch films ou exportação, dependendo da cena. Não trocar tudo por Remotion/HyperFrames nem prometer que vídeos já foram produzidos; nenhum MP4 novo foi renderizado neste trabalho.

Skill do Claude para criar, revisar e entregar vídeos curtos de propaganda do BataTalk para TikTok e Reels. Cobre verdade do produto, algoritmo, psicologia de quem assiste, Duolingo e concorrentes, trends, banco de ideias, roteiro e comédia, falas humanas, visual, animação, som, render, QC, legenda do post, placar de qualidade e métricas. Reúne tudo o que foi aprendido em outubro de 2026: acertos, erros e correções.

Comece por [`SKILL.md`](SKILL.md). Ele tem um roteador que diz o que ler para cada tipo de pedido.

## Integração com a Design OS Prime — 14/11/2026

A skill agora incorpora **todo o conjunto de conhecimentos da skill de design que é diretamente transferível para vídeo publicitário**, sem copiar os módulos de landing, interface ou as licenças de terceiros: pesquisa visual de cenas reais, composição autoral, identidade de personagens, direção cinematográfica, motion com função, animação e ferramentas opcionais (HyperFrames, GSAP, Remotion, 3D), revisão de frames renderizados, copy/psicologia ética, experimentos, indicadores, trabalho de especialistas e eficiência de contexto.

**Não torna HyperFrames obrigatório.** A produção normal de esquetes continua no `v8-publica`, com rig, personagens e `seek(t)` determinísticos; HyperFrames entra se for adequado a um motion graphic e estiver disponível. A skill continua priorizando humor e compartilhamento nos vídeos orgânicos, sem transformar todo Reel em anúncio de vendas.

| Novo guia | Conteúdo |
|---|---|
| [27 — Direção de arte e referências](references/27-direcao-de-arte-e-referencias.md) | Referências reais de vídeo, assinatura visual, art direction, personagens/brand, composição 9:16 e correção do “cara de IA” |
| [28 — Motion graphics e ferramentas](references/28-motion-graphics-e-ferramentas.md) | Cinematografia, timing, coreografia e escolha de pipeline; HyperFrames/GSAP/Remotion/3D como ferramentas condicionais |
| [29 — Render, crítica e reparo](references/29-render-critica-reparo.md) | Auditoria de frames, checagem de atuação/estética/QC, correção causal e comparação real entre versões |
| [30 — Estratégia criativa, copy e medição](references/30-estrategia-criativa-copy-e-medicao.md) | Criatividade, espectador, abertura, entretenimento vs conversão, testes, funil e medição honesta |
| [31 — Orquestração e contexto](references/31-orquestracao-e-contexto.md) | Skills especialistas de verdade, pesquisa sob demanda, custo de tokens e proveniência da execução |

**Auditoria da transferência:** [mapa de cobertura e exclusões](docs/INTEGRACAO_DESIGN_OS_2026-11-14.md). **Cenários de regressão propostos (ainda não executados):** [design-motion-transfer-scenarios.json](evals/design-motion-transfer-scenarios.json).

Os materiais de origem são da [Design OS Prime](https://github.com/Gabriel-Luis-Pacheco/Best-Designer-in-the-World.-); o método foi adaptado para **filme e social video**, não apenas linkado. O roteador em `SKILL.md` indica quando carregar cada guia.

## Estrutura

- `SKILL.md`: resumo da pesquisa, roteador, fluxo A–F, regras e checklist.
- `references/01–19`: guias na ordem do trabalho (verdade → algoritmo → psicologia → casos → trends → roteiro → comédia → falas → ideias → placar → visual → animação → rig → som → pipeline → QC → legenda → entrega → histórico).
- `references/20–23`: dados de 112 vídeos do TikTok, concorrentes de inglês, receitas TikTok × Instagram e o Instagram a fundo.
- `references/24–26`: **o Reel campeão "E se você falasse inglês todo dia?" (3.650 views)**, o método de revisão com agentes (Haiku e Sonnet) e a pesquisa sobre onde a IA erra, legendas, hashtags, algoritmo e narrador.
- `references/casos/e-se-dias/`: documentos brutos do caso (mensagens do dono, roteiros v2–v9, rodadas de agentes, folhas de quadros, legendas).
- `scripts/lint-roteiro.mjs`: revisa o roteiro ou a legenda (riscos legais como ERRO, tiques de IA como AVISO, tempo falado).
- `scripts/placar.mjs`: calcula o placar de 22 critérios (mínimo 33/44, nenhum ★ zerado).
- `templates/`: modelos (folha de batidas, txt da legenda) e o código real dos cortes e ferramentas do renderizador.

## Instalar

Clone a pasta em `.claude/skills/propaganda-batatalk/` no repositório do site (ou em `~/.claude/skills/`):

```bash
git clone https://github.com/Gabriel-Luis-Pacheco/skill-propaganda-batatalk.git .claude/skills/propaganda-batatalk
```

Para atualizar: `git -C .claude/skills/propaganda-batatalk pull`. O renderizador completo vive em `batatalk-launch-video/v8-publica/`, no repositório do site.
