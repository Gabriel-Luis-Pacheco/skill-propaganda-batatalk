# Animação de qualidade (os 12 princípios aplicados ao nosso rig)

Base: os 12 princípios da Disney ([Wikipedia](https://en.wikipedia.org/wiki/Twelve_basic_principles_of_animation), [Clip Studio](https://www.clipstudio.net/en/animation/12-principles/), [Pluralsight](https://www.pluralsight.com/resources/blog/software-development/understanding-12-principles-animation)) e a prática de cartoon para redes ([smears](https://garagefarm.net/blog/smear-frames-enhancing-motion-in-animation), [animação para redes](https://binus.ac.id/bandung/dkv/2025/11/04/how-to-animate-for-social-media-and-short-form-platforms/)). Tudo aqui é função pura de t.

| Princípio | O que é | Como fazer no nosso código |
|---|---|---|
| **Tempo e espaçamento** | nº de quadros entre poses (tempo) e distribuição deles (espaçamento): perto = lento, longe = rápido | transições de pose 0,16–0,35 s; reação rápida (0,12 s) contra pausa longa (0,6–1 s) — o contraste é o que dá graça |
| **Entrada e saída lentas** | quase todo movimento começa devagar, acelera e chega devagar | `E.inOut` nas poses; `E.out` em entradas de objeto; nunca linear |
| **Antecipação** | um contra-movimento antes da ação (agachar antes de pular; olhar antes de alguém entrar) | antes do pulo do "Amiga!" desça o corpo 4–6 un. por 0,08 s; antes de apontar, recue o braço; olhar para o lado de onde o Tato vai surgir |
| **Continuidade e sobreposição** | partes soltas continuam e chegam depois; partes do corpo em tempos diferentes | cabeça chega 0,05–0,08 s depois do corpo; braço depois do ombro; o Tato estica/amassa depois de pousar; adesivo balança depois de entrar |
| **Arcos** | movimento natural é curvo, não em linha reta | interpole ângulos (o rig já transforma em arco); câmera em curva leve, não reta |
| **Comprimir e esticar** | volume constante, forma muda com a força | Tato: `scale(1−sq, 1+sq)`; adesivos com mola; nunca nos personagens humanos (o rig não suporta e fica estranho) |
| **Exagero** | empurrar a pose além do real para ler rápido | expressões no máximo nos picos (olhos 1,15, pupilas pequenas no pânico; boca bem aberta no grito); poses-silhueta legíveis em miniatura |
| **Encenação (staging)** | uma ideia por vez, olho guiado | um personagem falando em close; o outro reage em plano próprio; fundo desfocado; nada se mexendo no fundo durante a piada |
| **Pose a pose + segurar** | poses-chave fortes e pausas que deixam a piada "assentar" | segure a pose de reação 0,4–1 s; **segurar com vida** ("moving hold"): respiração leve, piscada, deriva mínima — nunca estátua total (o QC pega congelado) e nunca tremor |
| **Ação secundária** | gesto pequeno que reforça a principal | June bebe café durante a fala da Priya; Priya mexe no copo; o Tato acena enquanto falam |
| **Desenho sólido / apelo** | formas claras, silhueta legível, personagem simpático | usar o rig do produto (nível Duolingo); não inventar personagem desenhado à mão |
| **Smear (borrão de movimento)** | quadros esticados em movimento extremo, com moderação | nosso desfoque por subquadros só em movimentos rápidos e **nunca cruzando corte** |

## Atuação (acting) para vídeo curto

- **Pensamento antes da fala**: os olhos mudam antes da boca (olhar para cima "procurando a palavra" 0,2 s antes de "The book…").
- **Reação > ação**: a graça costuma estar no rosto de quem escuta (June de cara de paisagem). Sempre planeje o plano de reação.
- **Olhar**: personagens se olham (3/4); olham para a câmera só em momentos de "quebra da quarta parede" (piada direta, convite, laço).
- **Piscadas** em momentos de transição de pensamento, não em intervalos fixos; piscada lenta (0,24 s) depois de um choque.
- **Boca**: visemas pela fala + abertura pelo envelope; boca fechada quando bebe; sorriso residual depois de falar algo engraçado.
- **Movimento calmo** (regra do dono): sem tremor; corpo pela média da voz; cabeça/mãos só no começo da frase. Energia vem de **cortes, zooms e poses fortes**, não de vibração.

## Câmera e montagem que parecem profissionais

- Campo e contracampo com os olhos sempre no mesmo terço da tela (o espectador não "procura" o rosto a cada corte).
- Corte no começo da fala ou um pouco antes (J-cut leve); reação segurada um pouco mais que o natural.
- Tranco de zoom no impacto da piada; tremida curta só no "tum".
- Ritmo variado: rajada de cortes rápidos → uma pausa de reação → rajada. Cortar rápido demais o tempo todo cansa (estudo de 2026).
- Transições com motivo (clarão para flashback, falha digital para "travou", celular subindo para o app).

## Checklist de animação antes do render

- [ ] Toda pose-chave lê em miniatura (silhueta)?
- [ ] Há antecipação nas ações grandes e continuidade depois?
- [ ] As pausas de reação existem e têm vida (respira/pisca), sem congelar?
- [ ] Nada treme sem motivo?
- [ ] Olhos dos personagens no mesmo lugar entre cortes de campo/contracampo?
- [ ] O desfoque de movimento só aparece em movimento rápido, nunca num corte?
