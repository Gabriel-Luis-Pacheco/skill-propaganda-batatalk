// Figurinos de "E se o Cam treinasse inglês todo dia?": o Cam troca de roupa conforme a situação (cada uma desenhada
// em cima do rig do produto, só trocando as peças do torso, mangas, calça e sapato): moletom de casa com a batatinha
// bordada, ombros de banho, pijama com luas e estrelas (e máscara de dormir na testa), e o colete de hotel dele na rua.
// O turista (Dante) ganha camisa florida, câmera a tiracolo e nariz queimado de sol; a Marlene (Vera) ganha robe rosa.
import { mergeDesign } from '/character-rig.js';
import { DESIGNS } from '/character-designs.js';

const mir = (s) => (s.pts ? { ...s, pts: s.pts.map(([x, y, ...r]) => [-x, y, ...r]).reverse() } : { ...s, a: [-s.a[0], s.a[1]], b: [-s.b[0], s.b[1]], x: s.x != null ? -s.x : undefined });
const pair = (s) => [s, mir(s)];
const prop = (shapes, over = {}) => ({ upright: true, reach: 0.2, dx: 2, dy: -4, grip: 'rest', thumb: true, front: false, shapes, ...over });
const rect = (w, h, fill, z = 3) => ({ t: 'poly', pts: [[-w / 2, -h / 2, z], [w / 2, -h / 2, z], [w / 2, h / 2, z], [-w / 2, h / 2, z]], fill });
const camBase = DESIGNS.cam;
// celular visto por trás (a tela fica virada para o Cam): corpo escuro, lente e borda de luz; desenhado NA FRENTE da mão (ela segura por trás)
const phoneProp = prop([rect(26, 42, 'phoneBody'), { t: 'poly', pts: [[-13, -21, 4], [13, -21, 4], [13, 21, 4], [-13, 21, 4]], r: 4, fill: 'phoneRim' }, rect(20, 36, 'phoneBody', 5), { t: 'circle', x: -5, y: -12, r: 4, fill: 'phoneLens' }, { t: 'circle', x: -5, y: -12, r: 1.8, fill: 'phoneRim' },
  ...[-8, 2, 12].map((y) => ({ t: 'pill', a: [-16, y], b: [-11, y], w: 5.6, fill: 'skin' })), { t: 'pill', a: [13, -6], b: [18, 6], w: 6.4, fill: 'skin' }], { front: true, thumb: false, reach: 0.25, dy: -6 });
const BASE = { colors: { ...camBase.colors, phoneBody: '#1B1F2A', phoneGlow: '#7FE3D5', phoneRim: '#7FE3D5', phoneLens: '#3A4256', tear: '#8FD3F4', capc: '#9AD1F2', capdot: '#FFFFFF' }, props: { ...camBase.props, phone: phoneProp } };
export const camSignature = mergeDesign(camBase, { ...BASE, legs: { ...camBase.legs, w: 19 } });

// moletom amarelo-mostarda (casa, armário): capuz, bolso canguru, cordões e uma batatinha bordada no peito
const BODY = [[-38, -90, 16], [38, -90, 16], [37, -40, 12], [35, 2, 8], [-35, 2, 8], [-37, -40, 12]];
export const camHome = mergeDesign(camBase, {
  ...BASE,
  colors: { ...BASE.colors, hoodie: '#E7B23C', cream: '#FFF2DE', print: '#D9A55F', pants: '#6F7684', shoes: '#EAB4A4' },
  torso: {
    backShapes: [{ t: 'poly', pts: BODY, fill: 'hoodie-' }, { t: 'poly', pts: [[-28, -96, 12], [28, -96, 12], [24, -78, 10], [-24, -78, 10]], fill: 'hoodie--' }],
    shapes: [
      { t: 'poly', pts: BODY, fill: 'hoodie' },
      { t: 'poly', pts: [[-34, -94, 10], [34, -94, 10], [24, -72, 12], [-24, -72, 12]], r: 4, fill: 'hoodie-' },
      { t: 'poly', pts: [[-18, -88, 6], [18, -88, 6], [10, -76, 8], [-10, -76, 8]], r: 3, fill: 'hoodie--' },
      { t: 'pill', a: [-8, -78], b: [-9, -54], w: 2.6, fill: 'cream' }, { t: 'pill', a: [8, -78], b: [9, -52], w: 2.6, fill: 'cream' },
      { t: 'circle', x: -9, y: -53, r: 2.6, fill: 'cream' }, { t: 'circle', x: 9, y: -51, r: 2.6, fill: 'cream' },
      { t: 'ellipse', x: 0, y: -40, rx: 10, ry: 12.5, fill: 'print' },
      { t: 'circle', x: -3.6, y: -42, r: 1.5, fill: 'hair' }, { t: 'circle', x: 3.6, y: -42, r: 1.5, fill: 'hair' },
      { t: 'poly', pts: [[-24, -22, 8], [24, -22, 8], [29, -2, 8], [-29, -2, 8]], r: 5, fill: 'hoodie-' },
      { t: 'pill', a: [-6, -22], b: [-8, -2], w: 1.6, fill: 'hoodie--' }, { t: 'pill', a: [6, -22], b: [8, -2], w: 1.6, fill: 'hoodie--' },
    ],
  },
  arms: { ...camBase.arms, w: 14, sleeve: { to: 0.95, color: 'hoodie', wk: 1.28, cuff: 'hoodie--', cuffLen: 0.1 } },
  legs: { ...camBase.legs, w: 20 },
});

// roupão felpudo creme com cinto verde-azulado e lapela (banho): a porta de vidro fosco cobre o resto; o shampoo vira microfone
const ROBE = [[-40, -90, 18], [40, -90, 18], [39, -40, 12], [37, 4, 8], [-37, 4, 8], [-39, -40, 12]];
const terry = [[-26, -70], [14, -62], [-12, -34], [26, -28], [-30, -12], [4, -8]].map(([x, y]) => ({ t: 'circle', x, y, r: 2.4, fill: 'robeDot' }));
export const camBare = mergeDesign(camBase, {
  ...BASE,
  colors: { ...BASE.colors, robe: '#F4F0E6', robeDot: '#E4DCC8', beltc: '#2F7F78', shampoo: '#FF8AD8', shampooCap: '#E86AB8', suds: '#FFFFFF' },
  legs: { ...camBase.legs, w: 19 },
  torso: {
    backShapes: [{ t: 'poly', pts: ROBE, fill: 'robe-' }],
    shapes: [
      { t: 'poly', pts: ROBE, fill: 'robe' }, ...terry,
      { t: 'poly', pts: [[-13, -92, 6], [13, -92, 6], [0, -50, 8]], fill: 'skin' },
      ...pair({ t: 'poly', pts: [[-15, -94, 4], [-2, -52, 4], [-22, -38, 5], [-42, -86, 8]], r: 2, fill: 'robe-' }),
      { t: 'pill', a: [-38, -18], b: [38, -18], w: 7, fill: 'beltc' }, { t: 'circle', x: 0, y: -18, r: 6, fill: 'beltc' },
    ],
  },
  arms: { ...camBase.arms, w: 14, sleeve: { to: 0.95, color: 'robe', wk: 1.3, cuff: 'robe-', cuffLen: 0.12 } },
  props: { ...camBase.props, phone: phoneProp, shampoo: prop([rect(15, 38, 'shampoo'), rect(11, 8, 'shampooCap', 4), rect(9, 4, 'suds', 4)], { front: true, thumb: false, reach: 0.3, grip: 'fist' }) },
  head: { ...camBase.head, over: [
    { t: 'ellipse', x: 0, y: -52, rx: 52, ry: 31, fill: 'capc' },
    { t: 'poly', pts: [[-50, -32, 6], [50, -32, 6], [47, -20, 6], [-47, -20, 6]], r: 5, fill: 'capc-' },
    { t: 'circle', x: -22, y: -60, r: 6, fill: 'capdot', op: 0.7 }, { t: 'circle', x: 12, y: -68, r: 5, fill: 'capdot', op: 0.7 }, { t: 'circle', x: 30, y: -52, r: 4.5, fill: 'capdot', op: 0.7 },
  ] },
});

// pijama azul-noite com luas e estrelas, e máscara de dormir empurrada na testa
const PJ = [[-36, -89, 16], [36, -89, 16], [34, -40, 12], [31, 0, 8], [-31, 0, 8], [-34, -40, 12]];
const stars = [[-22, -66], [-8, -30], [18, -58], [24, -22], [6, -76], [-24, -14], [-2, -52]].map(([x, y], i) => ({ t: 'circle', x, y, r: i % 3 ? 2.1 : 3, fill: 'pjStar' }));
export const camPJ = mergeDesign(camBase, {
  ...BASE,
  legs: { ...camBase.legs, w: 19 },
  colors: { ...BASE.colors, pj: '#2D3F86', pjLight: '#9AB0F2', pjStar: '#FFE07A', mask: '#E87AA2', pants: '#2D3F86', shoes: '#2D3F86' },
  torso: {
    backShapes: [{ t: 'poly', pts: PJ, fill: 'pj-' }],
    shapes: [
      { t: 'poly', pts: PJ, fill: 'pj' },
      { t: 'pill', a: [0, -86], b: [0, 0], w: 2.4, fill: 'pjLight' },
      ...pair({ t: 'poly', pts: [[-3, -88, 3], [-14, -90, 4], [-8, -74, 3]], r: 1.5, fill: 'pjLight' }),
      ...[-62, -44, -26, -8].map((y) => ({ t: 'circle', x: 0, y, r: 2.4, fill: 'pjLight' })),
      ...stars,
      { t: 'pill', a: [-31, -3], b: [31, -3], w: 3, fill: 'pjLight' },
    ],
  },
  arms: { ...camBase.arms, w: 14, sleeve: { to: 0.95, color: 'pj', wk: 1.22, cuff: 'pjLight', cuffLen: 0.09 } },
  head: { ...camBase.head, over: [
    { t: 'poly', pts: [[-37, -30, 10], [37, -30, 10], [36, -18, 8], [-36, -18, 8]], r: 6, fill: 'mask' },
    { t: 'pill', a: [-40, -24], b: [-44, -4], w: 3, fill: 'mask-' }, { t: 'pill', a: [40, -24], b: [44, -4], w: 3, fill: 'mask-' },
    { t: 'circle', x: 0, y: -24, r: 3, fill: 'pjLight' },
  ] },
});

// turista: camisa florida, câmera a tiracolo, bermuda e nariz queimado
const dBase = DESIGNS.dante;
const DB = [[-66, -98, 30], [66, -98, 30], [60, -40, 20], [50, -2, 10], [-50, -2, 10], [-60, -40, 20]];
const flowers = [[-44, -66, 'pink'], [-20, -40, 'sun'], [-48, -22, 'sun'], [30, -62, 'pink'], [44, -30, 'white'], [20, -14, 'pink'], [-30, -88, 'white'], [52, -80, 'sun'], [-6, -20, 'white']].map(([x, y, c]) => ({ t: 'circle', x, y, r: 6.5, fill: `p${c}` }));
const leaves = [[-58, -50], [38, -48], [8, -30], [-28, -8], [56, -12]].map(([x, y]) => ({ t: 'ellipse', x, y, rx: 11, ry: 4.4, rot: x > 0 ? 40 : -40, fill: 'palm' }));
export const danteTourist = mergeDesign(dBase, {
  colors: { ...dBase.colors, hawai: '#33B5A5', palm: '#1F7F71', ppink: '#FF8AD8', psun: '#FFD54A', pwhite: '#FFFFFF', strap: '#3A2A20', cam: '#26262E', lens: '#7FB6E8', shorts: '#CDB88A', clogs: '#8A5A3A', burn: '#E2503A', hatBrim: '#E2C173', hatCrown: '#F0D58A', hatBand: '#B5294C' },
  mapPaper: undefined,
  torso: {
    backShapes: [{ t: 'poly', pts: DB, fill: 'hawai-' }],
    shapes: [
      { t: 'poly', pts: DB, fill: 'hawai' }, ...leaves, ...flowers,
      { t: 'poly', pts: [[-16, -100, 6], [16, -100, 6], [0, -64, 8]], fill: 'skin' },
      ...pair({ t: 'poly', pts: [[-17, -102, 4], [-3, -96, 3], [-12, -62, 6], [-38, -90, 8]], r: 2, fill: 'hawai-' }),
      { t: 'pill', a: [-50, -98], b: [42, -8], w: 7, fill: 'strap' },
      { t: 'poly', pts: [[22, -22, 8], [58, -22, 8], [58, 6, 8], [22, 6, 8]], r: 6, fill: 'cam' },
      { t: 'circle', x: 40, y: -8, r: 8.5, fill: 'lens' }, { t: 'circle', x: 40, y: -8, r: 4.2, fill: 'cam' },
    ],
  },
  legs: { ...dBase.legs, color: 'shorts', skinFrom: 0.5 },
  arms: { ...dBase.arms, sleeve: { to: 0.5, color: 'hawai', wk: 1.15, cuff: 'hawai-', cuffLen: 0.1 } },
  head: { ...dBase.head, over: [
    { t: 'ellipse', x: 0, y: -42, rx: 86, ry: 17, fill: 'hatBrim' }, { t: 'poly', pts: [[-54, -42, 10], [54, -42, 10], [50, -80, 22], [0, -94, 24], [-50, -80, 22]], fill: 'hatCrown' },
    { t: 'poly', pts: [[-53, -50, 4], [53, -50, 4], [54, -42, 4], [-54, -42, 4]], fill: 'hatBand' },
    { t: 'ellipse', x: 0, y: 25, rx: 9, ry: 6.5, fill: 'burn', op: 0.55 }, { t: 'ellipse', x: -24, y: 22, rx: 11, ry: 7, fill: 'burn', op: 0.28 }, { t: 'ellipse', x: 24, y: 22, rx: 11, ry: 7, fill: 'burn', op: 0.28 }] },
  props: { ...dBase.props, map: prop([rect(48, 58, 'mapPaper'), rect(2, 58, 'mapFold', 4), { t: 'pill', a: [-15, -18], b: [12, 20], w: 5, fill: 'mapBlue' }, { t: 'pill', a: [-18, 8], b: [8, -12], w: 3, fill: 'mapRed' }, { t: 'circle', x: 10, y: -14, r: 4.4, fill: 'mapRed' }], { front: true, thumb: false, reach: 0.25 }) },
});
Object.assign(danteTourist.colors, { mapPaper: '#F3E6C4', mapRed: '#D9343F', mapBlue: '#7FB6E8', mapFold: '#D9C9A0' });

// Marlene de robe rosa, com bobes (peça do corte) e chinelo azul
const vh = DESIGNS.vera.head;
const curl = [-38, -19, 0, 19, 38].map((x) => ({ t: 'pill', a: [x, -66 + (x * x) / 160], b: [x, -42 + (x * x) / 160], w: 13, fill: 'curl' }));
export const veraRobe = mergeDesign(DESIGNS.vera, {
  colors: { ...DESIGNS.vera.colors, dress: '#F2A0BE', apron: '#FFD3E2', collar: '#FFF0F5', clogs: '#7FC9E8', curl: '#7FD6C8', glassC: '#CFEFFF' },
  head: { ...vh, over: [...curl, ...vh.over] },
  legs: { ...DESIGNS.vera.legs, w: 20 },
  props: { ...DESIGNS.vera.props, glass: prop([{ t: 'poly', pts: [[-13, -10, 3], [13, -10, 3], [10, 20, 3], [-10, 20, 3]], r: 3, fill: 'glassC', op: 0.85 }, { t: 'pill', a: [-6, -6], b: [-5, 14], w: 3, fill: '#FFFFFF' }], { front: true, thumb: false, reach: 0.3, grip: 'fist' }) },
});

// v10 (04/11): Vera de pijama (sem bobes: o clichê de "fofoqueira" saiu) e o Beto de roupa comum, sem avental de chef
export const veraPJ = mergeDesign(DESIGNS.vera, {
  colors: { ...DESIGNS.vera.colors, dress: '#8FA8DA', apron: '#8FA8DA', collar: '#E6ECFF', clogs: '#F2D7C6', legs: '#F2B795' },
  legs: { ...DESIGNS.vera.legs, w: 20 },
});
export const betoStreet = mergeDesign(DESIGNS.dante, {
  colors: { ...DESIGNS.dante.colors, apron: '#4F7FB0', towel: '#4F7FB0', white: '#E9EEF3', pants: '#3A3F4E' },
});

// v11: a Vera de pijama segurando a vassoura de cabeça para baixo (cabo para cima, para bater no teto)
export const veraBroom = mergeDesign(veraPJ, {
  colors: { ...veraPJ.colors, broomStick: '#B5784A', broomTop: '#F2C14E', broomBand: '#E2503A' },
  props: { ...veraPJ.props, broom: prop([{ t: 'pill', a: [0, 24], b: [0, -150], w: 7, fill: 'broomStick' }, { t: 'poly', pts: [[-20, 24, 4], [20, 24, 4], [26, 70, 6], [-26, 70, 6]], fill: 'broomTop' }, { t: 'pill', a: [-19, 30], b: [19, 30], w: 6, fill: 'broomBand' }], { front: true, thumb: false, reach: 0.25, grip: 'fist' }) },
});
