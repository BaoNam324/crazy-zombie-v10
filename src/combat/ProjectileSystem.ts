import Phaser from 'phaser';
import { sfx } from '../audio/SoundFX';
import { RunModifiers } from '../types/game';
import { CharacterController } from './CharacterController';

export interface ProjectileSpec {
  owner: CharacterController;
  kind: 'slash' | 'orb_pull' | 'orb_push' | 'purple' | 'beam' | 'flame';
  x: number;
  groundY: number;
  z: number;
  vx: number;
  radius: number;
  color: number;
  damage: number;
  lifeSec: number;
  maxHits: number;
  stagger: number;
  wallBounce?: boolean;
}

interface ActiveProjectile extends ProjectileSpec {
  gfx: Phaser.GameObjects.Graphics;
  hitIds: Set<string>;
  elapsed: number;
}

function isHeroTeam(ctrl: CharacterController): boolean {
  return ctrl.model.isPlayer || ctrl.model.id === 'partner';
}

export class ProjectileSystem {
  private readonly scene: Phaser.Scene;
  private list: ActiveProjectile[] = [];

  constructor(scene: Phaser.Scene) { this.scene = scene; }

  spawn(spec: ProjectileSpec): void {
    const gfx = this.scene.add.graphics().setDepth(spec.groundY + 12);
    this.list.push({ ...spec, gfx, hitIds: new Set(), elapsed: 0 });
  }

  update(dt: number, targets: CharacterController[], mods: RunModifiers, onHitScore: (dmg: number) => void): void {
    for (let i = this.list.length - 1; i >= 0; i--) {
      const p = this.list[i];
      p.elapsed += dt;
      p.x += p.vx * dt;

      p.gfx.clear().setDepth(p.groundY + 12);
      const y = p.groundY - p.z - 52;
      if (p.kind === 'beam') {
        const w = Math.min(360, 120 + p.elapsed * 900);
        const dir = p.vx >= 0 ? 1 : -1;
        p.gfx.fillStyle(p.color, 0.45).fillRoundedRect(dir > 0 ? p.x : p.x - w, y - 24, w, 48, 12);
        p.gfx.fillStyle(0xffffff, 0.85).fillRoundedRect(dir > 0 ? p.x : p.x - w, y - 10, w, 20, 6);
      } else if (p.kind === 'slash') {
        const dir = p.vx >= 0 ? 1 : -1;
        p.gfx.lineStyle(7, p.color, 0.95).beginPath().arc(p.x, y, p.radius, dir > 0 ? -1.1 : Math.PI - 1.1, dir > 0 ? 1.1 : Math.PI + 1.1).strokePath();
      } else if (p.kind === 'purple') {
        const pulse = 1 + Math.sin(p.elapsed * 24) * 0.1;
        p.gfx.fillStyle(0x9333ea, 0.42).fillCircle(p.x, y, p.radius * 1.25 * pulse);
        p.gfx.fillStyle(0xc084fc, 0.85).fillCircle(p.x, y, p.radius * 0.78);
        p.gfx.lineStyle(3, 0xffffff, 0.9).strokeCircle(p.x, y, p.radius * pulse);
      } else {
        p.gfx.fillStyle(p.color, 0.35).fillCircle(p.x, y, p.radius * 1.2);
        p.gfx.fillStyle(p.color, 0.9).fillCircle(p.x, y, p.radius * 0.7);
        p.gfx.lineStyle(2, 0xffffff, 0.8).strokeCircle(p.x, y, p.radius);
      }

      const ownerIsHero = isHeroTeam(p.owner);
      for (const t of targets) {
        const m = t.model;
        if (m.hp <= 0 || m.id === p.owner.model.id) continue;
        if (isHeroTeam(t) === ownerIsHero) continue;
        if (Math.abs(m.groundY - p.groundY) > 54) continue;
        const dist = Math.abs(m.x - p.x);

        if (p.kind === 'orb_pull' && dist < 210) {
          if (m.superArmor) m.slowTimer = Math.max(m.slowTimer, 1.4);
          else m.x += Math.sign(p.x - m.x) * 240 * dt;
        }

        if (dist <= p.radius + 26 && !p.hitIds.has(m.id)) {
          p.hitIds.add(m.id);
          const dmg = ownerIsHero ? p.damage * mods.damageMult : p.damage * mods.enemyDmgMult;
          sfx.hit(dmg >= 110);
          t.receiveHit(
            {
              startFrame: 0, endFrame: 1, rect: { x: 0, y: 0, w: 1, h: 1 },
              damage: p.damage, hitstun: 22, hitstop: 4,
              knockback: { vx: p.kind === 'orb_push' ? 440 : 180, vz: p.kind === 'purple' ? 260 : 120 },
              knockdown: p.kind === 'orb_push' || p.kind === 'purple' || p.kind === 'beam',
              staggerDamage: p.stagger, wallBounce: p.wallBounce,
              armorPierce: p.kind === 'purple', heavyRedBossAttack: !ownerIsHero && p.kind === 'purple',
            },
            dmg, false, p.vx >= 0 ? 1 : -1, p.x, mods, !ownerIsHero && p.kind === 'purple', p.owner
          );
          if (ownerIsHero) onHitScore(dmg);
          if (p.hitIds.size >= p.maxHits) { p.elapsed = p.lifeSec + 1; break; }
        }
      }

      if (p.elapsed >= p.lifeSec || p.x < -120 || p.x > 1400) {
        p.gfx.destroy();
        this.list.splice(i, 1);
      }
    }
  }

  clear(): void {
    for (const p of this.list) p.gfx.destroy();
    this.list = [];
  }
}
