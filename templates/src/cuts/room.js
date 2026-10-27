// O quarto da Mina (vídeo de criadora): vetor chapado, mesma família das salas do app.
// Parede quente, janela para o pôr do sol de Batata City, varal de luzinhas, prateleira com
// livros e um Tato de pelúcia, pôster da cidade, ring light de criadora. 1800 × 2600; a Mina
// fica em x 900 e a cabeça dela cobre o meio do quadro, então tudo o que conta mora nas bordas
// que aparecem no plano médio: janela à esquerda, prateleira e pôster à direita, luzinhas no alto.
// Desenhado uma vez (estático, rasterizado no corte); a câmera mexe no conjunto.
import { tatoFigure } from '/tato-guide.js';

export const ROOM = {
  w: 1800, h: 2600, cx: 900, cy: 1300,
  // textos desenhados no canvas depois (SVG como imagem não carrega as fontes da marca)
  texts: [
    { text: 'BATATA CITY', x: 1560, y: 1222, font: '600 44px Fredoka', color: '#1C3A2B' },
    { text: '14 CIDADES', x: 1560, y: 1262, font: '700 21px "DM Sans"', color: '#5B6A5D', spacing: 4 },
  ],
  poster: { cx: 1560, cy: 1090, rot: -3 },
};

const rnd = (seed) => { let k = seed; return () => { k = (k * 9301 + 49297) % 233280; return k / 233280; }; };
const bulbs = (() => {
  const out = [];
  for (let i = 0; i <= 24; i++) {
    const x = 120 + i * 66, u = (x - 120) / 1560, y = 330 + 150 * 4 * u * (1 - u) + (i % 2 ? 7 : 0);
    out.push(`<circle cx="${x}" cy="${y + 12}" r="34" fill="url(#glow)"/><circle cx="${x}" cy="${y + 12}" r="9" fill="#FFF1C2"/><rect x="${x - 3.5}" y="${y - 2}" width="7" height="8" rx="2" fill="#6E5E52"/>`);
  }
  return out.join('');
})();
const skyline = (x0, x1, y0, color, lit, seed) => {
  const r = rnd(seed);
  let x = x0, s = '';
  while (x < x1) {
    const w = 44 + r() * 58, h = 90 + r() * 200;
    s += `<rect x="${x.toFixed(0)}" y="${(y0 - h).toFixed(0)}" width="${w.toFixed(0)}" height="${(h + 60).toFixed(0)}" rx="7" fill="${color}"/>`;
    if (lit) for (let wy = y0 - h + 22; wy < y0 - 16; wy += 32) for (let wx = x + 9; wx < x + w - 13; wx += 19) if (r() > 0.42) s += `<rect x="${wx.toFixed(0)}" y="${wy.toFixed(0)}" width="9" height="13" rx="2" fill="#FFD36E" opacity="${(0.55 + r() * 0.45).toFixed(2)}"/>`;
    x += w + 5;
  }
  return s;
};
const books = (() => {
  const cols = ['#E2503A', '#2F4C8C', '#F8C637', '#2E9E78', '#8A55F0'];
  let x = 1506, s = '';
  cols.forEach((c, i) => { const w = 24 + (i * 7) % 12, h = 118 + (i * 23) % 44; s += `<rect x="${x}" y="${760 - h}" width="${w}" height="${h}" rx="4" fill="${c}"/><rect x="${x + 5}" y="${760 - h + 16}" width="${w - 10}" height="6" rx="3" fill="#FFF6EA" opacity=".55"/>`; x += w + 3; });
  return s;
})();

export function roomSVG() {
  // o desenho do Tato é HTML (atributos sem valor, como data-tato-rig); como imagem, o SVG é XML
  const plush = tatoFigure('plush').replace('<svg ', '<svg x="1336" y="590" width="154" height="170" ').replace(/\s(data-[\w-]+)(?=[\s/>])/g, ' $1=""');
  const { cx, cy, rot } = ROOM.poster;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1800 2600" width="1800" height="2600">
<defs>
  <linearGradient id="rw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EDBFB2"/><stop offset=".5" stop-color="#F6DACB"/><stop offset="1" stop-color="#F1CDBC"/></linearGradient>
  <linearGradient id="led" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C77DFF" stop-opacity=".6"/><stop offset="1" stop-color="#C77DFF" stop-opacity="0"/></linearGradient>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8C6BC9"/><stop offset=".5" stop-color="#F7848C"/><stop offset="1" stop-color="#FFB27D"/></linearGradient>
  <radialGradient id="key" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#FFF6E8" stop-opacity=".8"/><stop offset=".6" stop-color="#FFF6E8" stop-opacity=".25"/><stop offset="1" stop-color="#FFF6E8" stop-opacity="0"/></radialGradient>
  <radialGradient id="glow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#FFE29A" stop-opacity=".55"/><stop offset="1" stop-color="#FFE29A" stop-opacity="0"/></radialGradient>
  <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#FFE7A0" stop-opacity=".7"/><stop offset="1" stop-color="#FFE7A0" stop-opacity="0"/></radialGradient>
  <radialGradient id="ringGlow" cx="50%" cy="50%" r="50%"><stop offset=".55" stop-color="#FFFFFF" stop-opacity="0"/><stop offset=".78" stop-color="#FFFFFF" stop-opacity=".45"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></radialGradient>
  <linearGradient id="pst" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8FD3E8"/><stop offset="1" stop-color="#F7E7B4"/></linearGradient>
  <pattern id="dots" width="70" height="70" patternUnits="userSpaceOnUse"><circle cx="18" cy="18" r="3.4" fill="#DC9C88" opacity=".32"/><circle cx="53" cy="53" r="3.4" fill="#DC9C88" opacity=".32"/></pattern>
  <clipPath id="glass"><rect x="204" y="504" width="472" height="822" rx="18"/></clipPath>
</defs>
<rect width="1800" height="2600" fill="url(#rw)"/>
<rect width="1800" height="2600" fill="url(#dots)"/>
<rect width="1800" height="420" fill="url(#led)"/>
<rect x="0" y="96" width="1800" height="12" fill="#E9B8FF" opacity=".85"/>
<ellipse cx="900" cy="1180" rx="860" ry="900" fill="url(#key)"/>
<!-- janela: o pedaço que aparece fica à esquerda da cabeça (sol, prédios acesos) -->
<rect x="180" y="480" width="520" height="870" rx="30" fill="#FFF6EA"/>
<rect x="204" y="504" width="472" height="822" rx="18" fill="url(#sky)"/>
<g clip-path="url(#glass)">
  <circle cx="330" cy="1010" r="190" fill="url(#sunGlow)"/><circle cx="330" cy="1010" r="72" fill="#FFE08A"/>
  ${skyline(204, 690, 1180, '#A98BD0', false, 7)}${skyline(196, 690, 1290, '#6E5AA6', true, 3)}
  <rect x="204" y="1290" width="472" height="40" fill="#5B4A8B"/>
</g>
<rect x="433" y="504" width="14" height="822" fill="#FFF6EA"/><rect x="204" y="896" width="472" height="14" fill="#FFF6EA"/>
<rect x="160" y="1340" width="560" height="40" rx="12" fill="#EBD7C3"/>
<path d="M560 1340 l-14 -66 h84 l-14 66z" fill="#E77B4F"/>
<path d="M588 1276 c-38 -56 -86 -66 -114 -38 c38 0 66 18 114 38z M588 1276 c10 -76 58 -104 96 -90 c-38 20 -66 48 -96 90z M588 1276 c-10 -66 -38 -104 -76 -114 c20 38 48 76 76 114z" fill="#3A8F5C"/>
<!-- cortina -->
<path d="M110 450 h190 c-24 130 36 280 -12 450 c-36 150 48 300 12 560 h-190z" fill="#2E9E78"/>
<path d="M160 450 c-12 210 34 440 0 1010" stroke="#23806A" stroke-width="12" fill="none" opacity=".6"/>
<path d="M232 450 c22 230 -22 480 12 1010" stroke="#3FB28D" stroke-width="9" fill="none" opacity=".5"/>
<rect x="90" y="430" width="680" height="24" rx="12" fill="#C98B5E"/>
<!-- varal de luzinhas -->
<path d="M120 330 Q900 630 1680 330" stroke="#6E5E52" stroke-width="3.5" fill="none"/>${bulbs}
<!-- prateleira: Tato de pelúcia, livros, planta -->
<rect x="1310" y="760" width="520" height="26" rx="8" fill="#C98B5E"/><rect x="1310" y="786" width="520" height="12" fill="#000" opacity=".08"/>
${plush}
${books}
<path d="M1652 760 l-10 -58 h68 l-10 58z" fill="#FFF6EA"/><path d="M1677 704 c-30 -10 -40 -40 -30 -60 c20 10 30 30 30 60z M1677 704 c20 -20 50 -30 70 -20 c-10 20 -40 30 -70 20z M1677 704 c0 -30 10 -60 30 -70 c0 30 -10 50 -30 70z" fill="#3A8F5C"/>
<path d="M1352 786 c-12 70 22 140 -10 230 M1370 786 c22 60 0 130 22 190" stroke="#3A8F5C" stroke-width="8" fill="none" stroke-linecap="round"/>
<circle cx="1342" cy="1016" r="10" fill="#3A8F5C"/><circle cx="1392" cy="976" r="9" fill="#3A8F5C"/>
<!-- pôster de Batata City -->
<g transform="rotate(${rot} ${cx} ${cy})">
  <rect x="1400" y="870" width="320" height="440" rx="14" fill="#FFF6EA"/>
  <rect x="1416" y="886" width="288" height="296" rx="8" fill="url(#pst)"/>
  <circle cx="1650" cy="946" r="32" fill="#FFE08A"/>
  <rect x="1432" y="1066" width="50" height="116" rx="6" fill="#2E9E78"/><rect x="1488" y="1016" width="60" height="166" rx="6" fill="#F07AA0"/><rect x="1554" y="1082" width="48" height="100" rx="6" fill="#2F4C8C"/><rect x="1608" y="1042" width="76" height="140" rx="6" fill="#F8C637"/>
</g>
<!-- ring light de criadora -->
<circle cx="1600" cy="1640" r="300" fill="url(#ringGlow)"/>
<circle cx="1600" cy="1640" r="210" fill="none" stroke="#FFFDF7" stroke-width="36"/>
<rect x="1592" y="1850" width="16" height="760" fill="#B9A89A"/>
<!-- quadrinho do café (Easter egg) -->
<g transform="rotate(4 300 1560)"><rect x="200" y="1450" width="200" height="230" rx="10" fill="#FFF6EA"/><rect x="216" y="1466" width="168" height="168" rx="6" fill="#F3E2C7"/><path d="M262 1560 h76 v36 a38 38 0 0 1 -76 0z" fill="#2E9E78"/><path d="M338 1572 a16 16 0 0 1 0 32" stroke="#2E9E78" stroke-width="9" fill="none"/><path d="M284 1540 c-8 -14 8 -22 0 -36 M310 1540 c-8 -14 8 -22 0 -36" stroke="#C98B5E" stroke-width="6" fill="none" stroke-linecap="round"/></g>
<!-- cama e almofadas (canto de baixo) -->
<rect x="-60" y="1800" width="880" height="900" rx="90" fill="#E3AE98"/>
<rect x="40" y="1860" width="320" height="210" rx="64" fill="#FFF6EA"/><rect x="320" y="1890" width="280" height="190" rx="64" fill="#F8C637"/>
<rect x="-60" y="2100" width="880" height="500" rx="40" fill="#2E9E78" opacity=".85"/>
<rect x="0" y="2330" width="1800" height="270" fill="#D9B596"/>
</svg>`;
}
