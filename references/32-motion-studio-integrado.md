# Motion Studio — Charlie947 × Awesome Claude × Remotion × Design OS

**Integração de 14/11/2026.** Este guia é uma adaptação ORIGINAL para a Design OS e a propaganda BataTalk, não uma afirmação de instalação de Remotion, HyperFrames, um executável ou o motor do Awesome Claude. Fontes consultadas: [15 skills de Charlie947](https://github.com/charlie947/motion-graphics-skills), [17 estilos e motion-graphics SKILL do Awesome Claude](https://awesomeclaude.ai/claude-motion-graphics), [Agent Skills oficiais do Remotion](https://www.remotion.dev/docs/ai/skills). Em caso de conflito: pedido e direitos → produto e assets reais → pipeline existente → especialista.

## 1. Ativação obrigatória por superfície, não um festival de efeitos
**Qualquer produção com motion relevante** deve consultar este roteiro de decisão. Se o pedido é um simples PATCH de interface estática, não precisa rodar 30 skills. Para vídeos, Reel, comercial, demonstração animada, launch film, title sequence, kinetic typography e animações complexas, fazer triagem obrigatória das três famílias abaixo. **Consultar todas as famílias ≠ invocar todas as ferramentas**: selecionar a especialidade para a lacuna que existe, sem instruções incompatíveis de stacks concorrentes.

### Antes de animar (intake)
- Qual é a percepção ou ação desejada? Público, distribuição, duração/ratio, história, restrições, prova real, direitos e assets canônicos.
- Se houver `brand.md` e `MOTION.md` aprovados, lê-los. Se faltarem, criar a partir da identidade existente e referências fornecidas/inspecionadas; não inventar logo, mascote ou preço.
- Fixar `frames por segundo`, `t`/frame, paleta, tipografia, easing, espaço de câmera, safe zones, áudio/mix e estados observáveis. Número exato é contrato técnico, não substitui gosto artístico.
- Storyboard com `tempo → cena → foco/um único read → mudança causal → câmera → transição → áudio → duração de leitura`. Nunca deixar cada cena disputando os mesmos pixels por efeito gratuito.

## 2. Quais skills de Charlie947 estão **incorporadas** no repositório?
No Design OS: `vendor/motion-graphics-charlie947/<nome>/SKILL.md`. Na propaganda: `vendor/motion-graphics-charlie947/<nome>/SKILL.md`. São os 15 módulos textuais **MIT** originais, preservados como fonte. O usuário pediu todos, então ficam guardados, mas leitura é sob demanda.

| Fase | Skill | Uso quando necessário |
|---|---|---|
| Base | `brand-intake` | Preparar ou atualizar `brand.md` / `MOTION.md` com informações verdadeiras |
| Planejamento | `motion-brief-writer` | Converter objetivo vago em brief verificável |
| Referências | `reference-to-motion` | Decompor movimentos reais observados sem copiar assets |
| Prompts | `motion-prompt-writer` | Especificação clara de um movimento/shot para a ferramenta |
| Lançamento | `launch-video` | Anúncio de produto/serviço, com prova e CTA quando objetivo comercial |
| UI | `apple-launch-film` | Referência de ritmo/linguagem de keynote, sem copiar propriedade intelectual |
| Educação | `vox-explainer` | Explicação narrativa editorial com gráficos e tipos |
| Dados | `animated-chart` | Gráficos animados com dados verificados, nunca inventados |
| Marcos | `milestone-reveal` | Apresentação de números e metas **identificados como reais ou hipotéticos** |
| Efeitos | `motion-effects` | Biblioteca de 16 ideias para transições e pequenos gráficos |
| Títulos | `title-sequence-3d` | Abertura tridimensional só se a cena justificar |
| Comparações | `model-showdown` | Comparar modelos/versões com condições equivalentes |
| Newsletter | `newsletter-promo` | Criativo curto relacionado a edição/assunto verdadeiro |
| Loops | `loop-cover` | GIF/loop e validação da emenda |
| Distribuição | `reel-export` | Conversão 9:16, checagens H.264/cor/áudio/safe area |

**Preservar premissa original do BataTalk:** vídeos orgânicos normalmente são humor/personagem, não uma campanha comercial padrão. Um guia `launch-video` não obriga CTA em sketch. Direitos de marca, personagens e identidade têm prioridade sobre a estética sugerida pelo template.

## 3. Estilos do Awesome Claude: catálogo para escolher, não colar 17 estéticas
A página externa lista 17 estilos. Este catálogo é **descrição e interpretação própria**, com opções por caso; não reproduz integralmente prompts ou previews do site. Na escolha, associar `função → linguagem → limites → teste de frame`. Sempre consultar o estilo-fonte se detalhes de hex/curva/frame forem decisivos.

| Estilo identificado na fonte | Mecanismo visual | Quando usar / evitar |
|---|---|---|
| Swiss grid & kinetic type | Grids, blocos tipográficos, cortes secos | Mensagem editorial com tipografia como sujeito; evitar em emoção de personagem |
| Flat vector explainer | Formas vetoriais e transformações legíveis | Explicação clara; bom fit com marca vetorial do BataTalk |
| Shape morph & liquid | Um objeto se transforma em outro | Transições motivadas; não entre conceitos sem relação |
| Single line & live drawing | Linha desenhada progressivamente | Revelar esquema, ideia ou narrativa de uma forma |
| Data story | Dados como protagonista de um quadro | Somente dados reais, legíveis e contextualizados |
| Isometric miniature world | Diorama técnico com câmera coerente | Processos e objetos espaciais; não reconstruir Tato em 3D |
| Dark tech keynote | Silêncio, escala e revelação de produto | Lançamento tecnológico com provas reais; não brand-swap genérico |
| Living UI screencast | Estados reais de interface dirigidos pelo tempo | Demonstração de produto verdadeira, sem botões fictícios |
| HUD & terminal | Malha técnica e leitura monoespaçada | Explicadores técnicos; não atrapalhar entendimento leigo |
| Watercolour & ink | Traços, papel, textura e material pictórico | Trabalhos cujo cânone artístico permite mudança de mídia |
| Risograph & halftone print | Impressão em poucas tintas e desregistro intencional | Peças editoriais; manter contraste e legibilidade |
| Paper cut-out & collage | Recortes em camadas e step motion | História/recorte criativo; assets com direitos |
| Hand-drawn line boil | Traço que vibra como desenho artesanal | Personagens desenhados para esse estilo; nunca como tremor involuntário do rig |
| Pixel art & retro game | Paleta limitada e passos quantizados | Campanha retrô que justifique o recurso |
| VHS, film & CRT eras | Textura de época e ruído intencional | Narrativa nostálgica sem mascarar textos e fatos |
| Toy & material 3D | Materiais suaves, iluminação de estúdio e peso | Objetos canônicos quando há modelagem própria autorizada |
| Vertical social captions | Captions legíveis para 9:16 | Reels/TikTok, com zonas seguras específicas da rede |

**Não aplicar 17 estilos simultaneamente.** Selecionar um sistema visual-base (o cânone vem primeiro), uma exceção com função e evitar misturas arbitrárias. Em propaganda BataTalk, cenas vetoriais e personagens do rig são a base, salvo orientação explícita do dono.

### Contrato numérico útil de um estilo escolhido
`nome → referência → paleta + direitos → tipografia + fonte → fps/duração → curva(s) → timeline em frames → entrada/hold/saída → restrições → quadro de teste`.

Os detalhes do exemplo são definidos **pela cena e ambiente**, não copiados cegamente de estilos externos. Usar seed para grão/partículas, clocks determinísticos, tipografia carregada antes do primeiro frame e holds legíveis.

## 4. Remotion: skills oficiais, NÃO copiadas sem licença identificada
No momento da auditoria, `remotion-dev/skills` publica os roteiros: `remotion-best-practices`, `remotion-create`, `remotion-markup`, `remotion-studio`, `remotion-render`, `remotion-maps`, `remotion-captions`, `remotion-saas`, `remotion-interactivity`, `remotion-docs`, `remotion-license`, `remotion-upgrade`, `remotion-multimedia`. Repositório sem licença de redistribuição claramente identificada na raiz durante a inspeção; por isso, **não espelhar integralmente os SKILL.md oficiais**. Ler a fonte oficial quando necessário.

No projeto que já usa Remotion:
```bash
npx remotion skills add
```
No projeto sem Remotion, e **somente se o usuário autorizar instalação**:
```bash
npx skills add remotion-dev/skills
```
Fonte: https://www.remotion.dev/docs/ai/skills . A documentação, API, pré-requisitos e licença comercial de Remotion devem ser conferidos no momento de executar, com versão instalada. Não supor que React/Remotion, Lottie e GSAP sempre estão disponíveis ou são plug-and-play.

### Decisão entre pipelines
- **Código do site + animação de UI:** CSS/DOM/SVG/GSAP quando tecnicamente apropriado, com cleanup, reduced motion e performance.
- **Esquete de personagem BataTalk:** manter `v8-publica` e seu `window.__film.seek(t)` determinístico. Não substituir rig e sincronismo labial por Remotion automaticamente.
- **Motion graphics curtos e efeitos tipográficos:** HTML/SVG/Canvas/HyperFrames quando já disponíveis e compatíveis; `Charlie947` pode fornecer roteiro/efeito.
- **Composições em React com muito reuse/timeline/render MP4:** Remotion quando instalado/autorizado e demonstrar vantagem real.
- **3D:** Three/WebGL somente com justificativa estética, performance, assets fiéis e fallback.
- **Mix de pipelines:** exigir contrato para FPS, cor, res, alpha, áudio, timestamps e determinismo antes de unir saídas.

## 5. QA de vídeo obrigatório, independentemente da ferramenta
1. **Fatos e marca:** toda afirmação/prova verificável, assets canônicos, fonte/licença, sem falso depoimento ou falso resultado.
2. **Frames e narrativa:** primeiro frame/primeiro segundo, midpoint, payoff, último hold, leitura sem som, contato-sheet e cortes.
3. **Motion:** a ação tem causa e resultado? Easing/timing casam com atuação? Há movimentos sobrando ou competindo?
4. **Pixel QA:** clipping, fontes, ghosting em motion blur, texto nas zonas seguras, contraste, brilho/flash, frame preto, sobreposição.
5. **Técnico:** codec, resolução, fps, color space, mux, loudness/picos, início-fim, legendas e sincronismo.
6. **Evidência:** corrigir pior defeito identificado e rerenderizar. Não chamar código compilado de vídeo renderizado. Não dizer “melhor retenção” sem métricas reais.
7. **Uso consciente de recursos:** ler skill específica quando necessário; não fazer agentes diferentes repetirem o mesmo trabalho. Se uma ferramenta estiver ausente, usar rota existente e relatar `NÃO EXECUTADO`.

## 6. Rotas de execução
**Novo vídeo comercial**: brief/verdade → brand/MOTION canon → referência/estilo → motion-brief-writer → storyboard → escolher pipeline → guia de shot relevante → código/render → contact-sheet → QC → entrega.

**Novo Reel orgânico BataTalk**: roteiro de humor e personagem → canon Tato/Batata City → cena/atuação via v8-publica → consultar Charlie947 apenas para motion adicional/brief/reel export → QC real → legenda. Sem impor promoção comercial ou copiar Mac/3D em sketch.

**Redesign de animação UI**: preservar comportamento → problema observado → escolher Emil (animate/choreograph/review) e, se necessário, Charlie `motion-effects` → protótipo/implementação → reduced motion → navegador/screenshot.

**Só ajustar legenda/corte**: guia do pipeline existente e reparo específico; não abrir bibliotecas gigantes.

## Origens, atribuição e limites de redistribuição
- Charlie Hills / `charlie947/motion-graphics-skills`: licença MIT mantida junto às 15 fontes `SKILL.md`. Os arquivos fonte originais são de terceiros e permanecem identificados.
- Awesome Claude: site disponibiliza regras/skill e permite uso comercial dos prompts; este documento é adaptação editorial que aponta aos prompts originais, não cópia de todos.
- Remotion: seguir skill e dependências oficiais por instalação autorizada, sem copiar textos que não tenham licença de redistribuição identificada.
- Emil Kowalski: complementar com `animate`/`choreograph` (fontes já presentes em `vendor/specialist-core` da Design OS), não assumir que suas scripts estão instaladas.
