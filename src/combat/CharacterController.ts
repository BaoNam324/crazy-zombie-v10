import Phaser from 'phaser';
import { sfx } from '../audio/SoundFX';
import { GamepadPoller } from '../input/GamepadAndTouch';
import { FighterState, HitboxFrameData, MoveData, RunModifiers } from '../types/game';
import { AfterimageVFX } from './AfterimageVFX';
import { AnimationFX } from './AnimationFX';
import { CharacterModel } from './CharacterModel';
import { CharacterView } from './CharacterView';
import { HitboxSystem } from './HitboxSystem';

interface BufferedInput { action: string; timestamp: number; }

export interface CombatCallbacks {
  onSuperFreeze: (frames: number, title: string, color: string) => void;
  onComboHit: (damage: number) => void;
  onInputLogged: (symbol: string) => void;
  onMoveStarted?: (ctrl: CharacterController, move: MoveData) => void;
  onTrialEvent?: (trialKey: 'j4' | 'cancel' | 'parry' | 'overdrive' | 'ult') => void;
}

export class CharacterController {
  private readonly scene: Phaser.Scene;
  readonly model: CharacterModel;
  readonly view: CharacterView;
  private readonly callbacks: CombatCallbacks;

  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private gamepad = new GamepadPoller();
  private inputBuffer: BufferedInput[] = [];
  private readonly bufferWindowMs = 180;
  private ghostTimer = 0;

  constructor(scene: Phaser.Scene, model: CharacterModel, view: CharacterView, callbacks: CombatCallbacks) {
    this.scene = scene;
    this.model = model;
    this.view = view;
    this.callbacks = callbacks;
    if (model.isPlayer) this.bindInputs();
  }

  private bindInputs(): void {
    const kb = this.scene.input.keyboard!;
    this.keys = {
      left: kb.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: kb.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      up: kb.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: kb.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      arrowLeft: kb.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      arrowRight: kb.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
      arrowUp: kb.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      arrowDown: kb.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
      attack: kb.addKey(Phaser.Input.Keyboard.KeyCodes.J),
      jump: kb.addKey(Phaser.Input.Keyboard.KeyCodes.K),
      parry: kb.addKey(Phaser.Input.Keyboard.KeyCodes.L),
      skillU: kb.addKey(Phaser.Input.Keyboard.KeyCodes.U),
      skillI: kb.addKey(Phaser.Input.Keyboard.KeyCodes.I),
      ultO: kb.addKey(Phaser.Input.Keyboard.KeyCodes.O),
      overdriveH: kb.addKey(Phaser.Input.Keyboard.KeyCodes.H),
    };
  }

  private captureInputs(now: number): { gdx: number; gdy: number } {
    const downHeld = this.keys.down.isDown || this.keys.arrowDown.isDown;
    const checks: [string, string, string][] = [
      ['ultO', 'ultimate_o', 'O (ULT)'],
      ['skillI', 'skill_i', 'I'],
      ['skillU', downHeld ? 'skill_su' : 'skill_u', downHeld ? 'S+U' : 'U'],
      ['attack', 'attack', 'J'],
      ['jump', 'jump', 'K'],
      ['parry', 'parry', 'L (PARRY)'],
      ['overdriveH', 'overdrive', 'H (OVERDRIVE)'],
    ];
    for (const [k, act, sym] of checks) {
      if (Phaser.Input.Keyboard.JustDown(this.keys[k])) {
        sfx.unlock();
        this.inputBuffer.push({ action: act, timestamp: now });
        this.callbacks.onInputLogged(sym);
      }
    }
    const gp = this.gamepad.poll();
    for (const act of gp.pressed) {
      sfx.unlock();
      this.inputBuffer.push({ action: act, timestamp: now });
      this.callbacks.onInputLogged(`PAD:${act.toUpperCase()}`);
    }
    this.inputBuffer = this.inputBuffer.filter(i => now - i.timestamp <= this.bufferWindowMs);
    return { gdx: gp.dx, gdy: gp.dy };
  }

  private consume(action: string): boolean {
    const idx = this.inputBuffer.findIndex(i => i.action === action);
    if (idx === -1) return false;
    this.inputBuffer.splice(idx, 1);
    return true;
  }

  update(dt: number, now: number, enemies: CharacterController[], mods: RunModifiers, minX: number, maxX: number, gravityMult = 1): void {
    this.model.tickTimers(dt, mods);
    const padAxes = this.model.isPlayer ? this.captureInputs(now) : { gdx: 0, gdy: 0 };

    if (this.model.state === FighterState.DEAD) { this.view.sync(this.model); return; }
    if (this.model.hitstopFrames > 0) { this.model.hitstopFrames--; this.view.sync(this.model); return; }
    if (this.model.frozenTimer > 0) { this.view.sync(this.model); return; }

    if ((this.model.state === FighterState.ATTACK && Math.abs(this.model.vx) > 260) || ((this.model.overdriveTimer > 0 || this.model.kaiokenTimer > 0) && this.model.state === FighterState.ATTACK)) {
      this.ghostTimer -= dt;
      if (this.ghostTimer <= 0) {
        this.ghostTimer = 0.042;
        const c = this.model.kaiokenTimer > 0 ? 0xef4444 : this.model.config.id === 'goku' && this.model.overdriveTimer > 0 ? 0xfacc15 : Phaser.Display.Color.HexStringToColor(this.model.palette.vfx).color;
        AfterimageVFX.spawnGhost(this.scene, this.view.sprite, c);
      }
    }

    switch (this.model.state) {
      case FighterState.IDLE:
      case FighterState.RUN:
        if (this.model.isPlayer) this.handlePlayerLocomotion(mods, enemies, padAxes.gdx, padAxes.gdy);
        break;
      case FighterState.PARRY:
        this.model.parryWindowFrames--;
        if (this.model.parryWindowFrames <= 0) this.enterIdle();
        break;
      case FighterState.ATTACK:
        this.handleAttackState(dt, enemies, mods);
        break;
      case FighterState.HURT:
      case FighterState.KNOCKDOWN:
        this.model.stateTimer--;
        if (this.model.stateTimer <= 0 && !this.model.isAirborne) {
          this.model.juggleCount = 0;
          this.model.wallBouncedThisCombo = false;
          this.enterIdle();
        }
        break;
    }

    this.applyPhysics25D(dt, minX, maxX, gravityMult);
    this.view.sync(this.model);
  }

  private activateOverdrive(enemies: CharacterController[], mods: RunModifiers, fromBankaiCancel = false): void {
    const id = this.model.config.id;
    this.model.rage -= 50;
    this.model.overdriveTimer = id === 'goku' ? 15 : 12;
    sfx.parry();

    const labelMap: Record<string, string> = {
      ichigo: fromBankaiCancel ? 'BANKAI CANCEL!' : 'BANKAI ACTIVE!',
      goku: 'SUPER SAIYAN (15s)!',
      iori: 'OROCHI BLOOD RIOT!',
      zero: 'OVERDRIVE: BLACK ZERO!',
      asuna: 'OVERDRIVE: STARBURST!',
    };
    const colorMap: Record<string, number> = { ichigo: 0xef4444, goku: 0xfacc15, iori: 0xa855f7, zero: 0x67e8f9, asuna: 0x38bdf8 };
    const colHex = colorMap[id] ?? 0xfacc15;
    this.view.flashHit(colHex);
    AnimationFX.spawnShockwaveRing(this.scene, this.model.x, this.model.groundY - 45, `#${colHex.toString(16).padStart(6, '0')}`, 4.5);
    this.view.spawnDamageNumber(this.model.x, this.model.groundY - 56, 0, true, labelMap[id] ?? 'OVERDRIVE 12s!');
    if (id === 'zero') this.model.busterCharge = 100;

    if (id === 'ichigo' && fromBankaiCancel) {
      for (const e of enemies) {
        if (e.model.hp > 0 && Phaser.Math.Distance.Between(this.model.x, this.model.groundY, e.model.x, e.model.groundY) < 175) {
          const pushDir: 1 | -1 = e.model.x >= this.model.x ? 1 : -1;
          e.receiveHit({ startFrame: 0, endFrame: 1, rect: { x: 0, y: 0, w: 1, h: 1 }, damage: 85, hitstun: 26, hitstop: 5, knockback: { vx: 280, vz: 260 }, knockdown: true, staggerDamage: 35 }, 85 * mods.damageMult, true, pushDir, this.model.x, mods);
          this.callbacks.onComboHit(85);
        }
      }
      this.enterIdle();
    }
    this.callbacks.onTrialEvent?.('overdrive');
  }

  private handlePlayerLocomotion(mods: RunModifiers, enemies: CharacterController[], gdx: number, gdy: number): void {
    if (this.consume('overdrive') && this.model.rage >= 50 && this.model.overdriveTimer <= 0) { this.activateOverdrive(enemies, mods, false); return; }
    if (this.consume('parry')) { this.model.state = FighterState.PARRY; this.model.parryWindowFrames = 10; this.model.vx = 0; this.model.vy = 0; return; }
    if (this.tryStartMove('ultimate_o', 'ultimate_o', mods)) return;
    if (this.tryStartMove('skill_su', 'skill_su', mods)) return;
    if (this.tryStartMove('skill_i', 'skill_i', mods)) return;
    if (this.tryStartMove('skill_u', 'skill_u', mods)) return;
    if (this.consume('attack')) { this.enterAttack('attack_1', mods); return; }

    const kdx = ((this.keys.right.isDown || this.keys.arrowRight.isDown) ? 1 : 0) - ((this.keys.left.isDown || this.keys.arrowLeft.isDown) ? 1 : 0);
    const kdy = ((this.keys.down.isDown || this.keys.arrowDown.isDown) ? 1 : 0) - ((this.keys.up.isDown || this.keys.arrowUp.isDown) ? 1 : 0);
    const dx = kdx !== 0 ? kdx : gdx;
    const dy = kdy !== 0 ? kdy : gdy;

    let speedMult = this.model.slowTimer > 0 ? 0.8 : 1;
    if (this.model.config.id === 'ichigo' && this.model.overdriveTimer > 0) speedMult *= 1.2;
    else if (this.model.config.id === 'goku' && this.model.overdriveTimer > 0) speedMult *= 1.15;

    this.model.vx = dx * this.model.config.stats.moveSpeedX * speedMult;
    this.model.vy = dy * this.model.config.stats.moveSpeedY * speedMult;
    if (dx !== 0) this.model.facing = dx > 0 ? 1 : -1;
    if (!this.model.isAirborne && this.consume('jump')) this.model.vz = 540;
    this.model.state = (dx !== 0 || dy !== 0) ? FighterState.RUN : FighterState.IDLE;
  }

  private handleAttackState(dt: number, enemies: CharacterController[], mods: RunModifiers): void {
    const move = this.model.currentMove;
    if (!move) { this.enterIdle(); return; }

    const atkSpeedMult = (this.model.config.id === 'iori' && this.model.overdriveTimer > 0) ? 1.25 : 1;
    this.model.frameAccumulator += dt * 60 * atkSpeedMult;
    while (this.model.frameAccumulator >= 1) { this.model.frameAccumulator -= 1; this.model.currentFrame++; }

    if (this.model.isPlayer && this.model.config.id === 'goku' && move.id === 'skill_i' && this.model.currentFrame < move.startupFrames && this.model.kameChargeLevel < 2 && this.consume('skill_i')) {
      this.model.kameChargeLevel = 2;
      AnimationFX.spawnShockwaveRing(this.scene, this.model.x, this.model.groundY - 50, '#38bdf8', 2.6);
      this.view.spawnDamageNumber(this.model.x, this.model.groundY - 62, 0, true, 'KAMEHAMEHA NẤC 2!');
    }

    if (this.model.isPlayer && this.model.config.id === 'ichigo' && move.id === 'attack_3' && this.model.rage >= 50 && this.model.overdriveTimer <= 0 && this.consume('overdrive')) {
      this.activateOverdrive(enemies, mods, true);
      return;
    }

    HitboxSystem.checkAttackCollision(this.model, enemies.map(e => e.model), (defenderModel, hitData) => {
      const target = enemies.find(e => e.model.id === defenderModel.id);
      if (!target) return;

      let dmg = hitData.damage * (this.model.isPlayer ? mods.damageMult : mods.enemyDmgMult);
      if (this.model.overdriveTimer > 0) dmg *= 1.25;
      if (this.model.kaiokenTimer > 0) dmg *= 1.25;

      if (this.model.config.id === 'zoro') {
        dmg *= 1 + this.model.swordIntent * 0.1;
        if (move.id === 'attack_4') { this.model.swordIntent = Math.min(3, this.model.swordIntent + 1); this.model.swordIntentTimer = 5; }
        else if (move.id === 'ultimate_o') { dmg *= 1 + this.model.swordIntent * 0.15; this.model.swordIntent = 0; }
      }
      if (this.model.config.id === 'goku' && move.id === 'skill_i' && this.model.kameChargeLevel >= 2) dmg *= 1.35;
      if (this.model.config.id === 'zero' && move.id === 'skill_i' && this.model.busterCharge >= 100) dmg *= 1.4;

      const critBase = (this.model.config.id === 'asuna' ? 0.18 : 0) + (this.model.config.id === 'zero' && this.model.overdriveTimer > 0 ? 0.15 : 0);
      const isCrit = this.model.isPlayer && Math.random() < (mods.critChance + critBase);
      if (isCrit) dmg *= 1.55;
      if (this.model.isPlayer && mods.lightningOnHit) dmg += 18;
      if (defenderModel.vulnBonus > 0) dmg *= 1 + defenderModel.vulnBonus;

      if (this.model.config.id === 'goku' && this.model.whiteHp > 0) {
        const heal = Math.min(this.model.whiteHp, 12);
        this.model.hp = Math.min(this.model.maxHp, this.model.hp + heal);
        this.model.whiteHp -= heal;
      }
      if (this.model.config.id === 'iori' && this.model.overdriveTimer > 0) {
        this.model.hp = Math.min(this.model.maxHp, this.model.hp + dmg * 0.08);
      }
      if (this.model.config.id === 'gojo' && move.id === 'skill_u' && defenderModel.isBoss) defenderModel.slowTimer = 1.4;

      if (move.rageGain) {
        const gokuBonus = this.model.config.id === 'goku' ? 1.15 : 1;
        this.model.rage = Math.min(this.model.config.stats.maxRage, this.model.rage + move.rageGain * mods.rageGainMult * gokuBonus);
      }

      const isMotherRosario = this.model.config.id === 'asuna' && move.id === 'ultimate_o' && this.model.overdriveTimer > 0;
      const effectiveHit: HitboxFrameData = isMotherRosario ? { ...hitData, armorPierce: true, staggerDamage: (hitData.staggerDamage ?? 80) + 45 } : hitData;

      this.model.hitstopFrames = hitData.hitstop;
      sfx.hit(hitData.damage >= 90);
      target.receiveHit(effectiveHit, dmg, isCrit, this.model.facing, this.model.x, mods, !!hitData.heavyRedBossAttack, this);
      if (this.model.isPlayer) {
        this.callbacks.onComboHit(dmg);
        if (move.id === 'attack_4') this.callbacks.onTrialEvent?.('j4');
      }
    });

    const inCancel = move.cancelWindow && this.model.currentFrame >= move.cancelWindow.start && this.model.currentFrame <= move.cancelWindow.end;
    const zeroAirDashCancel = this.model.isPlayer && this.model.config.id === 'zero' && move.id.startsWith('attack_') && this.model.hasHitCurrentMove;

    if (this.model.isPlayer && (inCancel || zeroAirDashCancel) && this.model.hasHitCurrentMove) {
      if (move.canCancelIntoSkill || zeroAirDashCancel) {
        if (this.tryStartMove('ultimate_o', 'ultimate_o', mods)) { this.callbacks.onTrialEvent?.('cancel'); return; }
        if (this.tryStartMove('skill_su', 'skill_su', mods)) { this.callbacks.onTrialEvent?.('cancel'); return; }
        if (this.tryStartMove('skill_i', 'skill_i', mods)) { this.callbacks.onTrialEvent?.('cancel'); return; }
        if (this.tryStartMove('skill_u', 'skill_u', mods)) { this.callbacks.onTrialEvent?.('cancel'); return; }
      }
      if (move.nextCombo && this.consume('attack')) {
        if (move.id === 'attack_3') this.model.vz = 420;
        this.enterAttack(move.nextCombo, mods);
        return;
      }
    }

    if (this.model.currentFrame >= move.totalFrames) {
      if (this.model.config.id === 'zero' && move.id === 'skill_i') this.model.busterCharge = 0;
      this.enterIdle();
    }
  }

  private tryStartMove(action: string, moveId: string, mods: RunModifiers): boolean {
    const move = this.model.config.moves[moveId];
    if (!move || !this.model.canUseMove(move, mods)) return false;
    if (!this.consume(action)) return false;
    this.enterAttack(moveId, mods);
    return true;
  }

  enterAttack(moveId: string, mods?: RunModifiers): void {
    const move = this.model.config.moves[moveId];
    if (!move) return;
    this.model.consumeMoveCost(move, mods);
    this.model.state = FighterState.ATTACK;
    this.model.currentMoveId = moveId;
    this.model.currentFrame = 0;
    this.model.frameAccumulator = 0;
    this.model.hasHitCurrentMove = false;
    this.model.hitTargetIds.clear();
    this.model.vx = (move.dashVelocityX ?? 0) * this.model.facing;
    this.model.vy = 0;
    sfx.slash();

    if (this.model.config.id === 'goku' && moveId === 'skill_u') {
      this.model.kaiokenTimer = 6;
      this.view.spawnDamageNumber(this.model.x, this.model.groundY - 60, 0, true, 'KAIOKEN x2!');
    }
    if (this.model.config.id === 'goku' && moveId === 'skill_i') this.model.kameChargeLevel = 1;
    if (moveId.startsWith('skill_') || moveId === 'ultimate_o') {
      AnimationFX.spawnWetRoadGlow(this.scene, this.model.x + this.model.facing * 40, this.model.groundY, this.model.palette.vfx, 86);
    }
    if (moveId === 'ultimate_o' && this.model.config.id === 'zoro') {
      AnimationFX.playMultiSlashBurst(this.scene, this.model.x, this.model.groundY, this.model.facing, 14, this.model.palette.vfx);
    } else if (moveId === 'ultimate_o' && this.model.config.id === 'asuna' && this.model.overdriveTimer > 0) {
      AnimationFX.playMultiSlashBurst(this.scene, this.model.x, this.model.groundY, this.model.facing, 11, '#38bdf8');
    }

    this.callbacks.onMoveStarted?.(this, move);
    if (move.superFreezeFrames) {
      sfx.superFreeze();
      this.callbacks.onTrialEvent?.('ult');
      const title = (this.model.config.id === 'asuna' && this.model.overdriveTimer > 0) ? "MOTHER'S ROSARIO (11-HIT)" : move.label;
      this.callbacks.onSuperFreeze(move.superFreezeFrames, title, this.model.palette.vfx);
    }
  }

  receiveHit(hit: HitboxFrameData, finalDamage: number, isCrit: boolean, attackerFacing: 1 | -1, attackerX: number, mods: RunModifiers, isHeavyRedBossAttack = false, attackerCtrl?: CharacterController): void {
    if (this.model.state === FighterState.DEAD) return;

    if (this.model.state === FighterState.PARRY && this.model.parryWindowFrames >= 4) {
      sfx.parry();
      this.view.flashHit(0xfacc15);
      this.callbacks.onTrialEvent?.('parry');
      this.model.mp = Math.min(this.model.maxMp, this.model.mp + 20);
      this.model.rage = Math.min(this.model.config.stats.maxRage, this.model.rage + 15);
      if (mods.parryHeal > 0) this.model.hp = Math.min(this.model.maxHp, this.model.hp + mods.parryHeal);
      if (this.model.config.id === 'zoro') { this.model.swordIntent = Math.min(3, this.model.swordIntent + 1); this.model.swordIntentTimer = 5; }
      if (this.model.config.id === 'asuna' && attackerCtrl) {
        AnimationFX.spawnShockwaveRing(this.scene, this.model.x, this.model.groundY - 45, '#38bdf8', 2.8);
        this.model.x = Phaser.Math.Clamp(attackerX - attackerFacing * 76, 55, 1225);
        this.model.facing = attackerFacing;
        this.view.spawnDamageNumber(this.model.x, this.model.groundY - 56, 0, true, 'SWITCH PARRY!');
      } else {
        this.view.spawnDamageNumber(this.model.x, this.model.groundY - this.model.z, 0, true, 'PARRY!');
      }
      this.enterIdle();
      return;
    }

    if (this.model.config.id === 'gojo' && this.model.limitlessReady) {
      if (isHeavyRedBossAttack) {
        this.model.limitlessReady = false;
        this.model.limitlessCooldown = 18;
        AnimationFX.spawnShockwaveRing(this.scene, this.model.x, this.model.groundY - 48, '#ef4444', 3.4);
        this.view.spawnDamageNumber(this.model.x, this.model.groundY - 66, 0, true, 'VÔ HẠN VỠ!');
      } else if (this.model.mp >= 15) {
        this.model.mp -= 15;
        this.model.limitlessReady = false;
        this.model.limitlessCooldown = 18;
        sfx.parry();
        this.view.flashHit(0x38bdf8);
        this.view.spawnDamageNumber(this.model.x, this.model.groundY - this.model.z, 0, false, 'LIMITLESS');
        return;
      }
    }

    let takenDmg = finalDamage;
    if (this.model.config.id === 'iori' && this.model.overdriveTimer > 0) takenDmg *= 1.15;
    if (this.model.isBoss && !this.model.superArmor) takenDmg *= 1.25;

    this.model.hp = Math.max(0, this.model.hp - takenDmg);
    this.view.flashHit(0xffffff);
    this.view.spawnDamageNumber(this.model.x, this.model.groundY - this.model.z, takenDmg, isCrit);

    if (hit.bleedDps) { this.model.bleedDps = hit.bleedDps; this.model.bleedTimer = 3.0; }
    if (hit.freezeNormalSec || hit.freezeBossSec) {
      this.model.frozenTimer = this.model.isBoss ? (hit.freezeBossSec ?? 0.8) : (hit.freezeNormalSec ?? 1.8);
      if (hit.bossVulnBonus) { this.model.vulnBonus = hit.bossVulnBonus; this.model.vulnTimer = 4.0; }
    }
    if (hit.pullStrength && !this.model.superArmor) {
      this.model.vx = (attackerX > this.model.x ? 1 : -1) * hit.pullStrength;
    }
    if (this.model.hp <= 0) {
      this.model.state = FighterState.DEAD; this.model.vx = 180 * attackerFacing; this.model.vz = 260; return;
    }
    if (this.model.isBoss && this.model.superArmor && !hit.armorPierce) {
      this.model.stagger += hit.staggerDamage ?? 12;
      if (this.model.stagger >= this.model.maxStagger) {
        this.model.superArmor = false; this.model.stagger = 0;
        AnimationFX.spawnShockwaveRing(this.scene, this.model.x, this.model.groundY - 50, '#facc15', 4.0);
        this.view.spawnDamageNumber(this.model.x, this.model.groundY - 40, 0, true, 'GUARD BREAK!');
        this.model.state = FighterState.HURT; this.model.stateTimer = 55;
      }
      return;
    }

    this.model.hitstopFrames = hit.hitstop;
    this.model.currentMoveId = null;
    if (!hit.pullStrength) this.model.vx = hit.knockback.vx * attackerFacing;
    if (hit.knockback.vz > 0 || this.model.isAirborne) {
      this.model.juggleCount++;
      const decay = this.model.juggleCount > 6 ? 0.55 : 1;
      this.model.vz = Math.max(hit.knockback.vz * decay, 180 * decay);
    }
    this.model.stateTimer = hit.hitstun;
    this.model.state = (hit.knockdown || hit.knockback.vz > 0) ? FighterState.KNOCKDOWN : FighterState.HURT;
  }

  enterIdle(): void {
    this.model.state = FighterState.IDLE; this.model.currentMoveId = null; this.model.vx = 0; this.model.vy = 0;
  }

  private applyPhysics25D(dt: number, minX: number, maxX: number, gravityMult = 1): void {
    this.model.x += this.model.vx * dt;
    if (this.model.x < minX) {
      this.model.x = minX;
      if (this.model.state === FighterState.KNOCKDOWN && !this.model.wallBouncedThisCombo && Math.abs(this.model.vx) > 220) {
        this.model.wallBouncedThisCombo = true; this.model.vx = 180; this.model.vz = 280;
        this.view.spawnDamageNumber(this.model.x + 20, this.model.groundY - 40, 0, true, 'WALL BOUNCE!');
      }
    } else if (this.model.x > maxX) {
      this.model.x = maxX;
      if (this.model.state === FighterState.KNOCKDOWN && !this.model.wallBouncedThisCombo && Math.abs(this.model.vx) > 220) {
        this.model.wallBouncedThisCombo = true; this.model.vx = -180; this.model.vz = 280;
        this.view.spawnDamageNumber(this.model.x - 20, this.model.groundY - 40, 0, true, 'WALL BOUNCE!');
      }
    }
    this.model.groundY = Phaser.Math.Clamp(this.model.groundY + this.model.vy * dt, 370, 650);
    if (this.model.state !== FighterState.RUN) this.model.vx *= Math.pow(0.04, dt);
    if (this.model.z > 0 || this.model.vz !== 0) {
      const juggleGrav = this.model.juggleCount > 6 ? 1.45 : 1;
      this.model.z += this.model.vz * dt;
      this.model.vz -= this.model.config.stats.gravity * juggleGrav * gravityMult * dt;
      if (this.model.z <= 0) { this.model.z = 0; this.model.vz = 0; }
    }
  }
}
