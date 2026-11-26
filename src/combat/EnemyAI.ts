import { FighterState, RunModifiers } from '../types/game';
import { CharacterController } from './CharacterController';

export type EnemySpecialKind =
  | 'getsuga'
  | 'purple'
  | 'shockwave'
  | 'pulse_shot'
  | 'void_orb'
  | 'toxic_wave'
  | 'rail_cannon'
  | 'serum_spike'
  | 'eclipse_scythe';

export class EnemyAIController {
  readonly ctrl: CharacterController;
  readonly isHeavyType: boolean;
  private aiTimer = 0.6;
  private telegraphTimer = 0;
  private pendingMoveId = 'attack_1';
  private pendingIsRedHeavy = false;
  private hasToken = false;
  private attackCounter = 0;
  private specialSkillCooldown = 3.2;

  constructor(ctrl: CharacterController, isHeavyType = false) {
    this.ctrl = ctrl;
    this.isHeavyType = isHeavyType;
  }

  get isTelegraphing(): boolean { return this.telegraphTimer > 0; }

  updateAI(
    dt: number,
    player: CharacterController,
    mods: RunModifiers,
    minX: number,
    maxX: number,
    requestToken: () => boolean,
    releaseToken: () => void,
    passiveDummy = false,
    gravityMult = 1,
    onSpecialAttack?: (actor: CharacterController, skillKind: EnemySpecialKind) => void
  ): void {
    const m = this.ctrl.model;
    const p = player.model;
    const id = m.config.id;

    if (m.state === FighterState.DEAD || m.hp <= 0) {
      if (this.hasToken) { releaseToken(); this.hasToken = false; }
      this.ctrl.update(dt, 0, [], mods, minX, maxX, gravityMult);
      return;
    }

    if (m.isBoss && m.bossBars >= 5) {
      const ratio = m.hp / m.maxHp;
      if (ratio < 0.66 && m.bossPhase === 1) {
        m.bossPhase = 2; m.superArmor = true; m.stagger = 0;
        this.ctrl.view.spawnDamageNumber(m.x, m.groundY - 96, 0, true, 'PHA 2 · KHAI MỞ VÒNG NHẬT THỰC!');
        onSpecialAttack?.(this.ctrl, 'shockwave');
      } else if (ratio < 0.33 && m.bossPhase === 2) {
        m.bossPhase = 3; m.superArmor = true; m.stagger = 0;
        this.ctrl.view.spawnDamageNumber(m.x, m.groundY - 96, 0, true, 'PHA 3 · VỠ LÕI THỰC TẠI!');
        onSpecialAttack?.(this.ctrl, 'shockwave');
      }
    }

    if (passiveDummy) {
      this.telegraphTimer = 0;
      if (this.hasToken) { releaseToken(); this.hasToken = false; }
      this.ctrl.update(dt, 0, [], mods, minX, maxX, gravityMult);
      this.ctrl.view.sync(m, false, false);
      return;
    }

    if (m.frozenTimer > 0 || m.state === FighterState.HURT || m.state === FighterState.KNOCKDOWN) {
      this.telegraphTimer = 0;
      this.ctrl.update(dt, 0, [], mods, minX, maxX, gravityMult);
      return;
    }

    if (m.state === FighterState.IDLE || m.state === FighterState.RUN) {
      const distX = Math.abs(p.x - m.x);
      const distY = Math.abs(p.groundY - m.groundY);
      this.specialSkillCooldown -= dt;
      if (this.specialSkillCooldown <= 0 && distY <= 60) {
        if (id === 'syndicate_gunner' && distX > 130 && distX < 520) {
          m.facing = p.x >= m.x ? 1 : -1; this.specialSkillCooldown = 3.2; onSpecialAttack?.(this.ctrl, 'pulse_shot');
        } else if (id === 'void_acolyte' && distX > 120 && distX < 540) {
          m.facing = p.x >= m.x ? 1 : -1; this.specialSkillCooldown = 3.6; onSpecialAttack?.(this.ctrl, 'void_orb');
        } else if (id === 'boss_plague_warden') {
          m.facing = p.x >= m.x ? 1 : -1; this.specialSkillCooldown = 4.2;
          this.ctrl.view.spawnDamageNumber(m.x, m.groundY - 82, 0, true, 'SÓNG LÕI ĐỘC!');
          onSpecialAttack?.(this.ctrl, 'toxic_wave');
        } else if (id === 'boss_iron_vanguard') {
          m.facing = p.x >= m.x ? 1 : -1; this.specialSkillCooldown = 3.8;
          this.ctrl.view.spawnDamageNumber(m.x, m.groundY - 82, 0, true, 'PHÁO XUNG NHỊP!');
          onSpecialAttack?.(this.ctrl, 'rail_cannon');
        } else if (id === 'boss_chimera_alpha') {
          m.facing = p.x >= m.x ? 1 : -1; this.specialSkillCooldown = 3.5;
          this.ctrl.view.spawnDamageNumber(m.x, m.groundY - 82, 0, true, 'GAI HUYẾT THANH!');
          onSpecialAttack?.(this.ctrl, 'serum_spike');
        } else if (id === 'boss_eclipse_archon') {
          m.facing = p.x >= m.x ? 1 : -1; this.specialSkillCooldown = 3.4;
          this.ctrl.view.spawnDamageNumber(m.x, m.groundY - 82, 0, true, 'LƯỠI HÁI HƯ KHÔNG!');
          onSpecialAttack?.(this.ctrl, 'eclipse_scythe');
        } else if (id === 'boss_zeropoint' && m.bossPhase >= 2) {
          m.facing = p.x >= m.x ? 1 : -1; this.specialSkillCooldown = m.bossPhase === 3 ? 2.9 : 4.0;
          const skillKind = this.attackCounter % 2 === 0 ? 'getsuga' : 'purple';
          this.attackCounter++;
          this.ctrl.view.spawnDamageNumber(m.x, m.groundY - 82, 0, true, skillKind === 'getsuga' ? 'NHÁT CHÉM NHẬT THỰC!' : 'CẦU DỊ GIỚI!');
          onSpecialAttack?.(this.ctrl, skillKind);
        }
      }
    }

    if (this.telegraphTimer > 0) {
      this.telegraphTimer -= dt; m.vx = 0; m.vy = 0;
      if (this.telegraphTimer <= 0) {
        this.ctrl.enterAttack(m.config.moves[this.pendingMoveId] ? this.pendingMoveId : 'attack_1', mods);
        if (this.hasToken) { releaseToken(); this.hasToken = false; }
        this.aiTimer = (m.isBoss ? (m.bossPhase === 3 ? 0.85 : 1.1) : 1.45) / Math.max(0.8, mods.enemySpeedMult);
      }
      this.ctrl.view.sync(m, this.telegraphTimer > 0, this.pendingIsRedHeavy);
      return;
    }

    this.aiTimer -= dt;
    if (m.state === FighterState.IDLE || m.state === FighterState.RUN) {
      const dx = p.x - m.x; const dy = p.groundY - m.groundY;
      const distX = Math.abs(dx); const distY = Math.abs(dy);
      m.facing = dx >= 0 ? 1 : -1;
      const isRangedMob = id === 'syndicate_gunner' || id === 'void_acolyte';
      const attackRange = m.isBoss ? 118 : isRangedMob ? 90 : 84;
      if (distX <= attackRange && distY <= 30 && this.aiTimer <= 0) {
        if (this.hasToken || requestToken()) {
          this.hasToken = true; this.attackCounter++;
          const useRedHeavy = m.isBoss && this.attackCounter % 2 === 0 && !!m.config.moves['heavy_red'];
          this.pendingIsRedHeavy = useRedHeavy;
          this.pendingMoveId = useRedHeavy ? 'heavy_red' : 'attack_1';
          this.telegraphTimer = useRedHeavy ? 0.38 : (m.isBoss ? 0.3 : 0.25);
          m.vx = 0; m.vy = 0;
        }
      } else {
        const speedMult = mods.enemySpeedMult * (m.slowTimer > 0 ? 0.8 : 1);
        const desiredDist = isRangedMob ? 240 : attackRange - 12;
        m.vx = distX > desiredDist ? m.facing * m.config.stats.moveSpeedX * 0.58 * speedMult : 0;
        m.vy = distY > 14 ? Math.sign(dy) * m.config.stats.moveSpeedY * 0.65 * speedMult : 0;
        m.state = (m.vx !== 0 || m.vy !== 0) ? FighterState.RUN : FighterState.IDLE;
      }
    }

    this.ctrl.update(dt, 0, [player], mods, minX, maxX, gravityMult);
    this.ctrl.view.sync(m, this.telegraphTimer > 0, this.pendingIsRedHeavy);
  }
}
