import Phaser from 'phaser';
import { CharacterModel } from '../combat/CharacterModel';

export interface HudPayload {
  player: CharacterModel;
  boss: CharacterModel | null;
  comboCount: number;
  score: number;
  stageLabel: string;
  subLabel?: string;
  inputHistory: string[];
  debugHitbox: boolean;
  isTraining?: boolean;
  dummyAggressive?: boolean;
  trialsDone?: string[];
}

export class HudScene extends Phaser.Scene {
  private iconImg!: Phaser.GameObjects.Image;
  private hpBar!: Phaser.GameObjects.Rectangle;
  private hpWhiteBar!: Phaser.GameObjects.Rectangle;
  private hpTrail!: Phaser.GameObjects.Rectangle;
  private mpBar!: Phaser.GameObjects.Rectangle;
  private rageBar!: Phaser.GameObjects.Rectangle;
  private playerLabel!: Phaser.GameObjects.Text;
  private passiveLabel!: Phaser.GameObjects.Text;
  private stageLabel!: Phaser.GameObjects.Text;
  private subLabel!: Phaser.GameObjects.Text;
  private scoreLabel!: Phaser.GameObjects.Text;
  private comboLabel!: Phaser.GameObjects.Text;
  private inputLogLabel!: Phaser.GameObjects.Text;
  private frameDataLabel!: Phaser.GameObjects.Text;
  private trialPanel!: Phaser.GameObjects.Text;
  private warnBanner!: Phaser.GameObjects.Image;

  private bossContainer!: Phaser.GameObjects.Container;
  private bossNameText!: Phaser.GameObjects.Text;
  private bossBarFill!: Phaser.GameObjects.Rectangle;
  private bossBarCount!: Phaser.GameObjects.Text;
  private staggerFill!: Phaser.GameObjects.Rectangle;
  private trailWidth = 274;

  constructor() { super('HudScene'); }

  create(): void {
    this.add.rectangle(218, 62, 412, 102, 0x0b0e14, 0.88).setStrokeStyle(2, 0xd4af37);
    if (this.textures.exists('ui_status')) {
      this.add.image(235, 62, 'ui_status').setDisplaySize(370, 62).setAlpha(0.32);
    }

    this.iconImg = this.add.image(48, 56, 'icon_ichigo').setDisplaySize(58, 60);
    this.playerLabel = this.add.text(88, 18, '', { fontFamily: 'monospace', fontSize: '14.5px', fontStyle: 'bold', color: '#ffffff' });

    this.add.rectangle(130, 50, 274, 16, 0x1e293b).setOrigin(0, 0.5);
    this.hpTrail = this.add.rectangle(130, 50, 274, 16, 0xef4444).setOrigin(0, 0.5);
    this.hpWhiteBar = this.add.rectangle(130, 50, 0, 16, 0xe2e8f0).setOrigin(0, 0.5);
    this.hpBar = this.add.rectangle(130, 50, 274, 16, 0x22c55e).setOrigin(0, 0.5);
    this.add.text(88, 42, 'HP', { fontFamily: 'monospace', fontSize: '12px', color: '#94a3b8' });

    this.add.rectangle(130, 70, 220, 10, 0x1e293b).setOrigin(0, 0.5);
    this.mpBar = this.add.rectangle(130, 70, 220, 10, 0x38bdf8).setOrigin(0, 0.5);
    this.add.text(88, 63, 'MP', { fontFamily: 'monospace', fontSize: '12px', color: '#94a3b8' });

    this.add.rectangle(130, 88, 220, 10, 0x1e293b).setOrigin(0, 0.5);
    this.rageBar = this.add.rectangle(130, 88, 0, 10, 0xfacc15).setOrigin(0, 0.5);
    this.add.text(88, 81, 'RAGE', { fontFamily: 'monospace', fontSize: '11px', color: '#facc15' });

    this.passiveLabel = this.add.text(20, 120, '', { fontFamily: 'monospace', fontSize: '13px', color: '#67e8f9', stroke: '#000', strokeThickness: 3 });
    this.stageLabel = this.add.text(640, 18, '', { fontFamily: 'monospace', fontSize: '16px', fontStyle: 'bold', color: '#f8fafc', stroke: '#000000', strokeThickness: 4 }).setOrigin(0.5, 0);
    this.subLabel = this.add.text(640, 40, '', { fontFamily: 'monospace', fontSize: '12px', color: '#facc15', stroke: '#000000', strokeThickness: 3 }).setOrigin(0.5, 0);
    this.scoreLabel = this.add.text(1256, 18, 'SCORE 0', { fontFamily: 'monospace', fontSize: '18px', fontStyle: 'bold', color: '#facc15', stroke: '#000', strokeThickness: 3 }).setOrigin(1, 0);
    this.comboLabel = this.add.text(1256, 48, '', { fontFamily: 'Impact, system-ui, sans-serif', fontSize: '44px', color: '#ff5733', stroke: '#000000', strokeThickness: 5 }).setOrigin(1, 0);

    this.inputLogLabel = this.add.text(20, 144, '', { fontFamily: 'monospace', fontSize: '12px', color: '#e2e8f0', stroke: '#000', strokeThickness: 3 });
    this.frameDataLabel = this.add.text(20, 164, '', { fontFamily: 'monospace', fontSize: '12px', color: '#facc15', stroke: '#000', strokeThickness: 3 });
    this.trialPanel = this.add.text(1256, 112, '', { fontFamily: 'monospace', fontSize: '12.5px', color: '#e2e8f0', align: 'right', backgroundColor: '#0b0e14cc', padding: { x: 10, y: 8 } }).setOrigin(1, 0).setVisible(false);

    this.warnBanner = this.add.image(640, 210, 'ui_wave_boss').setScale(1.25).setVisible(false);

    this.bossContainer = this.add.container(640, 670).setVisible(false);
    const bBg = this.add.rectangle(0, 0, 740, 60, 0x0b0e14, 0.92).setStrokeStyle(2, 0xd4af37);
    const bFrame = this.add.image(0, 4, 'ui_bossbg').setDisplaySize(710, 42).setAlpha(0.42);
    this.bossNameText = this.add.text(-350, -24, '', { fontFamily: 'monospace', fontSize: '14px', fontStyle: 'bold', color: '#ff947d' });
    this.bossBarCount = this.add.text(350, -24, 'x3', { fontFamily: 'monospace', fontSize: '15px', fontStyle: 'bold', color: '#facc15' }).setOrigin(1, 0);
    const barBack = this.add.rectangle(-350, 4, 700, 16, 0x1e293b).setOrigin(0, 0.5);
    this.bossBarFill = this.add.rectangle(-350, 4, 700, 16, 0xef4444).setOrigin(0, 0.5);
    const stagBack = this.add.rectangle(-350, 20, 700, 6, 0x1e293b).setOrigin(0, 0.5);
    this.staggerFill = this.add.rectangle(-350, 20, 0, 6, 0xfacc15).setOrigin(0, 0.5);
    this.bossContainer.add([bBg, bFrame, this.bossNameText, this.bossBarCount, barBack, this.bossBarFill, stagBack, this.staggerFill]);

    this.game.events.on('hud:update', this.onHudUpdate, this);
    this.game.events.on('hud:bossWarning', this.flashBossWarning, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.game.events.off('hud:update', this.onHudUpdate, this);
      this.game.events.off('hud:bossWarning', this.flashBossWarning, this);
    });
  }

  private flashBossWarning(): void {
    this.warnBanner.setVisible(true).setAlpha(1);
    this.tweens.add({ targets: this.warnBanner, alpha: 0.2, yoyo: true, repeat: 3, duration: 220, onComplete: () => this.warnBanner.setVisible(false) });
  }

  private onHudUpdate(p: HudPayload): void {
    const m = p.player;
    if (this.iconImg.texture.key !== `icon_${m.config.id}` && this.textures.exists(`icon_${m.config.id}`)) {
      this.iconImg.setTexture(`icon_${m.config.id}`).setDisplaySize(58, 60);
    }
    this.playerLabel.setText(`${m.config.name.toUpperCase()}  LIFE x${m.lives}`);
    const hpW = 274 * Phaser.Math.Clamp(m.hp / m.maxHp, 0, 1);
    const whiteW = 274 * Phaser.Math.Clamp((m.hp + m.whiteHp) / m.maxHp, 0, 1);
    this.hpBar.width = hpW;
    this.hpWhiteBar.width = whiteW;
    this.trailWidth += (hpW - this.trailWidth) * 0.08;
    this.hpTrail.width = this.trailWidth;
    this.mpBar.width = 220 * Phaser.Math.Clamp(m.mp / m.maxMp, 0, 1);
    this.rageBar.width = 220 * Phaser.Math.Clamp(m.rage / m.config.stats.maxRage, 0, 1);
    this.rageBar.setFillStyle(m.rage >= 100 ? 0xff5733 : 0xfacc15);

    let passiveInfo = '';
    if (m.config.id === 'zoro') passiveInfo = `KIẾM Ý: ${'◆'.repeat(m.swordIntent)}${'◇'.repeat(3 - m.swordIntent)} (${m.swordIntent}/3)`;
    else if (m.config.id === 'gojo') passiveInfo = (m.limitlessReady ? 'VÔ HẠN: SẴN SÀNG' : `VÔ HẠN CD: ${m.limitlessCooldown.toFixed(1)}s`) + (m.mpLockoutTimer > 0 ? ` | KHÓA MP ${m.mpLockoutTimer.toFixed(1)}s` : '');
    else if (m.config.id === 'goku') passiveInfo = m.kaiokenTimer > 0 ? `KAIOKEN ${m.kaiokenTimer.toFixed(1)}s (+25% DMG, Hồi Máu Trắng)` : `Kamehameha 2 Nấc (I×2) | [H] Super Saiyan 15s`;
    else if (m.config.id === 'zero') passiveInfo = `Z-BUSTER: ${Math.floor(m.busterCharge)}%${m.busterCharge >= 100 ? ' [MAX!]' : ''} | Saber-Dash Cancel`;
    else if (m.config.id === 'ichigo') passiveInfo = m.overdriveTimer > 0 ? 'BANKAI (+20% Tốc, -4.5 MP/s)' : 'Bankai Cancel: Bấm [H] ngay giữa J3!';
    else if (m.config.id === 'iori') passiveInfo = m.overdriveTimer > 0 ? 'BLOOD RIOT (+25% Tốc Đánh, Hút Máu)' : 'Maiden Masher (S+U) Wall Bounce';
    else if (m.config.id === 'asuna') passiveInfo = m.overdriveTimer > 0 ? "OVERDRIVE: O = MOTHER'S ROSARIO 11-HIT" : 'Switch Parry (L): Lướt sau lưng Boss';
    else passiveInfo = m.config.passiveName;

    const odTag = m.overdriveTimer > 0 ? ` | FORM ${m.overdriveTimer.toFixed(1)}s` : (m.rage >= 50 ? ' | [H] OVERDRIVE SẴN SÀNG' : '');
    this.passiveLabel.setText(`${passiveInfo}${odTag} | [F2] Hitbox: ${p.debugHitbox ? 'ON' : 'OFF'}`);
    this.stageLabel.setText(p.stageLabel);
    this.subLabel.setText(p.subLabel ?? '');
    this.scoreLabel.setText(`SCORE ${Math.round(p.score)}`);
    this.comboLabel.setText(p.comboCount >= 2 ? `${p.comboCount} HITS!` : '');

    if (p.debugHitbox) {
      this.inputLogLabel.setText(`INPUT: ${p.inputHistory.slice(-8).join(' → ')}`);
      const mv = m.currentMove;
      this.frameDataLabel.setText(mv ? `FRAME DATA: ${mv.label} | F ${m.currentFrame}/${mv.totalFrames} (Startup ${mv.startupFrames}f · Rec ${mv.recoveryFrames}f)` : `STATE: ${m.state} | POS (${Math.round(m.x)}, Y=${Math.round(m.groundY)}, Z=${Math.round(m.z)})`);
    } else {
      this.inputLogLabel.setText(''); this.frameDataLabel.setText('');
    }

    if (p.isTraining) {
      const done = new Set(p.trialsDone ?? []);
      this.trialPanel.setText([
        '5 BÀI THI COMBO TRIAL',
        `${done.has('j4') ? '[✓]' : '[ ]'} 1. Chuỗi J×4 Ground-to-Air`,
        `${done.has('cancel') ? '[✓]' : '[ ]'} 2. Hit-Confirm Cancel → Skill`,
        `${done.has('parry') ? '[✓]' : '[ ]'} 3. Perfect Parry (L)`,
        `${done.has('overdrive') ? '[✓]' : '[ ]'} 4. Bật Overdrive / Form (H)`,
        `${done.has('ult') ? '[✓]' : '[ ]'} 5. Xả Ultimate Cut-In (O)`,
        `[R] Hồi Đầy | [T] Dummy: ${p.dummyAggressive ? 'TẤN CÔNG' : 'ĐỨNG YÊN'}`,
      ].join('\n')).setVisible(true);
    } else {
      this.trialPanel.setVisible(false);
    }

    if (p.boss && p.boss.hp > 0) {
      this.bossContainer.setVisible(true);
      const bars = Math.max(1, p.boss.bossBars);
      const hpPerBar = p.boss.maxHp / bars;
      const remainingBars = Math.ceil(p.boss.hp / hpPerBar);
      const currentBarRatio = ((p.boss.hp - 0.01) % hpPerBar) / hpPerBar;
      const phaseTag = p.boss.bossBars >= 5 ? ` [PHA ${p.boss.bossPhase}/3]` : '';
      this.bossNameText.setText(`${p.boss.bossName}${phaseTag}${p.boss.superArmor ? ' [ARMOR]' : ' [VỠ GIÁP +25% DMG!]'}`);
      this.bossBarCount.setText(`x${remainingBars}`);
      this.bossBarFill.width = 700 * Phaser.Math.Clamp(currentBarRatio, 0, 1);
      this.staggerFill.width = 700 * Phaser.Math.Clamp(p.boss.stagger / p.boss.maxStagger, 0, 1);
    } else {
      this.bossContainer.setVisible(false);
    }
  }
}
