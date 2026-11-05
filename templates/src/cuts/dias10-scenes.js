// Cenários do "E se você treinasse inglês todo dia?" v10: o banheiro do Dia 1 (porta com fresta, privada com
// descarga) e o corte de piso do prédio (apartamento do Caio em cima, o da Vera embaixo), de dia e de noite.
// Mesmo estilo vetorial chapado de dias-scenes.js; mundo 1440 × 2400.
import { bathSVG, neighborSVG, dreamSVG } from './dias-scenes.js';

const open = () => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 2400" width="1440" height="2400">';
const shade = (x, y, rx, ry, op = 0.18) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#2A1810" opacity="${op}"/>`;

/** Banheiro pequeno: azulejo creme, espelho, pia, privada com caixa acoplada à esquerda, porta fechada à direita
 *  (a fresta de luz embaixo dela é peça do corte, para a sombra dos chinelos passar). Chão em y 1650. */
export function toiletSVG() {
  let tiles = '';
  for (let y = 120; y < 1650; y += 120) tiles += `<path d="M0 ${y} H1440" stroke="#E2D3B6" stroke-width="4"/>`;
  for (let x = 0; x < 1440; x += 120) tiles += `<path d="M${x} 0 V1650" stroke="#E2D3B6" stroke-width="4"/>`;
  let floor = '';
  for (let x = -60; x < 1500; x += 160) floor += `<path d="M${x} 1650 L${x - 220} 2400" stroke="#8E7D63" stroke-width="5" opacity=".55"/>`;
  for (let y = 1760; y < 2400; y += 150) floor += `<path d="M0 ${y} H1440" stroke="#8E7D63" stroke-width="5" opacity=".45"/>`;
  return `${open()}<defs><linearGradient id="tw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF4DE"/><stop offset="1" stop-color="#F3E1BE"/></linearGradient>
<linearGradient id="tf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C7B28E"/><stop offset="1" stop-color="#A9936F"/></linearGradient>
<linearGradient id="dr" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#C98B5E"/><stop offset="1" stop-color="#B5784A"/></linearGradient>
<linearGradient id="mi" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#CFE7EE"/><stop offset="1" stop-color="#9CC6D3"/></linearGradient></defs>
<rect width="1440" height="2400" fill="url(#tw)"/>${tiles}
<rect y="1560" width="1440" height="90" fill="#E7D4AF"/><rect y="1556" width="1440" height="10" fill="#CDB68C"/>
<rect y="1650" width="1440" height="750" fill="url(#tf)"/>${floor}
<!-- janelinha alta e basculante -->
<rect x="430" y="150" width="300" height="190" rx="18" fill="#F6F6F6"/><rect x="448" y="168" width="264" height="154" rx="10" fill="#BFD9EA"/><path d="M448 245 h264" stroke="#F6F6F6" stroke-width="10"/>
<!-- espelho e pia -->
<rect x="420" y="520" width="320" height="400" rx="26" fill="#8A5A3C"/><rect x="440" y="540" width="280" height="360" rx="18" fill="url(#mi)"/><path d="M470 860 L640 570" stroke="#FFFFFF" stroke-width="16" opacity=".45" stroke-linecap="round"/>
<rect x="400" y="1010" width="360" height="40" rx="14" fill="#FFFFFF"/><path d="M420 1050 h320 l-40 150 h-240z" fill="#F2F2F2"/><rect x="560" y="1200" width="40" height="360" fill="#E4E4E4"/>
<path d="M580 1010 v-60 h40" stroke="#9AA0AE" stroke-width="14" fill="none" stroke-linecap="round"/>
<rect x="690" y="960" width="26" height="54" rx="8" fill="#7FC9E8"/><rect x="452" y="978" width="40" height="36" rx="8" fill="#F8C637"/>
<!-- toalha pendurada -->
<rect x="790" y="640" width="150" height="16" rx="8" fill="#9AA0AE"/><path d="M800 656 h130 v330 q-65 30 -130 0z" fill="#7FD6C8"/><path d="M800 900 h130" stroke="#FFFFFF" stroke-width="10" opacity=".6"/>
<!-- privada com caixa acoplada (o botão da descarga em cima é peça do corte) -->
${shade(260, 1660, 220, 28, 0.22)}
<rect x="80" y="980" width="340" height="280" rx="30" fill="#FFFFFF"/><rect x="80" y="980" width="340" height="40" rx="20" fill="#EDEDED"/><rect x="98" y="1240" width="304" height="30" rx="12" fill="#E4E4E4"/>
<path d="M90 1270 h320 c0 120 -40 200 -110 240 v140 h-110 v-140 c-70 -40 -100 -120 -100 -240z" fill="#FFFFFF"/><path d="M110 1290 h280" stroke="#D9D9D9" stroke-width="10" stroke-linecap="round"/>
<path d="M240 1300 c0 100 30 170 60 190" stroke="#E6E6E6" stroke-width="12" fill="none"/>
<!-- rolo de papel -->
<rect x="460" y="1290" width="70" height="20" rx="8" fill="#9AA0AE"/><circle cx="495" cy="1340" r="42" fill="#FFFFFF"/><circle cx="495" cy="1340" r="12" fill="#D9D9D9"/>
<!-- porta fechada à direita, com batente e maçaneta -->
<rect x="1000" y="380" width="420" height="1272" fill="#8A5A3C"/><rect x="1024" y="400" width="372" height="1250" fill="url(#dr)"/>
<rect x="1060" y="440" width="300" height="500" rx="12" fill="none" stroke="#A56F46" stroke-width="10"/><rect x="1060" y="1000" width="300" height="580" rx="12" fill="none" stroke="#A56F46" stroke-width="10"/>
<rect x="1040" y="960" width="70" height="26" rx="13" fill="#C9CDD4"/><circle cx="1050" cy="973" r="18" fill="#9AA0AE"/>
<!-- tapetinho -->
<ellipse cx="760" cy="1760" rx="300" ry="54" fill="#E77B4F" opacity=".9"/><ellipse cx="760" cy="1760" rx="230" ry="36" fill="none" stroke="#FFF2DE" stroke-width="7"/>
</svg>`;
}

// um recorte [y0, y0 + 1180] de uma cena 1440 × 2400, posto em y no mundo do corte de piso
const crop = (svg, y0, y, tint = '') => svg
  .replace(/^<svg[^>]*>/, `<svg x="0" y="${y}" width="1440" height="1180" viewBox="0 ${y0} 1440 1180" preserveAspectRatio="none">`)
  .replace(/<\/svg>\s*$/, `${tint ? `<rect x="0" y="${y0}" width="1440" height="1180" fill="${tint}"/>` : ''}</svg>`);
/** Laje de concreto entre os dois andares, com cano e conduíte (é ali que fica a legenda). */
const slab = (night) => `<rect x="0" y="1170" width="1440" height="60" fill="${night ? '#55506A' : '#9C978E'}"/><rect x="0" y="1170" width="1440" height="10" fill="${night ? '#6E6886' : '#B9B4AA'}"/>
<rect x="0" y="1222" width="1440" height="8" fill="${night ? '#3C3850' : '#7E796F'}"/>${Array.from({ length: 12 }, (_, i) => `<circle cx="${60 + i * 120}" cy="1200" r="5" fill="${night ? '#3C3850' : '#7E796F'}" opacity=".6"/>`).join('')}`;

/** Corte de piso: de dia, o box do chuveiro do Caio em cima e a sala/quarto da Vera embaixo; de noite, os dois quartos
 *  (o mesmo apartamento, um em cima do outro), o de baixo com a parede mais rosada. */
export function floorsSVG(mode = 'day') {
  const night = mode === 'night';
  const top = night ? crop(dreamSVG(), 1200, 0) : crop(bathSVG(), 500, 0);
  const bot = night ? crop(dreamSVG(), 1200, 1220, 'rgba(255,150,190,.16)') : crop(neighborSVG(), 700, 1220);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 2700" width="1440" height="2700"><rect width="1440" height="2700" fill="${night ? '#2E2560' : '#9A6439'}"/>${top}${bot}${slab(night)}</svg>`;
}
