// O palco do "stand-up dos falsos amigos": a Casa de Show de Neon Purê numa noite de Tiny Gig (o
// Jax trabalha lá no app: character-cast.js). Vetor chapado, uma luz só: o holofote que vem da
// plateia e abre um círculo quente na parede de tijolo vinho. Neon ciano "STAND-UP" (a cor da Casa
// de Show no mapa: city-experience.js), cortina de veludo, varal de lâmpadas, pôster das Tiny Gigs
// e um Tato emoldurado na parede (o enfeite da casa). 1800 × 2600, centro (900, 1300) = ponto
// (540, 1000) do mundo no plano aberto. Desenhado uma vez e rasterizado; os textos (neon, pôster)
// entram depois, no canvas, na fonte da marca. Também a plateia vista do palco (contraplano da
// primeira fila) e as silhuetas da plateia em primeiro plano.
import { tatoFigure } from '/tato-guide.js';

export const STAGE = {
  w: 1800, h: 2600, cx: 900, cy: 1300,
  texts: [
    { text: 'STAND-UP', x: 900, y: 800, font: '700 124px Fredoka', color: '#C8FFFB', glow: '#4FE3E0', blur: 30, spacing: 8 },
    { text: 'TINY GIGS', x: 352, y: 1012, font: '700 46px Fredoka', color: '#1C3A2B', spacing: 3 },
    { text: 'toda quinta · 21h', x: 352, y: 1060, font: '600 30px Fredoka', color: '#7A3B2E' },
    { text: 'microfone aberto', x: 352, y: 1100, font: '600 26px Fredoka', color: '#7A3B2E' },
    { text: 'CASA DE SHOW', x: 1435, y: 1214, font: '700 26px Fredoka', color: '#F3E6C8', spacing: 3 },
    { text: 'NEON PURÊ', x: 1435, y: 1250, font: '600 22px Fredoka', color: '#4FE3E0', spacing: 4 },
  ],
};

const rnd = (seed) => { let k = seed; return () => { k = (k * 9301 + 49297) % 233280; return k / 233280; }; };
const hex = (c, d) => { const n = parseInt(c.slice(1), 16), f = (v) => Math.max(0, Math.min(255, Math.round(v + d))); return `#${[f(n >> 16), f((n >> 8) & 255), f(n & 255)].map((v) => v.toString(16).padStart(2, '0')).join('')}`; };

/** O palco visto da plateia (fundo do plano aberto, médio e close). */
export function stageSVG() {
  const r = rnd(31);
  // tijolos vinho com argamassa escura; cada tijolo com uma variação pequena de cor
  let bricks = '';
  for (let row = 0, y = 0; y < 1820; row++, y += 58) {
    for (let x = (row % 2 ? -66 : 0); x < 1800; x += 132) {
      const d = (r() - 0.5) * 22;
      bricks += `<rect x="${x + 5}" y="${y + 5}" width="122" height="48" rx="7" fill="${hex('#74323A', d)}"/>`;
      if (r() > 0.82) bricks += `<rect x="${x + 14}" y="${y + 10}" width="${(30 + r() * 50).toFixed(0)}" height="6" rx="3" fill="#FFFFFF" opacity=".06"/>`;
    }
  }
  // varal de lâmpadas
  let bulbs = '<path d="M150 150 Q 900 270 1650 150" stroke="#2B2129" stroke-width="5" fill="none"/>';
  for (let i = 0; i <= 14; i++) {
    const u = i / 14, x = 150 + 1500 * u, y = 150 + 120 * 4 * u * (1 - u);
    bulbs += `<circle cx="${x.toFixed(0)}" cy="${(y + 22).toFixed(0)}" r="44" fill="url(#bulbGlow)"/><rect x="${(x - 6).toFixed(0)}" y="${(y - 2).toFixed(0)}" width="12" height="14" rx="3" fill="#3B3138"/><circle cx="${x.toFixed(0)}" cy="${(y + 22).toFixed(0)}" r="12" fill="#FFE29A"/>`;
  }
  // cortina de veludo nas duas pontas
  const curtain = (x0, w, flip) => {
    let s = `<rect x="${x0}" y="0" width="${w}" height="1830" fill="#8E1F33"/>`;
    for (let i = 0; i < 5; i++) { const x = x0 + (i + 0.5) * w / 5; s += `<rect x="${(x - 9).toFixed(0)}" y="0" width="18" height="1830" fill="#6A1424" opacity=".7"/><rect x="${(x + 12).toFixed(0)}" y="0" width="8" height="1830" fill="#B8364D" opacity=".45"/>`; }
    s += `<rect x="${flip ? x0 : x0 + w - 16}" y="0" width="16" height="1830" fill="#5A0F1E"/>`;
    return s;
  };
  // o Tato emoldurado na parede (o enfeite da casa)
  const tato = tatoFigure('stage-frame').replace('<svg ', '<svg x="1366" y="905" width="140" height="154" ').replace(/\s(data-[\w-]+)(?=[\s/>])/g, ' $1=""');
  // tábuas do palco (horizontais, com fresta) e o círculo de luz no chão
  let boards = '';
  for (let i = 0; i < 8; i++) { const y = 1830 + i * 42; boards += `<rect x="0" y="${y}" width="1800" height="40" fill="${i % 2 ? '#5A3A2A' : '#614030'}"/><rect x="0" y="${y + 38}" width="1800" height="3" fill="#3E271C" opacity=".8"/>`; }
  // a plateia no escuro, com velinhas nas mesas
  let candles = '';
  for (let i = 0; i < 16; i++) { const x = 60 + r() * 1680, y = 2290 + r() * 260; candles += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(40 + r() * 30).toFixed(0)}" fill="url(#candle)"/><circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="7" fill="#FFC870" opacity=".85"/>`; }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1800 2600" width="1800" height="2600">
<defs>
  <radialGradient id="spot" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#FFD9A0" stop-opacity=".62"/><stop offset=".55" stop-color="#F2A869" stop-opacity=".28"/><stop offset="1" stop-color="#F2A869" stop-opacity="0"/></radialGradient>
  <radialGradient id="floorSpot" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#FFD9A0" stop-opacity=".5"/><stop offset="1" stop-color="#FFD9A0" stop-opacity="0"/></radialGradient>
  <radialGradient id="bulbGlow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#FFD36E" stop-opacity=".45"/><stop offset="1" stop-color="#FFD36E" stop-opacity="0"/></radialGradient>
  <radialGradient id="candle" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#FF9A4D" stop-opacity=".42"/><stop offset="1" stop-color="#FF9A4D" stop-opacity="0"/></radialGradient>
  <radialGradient id="neonWash" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#4FE3E0" stop-opacity=".22"/><stop offset="1" stop-color="#4FE3E0" stop-opacity="0"/></radialGradient>
  <linearGradient id="dark" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2C2232"/><stop offset="1" stop-color="#1D1824"/></linearGradient>
</defs>
<rect width="1800" height="2600" fill="#4E2228"/>
${bricks}
<ellipse cx="900" cy="760" rx="640" ry="220" fill="url(#neonWash)"/>
<ellipse cx="900" cy="1080" rx="600" ry="760" fill="url(#spot)"/>
${bulbs}
<rect x="196" y="900" width="312" height="236" rx="10" fill="#F3E6C8"/><rect x="196" y="900" width="312" height="62" rx="10" fill="#F8C637"/><rect x="196" y="950" width="312" height="12" fill="#F8C637"/><rect x="212" y="1146" width="280" height="8" rx="4" fill="#000" opacity=".18"/>
<rect x="1352" y="890" width="168" height="186" rx="12" fill="#C99A5B"/><rect x="1364" y="902" width="144" height="162" rx="6" fill="#F3E6C8"/>${tato}
<rect x="1330" y="1180" width="210" height="96" rx="14" fill="#2A2230"/><rect x="1336" y="1186" width="198" height="84" rx="10" fill="none" stroke="#4FE3E0" stroke-width="3" opacity=".7"/>
<rect x="1580" y="1500" width="70" height="40" rx="8" fill="#1F6B4F"/><rect x="1588" y="1508" width="54" height="24" rx="5" fill="#3FBF8A" opacity=".9"/>
${curtain(0, 170, false)}${curtain(1630, 170, true)}
<rect x="0" y="1780" width="1800" height="50" fill="#3A2619"/>
${boards}
<ellipse cx="900" cy="1960" rx="560" ry="120" fill="url(#floorSpot)"/>
<rect x="0" y="2166" width="1800" height="34" fill="#3A2619"/><rect x="0" y="2166" width="1800" height="6" fill="#8A6246" opacity=".7"/>
<rect x="0" y="2200" width="1800" height="400" fill="url(#dark)"/>
${candles}
</svg>`;
}

/** A plateia vista do palco (contraplano da primeira fila): parede escura, mesinhas com velas ao
 *  fundo e cabeças da segunda fila. 1080 × 1920, sem paralaxe (o plano é curto). */
export function crowdBackSVG() {
  const r = rnd(47);
  let bokeh = '';
  for (let i = 0; i < 30; i++) { const x = r() * 1080, y = 380 + r() * 700, rr = 20 + r() * 50, c = ['#FF9A4D', '#FFD36E', '#4FE3E0', '#FF6EC7'][i % 4]; bokeh += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${rr.toFixed(0)}" fill="${c}" opacity="${(0.08 + r() * 0.16).toFixed(2)}"/>`; }
  let heads = '';
  for (let i = 0; i < 9; i++) { const x = 40 + i * 125 + r() * 30, y = 600 + r() * 70, s = 0.8 + r() * 0.3; heads += `<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)}) scale(${s.toFixed(2)})"><ellipse cx="0" cy="0" rx="58" ry="66" fill="#2E2538"/><path d="M-120 160 Q-110 70 0 64 Q110 70 120 160 Z" fill="#2E2538"/><path d="M-50 -40 Q0 -76 50 -40" stroke="#5A4A66" stroke-width="5" fill="none" opacity=".6"/></g>`; }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" width="1080" height="1920">
<defs><linearGradient id="room" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2A2140"/><stop offset=".6" stop-color="#231B33"/><stop offset="1" stop-color="#1C1626"/></linearGradient>
<radialGradient id="spill" cx="50%" cy="20%" r="70%"><stop offset="0" stop-color="#FFD9A0" stop-opacity=".22"/><stop offset="1" stop-color="#FFD9A0" stop-opacity="0"/></radialGradient></defs>
<rect width="1080" height="1920" fill="url(#room)"/>
<rect x="0" y="300" width="1080" height="6" fill="#4FE3E0" opacity=".25"/>
${bokeh}
${heads}
<rect width="1080" height="1920" fill="url(#spill)"/>
</svg>`;
}

/** Silhuetas da plateia de costas, em primeiro plano no plano aberto (cada cabeça é um nó próprio:
 *  balança quando a plateia ri). Devolve [{x, y, s, svg}] no espaço do mundo. */
export function crowdHeads() {
  const r = rnd(73), out = [];
  const row = (y0, n, s0, x0, dx) => { for (let i = 0; i < n; i++) { const s = s0 * (0.9 + r() * 0.22); out.push({ x: x0 + i * dx + (r() - 0.5) * 40, y: y0 + (r() - 0.5) * 30, s, hair: r() > 0.5, phone: r() > 0.86 }); } };
  row(1720, 6, 1.0, 60, 196);
  row(1860, 5, 1.25, -20, 270);
  return out.map((h) => ({ ...h, svg: `<svg width="${(300 * h.s).toFixed(0)}" height="${(330 * h.s).toFixed(0)}" viewBox="-150 -150 300 330" style="display:block;overflow:visible"><path d="M-140 180 Q-128 64 0 56 Q128 64 140 180 Z" fill="#221C2A"/><ellipse cx="0" cy="-20" rx="${h.hair ? 66 : 60}" ry="${h.hair ? 80 : 72}" fill="#221C2A"/><path d="M-52 -82 Q0 -118 52 -82" stroke="#5B4A62" stroke-width="7" fill="none" opacity=".75"/><path d="M-124 96 Q-60 60 0 58" stroke="#4A3C52" stroke-width="6" fill="none" opacity=".6"/>${h.phone ? '<rect x="40" y="-6" width="44" height="76" rx="9" fill="#9FF3F0" opacity=".85" transform="rotate(14 62 32)"/>' : ''}</svg>` }));
}

/** A caixa de retorno (monitor de chão) de onde o Tato sobe: 300 × 170, tampo em y 18. */
export function wedgeSVG() {
  return `<svg width="300" height="170" viewBox="0 0 300 170" style="display:block">
<path d="M10 40 L290 18 L292 160 L8 160 Z" fill="#2B2833"/><path d="M10 40 L290 18 L290 30 L10 52 Z" fill="#3E3A48"/>
<path d="M30 62 L270 44 L272 146 L28 146 Z" fill="#35313F"/>${Array.from({ length: 9 }, (_, i) => `<path d="M${36 + i * 27} ${60 - i * 2} L${36 + i * 27} ${142}" stroke="#2A2632" stroke-width="5"/>`).join('')}
<rect x="8" y="156" width="284" height="10" rx="4" fill="#1F1C26"/></svg>`;
}

/** Pedestal do microfone (vazio: o Jax segura o microfone na mão) e banquinho com copo d'água. */
export function standSVG() {
  return `<svg width="160" height="760" viewBox="0 0 160 760" style="display:block">
<ellipse cx="80" cy="742" rx="70" ry="14" fill="#1F1C26"/><path d="M80 742 L22 744 M80 742 L138 744 M80 742 L80 730" stroke="#2B2833" stroke-width="10" stroke-linecap="round"/>
<rect x="74" y="80" width="12" height="660" rx="6" fill="#9AA3AE"/><rect x="76" y="80" width="4" height="660" rx="2" fill="#FFFFFF" opacity=".45"/>
<rect x="70" y="300" width="20" height="26" rx="5" fill="#2B2833"/><path d="M80 82 Q80 40 104 26" stroke="#2B2833" stroke-width="12" fill="none" stroke-linecap="round"/><rect x="96" y="12" width="26" height="30" rx="8" fill="#2B2833"/></svg>`;
}
export function stoolSVG() {
  return `<svg width="220" height="520" viewBox="0 0 220 520" style="display:block">
<rect x="94" y="40" width="40" height="70" rx="10" fill="#DDEBF2" opacity=".55"/><rect x="98" y="66" width="32" height="40" rx="6" fill="#BEE3F2" opacity=".7"/><rect x="100" y="46" width="8" height="54" rx="4" fill="#FFFFFF" opacity=".6"/>
<ellipse cx="110" cy="112" rx="96" ry="20" fill="#2B2833"/><rect x="18" y="104" width="184" height="16" rx="8" fill="#3E3A48"/>
<path d="M40 120 L18 510 M180 120 L202 510 M84 120 L76 510 M136 120 L144 510" stroke="#2B2833" stroke-width="14" stroke-linecap="round"/>
<rect x="34" y="330" width="152" height="12" rx="6" fill="#9AA3AE"/></svg>`;
}

/** A mesinha da primeira fila (contraplano): tampo redondo escuro, vela, limonada e a caneca da June. */
export function frontTableSVG() {
  return `<svg width="1240" height="760" viewBox="0 0 1240 760" style="display:block;overflow:visible">
<ellipse cx="620" cy="70" rx="640" ry="80" fill="#3A2619"/><ellipse cx="620" cy="58" rx="640" ry="72" fill="#5A3A2A"/><ellipse cx="620" cy="48" rx="600" ry="54" fill="#6B4632"/>
<rect x="0" y="70" width="1240" height="690" fill="#2B1F22"/>
<ellipse cx="560" cy="34" rx="70" ry="70" fill="#FF9A4D" opacity=".18"/><rect x="540" y="-14" width="40" height="52" rx="12" fill="#C8333E" opacity=".85"/><ellipse cx="560" cy="-6" rx="7" ry="10" fill="#FFC870"/>
<rect x="250" y="-70" width="62" height="108" rx="12" fill="#F7E58C" opacity=".85"/><rect x="258" y="-60" width="12" height="80" rx="6" fill="#FFFFFF" opacity=".5"/><circle cx="300" cy="-70" r="16" fill="#9BD35A"/>
<path d="M860 -40 h64 l-8 76 h-48 z" fill="#E8786A"/><path d="M924 -26 a16 16 0 0 1 0 32" stroke="#E8786A" stroke-width="9" fill="none"/>
</svg>`;
}

/** O prato de feijoada (adesivo): arroz, feijão, farofa, couve e uma rodela de laranja. */
export function plateSVG(farofa = false) {
  let crumbs = '';
  if (farofa) { const r = rnd(5); for (let i = 0; i < 26; i++) crumbs += `<circle cx="${(150 + r() * 110).toFixed(0)}" cy="${(120 + r() * 70).toFixed(0)}" r="${(3 + r() * 4).toFixed(1)}" fill="${r() > 0.5 ? '#E9C27A' : '#D9A85A'}"/>`; }
  return `<svg width="360" height="300" viewBox="0 0 360 300" style="display:block;overflow:visible">
<ellipse cx="180" cy="196" rx="170" ry="70" fill="#000" opacity=".22"/>
<ellipse cx="180" cy="160" rx="172" ry="104" fill="#F5F1E6"/><ellipse cx="180" cy="160" rx="132" ry="76" fill="#E7E1D0"/>
<ellipse cx="140" cy="150" rx="70" ry="44" fill="#FFFDF7"/>${Array.from({ length: 14 }, (_, i) => `<ellipse cx="${100 + (i % 7) * 13}" cy="${136 + Math.floor(i / 7) * 18}" rx="6" ry="3.5" fill="#EFE8D6"/>`).join('')}
<ellipse cx="214" cy="160" rx="66" ry="44" fill="#4A2A22"/>${Array.from({ length: 12 }, (_, i) => `<ellipse cx="${178 + (i % 6) * 14}" cy="${146 + Math.floor(i / 6) * 22}" rx="7" ry="5" fill="#5E3528"/>`).join('')}
<ellipse cx="218" cy="200" rx="58" ry="20" fill="#E3B66A"/><path d="M90 196 q30 -22 64 -6 q-20 22 -64 6z" fill="#3E8C4A"/><path d="M104 206 q26 -14 50 -2" stroke="#2E6E39" stroke-width="4" fill="none"/>
<circle cx="268" cy="118" r="26" fill="#F49A2A"/><circle cx="268" cy="118" r="19" fill="#FFC15A"/>${[0, 60, 120, 180, 240, 300].map((a) => `<path d="M268 118 L${(268 + 18 * Math.cos(a * Math.PI / 180)).toFixed(1)} ${(118 + 18 * Math.sin(a * Math.PI / 180)).toFixed(1)}" stroke="#F49A2A" stroke-width="2"/>`).join('')}
${crumbs}</svg>`;
}
/** A panela de barro da feijoada (adesivo). */
export function potSVG() {
  return `<svg width="380" height="300" viewBox="0 0 380 300" style="display:block;overflow:visible">
<ellipse cx="190" cy="262" rx="160" ry="26" fill="#000" opacity=".22"/>
<path d="M40 110 Q40 250 190 258 Q340 250 340 110 Z" fill="#9A4E2E"/><path d="M60 120 Q66 230 190 238" stroke="#B9653C" stroke-width="10" fill="none" opacity=".6"/>
<ellipse cx="190" cy="110" rx="160" ry="44" fill="#B25C36"/><ellipse cx="190" cy="108" rx="138" ry="32" fill="#4A2A22"/>${Array.from({ length: 10 }, (_, i) => `<ellipse cx="${100 + i * 19}" cy="${104 + (i % 2) * 8}" rx="8" ry="5" fill="#5E3528"/>`).join('')}
<path d="M30 112 q-30 4 -24 30 q12 14 36 0" stroke="#7E3E24" stroke-width="12" fill="none"/><path d="M350 112 q30 4 24 30 q-12 14 -36 0" stroke="#7E3E24" stroke-width="12" fill="none"/>
<path d="M150 60 q-14 -26 4 -46 M196 54 q-10 -28 8 -48" stroke="#FFFFFF" stroke-width="7" fill="none" opacity=".45" stroke-linecap="round"/></svg>`;
}
