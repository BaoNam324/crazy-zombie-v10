import Phaser from 'phaser';
import { HitboxFrameData, RectData } from '../types/game';
import { CharacterModel } from './CharacterModel';

export class HitboxSystem {
  static toWorldRect(model: CharacterModel, local: RectData, rangeBonus = 1): Phaser.Geom.Rectangle {
    const w = local.w * rangeBonus;
    const worldX = model.facing === 1
      ? model.x + local.x
      : model.x - local.x - w;
    const worldY = (model.groundY - model.z) + local.y;
    return new Phaser.Geom.Rectangle(worldX, worldY, w, local.h);
  }

  static getActiveHitboxes(model: CharacterModel): { rect: Phaser.Geom.Rectangle; data: HitboxFrameData }[] {
    const move = model.currentMove;
    if (!move) return [];
    const rangeBonus = model.config.id === 'zoro' ? 1 + model.swordIntent * 0.08 : 1;
    const active: { rect: Phaser.Geom.Rectangle; data: HitboxFrameData }[] = [];
    for (const hb of move.hitboxes) {
      if (model.currentFrame >= hb.startFrame && model.currentFrame <= hb.endFrame) {
        active.push({ rect: this.toWorldRect(model, hb.rect, rangeBonus), data: hb });
      }
    }
    return active;
  }

  static checkAttackCollision(
    attacker: CharacterModel,
    targets: CharacterModel[],
    onHit: (defender: CharacterModel, hitData: HitboxFrameData) => void
  ): void {
    const move = attacker.currentMove;
    if (!move) return;
    const activeBoxes = this.getActiveHitboxes(attacker);
    if (activeBoxes.length === 0) return;

    for (const defender of targets) {
      if (defender.id === attacker.id || defender.hp <= 0) continue;
      if (attacker.hitTargetIds.has(defender.id)) continue;

      if (!move.fullScreenHit) {
        const depthTol = move.corridorHit
          ? attacker.config.stats.depthTolerance * 2.6
          : attacker.config.stats.depthTolerance;
        if (Math.abs(attacker.groundY - defender.groundY) > depthTol) continue;
      }

      const hurtRect = this.toWorldRect(defender, defender.config.defaultHurtbox);
      const matched = activeBoxes.find(b =>
        move.fullScreenHit || Phaser.Geom.Intersects.RectangleToRectangle(b.rect, hurtRect)
      );

      if (matched) {
        attacker.hitTargetIds.add(defender.id);
        attacker.hasHitCurrentMove = true;
        onHit(defender, matched.data);
      }
    }
  }
}
