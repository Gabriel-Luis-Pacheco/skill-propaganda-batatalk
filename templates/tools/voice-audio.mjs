// VOZES com o modelo de áudio da OpenAI (Chat Completions com saída de áudio: gpt-audio-1.5), pago:
// só roda com autorização explícita do dono (28/10: "gera a voz com as keys da OpenAI, usa as melhores
// possíveis"). Diferente do TTS (voice-final.mjs), o modelo "atua" um bloco inteiro de texto, então
// a prosódia corre como fala de verdade; o corte por frase é feito depois, nos respiros. O modelo
// devolve a transcrição do que falou: a checagem de "leu palavra por palavra" sai de graça.
//
//   V8P_TTS_AUTORIZADO=1 node --env-file=../.env v8-publica/tools/voice-audio.mjs [id …]
// Saída: v8-publica/audio/voices/final/takes/<id>_<n>.wav + .json (transcrição, uso de tokens).
import ffmpegPath from 'ffmpeg-static';
import { spawn } from 'node:child_process';
import { access, mkdir, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

if (process.env.V8P_TTS_AUTORIZADO !== '1') {
  console.error('Parado: voz paga exige autorização explícita (V8P_TTS_AUTORIZADO=1). Nada foi gerado.');
  process.exit(2);
}
const key = process.env.OPENAI_API_KEY;
if (!key) { console.error('OPENAI_API_KEY ausente (rode com node --env-file=../.env).'); process.exit(2); }
const here = path.dirname(fileURLToPath(import.meta.url));
const takeDir = path.join(here, '..', 'audio', 'voices', 'final', 'takes');
const MODEL = process.env.V8P_AUDIO_MODEL || 'gpt-audio-1.5';

const PERSONA = {
  // "A confiança do gringo" (28/10): esquete de contraste no café de Batata City e numa padaria no Brasil
  cast: 'Você é um ator de voz gravando UMA fala de uma esquete curta de humor para Reels. Leia EXATAMENTE o texto que o usuário mandar, palavra por palavra, sem acrescentar, tirar ou trocar nada, sem responder e sem comentar. Atue como gente de verdade numa situação real (nada de locutor, professor ou desenho animado exagerado), com a intenção descrita abaixo. Não ria e não faça barulhos, a não ser que a intenção peça.',
  jaxStand: 'Você é um ator de voz brasileiro gravando a fala de um comediante de stand-up. Leia EXATAMENTE o texto que o usuário mandar, palavra por palavra, sem acrescentar, tirar ou trocar nada, sem responder e sem comentar. Interpretação: Jax, 23 anos, comediante brasileiro, contando uma história real da vida dele ao vivo num bar de comédia pequeno, microfone na mão. Português do Brasil natural e solto, como quem conversa com a plateia: ritmo de stand-up, frases curtas, pausa de comediante antes da palavra final de cada piada, sorriso na voz, sem tom de locutor, sem tom de professor, sem exagero de desenho animado. Não ria e não faça barulhos. As frases em inglês saem com sotaque brasileiro de quem estudou na escola e acha que está arrasando.',
};
// "Dia 1, dia 10, dia 100, dia 1000" (03/11, pedido do fundador: "usa vozes BOAS, as melhores que der"):
// o mesmo balcão do Café Central em quatro dias; a Mina (nova), o Sora (echo, a voz do produto) e o Tato (cedar).
const DIAS = 'Você é um ator de voz gravando UMA fala de uma esquete curta de humor para Reels. Leia EXATAMENTE o texto da fala, palavra por palavra, sem acrescentar, tirar ou trocar nada, sem responder e sem comentar. Atue como gente de verdade numa situação real (nada de locutor, professor ou desenho animado), com a intenção descrita. Não ria e não faça barulhos, a não ser que a intenção peça. ';
PERSONA.diaMina = DIAS + 'Personagem: Mina, 21 anos, estudante brasileira num café. Português do Brasil nativo e natural, jovem, rápida, irônica; quando fala inglês, é com sotaque brasileiro claro de quem aprende (vogais abertas, ritmo brasileiro), sem caricatura; o inglês dela melhora de um dia para o outro, como descrito na intenção.';
PERSONA.diaSora = DIAS + 'Personagem: Sora, 27 anos, barista simpático do Café Central, inglês americano natural e casual, voz masculina jovem e calorosa, sempre atendendo no balcão com a máquina de café ao fundo.';
PERSONA.diaTato = DIAS + 'Personagem: o Tato, uma batata simpática que é o coach de conversação. Português do Brasil nativo, voz masculina leve, calorosa e de humor seco; nunca locutor de comercial, nunca professor.';
const LINES = {
  diaSoraQ: { who: 'diaSora', voice: 'echo', takes: 2, cue: true, text: 'For here or to go?', how: 'Pergunta de rotina do barista olhando o caixa: simpático, rápido, sem pressa nenhuma; leve subida em "go". Termina a frase inteira.' },
  diaSoraCut: { who: 'diaSora', voice: 'echo', takes: 2, cue: true, text: 'For here or—', how: 'A mesma pergunta de rotina, mas a cliente (uma habitual) atravessa e responde antes; ele só diz "For here or" e fica no ar, cortado por ela, já sorrindo.' },
  diaSoraReact: { who: 'diaSora', voice: 'echo', takes: 2, cue: true, text: 'Perfect. Coming right up!', how: 'Caloroso e rápido, já virando para fazer o café; pausa curta depois de "Perfect.". Dá para ouvir que ele percebeu o esforço da cliente e achou fofo, sem exagero.' },
  diaSoraGosto: { who: 'diaSora', voice: 'echo', takes: 2, cue: true, text: 'Finally, someone with taste!', how: 'Encantado e rindo, faz uma brincadeira de amigo: alguém reparou na playlist dele. Calor de gente que se conhece há meses.' },
  diaSoraFor: { who: 'diaSora', voice: 'echo', takes: 2, cue: true, text: 'For here?', how: 'Quase não pergunta: ele já sabe a resposta, só confirma por hábito, com um sorrisinho de amigo e o copo já na mão. Duas palavras, curtas, calmas.' },
  diaMinaA: { who: 'diaMina', voice: 'nova', takes: 2, cue: true, text: 'T-to go…?', how: 'Dia 1, ela estava congelada e ouve o Tato soprar a resposta: gagueja de nervoso em "T-to", voz pequena e aguda, subindo no fim, como quem não acredita que vai funcionar. Inglês de iniciante, bem hesitante.' },
  diaMinaPt: { who: 'diaMina', voice: 'nova', takes: 2, cue: true, text: 'Eu sobrevivi.', how: 'Olhando para a câmera, sussurrando, aliviada e ainda tremendo um pouco, quase rindo de si mesma; duas palavras com a pausa de quem respira depois do susto.' },
  diaMinaDez: { who: 'diaMina', voice: 'nova', takes: 2, cue: true, text: 'To go, please.', how: 'Dia 10, ela leu a cola que escreveu na própria mão: fala rápido para ninguém perceber, articulada demais, firme e orgulhosa, sem hesitar. Ainda sotaque brasileiro, mas sem travar.' },
  diaMinaCem: { who: 'diaMina', voice: 'nova', takes: 2, cue: true, text: 'To go, extra hot! Love the new playlist!', how: 'Dia 100, ela chega descontraída e interrompe o barista antes de ele terminar a pergunta: rápida, simpática, natural, olhando para ele, sorrindo na voz; inglês fluido com sotaque brasileiro leve; "Love the new playlist!" de passagem, como amiga.' },
  diaMinaMil: { who: 'diaMina', voice: 'nova', takes: 2, cue: true, text: 'For here.', how: 'Dia 1000, ela nem tira os olhos do celular: relaxada, quase entediada de tão fácil, voz baixa e calma, um meio sorriso; duas palavras ditas sem pensar, como quem pede a mesma coisa todo dia.' },
  diaMinaFim: { who: 'diaMina', voice: 'nova', takes: 2, cue: true, text: 'O difícil foi o dia um.', how: 'Para a câmera, calma, sorrindo de lado, sincera e um pouco emocionada, sem tom de motivação nem de comercial; uma pausa curta antes de "dia um", e "dia um" dito com carinho. Como quem conta uma coisa só para uma amiga.' },
  diaTatoSopra: { who: 'diaTato', voice: 'cedar', takes: 2, cue: true, text: 'To go! To go!', how: 'Espiando por cima do balcão, cochichando alto, aflito de verdade porque a Mina congelou; as duas palavras em inglês, sussurradas e urgentes, com o sotaque brasileiro de quem ensina, a segunda mais forte que a primeira.' },
  diaTatoDez: { who: 'diaTato', voice: 'cedar', takes: 2, cue: true, text: 'Dia dez.', how: 'Narrador deadpan do relógio passando, seco e divertido, quase sussurrando; duas palavras, sem exagero.' },
  diaTatoCem: { who: 'diaTato', voice: 'cedar', takes: 2, cue: true, text: 'Dia cem.', how: 'O mesmo narrador seco e divertido, um pouco mais animado que no dia dez, como quem está gostando do que vê. Duas palavras.' },
  diaTatoMil: { who: 'diaTato', voice: 'cedar', takes: 2, cue: true, text: 'Dia mil.', how: 'O mesmo narrador, agora grave e solene de brincadeira, como trailer de cinema levado a sério demais, mas com sorriso na voz. Duas palavras, a segunda mais longa.' },
  diaTatoSeu: { who: 'diaTato', voice: 'cedar', takes: 2, cue: true, text: 'E o seu dia um?', how: 'Acorda de uma soneca, vira para a câmera e pergunta com carinho e um sorriso, sem pressionar; calor de amigo, quatro palavras, a última com um leve convite.' },
  diaTatoCTA: { who: 'diaTato', voice: 'cedar', takes: 2, cue: true, text: 'BataTalk. Comece grátis.', say: 'Bata Tók. Comece grátis.', how: 'Assinatura curta e calorosa: o nome com orgulho, pausa, o convite com sorriso. "BataTalk" se pronuncia “Bata Tók”.' },
  sv3a: { who: 'jaxStand', voice: 'cedar', takes: +(process.env.V8P_TAKES || 2), text: 'Eu estudei inglês sete anos na escola. Sete anos. Primeiro dia de intercâmbio, na porta da escola: PUSH. Meu cérebro leu: puxe. Puxei. Puxei com força. Puxei com fé. Aí veio uma criança de seis anos… e empurrou. Com um dedo.' },
  sv3b: { who: 'jaxStand', voice: 'cedar', takes: 2, text: 'Na entrevista de emprego, eu arrasei: I pretend to work here for many years. Pretend é fingir. Eu prometi, olhando no olho do cara, que ia fingir que trabalho. Fui contratado. Pra gerente.' },
  sv3c: { who: 'jaxStand', voice: 'cedar', takes: 2, text: 'Hoje eu treino antes, num site. Quando eu travo, aparece uma batata pra me ajudar. Uma batata, gente. E o danado fala inglês melhor que eu.' },
  cfS1: { who: 'cast', voice: 'echo', takes: 1, text: 'Hi! What can I get you?', how: 'Sora, a friendly young barista at a busy café counter, greeting the next customer: warm, quick, routine, natural American English.' },
  cfM1: { who: 'cast', voice: 'nova', takes: 2, text: 'Hi! Can I get an iced latte with oat milk and a croissant, please?', how: 'Mina, a 21-year-old Brazilian woman, orders in excellent, fast, natural English with only a very light Brazilian accent; relaxed and fluent, like she does it every day.' },
  cfM2: { who: 'cast', voice: 'nova', takes: 1, cue: true, text: 'Sorry, my English is so bad…', how: 'The same Mina, suddenly insecure: she apologizes quietly and embarrassed, shrinking, a little nervous laugh in the voice, trailing off. Light Brazilian accent.' },
  cfS2: { who: 'cast', voice: 'echo', takes: 2, text: "It's… perfect?", how: 'The barista is genuinely confused because her English was perfect: a puzzled pause after "It\'s…", then "perfect?" rising, kind, not mocking.' },
  cfD1: { who: 'cast', voice: 'ash', takes: 1, cue: true, text: 'Oi! Eu querer… pão de queijo. Obrigado!', how: 'Dante, a big, loud American tourist in a Brazilian bakery, says this in Portuguese with a heavy, obvious American accent and bad pronunciation, but with total, proud confidence, as if he were fluent. Loud, joyful, slow on the Portuguese words.' },
  cfP1: { who: 'cast', voice: 'coral', takes: 2, text: 'Gente, ele fala português!', how: 'Priya, uma atendente de padaria brasileira, encantada de verdade porque o gringo falou português: animada, voz alta e calorosa, como quem chama os colegas para ver. Português do Brasil nativo.' },
  cfD2: { who: 'cast', voice: 'ash', takes: 1, text: 'Fluente.', how: 'Dante, o turista americano, olha para a câmera e diz uma palavra só em português, com sotaque americano carregado, peito estufado, orgulho absoluto e calmo. Uma palavra.' },
  cfT1: { who: 'cast', voice: 'cedar', takes: 1, text: 'Você fala melhor que ele.', how: 'O Tato, uma batata simpática que é o coach de conversação, cochicha para a amiga brasileira, carinhoso e cúmplice, com um sorriso na voz, encorajando. Português do Brasil nativo.' },
  cfM3: { who: 'cast', voice: 'nova', takes: 1, cue: true, text: 'I know.', how: 'The same Mina, now confident: chin up, a small proud smile in her voice, calm and a bit cheeky. Two words.' },
};

// "E se o Cam treinasse inglês todo dia?" (03/11, v5): narrador de causo + Cam (ballad, a voz dele no elenco) + vizinha + turista.
const CAMV = "Você é um ator de voz gravando UMA fala de um vídeo curto de humor para Reels. Leia EXATAMENTE o texto da fala, palavra por palavra, sem acrescentar, tirar ou trocar nada, sem responder e sem comentar. Atue como gente de verdade (nada de locutor de comercial, professor ou desenho exagerado), com a intenção descrita. Não ria e não faça barulhos, a não ser que a intenção peça. ";
PERSONA.camNar = CAMV + "Personagem: o narrador do vídeo, um brasileiro jovem contando um causo para um amigo; voz masculina natural, humor seco, deadpan, ritmo rápido de conversa, pausas curtas antes da palavra da piada; nunca locutor, nunca professor, sem sotaque regional carregado.";
PERSONA.camCam = CAMV + "Personagem: Cam, 26 anos, ator e improvisador brasileiro, expressivo, teatral e simpático, com a voz bem aberta; quando fala inglês, é com sotaque brasileiro leve e plausível de quem estuda todo dia.";
PERSONA.camViz = CAMV + "Personagem: dona Marlene, vizinha de apartamento, mulher de uns 60 anos, brasileira, falando através de uma parede fina, voz um pouco abafada, preocupada e depois seca e decidida.";
PERSONA.camTur = CAMV + "Personagem: um homem de uns 40 anos, de chapéu e mapa na mão, que parece turista americano mas é brasileiro; em inglês fala com sotaque americano de quem decorou frase de livro; em português, sotaque brasileiro do interior do Paraná, simpático.";
const CAMLINES = {
  camN1: { who: 'camNar', voice: 'ash', takes: 2, cue: true, text: "E se o Cam treinasse inglês todo dia?", how: "Abertura do causo, já no meio da conversa: curioso, convidativo, um sorriso na voz; a pergunta sobe de leve no fim." },
  camC1: { who: 'camCam', voice: 'ballad', takes: 2, cue: true, text: "Vou baixar um app de inglês. Segunda eu começo.", how: "Deitado no sofá, olhando o celular, falando consigo mesmo sem pensar: confiante e preguiçoso; \"Segunda eu começo\" dito como quem já disse isso cem vezes, quase cantando." },
  camN2: { who: 'camNar', voice: 'ash', takes: 2, cue: true, text: "E baixou. Na hora.", how: "Seco, deadpan, rápido: o narrador desmonta o que o Cam acabou de dizer; \"Na hora.\" quase sussurrado, sem sorrir." },
  camN3: { who: 'camNar', voice: 'ash', takes: 2, cue: true, text: "Dia um. O app pediu pra falar em voz alta. Ele foi pro armário.", how: "\"Dia um.\" curto e firme como título de capítulo; depois conversa normal, rápida; \"Ele foi pro armário.\" seco, uma pausa mínima antes de \"armário\"." },
  camC2: { who: 'camCam', voice: 'ballad', takes: 2, cue: true, text: "Hello?", how: "Sussurrando dentro de um armário, com medo de ser ouvido; em inglês, sotaque brasileiro de quem está nervoso; sobe no fim como quem atende o telefone no escuro." },
  camN4: { who: 'camNar', voice: 'ash', takes: 2, cue: true, text: "O app soltou confete. Ele chorou.", how: "Narração seca e rápida; \"Ele chorou.\" dito com uma pausa de meio segundo antes, deadpan, sem emoção, como quem constata um fato absurdo." },
  camN5: { who: 'camNar', voice: 'ash', takes: 2, cue: true, text: "Dia dez. Já treinava no chuveiro.", how: "\"Dia dez.\" firme, título de capítulo; depois conversa normal, com um leve sorriso na voz em \"chuveiro\"." },
  camV1: { who: 'camViz', voice: 'sage', takes: 2, cue: true, text: "Tá tudo bem aí?", how: "Gritando de leve do outro lado da parede, voz abafada, preocupada de verdade, sotaque brasileiro de vizinha de prédio." },
  camC3: { who: 'camCam', voice: 'ballad', takes: 2, cue: true, text: "I'm fine, thank you! And you?", how: "No chuveiro, respondendo no automático e com muita animação, como quem recita a frase da escola; sotaque brasileiro claro, ritmo de livro didático, \"And you?\" bem simpático, sem perceber a situação." },
  camV2: { who: 'camViz', voice: 'sage', takes: 2, cue: true, text: "Vou chamar o síndico.", how: "Depois de um silêncio de assombro: seca, decidida e um pouco assustada, como quem toma uma providência definitiva; voz abafada pela parede." },
  camN6: { who: 'camNar', voice: 'ash', takes: 2, cue: true, text: "Dia cem. Sonhou em inglês. Com legenda.", how: "\"Dia cem.\" firme; \"Sonhou em inglês.\" normal; uma pausa de meio segundo e \"Com legenda.\" seco, como a piada que é; sem rir." },
  camN7: { who: 'camNar', voice: 'ash', takes: 2, cue: true, text: "Um gringo perdido pediu o caminho.", how: "Conversa normal e rápida, com uma pitada de suspense, preparando a cena." },
  camT1: { who: 'camTur', voice: 'echo', takes: 2, cue: true, text: "Excuse me, bus station?", how: "Turista de chapéu e mapa na mão, meio perdido, educado, inglês americano de quem decorou a frase; \"bus station\" com a dúvida de quem lê no mapa." },
  camC4: { who: 'camCam', voice: 'ballad', takes: 2, cue: true, text: "Go straight, then left at the bakery!", how: "Orgulhoso e fluente, falando rápido e animado, gesticulando, sotaque brasileiro leve; termina em tom de vitória." },
  camT2: { who: 'camTur', voice: 'echo', takes: 2, cue: true, text: "Cara, eu sou de Cascavel.", how: "Em português do Brasil, simpático e meio sem graça, coçando a cabeça, avisando com carinho; sotaque do interior do Paraná; \"Cascavel\" no fim." },
  camN8: { who: 'camNar', voice: 'ash', takes: 2, cue: true, text: "Ele saiu andando igual quem ganhou a Copa.", how: "Seco e rápido; \"igual quem ganhou a Copa\" com um leve sorriso, a imagem engraçada dita sem exagero." },
  camN9: { who: 'camNar', voice: 'ash', takes: 2, cue: true, text: "Dia mil. Ele ainda erra.", how: "\"Dia mil.\" firme e um pouco mais solene; \"Ele ainda erra.\" honesto e leve, quase carinhoso." },
  camC5: { who: 'camCam', voice: 'ballad', takes: 2, cue: true, text: "I have twenty-six years!", how: "Numa mesa de bar, contando a idade com total confiança e alegria, sem perceber o erro; sotaque brasileiro leve; \"twenty-six years\" orgulhoso." },
  camN10: { who: 'camNar', voice: 'ash', takes: 2, cue: true, text: "Só que agora ele ri junto.", how: "Caloroso e leve, um sorriso na voz; a frase mais humana do vídeo, sem tom de lição." },
  camN11: { who: 'camNar', voice: 'ash', takes: 2, cue: true, text: "Dia dez mil. Ele ainda foi pro armário.", how: "\"Dia dez mil.\" grave e solene de brincadeira, como trailer levado a sério demais; depois seco e rápido." },
  camN12: { who: 'camNar', voice: 'ash', takes: 2, cue: true, text: "E chorou com o confete.", how: "Seco, deadpan, quase ternura escondida; a última piada, dita baixo." },
};
for (const [k, v] of Object.entries(CAMLINES)) LINES[k] = v;

// "E se você treinasse inglês todo dia?" v10 (04/11): sem narrador; Caio (ballad), Vera (coral), Nina (nova), Marcos (onyx), homem da rua (ash), voz de app (alloy).
const DZV = "Você é um ator de voz gravando UMA fala de uma esquete animada curta de humor para Reels. Leia EXATAMENTE o texto da fala, palavra por palavra, sem acrescentar, tirar ou trocar nada, sem responder e sem comentar. Atue como gente de verdade numa situação real (nada de locutor de comercial, professor ou desenho exagerado), com a intenção descrita. Não ria e não faça barulhos, a não ser que a intenção peça. ";
PERSONA.dzCaio = DZV + "Personagem: Caio, 26 anos, brasileiro, expressivo e simpático, que treina inglês sozinho e morre de vergonha de falar na frente dos outros; quando fala inglês, é com sotaque brasileiro leve e plausível de quem estuda todo dia.";
PERSONA.dzVera = DZV + "Personagem: Vera, vizinha do apartamento de baixo, mulher brasileira de uns cinquenta e poucos anos, calorosa, prática, um pouco mandona e de humor seco; ouve tudo pelo teto.";
PERSONA.dzApp = DZV + "Personagem: a voz de um aplicativo de treino de inglês no celular: neutra, clara, curta, educada e um pouco robótica de propósito, como assistente de app; português do Brasil.";
PERSONA.dzBeto = DZV + "Personagem: um homem brasileiro comum de uns quarenta anos, de mochila, com pressa de pegar o ônibus; fala português do Brasil sem sotaque regional carregado.";
PERSONA.dzNina = DZV + "Personagem: Nina, 24 anos, amiga do Caio, rápida, provocadora e carinhosa, voz feminina jovem e confiante, português do Brasil.";
PERSONA.dzMarcos = DZV + "Personagem: Marcos, 30 anos, amigo do Caio, voz masculina grave e calma, humor seco e afetuoso, português do Brasil.";
const DZLINES = {
  dzC1: { who: 'dzCaio', voice: 'ballad', takes: 2, cue: true, text: "Hello…", how: "Sussurrando trancado no banheiro, com o celular colado na boca, morrendo de medo de alguém do lado de fora ouvir; quase sem voz." },
  dzA1: { who: 'dzApp', voice: 'alloy', takes: 2, cue: true, text: "Mais alto!", how: "Voz de aplicativo, clara e animada, pedindo para o usuário falar mais alto; curta." },
  dzC2: { who: 'dzCaio', voice: 'ballad', takes: 2, cue: true, text: "Hello!", how: "Gritando de uma vez, alto e libertado, aproveitando que o barulho da descarga cobre a voz; uma palavra só, com alívio e coragem." },
  dzC3: { who: 'dzCaio', voice: 'ballad', takes: 2, cue: true, text: "How are you? I'm fine, thank you! And you?", how: "Ensaiando sozinho no chuveiro, em voz alta e animada, recitando o diálogo decorado da escola como se fosse uma música; sotaque brasileiro claro; \"And you?\" bem simpático, para ninguém." },
  dzV1: { who: 'dzVera', voice: 'coral', takes: 2, cue: true, text: "…Cansada.", how: "Respondendo, pela primeira vez, a um \"And you?\" que ela ouve pelo teto há dez dias: olhando para o teto, uma palavra só, seca e exausta, sem raiva, com humor resignado." },
  dzC4: { who: 'dzCaio', voice: 'ballad', takes: 2, cue: true, text: "Hey… what's up…", how: "Falando dormindo, murmurando de olhos fechados, enrolado, quase sem articular; sotaque brasileiro." },
  dzV2: { who: 'dzVera', voice: 'coral', takes: 2, cue: true, text: "Not much. You?", how: "Respondendo dormindo, no automático, de olhos fechados, com uma pronúncia em inglês surpreendentemente boa e natural (melhor que a do vizinho), calma e sonolenta." },
  dzA2: { who: 'dzApp', voice: 'alloy', takes: 2, cue: true, text: "Perfeito!", how: "Voz de aplicativo, clara e satisfeita, dando nota máxima a uma pronúncia; curta." },
  dzB1: { who: 'dzBeto', voice: 'ash', takes: 2, cue: true, text: "Moço, a rodoviária?", how: "Na calçada, com pressa e simpático, perguntando o caminho a um desconhecido; pergunta curta e normal." },
  dzB2: { who: 'dzBeto', voice: 'ash', takes: 2, cue: true, text: "…Moço, eu falo português.", how: "Depois de um silêncio, seco, paciente e sem graça, olhando para a pessoa que respondeu em inglês sem motivo; sem rir; \"português\" no fim, firme." },
  dzN1: { who: 'dzNina', voice: 'nova', takes: 2, cue: true, text: "Fala inglês aí, Caio!", how: "Numa mesa de bar, animada, provocando o amigo na frente de todo mundo, rindo de leve; empurrãozinho carinhoso." },
  dzM1: { who: 'dzMarcos', voice: 'onyx', takes: 2, cue: true, text: "Mais alto!", how: "Rindo de leve, puxando o amigo, incentivando com carinho depois que ele sussurrou; curto, sem gritar." },
};
PERSONA.dzNar = DZV + "Personagem: o narrador do vídeo, um brasileiro jovem que abre o causo para os amigos; voz masculina natural, curiosa e divertida, sem sotaque regional carregado.";
DZLINES.dzN0 = { who: 'dzNar', voice: 'cedar', takes: 2, cue: true, text: "E se você falasse inglês todo dia?", how: "Abertura de vídeo de humor, curiosa e com um sorriso na voz, ritmo de conversa entre amigos, rápida; sobe levemente no fim da pergunta. Nada de locutor de comercial ou professor." };
DZLINES.dzV3 = { who: 'dzVera', voice: 'coral', takes: 2, cue: true, text: "Shut up, Caio!", how: "Acordada no meio da madrugada, batendo com a vassoura no teto, grita irritada para o vizinho de cima, em inglês surpreendentemente perfeito, com energia e sem raiva de verdade; curto e explosivo." };
DZLINES.dzC6 = { who: 'dzCaio', voice: 'ballad', takes: 2, cue: true, text: "…thank you!", how: "Dormindo profundamente, responde no automático, todo educado, como quem recita a frase da escola, sorrindo de olhos fechados; sonolento mas simpático." };
DZLINES.dzV4 = { who: 'dzVera', voice: 'coral', takes: 2, cue: true, text: 'Cala a boca, Caio!', how: 'Acordada no meio da madrugada, batendo com a vassoura no teto, grita irritada para o vizinho de cima que fala inglês dormindo; brava, exausta e engraçada, curta e explosiva, sem raiva de verdade.' };
for (const [k, v] of Object.entries(DZLINES)) LINES[k] = v;

// Fala curta que parece mensagem ("Hi! What can I get you?", "Sorry, my English is so bad…") vira
// conversa: em 28/10, 10 de 18 tomadas responderam "Claro, me manda o texto…". Três ecos antes da fala
// ensinam o modelo a só repetir, e a transcrição confere cada tomada: a errada vai para rejeitadas/.
// Pedido de desculpa nem com eco: "Sorry, my English is so bad…" ganhou 3 consolos ("Don't worry, you're
// doing great!"). Linha com `cue` vai no próprio roteiro (sistema) e a mensagem do usuário é só "Ação!".
const ECHO = ['Hi! How are you doing today?', 'Desculpa, eu não entendi. Pode repetir?', 'Sure, send me the text.']
  .flatMap((s) => [{ role: 'user', content: s }, { role: 'assistant', content: s }]);
const norm = (s) => String(s).toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/[^a-z0-9]+/g, ' ').trim();
const badDir = path.join(takeDir, 'rejeitadas');

await mkdir(takeDir, { recursive: true });
const exists = (f) => access(f).then(() => true, () => false);
const run = (argv) => new Promise((resolve, reject) => {
  const p = spawn(ffmpegPath, argv, { stdio: ['ignore', 'pipe', 'pipe'] });
  let err = ''; p.stderr.on('data', (d) => { err += d; });
  p.on('close', (c) => (c === 0 ? resolve() : reject(new Error(err.slice(-800)))));
});
const only = process.argv.slice(2);
let spent = 0;
for (const [id, line] of Object.entries(LINES)) {
  if (only.length && !only.includes(id)) continue;
  let misses = 0;
  for (let n = 1; n <= line.takes; n++) {
    const f = path.join(takeDir, `${id}_${n}.wav`);
    if (await exists(f)) continue;
    const sys = PERSONA[line.who] + (line.how ? `\nIntenção desta fala: ${line.how}` : '');
    const said = line.say ?? line.text;
    const messages = line.cue
      ? [{ role: 'system', content: `${sys}\nA fala é só esta, nada antes e nada depois: "${said}"` }, { role: 'user', content: 'Gravando. Ação!' }]
      : [{ role: 'system', content: sys }, ...ECHO, { role: 'user', content: said }];
    let j = null;
    for (let attempt = 1; attempt <= 5 && !j; attempt++) {
      const r = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: MODEL, modalities: ['text', 'audio'], audio: { voice: line.voice, format: 'wav' }, messages }),
      });
      if (r.status === 429 || r.status >= 500) { await new Promise((z) => setTimeout(z, 1500 * attempt)); continue; }
      if (!r.ok) throw new Error(`${id}: ${r.status} ${(await r.text()).slice(0, 400)}`);
      j = await r.json();
    }
    if (!j) throw new Error(`${id}: sem resposta`);
    const audio = j.choices?.[0]?.message?.audio;
    if (!audio?.data) throw new Error(`${id}: resposta sem áudio`);
    const raw = f.replace(/\.wav$/, '.src.wav');
    await writeFile(raw, Buffer.from(audio.data, 'base64'));
    await run(['-hide_banner', '-loglevel', 'error', '-y', '-i', raw, '-ac', '1', '-ar', '48000', '-c:a', 'pcm_s16le', f]);
    await writeFile(f.replace(/\.wav$/, '.json'), JSON.stringify({ model: MODEL, voice: line.voice, text: audio.transcript, usage: j.usage }, null, 1));
    const tokens = j.usage?.completion_tokens_details?.audio_tokens ?? 0;
    spent += tokens;
    if (norm(audio.transcript) !== norm(said)) {
      await mkdir(badDir, { recursive: true });
      const tag = `${id}_${n}_${String.fromCharCode(98 + misses)}`;
      for (const ext of ['.wav', '.src.wav', '.json']) await rename(f.replace(/\.wav$/, ext), path.join(badDir, tag + ext));
      console.log(`rejeitada ${tag}  “${audio.transcript}”  tokens de áudio ${tokens}`);
      if (++misses > 1) throw new Error(`${id}: o modelo não leu o texto em ${misses} tentativas; parei para não gastar mais`);
      n--; continue;
    }
    console.log(`take ${id}_${n}  “${audio.transcript}”  tokens de áudio ${tokens}`);
  }
}
console.log(`tokens de áudio nesta rodada: ${spent} (≈ US$ ${(spent * 32e-6).toFixed(3)}–${(spent * 64e-6).toFixed(3)})`);
