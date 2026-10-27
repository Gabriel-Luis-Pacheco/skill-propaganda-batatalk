# Animação, rig e câmera

## Rig do produto

`renderCharacter(D, { pose, expr, overlay, blink, view, headExtra })` devolve um SVG.
- `pose`: objeto `{ armL, armR, body: { rot, dx, dy }, head: { nod, rot, turn }, legL, legR }`; braço = `[ângulo do braço, ângulo ABSOLUTO do antebraço, mão ('rest'|'open'|'fist'|'point'), objeto?]`, a partir de "reto para baixo", positivo = para fora. L = esquerda da tela.
- `expr`: nome (neutral, listening, speaking, thinking, smallSmile, laugh, confused, surprised, embarrassed, annoyed, frustrated, proud, concerned, sad, excited) ou objeto (`{ eyes: { open, pupil, look, lid, low }, brows: { y, rot }, mouth: { t, open, curve, w, asym } }`).
- `overlay`: mescla na expressão (`mouth` do visema, `eyes.look`). `headExtra` soma giro de cabeça; `pose.head.nod` soma aceno; `pose.head.turn` vira a cabeça.
- `view`: `'front'`, `'q34'` (olha para a direita da tela), `'q34r'` (para a esquerda).
- viewBox cheio = `[-W/2, -(altura+24), W, altura+38]`, `W = max(250, altura·0,92)`. Use o recorte cheio e uma câmera própria (o `bust` recentra na cabeça a cada quadro).
- O id do SVG muda a cada render (contador global): re-renderize só quando a chave (JSON dos parâmetros) mudar.

**Armadilhas do rig**
- Em `q34`/`q34r` o braço do lado OPOSTO ao olhar é desenhado ATRÁS do corpo (`turn·s < −0,3`): objeto (celular) e gesto que precisa aparecer vão na mão da frente; contar nos dedos com as duas mãos → vire para `front`.
- Objeto preso ao antebraço gira com ele; para segurar um celular de pé use `upright: true` com formas centradas na mão.
- Cabeça grande (chibi): no plano médio a cabeça cobre o meio do quadro; mãos "no rosto" exigem ângulos tipo `[100, −165]`; mãos acima da cabeça podem cobrir o cabelo.

## Movimento calmo (feedback do dono, 26/10)

O dono reclamou: "pq a personagem fica tremendo tanto até onde não é necessário?". Causa: corpo pulando com o volume da voz a 100 Hz + aceno a cada palavra + antebraço trocando de lado a cada palavra + câmera com oscilação rápida.
- Corpo: média da voz em ±0,2 s, amplitude baixa (`dy = −0,8·nível`).
- Cabeça e mãos: um movimento lento só no começo de cada frase (`sin(π·u)`, 0,45 s).
- Câmera "na mão": ≤ 4 px, < 0,15 Hz, giro ≤ 0,15°.
- Gestos grandes (comemorar, contar nos dedos, mostrar o celular) podem ter **mola** (`E.spring`); pulinho no "Amiga!" (corpo sobe 26 un. em 0,5 s).

## Câmera e montagem

- Enquadramentos por personagem com os olhos num ponto fixo da tela: `at(quem, escala, olhoX, olhoY)` → `{s, cx, cy}`. Planos: TWO, MED, CU, XCU (2,9×), versões de frente (CUF, XCUF) para falar com a câmera.
- Aproximação lenta dentro do plano (`creep` 3–10 %), segurando o olhar.
- **Tranco de zoom** na piada: escala × (1 + amp·e^(−9Δt)), amp 0,03–0,07.
- **Tremida** curta no "tum": 14 px·e^(−11Δt), senos de 71/59 Hz.
- Linhas de foco de mangá (brancas, 0,7 de opacidade) no orgulho e no deadpan.
- **Falha digital** ("trava tudo"): faixas ciano/magenta em `screen`, saltos em degraus a 30 Hz, `hue-rotate` + `saturate` por 0,34 s. **Nunca `contrast()`** (esmaga cabelo escuro em preto puro).
- Flashback: quadro-negro rasterizado, giz em várias passadas, sépia, clarão de entrada, balanço leve.
- Celular em primeira pessoa: aparelho grande (988×930), câmera frontal como ponto na borda (entalhe grande cobria a fala do app), polegar, mesa e copo desfocados embaixo; câmera interna do app em três enquadramentos (fala+NPC, dock, selo).
- Cenário raster (SVG → canvas, desfoque 2,2–2,4 px de profundidade) em camada própria; o mundo e o cenário compartilham a câmera (paralaxe só na deriva).

## Tato

`TatoActor` (bake de humores/gestos/piscadas/visemas por `tatoSpeech`). Entrada: mola que sobe de trás da mesa (recorte abaixo do tampo com `clip-path`), estica/amassa (`scale(1−sq, 1+sq)`, sq = 0,12·e^(−3,6u)·sin 9,5u). Humores: greeting, cheeky, celebrating, encouraging… Gestos: wave, cheer, point, hop, pop. É o personagem fixo/absurdo (estilo Duo do Duolingo).

## Adesivos e confete

`stick()`: entra com mola, balança 1,6°, sai encolhendo. Estilos: caixa branca TikTok (Fredoka 600), pílula manteiga/verde, neon rosa para o endereço, janela de erro "travou.exe". Confete: 46 retângulos com semente fixa saindo dos punhos (não do rosto).
