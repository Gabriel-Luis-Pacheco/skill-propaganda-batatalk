# Motion graphics, cinematografia e escolha de ferramentas

Integração focada das práticas de `motion-and-interaction-direction.md` e `motion-3d-engineering-cookbook.md` da Design OS, aplicada ao cinema vertical do BataTalk. Complementa `12-animacao-e-atuacao.md`, `13-rig-camera-e-efeitos.md` e `15-pipeline-tecnico.md`. **O renderizador atual é o caminho padrão. HyperFrames é opção especializada, nunca obrigação.**

## 1. Escolher o meio pelo plano, não pelo hype
| Necessidade da cena | Escolha padrão | Quando considerar alternativa |
|---|---|---|
| Esquete com rig Batata City, atuação, NPC e app | `v8-publica` e funções puras de `t` | Só mudar pipeline se o existente não realizar a intenção |
| Tipografia cinética, cartela de estatística real, logo sting, overlay curto, UI/cursor animado | Canvas/SVG/DOM no renderizador próprio | **HyperFrames**, se já disponível e a composição/saída superar custo de integração |
| Animação em sequência com vários elementos DOM | Timeline própria determinística | GSAP e skill oficial **apenas se compatíveis com seek(t)** e a infraestrutura real |
| Vídeo React com cenas/timing componíveis | Reusar pipeline atual se possível | Remotion quando existente/permitido e justificado por arquitetura |
| 3D / profundidade especial | Perspectiva, luz e camada 2D primeiro | Three.js/WebGL só se o efeito agrega à piada, há orçamento, compatibilidade e assets fiéis |
| Lottie/Rive ou motion feito no Figma | Usar asset exportado e autorizado | Skill própria e player adequado apenas quando presentes/necessários |

**Nunca** inserir GSAP, dependências, plugin ou framework em um projeto que depende de `window.__film.seek(t)` determinístico sem demonstrar que cada quadro pode ser recuperado em **qualquer ordem**. Não supor renderização/frame rate, suporte a GPU ou voz externa sem testar. Não substituir um Tato fiel por 3D genérico.

## 2. Contrato por gesto/movimento
Para **cada efeito relevante**, documentar:
`gatilho narrativo → estado antes → estado depois → significado/emoção → duração/easing → relação com voz/SFX → opção de menor movimento → prova no render`.

Classificar:
- **NECESSÁRIO:** mostra mudança de estado, causa ou relação espacial sem a qual a piada não funciona.
- **EXPRESSIVO:** revela caráter, tensão, antecipação, sorriso ou clímax; deve ter lugar na hierarquia.
- **DISPENSÁVEL:** só preenche vazio, agita a câmera ou sinaliza “produção cara”; remover se compete com texto, rosto, intenção ou desempenho.

Animação **não** é prêmio automático por inserir um objeto. A leitura do que aconteceu deve sobreviver à pausa num quadro-chave e, quando viável, à ausência de som.

## 3. Coreografia em beats
Criar uma **faixa temporal visual** alinhada à folha de batidas:
`tempo inicial–final | câmera | foco | quem age | causa | antecipação | mudança | reação | texto | voz | SFX | transição | estado final`.

- Abrir com **ação/rosto/voz/texto** que pertencem à mesma situação; o frame 0 precisa ser deliberado.
- Diferenciar **entrada**, **ação principal**, **assentamento** e **hold com vida**. Não manter tudo em movimento.
- Primeiro pensamento no olhar, depois corpo/rosto, depois ação com consequência; mãos não devem seguir sílaba por sílaba.
- A piada pede **contraste**: preparação inteligível, pequena lacuna, punch, reação e repouso. Nunca deixar efeito visual roubar a última palavra.
- Câmera guia atenção, não exibe habilidade técnica: continuidade do eixo, olhos em posição coerente entre contracampos, zoom só quando o evento merece. Movimento calmo é regra, salvo beats com motivação clara.
- Texto animado: começo legível, exibição suficiente, saída limpa antes do próximo corte; caption não em cima de boca/mão/produto. Sem giro, inclinação nem balanço no título central aprovado.
- Limpar motion blur/subframes junto ao corte; preservar sincronismo labial e tempo real de áudio.

Valores sugeridos em `12`/`13` são **heurísticas do rig já usado**, não leis de cinema. Preferir pose expressiva e causa visual ao excesso de easings.

## 4. Biblioteca de linguagens úteis
- **Kinetic typography:** texto como personagem da piada; a entrada/pausa/transformação encena uma fala, não cobre a tela por hábito.
- **Logo sting / assinatura:** revelação breve do asset oficial, motivo sonoro, sem refazer logo.
- **UI / site-to-video:** interface real ou simulação claramente rotulada; dedo/cursor com ação que dispara resposta verificável, nada de progresso fictício.
- **Callouts e lower-thirds:** destaque semanticamente vinculado a rosto, objeto ou evento.
- **Gráficos/números:** só dados verdadeiros com fonte, período e interpretação honesta; evitar falsas estatísticas de aprendizado ou resultados.
- **Transitions as meaning:** erro → pane, memória → flashback, dica → deslocamento de foco, reação → corte seco.
- **Personagem e comédia:** acting e silêncio geralmente superam efeitos “bonitos”; não descaracterizar o Tato.
- **3D:** usar quando uma operação espacial ou objeto exige profundidade; conferir iluminação, textura, geometria, cor, direitos e saída sem GPU quando pertinente.

## 5. Fluxo HyperFrames — SOMENTE quando selecionado
HyperFrames é um sistema de vídeo por HTML/CSS/JS e captura de frames; pode usar CSS, GSAP, Lottie e Three.js, conforme implementação/versionamento. É adequado a **motion graphics curtos**, typography, title cards, mapas, overlays e demonstrações visuais; não é substituição automática de rig/esquete.

Se disponível e apropriado:
1. Verificar **skill, CLI e versão realmente instalados**. Consultar instruções oficiais vigentes e requisitos antes de execução; link não comprova instalação.
2. **Definir o shot** e asset strategy: storyboard breve, geometria, texto, som, marca e saída final. Determinar se precisa fonte externa.
3. Resolver licenças, arquivos reais e fidelidade dos assets **antes** de animar.
4. Compor cenas com timing determinístico e runtime de animação compatível com o HyperFrames instalado. Não presumir sintaxe de atributos ou comandos de versão antiga.
5. Lint/validate/preview/snapshots com as ações efetivamente suportadas; olhar quadros, fontes e finalização; corrigir.
6. Renderizar/exportar somente dentro de recursos, permissões e custo autorizados. Combinar com renderizador próprio **só se** formatos, FPS, áudio, alpha e timecodes forem compatíveis; verificar o resultado final.

**Se ausente:** usar o `v8-publica` existente. Não inventar que HyperFrames rodou, nem instalar pacote por conta própria. A skill `website-to-hyperframes` é útil para transformar uma **página real** em anúncio/tour quando explicitamente necessário, não para forçar captura de landing em esquete.

## 6. Qualidade de movimento verificável
- Seek determinístico: quadro aleatório = quadro obtido na sequência; seeds fixas, timeline independente de tempo de parede.
- Inspecionar poses-chave + início/pico/repouso + quadros antes/depois de cada corte + audio waveform/caption alignment.
- Detectar frame preto, fantasma, oclusão de mãos/props, interseção do rig, objeto flutuando, flash/zoom gratuito, fonte que não carregou e texto cortado.
- Testar 9:16 em visualização equivalente a 360/390px, interface sobreposta e versões por rede; checar caption sem som.
- Acessibilidade: evitar flashes estroboscópicos e movimentos potencialmente desconfortáveis; para animação reutilizada em web, prever `prefers-reduced-motion` / fallback. Em MP4 não existe toggle de CSS: criar versão/edição alternativa se a necessidade do público justificar.
- Medir FPS/custo/tempo só com resultados reais. Declarar **NÃO TESTADO** se não houver render ou ferramenta.

## Referências técnicas verificáveis
- [Design OS: motion-and-interaction-direction](https://github.com/Gabriel-Luis-Pacheco/Best-Designer-in-the-World.-/blob/main/skills/studio-grade-web-transformation/references/motion-and-interaction-direction.md).
- [Design OS: motion-3d-engineering-cookbook](https://github.com/Gabriel-Luis-Pacheco/Best-Designer-in-the-World.-/blob/main/skills/studio-grade-web-transformation/references/motion-3d-engineering-cookbook.md).
- [HyperFrames / heygen-com](https://github.com/heygen-com/hyperframes), em particular `skills/motion-graphics/SKILL.md` e fluxo principal. Verificar a versão ao executar.
- [GSAP](https://gsap.com/docs/v3/), [Remotion](https://www.remotion.dev/docs/), [Three.js](https://threejs.org/docs/). Exemplos são alternativas técnicas, não dependências requeridas.
