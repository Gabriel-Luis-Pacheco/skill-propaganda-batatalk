// Cenários de "E se o Cam treinasse inglês todo dia?": vetor chapado com acabamento (camadas de profundidade, luz de janela,
// sombras de contato, texturas simples, objetos de vida real), a mesma família visual das salas de Batata City.
// Todos 1440 × 2400 (centro 720, 1200), desenhados uma vez e rasterizados no corte; a câmera mexe no conjunto.
// Regra Gumball: a casa e o Cam não mudam entre os dias; só a luz e o que acontece mudam.
export const WORLD = { w: 1440, h: 2400, cx: 720, cy: 1200 };
const rnd = (seed) => { let k = seed; return () => { k = (k * 9301 + 49297) % 233280; return k / 233280; }; };
const open = () => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 2400" width="1440" height="2400">';
const f = (n) => (+n).toFixed(0);
const lampGlow = '<radialGradient id="lg" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#FFD98A" stop-opacity=".55"/><stop offset="1" stop-color="#FFD98A" stop-opacity="0"/></radialGradient>';
const shade = (x, y, rx, ry, op = 0.18) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#2A1810" opacity="${op}"/>`;
const plant = (x, y, s = 1, pot = '#E77B4F', leaf = '#3FB28D') => `<g transform="translate(${x} ${y}) scale(${s})">${shade(0, 4, 54, 11, 0.16)}<path d="M-34 0 l-8 -62 h84 l-8 62z" fill="${pot}"/><path d="M-38 -62 h92 l-2 12 h-88z" fill="${pot}" opacity=".7"/><path d="M0 -62 c-38 -14 -58 -58 -38 -94 c26 18 38 52 38 94z M0 -62 c26 -34 72 -48 104 -28 c-18 30 -58 46 -104 28z M0 -62 c-4 -48 14 -90 46 -106 c4 44 -14 80 -46 106z M0 -62 c-30 -20 -76 -22 -100 -4 c26 22 70 20 100 4z" fill="${leaf}"/><path d="M0 -62 c-10 -30 -8 -60 4 -92" stroke="#2A8F6C" stroke-width="5" fill="none"/></g>`;
const books = (x, y, n = 6, seed = 3) => { const r = rnd(seed); const cols = ['#B5294C', '#2F4C8C', '#F8C637', '#2E9E78', '#8A55F0', '#E77B4F']; let s = '', cx = x; for (let i = 0; i < n; i++) { const w = 26 + r() * 20, h = 110 + r() * 60; s += `<rect x="${f(cx)}" y="${f(y - h)}" width="${f(w)}" height="${f(h)}" rx="4" fill="${cols[i % 6]}"/><rect x="${f(cx + 5)}" y="${f(y - h + 16)}" width="${f(w - 10)}" height="6" rx="3" fill="#FFF6EA" opacity=".55"/>`; cx += w + 3; } return s; };
const picture = (x, y, w, h, rot = 0, art = '') => `<g transform="rotate(${rot} ${x + w / 2} ${y + h / 2})">${shade(x + w / 2 + 6, y + h + 8, w * 0.52, 9, 0.12)}<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="#7A4E2E"/><rect x="${x + 12}" y="${y + 12}" width="${w - 24}" height="${h - 24}" rx="4" fill="#FFF6EA"/>${art}</g>`;
const dust = (seed, n, y0, y1) => { const r = rnd(seed); let s = ''; for (let i = 0; i < n; i++) s += `<circle cx="${f(r() * 1440)}" cy="${f(y0 + r() * (y1 - y0))}" r="${(3 + r() * 9).toFixed(1)}" fill="#FFF3D6" opacity="${(0.05 + r() * 0.1).toFixed(2)}"/>`; return s; };

/** A sala do Cam: parede com friso, janela com cortina e luz entrando, estante, TV, luminária, tapete, sofá, mesinha com pizza fria. */
export function livingSVG(part = 'all') {
  const r = rnd(5);
  let rays = '';
  for (let i = 0; i < 5; i++) rays += `<path d="M${820 + i * 80} 470 L${380 + i * 150} 1700 L${470 + i * 150} 1700 L${900 + i * 80} 470z" fill="#FFF3D6" opacity="${(0.06 + r() * 0.05).toFixed(2)}"/>`;
  let planks = '';
  for (let i = 0; i < 9; i++) planks += `<path d="M0 ${1730 + i * 78} H1440" stroke="#A56F46" stroke-width="3"/>`;
  for (let i = 0; i < 18; i++) planks += `<path d="M${(i * 191) % 1440} ${1730 + (i % 9) * 78} v78" stroke="#A56F46" stroke-width="3"/>`;
  const back = `<defs><linearGradient id="w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F1D9B6"/><stop offset="1" stop-color="#E5C398"/></linearGradient><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9DB6CE"/><stop offset="1" stop-color="#F0DEC4"/></linearGradient><linearGradient id="fl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C08C5E"/><stop offset="1" stop-color="#A9744A"/></linearGradient>${lampGlow}</defs>
<rect width="1440" height="2400" fill="url(#w)"/>
${Array.from({ length: 12 }, (_, i) => `<rect x="${i * 130 + 20}" y="0" width="52" height="1480" fill="#FFFFFF" opacity=".035"/>`).join('')}
<rect y="1180" width="1440" height="540" fill="#D9B48A"/><rect y="1180" width="1440" height="22" fill="#B98558"/><rect y="1202" width="1440" height="8" fill="#000" opacity=".1"/>
${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<rect x="${i * 190 + 20}" y="1236" width="150" height="400" rx="10" fill="none" stroke="#C69A6C" stroke-width="5"/>`).join('')}
<rect y="1696" width="1440" height="34" fill="#F6EBD3"/><rect y="1722" width="1440" height="10" fill="#000" opacity=".12"/>
<rect y="1730" width="1440" height="670" fill="url(#fl)"/>${planks}
<ellipse cx="720" cy="1740" rx="900" ry="46" fill="#2A1810" opacity=".16"/>
<!-- janela com cortina e luz -->
<rect x="780" y="380" width="580" height="820" rx="30" fill="#8A5A3C"/><rect x="806" y="406" width="528" height="768" rx="16" fill="url(#sk)"/>
<path d="M806 980 q110 -100 230 -46 t300 -40 v280 h-530z" fill="#8199B3" opacity=".75"/><path d="M806 1060 q140 -60 260 -10 t270 -20 v144 h-530z" fill="#6B84A0" opacity=".8"/>
${Array.from({ length: 7 }, (_, i) => `<rect x="${830 + i * 70}" y="${900 + ((i * 53) % 90)}" width="36" height="${150 + ((i * 41) % 60)}" fill="#6E86A3"/>`).join('')}
<rect x="1060" y="406" width="16" height="768" fill="#8A5A3C"/><rect x="806" y="784" width="528" height="16" fill="#8A5A3C"/>
<rect x="760" y="1174" width="620" height="38" rx="12" fill="#B98558"/>${plant(1190, 1174, 0.7, '#6E5AA6')}
<path d="M690 340 h150 c-28 150 30 330 -6 560 c-30 190 40 300 8 420 h-170z" fill="#2E9E78"/><path d="M760 340 c-14 240 32 520 -2 980" stroke="#23806A" stroke-width="12" fill="none" opacity=".55"/><path d="M810 340 c20 250 -16 500 14 980" stroke="#3FB28D" stroke-width="9" fill="none" opacity=".5"/>
<path d="M1260 340 h130 v980 h-90 c28 -120 -34 -250 -4 -420 c28 -150 -26 -330 -36 -560z" fill="#2E9E78"/>
<rect x="670" y="316" width="740" height="26" rx="13" fill="#C98B5E"/>
<!-- estante com TV desligada, livros e plantas -->
<rect x="60" y="1040" width="600" height="38" rx="12" fill="#8A5A3C"/><rect x="90" y="1078" width="30" height="620" fill="#6E4630"/><rect x="600" y="1078" width="30" height="620" fill="#6E4630"/>
<rect x="100" y="720" width="520" height="320" rx="22" fill="#2B2B35"/><rect x="122" y="742" width="476" height="276" rx="12" fill="#3A3A48"/><path d="M122 742 L360 1018 H122z" fill="#FFFFFF" opacity=".06"/><rect x="330" y="1040" width="60" height="16" fill="#1E1E26"/>
<rect x="110" y="1120" width="500" height="26" rx="10" fill="#8A5A3C"/>${books(130, 1120, 8, 11)}${plant(520, 1120, 0.55, '#E2B766')}
${plant(150, 720, 0.85)}${picture(250, 460, 150, 190, -3, '<circle cx="325" cy="540" r="34" fill="#F8C637"/><path d="M262 620 l50 -60 l36 40 l30 -26 l40 46z" fill="#3FB28D"/>')}${picture(450, 480, 110, 140, 4, '<rect x="470" y="500" width="70" height="100" rx="6" fill="#E77B4F"/>')}
<!-- luminária de pé e tapete -->
<path d="M1300 1700 V1280" stroke="#5A4636" stroke-width="12"/><path d="M1220 1290 Q1300 1170 1380 1290z" fill="#2F7F78"/><ellipse cx="1300" cy="1330" rx="260" ry="200" fill="url(#lg)"/><ellipse cx="1300" cy="1706" rx="64" ry="14" fill="#2A1810" opacity=".18"/>
${rays}${dust(7, 26, 480, 1680)}
<ellipse cx="720" cy="2010" rx="660" ry="140" fill="#B5294C" opacity=".92"/><ellipse cx="720" cy="2010" rx="560" ry="104" fill="none" stroke="#F8C637" stroke-width="10"/><ellipse cx="720" cy="2010" rx="440" ry="76" fill="none" stroke="#FFF2DE" stroke-width="6" stroke-dasharray="22 16"/>`;
  const front = `<!-- sofá (o Cam fica atrás: parece sentado) -->
${shade(720, 2090, 780, 60, 0.2)}
<rect x="-40" y="1300" width="1520" height="700" rx="110" fill="#2F7F78"/>
<rect x="-40" y="1300" width="1520" height="26" rx="13" fill="#4FA395" opacity=".7"/>
<rect x="40" y="1560" width="1360" height="500" rx="90" fill="#3A8F86"/><path d="M40 1700 h1360" stroke="#2A6F68" stroke-width="6" opacity=".5"/><path d="M700 1560 v500" stroke="#2A6F68" stroke-width="6" opacity=".5"/>
<rect x="-70" y="1380" width="190" height="680" rx="80" fill="#2A6F68"/><rect x="1320" y="1380" width="190" height="680" rx="80" fill="#2A6F68"/>
<rect x="150" y="1400" width="300" height="220" rx="70" fill="#F8C637"/><path d="M180 1430 q120 -30 240 0" stroke="#C9A24A" stroke-width="6" fill="none"/><rect x="1020" y="1410" width="280" height="210" rx="70" fill="#E77B4F"/><circle cx="1160" cy="1516" r="40" fill="#FFF2DE" opacity=".35"/>
<path d="M880 1600 q90 -30 220 10 l40 400 h-300z" fill="#FF8AD8" opacity=".9"/><path d="M900 1700 q80 -24 200 4" stroke="#E86AB8" stroke-width="8" fill="none"/>
<!-- mesinha com pizza fria, lata e controle -->
${shade(720, 2350, 560, 40, 0.2)}
<rect x="240" y="2050" width="960" height="46" rx="14" fill="#8A5A3C"/><rect x="240" y="2050" width="960" height="12" rx="6" fill="#B98558"/><rect x="290" y="2096" width="30" height="240" fill="#6E4630"/><rect x="1120" y="2096" width="30" height="240" fill="#6E4630"/>
<rect x="420" y="1930" width="460" height="120" rx="14" fill="#E9D7BF"/><path d="M440 1940 h420 l30 70 h-480z" fill="#F2B84B"/><circle cx="560" cy="1990" r="16" fill="#C63B3B"/><circle cx="700" cy="1976" r="16" fill="#C63B3B"/><circle cx="800" cy="2002" r="14" fill="#C63B3B"/><path d="M470 1952 q40 -10 60 4" stroke="#FFF3B0" stroke-width="7" fill="none"/>
<rect x="980" y="2010" width="120" height="40" rx="12" fill="#3A3A48"/><circle cx="1010" cy="2030" r="8" fill="#E77B4F"/>
<rect x="1130" y="1958" width="52" height="92" rx="12" fill="#D9343F"/><rect x="1130" y="1976" width="52" height="22" fill="#FFF2DE" opacity=".8"/><ellipse cx="1156" cy="1958" rx="26" ry="8" fill="#C9CED8"/>`;
  return `${open()}${part === 'front' ? '' : back}${part === 'back' ? '' : front}</svg>`;
}

/** O armário: trilho com cabides e roupas de verdade (xadrez, jeans, moletom), prateleira com caixas, mochila, sapatos; a luz vem do celular. */
export function closetSVG() {
  const r = rnd(17);
  const hanger = (x) => `<path d="M${x} 430 v-30 a12 12 0 1 1 12 -12" stroke="#C9CED8" stroke-width="5" fill="none"/><path d="M${x} 432 L${x - 70} 474 H${x + 70}z" fill="none" stroke="#C9CED8" stroke-width="5"/>`;
  const garment = (x, c, kind, w) => {
    const top = 474, h = kind === 'coat' ? 860 : kind === 'shirt' ? 560 : 700;
    let s = `${hanger(x)}<path d="M${x - w} ${top} h${2 * w} l30 70 l-14 ${h} h${-2 * w - 32} l-14 ${-h}z" fill="${c}"/><path d="M${x} ${top + 8} v${h}" stroke="#000" stroke-width="3" opacity=".22"/><path d="M${x - w} ${top} q${w} 38 ${2 * w} 0" fill="#000" opacity=".12"/>`;
    if (kind === 'plaid') s += Array.from({ length: 6 }, (_, i) => `<rect x="${x - w + 6}" y="${top + 60 + i * 80}" width="${2 * w - 12}" height="12" fill="#000" opacity=".18"/>`).join('') + Array.from({ length: 4 }, (_, i) => `<rect x="${x - w + 30 + i * 36}" y="${top + 20}" width="10" height="${h - 30}" fill="#fff" opacity=".12"/>`).join('');
    if (kind === 'stripe') s += Array.from({ length: 9 }, (_, i) => `<rect x="${x - w + 6}" y="${top + 40 + i * 60}" width="${2 * w - 12}" height="16" fill="#FFF2DE" opacity=".5"/>`).join('');
    if (kind === 'coat') s += `<rect x="${x - 20}" y="${top + 160}" width="40" height="70" rx="8" fill="#000" opacity=".16"/>${[0, 1, 2].map((i) => `<circle cx="${x + 12}" cy="${top + 90 + i * 100}" r="9" fill="#2A1810" opacity=".6"/>`).join('')}`;
    return s;
  };
  const left = [[100, '#8A5A3C', 'coat', 68], [220, '#2F4C8C', 'plaid', 62], [340, '#B5294C', 'stripe', 58], [430, '#3FB28D', 'shirt', 50]];
  const right = [[1010, '#E77B4F', 'shirt', 52], [1100, '#4A4A5E', 'coat', 64], [1220, '#C9A24A', 'stripe', 60], [1330, '#2E9E78', 'plaid', 58]];
  const garments = [...left, ...right].map(([x, c, k, w]) => garment(x, c, k, w)).join('');
  return `${open()}<defs><linearGradient id="cw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5A5A82"/><stop offset="1" stop-color="#34344E"/></linearGradient><linearGradient id="fw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2A2438"/><stop offset="1" stop-color="#141420"/></linearGradient></defs>
<rect width="1440" height="2400" fill="url(#cw)"/><ellipse cx="720" cy="880" rx="420" ry="560" fill="#9AA2D8" opacity=".34"/><ellipse cx="720" cy="880" rx="260" ry="380" fill="#C9D0FF" opacity=".22"/>${Array.from({ length: 14 }, (_, i) => `<rect x="${i * 106}" y="0" width="5" height="1700" fill="#000" opacity=".12"/>`).join('')}
<!-- prateleira alta com caixas -->
<rect x="0" y="200" width="1440" height="26" fill="#6E4630"/><rect x="0" y="226" width="1440" height="10" fill="#000" opacity=".3"/>
<rect x="60" y="80" width="260" height="120" rx="8" fill="#C9A24A"/><rect x="60" y="80" width="260" height="26" rx="6" fill="#E2C173"/><rect x="360" y="110" width="200" height="90" rx="8" fill="#6E5AA6"/><rect x="1000" y="70" width="300" height="130" rx="8" fill="#E77B4F"/><rect x="1000" y="70" width="300" height="26" rx="6" fill="#F0997A"/>
<path d="M720 200 v-60" stroke="#8A5A3C" stroke-width="6"/><path d="M640 140 h160 l30 60 h-220z" fill="#B5294C"/>
<!-- trilho -->
<rect x="0" y="420" width="1440" height="22" fill="#B0B6C4"/><rect x="0" y="442" width="1440" height="8" fill="#000" opacity=".3"/><rect x="0" y="420" width="1440" height="6" fill="#FFFFFF" opacity=".25"/>
${garments}
<!-- piso, sapatos e mochila -->
<rect y="1700" width="1440" height="700" fill="url(#fw)"/><rect y="1696" width="1440" height="14" fill="#000" opacity=".3"/>
${shade(190, 1900, 220, 26, 0.3)}${shade(1230, 1900, 220, 26, 0.3)}
<rect x="60" y="1730" width="300" height="170" rx="10" fill="#C9A24A"/><rect x="60" y="1730" width="300" height="34" rx="8" fill="#E2C173"/>
<rect x="1100" y="1750" width="280" height="150" rx="10" fill="#E77B4F"/><rect x="1100" y="1750" width="280" height="30" rx="8" fill="#F0997A"/>
<path d="M420 1900 q20 -90 100 -96 q40 -2 60 40 v56z" fill="#F4F4F4"/><path d="M420 1900 h160" stroke="#D0D0D0" stroke-width="8"/><path d="M450 1856 q40 -26 94 0" stroke="#E2503A" stroke-width="10" fill="none"/>
<path d="M880 1900 q20 -90 100 -96 q40 -2 60 40 v56z" fill="#2F4C8C"/><path d="M880 1900 h160" stroke="#1C3470" stroke-width="8"/>
<g><path d="M1160 560 q-70 40 -60 190 q10 150 60 180 q50 -30 60 -180 q10 -150 -60 -190z" fill="#3A8F86"/><rect x="1130" y="700" width="60" height="80" rx="10" fill="#2A6F68"/><path d="M1160 540 v-80" stroke="#C9CED8" stroke-width="6"/></g>
<!-- luz que entra pela porta -->
<rect x="0" y="0" width="22" height="2400" fill="#FFE9B0" opacity=".6"/>${dust(23, 22, 300, 1700)}
</svg>`;
}

/** O banheiro: azulejo menta com brilho, espelho, prateleira com patinho e xampus, tapete, janelinha fosca, chuveiro com cano. */
export function bathSVG() {
  let tiles = '';
  for (let y = 0; y < 1900; y += 140) tiles += `<path d="M0 ${y} H1440" stroke="#9DCFC4" stroke-width="4"/>`;
  for (let x = 0; x < 1440; x += 140) tiles += `<path d="M${x} 0 V1900" stroke="#9DCFC4" stroke-width="4"/>`;
  let shine = '';
  for (let i = 0; i < 18; i++) shine += `<path d="M${(i * 211) % 1400} ${(i * 337) % 1700} l60 -60" stroke="#FFFFFF" stroke-width="10" opacity=".14" stroke-linecap="round"/>`;
  return `${open()}<defs><linearGradient id="bw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D3EEE6"/><stop offset="1" stop-color="#B2DDD3"/></linearGradient><linearGradient id="mir" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E8F6FA"/><stop offset="1" stop-color="#B9D9E4"/></linearGradient></defs>
<rect width="1440" height="2400" fill="url(#bw)"/>${tiles}${shine}
<rect y="1900" width="1440" height="500" fill="#7FB6AA"/><rect y="1896" width="1440" height="14" fill="#5E9E92"/>
<!-- espelho com armário -->
<rect x="70" y="200" width="420" height="520" rx="24" fill="#8A5A3C"/><rect x="94" y="224" width="372" height="472" rx="14" fill="url(#mir)"/><path d="M120 640 L330 250" stroke="#FFFFFF" stroke-width="22" opacity=".35"/><path d="M200 660 L360 380" stroke="#FFFFFF" stroke-width="10" opacity=".3"/>
<!-- janelinha fosca -->
<rect x="1100" y="260" width="250" height="300" rx="20" fill="#F4F4F4"/><rect x="1120" y="280" width="210" height="260" rx="10" fill="#D9ECF5"/><path d="M1120 400 h210 M1225 280 v260" stroke="#FFFFFF" stroke-width="8"/>${plant(1225, 640, 0.6, '#E2B766')}
<rect x="1100" y="560" width="250" height="26" rx="10" fill="#B98558"/>
<!-- chuveiro -->
<path d="M1060 140 V420 h-110" stroke="#9AA0AE" stroke-width="22" fill="none" stroke-linecap="round"/><ellipse cx="900" cy="440" rx="120" ry="34" fill="#C9CED8"/><ellipse cx="900" cy="432" rx="100" ry="20" fill="#E7EAF0"/>
<!-- toalheiro com toalha, prateleira com patinho e xampus -->
<rect x="120" y="860" width="14" height="300" fill="#9AA0AE"/><rect x="100" y="860" width="280" height="22" rx="10" fill="#9AA0AE"/><path d="M140 882 h220 v380 h-220z" fill="#F8C637"/><path d="M140 1260 q55 34 110 0 t110 0" stroke="#F8C637" stroke-width="10" fill="none"/>${Array.from({ length: 6 }, (_, i) => `<rect x="${150 + i * 34}" y="900" width="14" height="340" fill="#E8B22A" opacity=".5"/>`).join('')}
<rect x="1000" y="900" width="360" height="26" rx="10" fill="#F6EAD0"/>
<rect x="1030" y="780" width="56" height="120" rx="14" fill="#FF8AD8"/><rect x="1040" y="760" width="36" height="26" rx="6" fill="#E86AB8"/><rect x="1100" y="800" width="52" height="100" rx="14" fill="#7FE3D5"/><rect x="1108" y="780" width="36" height="26" rx="6" fill="#4FC4B4"/>
<g transform="translate(1250 850)"><ellipse cx="0" cy="30" rx="44" ry="30" fill="#FFD54A"/><circle cx="26" cy="-8" r="24" fill="#FFD54A"/><path d="M44 -6 l24 6 l-24 8z" fill="#F29A2E"/><circle cx="32" cy="-12" r="4" fill="#14241C"/></g>
<ellipse cx="720" cy="2020" rx="520" ry="80" fill="#F8C637" opacity=".9"/><ellipse cx="720" cy="2020" rx="420" ry="58" fill="none" stroke="#FFF2DE" stroke-width="8"/>
${dust(29, 14, 200, 1500)}
</svg>`;
}

/** O quarto da vizinha: papel de parede de flores, janela com cortina, cama ao fundo, cômoda com retratos, abajur, tapete. */
export function neighborSVG() {
  const r = rnd(9);
  let fl = '';
  for (let i = 0; i < 70; i++) { const x = r() * 1440, y = 80 + r() * 1360, c = ['#F29DB1', '#F8C637', '#FFFFFF'][i % 3]; fl += `<g transform="translate(${f(x)} ${f(y)})" opacity=".5"><circle r="${(8 + r() * 10).toFixed(0)}" fill="${c}"/><circle r="4" fill="#E77B4F"/></g>`; }
  return `${open()}<defs><linearGradient id="nw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F6D9D2"/><stop offset="1" stop-color="#EAB9B0"/></linearGradient><linearGradient id="nf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B07352"/><stop offset="1" stop-color="#8F5A3E"/></linearGradient>${lampGlow}</defs>
<rect width="1440" height="2400" fill="url(#nw)"/>${fl}
<rect y="1560" width="1440" height="120" fill="#7A4A32"/><rect y="1556" width="1440" height="12" fill="#5E3825"/>
<rect y="1680" width="1440" height="720" fill="url(#nf)"/>${Array.from({ length: 9 }, (_, i) => `<path d="M0 ${1710 + i * 74} H1440" stroke="#7A4A32" stroke-width="3"/>`).join('')}
<!-- guarda-roupa à esquerda -->
<rect x="-30" y="380" width="360" height="1230" rx="18" fill="#9A6439"/><rect x="-10" y="400" width="320" height="1190" rx="12" fill="#B5784A"/><path d="M150 400 v1190" stroke="#7A4A32" stroke-width="8"/><circle cx="128" cy="1000" r="10" fill="#F6EAD0"/><circle cx="172" cy="1000" r="10" fill="#F6EAD0"/>
<!-- janela com cortina à direita -->
<rect x="940" y="420" width="400" height="560" rx="22" fill="#F4F4F4"/><rect x="962" y="442" width="356" height="516" rx="12" fill="#9DB6CE"/><path d="M962 700 q90 -70 180 -20 t176 -10 v288 h-356z" fill="#7C93AD" opacity=".7"/><path d="M1140 442 v516 M962 700 h356" stroke="#F4F4F4" stroke-width="12"/>
<path d="M900 400 h110 c-20 120 24 280 -4 440 c-22 130 30 200 6 300 h-130z" fill="#F29DB1"/><path d="M1270 400 h110 v740 h-70 c20 -90 -26 -190 -4 -320 c20 -120 -26 -280 -36 -420z" fill="#F29DB1"/><rect x="880" y="384" width="540" height="22" rx="11" fill="#C98B5E"/>
<!-- quadro de casamento torto -->
<g transform="rotate(-6 640 520)">${shade(646, 700, 130, 9, 0.12)}<rect x="520" y="400" width="250" height="290" rx="14" fill="#7A4E2E"/><rect x="542" y="422" width="206" height="246" rx="8" fill="#F6EAD0"/><circle cx="620" cy="510" r="28" fill="#C98B5E"/><circle cx="676" cy="510" r="28" fill="#8A5A3C"/><path d="M590 590 q28 -46 56 0 q28 -46 56 0 v70 h-112z" fill="#FFFFFF"/></g>
<!-- cama ao fundo, à direita da Marlene -->
${shade(1100, 1700, 330, 34, 0.2)}<rect x="800" y="1330" width="620" height="60" rx="26" fill="#9A6439"/><rect x="780" y="1360" width="660" height="260" rx="30" fill="#E77B4F"/><rect x="780" y="1360" width="660" height="56" rx="26" fill="#F29A6F"/><rect x="830" y="1300" width="240" height="90" rx="40" fill="#FFF6EA"/><rect x="760" y="1590" width="40" height="110" fill="#6E4630"/><rect x="1420" y="1590" width="40" height="110" fill="#6E4630"/>
<!-- cômoda com retratos e abajur -->
${shade(250, 1700, 200, 24, 0.2)}<rect x="40" y="1360" width="420" height="320" rx="14" fill="#9A6439"/><rect x="40" y="1360" width="420" height="30" rx="10" fill="#C98B5E"/><rect x="70" y="1420" width="170" height="100" rx="8" fill="#B5784A"/><rect x="260" y="1420" width="170" height="100" rx="8" fill="#B5784A"/><circle cx="155" cy="1470" r="9" fill="#F6EAD0"/><circle cx="345" cy="1470" r="9" fill="#F6EAD0"/>
<path d="M120 1360 V1240" stroke="#5A4636" stroke-width="10"/><path d="M50 1250 Q120 1150 190 1250z" fill="#F8C637"/><ellipse cx="120" cy="1300" rx="240" ry="180" fill="url(#lg)"/><rect x="300" y="1290" width="100" height="70" rx="8" fill="#7A4E2E"/><rect x="308" y="1298" width="84" height="54" rx="4" fill="#FFF6EA"/><circle cx="350" cy="1325" r="14" fill="#C98B5E"/>
<ellipse cx="640" cy="2040" rx="420" ry="74" fill="#5FB5AA" opacity=".9"/><ellipse cx="640" cy="2040" rx="320" ry="52" fill="none" stroke="#FFF2DE" stroke-width="7"/>
${dust(31, 18, 300, 1500)}
</svg>`;
}

/** O sonho: quarto do Cam de noite (janela com lua, cabeceira, cama comprida, criado-mudo com abajur e despertador). O Cam deita de lado no travesseiro (peça do corte). */
export function dreamSVG() {
  const r = rnd(13);
  let stars = '';
  for (let i = 0; i < 80; i++) stars += `<circle cx="${f(r() * 1440)}" cy="${f(60 + r() * 1000)}" r="${(2 + r() * 5).toFixed(1)}" fill="#FFF3C4" opacity="${(0.4 + r() * 0.6).toFixed(2)}"/>`;
  const cloud = (x, y, s2, o) => `<g transform="translate(${x} ${y}) scale(${s2})" opacity="${o}"><ellipse cx="0" cy="0" rx="130" ry="44" fill="#7A63B8"/><ellipse cx="-70" cy="-22" rx="64" ry="42" fill="#7A63B8"/><ellipse cx="60" cy="-30" rx="76" ry="50" fill="#7A63B8"/></g>`;
  return `${open()}<defs><linearGradient id="dn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1B1640"/><stop offset=".55" stop-color="#34286A"/><stop offset="1" stop-color="#4A3A86"/></linearGradient><linearGradient id="dw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3B2F72"/><stop offset="1" stop-color="#2A2150"/></linearGradient>${lampGlow}</defs>
<rect width="1440" height="2400" fill="url(#dn)"/>${stars}${cloud(300, 760, 1.2, 0.45)}${cloud(1100, 900, 1, 0.4)}
<circle cx="1140" cy="300" r="140" fill="#FFF3C4"/><circle cx="1084" cy="270" r="124" fill="#1B1640" opacity=".16"/><circle cx="1190" cy="340" r="24" fill="#E8DCA0" opacity=".6"/><circle cx="1100" cy="370" r="16" fill="#E8DCA0" opacity=".6"/>
<!-- parede do quarto, janela e cortinas -->
<rect x="-40" y="1100" width="1520" height="1400" fill="url(#dw)"/><rect y="1090" width="1440" height="20" fill="#6E4630"/>
<rect x="300" y="1300" width="560" height="380" rx="20" fill="#5A4636"/><rect x="326" y="1326" width="508" height="328" rx="10" fill="#1B1640"/>${Array.from({ length: 14 }, (_, i) => `<circle cx="${340 + ((i * 97) % 480)}" cy="${1346 + ((i * 53) % 280)}" r="4" fill="#FFF3C4"/>`).join('')}<path d="M580 1326 v328 M326 1490 h508" stroke="#5A4636" stroke-width="10"/>
<!-- cabeceira e cama comprida (o corpo fica debaixo do cobertor, peça do corte) -->
${shade(720, 2140, 700, 50, 0.3)}<rect x="40" y="1560" width="200" height="560" rx="40" fill="#8A5A3C"/><rect x="62" y="1590" width="156" height="500" rx="28" fill="#A56F46"/>
<rect x="200" y="1830" width="1220" height="260" rx="50" fill="#4B3A86"/><rect x="200" y="1830" width="1220" height="44" rx="22" fill="#6E5AA6"/>
<ellipse cx="410" cy="1760" rx="250" ry="120" fill="#F6EAD0"/><ellipse cx="410" cy="1730" rx="200" ry="82" fill="#FFFFFF" opacity=".4"/>
<rect x="1330" y="1500" width="100" height="620" rx="20" fill="#8A5A3C"/>
<!-- criado-mudo com abajur fraco e despertador -->
<rect x="1180" y="1700" width="240" height="300" rx="16" fill="#8A5A3C"/><rect x="1180" y="1700" width="240" height="30" rx="10" fill="#A56F46"/><path d="M1300 1700 V1560" stroke="#5A4636" stroke-width="10"/><path d="M1230 1570 Q1300 1470 1370 1570z" fill="#E87AA2"/><ellipse cx="1300" cy="1640" rx="240" ry="170" fill="url(#lg)" opacity=".7"/>
<g transform="translate(1210 1628)"><rect x="0" y="0" width="80" height="64" rx="18" fill="#E2503A"/><circle cx="40" cy="32" r="22" fill="#FFF6EA"/><path d="M40 32 v-14 M40 32 l11 6" stroke="#14241C" stroke-width="4" stroke-linecap="round"/></g>
</svg>`;
}

/** A rua: padaria com toldo listrado à esquerda, sobrados, ponto de ônibus com banco, árvore, carro estacionado, calçada com meio-fio. */
export function streetSVG() {
  const r = rnd(21);
  let blds = '';
  let x = 360;
  const cols = ['#E8C9A0', '#C9A0B4', '#A0C9C0', '#E8B89A', '#B4C48A'];
  while (x < 1500) {
    const w = 200 + r() * 140, h = 560 + r() * 520;
    blds += `<rect x="${f(x)}" y="${f(1560 - h)}" width="${f(w)}" height="${f(h)}" fill="${cols[Math.floor(r() * 5)]}"/><rect x="${f(x)}" y="${f(1560 - h)}" width="${f(w)}" height="22" fill="#000" opacity=".1"/>`;
    for (let wy = 1560 - h + 70; wy < 1380; wy += 140) for (let wx = x + 28; wx < x + w - 60; wx += 90) blds += `<rect x="${f(wx)}" y="${f(wy)}" width="54" height="78" rx="6" fill="#FFFFFF" opacity=".6"/><rect x="${f(wx)}" y="${f(wy + 36)}" width="54" height="6" fill="#B0B6C4" opacity=".5"/>`;
    x += w + 6;
  }
  const awning = Array.from({ length: 8 }, (_, i) => `<path d="M${40 + i * 44} 760 h44 l-6 90 h-44z" fill="${i % 2 ? '#FFF2DE' : '#E2503A'}"/>`).join('');
  return `${open()}<defs><linearGradient id="ss" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8FC8E8"/><stop offset="1" stop-color="#F8E8C8"/></linearGradient></defs>
<rect width="1440" height="2400" fill="url(#ss)"/>
<circle cx="1180" cy="360" r="96" fill="#FFF3B0"/><circle cx="1180" cy="360" r="170" fill="#FFF3B0" opacity=".25"/>
<path d="M0 640 q180 -90 380 -20 t400 -30 t420 10 t240 -10 v360 h-1440z" fill="#BFD9E8" opacity=".6"/>
${blds}
<!-- padaria (à esquerda, atrás do Cam) -->
<rect x="-20" y="700" width="420" height="860" fill="#F6D9B0"/><rect x="-20" y="700" width="420" height="30" fill="#C98B5E"/>
${awning}<rect x="40" y="850" width="352" height="12" fill="#B5294C" opacity=".4"/>
<rect x="70" y="900" width="300" height="400" rx="14" fill="#8A5A3C"/><rect x="90" y="920" width="260" height="360" rx="8" fill="#FFE9B8"/><ellipse cx="170" cy="1160" rx="60" ry="26" fill="#C98B5E"/><ellipse cx="260" cy="1190" rx="70" ry="28" fill="#D9A25F"/><path d="M110 1060 l130 -30 l20 30z" fill="#E2B766"/><circle cx="310" cy="1110" r="40" fill="#F2B84B"/>
<g transform="translate(206 612)"><rect x="-96" y="-46" width="192" height="76" rx="14" fill="#8A5A3C"/><rect x="-86" y="-36" width="172" height="56" rx="8" fill="#FFF2DE"/><path d="M-60 -6 q30 -40 60 0 q30 -40 60 0" stroke="#C98B5E" stroke-width="12" fill="none" stroke-linecap="round"/></g>
<!-- calçada, meio-fio, rua -->
<rect y="1560" width="1440" height="560" fill="#A9A9B8"/><rect y="1556" width="1440" height="34" fill="#C9C9D4"/>
${Array.from({ length: 16 }, (_, i) => `<path d="M${i * 110 - 40} 1590 L${i * 120 - 200} 2060" stroke="#8F8FA0" stroke-width="4" opacity=".6"/>`).join('')}
<rect y="2060" width="1440" height="340" fill="#4A4A58"/><rect y="2056" width="1440" height="16" fill="#6A6A78"/>${Array.from({ length: 8 }, (_, i) => `<rect x="${i * 200 + 30}" y="2230" width="120" height="16" rx="6" fill="#F8E8C8"/>`).join('')}
<!-- carro estacionado -->
<g transform="translate(790 1960)">${shade(220, 150, 280, 26, 0.3)}<path d="M0 100 q10 -90 100 -100 h200 q90 10 110 100 v50 h-410z" fill="#E2503A"/><path d="M90 20 h120 v70 h-150z M230 20 h80 q50 10 60 70 h-140z" fill="#BFE3F4"/><circle cx="100" cy="150" r="44" fill="#26262E"/><circle cx="100" cy="150" r="20" fill="#C9CED8"/><circle cx="320" cy="150" r="44" fill="#26262E"/><circle cx="320" cy="150" r="20" fill="#C9CED8"/></g>
<!-- ponto de ônibus com banco -->
<rect x="1150" y="800" width="22" height="780" fill="#6A6A78"/><rect x="1080" y="716" width="170" height="170" rx="22" fill="#2F7F78"/><rect x="1100" y="756" width="130" height="64" rx="12" fill="#FFF1DA"/><rect x="1120" y="818" width="90" height="26" rx="8" fill="#FFF1DA"/><circle cx="1130" cy="858" r="12" fill="#14241C"/><circle cx="1200" cy="858" r="12" fill="#14241C"/>
<rect x="1040" y="1470" width="300" height="24" rx="10" fill="#8A5A3C"/><rect x="1060" y="1494" width="18" height="90" fill="#6A6A78"/><rect x="1300" y="1494" width="18" height="90" fill="#6A6A78"/>
${plant(150, 1610, 2.0)}
<path d="M0 1500 L1440 1500" stroke="#FFFFFF" stroke-width="3" opacity=".25"/>
${Array.from({ length: 9 }, (_, i) => `<circle cx="${60 + i * 170}" cy="${300 + (i % 3) * 36}" r="10" fill="#FFF3C4" opacity=".7"/>`).join('')}
<path d="M0 270 Q720 420 1440 270" stroke="#6E5E52" stroke-width="4" fill="none"/>${Array.from({ length: 19 }, (_, i) => { const xx = i * 80, u = xx / 1440, yy = 270 + 150 * 4 * u * (1 - u); return `<path d="M${xx} ${yy} l22 40 l-44 0z" fill="${['#E2503A', '#F8C637', '#3FB28D', '#FF8AD8'][i % 4]}"/>`; }).join('')}
</svg>`;
}

/** O balcão do bar (limonada, sem álcool): tampo à frente cobre as pernas; frente de ripado com trilho de pés e limões; o fundo vem de bar-room.js. */
export function tableSVG() {
  const glass = (x, y, c) => `<path d="M${x} ${y - 120} h70 l-8 120 h-54z" fill="${c}" opacity=".9"/><path d="M${x + 6} ${y - 110} h58" stroke="#FFFFFF" stroke-width="5" opacity=".6"/><circle cx="${x + 62}" cy="${y - 118}" r="14" fill="#F8C637"/><path d="M${x + 30} ${y - 150} v34" stroke="#FFFFFF" stroke-width="6"/>`;
  let slats = '';
  for (let x = 0; x < 1440; x += 64) slats += `<rect x="${x}" y="236" width="48" height="364" rx="8" fill="#7A4E2E"/><rect x="${x}" y="236" width="10" height="364" rx="5" fill="#FFFFFF" opacity=".08"/>`;
  const lemon = (x, y) => `<g transform="translate(${x} ${y})"><ellipse cx="0" cy="0" rx="34" ry="26" fill="#F8C637"/><ellipse cx="0" cy="0" rx="22" ry="15" fill="#FFE58A"/><path d="M-26 0 H26 M0 -18 V18" stroke="#F8C637" stroke-width="3"/></g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 600" width="1440" height="600">
<rect x="-20" y="150" width="1480" height="70" rx="26" fill="#9A6439"/><rect x="-20" y="150" width="1480" height="16" rx="8" fill="#C98B5E"/>
<rect x="-20" y="220" width="1480" height="380" fill="#5E3B26"/>${slats}
<rect x="-20" y="470" width="1480" height="22" rx="11" fill="#D9B24A"/><rect x="-20" y="470" width="1480" height="6" rx="3" fill="#FFF3B0" opacity=".6"/>
${lemon(180, 330)}${lemon(520, 360)}${lemon(860, 340)}${lemon(1200, 365)}
${glass(90, 150, '#F8E487')}${glass(660, 150, '#F8E487')}${glass(1060, 150, '#F2B8D8')}${glass(1290, 150, '#BFE8D8')}
<ellipse cx="760" cy="146" rx="90" ry="14" fill="#000" opacity=".12"/><rect x="700" y="96" width="120" height="54" rx="12" fill="#E77B4F"/><path d="M712 112 h96" stroke="#FFF2DE" stroke-width="6" opacity=".7"/>
</svg>`;
}

