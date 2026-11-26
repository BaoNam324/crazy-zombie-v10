import Phaser from 'phaser';
import { sfx } from '../audio/SoundFX';
import { getSettings, updateSettings } from '../services/settingsStore';

export interface ArcadeButtonHandle {
  container: Phaser.GameObjects.Container;
  setActive: (active: boolean) => void;
  setLabel: (text: string) => void;
}

export class ArcadeUI {
  static drawMetalPanel(
    scene: Phaser.Scene,
    x: number,
    y: number,
    w: number,
    h: number,
    borderColor = 0xd4af37,
    fillTop = 0x1b202b,
    fillBot = 0x0b0e14
  ): Phaser.GameObjects.Graphics {
    const g = scene.add.graphics();
    const lx = x - w / 2;
    const ty = y - h / 2;
    g.fillStyle(0x000000, 0.65);
    g.fillRect(lx + 4, ty + 4, w, h);
    g.fillGradientStyle(fillTop, fillTop, fillBot, fillBot, 0.96);
    g.fillRect(lx, ty, w, h);
    g.fillStyle(0xffffff, 0.08);
    g.fillRect(lx + 3, ty + 3, w - 6, Math.min(18, h * 0.25));
    g.lineStyle(2, borderColor, 0.95);
    g.strokeRect(lx, ty, w, h);
    g.lineStyle(1, 0x475569, 0.85);
    g.strokeRect(lx + 4, ty + 4, w - 8, h - 8);
    const rOff = 8;
    g.fillStyle(borderColor, 0.85);
    for (const [rx, ry] of [[lx + rOff, ty + rOff], [lx + w - rOff, ty + rOff], [lx + rOff, ty + h - rOff], [lx + w - rOff, ty + h - rOff]]) {
      g.fillCircle(rx, ry, 2.2);
    }
    return g;
  }

  static createArcadeButton(
    scene: Phaser.Scene,
    x: number,
    y: number,
    w: number,
    h: number,
    label: string,
    onClick: () => void,
    options?: { accent?: number; fontSize?: string; isPrimary?: boolean }
  ): ArcadeButtonHandle {
    const accent = options?.accent ?? 0xd4af37;
    const isPrimary = options?.isPrimary ?? false;
    const cont = scene.add.container(x, y);
    const gfx = scene.add.graphics();
    let isActive = false;
    let isHover = false;

    const redraw = () => {
      gfx.clear();
      const lx = -w / 2;
      const ty = -h / 2;
      if (isPrimary) {
        const cTop = isHover ? 0xff6b47 : 0xdc2626;
        const cBot = isHover ? 0xc2251d : 0x7f1d1d;
        gfx.fillGradientStyle(cTop, cTop, cBot, cBot, 1);
        gfx.fillRect(lx, ty, w, h);
        gfx.fillStyle(0xffffff, isHover ? 0.22 : 0.12);
        gfx.fillRect(lx + 2, ty + 2, w - 4, h * 0.36);
        gfx.lineStyle(2.5, 0xfacc15, 1);
        gfx.strokeRect(lx, ty, w, h);
        gfx.lineStyle(1, 0xffffff, 0.55);
        gfx.strokeRect(lx + 3, ty + 3, w - 6, h - 6);
      } else {
        const topCol = isActive ? 0x2d181a : isHover ? 0x262e3d : 0x1b202b;
        const botCol = isActive ? 0x140a0d : isHover ? 0x141923 : 0x0d1017;
        gfx.fillGradientStyle(topCol, topCol, botCol, botCol, 0.96);
        gfx.fillRect(lx, ty, w, h);
        gfx.fillStyle(0xffffff, isHover || isActive ? 0.12 : 0.05);
        gfx.fillRect(lx + 2, ty + 2, w - 4, h * 0.34);
        const border = isActive ? accent : isHover ? 0xfacc15 : 0x475569;
        gfx.lineStyle(isActive ? 2.5 : 1.8, border, 0.96);
        gfx.strokeRect(lx, ty, w, h);
        if (isActive) {
          gfx.fillStyle(accent, 1);
          gfx.fillRect(lx + 2, ty + 4, 4, h - 8);
        }
      }
    };

    const txt = scene.add.text(0, 0, label, {
      fontFamily: isPrimary ? 'Impact, system-ui, sans-serif' : 'monospace',
      fontSize: options?.fontSize ?? (isPrimary ? '21px' : '12px'),
      fontStyle: isPrimary ? 'normal' : 'bold',
      color: isPrimary ? '#ffffff' : '#f8fafc',
      stroke: '#000000',
      strokeThickness: isPrimary ? 4 : 2,
    }).setOrigin(0.5);

    const hit = scene.add.rectangle(0, 0, w, h, 0x000000, 0).setInteractive({ useHandCursor: true });
    hit.on('pointerover', () => { isHover = true; redraw(); });
    hit.on('pointerout', () => { isHover = false; redraw(); });
    hit.on('pointerdown', () => { sfx.unlock(); sfx.pickup(); onClick(); });

    cont.add([gfx, txt, hit]);
    redraw();

    return {
      container: cont,
      setActive: (active: boolean) => { isActive = active; txt.setColor(active ? '#facc15' : '#f8fafc'); redraw(); },
      setLabel: (text: string) => { txt.setText(text); },
    };
  }

  static openSettingsModal(
    scene: Phaser.Scene,
    onClose: () => void,
    onSettingsChanged?: () => void
  ): Phaser.GameObjects.Container {
    const cont = scene.add.container(640, 360).setDepth(9920);
    const scrim = scene.add.rectangle(0, 0, 1280, 720, 0x05070c, 0.86).setInteractive();
    const panel = ArcadeUI.drawMetalPanel(scene, 0, 0, 760, 520, 0xd4af37, 0x1e2430, 0x0a0d13);
    const headerBand = scene.add.rectangle(0, -225, 750, 52, 0x7f1d1d, 0.85);
    const title = scene.add.text(0, -225, '⚙ CÀI ĐẶT HỆ THỐNG · CRAZY ZOMBIE 10.0', {
      fontFamily: 'Impact, system-ui', fontSize: '26px', color: '#facc15', stroke: '#000000', strokeThickness: 5,
    }).setOrigin(0.5);
    cont.add([scrim, panel, headerBand, title]);

    const volSteps = [0, 0.25, 0.5, 0.75, 1];
    const rowY = [-145, -88, -31, 26, 83];

    const makeRow = (y: number, label: string, getVal: () => string, onToggle: () => void) => {
      const lbl = scene.add.text(-330, y, label, { fontFamily: 'monospace', fontSize: '14px', fontStyle: 'bold', color: '#e2e8f0' }).setOrigin(0, 0.5);
      const btn = ArcadeUI.createArcadeButton(scene, 195, y, 250, 38, getVal(), () => {
        onToggle();
        sfx.syncBgmVolume();
        btn.setLabel(getVal());
        onSettingsChanged?.();
      }, { accent: 0xff5733, fontSize: '13px' });
      btn.setActive(true);
      cont.add([lbl, btn.container]);
    };

    makeRow(rowY[0], '1. ÂM LƯỢNG HIỆU ỨNG (SFX)', () => `${Math.round(getSettings().sfxVolume * 100)}% [CLICK ĐỔI]`, () => {
      const cur = getSettings().sfxVolume;
      const idx = volSteps.findIndex(v => Math.abs(v - cur) < 0.05);
      const next = volSteps[(idx + 1) % volSteps.length];
      updateSettings({ sfxVolume: next, muted: next === 0 });
    });
    makeRow(rowY[1], '2. TRẠNG THÁI ÂM THANH (M)', () => (getSettings().muted ? 'ĐANG TẮT (MUTE)' : 'ĐANG BẬT (ON)'), () => { updateSettings({ muted: !getSettings().muted }); });
    makeRow(rowY[2], '3. RUNG MÀN HÌNH (SCREEN SHAKE)', () => (getSettings().screenShake ? 'BẬT — ĐÃ TAY ARCADE' : 'TẮT — ỔN ĐỊNH'), () => { updateSettings({ screenShake: !getSettings().screenShake }); });
    makeRow(rowY[3], '4. ĐỒ HỌA MƯA & ÁNH SÁNG ĐƯỜNG ƯỚT', () => (getSettings().highVfx ? 'CAO (CHUẨN v10.0)' : 'HIỆU NĂNG (TỐI ƯU FPS)'), () => { updateSettings({ highVfx: !getSettings().highVfx }); });
    makeRow(rowY[4], '5. HIỂN THỊ HITBOX / FRAME DATA (F2)', () => (getSettings().defaultHitbox ? 'MẶC ĐỊNH BẬT' : 'MẶC ĐỊNH TẮT'), () => { updateSettings({ defaultHitbox: !getSettings().defaultHitbox }); });

    const ctrlBox = scene.add.rectangle(0, 152, 680, 62, 0x0b0e14, 0.9).setStrokeStyle(1.5, 0x475569);
    const ctrlText = scene.add.text(0, 152,
      'PHÍM TẮT PC: WASD Di chuyển | J×4 Combo | K Nhảy | L Parry | U / I / S+U Kỹ năng\nH Overdrive/Bankai/SSJ | O Ultimate | Q Đổi Tướng | E Assist | P Team Ult | ESC Tạm dừng',
      { fontFamily: 'monospace', fontSize: '11.5px', color: '#94a3b8', align: 'center', lineSpacing: 5 }
    ).setOrigin(0.5);

    const closeBtn = ArcadeUI.createArcadeButton(scene, 0, 220, 260, 44, 'LƯU & ĐÓNG [ESC]', () => { cont.destroy(); onClose(); }, { isPrimary: true, fontSize: '17px' });
    scrim.on('pointerdown', () => { cont.destroy(); onClose(); });
    cont.add([ctrlBox, ctrlText, closeBtn.container]);
    return cont;
  }
}
