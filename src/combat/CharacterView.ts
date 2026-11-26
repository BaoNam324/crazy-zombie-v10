import Phaser from 'phaser';
import { FighterState } from '../types/game';
import { AnimationFX } from './AnimationFX';
import { CharacterModel } from './CharacterModel';

export class CharacterView {
  private readonly scene: Phaser.Scene;
  readonly sprite: Phaser.GameObjects.Sprite;
  readonly shadow: Phaser.GameObjects.Ellipse;
  readonly roadGlow: Phaser.GameObjects.Ellipse;
  readonly aura: Phaser.GameObjects.Arc;
  private slashGfx: Phaser.GameObjects.Graphics;
  private telegraphRing: Phaser.GameObjects.Arc;
  private wasAirborne = false;
  private baseScale = 1;

  constructor(scene: Phaser.Scene, model: CharacterModel, textureKey: string) {
    this.scene = scene;
    this.baseScale = model.isBoss ? 1.28 : 1;
    this.shadow = scene.add.ellipse(model.x, model.groundY, 56, 16, 0x000000, 0.5);
    this.roadGlow = scene.add.ellipse(model.x, model.groundY + 3, 96, 22, Phaser.Display.Color.HexStringToColor(model.palette.vfx).color, 0).setBlendMode(Phaser.BlendModes.ADD);
    this.aura = scene.add.circle(model.x, model.groundY - 46, 44, Phaser.Display.Color.HexStringToColor(model.palette.vfx).color, 0).setBlendMode(Phaser.BlendModes.ADD);
    this.telegraphRing = scene.add.circle(model.x, model.groundY - 48, 38, 0xff2222, 0);
    this.telegraphRing.setStrokeStyle(3, 0xff3b30, 0);
    this.sprite = scene.add.sprite(model.x, model.groundY, textureKey, 0).setOrigin(0.5, 1.0).setScale(this.baseScale);
    if (model.isBoss) this.shadow.setScale(1.3);
    this.slashGfx = scene.add.graphics();
  }

  private playSquash(sx: number, sy: number): void {
    this.sprite.setScale(this.baseScale * sx, this.baseScale * sy);
    this.scene.tweens.add({ targets: this.sprite, scaleX: this.baseScale, scaleY: this.baseScale, duration: 140, ease: 'Back.easeOut' });
  }

  sync(model: CharacterModel, isTelegraphing = false, isRedHeavyTelegraph = false): void {
    if (!this.wasAirborne && model.isAirborne) {
      this.playSquash(0.86, 1.16);
      AnimationFX.spawnDustPuff(this.scene, model.x, model.groundY, 0);
    } else if (this.wasAirborne && !model.isAirborne) {
      this.playSquash(1.2, 0.82);
      AnimationFX.spawnDustPuff(this.scene, model.x, model.groundY, 0);
    }
    this.wasAirborne = model.isAirborne;

    const offset = model.currentMove?.frameOffsets?.[String(model.currentFrame)] ?? { x: 0, y: 0 };
    const jitter = (model.hitstopFrames > 0 && (model.state === FighterState.HURT || model.state === FighterState.KNOCKDOWN))
      ? ((model.hitstopFrames % 2 === 0 ? 1 : -1) * 4.5) : 0;

    const drawX = model.x + offset.x * model.facing + jitter;
    const drawY = model.groundY - model.z + offset.y;

    this.sprite.setFlipX(model.facing === -1);
    this.sprite.setPosition(drawX, drawY);
    this.sprite.setDepth(model.groundY);

    let frameIdx = 0;
    if (model.state === FighterState.IDLE) frameIdx = Math.floor(this.scene.time.now / 320) % 2;
    else if (model.state === FighterState.RUN) frameIdx = 2 + (Math.floor(this.scene.time.now / 90) % 4);
    else if (model.state === FighterState.ATTACK && model.currentMove) {
      const mv = model.currentMove;
      frameIdx = model.currentFrame < mv.startupFrames ? 7 : mv.id === 'attack_3' ? 9 : 8;
    } else if (model.state === FighterState.PARRY) frameIdx = 10;
    else if (model.state === FighterState.HURT || model.state === FighterState.KNOCKDOWN || model.state === FighterState.DEAD) frameIdx = 11;
    if (model.isAirborne && model.state !== FighterState.ATTACK && model.state !== FighterState.KNOCKDOWN && model.state !== FighterState.DEAD) frameIdx = 6;
    this.sprite.setFrame(frameIdx);
    this.sprite.setAngle(model.state === FighterState.KNOCKDOWN || model.state === FighterState.DEAD ? -46 * model.facing : 0);

    this.shadow.setPosition(model.x, model.groundY).setDepth(model.groundY - 2);
    this.shadow.setScale(Phaser.Math.Clamp(1 - model.z / 300, 0.35, 1) * (model.isBoss ? 1.3 : 1));

    this.aura.setPosition(drawX, drawY - 46).setDepth(model.groundY - 1);
    this.roadGlow.setPosition(model.x, model.groundY + 3).setDepth(model.groundY - 3);
    this.aura.setScale(0.92 + Math.sin(this.scene.time.now * 0.012) * 0.08);

    if (model.kaiokenTimer > 0) {
      this.aura.setFillStyle(0xef4444, 0.2).setStrokeStyle(3, 0xff3b30, 0.95);
      this.roadGlow.setFillStyle(0xef4444, 0.25);
    } else if (model.overdriveTimer > 0) {
      const odColor = model.config.id === 'ichigo' ? 0xef4444 : model.config.id === 'iori' ? 0xa855f7 : model.config.id === 'zero' ? 0x67e8f9 : 0xfacc15;
      this.aura.setFillStyle(odColor, 0.2).setStrokeStyle(3, odColor, 0.95);
      this.roadGlow.setFillStyle(odColor, 0.28);
    } else if (model.config.id === 'gojo' && model.limitlessReady) {
      this.aura.setFillStyle(0x38bdf8, 0.14).setStrokeStyle(2, 0x67e8f9, 0.72);
      this.roadGlow.setFillStyle(0x38bdf8, 0.16);
    } else if (model.config.id === 'zoro' && model.swordIntent > 0) {
      this.aura.setFillStyle(0x34d399, 0.08 * model.swordIntent).setStrokeStyle(2, 0x34d399, 0.42 + 0.18 * model.swordIntent);
      this.roadGlow.setFillStyle(0x34d399, 0.1 * model.swordIntent);
    } else if (model.config.id === 'zero' && model.busterCharge >= 100) {
      this.aura.setFillStyle(0x4ade80, 0.1).setStrokeStyle(2, 0x4ade80, 0.75);
      this.roadGlow.setFillStyle(0x4ade80, 0.15);
    } else if (model.superArmor) {
      this.aura.setFillStyle(0xf59e0b, 0.12).setStrokeStyle(2, 0xfacc15, 0.85);
      this.roadGlow.setFillStyle(0xf59e0b, 0.18);
    } else {
      this.aura.setFillStyle(0x000000, 0).setStrokeStyle(0, 0x000000, 0);
      this.roadGlow.setFillStyle(0x000000, 0);
    }

    if (model.frozenTimer > 0) this.sprite.setTint(0x67e8f9);
    else if (model.slowTimer > 0) this.sprite.setTint(0x93c5fd);
    else if (model.bleedTimer > 0 && Math.floor(this.scene.time.now / 160) % 2 === 0) this.sprite.setTint(0xff6b6b);
    else if (!this.sprite.isTinted) this.sprite.clearTint();

    this.telegraphRing.setPosition(drawX, drawY - 48).setDepth(model.groundY + 2);
    if (isTelegraphing) {
      this.telegraphRing.setRadius(isRedHeavyTelegraph ? 50 : 38);
      this.telegraphRing.setFillStyle(0xff1e1e, isRedHeavyTelegraph ? 0.28 : 0.08);
      this.telegraphRing.setStrokeStyle(isRedHeavyTelegraph ? 6 : 4, isRedHeavyTelegraph ? 0xff0000 : 0xff3b30, 0.98);
    } else {
      this.telegraphRing.setFillStyle(0xff2222, 0).setStrokeStyle(0, 0xff3b30, 0);
    }

    this.slashGfx.clear();
    if (model.state === FighterState.ATTACK && model.currentMove) {
      const active = model.currentMove.hitboxes.find(h => model.currentFrame >= h.startFrame && model.currentFrame <= h.endFrame);
      if (active) {
        const vfxColor = Phaser.Display.Color.HexStringToColor(model.palette.vfx).color;
        this.slashGfx.setDepth(model.groundY + 6);
        const cx = model.x + model.facing * 18;
        const cy = drawY - 54;
        const rad = Math.min(125, Math.max(46, active.rect.w * 0.78));
        const startA = model.facing === 1 ? -1.35 : Math.PI - 1.35;
        const endA = model.facing === 1 ? 1.15 : Math.PI + 1.15;
        this.slashGfx.lineStyle(14, vfxColor, 0.35).beginPath().arc(cx, cy, rad, startA, endA).strokePath();
        this.slashGfx.lineStyle(7, vfxColor, 0.92).beginPath().arc(cx, cy, rad, startA, endA).strokePath();
        this.slashGfx.lineStyle(2.5, 0xffffff, 0.96).beginPath().arc(cx, cy, rad, startA + 0.15, endA - 0.15).strokePath();
        this.roadGlow.setFillStyle(vfxColor, 0.34);
      }
    }
  }

  flashHit(color = 0xffffff): void {
    this.sprite.setTintFill(color);
    AnimationFX.spawnHitSpark(this.scene, this.sprite.x, this.sprite.y - 52, '#ff947d', color === 0xfacc15);
    this.scene.time.delayedCall(70, () => { if (this.sprite.active) this.sprite.clearTint(); });
  }

  spawnDamageNumber(x: number, y: number, amount: number, isCrit = false, label?: string): void {
    const txt = label ?? `${Math.round(amount)}${isCrit ? '!' : ''}`;
    const t = this.scene.add.text(x, y - 70, txt, {
      fontFamily: 'monospace', fontSize: isCrit ? '24px' : '18px', fontStyle: 'bold',
      color: label ? '#67e8f9' : isCrit ? '#facc15' : '#ffffff', stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(9000);
    this.scene.tweens.add({ targets: t, y: y - 122, alpha: 0, duration: 620, ease: 'Cubic.easeOut', onComplete: () => t.destroy() });
  }

  destroy(): void {
    this.sprite.destroy(); this.shadow.destroy(); this.roadGlow.destroy();
    this.aura.destroy(); this.slashGfx.destroy(); this.telegraphRing.destroy();
  }
}
