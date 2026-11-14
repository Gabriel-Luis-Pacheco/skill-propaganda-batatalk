# Laboratório de qualidade: render → crítica → reparo

Adaptação para vídeo do contrato `render-critique-repair-contract.md` e `independent-critique-and-evidence-learning.md` da Design OS Prime. Este documento **não substitui** o QC técnico de `16-qc-e-armadilhas.md` nem a revisão real com agentes de `25-revisao-com-agentes.md`: liga **qualidade estética + clareza narrativa + conformidade técnica + evidência**.

## Roteamento proporcional
- **PATCH**: defeito específico (texto fora da área, mão atravessando, áudio atrasado). Inspecionar frame/take, corrigir e rerenderizar o trecho ou vídeo necessário; sem reabrir identidade ou pesquisa.
- **REFINE**: versão existente promissora. Comparar MP4 atual com melhor versão anterior, corrigir a **causa do maior problema** e preservar takes/poses/piadas boas.
- **AUDIT**: observar artefato disponível e relatar defeitos com tempo/frame e gravidade; se não houver render, declarar limite e não inventar achados.
- **NOVO VÍDEO / NOVA CAMPANHA**: roteiro → asset canon → direção → storyboard → implementar → render → inspecionar → reparar → QC → entregar.

## Capturas mínimas úteis
1. Frame zero e primeiro segundo (legibilidade, contexto, quem é o sujeito).
2. Segundo 2 e transição para o primeiro payoff.
3. Um frame em cada beat principal (setup, mudança, reação, final).
4. Folha de 1–2 fps do **MP4 final**, não apenas do HTML.
5. Quatro frames ao redor de cada corte/efeito crítico; verificar ghosting e movimento de objetos.
6. Tela equivalente a um celular de 360/390px, com interface visual da plataforma simulada **somente se houver overlay fiel/atualizado**, sem alegar aprovação oficial.
7. Áudio alinhado ao tempo dos beats/captions e volume real por faixa.

**Registre** nome do MP4, corte, data, commit/hash quando houver, resolução, FPS, codecs, e quais frames/telas foram analisados. Não repetir varredura longa quando o problema é local.

## Duas pistas de avaliação, ambas necessárias quando relevantes

### Pista A — técnica, produto e direitos
- Render determinístico, full-frame, qualidade de recorte, sincronismo, mix e caption.
- Assets e personagens do canon, identidade visual, avisos verdadeiros, funcionalidades reais, direitos de imagem/voz/música.
- Safe zone por rede, legibilidade, compressão, compatibilidade 9:16, áudio inteligível.
- Orçamento, licenças, ferramentas realmente disponíveis e ausência de mudanças fora do escopo.

### Pista B — autoria, comédia e retenção
- **Primeiro olhar:** o que a pessoa vê e entende no quadro zero?
- **Forma e ritmo:** silhueta, hierarquia, planos, contraste, espaço negativo, progressão visual e clímax.
- **Causalidade:** a ação anterior explica a reação seguinte? A piada faz sentido para quem não conhece Batata City?
- **Motion:** necessária/expressiva/dispensável, coerente com personagem, valor sem tremedeira.
- **Voz e atuação:** subtexto, personalidade, pausa, reação, surpresa, último termo do punch.
- **Originalidade:** remover nome e logo tornaria isso um vídeo genérico de outro app?
- **Envio:** há um motivo plausível para alguém compartilhar? Isto é **hipótese editorial**, não taxa de envio medida.

## Problema → causa → intervenção → reteste
Para cada correção importante, registrar:

| Campo | Exemplo do formato |
|---|---|
| **Observação** | “0:06.45, adesivo encobre a boca durante a reação” |
| **Confiança** | OBSERVADO (no frame) |
| **Impacto** | P1: impede compreender atuação/piada |
| **Hipótese da causa** | adesivo sai depois do corte e a câmera aproxima |
| **Correção** | antecipar saída e remover sobreposição |
| **Evidência de reteste** | mesmos frames extraídos após o novo render |
| **Residual** | verificar no celular quando possível |

**Gravidade:**
- **P0:** falso sobre produto/identidade, violação séria de direitos/segurança, saída ausente/quebrada, áudio ou imagem impossíveis de consumir.
- **P1:** punch incompreensível, rosto/legenda principal cobertos, erro técnico marcante, marca errada, artefato visual persistente.
- **P2:** hierarquia confusa, plano fraco, transição supérflua, nuance de voz ou ritmo.
- **P3:** gosto ou aperfeiçoamento pequeno sem impacto identificável.

Não compensar um P0/P1 com alta nota estética ou placar de retenção.

## Crítica independente honesta
Quando disponíveis **de fato**, mostrar aos revisores leigos o vídeo/folhas de quadros **antes** de explicar o roteiro. Especialistas analisam atuação, motion, direção, edição e tecnologia; revisão cega é preferível quando possível. Os agentes observam evidência: `frame + o que perceberam + o que não entenderam + hipótese + severidade`. Convergência entre revisores é sinal útil, não verdade absoluta.

Se não houver agentes independentes, executar autocrítica em duas passadas, deixando claro que é autorrevisão. Nunca inventar espectadores, testes A/B, especialistas consultados, métricas ou aprovações.

## Avaliação justa de versões
Compare A vs B somente quando:
- mesmíssimo brief, fatos, assets oficiais, rede, duração/objetivo compatíveis e acesso a fontes;
- fidelidade de implementação comparável, sem comparar rascunho com versão polida;
- abrir ambas na mesma proporção/resolução e examinar cenas equivalentes;
- declarar preferências como PREFERÊNCIA; observação concreta como OBSERVADO; impacto em público como HIPÓTESE até haver dados;
- registrar ganhos **e regressões**; não exigir vitória da nova versão.

O `placar.mjs` orienta prioridades, **não prova** beleza, viralidade ou conversão. Sintaxe correta e build verde não provam qualidade visual.

## Regra de parar
Pare quando entrega autorizada está pronta, P0/P1 conhecidos estão resolvidos dentro do escopo e foi inspecionado o defeito dominante após último render. Não polir interminavelmente o que já funciona. Relatar o que foi verificado, o que continua incerto, o que foi preservado e o que foi alterado.

**Origens internas:** Design OS Prime: `render-critique-repair-contract.md`, `independent-critique-and-evidence-learning.md` e `visual-direction-and-anti-slop-atelier.md`. O guia de propaganda `25` prevalece para o protocolo operacional próprio dos vídeos.
