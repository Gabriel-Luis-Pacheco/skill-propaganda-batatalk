// V8 pública — inicialização do filme e contrato com o renderer (tools/render.mjs):
//   window.__film = { duration, fps, width, height, samples(t), seek(t), ready(opts), captions, cues }
// Cada corte (master, social, anúncios, landing, bumper) é um módulo em src/cuts/.
const q = new URLSearchParams(location.search);
const format = q.get('format') === '9x16' ? '9x16' : '16x9';
const cutName = q.get('cut') || 'master';
const W = format === '9x16' ? 1080 : 1920, H = format === '9x16' ? 1920 : 1080;

const CUTS = {
  master: () => import('./cuts/master.js'),
  social: () => import('./cuts/social.js'),
  adA: () => import('./cuts/ads.js'), adB: () => import('./cuts/ads.js'), adC: () => import('./cuts/ads.js'),
  landing: () => import('./cuts/landing.js'),
  bumper: () => import('./cuts/bumper.js'),
  quiz: () => import('./cuts/quiz.js'),
  erros: () => import('./cuts/erros.js'),
  quiz2: () => import('./cuts/quiz2.js'),
  creator: () => import('./cuts/creator.js'),
  bar: () => import('./cuts/bar.js'),
};

async function boot() {
  // variantes do TikTok (tt…) usam o motor dos anúncios: SPECS[cut]
  const mod = await (CUTS[cutName] || (cutName.startsWith('tt') ? CUTS.adA : CUTS.master))();
  const cut = await mod.create({ format, cut: cutName, W, H, film: document.getElementById('film'), world: document.getElementById('world'), overlay: document.getElementById('overlay'), voices: window.V8_VOICES });
  window.__film = {
    format, cut: cutName, duration: cut.duration, fps: 60, width: W, height: H, cues: cut.cues, captions: cut.captions, audio: cut.audio, hook: cut.hook ?? null,
    provisional: Boolean(window.V8_VOICES?.provisional),
    samples: (t) => cut.samples(t),
    seek: (t) => cut.render(Math.max(0, Math.min(cut.duration - 1e-4, t))),
    async ready(opts = {}) {
      await document.fonts.ready;
      await Promise.all(['500 20px Fredoka', '600 20px Fredoka', '700 20px Fredoka', '500 20px "DM Sans"', '600 20px "DM Sans"', '700 20px "DM Sans"'].map((f) => document.fonts.load(f)));
      // imagens (ícone, mapa rasterizado): decodificadas no próprio quadro, em qualquer escala
      for (const img of document.images) { img.loading = 'eager'; img.decoding = 'sync'; }
      await Promise.all([...document.images].map((img) => img.decode().catch(() => {})));
      await cut.ready(opts);
      cut.render(opts.from || 0);
      return true;
    },
  };
  window.__filmReady = true;
}
boot().catch((err) => { console.error('film boot failed', err); window.__filmError = String(err?.stack || err); });
