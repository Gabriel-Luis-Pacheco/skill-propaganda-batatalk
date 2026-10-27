// Peças comuns a todos os cortes: câmera, textos, Tato do filme, mapa, portas,
// convite final, onda em espaço de tela e a lista de áudio. Funções puras do tempo.
import { E, clamp, lerp, inv, track, pulse } from '../core/time.js';
import { bakeTato, rigParts, paintTato } from '../core/tato-motor.js';
import { tatoSpeech } from '../core/visemes.js';
import { ribbon, ribbonSvg, pathFrom } from '../core/wave.js';
import { tatoFigure } from '/tato-guide.js';
import { worldMapArt, MAP_LAYOUTS } from '/world-map.js';
import { CITY_DATA } from '/city-experience.js';
import { Stage } from '../stage-layer.js';

export { E, clamp, lerp, inv, track, pulse, ribbon, ribbonSvg, pathFrom, tatoSpeech, Stage };

// ------------------------------------------------------------------ elementos
export function el(parent, tag, cls, html = '', style = {}) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html) n.innerHTML = html;
  Object.assign(n.style, style);
  parent.append(n);
  return n;
}
export const css = (n, props) => { for (const [k, v] of Object.entries(props)) { const val = typeof v === 'number' && !['opacity', 'zIndex'].includes(k) ? `${v}px` : String(v); if (n.style[k] !== val) n.style[k] = val; } };
export const fade = (n, o) => { const v = String(+clamp(o).toFixed(3)); if (n.style.opacity !== v) n.style.opacity = v; n.style.visibility = o <= 0.001 ? 'hidden' : 'visible'; };

// ------------------------------------------------------------------ câmera
/** Trilha de câmera {cx, cy, s}: escala interpolada em log (zoom com velocidade perceptual constante). */
export function camTrack(keys) {
  const k = keys.slice().sort((a, b) => a[0] - b[0]);
  return (t) => {
    if (t <= k[0][0]) return { ...k[0][1] };
    for (let i = 1; i < k.length; i++) {
      if (t < k[i][0]) {
        const [t0, a] = k[i - 1], [t1, b, ease = 'camera'] = k[i];
        const e = (typeof ease === 'function' ? ease : E[ease])((t - t0) / (t1 - t0));
        const s = Math.exp(lerp(Math.log(a.s), Math.log(b.s), e));
        // o centro anda junto com o zoom: âncora no ponto que fica parado na tela
        return { cx: lerp(a.cx, b.cx, e), cy: lerp(a.cy, b.cy, e), s };
      }
    }
    return { ...k[k.length - 1][1] };
  };
}
export function applyCamera(world, cam, W, H) {
  const v = `translate(${(W / 2).toFixed(2)}px, ${(H / 2).toFixed(2)}px) scale(${cam.s.toFixed(5)}) translate(${(-cam.cx).toFixed(2)}px, ${(-cam.cy).toFixed(2)}px)`;
  if (world.style.transform !== v) world.style.transform = v;
}
export const toScreen = (cam, x, y, W, H) => [W / 2 + (x - cam.cx) * cam.s, H / 2 + (y - cam.cy) * cam.s];
/** Câmera que mostra o retângulo [x0,y0,x1,y1] do mundo, com margem, dentro de W×H. */
export const frameRect = ([x0, y0, x1, y1], W, H, pad = 0) => ({ cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, s: Math.min((W - pad * 2) / (x1 - x0), (H - pad * 2) / (y1 - y0)) });

// ------------------------------------------------------------------ textos
/** Título com palavras que sobem uma a uma (texto do espectador, em português). */
export class Title {
  constructor(parent, text, { cls = 'title', x = 0, y = 0, align = 'left', size, lines } = {}) {
    this.n = el(parent, 'div', cls);
    const rows = lines || [text];
    this.n.innerHTML = rows.map((row) => `<div class="row">${row.split(' ').map((w) => `<span class="w">${w}</span>`).join(' ')}</div>`).join('');
    this.words = [...this.n.querySelectorAll('.w')];
    Object.assign(this.n.style, { left: `${x}px`, top: `${y}px`, textAlign: align, ...(size ? { fontSize: `${size}px` } : {}) });
    if (align === 'center') this.n.style.transform = 'translateX(-50%)';
    fade(this.n, 0);
  }
  frame(t, start, end, { stagger = 0.07, rise = 26, exit = 0.28 } = {}) {
    if (t < start - 0.01 || t > end + 0.01) { fade(this.n, 0); return; }
    fade(this.n, 1 - E.in(inv(end - exit, end, t)));
    this.words.forEach((w, i) => {
      const k = E.out(inv(start + i * stagger, start + i * stagger + 0.42, t));
      const v = `translateY(${((1 - k) * rise).toFixed(1)}px)`;
      if (w.style.transform !== v) w.style.transform = v;
      const o = String(+k.toFixed(3)); if (w.style.opacity !== o) w.style.opacity = o;
    });
  }
}
/** Legenda da narração (o que o Tato diz em português). */
export class Subtitle {
  constructor(parent, { y, x = null, small = '' } = {}) { this.n = el(parent, 'div', 'sub'); this.y = y; this.x = x; this.small = small; fade(this.n, 0); this.text = ''; }
  frame(t, items) {
    const it = items.find((c) => t >= c.start - 0.05 && t <= c.end + 0.25);
    if (!it) { fade(this.n, 0); return; }
    const html = `${it.label ? `<small>${it.label}</small>` : ''}${it.text}`;
    if (this.text !== html) { this.text = html; this.n.innerHTML = html; }
    const k = Math.min(E.out(inv(it.start - 0.05, it.start + 0.2, t)), 1 - E.in(inv(it.end + 0.05, it.end + 0.25, t)));
    fade(this.n, k);
    css(this.n, { top: this.y, left: this.x == null ? '50%' : this.x, transform: `translateX(-50%) translateY(${((1 - k) * 10).toFixed(1)}px)` });
  }
}

// ------------------------------------------------------------------ Tato do filme
export class TatoActor {
  constructor(parent, { id = 'film', w = 300 } = {}) {
    this.n = el(parent, 'div', 'tato-actor', tatoFigure(id));
    this.svg = this.n.querySelector('svg');
    this.rig = rigParts(this.svg);
    this.w = w;
  }
  bake(script, duration) { this.motor = bakeTato(script, duration); return this; }
  /** x, y = ponto entre os pés (no espaço do pai); h = altura em px. */
  frame(t, { x, y, h, o = 1, flip = false }) {
    const w = h * (200 / 220);
    css(this.n, { left: x - w / 2, top: y - h * (207 / 220), width: w, height: h, transform: flip ? 'scaleX(-1)' : 'none' });
    fade(this.n, o);
    if (o > 0.001 && this.motor) { this.last = this.motor.pose(t); paintTato(this.rig, this.last); }
  }
  /** Posição aproximada da mão (lado 'left' = esquerda da tela) no espaço do pai, para segurar coisas. */
  hand(side, { x, y, h }) {
    const f = this.last?.num; if (!f) return [x, y];
    const k = h / 220, ox = x - 100 * k * (200 / 220) * (220 / 200), oy = y - 207 * k;
    const piv = side === 'left' ? [56, 128] : [144, 128], tip = side === 'left' ? [31, 164] : [169, 164];
    const a = (side === 'left' ? f.armL : -f.armR) * Math.PI / 180;
    let px = piv[0] + (tip[0] - piv[0]) * Math.cos(a) - (tip[1] - piv[1]) * Math.sin(a);
    let py = piv[1] + (tip[0] - piv[0]) * Math.sin(a) + (tip[1] - piv[1]) * Math.cos(a);
    // corpo: escala em torno de (100,190), giro em torno de (100,190), sobe/desce
    px = 100 + (px - 100) * f.sx; py = 190 + (py - 190) * f.sy;
    const b = f.angle * Math.PI / 180, rx = 100 + (px - 100) * Math.cos(b) - (py - 190) * Math.sin(b), ry = 190 + (px - 100) * Math.sin(b) + (py - 190) * Math.cos(b);
    return [x + (rx - 100) * k, oy + (ry + f.lift) * k];
  }
}

// ------------------------------------------------------------------ mapa aéreo
/** O mapa do app (world-map.js) rasterizado uma vez, para o zoom não refazer o filtro a cada quadro. */
export async function mapImage(kind, px) {
  const L = MAP_LAYOUTS[kind];
  const svg = worldMapArt(kind, CITY_DATA.map((c) => c.id)).replace('<svg ', `<svg xmlns="http://www.w3.org/2000/svg" width="${L.w}" height="${L.h}" `);
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  const img = new Image(); img.src = url; await img.decode();
  const c = document.createElement('canvas'); c.width = px; c.height = Math.round(px * L.h / L.w);
  const g = c.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(img, 0, 0, c.width, c.height);
  URL.revokeObjectURL(url);
  const out = new Image(); out.src = c.toDataURL('image/png'); await out.decode();
  c.width = c.height = 1;
  return { img: out, layout: L, names: CITY_DATA.map((c) => c.name), cities: CITY_DATA.length, places: CITY_DATA.reduce((n, c) => n + c.pois.length, 0) };
}

// ------------------------------------------------------------------ áudio
/** Lista do que toca e quando — o mixer (audio/mix.mjs) monta a trilha a partir dela. */
export class AudioList {
  constructor() { this.items = []; }
  voice(id, at, voices, { gain = 1, pan = 0 } = {}) {
    const v = voices.lines[id]; if (!v) return at;
    this.items.push({ kind: 'voice', id, file: v.file, start: +(at - v.on).toFixed(4), on: at, off: +(at + (v.off - v.on)).toFixed(4), gain, pan, who: v.who, text: v.text });
    return at + (v.off - v.on);
  }
  /** Um trecho [a, b] (s, no arquivo) de uma fala, posto em `at`: o corte seco de vlog. */
  clip(id, at, a, b, voices, { file, gain = 1, pan = 0 } = {}) {
    const v = voices.lines[id]; if (!v) return at;
    this.items.push({ kind: 'voice', id, file: file || v.file, clip: [+a.toFixed(4), +b.toFixed(4)], start: +at.toFixed(4), on: +at.toFixed(4), off: +(at + b - a).toFixed(4), gain, pan, who: v.who, text: v.text });
    return at + (b - a);
  }
  sfx(name, at, opts = {}) { this.items.push({ kind: 'sfx', name, start: +at.toFixed(4), ...opts }); }
  cue(name, at, opts = {}) { this.items.push({ kind: 'cue', name, start: +at.toFixed(4), ...opts }); }
}
