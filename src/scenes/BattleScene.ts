import Phaser from 'phaser';
import { sfx } from '../audio/SoundFX';
import { AfterimageVFX } from '../combat/AfterimageVFX';
import { AnimationFX } from '../combat/AnimationFX';
import { CharacterController } from '../combat/CharacterController';
import { CharacterModel } from '../combat/CharacterModel';
import { CharacterView } from '../combat/CharacterView';
import { EnemyAIController, EnemySpecialKind } from '../combat/EnemyAI';
import { HitboxSystem } from '../combat/HitboxSystem';
import { ProjectileSystem } from '../combat/ProjectileSystem';
import { StageObjectManager } from '../combat/StageObjects';
import { CHARACTERS, getCharacterById } from '../data/characters';
import { createDefaultModifiers, DIFFICULTY_PRESETS, ENDLESS_MUTATIONS, ROGUELIKE_BUFFS, VS_ARENAS } from '../data/modes';
import { STORY_CHAPTERS } from '../data/story';
import { getSettings } from '../services/settingsStore';
import { submitTowerScore } from '../services/supabaseClient';
import { CharacterConfig, DialogueLine, Difficulty, EndlessMutation, EnemyArchetype, EnemySpawnSpec, FighterState, GameMode, MoveData, MysticOrdealConfig, RunModifiers, VsSubMode } from '../types/game';
import { ArcadeUI } from '../ui/ArcadeUI';

interface BattleInitData {
  heroId: string; partnerId?: string; paletteIndex: number; mode: GameMode;
  difficulty?: Difficulty; ordeals?: MysticOrdealConfig; vsSubMode?: VsSubMode; vsArenaIdx?: number; storyCoopPartner?: boolean;
}

export class BattleScene extends Phaser.Scene {
  private initData!: BattleInitData;
  private mods!: RunModifiers;
  private player!: CharacterController;
  private partner: CharacterController | null = null;
  private partnerAiTimer = 0;
  private tagReserveId = 'gojo';
  private tagCooldown = 0;
  private assistCooldown = 0;
  private trialsDone = new Set<string>();
  private dummyAggressive = false;
  private enemies: EnemyAIController[] = [];
  private projectiles!: ProjectileSystem;
  private props!: StageObjectManager;

  private activeAttackTokens = 0;
  private readonly maxAttackTokens = 3;
  private chapterIdx = 0; private waveIdx = 0; private towerFloor = 1;
  private bossSpawned = false; private survivalTimer = 0;
  private comboCount = 0; private maxCombo = 0; private comboTimer = 0;
  private score = 0; private cursedCleared = 0;
  private activeMutation: EndlessMutation | null = null;

  private superFreezeFrames = 0;
  private superOverlay!: Phaser.GameObjects.Rectangle;
  private superBanner!: Phaser.GameObjects.Text;
  private debugGfx!: Phaser.GameObjects.Graphics;
  private debugHitbox = false;
  private inputHistory: string[] = [];

  private dialogueActive = false;
  private dialogueQueue: DialogueLine[] = [];
  private dialogueGroup!: Phaser.GameObjects.Container;
  private dialogueSpeaker!: Phaser.GameObjects.Text;
  private dialogueBody!: Phaser.GameObjects.Text;
  private onDialogueDone: (() => void) | null = null;

  private cursedCabinet: Phaser.GameObjects.Rectangle | null = null;
  private cursedLabel: Phaser.GameObjects.Text | null = null;
  private cursedHp = 3;
  private buffOverlay: Phaser.GameObjects.Container | null = null;
  private pauseOverlay: Phaser.GameObjects.Container | null = null;
  private settingsOverlay: Phaser.GameObjects.Container | null = null;
  private backdropGroup: Phaser.GameObjects.Container | null = null;
  private rainLines: Phaser.GameObjects.Line[] = [];
  private cloudLayer: Phaser.GameObjects.TileSprite | null = null;

  constructor() { super('BattleScene'); }

  init(data: BattleInitData): void {
    this.initData = data;
    this.mods = createDefaultModifiers(data.ordeals ?? { fastEnemies: false, armoredFoes: false, manaDrain: false }, data.difficulty ?? 'normal');
    this.chapterIdx = 0; this.waveIdx = 0; this.towerFloor = 1; this.bossSpawned = false;
    this.survivalTimer = 0; this.comboCount = 0; this.maxCombo = 0; this.score = 0; this.cursedCleared = 0;
    this.activeMutation = null; this.enemies = []; this.partner = null; this.tagReserveId = data.partnerId ?? 'gojo';
    this.tagCooldown = 0; this.assistCooldown = 0; this.trialsDone = new Set(); this.dummyAggressive = false;
    this.activeAttackTokens = 0; this.pauseOverlay = null; this.settingsOverlay = null;
    this.debugHitbox = data.mode === 'training' || getSettings().defaultHitbox;
  }

  create(): void {
    this.projectiles = new ProjectileSystem(this);
    this.props = new StageObjectManager(this);
    this.drawStageBackdrop();

    const heroCfg = getCharacterById(this.initData.heroId);
    const pModel = new CharacterModel('player', heroCfg, this.initData.paletteIndex, 240, 520, true);
    const pView = new CharacterView(this, pModel, `hero_${heroCfg.id}_${this.initData.paletteIndex}`);
    this.player = new CharacterController(this, pModel, pView, {
      onSuperFreeze: (frames, title, color) => this.triggerSuperFreeze(frames, title, color),
      onComboHit: (dmg) => this.registerComboHit(dmg),
      onInputLogged: (sym) => { this.inputHistory.push(sym); if (this.inputHistory.length > 12) this.inputHistory.shift(); },
      onMoveStarted: (ctrl, move) => this.spawnSkillProjectile(ctrl, move),
      onTrialEvent: (tk) => { this.trialsDone.add(tk); },
    });

    this.superOverlay = this.add.rectangle(640, 360, 1280, 720, 0x05060a, 0).setDepth(8000);
    this.superBanner = this.add.text(640, 260, '', { fontFamily: 'Impact, system-ui, sans-serif', fontSize: '56px', color: '#ffffff', stroke: '#000000', strokeThickness: 7 }).setOrigin(0.5).setDepth(8001).setVisible(false);
    this.debugGfx = this.add.graphics().setDepth(8500);
    this.buildDialogueUI();

    this.input.keyboard?.on('keydown-F2', () => { this.debugHitbox = !this.debugHitbox; });
    this.input.keyboard?.on('keydown-Q', () => this.tryTagSwitch());
    this.input.keyboard?.on('keydown-E', () => this.tryAssistCall());
    this.input.keyboard?.on('keydown-P', () => this.tryTeamUltimate());
    this.input.keyboard?.on('keydown-M', () => { sfx.toggleMute(); });
    this.input.keyboard?.on('keydown-R', () => {
      if (this.initData.mode === 'training') {
        this.player.model.hp = this.player.model.maxHp; this.player.model.mp = this.player.model.maxMp; this.player.model.rage = this.player.model.config.stats.maxRage;
        sfx.pickup(); this.player.view.spawnDamageNumber(this.player.model.x, this.player.model.groundY - 50, 0, true, 'FULL HP/MP/RAGE');
      }
    });
    this.input.keyboard?.on('keydown-T', () => { if (this.initData.mode === 'training') { this.dummyAggressive = !this.dummyAggressive; sfx.pickup(); } });
    this.input.keyboard?.on('keydown-ESC', () => this.togglePauseMenu());
    this.input.keyboard?.on('keydown-SPACE', () => { if (this.dialogueActive && !this.pauseOverlay && !this.settingsOverlay) this.advanceDialogue(); });

    const modeBgm = this.initData.mode === 'vs_arena' ? 'bgm_vs' : this.initData.mode === 'boss_raid' ? 'bgm_boss' : `bgm_${this.chapterIdx}`;
    sfx.playBgm(modeBgm);
    this.scene.launch('HudScene');
    this.startModeFlow();
  }

  private safeShake(duration: number, intensity: number): void { if (getSettings().screenShake) this.cameras.main.shake(duration, intensity); }

  private togglePauseMenu(): void {
    if (this.settingsOverlay) { this.settingsOverlay.destroy(); this.settingsOverlay = null; return; }
    if (this.pauseOverlay) { this.pauseOverlay.destroy(); this.pauseOverlay = null; return; }
    const cont = this.add.container(640, 360).setDepth(9800);
    const scrim = this.add.rectangle(0, 0, 1280, 720, 0x05070c, 0.82).setInteractive();
    const panel = ArcadeUI.drawMetalPanel(this, 0, 0, 460, 360, 0xd4af37, 0x1e2430, 0x0a0d13);
    const band = this.add.rectangle(0, -145, 450, 48, 0x7f1d1d, 0.88);
    const title = this.add.text(0, -145, 'TẠM DỪNG · CRAZY ZOMBIE 10.0', { fontFamily: 'Impact, system-ui', fontSize: '25px', color: '#facc15', stroke: '#000', strokeThickness: 5 }).setOrigin(0.5);
    const bResume = ArcadeUI.createArcadeButton(this, 0, -68, 340, 44, '▶ TIẾP TỤC CHIẾN ĐẤU [ESC]', () => this.togglePauseMenu(), { isPrimary: true, fontSize: '17px' });
    const bSettings = ArcadeUI.createArcadeButton(this, 0, -8, 340, 42, '⚙ CÀI ĐẶT HỆ THỐNG (ÂM LƯỢNG / VFX)', () => {
      this.settingsOverlay = ArcadeUI.openSettingsModal(this, () => { this.settingsOverlay = null; }, () => { this.drawStageBackdrop(); });
    }, { accent: 0xd4af37, fontSize: '12.5px' });
    const bRestart = ArcadeUI.createArcadeButton(this, 0, 50, 340, 42, '↻ CHƠI LẠI MÀN HIỆN TẠI', () => { this.scene.stop('HudScene'); this.scene.restart(this.initData); }, { accent: 0x22d3ee, fontSize: '12.5px' });
    const bExit = ArcadeUI.createArcadeButton(this, 0, 108, 340, 42, '✕ VỀ MÀN HÌNH CHỌN TƯỚNG', () => { this.scene.stop('HudScene'); this.scene.start('TitleSelectScene'); }, { accent: 0xff5733, fontSize: '12.5px' });
    cont.add([scrim, panel, band, title, bResume.container, bSettings.container, bRestart.container, bExit.container]);
    this.pauseOverlay = cont;
  }

  private registerComboHit(dmg: number): void {
    this.comboCount++; this.maxCombo = Math.max(this.maxCombo, this.comboCount); this.comboTimer = 2.6;
    this.score += dmg * (1 + this.comboCount * 0.08) * this.mods.scoreMult;
  }

  private spawnSkillProjectile(ctrl: CharacterController, move: MoveData): void {
    const m = ctrl.model, vfxCol = Phaser.Display.Color.HexStringToColor(m.palette.vfx).color, dir = m.facing;
    if (m.config.id === 'zoro' && move.id === 'skill_su') this.projectiles.spawn({ owner: ctrl, kind: 'slash', x: m.x + dir * 40, groundY: m.groundY, z: m.z, vx: dir * 560, radius: 42, color: vfxCol, damage: 95, lifeSec: 1.4, maxHits: 4, stagger: 26 });
    else if (m.config.id === 'gojo' && move.id === 'skill_u') this.projectiles.spawn({ owner: ctrl, kind: 'orb_pull', x: m.x + dir * 130, groundY: m.groundY, z: m.z, vx: dir * 90, radius: 34, color: 0x38bdf8, damage: 70, lifeSec: 1.4, maxHits: 6, stagger: 18 });
    else if (m.config.id === 'gojo' && move.id === 'skill_i') this.projectiles.spawn({ owner: ctrl, kind: 'orb_push', x: m.x + dir * 55, groundY: m.groundY, z: m.z, vx: dir * 640, radius: 32, color: 0xef4444, damage: 115, lifeSec: 0.9, maxHits: 5, stagger: 34, wallBounce: true });
    else if (m.config.id === 'gojo' && move.id === 'skill_su') this.time.delayedCall(355, () => { if (m.hp > 0 && m.state === FighterState.ATTACK && m.currentMoveId === 'skill_su') this.projectiles.spawn({ owner: ctrl, kind: 'purple', x: m.x + dir * 70, groundY: m.groundY, z: m.z, vx: dir * 420, radius: 58, color: 0xa855f7, damage: 195, lifeSec: 1.8, maxHits: 12, stagger: 56 }); });
    else if (m.config.id === 'ichigo' && move.id === 'skill_i') this.projectiles.spawn({ owner: ctrl, kind: 'slash', x: m.x + dir * 45, groundY: m.groundY, z: m.z, vx: dir * 620, radius: 48, color: vfxCol, damage: 115, lifeSec: 1.2, maxHits: 6, stagger: 32 });
    else if (m.config.id === 'goku' && move.id === 'skill_i') this.time.delayedCall(180, () => { if (m.hp > 0 && m.state === FighterState.ATTACK && m.currentMoveId === 'skill_i') { const lv2 = m.kameChargeLevel >= 2; this.projectiles.spawn({ owner: ctrl, kind: 'beam', x: m.x + dir * 45, groundY: m.groundY, z: m.z, vx: dir * (lv2 ? 560 : 480), radius: lv2 ? 48 : 34, color: lv2 ? 0xfacc15 : 0x38bdf8, damage: lv2 ? 195 : 145, lifeSec: 0.95, maxHits: lv2 ? 10 : 8, stagger: lv2 ? 55 : 40 }); } });
    else if (m.config.id === 'iori' && move.id === 'skill_u') this.projectiles.spawn({ owner: ctrl, kind: 'flame', x: m.x + dir * 45, groundY: m.groundY, z: 0, vx: dir * 460, radius: 28, color: 0xa855f7, damage: 85, lifeSec: 1.2, maxHits: 5, stagger: 24 });
    else if (m.config.id === 'zero' && move.id === 'skill_i') { const chg = m.busterCharge >= 100; this.projectiles.spawn({ owner: ctrl, kind: 'beam', x: m.x + dir * 40, groundY: m.groundY, z: m.z, vx: dir * (chg ? 760 : 660), radius: chg ? 40 : 26, color: chg ? 0x22d3ee : 0x4ade80, damage: chg ? 162 : 115, lifeSec: 0.95, maxHits: chg ? 8 : 5, stagger: chg ? 46 : 30 }); }
  }

  private drawStageBackdrop(): void {
    if (this.backdropGroup) { this.backdropGroup.destroy(true); this.backdropGroup = null; }
    this.rainLines.forEach(r => r.destroy()); this.rainLines = []; this.cloudLayer = null;
    const grp = this.add.container(0, 0).setDepth(-110);
    let skyTop = STORY_CHAPTERS[this.chapterIdx]?.skyTop ?? 0x0b0d14, tint = 0x05070c, rain = STORY_CHAPTERS[this.chapterIdx]?.rain ?? true;
    const midKeys = ['stage_mid_1', 'stage_mid_5', 'stage_mid_9'];
    let midKey = midKeys[this.chapterIdx % midKeys.length];
    if (this.initData.mode === 'vs_arena') { const a = VS_ARENAS[this.initData.vsArenaIdx ?? 0] ?? VS_ARENAS[0]; skyTop = a.skyTop; tint = a.tint; rain = a.rain; midKey = a.midKey; }
    grp.add(this.add.rectangle(640, 185, 1280, 370, skyTop));
    if (this.textures.exists('stage_cloud')) { this.cloudLayer = this.add.tileSprite(640, 96, 1280, 164, 'stage_cloud').setAlpha(0.55); grp.add(this.cloudLayer); }
    if (this.textures.exists(midKey)) grp.add(this.add.tileSprite(640, 245, 1280, 260, midKey).setAlpha(0.9));
    if (this.textures.exists('stage_land_0')) grp.add(this.add.tileSprite(640, 540, 1280, 360, 'stage_land_0'));
    else grp.add(this.add.rectangle(640, 545, 1280, 360, 0x1b1f2a));
    grp.add(this.add.rectangle(640, 545, 1280, 360, tint, 0.28));
    this.backdropGroup = grp;
    if (rain && getSettings().highVfx) {
      for (let i = 0; i < 38; i++) this.rainLines.push(this.add.line(Math.random() * 1280, Math.random() * 720, 0, 0, -6, 18, 0x94a3b8, 0.25).setDepth(7500));
    }
  }

  private buildDialogueUI(): void {
    this.dialogueGroup = this.add.container(640, 608).setDepth(9500).setVisible(false);
    const panel = ArcadeUI.drawMetalPanel(this, 0, 0, 972, 134, 0xd4af37, 0x181c26, 0x07090e);
    const frame = this.textures.exists('ui_talk_bg') ? this.add.image(0, 0, 'ui_talk_bg').setDisplaySize(960, 124).setAlpha(0.55) : this.add.rectangle(0, 0, 1, 1, 0x000000, 0);
    const hit = this.add.rectangle(0, 0, 972, 134, 0x000000, 0).setInteractive({ useHandCursor: true });
    this.dialogueSpeaker = this.add.text(-448, -48, '', { fontFamily: 'monospace', fontSize: '16px', fontStyle: 'bold', color: '#facc15' });
    this.dialogueBody = this.add.text(-448, -20, '', { fontFamily: 'system-ui', fontSize: '17px', color: '#f8fafc', wordWrap: { width: 896 } });
    const hint = this.add.text(448, 38, '[SPACE / CLICK] Tiếp tục ▶', { fontFamily: 'monospace', fontSize: '12px', color: '#d4af37' }).setOrigin(1, 0);
    hit.on('pointerdown', () => this.advanceDialogue());
    this.dialogueGroup.add([panel, frame, this.dialogueSpeaker, this.dialogueBody, hint, hit]);
  }

  private showDialogue(lines: DialogueLine[], onDone?: () => void): void { this.dialogueQueue = [...lines]; this.dialogueActive = true; this.onDialogueDone = onDone ?? null; this.dialogueGroup.setVisible(true); this.advanceDialogue(); }
  private advanceDialogue(): void {
    const next = this.dialogueQueue.shift();
    if (!next) { this.dialogueActive = false; this.dialogueGroup.setVisible(false); const cb = this.onDialogueDone; this.onDialogueDone = null; cb?.(); return; }
    this.dialogueSpeaker.setText(next.speaker).setColor(next.color); this.dialogueBody.setText(next.text);
  }

  private spawnPartnerHero(): void {
    const partnerCfg = getCharacterById(this.tagReserveId);
    const pm = new CharacterModel('partner', partnerCfg, 0, 180, 440, false);
    const pv = new CharacterView(this, pm, `hero_${partnerCfg.id}_0`);
    this.partner = new CharacterController(this, pm, pv, { onSuperFreeze: () => {}, onComboHit: (d) => this.registerComboHit(d * 0.5), onInputLogged: () => {}, onMoveStarted: (c, mv) => this.spawnSkillProjectile(c, mv) });
  }

  private startModeFlow(): void {
    if (this.initData.mode === 'training') {
      this.props.spawnStageProps(false); this.spawnEnemyGroup([{ type: 'rift_crawler', count: 2 }, { type: 'riot_brute', count: 1 }]);
      this.showDialogue([{ speaker: 'TRAINING & 5 COMBO TRIALS', color: '#67e8f9', text: 'F2: Hitbox & Frame Data | R: Hồi đầy HP/MP/Rage | T: Bật/Tắt Dummy tấn công | ESC: Cài đặt!' }]); return;
    }
    if (this.initData.mode === 'boss_raid') {
      this.spawnPartnerHero(); this.props.spawnStageProps(true); sfx.warning(); this.game.events.emit('hud:bossWarning');
      this.spawnSingleEnemy('boss_zeropoint', 1050, 510, 'ZERO POINT OVERLORD (RAID CO-OP)', 5);
      this.showDialogue([{ speaker: 'BOSS RAID CO-OP', color: '#34d399', text: `Đồng đội AI (${getCharacterById(this.tagReserveId).name}) đã tham chiến! Bấm [P] xả TEAM ULTIMATE!` }]); return;
    }
    if (this.initData.mode === 'vs_arena') {
      const sub = this.initData.vsSubMode ?? '2v2', arena = VS_ARENAS[this.initData.vsArenaIdx ?? 0] ?? VS_ARENAS[0];
      this.props.spawnStageProps(arena.hasTraps);
      const rival1 = CHARACTERS.find(c => c.id !== this.initData.heroId && c.id !== this.tagReserveId) ?? CHARACTERS[2];
      this.spawnRivalHero(rival1);
      if (sub === '2v2') {
        const rival2 = CHARACTERS.find(c => c.id !== this.initData.heroId && c.id !== rival1.id) ?? CHARACTERS[3];
        this.spawnRivalHero(rival2);
        this.showDialogue([{ speaker: `VS ARENA 2v2 TAG · ${arena.name.toUpperCase()}`, color: '#facc15', text: `2v2 Tag-Team: Q đổi tướng, E Assist, P Team Ult!` }]);
      } else this.showDialogue([{ speaker: `VS ARENA 1v1 · ${arena.name.toUpperCase()}`, color: '#facc15', text: `Đấu đơn 1v1: ${getCharacterById(this.initData.heroId).name} vs ${rival1.name}!` }]);
      return;
    }
    if (this.initData.mode === 'story') {
      if (this.initData.storyCoopPartner) this.spawnPartnerHero();
      const ch = STORY_CHAPTERS[this.chapterIdx];
      this.props.spawnStageProps(ch.id === 2 || ch.id === 5);
      this.showDialogue(ch.introDialogue);
      this.spawnEnemyGroup(ch.waves[0]);
      if (ch.hasCursedArcade) this.spawnCursedArcade();
      return;
    }
    this.props.spawnStageProps(true);
    this.spawnEnemyGroup([{ type: 'rift_crawler', count: 3 }, { type: 'syndicate_gunner', count: 2 }]);
  }

  private spawnRivalHero(rivalCfg: CharacterConfig): void {
    const model = new CharacterModel('rival_hero', rivalCfg, 1, 1020 + (Math.random() - 0.5) * 80, 480 + (Math.random() - 0.5) * 90, false);
    model.isBoss = true; model.bossName = `VS RIVAL: ${rivalCfg.name.toUpperCase()}`; model.bossBars = 2;
    model.maxHp = Math.round(rivalCfg.stats.maxHp * 1.35 * this.mods.enemyHpMult); model.hp = model.maxHp; model.superArmor = false;
    const view = new CharacterView(this, model, `hero_${rivalCfg.id}_1`);
    const ctrl = new CharacterController(this, model, view, { onSuperFreeze: () => {}, onComboHit: () => {}, onInputLogged: () => {}, onMoveStarted: (c, mv) => this.spawnSkillProjectile(c, mv) });
    this.enemies.push(new EnemyAIController(ctrl, true));
  }

  private clearCursedArcade(): void { if (this.cursedCabinet) { this.cursedCabinet.destroy(); this.cursedCabinet = null; } if (this.cursedLabel) { this.cursedLabel.destroy(); this.cursedLabel = null; } }
  private spawnCursedArcade(): void {
    this.clearCursedArcade(); this.cursedHp = 3;
    this.cursedCabinet = this.add.rectangle(1160, 420, 44, 68, 0x991b1b).setStrokeStyle(3, 0xfacc15).setDepth(420);
    this.cursedLabel = this.add.text(1160, 376, 'CURSED ARCADE', { fontFamily: 'monospace', fontSize: '10px', color: '#facc15' }).setOrigin(0.5).setDepth(421);
  }

  private spawnEnemyGroup(specs: EnemySpawnSpec[]): void {
    let idx = 0;
    for (const spec of specs) {
      for (let i = 0; i < spec.count; i++) {
        this.spawnSingleEnemy(spec.type, idx % 2 === 0 ? 1160 - (idx * 35) % 180 : 120 + (idx * 40) % 160, 410 + (idx * 47) % 210);
        idx++;
      }
    }
  }

  private spawnSingleEnemy(type: EnemyArchetype, x: number, groundY: number, bossName?: string, bossBars = 1, bossTint?: number): void {
    const isBoss = type.startsWith('boss_') || type === 'subboss';
    const hpMap: Record<EnemyArchetype, number> = {
      zombie: 190, runner: 150, raider: 250, subboss: 780, boss_clone: 1180,
      rift_crawler: 175, riot_brute: 320, syndicate_gunner: 220, serum_stalker: 210, void_acolyte: 235, chrono_sentinel: 310,
      boss_plague_warden: 1050, boss_iron_vanguard: 1200, boss_chimera_alpha: 1380, boss_eclipse_archon: 1550, boss_zeropoint: 1950,
    };
    const speedMap: Partial<Record<EnemyArchetype, number>> = { runner: 230, rift_crawler: 215, serum_stalker: 245, riot_brute: 120, chrono_sentinel: 205, boss_chimera_alpha: 220, boss_eclipse_archon: 210 };
    const totalHpMult = (this.initData.mode === 'endless' ? 1 + (this.towerFloor - 1) * 0.12 : 1) * this.mods.enemyHpMult;
    const preferredTex = `enemy_${type}`;
    const texKey = this.textures.exists(preferredTex) ? preferredTex : (isBoss ? 'enemy_boss' : 'enemy_zombie');

    const cfg: CharacterConfig = {
      id: type, name: bossName ?? type.toUpperCase(), title: 'Enemy', badge: 'NEW v10.0', weaponStyle: 'martial', passiveName: '', passiveDesc: '',
      palettes: [{ name: 'Default', primary: '#444', secondary: '#222', accent: '#f55', vfx: '#ff5733' }],
      stats: { maxHp: Math.round(hpMap[type] * totalHpMult), maxMp: 100, maxRage: 100, mpRegenPerSec: 0, moveSpeedX: speedMap[type] ?? (isBoss ? 195 : 150), moveSpeedY: type === 'serum_stalker' || type === 'runner' ? 128 : 96, gravity: 1600, depthTolerance: 28 },
      defaultHurtbox: { x: -22, y: -88, w: 44, h: 88 },
      moves: {
        attack_1: { id: 'attack_1', label: 'Enemy Strike', totalFrames: 24, startupFrames: 8, recoveryFrames: 10, mpCost: 0, hitboxes: [{ startFrame: 8, endFrame: 13, rect: { x: 14, y: -74, w: isBoss ? 92 : 60, h: 48 }, damage: isBoss ? 76 : type === 'riot_brute' || type === 'chrono_sentinel' ? 48 : 30, hitstun: 18, hitstop: 4, knockback: { vx: isBoss ? 190 : 95, vz: isBoss ? 185 : 0 }, knockdown: isBoss, bleedDps: type === 'serum_stalker' || type === 'boss_plague_warden' ? 12 : undefined }] },
        heavy_red: { id: 'heavy_red', label: 'RED CRUSHER', totalFrames: 30, startupFrames: 10, recoveryFrames: 14, mpCost: 0, dashVelocityX: 270, hitboxes: [{ startFrame: 10, endFrame: 16, rect: { x: 10, y: -88, w: 118, h: 68 }, damage: 118, hitstun: 26, hitstop: 7, knockback: { vx: 300, vz: 260 }, knockdown: true, heavyRedBossAttack: true }] },
      },
    };
    const model = new CharacterModel(`e_${Date.now()}_${Math.random()}`, cfg, 0, x, groundY, false);
    if (isBoss) { model.isBoss = true; model.bossName = bossName ?? 'BOSS'; model.bossBars = bossBars; model.superArmor = true; model.maxStagger = Math.round(115 * (this.mods.ordeals.armoredFoes ? 1.35 : 1)); }
    const view = new CharacterView(this, model, texKey);
    if (bossTint) view.sprite.setTint(bossTint);
    const ctrl = new CharacterController(this, model, view, { onSuperFreeze: () => {}, onComboHit: () => {}, onInputLogged: () => {} });
    this.enemies.push(new EnemyAIController(ctrl, isBoss || type === 'riot_brute' || type === 'chrono_sentinel'));
  }

  private handleEnemySpecial(actor: CharacterController, skillKind: EnemySpecialKind): void {
    const bm = actor.model, dir = bm.facing;
    sfx.slash();
    if (skillKind === 'shockwave') {
      sfx.superFreeze(); AnimationFX.spawnShockwaveRing(this, bm.x, bm.groundY - 48, '#ff5733', 5.2); this.safeShake(200, 0.008);
      if (Phaser.Math.Distance.Between(this.player.model.x, this.player.model.groundY, bm.x, bm.groundY) < 210) {
        this.player.receiveHit({ startFrame: 0, endFrame: 1, rect: { x: 0, y: 0, w: 1, h: 1 }, damage: 85, hitstun: 24, hitstop: 6, knockback: { vx: 320, vz: 240 }, knockdown: true, heavyRedBossAttack: true }, 85 * this.mods.enemyDmgMult, false, this.player.model.x >= bm.x ? 1 : -1, bm.x, this.mods, true, actor);
      }
    } else if (skillKind === 'pulse_shot') this.projectiles.spawn({ owner: actor, kind: 'beam', x: bm.x + dir * 32, groundY: bm.groundY, z: 0, vx: dir * 480, radius: 18, color: 0xf59e0b, damage: 42, lifeSec: 1.4, maxHits: 1, stagger: 12 });
    else if (skillKind === 'void_orb') this.projectiles.spawn({ owner: actor, kind: 'orb_push', x: bm.x + dir * 34, groundY: bm.groundY, z: 0, vx: dir * 340, radius: 24, color: 0xa855f7, damage: 48, lifeSec: 1.8, maxHits: 1, stagger: 16 });
    else if (skillKind === 'toxic_wave') this.projectiles.spawn({ owner: actor, kind: 'flame', x: bm.x + dir * 44, groundY: bm.groundY, z: 0, vx: dir * 420, radius: 38, color: 0x84cc16, damage: 72, lifeSec: 1.5, maxHits: 1, stagger: 22 });
    else if (skillKind === 'rail_cannon') this.projectiles.spawn({ owner: actor, kind: 'beam', x: bm.x + dir * 48, groundY: bm.groundY, z: 0, vx: dir * 640, radius: 30, color: 0x38bdf8, damage: 84, lifeSec: 1.3, maxHits: 1, stagger: 26 });
    else if (skillKind === 'serum_spike') this.projectiles.spawn({ owner: actor, kind: 'slash', x: bm.x + dir * 42, groundY: bm.groundY, z: 0, vx: dir * 560, radius: 36, color: 0x34d399, damage: 78, lifeSec: 1.4, maxHits: 1, stagger: 24 });
    else if (skillKind === 'eclipse_scythe') this.projectiles.spawn({ owner: actor, kind: 'slash', x: bm.x + dir * 50, groundY: bm.groundY, z: 0, vx: dir * 540, radius: 52, color: 0xc084fc, damage: 92, lifeSec: 1.6, maxHits: 1, stagger: 28 });
    else if (skillKind === 'getsuga') this.projectiles.spawn({ owner: actor, kind: 'slash', x: bm.x + dir * 48, groundY: bm.groundY, z: 0, vx: dir * 520, radius: 48, color: 0xef4444, damage: 85, lifeSec: 1.5, maxHits: 1, stagger: 24 });
    else if (skillKind === 'purple') this.projectiles.spawn({ owner: actor, kind: 'purple', x: bm.x + dir * 56, groundY: bm.groundY, z: 0, vx: dir * 360, radius: 54, color: 0xa855f7, damage: 108, lifeSec: 1.9, maxHits: 1, stagger: 32 });
  }

  private triggerSuperFreeze(frames: number, title: string, color: string): void {
    this.superFreezeFrames = frames; this.superOverlay.setFillStyle(0x05060a, 0.72); this.superBanner.setVisible(false);
    AnimationFX.playSuperCutIn(this, this.player.model.config.id, title, color); this.safeShake(180, 0.008);
  }

  private showBranchChoiceOverlay(onChosen: () => void): void {
    const cont = this.add.container(640, 360).setDepth(9600);
    const scrim = this.add.rectangle(0, 0, 1280, 720, 0x05070c, 0.86);
    const header = this.add.text(0, -195, 'CHƯƠNG 4 · CHỌN NHÁNH RẼ (ABSOLUM BRANCHING PATH)', { fontFamily: 'Impact, system-ui', fontSize: '32px', color: '#facc15', stroke: '#000', strokeThickness: 5 }).setOrigin(0.5);
    cont.add([scrim, header]);
    const options = [
      { title: 'TUYẾN NGẮN · ĐỘT KÍCH THẲNG', tag: 'RỦI RO CAO · THƯỞNG NỘ', desc: 'Đối đầu ngay 1 Vệ Binh Tinh Nhuệ & Tu Sĩ Hư Không.\nNhận ngay +50 Rage & +2.500 Điểm thưởng!', color: 0xff5733, apply: () => { this.player.model.rage = Math.min(100, this.player.model.rage + 50); this.score += 2500; this.props.spawnStageProps(true, false); this.spawnSingleEnemy('boss_iron_vanguard', 1050, 500, 'ECLIPSE VANGUARD ELITE', 2); this.spawnEnemyGroup([{ type: 'void_acolyte', count: 3 }]); } },
      { title: 'TUYẾN DÀI · KHO TIẾP TẾ SYNDICATE', tag: 'AN TOÀN · BUFF VĨNH VIỄN', desc: 'Đi qua kho tiếp tế với 4 hòm đồ (HP/MP/Rage)\nvà nhận ngay +15% Sát thương cho Chương 4–5!', color: 0x34d399, apply: () => { this.mods.damageMult += 0.15; this.props.spawnStageProps(false, true); this.spawnEnemyGroup([{ type: 'void_acolyte', count: 3 }, { type: 'serum_stalker', count: 3 }]); } },
    ];
    options.forEach((opt, i) => {
      const cx = i === 0 ? -240 : 240;
      const panel = ArcadeUI.drawMetalPanel(this, cx, 15, 420, 270, opt.color, 0x1e2430, 0x0a0d13);
      const hit = this.add.rectangle(cx, 15, 420, 270, 0x000000, 0).setInteractive({ useHandCursor: true });
      const tag = this.add.text(cx, -85, `[${opt.tag}]`, { fontFamily: 'monospace', fontSize: '13px', color: '#facc15' }).setOrigin(0.5);
      const t = this.add.text(cx, -45, opt.title, { fontFamily: 'system-ui', fontSize: '19px', fontStyle: 'bold', color: '#ffffff' }).setOrigin(0.5);
      const d = this.add.text(cx, 35, opt.desc, { fontFamily: 'system-ui', fontSize: '15px', color: '#cbd5e1', align: 'center', wordWrap: { width: 360 } }).setOrigin(0.5);
      hit.on('pointerdown', () => { sfx.pickup(); cont.destroy(); this.buffOverlay = null; opt.apply(); onChosen(); });
      cont.add([panel, tag, t, d, hit]);
    });
    this.buffOverlay = cont;
  }

  private showRoguelikeBuffPicker(): void {
    const picks = Phaser.Utils.Array.Shuffle([...ROGUELIKE_BUFFS]).slice(0, 3);
    const cont = this.add.container(640, 360).setDepth(9600);
    const scrim = this.add.rectangle(0, 0, 1280, 720, 0x05070c, 0.84);
    const header = this.add.text(0, -195, 'ROGUELIKE RIFT · CHỌN 1 THẺ BUFF ĐỘT BIẾN', { fontFamily: 'Impact, system-ui', fontSize: '34px', color: '#facc15', stroke: '#000', strokeThickness: 5 }).setOrigin(0.5);
    cont.add([scrim, header]);
    picks.forEach((buff, i) => {
      const cx = (i - 1) * 320;
      const panel = ArcadeUI.drawMetalPanel(this, cx, 10, 286, 268, 0xd4af37, 0x1e2430, 0x0a0d13);
      const hit = this.add.rectangle(cx, 10, 286, 268, 0x000000, 0).setInteractive({ useHandCursor: true });
      const tag = this.add.text(cx, -92, `[${buff.tag}]`, { fontFamily: 'monospace', fontSize: '14px', color: '#facc15' }).setOrigin(0.5);
      const name = this.add.text(cx, -50, buff.name, { fontFamily: 'system-ui', fontSize: '20px', fontStyle: 'bold', color: '#ffffff' }).setOrigin(0.5);
      const desc = this.add.text(cx, 25, buff.desc, { fontFamily: 'system-ui', fontSize: '15px', color: '#cbd5e1', align: 'center', wordWrap: { width: 240 } }).setOrigin(0.5);
      hit.on('pointerdown', () => {
        sfx.pickup(); buff.apply(this.mods); this.player.model.hp = Math.min(this.player.model.maxHp, this.player.model.hp + 180);
        cont.destroy(); this.buffOverlay = null; this.towerFloor++; this.props.spawnStageProps(true);
        this.spawnEnemyGroup([{ type: 'serum_stalker', count: 2 + (this.towerFloor % 3) }, { type: 'void_acolyte', count: 2 }]);
        if (this.towerFloor % 3 === 0) {
          sfx.warning(); this.game.events.emit('hud:bossWarning');
          const riftBosses: EnemyArchetype[] = ['boss_plague_warden', 'boss_iron_vanguard', 'boss_chimera_alpha', 'boss_eclipse_archon'];
          this.spawnSingleEnemy(riftBosses[Math.floor(this.towerFloor / 3) % riftBosses.length], 1120, 510, `RIFT GUARDIAN TẦNG ${this.towerFloor}`, 3);
        }
      });
      cont.add([panel, tag, name, desc, hit]);
    });
    this.buffOverlay = cont;
  }

  private updatePartnerAI(dt: number, enemyCtrls: CharacterController[], gravityMult: number): void {
    if (!this.partner || this.partner.model.hp <= 0) return;
    const pm = this.partner.model, target = enemyCtrls.find(e => e.model.hp > 0);
    if (target && (pm.state === FighterState.IDLE || pm.state === FighterState.RUN)) {
      const dx = target.model.x - pm.x, dy = target.model.groundY - pm.groundY;
      pm.facing = dx >= 0 ? 1 : -1; this.partnerAiTimer -= dt;
      if (Math.abs(dx) < 92 && Math.abs(dy) < 34 && this.partnerAiTimer <= 0) { this.partner.enterAttack(pm.mp >= 30 ? 'skill_i' : 'attack_1', this.mods); this.partnerAiTimer = 1.1; }
      else { pm.vx = Math.abs(dx) > 76 ? pm.facing * 210 : 0; pm.vy = Math.abs(dy) > 16 ? Math.sign(dy) * 115 : 0; pm.state = (pm.vx !== 0 || pm.vy !== 0) ? FighterState.RUN : FighterState.IDLE; }
    }
    this.partner.update(dt, 0, enemyCtrls, this.mods, 40, 1240, gravityMult);
  }

  private tryTagSwitch(): void {
    if (this.dialogueActive || this.buffOverlay || this.pauseOverlay || this.tagCooldown > 0) return;
    if (this.initData.mode === 'vs_arena' && this.initData.vsSubMode === '1v1') return;
    if (this.initData.mode !== 'vs_arena' && this.initData.mode !== 'boss_raid' && !this.initData.storyCoopPartner) return;
    this.tagCooldown = 3.0;
    const oldModel = this.player.model, nextCfg = getCharacterById(this.tagReserveId);
    this.tagReserveId = oldModel.config.id;
    const newModel = new CharacterModel('player', nextCfg, 0, oldModel.x, oldModel.groundY, true);
    newModel.hp = Math.min(newModel.maxHp, Math.max(oldModel.hp, newModel.maxHp * 0.6)); newModel.mp = oldModel.mp; newModel.rage = oldModel.rage; newModel.lives = oldModel.lives; newModel.facing = oldModel.facing;
    this.player.view.destroy();
    const newView = new CharacterView(this, newModel, `hero_${nextCfg.id}_0`);
    this.player = new CharacterController(this, newModel, newView, {
      onSuperFreeze: (f, t, c) => this.triggerSuperFreeze(f, t, c), onComboHit: (d) => this.registerComboHit(d),
      onInputLogged: (s) => { this.inputHistory.push(s); if (this.inputHistory.length > 12) this.inputHistory.shift(); },
      onMoveStarted: (c, mv) => this.spawnSkillProjectile(c, mv), onTrialEvent: (tk) => { this.trialsDone.add(tk); },
    });
    sfx.parry(); AnimationFX.spawnDustPuff(this, newModel.x, newModel.groundY, newModel.facing);
    newView.spawnDamageNumber(newModel.x, newModel.groundY - 50, 0, true, `TAG IN: ${nextCfg.name.toUpperCase()}!`);
    this.player.enterAttack('skill_u', this.mods);
  }

  private tryAssistCall(): void {
    if (this.dialogueActive || this.buffOverlay || this.pauseOverlay || this.assistCooldown > 0) return;
    if (this.initData.mode === 'vs_arena' && this.initData.vsSubMode === '1v1') return;
    if (this.initData.mode !== 'vs_arena' && this.initData.mode !== 'boss_raid' && !this.initData.storyCoopPartner) return;
    this.assistCooldown = 6.0;
    const pm = this.player.model, assistCfg = getCharacterById(this.tagReserveId);
    sfx.slash(); this.player.view.spawnDamageNumber(pm.x, pm.groundY - 75, 0, false, `ASSIST: ${assistCfg.name.toUpperCase()}!`);
    this.projectiles.spawn({ owner: this.player, kind: 'slash', x: pm.x + pm.facing * 30, groundY: pm.groundY, z: 0, vx: pm.facing * 640, radius: 48, color: 0x34d399, damage: 110, lifeSec: 1.2, maxHits: 6, stagger: 35 });
  }

  private tryTeamUltimate(): void {
    if (this.dialogueActive || this.buffOverlay || this.pauseOverlay) return;
    if (this.initData.mode === 'vs_arena' && this.initData.vsSubMode === '1v1') return;
    if (this.initData.mode !== 'boss_raid' && this.initData.mode !== 'vs_arena' && !this.initData.storyCoopPartner) return;
    if (this.player.model.rage < 100) return;
    this.player.model.rage = 0; this.superFreezeFrames = 26; sfx.superFreeze();
    AnimationFX.playTeamUltimateCutIn(this, this.player.model.config.id, this.partner ? this.partner.model.config.id : this.tagReserveId, 'TEAM ULTIMATE · MULTIVERSE BURST!');
    this.safeShake(260, 0.012);
    for (const e of this.enemies) {
      if (e.ctrl.model.hp > 0) {
        const dmg = 440 * this.mods.damageMult;
        e.ctrl.receiveHit({ startFrame: 0, endFrame: 1, rect: { x: 0, y: 0, w: 1, h: 1 }, damage: 440, hitstun: 45, hitstop: 10, knockback: { vx: 340, vz: 380 }, knockdown: true, staggerDamage: 120 }, dmg, true, this.player.model.facing, this.player.model.x, this.mods);
        this.registerComboHit(dmg);
      }
    }
  }

  update(time: number, delta: number): void {
    const dt = Math.min(delta / 1000, 0.05);
    if (this.pauseOverlay || this.settingsOverlay) { this.emitHud(); return; }
    if (this.tagCooldown > 0) this.tagCooldown = Math.max(0, this.tagCooldown - dt);
    if (this.assistCooldown > 0) this.assistCooldown = Math.max(0, this.assistCooldown - dt);
    if (this.cloudLayer) this.cloudLayer.tilePositionX += 18 * dt;
    for (const r of this.rainLines) { r.x -= 180 * dt; r.y += 520 * dt; if (r.y > 740) { r.y = -20; r.x = Math.random() * 1400; } }
    if (this.dialogueActive || this.buffOverlay) { this.emitHud(); return; }

    const enemyCtrls = this.enemies.map(e => e.ctrl);
    const gravityMult = this.activeMutation?.lowGravity ? 0.7 : 1;

    if (this.superFreezeFrames > 0) {
      this.superFreezeFrames--; this.player.update(dt, time, enemyCtrls, this.mods, 40, 1240, gravityMult);
      if (this.superFreezeFrames === 0) { this.superOverlay.setFillStyle(0x05060a, 0); this.superBanner.setVisible(false); }
      this.emitHud(); return;
    }

    if (this.initData.mode === 'survival') this.survivalTimer += dt;
    if (this.comboTimer > 0) { this.comboTimer -= dt; if (this.comboTimer <= 0) this.comboCount = 0; }

    this.player.update(dt, time, enemyCtrls, this.mods, 40, 1240, gravityMult);
    this.updatePartnerAI(dt, enemyCtrls, gravityMult);
    this.projectiles.update(dt, [...enemyCtrls, this.player], this.mods, (dmg) => this.registerComboHit(dmg));

    this.props.update(dt, this.player, enemyCtrls, (bx, by) => {
      sfx.superFreeze(); AfterimageVFX.spawnExplosion(this, bx, by, 0xff5733); this.safeShake(160, 0.008);
      for (const e of enemyCtrls) {
        if (e.model.hp > 0 && Phaser.Math.Distance.Between(e.model.x, e.model.groundY, bx, by) < 150) {
          e.receiveHit({ startFrame: 0, endFrame: 1, rect: { x: 0, y: 0, w: 1, h: 1 }, damage: 140, hitstun: 26, hitstop: 5, knockback: { vx: 240, vz: 310 }, knockdown: true, staggerDamage: 45 }, 140, true, e.model.x >= bx ? 1 : -1, bx, this.mods);
          this.registerComboHit(140);
        }
      }
    }, (shockedEnemy, fx) => {
      sfx.hit(true);
      shockedEnemy.receiveHit({ startFrame: 0, endFrame: 1, rect: { x: 0, y: 0, w: 1, h: 1 }, damage: 95, hitstun: 28, hitstop: 5, knockback: { vx: 260, vz: 260 }, knockdown: true, staggerDamage: 36 }, 95, true, 1, fx, this.mods);
      shockedEnemy.view.spawnDamageNumber(shockedEnemy.model.x, shockedEnemy.model.groundY - 56, 0, true, '⚡ SHOCK!');
      this.registerComboHit(95);
    });

    if (this.cursedCabinet && this.player.model.state === FighterState.ATTACK) {
      if (Phaser.Math.Distance.Between(this.player.model.x, this.player.model.groundY, 1160, 420) < 110 && this.player.model.currentFrame === 6) {
        this.cursedHp--; this.safeShake(120, 0.006);
        if (this.cursedHp <= 0) {
          this.clearCursedArcade(); this.cursedCleared++; this.score += 1500; sfx.warning(); this.game.events.emit('hud:bossWarning');
          this.spawnSingleEnemy('boss_eclipse_archon', 1050, 480, `CURSED ARCADE GUARDIAN (${this.cursedCleared}/3)`, 2);
        }
      }
    }

    const passiveDummy = this.initData.mode === 'training' && !this.dummyAggressive;
    for (const ai of this.enemies) {
      ai.updateAI(dt, this.player, this.mods, 40, 1240, () => { if (this.activeAttackTokens >= this.maxAttackTokens) return false; this.activeAttackTokens++; return true; }, () => { this.activeAttackTokens = Math.max(0, this.activeAttackTokens - 1); }, passiveDummy, gravityMult, (actor, skillKind) => this.handleEnemySpecial(actor, skillKind));
    }

    if (this.enemies.every(e => e.ctrl.model.hp <= 0)) this.handleWaveCleared();

    if (this.player.model.hp <= 0) {
      if (this.player.model.lives > 1) { this.player.model.lives--; this.player.model.hp = this.player.model.maxHp; this.player.model.mp = this.player.model.maxMp; this.player.enterIdle(); }
      else {
        submitTowerScore({ player_name: 'Player1', hero_id: this.player.model.config.id, floor_reached: this.towerFloor, max_combo: this.maxCombo, score: Math.round(this.score), mystic_ordeal: this.mods.mysticOrdeal });
        this.scene.stop('HudScene'); this.scene.start('TitleSelectScene'); return;
      }
    }

    this.drawDebugHitboxes(); this.emitHud();
  }

  private handleWaveCleared(): void {
    for (const e of this.enemies) e.ctrl.view.destroy();
    this.enemies = []; this.activeAttackTokens = 0;

    if (this.initData.mode === 'training') { this.spawnEnemyGroup([{ type: 'rift_crawler', count: 2 }, { type: 'riot_brute', count: 1 }]); return; }
    if (this.initData.mode === 'roguelike') { this.showRoguelikeBuffPicker(); return; }
    if (this.initData.mode === 'vs_arena') {
      this.towerFloor++; const nextRival = CHARACTERS[this.towerFloor % CHARACTERS.length]; this.player.model.hp = this.player.model.maxHp; this.spawnRivalHero(nextRival);
      if ((this.initData.vsSubMode ?? '2v2') === '2v2') this.spawnRivalHero(CHARACTERS[(this.towerFloor + 3) % CHARACTERS.length]);
      this.showDialogue([{ speaker: 'VS ARENA · K.O.!', color: '#facc15', text: `Chiến thắng! Trận ${this.towerFloor} — Đối thủ tiếp theo: ${nextRival.name}!` }]); return;
    }
    if (this.initData.mode === 'boss_raid') {
      this.showDialogue([{ speaker: 'BOSS RAID CLEAR!', color: '#34d399', text: 'Bạn và đồng đội AI đã tiêu diệt Zero Point Overlord! Nhấn ESC mở menu.' }]);
      this.spawnSingleEnemy('boss_zeropoint', 1050, 510, 'ZERO POINT OVERLORD (REMATCH)', 5); return;
    }
    if (this.initData.mode === 'endless' || this.initData.mode === 'survival') {
      this.towerFloor++; this.player.model.hp = Math.min(this.player.model.maxHp, this.player.model.hp + 160); this.props.spawnStageProps(this.towerFloor % 2 === 0);
      if (this.initData.mode === 'endless' && this.towerFloor > 100) {
        submitTowerScore({ player_name: 'Player1', hero_id: this.player.model.config.id, floor_reached: 100, max_combo: this.maxCombo, score: Math.round(this.score + 50000), mystic_ordeal: this.mods.mysticOrdeal });
        this.showDialogue([{ speaker: 'ENDLESS CORRIDOR · 100 TẦNG CLEAR!', color: '#facc15', text: 'CHÚC MỪNG! Bạn đã chinh phục trọn vẹn 100 tầng Tháp Vô Tận!' }]); this.towerFloor = 1;
      }
      if (this.initData.mode === 'endless' && this.towerFloor % 5 === 0) {
        const mut = ENDLESS_MUTATIONS[Math.floor((this.towerFloor / 5 - 1) % ENDLESS_MUTATIONS.length)];
        this.activeMutation = mut; this.mods.enemySpeedMult = DIFFICULTY_PRESETS[this.mods.difficulty].enemySpeedMult * mut.enemySpeedMult; this.mods.rageGainMult = mut.playerRageMult;
        this.showDialogue([{ speaker: `LUẬT BIẾN DỊ TẦNG ${this.towerFloor} · ${mut.name}`, color: '#c084fc', text: mut.desc }]);
      }
      const mobPool: EnemyArchetype[] = ['rift_crawler', 'riot_brute', 'syndicate_gunner', 'serum_stalker', 'void_acolyte', 'chrono_sentinel'];
      this.spawnEnemyGroup([{ type: mobPool[this.towerFloor % mobPool.length], count: 2 + (this.towerFloor % 3) }, { type: mobPool[(this.towerFloor + 2) % mobPool.length], count: 2 }]);
      if (this.towerFloor % 2 === 0) {
        sfx.warning(); this.game.events.emit('hud:bossWarning');
        const palTints = [0xff5733, 0x38bdf8, 0xc084fc, 0x34d399, 0xfacc15];
        const bossPool: EnemyArchetype[] = ['boss_plague_warden', 'boss_iron_vanguard', 'boss_chimera_alpha', 'boss_eclipse_archon', 'boss_zeropoint'];
        this.spawnSingleEnemy(bossPool[Math.floor(this.towerFloor / 2) % bossPool.length], 1120, 520, `CORRIDOR BOSS · TẦNG ${this.towerFloor}`, 3, palTints[this.towerFloor % palTints.length]);
      }
      return;
    }

    const ch = STORY_CHAPTERS[this.chapterIdx];
    this.waveIdx++;
    if (this.waveIdx < ch.waves.length) this.spawnEnemyGroup(ch.waves[this.waveIdx]);
    else if (!this.bossSpawned) {
      this.bossSpawned = true; sfx.warning(); sfx.playBgm('bgm_boss'); this.game.events.emit('hud:bossWarning');
      this.showDialogue(ch.bossDialogue); this.spawnSingleEnemy(ch.bossType, 1080, 520, ch.bossName, ch.bossBars);
    } else {
      this.chapterIdx++; this.waveIdx = 0; this.bossSpawned = false; this.clearCursedArcade(); this.player.model.hp = this.player.model.maxHp;
      if (this.chapterIdx < STORY_CHAPTERS.length) {
        const nextCh = STORY_CHAPTERS[this.chapterIdx];
        this.drawStageBackdrop(); sfx.playBgm(`bgm_${this.chapterIdx}`);
        if (nextCh.hasBranchChoice) this.showDialogue(nextCh.introDialogue, () => { this.showBranchChoiceOverlay(() => { if (nextCh.hasCursedArcade) this.spawnCursedArcade(); }); });
        else { this.props.spawnStageProps(nextCh.id === 2 || nextCh.id === 5); this.showDialogue(nextCh.introDialogue); this.spawnEnemyGroup(nextCh.waves[0]); if (nextCh.hasCursedArcade) this.spawnCursedArcade(); }
      } else {
        const ending = this.cursedCleared >= 3 ? 'TRUE ENDING MỞ KHÓA (3/3 CURSED ARCADE)! Vết nứt Đa vũ trụ khép lại vĩnh viễn và Tử Nhu hoàn thiện huyết thanh!' : `NORMAL ENDING! Zero Point Overlord đã bị tiêu diệt (Đã phá ${this.cursedCleared}/3 Cursed Arcade).`;
        submitTowerScore({ player_name: 'Player1', hero_id: this.player.model.config.id, floor_reached: 5, max_combo: this.maxCombo, score: Math.round(this.score + 10000), mystic_ordeal: this.mods.mysticOrdeal });
        this.showDialogue([{ speaker: 'CRAZY ZOMBIE 10.0 · CAMPAIGN CLEAR', color: '#facc15', text: ending }]);
        this.chapterIdx = 0; this.cursedCleared = 0; this.drawStageBackdrop();
      }
    }
  }

  private drawDebugHitboxes(): void {
    this.debugGfx.clear(); if (!this.debugHitbox) return;
    const all = [this.player.model, ...this.enemies.map(e => e.ctrl.model)];
    if (this.partner) all.push(this.partner.model);
    for (const m of all) {
      if (m.hp <= 0) continue;
      const hurt = HitboxSystem.toWorldRect(m, m.config.defaultHurtbox);
      this.debugGfx.lineStyle(2, 0x22d3ee, 0.9).strokeRect(hurt.x, hurt.y, hurt.width, hurt.height);
      for (const hb of HitboxSystem.getActiveHitboxes(m)) {
        this.debugGfx.fillStyle(0xff5733, 0.25).fillRect(hb.rect.x, hb.rect.y, hb.rect.width, hb.rect.height);
        this.debugGfx.lineStyle(2, 0xff5733, 1).strokeRect(hb.rect.x, hb.rect.y, hb.rect.width, hb.rect.height);
      }
    }
  }

  private emitHud(): void {
    const bossAi = this.enemies.find(e => e.ctrl.model.isBoss && e.ctrl.model.hp > 0);
    const ch = STORY_CHAPTERS[this.chapterIdx] ?? STORY_CHAPTERS[0];
    const subVs = (this.initData.vsSubMode ?? '2v2').toUpperCase();
    const arena = VS_ARENAS[this.initData.vsArenaIdx ?? 0] ?? VS_ARENAS[0];
    const modeLabels: Record<GameMode, string> = {
      story: ch.title, roguelike: `ROGUELIKE RIFT · PHÒNG ${this.towerFloor}`,
      boss_raid: 'BOSS RAID CO-OP · ZERO POINT OVERLORD (3 PHA)', endless: `ENDLESS CORRIDOR · TẦNG ${this.towerFloor}/100`,
      vs_arena: `VS ARENA ${subVs} · ${arena.name.toUpperCase()} · TRẬN ${this.towerFloor}`,
      survival: `ESCHATOLOGY SURVIVAL · ${Math.floor(this.survivalTimer)}s · WAVE ${this.towerFloor}`,
      training: 'TRAINING & 5 COMBO TRIALS [F2 HITBOX]',
    };
    const subLabel = `${DIFFICULTY_PRESETS[this.mods.difficulty].label} · x${this.mods.scoreMult.toFixed(2)} ĐIỂM${this.activeMutation ? ` | BIẾN DỊ: ${this.activeMutation.name}` : ''}${this.initData.mode === 'story' ? ` | CURSED ARCADE: ${this.cursedCleared}/3` : ''} · [ESC] Tạm dừng`;
    this.game.events.emit('hud:update', { player: this.player.model, boss: bossAi?.ctrl.model ?? null, comboCount: this.comboCount, score: this.score, stageLabel: modeLabels[this.initData.mode], subLabel, inputHistory: this.inputHistory, debugHitbox: this.debugHitbox, isTraining: this.initData.mode === 'training', dummyAggressive: this.dummyAggressive, trialsDone: Array.from(this.trialsDone) });
  }
}
