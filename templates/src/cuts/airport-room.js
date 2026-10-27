// A imigração do Bata Airport ("ao pé da letra na imigração"): vetor chapado, a mesma paleta da
// cidade no app (world-cities.js: céu de fim de tarde, vidro dourado, verde-azulado, vermelho da
// Evelyn). Uma luz só: o sol baixo atrás da pista, entrando pela janela à esquerda. A cabine da
// oficial fica à direita (painel verde-azulado, número 3, pôster de Batata City com o Tato); a fila
// com fitas vermelhas atrás da Mina. 1800 × 2600, centro (900, 1300); desenhado uma vez e
// rasterizado no corte. Os textos (placa, número, pôster) entram depois, no canvas, na fonte da
// marca: SVG como imagem não carrega fonte.
import { tatoFigure } from '/tato-guide.js';

export const AIRPORT = {
  w: 1800, h: 2600, cx: 900, cy: 1300,
  texts: [
    { text: 'IMMIGRATION', x: 940, y: 478, font: '700 66px Fredoka', color: '#FFF5CF', spacing: 4 },
    { text: 'IMIGRAÇÃO · PASSPORT CONTROL', x: 940, y: 532, font: '600 28px Fredoka', color: '#BFD8D4', spacing: 2 },
    { text: '3', x: 1500, y: 888, font: '700 74px Fredoka', color: '#355B62' },
    { text: 'BATATA CITY', x: 1310, y: 1088, font: '700 34px Fredoka', color: '#355B62', spacing: 2 },
    { text: 'welcome!', x: 1310, y: 1124, font: '600 24px Fredoka', color: '#D98C71' },
  ],
};

const rnd = (seed) => { let k = seed; return () => { k = (k * 9301 + 49297) % 233280; return k / 233280; }; };
const cloud = (x, y, s, c, o) => `<g transform="translate(${x} ${y}) scale(${s})" opacity="${o}"><ellipse cx="0" cy="0" rx="90" ry="34" fill="${c}"/><ellipse cx="-50" cy="-18" rx="48" ry="34" fill="${c}"/><ellipse cx="34" cy="-30" rx="58" ry="44" fill="${c}"/></g>`;
const post = (x) => `<ellipse cx="${x}" cy="1832" rx="44" ry="12" fill="#3E4A50"/><rect x="${x - 9}" y="1560" width="18" height="272" rx="8" fill="#9AA5A8"/><rect x="${x - 9}" y="1560" width="6" height="272" fill="#FFFFFF" opacity=".25"/><circle cx="${x}" cy="1556" r="16" fill="#B7C1C3"/>`;
const belt = (x0, x1) => `<path d="M${x0} 1586 Q${(x0 + x1) / 2} 1616 ${x1} 1586" stroke="#D9343F" stroke-width="20" fill="none"/><path d="M${x0} 1580 Q${(x0 + x1) / 2} 1608 ${x1} 1580" stroke="#FF6F6F" stroke-width="4" fill="none" opacity=".6"/>`;
const plane = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0 C40 -26 300 -30 520 -18 C560 -16 590 -4 596 8 C590 20 560 26 520 26 L40 26 C14 26 -4 14 0 0 Z" fill="#EEF1EE"/><path d="M430 -16 L520 -120 L566 -120 L520 -14 Z" fill="#EEF1EE"/><path d="M470 -70 L530 -120 L566 -120 L540 -70 Z" fill="#D98C71"/><path d="M200 8 L330 70 L380 70 L300 8 Z" fill="#DDE3E0"/><path d="M40 4 h480" stroke="#4F8DA1" stroke-width="6"/><g fill="#7FA3B3">${Array.from({ length: 12 }, (_, i) => `<circle cx="${70 + i * 34}" cy="-4" r="5"/>`).join('')}</g></g>`;
const plant = (x, y) => `<path d="M${x - 50} ${y} l-12 -96 h124 l-12 96z" fill="#D98C71"/><path d="M${x} ${y - 96} c-60 -20 -88 -92 -60 -148 c40 28 60 80 60 148z M${x} ${y - 96} c40 -52 112 -72 160 -44 c-28 44 -92 68 -160 44z M${x} ${y - 96} c-8 -72 20 -140 68 -164 c8 68 -20 124 -68 164z M${x} ${y - 96} c-48 -36 -120 -40 -150 -6 c40 30 100 30 150 6z" fill="#4E9E7E"/>`;

export function airportSVG() {
  const r = rnd(19);
  const poster = tatoFigure('ime-poster').replace('<svg ', '<svg x="1236" y="896" width="148" height="160" ').replace(/\s(data-[\w-]+)(?=[\s/>])/g, ' $1=""');
  let tiles = '';
  for (let y = 1700; y < 2600; y += 110) tiles += `<path d="M0 ${y} H1800" stroke="#CDC4B1" stroke-width="3"/>`;
  for (let x = -60; x < 1900; x += 190) tiles += `<path d="M${x} 1640 L${x - 80} 2600" stroke="#CDC4B1" stroke-width="3"/>`;
  let mull = '';
  for (const x of [0, 320, 640, 960]) mull += `<rect x="${x - 11}" y="600" width="22" height="900" fill="#658D96"/><rect x="${x - 11}" y="600" width="7" height="900" fill="#FFFFFF" opacity=".18"/>`;
  let dashes = '';
  for (let i = 0; i < 26; i++) dashes += `<rect x="${20 + i * 70}" y="1396" width="34" height="6" rx="3" fill="#FFE3A0" opacity=".8"/>`;
  let specks = '';
  for (let i = 0; i < 22; i++) specks += `<circle cx="${(r() * 980).toFixed(0)}" cy="${(640 + r() * 520).toFixed(0)}" r="${(10 + r() * 26).toFixed(0)}" fill="#FFF3D6" opacity="${(0.06 + r() * 0.1).toFixed(2)}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1800 2600" width="1800" height="2600">
<defs>
  <linearGradient id="aWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D7CFBE"/><stop offset=".3" stop-color="#E7DFCD"/><stop offset="1" stop-color="#E9E1CF"/></linearGradient>
  <linearGradient id="aSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8FB3D1"/><stop offset=".42" stop-color="#D8C6CB"/><stop offset=".76" stop-color="#F4CFA6"/><stop offset="1" stop-color="#F8E0B2"/></linearGradient>
  <linearGradient id="aFloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#DCD4C2"/><stop offset="1" stop-color="#CFC5B1"/></linearGradient>
  <linearGradient id="aBooth" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5A97A8"/><stop offset="1" stop-color="#4A8495"/></linearGradient>
  <radialGradient id="aSun" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#FFE7BD" stop-opacity=".9"/><stop offset="1" stop-color="#FFE7BD" stop-opacity="0"/></radialGradient>
  <radialGradient id="aLamp" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#FFD98A" stop-opacity=".40"/><stop offset="1" stop-color="#FFD98A" stop-opacity="0"/></radialGradient>
  <radialGradient id="aStrip" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#FFF6DE" stop-opacity=".55"/><stop offset="1" stop-color="#FFF6DE" stop-opacity="0"/></radialGradient>
  <clipPath id="aWin"><rect x="0" y="600" width="980" height="900"/></clipPath>
</defs>
<rect width="1800" height="2600" fill="url(#aWall)"/>
<!-- teto com faixas de luz -->
<rect width="1800" height="380" fill="#CBC2B0"/>
<ellipse cx="900" cy="160" rx="900" ry="90" fill="url(#aStrip)"/>
<rect x="80" y="146" width="1640" height="26" rx="13" fill="#FFF7E3"/>
<rect x="160" y="290" width="1480" height="20" rx="10" fill="#FFF3D6" opacity=".85"/>
<rect y="372" width="1800" height="10" fill="#B5AC99"/>
<!-- janela: o fim de tarde da pista (atrás da Mina) -->
<g clip-path="url(#aWin)">
  <rect x="0" y="600" width="980" height="900" fill="url(#aSky)"/>
  <circle cx="300" cy="1020" r="240" fill="url(#aSun)"/>
  <circle cx="300" cy="1020" r="62" fill="#FFE1A6"/>
  ${cloud(560, 760, 1.3, '#FFEBDD', 0.85)}${cloud(150, 700, 0.8, '#FFDCC6', 0.7)}${cloud(820, 880, 0.7, '#FFE6D6', 0.6)}
  ${specks}
  <path d="M0 1250 l120 -46 90 26 140 -60 150 64 140 -34 170 48 170 -40 v200 H0 Z" fill="#B9AFBE" opacity=".6"/>
  <path d="M0 1270 q240 -50 480 -12 t500 -10 v260 H0 Z" fill="#9DB0A3"/>
  <rect x="0" y="1360" width="980" height="140" fill="#AFC0B8"/>
  <path d="M0 1388 H980" stroke="#DFDCC6" stroke-width="22"/>${dashes}
  <g transform="translate(150 1360)"><path d="M-20 0 L-14 -170 H14 L20 0" fill="#D5DECC"/><path d="M-40 -176 h80 l-11 42 h-58 Z" fill="#618B9C"/><path d="M-44 -180 h88" stroke="#3E626F" stroke-width="8"/><circle cy="-214" r="5" fill="#DA7C60"/><path d="M0 -182 v-28" stroke="#577787" stroke-width="4"/></g>
  ${plane(420, 1336, 0.86)}
</g>
${mull}<rect x="0" y="1030" width="980" height="12" fill="#658D96"/>
<rect x="0" y="588" width="980" height="22" fill="#658D96"/><rect x="0" y="1494" width="980" height="22" fill="#658D96"/>
<!-- placa pendurada (o texto entra no canvas) -->
<path d="M640 382 V420 M1240 382 V420" stroke="#6F777A" stroke-width="6"/>
<rect x="560" y="410" width="760" height="164" rx="24" fill="#355B62"/>
<rect x="560" y="410" width="760" height="164" rx="24" fill="none" stroke="#2B4950" stroke-width="6"/>
<rect x="600" y="446" width="54" height="74" rx="8" fill="#FFF5CF"/><circle cx="627" cy="474" r="12" fill="none" stroke="#355B62" stroke-width="5"/><rect x="611" y="496" width="32" height="6" rx="3" fill="#355B62"/>
<path d="M1262 456 v42 m-18 -16 l18 22 l18 -22" stroke="#FFF5CF" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
<!-- cabine da oficial (atrás da Evelyn) -->
<rect x="960" y="700" width="700" height="1000" rx="14" fill="url(#aBooth)"/>
<rect x="960" y="700" width="700" height="64" rx="14" fill="#355B62"/>
<rect x="1000" y="800" width="620" height="860" rx="18" fill="#FFFFFF" opacity=".07"/>
<rect x="984" y="764" width="14" height="936" fill="#D9343F"/>
<circle cx="1500" cy="866" r="62" fill="#FFF5CF"/><circle cx="1500" cy="866" r="62" fill="none" stroke="#2B4950" stroke-width="6"/>
<rect x="1210" y="880" width="200" height="270" rx="12" fill="#FFF5CF"/><rect x="1210" y="880" width="200" height="270" rx="12" fill="none" stroke="#D98C71" stroke-width="6"/>
${poster}
<ellipse cx="1260" cy="1240" rx="300" ry="240" fill="url(#aLamp)"/>
<!-- piso -->
<rect y="1640" width="1800" height="960" fill="url(#aFloor)"/>
${tiles}
<rect y="1636" width="1800" height="10" fill="#B5AC99"/>
<path d="M60 1660 L520 1660 L700 2600 L-120 2600 Z" fill="#FFF3D6" opacity=".14"/>
<!-- fila: postes e fitas vermelhas (atrás da Mina) -->
${post(120)}${post(440)}${post(760)}${belt(120, 440)}${belt(440, 760)}
<!-- malas de quem espera, planta no canto -->
<rect x="250" y="1690" width="96" height="140" rx="16" fill="#D98C71"/><rect x="272" y="1664" width="52" height="30" rx="10" fill="none" stroke="#B36B52" stroke-width="8"/><rect x="250" y="1740" width="96" height="10" fill="#B36B52"/>
<rect x="560" y="1720" width="80" height="110" rx="14" fill="#4F8DA1"/><rect x="578" y="1698" width="44" height="26" rx="8" fill="none" stroke="#3E626F" stroke-width="7"/>
${plant(1720, 1640)}
</svg>`;
}
