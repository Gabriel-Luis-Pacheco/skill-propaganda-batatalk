# Revisão com agentes (o método que levou o "E se…?" de "esquisito" a campeão)

Foram 6 rodadas, 45 agentes (Haiku e Sonnet) e 04/11/2026. O dono pediu: "lança muitos Haikus…", "faça mais rodadas…", "refaz com o Sonnet…", "várias revisões com Haikus e Sonnet". Use isto sempre que o pedido for "revisa criticamente", "isso faz sentido para um leigo?" ou "melhore a piada".

## 1. Princípios
- **Os agentes veem o vídeo real, não a intenção.**
  - Antes: gere folhas de contato do MP4 a **2 quadros por segundo**, com o tempo no canto. Use `ffmpeg -vf "fps=2,scale=270:480,drawtext=text='%{pts\:hms}':…,tile=6x4"` e salve em `review/<versão>/folha01.jpg…`.
  - Gere também `sons.txt`: a linha do tempo de vozes e efeitos, tirada de `generated/timeline-<cut>.json`.
  - Escreva também um `intencao.md` com o que cada cena *quer* dizer.
  - O agente lê a intenção **só depois** de dar a primeira impressão. Assim aparece o que o leigo não entende.
- **Mistura de papéis no mesmo lote, em paralelo e em segundo plano:**
  - **leigos (Haiku):** senhora de 55 anos sem inglês; adolescente de 15–17; motorista vendo sem som; estudante de inglês tímida; pessoas de regiões diferentes (Recife, Belém, BH, Porto Alegre, Goiânia, Manaus);
  - **especialistas (Sonnet):** clareza visual (diretor de animação); som e mixagem (dá números em dB); roteirista de humor com caça a "cara de IA"; editor de vídeo viral e advogado do diabo (gancho, ritmo, loop, nota de retenção);
  - **pesquisa (Sonnet melhor que Haiku):** web com nível de evidência.
- **Pedir sempre:**
  - em que segundo passaria;
  - o que entendeu e o que não;
  - do que riu;
  - se enviaria e para quem;
  - o que é estranho, forçado ou "coisa de IA";
  - a correção **mínima** e produzível no nosso rig.
- **Rodadas encadeadas:**
  1. crítica do vídeo ou roteiro;
  2. plano da próxima versão;
  3. crítica do **plano** (antes de gastar render e voz);
  4. produção;
  5. crítica do novo MP4.

## 2. Como filtrar o que volta (não aceite tudo)
- **Vale** o que **vários agentes viram sem combinar**: "parece casal", "app dando Perfeito para a vizinha parece bug", "não sei que ela é a de baixo", "sussurro inaudível". Monte a tabela "problema × quantos citaram × gravidade".
- **Descarte:**
  - Pedidos de **marca ou propaganda** ("põe BataTalk no 1º quadro", "end card com o app"): o dono quer entretenimento sem propaganda direta.
  - Leitura errada da piada (ex.: "o Dia 1000 precisa de um erro de inglês"). A piada era responder em inglês a um brasileiro.
  - Agentes que "veem" coisa que não existe (um chamou o Caio no chuveiro de "moça").
  - Números de blog sem fonte.
- **Haiku** é rápido e bom como espectador leigo, mas pesquisa raso (só blogs). **Sonnet** pesquisa melhor, acha furos de lógica e escreve punch-ups bons. Sempre que der, a rodada final é Sonnet.
- **Simulação não é público.** Diga isso no fechamento. A validação real é a retenção no painel do perfil (Trial Reels, tempo assistido, envios por alcance).

## 3. Modelos de prompt que funcionaram (adapte o caminho e a versão)
**Leigo (Haiku):**
```
Você é <persona: idade, cidade, inglês?, vê com ou sem som>. Abra e OLHE <…/folha01.jpg, folha02.jpg, folha03.jpg> (quadros de um Reel animado de N s, 2 por segundo, tempo no canto) e leia <…/sons.txt>. NÃO leia intencao.md antes da parte 1.
PARTE 1 (honesta, sem otimismo): para cada trecho diga o que você ACHA que acontece, se riu, se ficou confuso e por quê, e em que segundo pararia de assistir.
PARTE 2: leia intencao.md; o que não tinha entendido e a mudança MÍNIMA (imagem, texto ou som) que faria entender de primeira.
PARTE 3: <pergunta de decisão, ex.: narrador no começo ajuda?>. Português, máx 500 palavras.
```
**Clareza visual (Sonnet):** "compare intenção × o que a imagem mostra: causa visível? quem fala? geografia? o punch tem imagem forte? texto legível e fora do rosto? Problema com tempo exato + gravidade + correção PRODUZÍVEL num rig 2D simples. Termine com as 8 correções em ordem."
**Som (Sonnet):** forneça o RMS por janela de cada stem (voz, música, ambiência, efeitos). Pergunte o que fica confuso de ouvido, o som que falta ou sobra, se a música ajuda o humor e as recomendações em dB e tempos.
**Roteirista e "cara de IA" (Sonnet):** use o checklist de `26 §1`. Peça nota 0–10 por beat ("leigo entende" e "graça"), 3 a 5 alternativas para os beats fracos, a melhor escolhida, e o roteiro reescrito com pausas.
**Editor e advogado do diabo (Sonnet):** gancho de 2 s (só texto × narrador × abrir com o punch), minutagem real das falas ("cabe em X s?"), loop, chips, nota de retenção e "o que falta para 9", e "PRONTO PARA PRODUZIR? sim/não".
**Pesquisa (Sonnet):** "separe fato com fonte de opinião; diga quais números populares NÃO têm fonte primária; não invente views nem citações; URLs no fim".

## 4. Formato do relatório para o dono
- Tabela "o que vários viram" (problema, quantos, gravidade).
- O que fica intocado (o melhor beat).
- Decisão de cada divergência, com o porquê.
- O que foi descartado e por quê.
- O plano da versão seguinte.
- O custo de voz, perguntando antes de gastar.
- Limites: agentes não são público; quadros não são o vídeo rodando; ninguém ouviu.

## 5. Ferramentas
- Os agentes rodam em segundo plano (`run_in_background`); o relatório chega como mensagem. Não fique consultando: espere a notificação e dê um aviso curto ao dono a cada retorno.
- Folha do MP4 final a 1 fps (`tile=9x4`): leia com o Read antes de entregar.
