// Uma tela da prática (stage.html) dentro do filme: um iframe com o viewport do
// produto (1280×880 no 16:9, 390×693 no 9:16), posicionado no espaço do mundo.
export class Stage {
  constructor(parent, { ci = 1, pi = 0, turn = 3, vw, vh, x = 0, y = 0, cls = 'screen', chrome = false, radius = 0, clip = null }) {
    Object.assign(this, { ci, pi, turn, vw, vh, x, y });
    this.box = document.createElement('div');
    this.box.className = chrome ? 'window' : cls;
    const bar = chrome ? 44 : 0;
    this.bar = bar;
    Object.assign(this.box.style, { left: `${x}px`, top: `${y - bar}px`, width: `${vw}px`, height: `${vh + bar}px`, borderRadius: radius ? `${radius}px` : '' });
    if (chrome) this.box.innerHTML = '<div class="window__bar"><i></i><i></i><i></i><span class="window__url"><svg width="12" height="14" viewBox="0 0 12 14" aria-hidden="true"><path d="M3 6V4a3 3 0 0 1 6 0v2" fill="none" stroke="#5B6A5D" stroke-width="1.6"/><rect x="1" y="6" width="10" height="7" rx="2" fill="#5B6A5D"/></svg><b>batatalk.com.br</b></span></div>';
    this.iframe = document.createElement('iframe');
    Object.assign(this.iframe.style, { left: '0px', top: `${bar}px`, width: `${vw}px`, height: `${vh}px` });
    this.iframe.setAttribute('scrolling', 'no');
    // O recorte arredondado do contêiner (overflow + border-radius) às vezes não pega no iframe
    // composto quando a escala do mundo muda muito: saíam cantos pretos nas portas e no cartão.
    // O próprio iframe recorta o seu conteúdo no mesmo formato.
    const r = radius ? `${radius}px` : '0px';
    this.iframe.style.clipPath = clip || (chrome ? `inset(0 round 0 0 ${r} ${r})` : `inset(0 round ${r})`);
    this.iframe.src = `./stage.html?ci=${ci}&pi=${pi}&turn=${turn}`;
    this.box.append(this.iframe);
    parent.append(this.box);
  }
  async ready() {
    if (!this.iframe.contentWindow?.__stageReady) await new Promise((r) => this.iframe.addEventListener('load', r, { once: true }));
    this.info = await this.iframe.contentWindow.__stageReady;
    this.api = this.iframe.contentWindow.__stage;
    return this.info;
  }
  frame(d) { this.api?.frame(d); }
  rect(sel) { return this.api?.rect(sel); }
  show(v) { this.box.style.visibility = v ? 'visible' : 'hidden'; }
}
