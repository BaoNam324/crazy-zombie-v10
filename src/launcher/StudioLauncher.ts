declare global {
  interface Window {
    RufflePlayer?: {
      newest: () => {
        createPlayer: () => HTMLElement & {
          load: (opts: Record<string, unknown>) => Promise<void>;
          volume?: number;
        };
      };
    };
    cz10Electron?: {
      pickSwfFolder: () => Promise<string | null>;
    };
  }
}

type StudioTab = 'original' | 'expansion';
type FilterMode = 'sharp' | 'crt' | 'night';

export class StudioLauncher {
  private activeTab: StudioTab = 'original';
  private filterMode: FilterMode = 'sharp';
  private aspect43 = false;
  private barHidden = false;
  private gamepadEnabled = true;
  private ruffleLoaded = false;
  private expansionStarted = false;
  private readonly onStartExpansion: () => void;
  private prevPadState: Record<string, boolean> = {};

  constructor(onStartExpansion: () => void) {
    this.onStartExpansion = onStartExpansion;
    this.bindUI();
    this.startGamepadBridge();
    void this.bootOriginalSwf();
  }

  private bindUI(): void {
    const btnOrig = document.getElementById('tab-original')!;
    const btnExp = document.getElementById('tab-expansion')!;
    const btnFilter = document.getElementById('btn-filter')!;
    const btnAspect = document.getElementById('btn-aspect')!;
    const btnPad = document.getElementById('btn-gamepad')!;
    const btnPickSwf = document.getElementById('btn-pick-swf')!;
    const btnPickSwfFallback = document.getElementById('btn-pick-swf-fallback');
    const btnHide = document.getElementById('btn-hide-bar')!;
    const btnFull = document.getElementById('btn-fullscreen')!;

    btnOrig.addEventListener('click', () => this.switchTab('original'));
    btnExp.addEventListener('click', () => this.switchTab('expansion'));

    btnFilter.addEventListener('click', () => {
      const order: FilterMode[] = ['sharp', 'crt', 'night'];
      this.filterMode = order[(order.indexOf(this.filterMode) + 1) % order.length];
      this.applyDisplaySettings();
    });

    btnAspect.addEventListener('click', () => {
      this.aspect43 = !this.aspect43;
      this.applyDisplaySettings();
    });

    btnPad.addEventListener('click', () => {
      this.gamepadEnabled = !this.gamepadEnabled;
      btnPad.textContent = `🎮 TAY CẦM: ${this.gamepadEnabled ? 'BẬT' : 'TẮT'}`;
    });

    const handlePick = async () => {
      if (window.cz10Electron) {
        const chosen = await window.cz10Electron.pickSwfFolder();
        if (chosen) {
          this.ruffleLoaded = false;
          await this.bootOriginalSwf();
        }
      } else {
        alert('Đặt 3 tệp Mike.swf, lib.swf và snd.swf vào thư mục public/swf/ (hoặc thư mục swf/ cạnh file .exe) rồi tải lại!');
      }
    };
    btnPickSwf.addEventListener('click', () => { void handlePick(); });
    btnPickSwfFallback?.addEventListener('click', () => { void handlePick(); });

    btnHide.addEventListener('click', () => this.toggleBar());
    btnFull.addEventListener('click', () => {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {});
      else document.exitFullscreen?.().catch(() => {});
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'F1') {
        e.preventDefault();
        this.toggleBar();
      }
    });

    this.applyDisplaySettings();
  }

  private toggleBar(): void {
    this.barHidden = !this.barHidden;
    const bar = document.getElementById('studio-bar')!;
    bar.style.display = this.barHidden ? 'none' : 'flex';
  }

  private applyDisplaySettings(): void {
    const stage = document.getElementById('ruffle-stage')!;
    const scan = document.getElementById('crt-overlay')!;
    const btnFilter = document.getElementById('btn-filter')!;
    const btnAspect = document.getElementById('btn-aspect')!;

    stage.classList.remove('filter-sharp', 'filter-crt', 'filter-night', 'aspect-43');
    stage.classList.add(`filter-${this.filterMode}`);
    if (this.aspect43) stage.classList.add('aspect-43');
    scan.style.display = this.filterMode === 'crt' ? 'block' : 'none';

    const labels: Record<FilterMode, string> = {
      sharp: '✨ BỘ LỌC: SHARP HD',
      crt: '📺 BỘ LỌC: CRT ARCADE',
      night: '🌙 BỘ LỌC: ĐÊM TẬN THẾ',
    };
    btnFilter.textContent = labels[this.filterMode];
    btnAspect.textContent = this.aspect43 ? '📐 TỶ LỆ: 4:3 GỐC' : '📐 TỶ LỆ: 16:9 FULL';
  }

  private switchTab(tab: StudioTab): void {
    this.activeTab = tab;
    const origWrap = document.getElementById('ruffle-wrapper')!;
    const expWrap = document.getElementById('game-root')!;
    const btnOrig = document.getElementById('tab-original')!;
    const btnExp = document.getElementById('tab-expansion')!;

    btnOrig.classList.toggle('active', tab === 'original');
    btnExp.classList.toggle('active', tab === 'expansion');
    origWrap.style.display = tab === 'original' ? 'flex' : 'none';
    expWrap.style.display = tab === 'expansion' ? 'flex' : 'none';

    if (tab === 'expansion' && !this.expansionStarted) {
      this.expansionStarted = true;
      this.onStartExpansion();
    } else if (tab === 'original' && !this.ruffleLoaded) {
      void this.bootOriginalSwf();
    }
  }

  private async bootOriginalSwf(): Promise<void> {
    const stage = document.getElementById('ruffle-stage')!;
    const fallback = document.getElementById('swf-missing-card')!;

    try {
      const probe = await fetch('./swf/Mike.swf', { method: 'HEAD' });
      if (!probe.ok) throw new Error('Mike.swf not found');
    } catch {
      fallback.style.display = 'flex';
      return;
    }

    fallback.style.display = 'none';
    stage.innerHTML = '';

    const ruffle = window.RufflePlayer?.newest();
    if (!ruffle) {
      fallback.style.display = 'flex';
      return;
    }

    const player = ruffle.createPlayer();
    player.style.width = '100%';
    player.style.height = '100%';
    stage.appendChild(player);

    await player.load({
      url: './swf/Mike.swf',
      base: './swf/',
      autoplay: 'on',
      unmuteOverlay: 'hidden',
      backgroundColor: '#08090c',
      quality: 'best',
      scale: 'showAll',
      letterbox: 'on',
      warnOnUnsupportedContent: false,
      allowScriptAccess: true,
    });
    this.ruffleLoaded = true;
  }

  private startGamepadBridge(): void {
    const mapKey = (code: string, key: string, down: boolean) => {
      if (this.prevPadState[code] === down) return;
      this.prevPadState[code] = down;
      const ev = new KeyboardEvent(down ? 'keydown' : 'keyup', { key, code, bubbles: true });
      window.dispatchEvent(ev);
      document.activeElement?.dispatchEvent(ev);
    };

    const tick = () => {
      if (this.gamepadEnabled && this.activeTab === 'original') {
        const pads = navigator.getGamepads ? navigator.getGamepads() : [];
        const pad = pads[0];
        if (pad) {
          const ax = pad.axes[0] ?? 0;
          const ay = pad.axes[1] ?? 0;
          mapKey('KeyA', 'a', ax < -0.3 || Boolean(pad.buttons[14]?.pressed));
          mapKey('KeyD', 'd', ax > 0.3 || Boolean(pad.buttons[15]?.pressed));
          mapKey('KeyW', 'w', ay < -0.3 || Boolean(pad.buttons[12]?.pressed));
          mapKey('KeyS', 's', ay > 0.3 || Boolean(pad.buttons[13]?.pressed));
          mapKey('KeyJ', 'j', Boolean(pad.buttons[2]?.pressed));
          mapKey('KeyK', 'k', Boolean(pad.buttons[0]?.pressed));
          mapKey('KeyL', 'l', Boolean(pad.buttons[4]?.pressed));
          mapKey('KeyU', 'u', Boolean(pad.buttons[1]?.pressed));
          mapKey('KeyI', 'i', Boolean(pad.buttons[3]?.pressed));
          mapKey('KeyO', 'o', Boolean(pad.buttons[7]?.pressed));
        }
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
}
