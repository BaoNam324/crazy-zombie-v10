import { CharacterConfig, FighterState, MoveData, PaletteConfig, RunModifiers } from '../types/game';

export class CharacterModel {
  readonly id: string;
  readonly isPlayer: boolean;
  readonly config: CharacterConfig;
  readonly palette: PaletteConfig;

  x: number;
  groundY: number;
  z = 0;
  vx = 0;
  vy = 0;
  vz = 0;
  facing: 1 | -1 = 1;

  hp: number;
  maxHp: number;
  whiteHp = 0;
  mp: number;
  maxMp: number;
  rage = 0;
  lives = 3;

  isBoss = false;
  bossName = '';
  bossBars = 1;
  bossPhase = 1;
  superArmor = false;
  stagger = 0;
  maxStagger = 100;
  vulnBonus = 0;
  vulnTimer = 0;

  state: FighterState = FighterState.IDLE;
  currentMoveId: string | null = null;
  currentFrame = 0;
  frameAccumulator = 0;
  stateTimer = 0;
  hitstopFrames = 0;

  frozenTimer = 0;
  slowTimer = 0;
  bleedTimer = 0;
  bleedDps = 0;
  mpLockoutTimer = 0;
  juggleCount = 0;
  wallBouncedThisCombo = false;

  swordIntent = 0;
  swordIntentTimer = 0;
  limitlessReady = false;
  limitlessCooldown = 0;
  kaiokenTimer = 0;
  kameChargeLevel = 1;
  busterCharge = 0;
  overdriveTimer = 0;
  parryWindowFrames = 0;

  cooldowns = new Map<string, number>();
  hasHitCurrentMove = false;
  hitTargetIds = new Set<string>();

  constructor(id: string, config: CharacterConfig, paletteIndex: number, x: number, groundY: number, isPlayer: boolean) {
    this.id = id;
    this.config = config;
    this.palette = config.palettes[paletteIndex % config.palettes.length];
    this.x = x;
    this.groundY = groundY;
    this.isPlayer = isPlayer;
    this.maxHp = config.stats.maxHp;
    this.hp = this.maxHp;
    this.maxMp = config.stats.maxMp;
    this.mp = this.maxMp;
    if (config.id === 'gojo') this.limitlessReady = true;
    if (config.id === 'zero') this.busterCharge = 100;
  }

  get isAirborne(): boolean { return this.z > 0; }
  get currentMove(): MoveData | null { return this.currentMoveId ? this.config.moves[this.currentMoveId] ?? null : null; }
  getEffectiveMpCost(move: MoveData, mods?: RunModifiers): number { return Math.round(move.mpCost * (mods?.mpCostMult ?? 1)); }

  canUseMove(move: MoveData, mods?: RunModifiers): boolean {
    const cd = this.cooldowns.get(move.id) ?? 0;
    if (cd > 0) return false;
    return this.mp >= this.getEffectiveMpCost(move, mods) && this.rage >= (move.rageCost ?? 0);
  }

  consumeMoveCost(move: MoveData, mods?: RunModifiers): void {
    this.mp = Math.max(0, this.mp - this.getEffectiveMpCost(move, mods));
    if (move.rageCost) this.rage = Math.max(0, this.rage - move.rageCost);
    if (move.cooldownSec) this.cooldowns.set(move.id, move.cooldownSec);
    if (move.mpLockoutSec) this.mpLockoutTimer = move.mpLockoutSec;
  }

  tickTimers(dt: number, mods?: RunModifiers): void {
    for (const [k, v] of this.cooldowns.entries()) {
      const next = v - dt;
      if (next <= 0) this.cooldowns.delete(k);
      else this.cooldowns.set(k, next);
    }
    if (this.mpLockoutTimer > 0) {
      this.mpLockoutTimer = Math.max(0, this.mpLockoutTimer - dt);
    } else if (this.isPlayer && this.state !== FighterState.DEAD) {
      if (this.config.id === 'ichigo' && this.overdriveTimer > 0) {
        this.mp = Math.max(0, this.mp - 4.5 * dt);
        if (this.mp <= 0) this.overdriveTimer = 0;
      } else {
        const regen = this.config.stats.mpRegenPerSec + (mods?.mpRegenBonus ?? 0);
        this.mp = Math.min(this.maxMp, this.mp + regen * dt);
      }
    }
    if (this.swordIntent > 0) {
      this.swordIntentTimer -= dt;
      if (this.swordIntentTimer <= 0) {
        this.swordIntent = Math.max(0, this.swordIntent - 1);
        this.swordIntentTimer = this.swordIntent > 0 ? 5 : 0;
      }
    }
    if (this.config.id === 'gojo' && !this.limitlessReady) {
      this.limitlessCooldown -= dt;
      if (this.limitlessCooldown <= 0) { this.limitlessReady = true; this.limitlessCooldown = 0; }
    }
    if (this.kaiokenTimer > 0) {
      this.kaiokenTimer = Math.max(0, this.kaiokenTimer - dt);
      if (this.hp > 60) {
        const drain = 10 * dt;
        this.hp = Math.max(60, this.hp - drain);
        this.whiteHp = Math.min(this.maxHp - this.hp, this.whiteHp + drain);
      }
    } else if (this.whiteHp > 0) {
      this.whiteHp = Math.max(0, this.whiteHp - 4 * dt);
    }
    if (this.config.id === 'zero' && this.busterCharge < 100 && this.state !== FighterState.DEAD) {
      this.busterCharge = Math.min(100, this.busterCharge + (this.overdriveTimer > 0 ? 50 : 25) * dt);
    }
    if (this.bleedTimer > 0 && this.hp > 0) {
      this.bleedTimer -= dt;
      this.hp = Math.max(1, this.hp - this.bleedDps * dt);
    }
    if (this.vulnTimer > 0) {
      this.vulnTimer -= dt;
      if (this.vulnTimer <= 0) this.vulnBonus = 0;
    }
    if (this.slowTimer > 0) this.slowTimer = Math.max(0, this.slowTimer - dt);
    if (this.overdriveTimer > 0) {
      this.overdriveTimer = Math.max(0, this.overdriveTimer - dt);
      if (this.config.id !== 'ichigo') this.mp = Math.min(this.maxMp, this.mp + 3.5 * dt);
    }
    if (this.frozenTimer > 0) this.frozenTimer = Math.max(0, this.frozenTimer - dt);
  }
}
