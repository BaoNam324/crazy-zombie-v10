export enum FighterState {
  IDLE = 'IDLE',
  RUN = 'RUN',
  ATTACK = 'ATTACK',
  PARRY = 'PARRY',
  HURT = 'HURT',
  KNOCKDOWN = 'KNOCKDOWN',
  DEAD = 'DEAD',
}

export type GameMode = 'story' | 'roguelike' | 'boss_raid' | 'endless' | 'vs_arena' | 'survival' | 'training';
export type Difficulty = 'easy' | 'normal' | 'hard' | 'eschatology';
export type VsSubMode = '2v2' | '1v1';

export interface MysticOrdealConfig {
  fastEnemies: boolean;
  armoredFoes: boolean;
  manaDrain: boolean;
}

export interface RectData {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface PaletteConfig {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  vfx: string;
}

export interface HitboxFrameData {
  startFrame: number;
  endFrame: number;
  rect: RectData;
  damage: number;
  hitstun: number;
  hitstop: number;
  knockback: { vx: number; vz: number };
  knockdown: boolean;
  staggerDamage?: number;
  bleedDps?: number;
  pullStrength?: number;
  wallBounce?: boolean;
  freezeNormalSec?: number;
  freezeBossSec?: number;
  bossVulnBonus?: number;
  armorPierce?: boolean;
  heavyRedBossAttack?: boolean;
}

export interface MoveData {
  id: string;
  label: string;
  totalFrames: number;
  startupFrames: number;
  recoveryFrames: number;
  mpCost: number;
  rageCost?: number;
  rageGain?: number;
  cooldownSec?: number;
  nextCombo?: string;
  cancelWindow?: { start: number; end: number };
  canCancelIntoSkill?: boolean;
  dashVelocityX?: number;
  superFreezeFrames?: number;
  corridorHit?: boolean;
  fullScreenHit?: boolean;
  mpLockoutSec?: number;
  airUsable?: boolean;
  multiHitVisual?: number;
  frameOffsets?: Record<string, { x: number; y: number }>;
  hitboxes: HitboxFrameData[];
}

export interface CharacterConfig {
  id: string;
  name: string;
  title: string;
  badge: 'NEW v10.0' | 'REWORK v10.0';
  weaponStyle: 'three-swords' | 'sorcerer' | 'greatsword' | 'martial' | 'flame-claw' | 'saber' | 'rapier';
  passiveName: string;
  passiveDesc: string;
  palettes: PaletteConfig[];
  stats: {
    maxHp: number;
    maxMp: number;
    maxRage: number;
    mpRegenPerSec: number;
    moveSpeedX: number;
    moveSpeedY: number;
    gravity: number;
    depthTolerance: number;
  };
  defaultHurtbox: RectData;
  moves: Record<string, MoveData>;
}

export interface DialogueLine {
  speaker: string;
  color: string;
  text: string;
}

export type EnemyArchetype =
  | 'zombie'
  | 'runner'
  | 'raider'
  | 'subboss'
  | 'boss_clone'
  | 'rift_crawler'
  | 'riot_brute'
  | 'syndicate_gunner'
  | 'serum_stalker'
  | 'void_acolyte'
  | 'chrono_sentinel'
  | 'boss_plague_warden'
  | 'boss_iron_vanguard'
  | 'boss_chimera_alpha'
  | 'boss_eclipse_archon'
  | 'boss_zeropoint';

export interface EnemySpawnSpec {
  type: EnemyArchetype;
  count: number;
}

export interface ChapterConfig {
  id: number;
  code: string;
  title: string;
  subtitle: string;
  skyTop: number;
  skyBottom: number;
  rain: boolean;
  hasCursedArcade: boolean;
  hasBranchChoice?: boolean;
  introDialogue: DialogueLine[];
  bossDialogue: DialogueLine[];
  waves: EnemySpawnSpec[][];
  bossType: EnemyArchetype;
  bossName: string;
  bossBars: number;
}

export interface RoguelikeBuff {
  id: string;
  name: string;
  desc: string;
  tag: 'ATK' | 'MP' | 'DEF' | 'COMBO';
  apply: (mods: RunModifiers) => void;
}

export interface EndlessMutation {
  id: string;
  name: string;
  desc: string;
  enemySpeedMult: number;
  enemyDmgMult: number;
  playerRageMult: number;
  lowGravity: boolean;
}

export interface VsArenaConfig {
  id: number;
  code: string;
  name: string;
  skyTop: number;
  tint: number;
  midKey: string;
  rain: boolean;
  hasTraps: boolean;
}

export interface RunModifiers {
  damageMult: number;
  mpCostMult: number;
  mpRegenBonus: number;
  rageGainMult: number;
  parryHeal: number;
  critChance: number;
  lightningOnHit: boolean;
  mysticOrdeal: boolean;
  ordeals: MysticOrdealConfig;
  difficulty: Difficulty;
  enemyHpMult: number;
  enemyDmgMult: number;
  enemySpeedMult: number;
  scoreMult: number;
}
