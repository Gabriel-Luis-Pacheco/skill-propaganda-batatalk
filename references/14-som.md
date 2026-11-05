# Som (`audio/score.mjs`)

Tudo sintetizado no próprio projeto (licença própria, sem samples de terceiros), montado a partir da linha do tempo exportada (`generated/timeline-<corte>.json`) — a mesma conta da imagem.

## Trilhas (seção `music` do corte)

`A.cue('music', 0, { sections: [[0, 'lofi'], [duração, 'out']], drops: [[a, b], …], bpm })`
- `vlog` (104 BPM, G–D–Bm–A): criadora no quarto.
- `lofi` (86 BPM, swing, piano elétrico Gmaj7–F♯m7–Em7–Dmaj7, chiado de vinil): bar à noite.
- `quiz` (game show; nos cronômetros só um pedal grave, bumbo na revelação).
- **drops** = silêncios de comédia (a música some e volta seca): abertura fria sem música até a primeira fala de "drama"; no "trava tudo"; no "Uma batata."/"Confia." (volta com o boing); na pergunta final do laço.
- Ambiência de café/bar: `A.cue('ambience', 0, { until: duração })`.

## Efeitos disponíveis

tap, rung, chip, result, door, swoop, whoosh, untangle, motif, motif-end, dream (sinos do flashback), cut, tick, tock, buzz (erro), pop (adesivo), crickets (silêncio constrangedor), boing (Tato), scratch (disco arranhando), thud (o "tum" de meme — saturado com tanh, porque celular não toca grave puro), stamp (carimbo).

## Plateia de verdade (o que o dono aprovou, 28/10)

- **Gravações reais** da Mixkit em `audio/crowd-real/`, baixadas com permissão do dono. A licença de efeitos gratuita vale para posts em redes e anúncios; só não pode redistribuir o arquivo sozinho:
  - `mixkit-424.wav`: risada curta, começa na hora;
  - `mixkit-460.wav`: gargalhada que sobe em 1 s;
  - `mixkit-423.wav`: risada longa;
  - `mixkit-422.wav`: risada + aplauso;
  - `mixkit-512.wav`: aplauso.
- Use `A.sfx('sample', t, { file, from, len, fadeOut, gain })`: o trecho é normalizado em RMS (−22 dBFS × gain), vai em estéreo para o barramento da plateia e abaixa sob a voz.
- **Só depois de punch real**: 3 a 5 no vídeo, cada uma num lugar onde um humano riria.
- **Sem ambiência sintética de sala**: o ruído constante virou "chiado" para o dono (−25 dBFS nas pausas). Entre as falas pode ficar o silêncio; as risadas trazem a sala delas.
- **Voz em blocos (gpt-audio)**: corte nos respiros, `normWhole` para manter a dinâmica do take e, se o pace pedir, 1,05× no take inteiro (`voice-fast.mjs --speed 1.05`) em vez de acelerar só um pedaço.

## Plateia sintética (REPROVADA: "robotizada")

- `A.sfx('laugh', t, { size: 0–1, len, seed })` e `A.sfx('applause', t, { size, len, seed })` vão para um barramento próprio, a plateia (stem `crowd.wav`). Esse barramento é estéreo largo e abaixa até 0,55× sob a voz, para o comediante falar por cima do fim da risada.
- A risada empilha 2–11 takes do **banco de risadas** (`tools/crowd-voices.mjs`: 12 vozes do TTS × gargalhada/risada contida, sem transcrição), com alturas (±12%), atrasos e lados diferentes. Por baixo vai uma **cama sintética** de 5–29 risadas: rajadas de "ha" a 4–5,6/s, pulso glotal + sopro, formantes de /a/. Tudo passa por uma sala curta (Schroeder).
- O aplauso é feito de 10–40 pares de mãos sintéticas (ruído em banda curta, 3,4–5,4 palmas/s).
- Sem música durante o set (clipe de stand-up não tem trilha). Use `A.cue('ambience', 0, { until, place: 'club' })` para a sala quieta: ar, murmúrio baixo e um copo de vez em quando.
- Nível: a risada grande fica perto do pico da voz (no stand-up a plateia é alta). Conferir nas formas de onda.

## Mix

- Cada fala/trecho é normalizada em RMS (−20 dBFS), passa-altas 85 Hz, rampas de 6 ms nos cortes.
- Música e ambiência abaixam sob as vozes (ducking 30/250 ms).
- Alvo −15 LUFS integrados, pico verdadeiro ≤ −2 dBTP (QC aceita −16,5…−13,5 e ≤ −1).
- Todo efeito entra com rampa de 2 ms (degrau = clique e pico +3 dB).
- Confira as formas de onda dos stems (`showwavespic`) — medir, não supor (já aconteceu de o "silêncio" estar mais alto que o café).

## Conferir a trilha antes do render (sem ouvir)
Desenhe as formas de onda dos stems empilhadas (mix, música, vozes, efeitos) e confira três coisas: a música some de verdade nos silêncios de comédia, os efeitos caem nos tempos certos e não há buraco morto nas vozes.
```bash
for s in mix music voices sfx; do ffmpeg -i audio/out/<corte>/$s.wav -filter_complex showwavespic=s=1800x160 -frames:v 1 w-$s.png; done
ffmpeg -i w-mix.png -i w-music.png -i w-voices.png -i w-sfx.png -filter_complex vstack=inputs=4 ondas.png
```

## Mix do Reel campeão (03–05/11; ver `24` §6)
- **Seção `dias` com `stages`:** cada marco tem um nível (1 = coração esparso, 2 = groove, 3 = cheio com palmas, 4 = completo com piano elétrico, 5 = noite sem bateria, 6 = final). Use `gain: 0.3`, drops antes de cada punch e o maior silêncio antes do maior punch.
- **Ambiência por cena:** `place: 'dias'`, spans room/water/dream/city/murmur, `gain: 0.45`. O chuveiro fica baixo, porque a água (1–8 kHz) cobre as consoantes.
- **Sussurro e fala dormindo:** `gain` 1,0. O mix normaliza cada fala pelo RMS dos trechos com voz; com `gain` 0,5 o sussurro ficou a −30…−36 dBFS, colado na ambiência.
- **Voz de app:**
  - `fx: 'phone'` (passa-alta 520 Hz, passa-baixa 3,6 kHz, saturação leve), passado por `AudioList.clip(…, { fx })`;
  - "plim" (`notif`) 0,16 s antes;
  - o mesmo plim antes da fala que rima no fim.
- **Efeitos novos:** `flush` (descarga), `snore` (ronco) e `thud` (vassoura no teto). Só 2 whooshes em todo o vídeo.
- **Risada:** Mixkit 424, `gain` 0,6, 2 s; a do grupo, de verdade, sem plateia sintética.
- **Medição sem ouvir:**
  - RMS por janela de 2–2,5 s de cada stem (`voices`, `music`, `ambience`, `sfx`);
  - alvo: voz −26…−30 dBFS, música 8–12 dB abaixo antes do ducking, ambiência −35…−40.
