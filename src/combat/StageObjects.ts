import Phaser from 'phaser';
import { sfx } from '../audio/SoundFX';
import { FighterState } from '../types/game';
import { AnimationFX } from './AnimationFX';
import { CharacterController } from './CharacterController';

interface CrateObj { sprite: Phaser.GameObjects.Image; x: number; groundY: number; hp: number; }
interface PickupItem { sprite: Phaser.GameObjects.Image; kind: 'hp' | 'mp' | 'rage'; x: number; groundY: number; }
interface EnvTrap { kind: 'mine' | 'fence'; gfx: Phaser.GameObjects.Shape; label: Phaser.GameObjects.Text; x: number; groundY: number; armed: boolean; cooldown: number; }

export class StageObjectManager {
  private readonly scene: Phaser.Scene;
  private crates: CrateObj[] = [];
  private items: PickupItem[] = [];
  private traps: EnvTrap[] = [];

  constructor(scene: Phaser.Scene) { this.scene = scene; }

  spawnStageProps(withTraps: boolean, extraCrates = false): void {
    this.clear();
    const crateSpots = extraCrates
      ? [{ x: 340, y: 420 }, { x: 640, y: 590 }, { x: 920, y: 440 }, { x: 1020, y: 580 }]
      : [{ x: 430, y: 430 }, { x: 890, y: 580 }];

    for (const s of crateSpots) {
      const sp = this.scene.add.image(s.x, s.y, 'prop_crate').setScale(0.32).setOrigin(0.5, 1).setDepth(s.y);
      this.crates.push({ sprite: sp, x: s.x, groundY: s.y, hp: 2 });
    }

    if (withTraps) {
      for (const t of [{ x: 620, y: 495 }, { x: 960, y: 450 }]) {
        const arc = this.scene.add.circle(t.x, t.y, 18, 0xff3b30, 0.5).setStrokeStyle(2, 0xfacc15).setDepth(t.y - 3);
        const lbl = this.scene.add.text(t.x, t.y - 26, 'MINE', { fontFamily: 'monospace', fontSize: '10px', color: '#facc15' }).setOrigin(0.5).setDepth(t.y);
        this.traps.push({ kind: 'mine', gfx: arc, label: lbl, x: t.x, groundY: t.y, armed: true, cooldown: 0 });
      }
      const fx = 280, fy = 560;
      const fence = this.scene.add.rectangle(fx, fy - 24, 16, 76, 0x22d3ee, 0.65).setStrokeStyle(2, 0xffffff).setDepth(fy);
      const flbl = this.scene.add.text(fx, fy - 72, '⚡ FENCE', { fontFamily: 'monospace', fontSize: '10px', color: '#67e8f9' }).setOrigin(0.5).setDepth(fy + 1);
      this.traps.push({ kind: 'fence', gfx: fence, label: flbl, x: fx, groundY: fy, armed: true, cooldown: 0 });
    }
  }

  update(dt: number, player: CharacterController, enemies: CharacterController[], onTrapBlast: (x: number, y: number) => void, onElectricShock?: (target: CharacterController, fx: number, fy: number) => void): void {
    const pm = player.model;
    if (pm.state === FighterState.ATTACK && pm.currentFrame === 6) {
      for (let i = this.crates.length - 1; i >= 0; i--) {
        const c = this.crates[i];
        if (Math.abs(pm.x - c.x) < 92 && Math.abs(pm.groundY - c.groundY) < 42) {
          c.hp--;
          sfx.hit(false);
          this.scene.tweens.add({ targets: c.sprite, x: c.x + 6, yoyo: true, duration: 50 });
          if (c.hp <= 0) {
            c.sprite.destroy();
            this.crates.splice(i, 1);
            const kinds: ('hp' | 'mp' | 'rage')[] = ['hp', 'mp', 'rage'];
            const kind = kinds[Math.floor(Math.random() * kinds.length)];
            const tex = kind === 'hp' ? 'item_hp' : kind === 'mp' ? 'item_mp' : 'item_rage';
            const sp = this.scene.add.image(c.x, c.groundY - 8, tex).setScale(1.35).setDepth(c.groundY);
            this.items.push({ sprite: sp, kind, x: c.x, groundY: c.groundY });
          }
        }
      }
    }

    for (let i = this.items.length - 1; i >= 0; i--) {
      const it = this.items[i];
      if (Math.abs(pm.x - it.x) < 48 && Math.abs(pm.groundY - it.groundY) < 34) {
        sfx.pickup();
        if (it.kind === 'hp') { pm.hp = Math.min(pm.maxHp, pm.hp + 240); player.view.spawnDamageNumber(pm.x, pm.groundY - 40, 0, false, '+240 HP'); }
        else if (it.kind === 'mp') { pm.mp = Math.min(pm.maxMp, pm.mp + 48); player.view.spawnDamageNumber(pm.x, pm.groundY - 40, 0, false, '+48 MP'); }
        else { pm.rage = Math.min(pm.config.stats.maxRage, pm.rage + 35); player.view.spawnDamageNumber(pm.x, pm.groundY - 40, 0, true, '+35 RAGE'); }
        it.sprite.destroy();
        this.items.splice(i, 1);
      }
    }

    for (let i = this.traps.length - 1; i >= 0; i--) {
      const tr = this.traps[i];
      if (tr.cooldown > 0) tr.cooldown = Math.max(0, tr.cooldown - dt);
      if (!tr.armed) continue;
      if (tr.kind === 'mine') {
        const byEnemy = enemies.some(e => e.model.hp > 0 && Math.abs(e.model.x - tr.x) < 36 && Math.abs(e.model.groundY - tr.groundY) < 28);
        const byPlayer = pm.state === FighterState.ATTACK && Math.abs(pm.x - tr.x) < 88 && Math.abs(pm.groundY - tr.groundY) < 34;
        if (byEnemy || byPlayer) {
          tr.armed = false; tr.gfx.destroy(); tr.label.destroy(); this.traps.splice(i, 1);
          onTrapBlast(tr.x, tr.groundY);
        }
      } else if (tr.kind === 'fence' && tr.cooldown <= 0) {
        const shocked = enemies.find(e => e.model.hp > 0 && Math.abs(e.model.x - tr.x) < 30 && Math.abs(e.model.groundY - tr.groundY) < 36);
        if (shocked) {
          tr.cooldown = 1.6;
          AnimationFX.spawnHitSpark(this.scene, tr.x, tr.groundY - 40, '#22d3ee', true);
          onElectricShock?.(shocked, tr.x, tr.groundY);
        }
      }
    }
  }

  clear(): void {
    this.crates.forEach(c => c.sprite.destroy());
    this.items.forEach(i => i.sprite.destroy());
    this.traps.forEach(t => { t.gfx.destroy(); t.label.destroy(); });
    this.crates = []; this.items = []; this.traps = [];
  }
}
