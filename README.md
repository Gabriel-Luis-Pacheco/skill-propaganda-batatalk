# skill-propaganda-batatalk

Skill do Claude para criar, revisar e entregar vídeos curtos de propaganda do BataTalk para TikTok e Reels. Cobre verdade do produto, algoritmo, psicologia de quem assiste, Duolingo e concorrentes, trends, banco de ideias, roteiro e comédia, falas humanas, visual, animação, som, render, QC, legenda do post, placar de qualidade e métricas. Reúne tudo o que foi aprendido em outubro de 2026: acertos, erros e correções.

Comece por [`SKILL.md`](SKILL.md). Ele tem um roteador que diz o que ler para cada tipo de pedido.

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
