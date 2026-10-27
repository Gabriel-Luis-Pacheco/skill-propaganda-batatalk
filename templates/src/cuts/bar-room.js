// O bar do esquete (Priya e June): Batata City à noite, vetor chapado, mesma família das salas.
// Parede verde-petróleo, neon de batata (sem texto: o título do vídeo mora no alto), lâmpadas
// pendentes, prateleiras com plantas e potes, janela para a cidade acesa. Bebidas sem álcool
// (limonada e café): conteúdo de marca para um público jovem. 1800 × 2600, centro (900, 1300) no
// meio da mesa entre as duas; desenhado uma vez e rasterizado no corte. Também o quadro-negro do
// flashback ("The book is on the table.").
import { tatoFigure } from '/tato-guide.js';

export const BAR = { w: 1800, h: 2600, cx: 900, cy: 1300 };

const rnd = (seed) => { let k = seed; return () => { k = (k * 9301 + 49297) % 233280; return k / 233280; }; };
const city = (x0, x1, y0, color, lit, seed) => {
  const r = rnd(seed); let x = x0, s = '';
  while (x < x1) {
    const w = 40 + r() * 60, h = 120 + r() * 260;
    s += `<rect x="${x.toFixed(0)}" y="${(y0 - h).toFixed(0)}" width="${w.toFixed(0)}" height="${(h + 80).toFixed(0)}" rx="6" fill="${color}"/>`;
    if (lit) for (let wy = y0 - h + 20; wy < y0 - 10; wy += 30) for (let wx = x + 8; wx < x + w - 12; wx += 18) if (r() > 0.5) s += `<rect x="${wx.toFixed(0)}" y="${wy.toFixed(0)}" width="8" height="12" rx="2" fill="${r() > 0.7 ? '#FF8AD8' : '#FFD36E'}" opacity="${(0.5 + r() * 0.5).toFixed(2)}"/>`;
    x += w + 4;
  }
  return s;
};
const bokeh = (() => {
  const r = rnd(11); let s = '';
  for (let i = 0; i < 26; i++) { const x = r() * 1800, y = 160 + r() * 900, rr = 18 + r() * 46, c = ['#FFD36E', '#FF8AD8', '#7FE3D5'][i % 3]; s += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${rr.toFixed(0)}" fill="${c}" opacity="${(0.08 + r() * 0.12).toFixed(2)}"/>`; }
  return s;
})();
const lamp = (x, len) => `<path d="M${x} 0 V${len}" stroke="#2A2F3A" stroke-width="5"/><path d="M${x - 70} ${len + 64} Q${x} ${len - 22} ${x + 70} ${len + 64} Z" fill="#E8B04B"/><ellipse cx="${x}" cy="${len + 70}" rx="30" ry="16" fill="#FFF3C4"/><ellipse cx="${x}" cy="${len + 110}" rx="230" ry="190" fill="url(#lampGlow)"/>`;
const shelf = (x, y, w) => `<rect x="${x}" y="${y}" width="${w}" height="20" rx="6" fill="#8A5A3C"/><rect x="${x}" y="${y + 20}" width="${w}" height="10" fill="#000" opacity=".12"/>`;
const jar = (x, y, c) => `<rect x="${x}" y="${y - 70}" width="52" height="70" rx="12" fill="${c}" opacity=".85"/><rect x="${x + 6}" y="${y - 84}" width="40" height="16" rx="5" fill="#E9D7BF"/><rect x="${x + 10}" y="${y - 54}" width="8" height="38" rx="4" fill="#FFFFFF" opacity=".35"/>`;
const cup = (x, y, c) => `<path d="M${x} ${y - 46} h48 l-6 46 h-36 z" fill="${c}"/><path d="M${x + 48} ${y - 38} a12 12 0 0 1 0 24" stroke="${c}" stroke-width="7" fill="none"/>`;
const plant = (x, y) => `<path d="M${x - 26} ${y} l-6 -48 h64 l-6 48z" fill="#E77B4F"/><path d="M${x} ${y - 48} c-30 -10 -44 -46 -30 -74 c20 14 30 40 30 74z M${x} ${y - 48} c20 -26 56 -36 80 -22 c-14 22 -46 34 -80 22z M${x} ${y - 48} c-4 -36 10 -70 34 -82 c4 34 -10 62 -34 82z" fill="#3FB28D"/>`;

export function barSVG() {
  const figurine = tatoFigure('barshelf').replace('<svg ', '<svg x="1450" y="546" width="104" height="114" ').replace(/\s(data-[\w-]+)(?=[\s/>])/g, ' $1=""');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1800 2600" width="1800" height="2600">
<defs>
  <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14263A"/><stop offset=".45" stop-color="#1D4148"/><stop offset="1" stop-color="#22504F"/></linearGradient>
  <linearGradient id="night" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1B1640"/><stop offset=".6" stop-color="#4B2A6E"/><stop offset="1" stop-color="#C2477E"/></linearGradient>
  <radialGradient id="lampGlow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#FFD98A" stop-opacity=".42"/><stop offset="1" stop-color="#FFD98A" stop-opacity="0"/></radialGradient>
  <radialGradient id="neonGlow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#FF5FB8" stop-opacity=".45"/><stop offset="1" stop-color="#FF5FB8" stop-opacity="0"/></radialGradient>
  <radialGradient id="tealGlow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#5FE3D0" stop-opacity=".30"/><stop offset="1" stop-color="#5FE3D0" stop-opacity="0"/></radialGradient>
  <pattern id="tiles" width="90" height="90" patternUnits="userSpaceOnUse"><rect width="90" height="90" fill="#22504F"/><rect x="3" y="3" width="84" height="84" rx="10" fill="#26595A"/></pattern>
  <clipPath id="win"><rect x="34" y="520" width="380" height="760" rx="20"/></clipPath>
</defs>
<rect width="1800" height="2600" fill="url(#wall)"/>
<rect y="1480" width="1800" height="1120" fill="url(#tiles)"/>
<rect y="1470" width="1800" height="16" fill="#8A5A3C"/>
${bokeh}
<!-- janela: a cidade à noite (à esquerda da Priya) -->
<rect x="14" y="500" width="420" height="800" rx="30" fill="#2B2F3A"/>
<rect x="34" y="520" width="380" height="760" rx="20" fill="url(#night)"/>
<g clip-path="url(#win)">
  <circle cx="300" cy="640" r="46" fill="#FFF3C4" opacity=".9"/><circle cx="300" cy="640" r="110" fill="#FFF3C4" opacity=".12"/>
  ${city(20, 430, 1120, '#3A2F66', false, 5)}${city(10, 430, 1290, '#271F47', true, 9)}
</g>
<rect x="216" y="520" width="14" height="760" fill="#2B2F3A"/><rect x="34" y="900" width="380" height="14" fill="#2B2F3A"/>
<!-- neon de batata (sem texto) -->
<ellipse cx="900" cy="520" rx="420" ry="260" fill="url(#neonGlow)"/>
<path d="M802 600 C806 540 826 470 870 434 C900 410 946 414 972 440 C1002 472 1014 540 1006 596 C996 660 948 686 900 686 C846 686 798 656 802 600 Z" fill="none" stroke="#FF8AD8" stroke-width="30" opacity=".35"/>
<path d="M802 600 C806 540 826 470 870 434 C900 410 946 414 972 440 C1002 472 1014 540 1006 596 C996 660 948 686 900 686 C846 686 798 656 802 600 Z" fill="none" stroke="#FFD6F1" stroke-width="9"/>
<circle cx="872" cy="520" r="9" fill="#FFD6F1"/><circle cx="936" cy="520" r="9" fill="#FFD6F1"/><path d="M872 568 q32 28 64 0" stroke="#FFD6F1" stroke-width="8" fill="none" stroke-linecap="round"/>
<path d="M1060 452 l14 -34 l14 34 l34 14 l-34 14 l-14 34 l-14 -34 l-34 -14 z" fill="#7FE3D5" opacity=".9"/>
<path d="M730 650 l9 -22 l9 22 l22 9 l-22 9 l-9 22 l-9 -22 l-22 -9 z" fill="#7FE3D5" opacity=".8"/>
<!-- prateleiras: potes, xícaras, plantas, um Tato de enfeite -->
${shelf(1260, 660, 540)}${jar(1290, 660, '#F8C637')}${jar(1360, 660, '#FF8AD8')}${figurine}${plant(1640, 660)}
${shelf(1260, 900, 540)}${cup(1290, 900, '#FFF1DA')}${cup(1370, 900, '#7FE3D5')}${jar(1460, 900, '#3FB28D')}${cup(1540, 900, '#F07AA0')}${jar(1620, 900, '#F8C637')}
${shelf(1260, 1140, 540)}${plant(1320, 1140)}${jar(1400, 1140, '#8A55F0')}${cup(1490, 1140, '#FFF1DA')}${jar(1570, 1140, '#FF8AD8')}
<ellipse cx="1520" cy="900" rx="320" ry="420" fill="url(#tealGlow)"/>
<!-- lâmpadas pendentes -->
${lamp(560, 250)}${lamp(1240, 210)}${lamp(160, 180)}
<!-- varal de luzinhas no alto -->
<path d="M0 150 Q900 330 1800 150" stroke="#3A3F4C" stroke-width="3" fill="none"/>
${Array.from({ length: 25 }, (_, i) => { const x = i * 75, u = x / 1800, y = 150 + 180 * 4 * u * (1 - u); return `<circle cx="${x}" cy="${y + 10}" r="24" fill="#FFD98A" opacity=".18"/><circle cx="${x}" cy="${y + 10}" r="7" fill="#FFF0BC"/>`; }).join('')}
</svg>`;
}

/** O quadro-negro do flashback (1080 × 1920): giz, um livro em cima de uma mesa, "6º ano". */
export function boardSVG() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" width="1080" height="1920">
<rect width="1080" height="1920" fill="#E9DCC3"/>
<rect y="1320" width="1080" height="600" fill="#C9A77E"/>
<rect x="40" y="300" width="1000" height="980" rx="18" fill="#7A4E2E"/>
<rect x="64" y="324" width="952" height="932" rx="8" fill="#2F5D47"/>
<rect x="64" y="324" width="952" height="932" rx="8" fill="#FFFFFF" opacity=".04"/>
<path d="M120 1060 h380 M150 1060 v110 M470 1060 v110" stroke="#F4F1E6" stroke-width="9" stroke-linecap="round" fill="none" opacity=".9"/>
<path d="M210 1060 l40 -60 h170 l-40 60 z" fill="none" stroke="#F4F1E6" stroke-width="8" stroke-linejoin="round" opacity=".9"/>
<path d="M250 1000 l40 -14 h170" stroke="#F4F1E6" stroke-width="6" fill="none" opacity=".7"/>
<path d="M620 1100 c40 -40 90 -40 130 0" stroke="#F4F1E6" stroke-width="6" fill="none" opacity=".5"/>
<rect x="64" y="1256" width="952" height="26" fill="#6A4227"/>
<rect x="760" y="1240" width="90" height="18" rx="6" fill="#FFFFFF" opacity=".85"/><rect x="870" y="1242" width="60" height="16" rx="6" fill="#F8C637" opacity=".85"/>
</svg>`;
}
