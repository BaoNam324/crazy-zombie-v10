import Phaser from 'phaser';
import { CHARACTERS } from '../data/characters';
import { PaletteConfig } from '../types/game';

export class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  preload(): void {
    this.load.image('ui_status', 'assets/ui/bmd_status.png');
    this.load.image('ui_bossbg', 'assets/ui/bmd_bossbg.png');
    this.load.image('ui_wave_boss', 'assets/ui/wave_bossen.png');
    this.load.image('ui_wave_enemy', 'assets/ui/wave_enemyen.png');
    this.load.image('ui_talk_bg', 'assets/ui/talk_bg.png');
    this.load.image('ui_story_bg', 'assets/ui/bmd_story_bg.png');

    for (const hero of CHARACTERS) {
      this.load.image(`portrait_${hero.id}`, `assets/portraits/${hero.id}_img.png`);
      this.load.image(`icon_${hero.id}`, `assets/portraits/${hero.id}_ico.png`);
    }

    this.load.image('stage_bg_0', 'assets/stages/bmd_b_0.png');
    this.load.image('stage_bg_6', 'assets/stages/bmd_b_6.png');
    this.load.image('stage_land_0', 'assets/stages/bmd_l_0.png');
    this.load.image('stage_mid_1', 'assets/stages/bmd_m_1.png');
    this.load.image('stage_mid_5', 'assets/stages/bmd_m_5.png');
    this.load.image('stage_mid_9', 'assets/stages/bmd_m_9.png');
    this.load.image('stage_cloud', 'assets/stages/bmd_cloud.png');

    this.load.image('prop_crate', 'assets/items/crate.png');
    this.load.image('item_hp', 'assets/items/item0.png');
    this.load.image('item_mp', 'assets/items/item3.png');
    this.load.image('item_rage', 'assets/items/item6.png');
  }

  create(): void {
    this.ensureFallbackTextures();

    for (const hero of CHARACTERS) {
      hero.palettes.forEach((pal, idx) => {
        this.generateArticulatedSheet(`hero_${hero.id}_${idx}`, pal, hero.weaponStyle);
      });
    }

    this.generateArticulatedSheet('enemy_zombie', { name: 'Zombie', primary: '#3f6212', secondary: '#1c1917', accent: '#84cc16', vfx: '#a3e635' }, 'martial');
    this.generateArticulatedSheet('enemy_runner', { name: 'Runner', primary: '#7f1d1d', secondary: '#18181b', accent: '#ef4444', vfx: '#f87171' }, 'flame-claw');
    this.generateArticulatedSheet('enemy_raider', { name: 'Raider', primary: '#475569', secondary: '#0f172a', accent: '#f59e0b', vfx: '#fbbf24' }, 'saber');
    this.generateArticulatedSheet('enemy_boss', { name: 'Boss', primary: '#4c1d95', secondary: '#09090b', accent: '#ff5733', vfx: '#ff5733' }, 'greatsword');

    this.generateStoryCreatureSheet('enemy_rift_crawler', 'rift_crawler');
    this.generateStoryCreatureSheet('enemy_riot_brute', 'riot_brute');
    this.generateStoryCreatureSheet('enemy_syndicate_gunner', 'syndicate_gunner');
    this.generateStoryCreatureSheet('enemy_serum_stalker', 'serum_stalker');
    this.generateStoryCreatureSheet('enemy_void_acolyte', 'void_acolyte');
    this.generateStoryCreatureSheet('enemy_chrono_sentinel', 'chrono_sentinel');

    this.generateStoryCreatureSheet('enemy_boss_plague_warden', 'boss_plague_warden');
    this.generateStoryCreatureSheet('enemy_boss_iron_vanguard', 'boss_iron_vanguard');
    this.generateStoryCreatureSheet('enemy_boss_chimera_alpha', 'boss_chimera_alpha');
    this.generateStoryCreatureSheet('enemy_boss_eclipse_archon', 'boss_eclipse_archon');
    this.generateStoryCreatureSheet('enemy_boss_zeropoint', 'boss_zeropoint');

    this.scene.start('TitleSelectScene');
  }

  private ensureFallbackTextures(): void {
    // Stylized HD fallbacks when running standalone EXE without external PNG folder
    for (const hero of CHARACTERS) {
      const pal = hero.palettes[0];
      for (const [key, w, h] of [[`portrait_${hero.id}`, 220, 250], [`icon_${hero.id}`, 64, 64]] as const) {
        if (!this.textures.exists(key)) {
          const ct = this.textures.createCanvas(key, w, h);
          if (ct) {
            const ctx = ct.getContext();
            const grad = ctx.createLinearGradient(0, 0, 0, h);
            grad.addColorStop(0, pal.primary);
            grad.addColorStop(1, '#090b10');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);
            ctx.strokeStyle = pal.accent;
            ctx.lineWidth = 4;
            ctx.strokeRect(2, 2, w - 4, h - 4);
            ctx.fillStyle = pal.vfx;
            ctx.beginPath();
            ctx.arc(w / 2, h * 0.42, Math.min(w, h) * 0.24, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.font = `bold ${w > 100 ? 22 : 14}px monospace`;
            ctx.textAlign = 'center';
            ctx.fillText(hero.name.slice(0, w > 100 ? 12 : 4).toUpperCase(), w / 2, h * 0.85);
            ct.refresh();
          }
        }
      }
    }

    const simpleFallbacks: [string, number, number, string, string][] = [
      ['prop_crate', 120, 120, '#78350f', '#facc15'],
      ['item_hp', 32, 32, '#22c55e', '#ffffff'],
      ['item_mp', 32, 32, '#38bdf8', '#ffffff'],
      ['item_rage', 32, 32, '#facc15', '#ef4444'],
      ['ui_wave_boss', 420, 76, '#7f1d1d', '#facc15'],
      ['ui_bossbg', 700, 40, '#1e293b', '#ff5733'],
      ['ui_status', 370, 62, '#1e293b', '#d4af37'],
    ];
    for (const [k, w, h, c1, c2] of simpleFallbacks) {
      if (!this.textures.exists(k)) {
        const ct = this.textures.createCanvas(k, w, h);
        if (ct) {
          const ctx = ct.getContext();
          ctx.fillStyle = c1; ctx.fillRect(0, 0, w, h);
          ctx.strokeStyle = c2; ctx.lineWidth = 4; ctx.strokeRect(2, 2, w - 4, h - 4);
          if (k === 'ui_wave_boss') {
            ctx.fillStyle = '#facc15'; ctx.font = 'bold 34px Impact, sans-serif'; ctx.textAlign = 'center';
            ctx.fillText('WARNING · BOSS APPROACH!', w / 2, 50);
          }
          ct.refresh();
        }
      }
    }
  }

  private generateStoryCreatureSheet(key: string, kind: string): void {
    if (this.textures.exists(key)) return;
    const fw = 120, fh = 100, frames = 12;
    const canvasTex = this.textures.createCanvas(key, fw * frames, fh);
    if (!canvasTex) return;
    const ctx = canvasTex.getContext();

    for (let f = 0; f < frames; f++) {
      const ox = f * fw + 60, oy = fh - 4;
      const breathe = f === 1 ? -2.5 : 0;
      const runPhase = [0, 0, -11, -3, 11, 3][f] ?? 0;
      const isWindup = f === 7, isStrike = f === 8 || f === 9, isHurt = f === 11;
      const lean = (f >= 2 && f <= 5) ? 7 : isWindup ? -10 : isStrike ? 13 : isHurt ? -12 : 0;
      ctx.save();

      if (kind === 'rift_crawler') {
        ctx.fillStyle = '#1e1b4b'; ctx.fillRect(ox - 12 + runPhase * 0.5, oy - 22, 8, 22); ctx.fillRect(ox + 4 - runPhase * 0.5, oy - 22, 8, 22);
        ctx.fillStyle = '#312e81'; ctx.beginPath(); ctx.ellipse(ox + lean * 0.4, oy - 40 + breathe, 18, 15, 0.25, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#a855f7'; ctx.beginPath(); ctx.moveTo(ox - 12, oy - 48); ctx.lineTo(ox - 20, oy - 64); ctx.lineTo(ox - 4, oy - 52); ctx.fill();
        ctx.fillStyle = '#22d3ee'; ctx.beginPath(); ctx.arc(ox + 12 + lean * 0.5, oy - 48 + breathe, 9, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#facc15'; ctx.fillRect(ox + 14 + lean * 0.5, oy - 50 + breathe, 5, 3);
        ctx.strokeStyle = isStrike ? '#e879f9' : '#38bdf8'; ctx.lineWidth = 4;
        const reach = isStrike ? 46 : 24;
        ctx.beginPath(); ctx.moveTo(ox + 10, oy - 40); ctx.lineTo(ox + reach, oy - 48); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(ox + 10, oy - 34); ctx.lineTo(ox + reach - 4, oy - 30); ctx.stroke();
      } else if (kind === 'riot_brute') {
        ctx.fillStyle = '#1e293b'; ctx.fillRect(ox - 15 + runPhase * 0.4, oy - 30, 12, 30); ctx.fillRect(ox + 4 - runPhase * 0.4, oy - 30, 12, 30);
        ctx.fillStyle = '#334155'; ctx.fillRect(ox - 20 + lean * 0.3, oy - 68 + breathe, 40, 40);
        ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.arc(ox + lean * 0.4, oy - 78 + breathe, 13, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ef4444'; ctx.fillRect(ox + 2 + lean * 0.4, oy - 81 + breathe, 10, 4);
        const sx = ox + (isStrike ? 26 : 16);
        ctx.fillStyle = '#475569'; ctx.fillRect(sx, oy - 74 + breathe, 14, 56);
        ctx.strokeStyle = '#facc15'; ctx.lineWidth = 2; ctx.strokeRect(sx, oy - 74 + breathe, 14, 56);
        ctx.fillStyle = '#ef4444'; ctx.fillRect(sx + 3, oy - 58 + breathe, 8, 14);
      } else if (kind === 'syndicate_gunner') {
        ctx.fillStyle = '#0f172a'; ctx.fillRect(ox - 10 + runPhase * 0.6, oy - 30, 8, 30); ctx.fillRect(ox + 3 - runPhase * 0.6, oy - 30, 8, 30);
        ctx.fillStyle = '#1f2937'; ctx.fillRect(ox - 13 + lean * 0.4, oy - 62 + breathe, 26, 34);
        ctx.fillStyle = '#f59e0b'; ctx.fillRect(ox - 13 + lean * 0.4, oy - 48 + breathe, 26, 5);
        ctx.fillStyle = '#111827'; ctx.beginPath(); ctx.arc(ox + lean * 0.5, oy - 74 + breathe, 10.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ff3b30'; ctx.fillRect(ox + 2 + lean * 0.5, oy - 77 + breathe, 9, 4);
        ctx.fillStyle = '#334155'; ctx.fillRect(ox + 4, oy - 54 + breathe, isStrike ? 40 : 32, 8);
        ctx.fillStyle = isStrike ? '#38bdf8' : '#facc15'; ctx.fillRect(ox + (isStrike ? 40 : 32), oy - 54 + breathe, 8, 8);
      } else if (kind === 'serum_stalker') {
        ctx.fillStyle = '#064e3b'; ctx.fillRect(ox - 10 + runPhase * 0.8, oy - 32, 7, 32); ctx.fillRect(ox + 4 - runPhase * 0.8, oy - 32, 7, 32);
        ctx.fillStyle = '#065f46'; ctx.fillRect(ox - 11 + lean * 0.5, oy - 62 + breathe, 22, 32);
        ctx.fillStyle = '#34d399'; ctx.fillRect(ox - 20 + lean * 0.4, oy - 64 + breathe, 8, 22);
        ctx.fillStyle = '#a7f3d0'; ctx.beginPath(); ctx.arc(ox + lean * 0.6, oy - 74 + breathe, 9.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#10b981'; ctx.fillRect(ox + 3 + lean * 0.6, oy - 76 + breathe, 5, 3);
        ctx.strokeStyle = '#34d399'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(ox + 8, oy - 50); ctx.lineTo(ox + (isStrike ? 48 : 26), oy - 62); ctx.stroke();
      } else if (kind === 'void_acolyte') {
        ctx.translate(0, -10 + Math.sin(f * 0.9) * 3);
        ctx.fillStyle = '#2e1065'; ctx.beginPath(); ctx.moveTo(ox, oy - 78); ctx.lineTo(ox - 18, oy - 14); ctx.lineTo(ox + 18, oy - 14); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#c084fc'; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = '#09090b'; ctx.beginPath(); ctx.arc(ox, oy - 70, 10, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#e879f9'; ctx.fillRect(ox + 2, oy - 72, 6, 3);
        ctx.fillStyle = isStrike ? '#f0abfc' : '#a855f7'; ctx.beginPath(); ctx.arc(ox + (isStrike ? 38 : 22), oy - 52, isStrike ? 11 : 7, 0, Math.PI * 2); ctx.fill();
      } else if (kind === 'chrono_sentinel') {
        ctx.fillStyle = '#1e293b'; ctx.fillRect(ox - 11 + runPhase * 0.6, oy - 30, 9, 30); ctx.fillRect(ox + 3 - runPhase * 0.6, oy - 30, 9, 30);
        ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.moveTo(ox - 10, oy - 58); ctx.lineTo(ox - 34, oy - 82); ctx.lineTo(ox - 24, oy - 48); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#f8fafc'; ctx.fillRect(ox - 14 + lean * 0.4, oy - 64 + breathe, 28, 36);
        ctx.fillStyle = '#ef4444'; ctx.fillRect(ox - 6 + lean * 0.4, oy - 56 + breathe, 12, 12);
        ctx.fillStyle = '#e2e8f0'; ctx.beginPath(); ctx.arc(ox + lean * 0.5, oy - 76 + breathe, 11, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#22d3ee'; ctx.fillRect(ox + 2 + lean * 0.5, oy - 79 + breathe, 9, 4);
        ctx.strokeStyle = '#ff5733'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(ox + 10, oy - 52); ctx.lineTo(ox + (isStrike ? 54 : 30), oy - 66); ctx.stroke();
      } else if (kind === 'boss_plague_warden') {
        ctx.fillStyle = '#1c1917'; ctx.fillRect(ox - 18 + runPhase * 0.4, oy - 32, 14, 32); ctx.fillRect(ox + 5 - runPhase * 0.4, oy - 32, 14, 32);
        ctx.fillStyle = '#365314'; ctx.fillRect(ox - 24 + lean * 0.3, oy - 74 + breathe, 48, 44);
        ctx.fillStyle = '#84cc16'; ctx.fillRect(ox - 22 + lean * 0.3, oy - 56 + breathe, 44, 6);
        ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.arc(ox + lean * 0.4, oy - 84 + breathe, 14, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#a3e635'; ctx.fillRect(ox + 2 + lean * 0.4, oy - 88 + breathe, 10, 5);
        const fx = ox + (isStrike ? 50 : isWindup ? -34 : 30), fy = oy - (isStrike ? 46 : 74);
        ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(ox + 12, oy - 56); ctx.lineTo(fx, fy); ctx.stroke();
        ctx.fillStyle = '#84cc16'; ctx.beginPath(); ctx.arc(fx, fy, 13, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#ecfccb'; ctx.lineWidth = 2; ctx.stroke();
      } else if (kind === 'boss_iron_vanguard') {
        ctx.fillStyle = '#18181b'; ctx.fillRect(ox - 18 + runPhase * 0.4, oy - 32, 14, 32); ctx.fillRect(ox + 5 - runPhase * 0.4, oy - 32, 14, 32);
        ctx.fillStyle = '#7f1d1d'; ctx.fillRect(ox - 25 + lean * 0.3, oy - 76 + breathe, 50, 46);
        ctx.strokeStyle = '#facc15'; ctx.lineWidth = 3; ctx.strokeRect(ox - 25 + lean * 0.3, oy - 76 + breathe, 50, 46);
        ctx.fillStyle = '#334155'; ctx.fillRect(ox - 14, oy - 90 + breathe, 38, 12);
        ctx.fillStyle = '#38bdf8'; ctx.fillRect(ox + 22, oy - 89 + breathe, 8, 10);
        ctx.fillStyle = '#09090b'; ctx.fillRect(ox - 10 + lean * 0.4, oy - 86 + breathe, 22, 14);
        ctx.fillStyle = '#facc15'; ctx.fillRect(ox + 1 + lean * 0.4, oy - 82 + breathe, 11, 4);
        ctx.strokeStyle = '#f97316'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(ox + 14, oy - 56); ctx.lineTo(ox + (isStrike ? 54 : 34), oy - (isStrike ? 42 : 74)); ctx.stroke();
      } else if (kind === 'boss_chimera_alpha') {
        ctx.fillStyle = '#064e3b'; ctx.fillRect(ox - 15 + runPhase * 0.6, oy - 32, 11, 32); ctx.fillRect(ox + 5 - runPhase * 0.6, oy - 32, 11, 32);
        ctx.fillStyle = '#115e59'; ctx.fillRect(ox - 20 + lean * 0.4, oy - 72 + breathe, 40, 42);
        ctx.fillStyle = '#c084fc'; ctx.beginPath(); ctx.arc(ox + lean * 0.4, oy - 54 + breathe, 9, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#042f2e'; ctx.beginPath(); ctx.arc(ox + lean * 0.5, oy - 82 + breathe, 12, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#34d399'; ctx.fillRect(ox + 2 + lean * 0.5, oy - 85 + breathe, 9, 4);
        const reach = isStrike ? 54 : 32;
        ctx.strokeStyle = '#34d399'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(ox + 12, oy - 64); ctx.lineTo(ox + reach, oy - 76); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(ox + 12, oy - 52); ctx.lineTo(ox + reach + 4, oy - 48); ctx.stroke();
        ctx.strokeStyle = '#c084fc';
        ctx.beginPath(); ctx.moveTo(ox - 12, oy - 66); ctx.lineTo(ox - 34, oy - 86); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(ox - 12, oy - 52); ctx.lineTo(ox - 30, oy - 36); ctx.stroke();
      } else if (kind === 'boss_eclipse_archon') {
        ctx.translate(0, -8 + Math.sin(f * 0.8) * 3);
        ctx.fillStyle = '#1e1b4b'; ctx.beginPath(); ctx.moveTo(ox, oy - 82); ctx.lineTo(ox - 24, oy - 10); ctx.lineTo(ox + 24, oy - 10); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#facc15'; ctx.lineWidth = 2.5; ctx.stroke();
        ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.arc(ox + lean * 0.3, oy - 78, 12, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#09090b'; ctx.beginPath(); ctx.arc(ox + 4 + lean * 0.3, oy - 78, 8, 0, Math.PI * 2); ctx.fill();
        const sx = ox + (isStrike ? 52 : isWindup ? -30 : 34);
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(ox - 10, oy - 30); ctx.lineTo(sx, oy - 84); ctx.stroke();
        ctx.strokeStyle = '#c084fc'; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(sx, oy - 76, 22, -1.3, 0.9); ctx.stroke();
      } else {
        ctx.translate(0, -6 + Math.sin(f * 0.7) * 2.5);
        ctx.strokeStyle = '#facc15'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(ox, oy - 62, 34, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = '#ff5733'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(ox, oy - 62, 27, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = '#09090b'; ctx.fillRect(ox - 16, oy - 30, 12, 28); ctx.fillRect(ox + 4, oy - 30, 12, 28);
        ctx.fillStyle = '#18181b'; ctx.fillRect(ox - 24 + lean * 0.3, oy - 76, 48, 48);
        ctx.strokeStyle = '#facc15'; ctx.lineWidth = 2.5; ctx.strokeRect(ox - 24 + lean * 0.3, oy - 76, 48, 48);
        ctx.fillStyle = '#ff5733'; ctx.beginPath(); ctx.arc(ox + lean * 0.3, oy - 54, 10, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(ox + lean * 0.3, oy - 54, 4.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.moveTo(ox - 12, oy - 78); ctx.lineTo(ox - 14, oy - 95); ctx.lineTo(ox, oy - 86); ctx.lineTo(ox + 14, oy - 95); ctx.lineTo(ox + 12, oy - 78); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = isStrike ? '#ff5733' : '#facc15'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(ox + 16, oy - 54); ctx.lineTo(ox + (isStrike ? 58 : 38), oy - (isStrike ? 44 : 78)); ctx.stroke();
      }

      ctx.restore();
      canvasTex.add(f, 0, f * fw, 0, fw, fh);
    }
    canvasTex.refresh();
  }

  private generateArticulatedSheet(key: string, pal: PaletteConfig, weapon: string): void {
    if (this.textures.exists(key)) return;
    const fw = 120, fh = 100, frames = 12;
    const canvasTex = this.textures.createCanvas(key, fw * frames, fh);
    if (!canvasTex) return;
    const ctx = canvasTex.getContext();

    for (let f = 0; f < frames; f++) {
      const ox = f * fw + 60, oy = fh - 4;
      const breathe = f === 1 ? -2 : 0;
      const hover = weapon === 'sorcerer' && f <= 5 ? -5 + (f % 2) * 2 : 0;
      const lean = f >= 2 && f <= 5 ? 8 : f === 7 ? -9 : f === 8 ? 14 : f === 9 ? 6 : f === 11 ? -12 : 0;
      const runPhase = [0, 0, -12, -4, 12, 4][f] ?? 0;

      ctx.save();
      ctx.translate(0, hover);
      ctx.fillStyle = pal.accent;
      const capeWave = (f >= 2 && f <= 5) ? -22 - (f % 2) * 8 : f === 8 ? -26 : -12;
      ctx.beginPath(); ctx.moveTo(ox - 10 + lean * 0.3, oy - 60 + breathe); ctx.lineTo(ox + capeWave, oy - 36 + (f % 2) * 4); ctx.lineTo(ox - 6, oy - 32); ctx.closePath(); ctx.fill();

      ctx.fillStyle = pal.secondary;
      if (f === 6) { ctx.fillRect(ox - 12, oy - 34, 10, 20); ctx.fillRect(ox + 2, oy - 30, 10, 18); }
      else { ctx.fillRect(ox - 11 + runPhase * 0.6, oy - 30, 9, 30); ctx.fillRect(ox + 3 - runPhase * 0.6, oy - 30, 9, 30); }

      ctx.fillStyle = pal.primary; ctx.fillRect(ox - 15 + lean * 0.4, oy - 64 + breathe, 30, 36);
      ctx.fillStyle = pal.accent; ctx.fillRect(ox - 15 + lean * 0.4, oy - 39 + breathe, 30, 6);

      const hx = ox + lean * 0.65, hy = oy - 76 + breathe;
      ctx.fillStyle = '#f2d3b8'; ctx.beginPath(); ctx.arc(hx, hy, 11.5, 0, Math.PI * 2); ctx.fill();

      if (weapon === 'sorcerer') {
        ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.moveTo(hx - 12, hy - 5); ctx.lineTo(hx - 8, hy - 18); ctx.lineTo(hx, hy - 13); ctx.lineTo(hx + 6, hy - 20); ctx.lineTo(hx + 13, hy - 6); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#09090b'; ctx.fillRect(hx - 11, hy - 4, 22, 6);
      } else if (weapon === 'three-swords') {
        ctx.fillStyle = '#14532d'; ctx.fillRect(hx - 12, hy - 13, 24, 9);
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(hx - 16, hy + 4); ctx.lineTo(hx + 28, hy + 2); ctx.stroke();
      } else if (weapon === 'martial') {
        ctx.fillStyle = pal.accent; ctx.beginPath(); ctx.moveTo(hx - 14, hy - 4); ctx.lineTo(hx - 10, hy - 19); ctx.lineTo(hx - 2, hy - 13); ctx.lineTo(hx + 4, hy - 21); ctx.lineTo(hx + 14, hy - 6); ctx.closePath(); ctx.fill();
      } else {
        ctx.fillStyle = pal.secondary; ctx.fillRect(hx - 12, hy - 13, 24, 9);
      }

      if (f === 7) {
        ctx.strokeStyle = pal.vfx; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(ox - 4, oy - 54); ctx.lineTo(ox - 34, oy - 72); ctx.stroke();
      } else if (f === 8) {
        ctx.strokeStyle = pal.vfx; ctx.lineWidth = weapon === 'greatsword' ? 9 : 5; ctx.beginPath(); ctx.moveTo(ox + 8, oy - 56); ctx.lineTo(ox + 56, oy - 64); ctx.stroke();
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(ox + 12, oy - 56); ctx.lineTo(ox + 54, oy - 63); ctx.stroke();
        if (weapon === 'three-swords') { ctx.strokeStyle = pal.vfx; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(ox + 8, oy - 40); ctx.lineTo(ox + 52, oy - 30); ctx.stroke(); }
        else if (weapon === 'sorcerer') { ctx.fillStyle = '#38bdf8'; ctx.beginPath(); ctx.arc(ox + 34, oy - 56, 9, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(ox - 18, oy - 52, 7, 0, Math.PI * 2); ctx.fill(); }
      } else if (f === 9) {
        ctx.strokeStyle = pal.vfx; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(ox + 10, oy - 38); ctx.lineTo(ox + 36, oy - 96); ctx.stroke();
      } else if (f === 10) {
        ctx.strokeStyle = '#facc15'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(ox + 16, oy - 50, 28, -1.1, 1.1); ctx.stroke();
      } else {
        ctx.strokeStyle = pal.accent; ctx.lineWidth = weapon === 'greatsword' ? 6 : 3; ctx.beginPath(); ctx.moveTo(ox + 8, oy - 48 + breathe); ctx.lineTo(ox + 32, oy - 66 + breathe); ctx.stroke();
      }

      ctx.restore();
      canvasTex.add(f, 0, f * fw, 0, fw, fh);
    }
    canvasTex.refresh();
  }
}
