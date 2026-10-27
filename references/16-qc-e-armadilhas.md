# QC e armadilhas (tudo que já deu errado e como resolver)

## Checagens obrigatórias

1. `verify-determinism.mjs` — mesmo quadro em ordem, fora de ordem e em página nova.
2. `alpha-scan.mjs` — nenhum pixel transparente (vira preto no MP4).
3. `qc.mjs` — h264/yuv420p, bt709, AAC 48 kHz estéreo, loudness, pico, preto/congelado/silêncio.
4. `black-scan.mjs` — pixels com max(R,G,B) ≤ 6 (a paleta não tem preto).
5. `safezone-check.mjs` — zonas da interface (topo 0–270, base 1248+, trilho direito x ≥ 960 de y 760 a 1640) + leitura a 360/390 px.
6. **Folha de 1–2 quadros por segundo do MP4** e **4 quadros em volta de cada corte** — QC técnico não vê erro de montagem.

## Erros reais e correções

| Sintoma | Causa | Correção |
|---|---|---|
| Render aborta "as fontes do filme mudaram" | outra sessão editando app.js/onboarding (no hash) ou você editou `src/`/`generated/` durante o render | `V8P_HASH_SCOPE=film`; não editar fontes até o render terminar; exportar timeline ANTES |
| Cantos pretos intermitentes em telas arredondadas | sem GPU, o compositor descarta o fundo atrás do iframe opaco | `opacity: .999` no iframe; `clip-path` no próprio iframe; captura de aquecimento |
| Quadro "fantasma" com dois rostos no corte | desfoque de movimento com subquadros cruzando o corte | `samples(t)` devolve 1 se algum corte está a < 0,02 s; janelas de desfoque começam depois do corte |
| Preto puro no "trava tudo" | `contrast(1.15)` esmagou o cabelo escuro | usar `saturate` + `hue-rotate`, nunca `contrast` em cena |
| black-scan com tempos em dobro | ferramenta assumia 30 fps; vídeos são 60 | lê o fps real do arquivo (`fpsOf`) |
| `EncodingError: The source image cannot be decoded` | `tatoFigure()` é HTML (atributo `data-tato-rig` sem valor) dentro de SVG-imagem (XML) | `.replace(/\s(data-[\w-]+)(?=[\s/>])/g, ' $1=""')` |
| Texto do pôster na fonte errada | SVG como `<img>` não carrega fonte da página | desenhar texto no canvas depois de `document.fonts.load` |
| Personagem tremendo | volume da voz a 100 Hz no corpo, aceno por palavra, antebraço alternando | média ±0,2 s, só começo de frase, câmera lenta |
| Celular sumido na mão da June | braço do lado oposto ao olhar fica atrás do corpo no 3/4 | objeto na mão da frente |
| Celular tampando a boca | objeto preso ao antebraço apontando para cima | `upright: true`, centrado na mão, braço mais baixo |
| Entalhe do celular cobrindo a fala do app | notch grande no topo | câmera frontal = ponto de 14 px na borda |
| "Exemplo animado" cobrindo o nome do barista | rótulo dentro do cartão | rótulo acima do cartão |
| Pergunta do barista fora do quadro | enquadramento começava no NPC | começar em `.pv2-line` (y 74) |
| Selo "Entendido" fora do quadro / "O Tato está pensando…" | enquadramento fixo no dock | panorâmica para o selo; depois sobe para a fala |
| Toque na dica antes do cartão aparecer | tempo do toque calculado antes do corte | toque no "uma"/"dica" (depois do corte) |
| Balão do Tato no trilho de botões | x 790 | x ≈ 720 e duas linhas |
| Confete cobrindo o rosto | origem no centro | origem nos punhos, subindo |
| Adesivo vazando para o plano seguinte | saída de 0,16 s depois do corte | terminar 0,17 s antes do corte |
| Carimbo "GRÁTIS" durando 0,4 s | fim no fim da frase curta | durar até o fim da frase seguinte, encolhendo |
| Aviso de IA ilegível a 360 px | 26 px | 32 px, fundo mais opaco |
| `1 cidades` no contador | começar em 1 | começar em 2 |
| Emoji de bandeira vira "US" | Windows não tem glifo de bandeira | não usar bandeiras |
| Objeto do rig (carimbo) com a cor errada | a chave de cor `ink` do objeto colidiu com uma cor que já existe no desenho do personagem | dar nomes próprios às cores do objeto (`stampKnob`, `stampBase`…) |
| Boca de susto da Evelyn parecendo bigode | expressão com boca `wobble` (que funciona na Mina) vira um risco escuro em outro rosto | boca aberta (`open` + `curve` negativa + `w` largo) e conferir no close |
| Pílula de tradução em cima do texto do gancho | os dois no alto da tela ao mesmo tempo | cada adesivo do alto com o seu tempo: o gancho sai quando a pílula entra |
| Legenda em cima da boca no close extremo | olhos baixos demais no enquadramento | no close extremo, olhos em y ≈ 740 (a boca fica acima da legenda em 1165) |
| Adesivo encolhendo em cima do rosto do plano seguinte (6–8 quadros) | o adesivo termina no corte, mas a saída dura mais 0,16 s | terminar cada adesivo pelo menos 0,18 s antes do corte; conferir os quadros em volta de cada corte no MP4 |
| Take de TTS repetindo a frase ("died? Died?", "Welcome… Welcome…") | instabilidade do modelo; a checagem por palavras não pega repetição | ler a transcrição de cada take e fixar o take limpo em `picks.json` |
| Whisper com palavra de duração zero | tempos ruins em TTS | `align` por sílabas dentro dos trechos com voz |
| TTS repetiu a frase / riu no fim | instabilidade do modelo | escolher o outro take ou cortar com `clip` |
| `"No quê?"` a ~400 Hz | interpretação aguda | aceitável (grito de confusão); confira consistência |
| Node não acha arquivo em `/c/Users/...` | caminho do Git Bash | usar `C:/Users/...` no Node |
| `tile` do ffmpeg com `-frames:v 3` | um quadro de saída por mosaico | `-frames:v 1` |
| `\u` em parâmetro de ferramenta vira caractere cru | escape interpretado | evitar `\u` em regex escrita por ferramenta |

## Erros de processo (não repetir)

- Pensar que "QC PASS" = vídeo bom. Sempre ver o MP4 quadro a quadro.
- Parar no meio sem dizer o estado; ao bater limite, dizer o que ficou feito e o que falta.
- Afirmar que ouviu/assistiu sem ter feito. Sempre: "ninguém ouviu nem assistiu num celular ainda".
