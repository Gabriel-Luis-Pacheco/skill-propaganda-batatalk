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

## Mix

- Cada fala/trecho é normalizada em RMS (−20 dBFS), passa-altas 85 Hz, rampas de 6 ms nos cortes.
- Música e ambiência abaixam sob as vozes (ducking 30/250 ms).
- Alvo −15 LUFS integrados, pico verdadeiro ≤ −2 dBTP (QC aceita −16,5…−13,5 e ≤ −1).
- Todo efeito entra com rampa de 2 ms (degrau = clique e pico +3 dB).
- Confira as formas de onda dos stems (`showwavespic`) — medir, não supor (já aconteceu de o "silêncio" estar mais alto que o café).
