import { getSettings, updateSettings } from '../services/settingsStore';

export class SoundFX {
  private ctx: AudioContext | null = null;
  private bgmEl: HTMLAudioElement | null = null;
  private currentBgmName = '';

  get muted(): boolean {
    return getSettings().muted;
  }

  set muted(v: boolean) {
    updateSettings({ muted: v });
    this.syncBgmVolume();
  }

  unlock(): void {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx?.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    this.syncBgmVolume();
    if (this.bgmEl && this.bgmEl.paused && !this.muted) {
      this.bgmEl.play().catch(() => {});
    }
  }

  syncBgmVolume(): void {
    if (!this.bgmEl) return;
    const st = getSettings();
    this.bgmEl.muted = st.muted;
    this.bgmEl.volume = Math.max(0, Math.min(1, st.sfxVolume * 0.55));
  }

  playBgm(trackName: string): void {
    if (this.currentBgmName === trackName && this.bgmEl) {
      this.syncBgmVolume();
      return;
    }
    this.stopBgm();
    this.currentBgmName = trackName;
    try {
      const el = new Audio(`assets/audio/${trackName}.mp3`);
      el.loop = true;
      this.bgmEl = el;
      this.syncBgmVolume();
      if (!getSettings().muted) {
        el.play().catch(() => {});
      }
    } catch { /* ignore autoplay restriction */ }
  }

  stopBgm(): void {
    if (this.bgmEl) {
      this.bgmEl.pause();
      this.bgmEl.currentTime = 0;
      this.bgmEl = null;
      this.currentBgmName = '';
    }
  }

  playClip(clipName: string, volScale = 0.85): void {
    const st = getSettings();
    if (st.muted || st.sfxVolume <= 0) return;
    try {
      const a = new Audio(`assets/audio/${clipName}.mp3`);
      a.volume = Math.max(0, Math.min(1, st.sfxVolume * volScale));
      a.play().catch(() => {});
    } catch { /* fallback silently */ }
  }

  toggleMute(): boolean {
    const next = !getSettings().muted;
    updateSettings({ muted: next });
    this.syncBgmVolume();
    return next;
  }

  private tone(freq: number, endFreq: number, dur: number, type: OscillatorType, vol = 0.16): void {
    const st = getSettings();
    if (st.muted || st.sfxVolume <= 0 || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + dur);
    gain.gain.setValueAtTime(vol * st.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + dur);
  }

  slash(): void { this.tone(540, 140, 0.09, 'sawtooth', 0.11); }
  hit(heavy = false): void { this.tone(heavy ? 180 : 260, 55, heavy ? 0.15 : 0.08, 'square', heavy ? 0.19 : 0.13); }
  parry(): void { this.tone(1180, 1760, 0.14, 'triangle', 0.2); }
  warning(): void { this.tone(680, 420, 0.28, 'sawtooth', 0.18); }
  superFreeze(): void { this.tone(140, 36, 0.42, 'sawtooth', 0.24); }
  pickup(): void { this.tone(620, 980, 0.12, 'sine', 0.15); }
}

export const sfx = new SoundFX();
