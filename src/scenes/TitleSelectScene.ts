import Phaser from 'phaser';
import { sfx } from '../audio/SoundFX';
import { CHARACTERS } from '../data/characters';
import { DIFFICULTY_PRESETS, VS_ARENAS } from '../data/modes';
import { fetchTopScores, LeaderboardEntry } from '../services/supabaseClient';
import { Difficulty, GameMode, MysticOrdealConfig, VsSubMode } from '../types/game';
import { ArcadeButtonHandle, ArcadeUI } from '../ui/ArcadeUI';

const DIFF_ORDER: Difficulty[] = ['easy', 'normal', 'hard', 'eschatology'];

export class TitleSelectScene extends Phaser.Scene {
  private selectedHeroIdx = 0;
  private partnerHeroIdx = 1;
  private selectedPaletteIdx = 0;
  private selectedMode: GameMode = 'story';
  private difficultyIdx = 1;
  private vsSubMode: VsSubMode = '2v2';
  private vsArenaIdx = 0;
  private storyCoopPartner = false;
  private ordeals: MysticOrdealConfig = { fastEnemies: false, armoredFoes: false, manaDrain: false };

  private cloudLayer: Phaser.GameObjects.TileSprite | null = null;
  private portraitImg!: Phaser.GameObjects.Image;
  private nameText!: Phaser.GameObjects.Text;
  private titleText!: Phaser.GameObjects.Text;
  private passiveText!: Phaser.GameObjects.Text;
  private paletteBtn!: ArcadeButtonHandle;
  private partnerBtn!: ArcadeButtonHandle;
  private diffBtn!: ArcadeButtonHandle;
  private modeOptBtn!: ArcadeButtonHandle;
  private modeText!: Phaser.GameObjects.Text;
  private ordealBtns: { key: keyof MysticOrdealConfig; label: string; btn: ArcadeButtonHandle }[] = [];
  private gridBoxes: Phaser.GameObjects.Rectangle[] = [];
  private modeBtns: { id: GameMode; btn: ArcadeButtonHandle }[] = [];
  private activeModal: Phaser.GameObjects.Container | null = null;

  constructor() { super('TitleSelectScene'); }

  create(): void {
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0x080a0f);
    if (this.textures.exists('stage_cloud')) this.cloudLayer = this.add.tileSprite(width / 2, 110, width, 210, 'stage_cloud').setAlpha(0.32);
    if (this.textures.exists('stage_mid_1')) this.add.tileSprite(width / 2, 265, width, 280, 'stage_mid_1').setAlpha(0.28);
    this.add.rectangle(width / 2, height / 2, width, height, 0x07090f, 0.56);

    this.add.rectangle(width / 2, 0, width, 6, 0xdc2626).setOrigin(0.5, 0);
    this.add.rectangle(width / 2, 6, width, 2, 0xd4af37).setOrigin(0.5, 0);
    this.add.rectangle(width / 2, height, width, 5, 0xd4af37).setOrigin(0.5, 1);

    this.add.text(40, 14, 'CRAZY ZOMBIE 10.0', { fontFamily: 'Impact, system-ui, sans-serif', fontSize: '44px', color: '#ff5733', stroke: '#000000', strokeThickness: 7 });
    this.add.text(42, 64, 'ESCHATOLOGY REMASTER · 27 TƯỚNG MUGEN · 5 BOSS MỚI NGUYÊN BẢN · 7 CHẾ ĐỘ', { fontFamily: 'monospace', fontSize: '12px', color: '#d4af37', stroke: '#000', strokeThickness: 3 });

    ArcadeUI.createArcadeButton(this, 962, 42, 162, 36, '⚙ CÀI ĐẶT [S]', () => this.openSettings(), { accent: 0xd4af37, fontSize: '12px' });
    ArcadeUI.createArcadeButton(this, 1146, 42, 190, 36, '🏆 XẾP HẠNG [L]', () => this.toggleLeaderboard(), { accent: 0xfacc15, fontSize: '12px' });

    ArcadeUI.drawMetalPanel(this, 214, 386, 356, 560, 0xd4af37, 0x1e2430, 0x0b0e14);
    this.add.rectangle(214, 244, 232, 256, 0x080a0f).setStrokeStyle(2, 0xd4af37).setDepth(1);
    this.portraitImg = this.add.image(214, 244, `portrait_${CHARACTERS[0].id}`).setDisplaySize(212, 242).setDepth(2);

    this.nameText = this.add.text(56, 382, '', { fontFamily: 'Impact, system-ui', fontSize: '25px', color: '#ffffff', stroke: '#000', strokeThickness: 4 });
    this.titleText = this.add.text(56, 412, '', { fontFamily: 'monospace', fontSize: '11.5px', color: '#67e8f9' });
    this.passiveText = this.add.text(56, 432, '', { fontFamily: 'system-ui', fontSize: '12px', color: '#cbd5e1', wordWrap: { width: 316 } });

    this.paletteBtn = ArcadeUI.createArcadeButton(this, 214, 524, 320, 34, '', () => this.cyclePalette(), { accent: 0xfacc15, fontSize: '11.5px' });
    this.partnerBtn = ArcadeUI.createArcadeButton(this, 214, 564, 320, 34, '', () => this.cyclePartner(), { accent: 0x34d399, fontSize: '11.5px' });
    this.diffBtn = ArcadeUI.createArcadeButton(this, 214, 604, 320, 34, '', () => this.cycleDifficulty(), { accent: 0xff5733, fontSize: '11.5px' });
    this.diffBtn.setActive(true);

    ArcadeUI.drawMetalPanel(this, 832, 244, 836, 276, 0x64748b, 0x1a202c, 0x0a0d13);
    this.add.text(430, 114, 'BẢNG CHỌN TƯỚNG MUGEN 9×3 (TRÁI: TƯỚNG CHÍNH · PHẢI / TAB: ĐỒNG ĐỘI)', { fontFamily: 'monospace', fontSize: '11.5px', fontStyle: 'bold', color: '#facc15' });

    CHARACTERS.forEach((hero, i) => {
      const col = i % 9, row = Math.floor(i / 9);
      const bx = 468 + col * 91, by = 172 + row * 78;
      const box = this.add.rectangle(bx, by, 83, 70, 0x121620).setStrokeStyle(2, 0x334155).setInteractive({ useHandCursor: true })
        .on('pointerdown', (ptr: Phaser.Input.Pointer) => {
          sfx.unlock(); sfx.pickup();
          if (ptr.rightButtonDown()) this.partnerHeroIdx = i;
          else { this.selectedHeroIdx = i; this.selectedPaletteIdx = 0; }
          this.refreshUI();
        });
      this.gridBoxes.push(box);
      if (this.textures.exists(`icon_${hero.id}`)) this.add.image(bx, by - 7, `icon_${hero.id}`).setDisplaySize(46, 46);
      this.add.text(bx, by + 24, hero.id.slice(0, 7).toUpperCase(), { fontFamily: 'monospace', fontSize: '10px', fontStyle: 'bold', color: hero.badge === 'NEW v10.0' ? '#34d399' : '#e2e8f0' }).setOrigin(0.5);
    });

    ArcadeUI.drawMetalPanel(this, 832, 526, 836, 276, 0xd4af37, 0x1a202c, 0x0a0d13);
    this.add.text(430, 396, 'CHỌN CHẾ ĐỘ CHƠI (7 CHẾ ĐỘ v10.0) & TÙY CHỈNH MYSTIC ORDEALS', { fontFamily: 'monospace', fontSize: '12px', fontStyle: 'bold', color: '#67e8f9' });

    const modes: { id: GameMode; label: string }[] = [
      { id: 'story', label: 'STORY 5 CHƯƠNG' }, { id: 'roguelike', label: 'ROGUELIKE RIFT' },
      { id: 'boss_raid', label: 'BOSS RAID CO-OP' }, { id: 'endless', label: 'ENDLESS 100 TẦNG' },
      { id: 'vs_arena', label: 'VS ARENA (15 MAP)' }, { id: 'survival', label: 'SURVIVAL' },
      { id: 'training', label: 'TRAINING (5 TRIAL)' },
    ];
    modes.forEach((m, idx) => {
      const mx = 524 + (idx % 4) * 204, my = 434 + Math.floor(idx / 4) * 40;
      const btn = ArcadeUI.createArcadeButton(this, mx, my, 194, 34, m.label, () => { this.selectedMode = m.id; this.refreshUI(); }, { accent: 0x22d3ee, fontSize: '11.5px' });
      this.modeBtns.push({ id: m.id, btn });
    });

    this.modeText = this.add.text(430, 498, '', { fontFamily: 'system-ui', fontSize: '12.5px', color: '#cbd5e1', wordWrap: { width: 800 } });
    this.modeOptBtn = ArcadeUI.createArcadeButton(this, 832, 550, 800, 30, '', () => this.cycleModeOption(), { accent: 0x34d399, fontSize: '11.5px' });

    const ordealDefs: { key: keyof MysticOrdealConfig; label: string; x: number }[] = [
      { key: 'fastEnemies', label: 'Quái +25% Tốc', x: 562 },
      { key: 'armoredFoes', label: 'Giáp/Máu +35%', x: 832 },
      { key: 'manaDrain', label: 'Hao MP +30%', x: 1102 },
    ];
    this.ordealBtns = ordealDefs.map(d => {
      const btn = ArcadeUI.createArcadeButton(this, d.x, 592, 256, 32, '', () => { this.ordeals[d.key] = !this.ordeals[d.key]; this.refreshUI(); }, { accent: 0xfacc15, fontSize: '11.5px' });
      return { key: d.key, label: d.label, btn };
    });

    ArcadeUI.createArcadeButton(this, 832, 640, 420, 42, '⚔ BẮT ĐẦU CHIẾN ĐẤU [ENTER]', () => this.launchGame(), { isPrimary: true, fontSize: '20px' });
    this.add.text(40, 692, 'WASD/Gamepad | J×4 Combo | K Nhảy | L Parry | U/I/S+U Skill | H Overdrive/Bankai | O Ult | Q Tag | E Assist | P Team Ult | ESC Tạm dừng', { fontFamily: 'monospace', fontSize: '11px', color: '#94a3b8' });

    this.input.mouse?.disableContextMenu();
    this.input.keyboard?.on('keydown-ENTER', () => { if (!this.activeModal) this.launchGame(); });
    this.input.keyboard?.on('keydown-C', () => { if (!this.activeModal) this.cyclePalette(); });
    this.input.keyboard?.on('keydown-D', () => { if (!this.activeModal) this.cycleDifficulty(); });
    this.input.keyboard?.on('keydown-L', () => this.toggleLeaderboard());
    this.input.keyboard?.on('keydown-S', () => this.openSettings());
    this.input.keyboard?.on('keydown-ESC', () => this.closeModal());
    this.input.keyboard?.on('keydown-TAB', (e: KeyboardEvent) => { e.preventDefault(); if (!this.activeModal) this.cyclePartner(); });
    sfx.playBgm('bgm_select');
    this.refreshUI();
  }

  update(_time: number, delta: number): void { if (this.cloudLayer) this.cloudLayer.tilePositionX += 14 * (delta / 1000); }
  private closeModal(): void { if (this.activeModal) { this.activeModal.destroy(); this.activeModal = null; } }
  private openSettings(): void { if (this.activeModal) { this.closeModal(); return; } this.activeModal = ArcadeUI.openSettingsModal(this, () => { this.activeModal = null; }); }
  private cyclePalette(): void { this.selectedPaletteIdx = (this.selectedPaletteIdx + 1) % CHARACTERS[this.selectedHeroIdx].palettes.length; this.refreshUI(); }
  private cyclePartner(): void { this.partnerHeroIdx = (this.partnerHeroIdx + 1) % CHARACTERS.length; if (this.partnerHeroIdx === this.selectedHeroIdx) this.partnerHeroIdx = (this.partnerHeroIdx + 1) % CHARACTERS.length; this.refreshUI(); }
  private cycleDifficulty(): void { this.difficultyIdx = (this.difficultyIdx + 1) % DIFF_ORDER.length; this.refreshUI(); }
  private cycleModeOption(): void {
    if (this.selectedMode === 'vs_arena') {
      this.vsArenaIdx = (this.vsArenaIdx + 1) % VS_ARENAS.length;
      if (this.vsArenaIdx === 0) this.vsSubMode = this.vsSubMode === '2v2' ? '1v1' : '2v2';
    } else if (this.selectedMode === 'story') this.storyCoopPartner = !this.storyCoopPartner;
    this.refreshUI();
  }

  private async toggleLeaderboard(): Promise<void> {
    if (this.activeModal) { this.closeModal(); return; }
    const cont = this.add.container(640, 360).setDepth(9900);
    const scrim = this.add.rectangle(0, 0, 1280, 720, 0x05070c, 0.86).setInteractive();
    const panel = ArcadeUI.drawMetalPanel(this, 0, 0, 780, 490, 0xd4af37, 0x1e2430, 0x0a0d13);
    const headerBand = this.add.rectangle(0, -210, 770, 50, 0x7f1d1d, 0.85);
    const title = this.add.text(0, -210, '🏆 BẢNG XẾP HẠNG ENDLESS CORRIDOR (SUPABASE)', { fontFamily: 'Impact, system-ui', fontSize: '25px', color: '#facc15', stroke: '#000', strokeThickness: 5 }).setOrigin(0.5);
    const body = this.add.text(-345, -152, 'Đang tải dữ liệu bảng xếp hạng...', { fontFamily: 'monospace', fontSize: '14px', color: '#e2e8f0', lineSpacing: 8 });
    const closeBtn = ArcadeUI.createArcadeButton(this, 0, 204, 240, 40, 'ĐÓNG [ESC / L]', () => this.closeModal(), { isPrimary: true, fontSize: '16px' });
    scrim.on('pointerdown', () => this.closeModal());
    cont.add([scrim, panel, headerBand, title, body, closeBtn.container]);
    this.activeModal = cont;

    const rows: LeaderboardEntry[] = await fetchTopScores();
    if (this.activeModal !== cont) return;
    if (rows.length === 0) body.setText('Chưa có kỷ lục nào được ghi nhận.\nHãy chơi Story hoặc Endless Corridor để lưu điểm lên Supabase & máy!');
    else {
      const lines = rows.slice(0, 10).map((r, idx) => `${String(idx + 1).padEnd(3)} ${r.hero_id.toUpperCase().padEnd(12)} ${String(r.floor_reached).padEnd(6)} ${String(r.max_combo).padEnd(7)} ${String(r.score).padEnd(11)} ${r.mystic_ordeal ? 'YES' : 'NO'}`);
      body.setText(['#   TƯỚNG        TẦNG   COMBO   ĐIỂM        ORDEAL', '─'.repeat(58), ...lines].join('\n'));
    }
  }

  private refreshUI(): void {
    const hero = CHARACTERS[this.selectedHeroIdx], partner = CHARACTERS[this.partnerHeroIdx];
    const pal = hero.palettes[this.selectedPaletteIdx], diff = DIFFICULTY_PRESETS[DIFF_ORDER[this.difficultyIdx]];
    this.portraitImg.setTexture(`portrait_${hero.id}`).setDisplaySize(212, 242);
    this.nameText.setText(hero.name.toUpperCase());
    this.titleText.setText(`${hero.title} · HP ${hero.stats.maxHp}`);
    this.passiveText.setText(`Nội tại: ${hero.passiveName} — ${hero.passiveDesc}`);
    this.paletteBtn.setLabel(`[C] MÀU PALCFG (${this.selectedPaletteIdx + 1}/4): ${pal.name.toUpperCase()}`);
    this.partnerBtn.setLabel(`[TAB] ĐỒNG ĐỘI: ${partner.name.toUpperCase()}`);
    this.diffBtn.setLabel(`[D] ĐỘ KHÓ: ${diff.label} (x${diff.scoreMult})`);

    const modeDesc: Record<GameMode, string> = {
      story: 'STORY 5 CHƯƠNG: 6 chủng quái mới & 5 Boss nguyên bản (Krox · Vex · Chimera-09 · Archon Nyx · Zero Point Overlord), nhánh rẽ Ch4 & 3 Cursed Arcade.',
      roguelike: 'ROGUELIKE RIFT: Vượt phòng chọn 1/3 trong 9 thẻ Buff Đột Biến + 3 luật Mystic Ordeals cộng dồn (Absolum).',
      boss_raid: 'BOSS RAID CO-OP: Phối hợp AI Partner hạ Siêu Boss Zero Point Overlord 3 Pha, bấm [P] tung TEAM ULTIMATE đôi!',
      endless: 'ENDLESS 100 TẦNG: Luật biến dị mỗi 5 tầng, Boss xoay màu palcfg & lưu bảng xếp hạng Supabase.',
      vs_arena: 'VS ARENA (15 ĐẤU TRƯỜNG): Đấu 1v1 hoặc 2v2 Tag-Team ([Q] Đổi tướng, [E] Assist, [P] Team Ult).',
      survival: 'ESCHATOLOGY SURVIVAL: Sống sót trước làn sóng xác sống tăng tốc liên tục & hòm tiếp tế chestcfg.',
      training: 'TRAINING & 5 COMBO TRIALS: Bật sẵn Hitbox/Frame Data (F2), [R] Hồi đầy, [T] Bật/Tắt Dummy tấn công.',
    };
    this.modeText.setText(modeDesc[this.selectedMode]);

    if (this.selectedMode === 'vs_arena') {
      const arena = VS_ARENAS[this.vsArenaIdx];
      this.modeOptBtn.container.setVisible(true); this.modeOptBtn.setActive(true);
      this.modeOptBtn.setLabel(`[CLICK ĐỔI MAP/THỂ THỨC] ${this.vsSubMode.toUpperCase()} · MAP ${arena.id + 1}/15 (${arena.code}): ${arena.name.toUpperCase()}`);
    } else if (this.selectedMode === 'story') {
      this.modeOptBtn.container.setVisible(true); this.modeOptBtn.setActive(this.storyCoopPartner);
      this.modeOptBtn.setLabel(`[CLICK] STORY CO-OP ĐỒNG ĐỘI AI: ${this.storyCoopPartner ? 'BẬT — ĐI CÙNG ' + partner.name.toUpperCase() : 'TẮT — ĐƠN THƯƠNG ĐỘC MÃ'}`);
    } else this.modeOptBtn.container.setVisible(false);

    this.ordealBtns.forEach(b => { const on = this.ordeals[b.key]; b.btn.setActive(on); b.btn.setLabel(`${on ? '[✓]' : '[ ]'} ${b.label.toUpperCase()} (+0.25x)`); });
    this.gridBoxes.forEach((b, idx) => {
      b.setStrokeStyle((idx === this.selectedHeroIdx || idx === this.partnerHeroIdx) ? 3 : 1.5, idx === this.selectedHeroIdx ? 0xfacc15 : idx === this.partnerHeroIdx ? 0x34d399 : 0x334155);
      b.setFillStyle(idx === this.selectedHeroIdx ? 0x2d181a : idx === this.partnerHeroIdx ? 0x0f2922 : 0x121620);
    });
    this.modeBtns.forEach(mb => mb.btn.setActive(mb.id === this.selectedMode));
  }

  private launchGame(): void {
    sfx.unlock();
    this.scene.start('BattleScene', {
      heroId: CHARACTERS[this.selectedHeroIdx].id, partnerId: CHARACTERS[this.partnerHeroIdx].id,
      paletteIndex: this.selectedPaletteIdx, mode: this.selectedMode, difficulty: DIFF_ORDER[this.difficultyIdx],
      ordeals: { ...this.ordeals }, vsSubMode: this.vsSubMode, vsArenaIdx: this.vsArenaIdx, storyCoopPartner: this.storyCoopPartner,
    });
  }
}
