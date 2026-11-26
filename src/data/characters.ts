import { CharacterConfig } from '../types/game';

const BASE_HURTBOX = { x: -20, y: -88, w: 40, h: 88 };

export const CHARACTERS: CharacterConfig[] = [
  {
    id: 'zoro', name: 'Roronoa Zoro', title: 'Kiếm Sĩ Tam Kiếm Phái', badge: 'NEW v10.0', weaponStyle: 'three-swords',
    passiveName: 'Kiếm Ý (Sword Intent)', passiveDesc: 'Parry chuẩn (L) hoặc đánh trúng J4 tích tối đa 3 tầng Kiếm Ý (+10% tầm & sát thương/tầng, giảm sau 5s không đánh).',
    palettes: [
      { name: 'Xanh Rêu Timeskip', primary: '#1f5c3a', secondary: '#14181f', accent: '#c92a2a', vfx: '#34d399' },
      { name: 'Vest Đen Dressrosa', primary: '#1e2430', secondary: '#0f1218', accent: '#f59e0b', vfx: '#a855f7' },
      { name: 'Kimono Wano', primary: '#e2e8f0', secondary: '#1e293b', accent: '#10b981', vfx: '#22d3ee' },
      { name: 'Haki Hắc Ấn', primary: '#2d1638', secondary: '#0c0812', accent: '#ff5733', vfx: '#c084fc' },
    ],
    stats: { maxHp: 1020, maxMp: 100, maxRage: 100, mpRegenPerSec: 4.5, moveSpeedX: 230, moveSpeedY: 130, gravity: 1600, depthTolerance: 28 },
    defaultHurtbox: BASE_HURTBOX,
    moves: {
      attack_1: { id: 'attack_1', label: 'Tam Kiếm Ngang', totalFrames: 16, startupFrames: 5, recoveryFrames: 6, mpCost: 0, rageGain: 6, nextCombo: 'attack_2', cancelWindow: { start: 8, end: 14 }, canCancelIntoSkill: true, hitboxes: [{ startFrame: 5, endFrame: 9, rect: { x: 14, y: -74, w: 62, h: 42 }, damage: 38, hitstun: 16, hitstop: 3, knockback: { vx: 55, vz: 0 }, knockdown: false, staggerDamage: 12 }] },
      attack_2: { id: 'attack_2', label: 'Chém Chữ X', totalFrames: 18, startupFrames: 5, recoveryFrames: 7, mpCost: 0, rageGain: 8, nextCombo: 'attack_3', cancelWindow: { start: 9, end: 16 }, canCancelIntoSkill: true, hitboxes: [{ startFrame: 5, endFrame: 10, rect: { x: 16, y: -78, w: 68, h: 48 }, damage: 46, hitstun: 18, hitstop: 4, knockback: { vx: 75, vz: 0 }, knockdown: false, staggerDamage: 15 }] },
      attack_3: { id: 'attack_3', label: 'Xoay Lốc Hất Tung', totalFrames: 22, startupFrames: 6, recoveryFrames: 8, mpCost: 0, rageGain: 10, nextCombo: 'attack_4', cancelWindow: { start: 11, end: 19 }, canCancelIntoSkill: true, hitboxes: [{ startFrame: 6, endFrame: 12, rect: { x: 10, y: -96, w: 68, h: 76 }, damage: 56, hitstun: 26, hitstop: 5, knockback: { vx: 80, vz: 440 }, knockdown: false, staggerDamage: 20 }] },
      attack_4: { id: 'attack_4', label: 'Bổ Kiếm Dập Đất', totalFrames: 24, startupFrames: 7, recoveryFrames: 10, mpCost: 0, rageGain: 12, canCancelIntoSkill: true, cancelWindow: { start: 12, end: 20 }, hitboxes: [{ startFrame: 7, endFrame: 13, rect: { x: 18, y: -92, w: 78, h: 86 }, damage: 72, hitstun: 24, hitstop: 6, knockback: { vx: 190, vz: 180 }, knockdown: true, staggerDamage: 28 }] },
      skill_u: { id: 'skill_u', label: 'Oni Giri (Quỷ Trảm)', totalFrames: 28, startupFrames: 9, recoveryFrames: 14, mpCost: 25, rageGain: 12, cooldownSec: 2.5, dashVelocityX: 540, canCancelIntoSkill: false, hitboxes: [{ startFrame: 9, endFrame: 15, rect: { x: -10, y: -78, w: 118, h: 56 }, damage: 115, hitstun: 24, hitstop: 6, knockback: { vx: 160, vz: 120 }, knockdown: false, bleedDps: 18, staggerDamage: 32 }] },
      skill_i: { id: 'skill_i', label: 'Oo Tatsumaki (Lốc Rồng)', totalFrames: 34, startupFrames: 8, recoveryFrames: 12, mpCost: 35, rageGain: 15, cooldownSec: 6, hitboxes: [{ startFrame: 8, endFrame: 22, rect: { x: -75, y: -115, w: 150, h: 115 }, damage: 130, hitstun: 30, hitstop: 5, knockback: { vx: 40, vz: 360 }, knockdown: false, pullStrength: 220, staggerDamage: 36 }] },
      skill_su: { id: 'skill_su', label: '1080 Pound Phoenix', totalFrames: 28, startupFrames: 9, recoveryFrames: 11, mpCost: 30, rageGain: 12, cooldownSec: 4, hitboxes: [{ startFrame: 9, endFrame: 18, rect: { x: 24, y: -88, w: 220, h: 68 }, damage: 125, hitstun: 22, hitstop: 5, knockback: { vx: 230, vz: 120 }, knockdown: true, staggerDamage: 30 }] },
      ultimate_o: { id: 'ultimate_o', label: 'KYUTORYU: ASHURA', totalFrames: 42, startupFrames: 10, recoveryFrames: 14, mpCost: 0, rageCost: 100, superFreezeFrames: 20, corridorHit: true, hitboxes: [{ startFrame: 10, endFrame: 30, rect: { x: 0, y: -120, w: 340, h: 120 }, damage: 340, hitstun: 42, hitstop: 10, knockback: { vx: 320, vz: 380 }, knockdown: true, bleedDps: 26, staggerDamage: 90 }] },
    },
  },
  {
    id: 'gojo', name: 'Gojo Satoru', title: 'Chú Thuật Sư Lục Nhãn', badge: 'NEW v10.0', weaponStyle: 'sorcerer',
    passiveName: 'Vô Hạn (Limitless · 18s CD)', passiveDesc: 'Tự tạo khiên chặn 1 đòn thường mỗi 18s (tốn 15 MP, vỡ trước đòn đỏ Boss). Máu thấp (820 HP), chuyên khống chế.',
    palettes: [
      { name: 'Đồng Phục Đen Chuẩn', primary: '#141824', secondary: '#e2e8f0', accent: '#38bdf8', vfx: '#38bdf8' },
      { name: 'Kính Râm Thời Trẻ', primary: '#1e293b', secondary: '#f8fafc', accent: '#f43f5e', vfx: '#f43f5e' },
      { name: 'Shibuya Trắng', primary: '#cbd5e1', secondary: '#0f172a', accent: '#a855f7', vfx: '#c084fc' },
      { name: 'Lục Nhãn Hoàng Kim', primary: '#18181b', secondary: '#fef08a', accent: '#facc15', vfx: '#38bdf8' },
    ],
    stats: { maxHp: 820, maxMp: 120, maxRage: 100, mpRegenPerSec: 5.5, moveSpeedX: 255, moveSpeedY: 145, gravity: 1500, depthTolerance: 28 },
    defaultHurtbox: BASE_HURTBOX,
    moves: {
      attack_1: { id: 'attack_1', label: 'Chớp Quyền', totalFrames: 14, startupFrames: 4, recoveryFrames: 5, mpCost: 0, rageGain: 6, nextCombo: 'attack_2', cancelWindow: { start: 7, end: 12 }, canCancelIntoSkill: true, hitboxes: [{ startFrame: 4, endFrame: 8, rect: { x: 14, y: -72, w: 50, h: 36 }, damage: 28, hitstun: 15, hitstop: 3, knockback: { vx: 45, vz: 0 }, knockdown: false, staggerDamage: 10 }] },
      attack_2: { id: 'attack_2', label: 'Đá Tạt Chú Lực', totalFrames: 16, startupFrames: 4, recoveryFrames: 6, mpCost: 0, rageGain: 8, nextCombo: 'attack_3', cancelWindow: { start: 8, end: 14 }, canCancelIntoSkill: true, hitboxes: [{ startFrame: 4, endFrame: 9, rect: { x: 14, y: -76, w: 56, h: 42 }, damage: 34, hitstun: 16, hitstop: 3, knockback: { vx: 65, vz: 0 }, knockdown: false, staggerDamage: 12 }] },
      attack_3: { id: 'attack_3', label: 'Sóng Lực Xanh', totalFrames: 20, startupFrames: 5, recoveryFrames: 7, mpCost: 0, rageGain: 10, nextCombo: 'attack_4', cancelWindow: { start: 10, end: 17 }, canCancelIntoSkill: true, hitboxes: [{ startFrame: 5, endFrame: 11, rect: { x: 14, y: -92, w: 62, h: 68 }, damage: 42, hitstun: 24, hitstop: 4, knockback: { vx: 70, vz: 410 }, knockdown: false, staggerDamage: 16 }] },
      attack_4: { id: 'attack_4', label: 'Búng Tay Trọng Lực', totalFrames: 22, startupFrames: 6, recoveryFrames: 9, mpCost: 0, rageGain: 10, canCancelIntoSkill: true, cancelWindow: { start: 11, end: 18 }, hitboxes: [{ startFrame: 6, endFrame: 12, rect: { x: 18, y: -88, w: 74, h: 74 }, damage: 52, hitstun: 22, hitstop: 5, knockback: { vx: 180, vz: 160 }, knockdown: true, staggerDamage: 22 }] },
      skill_u: { id: 'skill_u', label: 'Thương · Blue', totalFrames: 26, startupFrames: 7, recoveryFrames: 9, mpCost: 25, rageGain: 10, cooldownSec: 5, hitboxes: [{ startFrame: 7, endFrame: 20, rect: { x: 24, y: -110, w: 180, h: 110 }, damage: 85, hitstun: 26, hitstop: 4, knockback: { vx: -120, vz: 160 }, knockdown: false, pullStrength: 300, staggerDamage: 24 }] },
      skill_i: { id: 'skill_i', label: 'Hách · Red', totalFrames: 28, startupFrames: 11, recoveryFrames: 10, mpCost: 35, rageGain: 12, cooldownSec: 5.5, hitboxes: [{ startFrame: 11, endFrame: 18, rect: { x: 20, y: -92, w: 200, h: 78 }, damage: 135, hitstun: 28, hitstop: 6, knockback: { vx: 460, vz: 200 }, knockdown: true, wallBounce: true, staggerDamage: 38 }] },
      skill_su: { id: 'skill_su', label: 'Hư Thức · Hollow Purple', totalFrames: 42, startupFrames: 22, recoveryFrames: 12, mpCost: 55, rageGain: 16, cooldownSec: 9, hitboxes: [{ startFrame: 22, endFrame: 32, rect: { x: 26, y: -115, w: 320, h: 110 }, damage: 220, hitstun: 34, hitstop: 9, knockback: { vx: 380, vz: 280 }, knockdown: true, staggerDamage: 62 }] },
      ultimate_o: { id: 'ultimate_o', label: 'LÃNH ĐỊA: VÔ LƯỢNG KHÔNG XỨ', totalFrames: 44, startupFrames: 10, recoveryFrames: 14, mpCost: 0, rageCost: 100, superFreezeFrames: 20, fullScreenHit: true, mpLockoutSec: 6, hitboxes: [{ startFrame: 10, endFrame: 24, rect: { x: -640, y: -360, w: 1280, h: 720 }, damage: 190, hitstun: 40, hitstop: 8, knockback: { vx: 40, vz: 60 }, knockdown: false, freezeNormalSec: 1.8, freezeBossSec: 0.8, bossVulnBonus: 0.15, staggerDamage: 70 }] },
    },
  },
  {
    id: 'ichigo', name: 'Ichigo Kurosaki', title: 'Tử Thần Thay Thế · Bankai', badge: 'REWORK v10.0', weaponStyle: 'greatsword',
    passiveName: 'Bankai Cancel', passiveDesc: 'Bấm H ngay giữa chuỗi J3 tạo sóng đẩy lùi + vào Bankai (+20% tốc chạy, -4.5 MP/s).',
    palettes: [
      { name: 'Tử Thần Đen Chuẩn', primary: '#18181b', secondary: '#f97316', accent: '#38bdf8', vfx: '#38bdf8' },
      { name: 'Bankai Đỏ Đen', primary: '#09090b', secondary: '#ef4444', accent: '#f8fafc', vfx: '#ef4444' },
      { name: 'Hollow Mask Trắng', primary: '#f1f5f9', secondary: '#18181b', accent: '#fb7185', vfx: '#fb7185' },
      { name: 'Mugetsu Hắc Nguyệt', primary: '#111827', secondary: '#64748b', accent: '#c084fc', vfx: '#a855f7' },
    ],
    stats: { maxHp: 1000, maxMp: 100, maxRage: 100, mpRegenPerSec: 5, moveSpeedX: 255, moveSpeedY: 140, gravity: 1600, depthTolerance: 28 },
    defaultHurtbox: BASE_HURTBOX,
    moves: {
      attack_1: { id: 'attack_1', label: 'Trảm Ngang', totalFrames: 14, startupFrames: 4, recoveryFrames: 5, mpCost: 0, rageGain: 6, nextCombo: 'attack_2', cancelWindow: { start: 7, end: 12 }, canCancelIntoSkill: true, hitboxes: [{ startFrame: 4, endFrame: 8, rect: { x: 16, y: -76, w: 68, h: 44 }, damage: 34, hitstun: 16, hitstop: 3, knockback: { vx: 55, vz: 0 }, knockdown: false, staggerDamage: 12 }] },
      attack_2: { id: 'attack_2', label: 'Trảm Ngược', totalFrames: 16, startupFrames: 4, recoveryFrames: 6, mpCost: 0, rageGain: 8, nextCombo: 'attack_3', cancelWindow: { start: 8, end: 14 }, canCancelIntoSkill: true, hitboxes: [{ startFrame: 4, endFrame: 9, rect: { x: 18, y: -82, w: 74, h: 52 }, damage: 42, hitstun: 18, hitstop: 4, knockback: { vx: 75, vz: 0 }, knockdown: false, staggerDamage: 15 }] },
      attack_3: { id: 'attack_3', label: 'Hất Kiếm Trăng Khuyết', totalFrames: 20, startupFrames: 5, recoveryFrames: 7, mpCost: 0, rageGain: 10, nextCombo: 'attack_4', cancelWindow: { start: 10, end: 18 }, canCancelIntoSkill: true, hitboxes: [{ startFrame: 5, endFrame: 11, rect: { x: 14, y: -96, w: 70, h: 78 }, damage: 52, hitstun: 26, hitstop: 5, knockback: { vx: 80, vz: 460 }, knockdown: false, staggerDamage: 20 }] },
      attack_4: { id: 'attack_4', label: 'Đoạn Không Trảm', totalFrames: 22, startupFrames: 6, recoveryFrames: 9, mpCost: 0, rageGain: 12, canCancelIntoSkill: true, cancelWindow: { start: 11, end: 19 }, hitboxes: [{ startFrame: 6, endFrame: 12, rect: { x: 18, y: -92, w: 84, h: 84 }, damage: 66, hitstun: 24, hitstop: 6, knockback: { vx: 210, vz: 190 }, knockdown: true, staggerDamage: 26 }] },
      skill_u: { id: 'skill_u', label: 'Thuấn Bộ Liên Trảm', totalFrames: 22, startupFrames: 6, recoveryFrames: 8, mpCost: 20, rageGain: 10, cooldownSec: 2.5, dashVelocityX: 520, hitboxes: [{ startFrame: 6, endFrame: 13, rect: { x: -8, y: -76, w: 104, h: 56 }, damage: 95, hitstun: 22, hitstop: 5, knockback: { vx: 130, vz: 200 }, knockdown: false, staggerDamage: 28 }] },
      skill_i: { id: 'skill_i', label: 'Getsuga Tenshou', totalFrames: 26, startupFrames: 7, recoveryFrames: 10, mpCost: 30, rageGain: 12, cooldownSec: 4, hitboxes: [{ startFrame: 7, endFrame: 17, rect: { x: 24, y: -96, w: 230, h: 86 }, damage: 135, hitstun: 24, hitstop: 6, knockback: { vx: 270, vz: 180 }, knockdown: true, staggerDamage: 36 }] },
      skill_su: { id: 'skill_su', label: 'Bankai Burst Wave', totalFrames: 28, startupFrames: 6, recoveryFrames: 10, mpCost: 35, rageGain: 14, cooldownSec: 6, hitboxes: [{ startFrame: 6, endFrame: 16, rect: { x: -85, y: -100, w: 170, h: 100 }, damage: 140, hitstun: 28, hitstop: 7, knockback: { vx: 240, vz: 320 }, knockdown: true, staggerDamage: 42 }] },
      ultimate_o: { id: 'ultimate_o', label: 'BANKAI: FINAL GETSUGA', totalFrames: 42, startupFrames: 10, recoveryFrames: 14, mpCost: 0, rageCost: 100, superFreezeFrames: 22, fullScreenHit: true, hitboxes: [{ startFrame: 10, endFrame: 26, rect: { x: -640, y: -360, w: 1280, h: 720 }, damage: 345, hitstun: 44, hitstop: 11, knockback: { vx: 340, vz: 410 }, knockdown: true, staggerDamage: 92 }] },
    },
  },
  {
    id: 'goku', name: 'Son Goku', title: 'Chiến Binh Saiyan · Kaioken', badge: 'REWORK v10.0', weaponStyle: 'martial',
    passiveName: 'Kaioken & Super Saiyan', passiveDesc: 'Kaioken (U) rút máu trắng hồi lại khi đánh trúng; Super Saiyan (H) 15s; Kamehameha 2 nấc (bấm I×2).',
    palettes: [
      { name: 'Võ Phục Cam Chuẩn', primary: '#ea580c', secondary: '#1d4ed8', accent: '#facc15', vfx: '#38bdf8' },
      { name: 'Super Saiyan Vàng', primary: '#f59e0b', secondary: '#1e3a8a', accent: '#fef08a', vfx: '#facc15' },
      { name: 'Kaioken Huyết Quang', primary: '#dc2626', secondary: '#1e293b', accent: '#fb7185', vfx: '#ef4444' },
      { name: 'Ultra Instinct Bạc', primary: '#334155', secondary: '#e2e8f0', accent: '#67e8f9', vfx: '#e2e8f0' },
    ],
    stats: { maxHp: 1050, maxMp: 100, maxRage: 100, mpRegenPerSec: 5, moveSpeedX: 250, moveSpeedY: 140, gravity: 1600, depthTolerance: 28 },
    defaultHurtbox: BASE_HURTBOX,
    moves: {
      attack_1: { id: 'attack_1', label: 'Đấm Thẳng', totalFrames: 13, startupFrames: 4, recoveryFrames: 5, mpCost: 0, rageGain: 7, nextCombo: 'attack_2', cancelWindow: { start: 6, end: 11 }, canCancelIntoSkill: true, hitboxes: [{ startFrame: 4, endFrame: 8, rect: { x: 14, y: -74, w: 54, h: 38 }, damage: 34, hitstun: 16, hitstop: 3, knockback: { vx: 55, vz: 0 }, knockdown: false, staggerDamage: 12 }] },
      attack_2: { id: 'attack_2', label: 'Liên Hoàn Cước', totalFrames: 15, startupFrames: 4, recoveryFrames: 6, mpCost: 0, rageGain: 9, nextCombo: 'attack_3', cancelWindow: { start: 7, end: 13 }, canCancelIntoSkill: true, hitboxes: [{ startFrame: 4, endFrame: 9, rect: { x: 14, y: -78, w: 60, h: 46 }, damage: 42, hitstun: 18, hitstop: 4, knockback: { vx: 70, vz: 0 }, knockdown: false, staggerDamage: 15 }] },
      attack_3: { id: 'attack_3', label: 'Thượng Quyền Hất Tung', totalFrames: 19, startupFrames: 5, recoveryFrames: 7, mpCost: 0, rageGain: 11, nextCombo: 'attack_4', cancelWindow: { start: 9, end: 17 }, canCancelIntoSkill: true, hitboxes: [{ startFrame: 5, endFrame: 11, rect: { x: 12, y: -96, w: 62, h: 74 }, damage: 50, hitstun: 26, hitstop: 5, knockback: { vx: 75, vz: 450 }, knockdown: false, staggerDamage: 20 }] },
      attack_4: { id: 'attack_4', label: 'Búa Đập Không Trung', totalFrames: 21, startupFrames: 6, recoveryFrames: 8, mpCost: 0, rageGain: 13, canCancelIntoSkill: true, cancelWindow: { start: 10, end: 18 }, hitboxes: [{ startFrame: 6, endFrame: 12, rect: { x: 16, y: -90, w: 72, h: 76 }, damage: 64, hitstun: 24, hitstop: 6, knockback: { vx: 220, vz: 180 }, knockdown: true, staggerDamage: 26 }] },
      skill_u: { id: 'skill_u', label: 'Kaioken Dash', totalFrames: 22, startupFrames: 6, recoveryFrames: 8, mpCost: 22, rageGain: 12, cooldownSec: 3, dashVelocityX: 560, hitboxes: [{ startFrame: 6, endFrame: 14, rect: { x: -8, y: -78, w: 98, h: 58 }, damage: 105, hitstun: 24, hitstop: 6, knockback: { vx: 170, vz: 180 }, knockdown: false, staggerDamage: 30 }] },
      skill_i: { id: 'skill_i', label: 'Kamehameha', totalFrames: 32, startupFrames: 12, recoveryFrames: 10, mpCost: 35, rageGain: 14, cooldownSec: 5, hitboxes: [{ startFrame: 12, endFrame: 22, rect: { x: 24, y: -88, w: 300, h: 66 }, damage: 165, hitstun: 28, hitstop: 7, knockback: { vx: 320, vz: 160 }, knockdown: true, staggerDamage: 44 }] },
      skill_su: { id: 'skill_su', label: 'Long Quyền Xoáy', totalFrames: 28, startupFrames: 7, recoveryFrames: 10, mpCost: 30, rageGain: 14, cooldownSec: 5, hitboxes: [{ startFrame: 7, endFrame: 17, rect: { x: 10, y: -110, w: 120, h: 105 }, damage: 145, hitstun: 28, hitstop: 7, knockback: { vx: 190, vz: 380 }, knockdown: true, staggerDamage: 40 }] },
      ultimate_o: { id: 'ultimate_o', label: 'SUPER SPIRIT BOMB', totalFrames: 44, startupFrames: 12, recoveryFrames: 14, mpCost: 0, rageCost: 100, superFreezeFrames: 22, fullScreenHit: true, hitboxes: [{ startFrame: 12, endFrame: 28, rect: { x: -640, y: -360, w: 1280, h: 720 }, damage: 360, hitstun: 45, hitstop: 12, knockback: { vx: 340, vz: 430 }, knockdown: true, staggerDamage: 96 }] },
    },
  },
  {
    id: 'iori', name: 'Iori Yagami', title: 'Huyết Hỏa Bát Thần · Orochi', badge: 'REWORK v10.0', weaponStyle: 'flame-claw',
    passiveName: 'Orochi Wall Bounce', passiveDesc: 'Maiden Masher gây Wall Bounce; Blood Riot (H) tăng +25% tốc đánh, hút máu 8%, nhận +15% dmg.',
    palettes: [
      { name: 'Áo Trắng Quần Đỏ KOF', primary: '#dc2626', secondary: '#f8fafc', accent: '#a855f7', vfx: '#a855f7' },
      { name: 'Bát Thần Cuồng Hóa', primary: '#4c1d95', secondary: '#0f172a', accent: '#f43f5e', vfx: '#f43f5e' },
      { name: 'Hỏa Lam Cổ Điển', primary: '#1e3a8a', secondary: '#e2e8f0', accent: '#38bdf8', vfx: '#38bdf8' },
      { name: 'Hắc Viêm', primary: '#18181b', secondary: '#52525b', accent: '#fb923c', vfx: '#fb923c' },
    ],
    stats: { maxHp: 980, maxMp: 100, maxRage: 100, mpRegenPerSec: 5.5, moveSpeedX: 265, moveSpeedY: 145, gravity: 1620, depthTolerance: 28 },
    defaultHurtbox: BASE_HURTBOX,
    moves: {
      attack_1: { id: 'attack_1', label: 'Trảo Tím', totalFrames: 13, startupFrames: 4, recoveryFrames: 4, mpCost: 0, rageGain: 6, nextCombo: 'attack_2', cancelWindow: { start: 6, end: 11 }, canCancelIntoSkill: true, hitboxes: [{ startFrame: 4, endFrame: 8, rect: { x: 14, y: -74, w: 56, h: 40 }, damage: 34, hitstun: 16, hitstop: 3, knockback: { vx: 50, vz: 0 }, knockdown: false, staggerDamage: 12 }] },
      attack_2: { id: 'attack_2', label: 'Quỳ Hoa Nhị Thức', totalFrames: 15, startupFrames: 4, recoveryFrames: 5, mpCost: 0, rageGain: 8, nextCombo: 'attack_3', cancelWindow: { start: 7, end: 13 }, canCancelIntoSkill: true, hitboxes: [{ startFrame: 4, endFrame: 9, rect: { x: 14, y: -78, w: 64, h: 46 }, damage: 42, hitstun: 18, hitstop: 4, knockback: { vx: 70, vz: 0 }, knockdown: false, staggerDamage: 16 }] },
      attack_3: { id: 'attack_3', label: 'Quỷ Thiêu Hất Tung', totalFrames: 19, startupFrames: 5, recoveryFrames: 7, mpCost: 0, rageGain: 10, nextCombo: 'attack_4', cancelWindow: { start: 9, end: 17 }, canCancelIntoSkill: true, hitboxes: [{ startFrame: 5, endFrame: 11, rect: { x: 14, y: -96, w: 66, h: 78 }, damage: 52, hitstun: 26, hitstop: 5, knockback: { vx: 75, vz: 460 }, knockdown: false, staggerDamage: 20 }] },
      attack_4: { id: 'attack_4', label: 'Cầm Nguyệt Âm', totalFrames: 22, startupFrames: 6, recoveryFrames: 9, mpCost: 0, rageGain: 12, canCancelIntoSkill: true, cancelWindow: { start: 10, end: 18 }, hitboxes: [{ startFrame: 6, endFrame: 12, rect: { x: 16, y: -88, w: 78, h: 74 }, damage: 68, hitstun: 24, hitstop: 6, knockback: { vx: 260, vz: 160 }, knockdown: true, wallBounce: true, staggerDamage: 28 }] },
      skill_u: { id: 'skill_u', label: 'Ám Phất (Lửa Mặt Đất)', totalFrames: 24, startupFrames: 7, recoveryFrames: 9, mpCost: 22, rageGain: 10, cooldownSec: 3, hitboxes: [{ startFrame: 7, endFrame: 16, rect: { x: 20, y: -56, w: 220, h: 56 }, damage: 105, hitstun: 22, hitstop: 5, knockback: { vx: 160, vz: 120 }, knockdown: false, bleedDps: 16, staggerDamage: 28 }] },
      skill_i: { id: 'skill_i', label: 'Maiden Masher Rush', totalFrames: 28, startupFrames: 7, recoveryFrames: 10, mpCost: 32, rageGain: 14, cooldownSec: 5, dashVelocityX: 520, hitboxes: [{ startFrame: 7, endFrame: 18, rect: { x: -6, y: -84, w: 120, h: 70 }, damage: 145, hitstun: 28, hitstop: 7, knockback: { vx: 360, vz: 200 }, knockdown: true, wallBounce: true, staggerDamage: 40 }] },
      skill_su: { id: 'skill_su', label: 'Bát Trĩ Nữ Cột Lửa', totalFrames: 30, startupFrames: 8, recoveryFrames: 11, mpCost: 35, rageGain: 15, cooldownSec: 6, hitboxes: [{ startFrame: 8, endFrame: 20, rect: { x: -60, y: -120, w: 150, h: 120 }, damage: 155, hitstun: 30, hitstop: 7, knockback: { vx: 460, vz: 360 }, knockdown: true, wallBounce: true, bleedDps: 20, staggerDamage: 44 }] },
      ultimate_o: { id: 'ultimate_o', label: 'OROCHI: BÁT TRĨ NỮ CUỒNG BẠO', totalFrames: 42, startupFrames: 10, recoveryFrames: 14, mpCost: 0, rageCost: 100, superFreezeFrames: 20, corridorHit: true, hitboxes: [{ startFrame: 10, endFrame: 30, rect: { x: -20, y: -120, w: 340, h: 120 }, damage: 350, hitstun: 44, hitstop: 10, knockback: { vx: 360, vz: 390 }, knockdown: true, bleedDps: 25, staggerDamage: 92 }] },
    },
  },
  {
    id: 'zero', name: 'Zero', title: 'Thợ Săn Maverick · Black Zero', badge: 'REWORK v10.0', weaponStyle: 'saber',
    passiveName: 'Saber-Dash & Z-Buster', passiveDesc: 'Z-Buster tự tích 0-100% (+40% dmg); Saber-Dash Cancel nối combo trên không; Black Zero (+15% crit).',
    palettes: [
      { name: 'Giáp Đỏ Maverick', primary: '#dc2626', secondary: '#f8fafc', accent: '#22c55e', vfx: '#4ade80' },
      { name: 'Black Zero', primary: '#18181b', secondary: '#a855f7', accent: '#facc15', vfx: '#c084fc' },
      { name: 'Omega Đỏ Thẫm', primary: '#991b1b', secondary: '#fde047', accent: '#fb7185', vfx: '#fb7185' },
      { name: 'Cyber Cyan', primary: '#0284c7', secondary: '#e0f2fe', accent: '#38bdf8', vfx: '#38bdf8' },
    ],
    stats: { maxHp: 960, maxMp: 110, maxRage: 100, mpRegenPerSec: 6, moveSpeedX: 275, moveSpeedY: 150, gravity: 1580, depthTolerance: 28 },
    defaultHurtbox: BASE_HURTBOX,
    moves: {
      attack_1: { id: 'attack_1', label: 'Z-Saber 1', totalFrames: 12, startupFrames: 3, recoveryFrames: 4, mpCost: 0, rageGain: 6, nextCombo: 'attack_2', cancelWindow: { start: 5, end: 10 }, canCancelIntoSkill: true, hitboxes: [{ startFrame: 3, endFrame: 7, rect: { x: 14, y: -74, w: 62, h: 42 }, damage: 32, hitstun: 15, hitstop: 3, knockback: { vx: 50, vz: 0 }, knockdown: false, staggerDamage: 12 }] },
      attack_2: { id: 'attack_2', label: 'Z-Saber 2', totalFrames: 14, startupFrames: 4, recoveryFrames: 5, mpCost: 0, rageGain: 8, nextCombo: 'attack_3', cancelWindow: { start: 6, end: 12 }, canCancelIntoSkill: true, hitboxes: [{ startFrame: 4, endFrame: 8, rect: { x: 16, y: -80, w: 68, h: 48 }, damage: 40, hitstun: 17, hitstop: 3, knockback: { vx: 65, vz: 0 }, knockdown: false, staggerDamage: 14 }] },
      attack_3: { id: 'attack_3', label: 'Ryuenjin (Long Viêm Nhận)', totalFrames: 18, startupFrames: 5, recoveryFrames: 6, mpCost: 0, rageGain: 10, nextCombo: 'attack_4', cancelWindow: { start: 9, end: 16 }, canCancelIntoSkill: true, hitboxes: [{ startFrame: 5, endFrame: 11, rect: { x: 12, y: -98, w: 66, h: 82 }, damage: 52, hitstun: 26, hitstop: 5, knockback: { vx: 70, vz: 470 }, knockdown: false, staggerDamage: 20 }] },
      attack_4: { id: 'attack_4', label: 'Kuuenbu Xoay Kiếm', totalFrames: 20, startupFrames: 5, recoveryFrames: 8, mpCost: 0, rageGain: 12, canCancelIntoSkill: true, cancelWindow: { start: 9, end: 17 }, hitboxes: [{ startFrame: 5, endFrame: 12, rect: { x: -16, y: -94, w: 96, h: 82 }, damage: 64, hitstun: 24, hitstop: 5, knockback: { vx: 200, vz: 190 }, knockdown: true, staggerDamage: 26 }] },
      skill_u: { id: 'skill_u', label: 'Shippuuga Dash', totalFrames: 20, startupFrames: 5, recoveryFrames: 7, mpCost: 18, rageGain: 10, cooldownSec: 2.2, dashVelocityX: 590, hitboxes: [{ startFrame: 5, endFrame: 12, rect: { x: -10, y: -78, w: 108, h: 56 }, damage: 92, hitstun: 22, hitstop: 5, knockback: { vx: 150, vz: 160 }, knockdown: false, staggerDamage: 26 }] },
      skill_i: { id: 'skill_i', label: 'Z-Buster Charge Shot', totalFrames: 24, startupFrames: 7, recoveryFrames: 9, mpCost: 28, rageGain: 12, cooldownSec: 3.5, hitboxes: [{ startFrame: 7, endFrame: 16, rect: { x: 24, y: -82, w: 280, h: 54 }, damage: 130, hitstun: 24, hitstop: 6, knockback: { vx: 280, vz: 120 }, knockdown: true, staggerDamage: 36 }] },
      skill_su: { id: 'skill_su', label: 'Rakkouha (Lạc Phượng Phá)', totalFrames: 30, startupFrames: 8, recoveryFrames: 11, mpCost: 35, rageGain: 14, cooldownSec: 5.5, hitboxes: [{ startFrame: 8, endFrame: 20, rect: { x: -110, y: -115, w: 220, h: 115 }, damage: 150, hitstun: 28, hitstop: 7, knockback: { vx: 240, vz: 300 }, knockdown: true, staggerDamage: 42 }] },
      ultimate_o: { id: 'ultimate_o', label: 'GENMU ZERO · BLACK OVERDRIVE', totalFrames: 40, startupFrames: 9, recoveryFrames: 12, mpCost: 0, rageCost: 100, superFreezeFrames: 20, corridorHit: true, hitboxes: [{ startFrame: 9, endFrame: 26, rect: { x: 0, y: -125, w: 380, h: 125 }, damage: 335, hitstun: 42, hitstop: 10, knockback: { vx: 340, vz: 390 }, knockdown: true, staggerDamage: 88 }] },
    },
  },
  {
    id: 'asuna', name: 'Asuna Yuuki', title: 'Tia Chớp · Starburst', badge: 'REWORK v10.0', weaponStyle: 'rapier',
    passiveName: 'Switch Parry & Chí Mạng', passiveDesc: 'Parry (L) dịch chuyển ra sau lưng Boss; Overdrive O = Mother\'s Rosario 11-hit xuyên giáp.',
    palettes: [
      { name: 'Hiệp Sĩ Huyết Minh', primary: '#f8fafc', secondary: '#dc2626', accent: '#f59e0b', vfx: '#38bdf8' },
      { name: 'Undine Lam Ngọc', primary: '#0ea5e9', secondary: '#f8fafc', accent: '#67e8f9', vfx: '#67e8f9' },
      { name: 'Stacia Hoàng Kim', primary: '#fef3c7', secondary: '#d97706', accent: '#fb7185', vfx: '#facc15' },
      { name: 'Ánh Chớp Hồng', primary: '#ec4899', secondary: '#1e1b4b', accent: '#f9a8d4', vfx: '#f472b6' },
    ],
    stats: { maxHp: 940, maxMp: 110, maxRage: 100, mpRegenPerSec: 6, moveSpeedX: 280, moveSpeedY: 155, gravity: 1580, depthTolerance: 28 },
    defaultHurtbox: BASE_HURTBOX,
    moves: {
      attack_1: { id: 'attack_1', label: 'Linear Thrust', totalFrames: 12, startupFrames: 3, recoveryFrames: 4, mpCost: 0, rageGain: 6, nextCombo: 'attack_2', cancelWindow: { start: 5, end: 10 }, canCancelIntoSkill: true, hitboxes: [{ startFrame: 3, endFrame: 7, rect: { x: 16, y: -74, w: 64, h: 32 }, damage: 30, hitstun: 15, hitstop: 2, knockback: { vx: 45, vz: 0 }, knockdown: false, staggerDamage: 11 }] },
      attack_2: { id: 'attack_2', label: 'Parallel Sting', totalFrames: 14, startupFrames: 3, recoveryFrames: 5, mpCost: 0, rageGain: 8, nextCombo: 'attack_3', cancelWindow: { start: 6, end: 12 }, canCancelIntoSkill: true, hitboxes: [{ startFrame: 3, endFrame: 8, rect: { x: 18, y: -76, w: 70, h: 36 }, damage: 38, hitstun: 17, hitstop: 3, knockback: { vx: 60, vz: 0 }, knockdown: false, staggerDamage: 14 }] },
      attack_3: { id: 'attack_3', label: 'Flashing Penetrator Up', totalFrames: 18, startupFrames: 4, recoveryFrames: 6, mpCost: 0, rageGain: 10, nextCombo: 'attack_4', cancelWindow: { start: 8, end: 16 }, canCancelIntoSkill: true, hitboxes: [{ startFrame: 4, endFrame: 10, rect: { x: 14, y: -96, w: 68, h: 76 }, damage: 48, hitstun: 25, hitstop: 4, knockback: { vx: 70, vz: 450 }, knockdown: false, staggerDamage: 18 }] },
      attack_4: { id: 'attack_4', label: 'Shooting Star', totalFrames: 20, startupFrames: 5, recoveryFrames: 8, mpCost: 0, rageGain: 12, canCancelIntoSkill: true, cancelWindow: { start: 9, end: 17 }, hitboxes: [{ startFrame: 5, endFrame: 11, rect: { x: 18, y: -90, w: 82, h: 72 }, damage: 62, hitstun: 24, hitstop: 5, knockback: { vx: 210, vz: 180 }, knockdown: true, staggerDamage: 24 }] },
      skill_u: { id: 'skill_u', label: 'Switch Dash Thrust', totalFrames: 20, startupFrames: 5, recoveryFrames: 7, mpCost: 18, rageGain: 10, cooldownSec: 2, dashVelocityX: 600, hitboxes: [{ startFrame: 5, endFrame: 12, rect: { x: -10, y: -76, w: 112, h: 48 }, damage: 90, hitstun: 22, hitstop: 4, knockback: { vx: 140, vz: 140 }, knockdown: false, staggerDamage: 26 }] },
      skill_i: { id: 'skill_i', label: 'Quadruple Pain', totalFrames: 26, startupFrames: 6, recoveryFrames: 9, mpCost: 28, rageGain: 12, cooldownSec: 4, hitboxes: [{ startFrame: 6, endFrame: 18, rect: { x: 14, y: -88, w: 150, h: 66 }, damage: 132, hitstun: 26, hitstop: 5, knockback: { vx: 240, vz: 180 }, knockdown: true, staggerDamage: 34 }] },
      skill_su: { id: 'skill_su', label: 'Star Splash Spiral', totalFrames: 28, startupFrames: 6, recoveryFrames: 10, mpCost: 32, rageGain: 14, cooldownSec: 5, hitboxes: [{ startFrame: 6, endFrame: 18, rect: { x: -80, y: -105, w: 160, h: 105 }, damage: 142, hitstun: 28, hitstop: 6, knockback: { vx: 180, vz: 330 }, knockdown: true, staggerDamage: 38 }] },
      ultimate_o: { id: 'ultimate_o', label: "MOTHER'S ROSARIO · 11-HIT", totalFrames: 40, startupFrames: 8, recoveryFrames: 12, mpCost: 0, rageCost: 100, superFreezeFrames: 20, corridorHit: true, hitboxes: [{ startFrame: 8, endFrame: 28, rect: { x: 0, y: -115, w: 340, h: 115 }, damage: 340, hitstun: 42, hitstop: 9, knockback: { vx: 320, vz: 370 }, knockdown: true, staggerDamage: 90 }] },
    },
  },
];

interface ClassicHeroSeed {
  id: string; name: string; title: string; weapon: CharacterConfig['weaponStyle'];
  hp: number; speed: number; p1: string; p2: string; acc: string; vfx: string;
  skillU: string; skillI: string; skillSU: string; ult: string; passive: string;
}

function makeClassicHero(s: ClassicHeroSeed): CharacterConfig {
  return {
    id: s.id, name: s.name, title: s.title, badge: 'REWORK v10.0', weaponStyle: s.weapon,
    passiveName: `Overdrive · ${s.passive}`,
    passiveDesc: `Tướng kinh điển bản 9.0 được bổ sung trạng thái Overdrive 12s (phím H) + cân bằng Frame Data 60 FPS.`,
    palettes: [
      { name: 'Màu Gốc 9.0', primary: s.p1, secondary: s.p2, accent: s.acc, vfx: s.vfx },
      { name: 'MUGEN Bóng Tối', primary: '#18181b', secondary: s.p1, accent: s.vfx, vfx: s.vfx },
      { name: 'Hoàng Kim EX', primary: '#b45309', secondary: '#1e293b', accent: '#facc15', vfx: '#facc15' },
      { name: 'Cyber Neon', primary: '#0f172a', secondary: '#1e293b', accent: '#22d3ee', vfx: '#38bdf8' },
    ],
    stats: { maxHp: s.hp, maxMp: 100, maxRage: 100, mpRegenPerSec: 5.2, moveSpeedX: s.speed, moveSpeedY: Math.round(s.speed * 0.56), gravity: 1600, depthTolerance: 28 },
    defaultHurtbox: BASE_HURTBOX,
    moves: {
      attack_1: { id: 'attack_1', label: 'Đòn 1', totalFrames: 14, startupFrames: 4, recoveryFrames: 5, mpCost: 0, rageGain: 6, nextCombo: 'attack_2', cancelWindow: { start: 7, end: 12 }, canCancelIntoSkill: true, hitboxes: [{ startFrame: 4, endFrame: 8, rect: { x: 14, y: -74, w: 58, h: 42 }, damage: 34, hitstun: 16, hitstop: 3, knockback: { vx: 55, vz: 0 }, knockdown: false, staggerDamage: 12 }] },
      attack_2: { id: 'attack_2', label: 'Đòn 2', totalFrames: 16, startupFrames: 4, recoveryFrames: 6, mpCost: 0, rageGain: 8, nextCombo: 'attack_3', cancelWindow: { start: 8, end: 14 }, canCancelIntoSkill: true, hitboxes: [{ startFrame: 4, endFrame: 9, rect: { x: 16, y: -78, w: 64, h: 46 }, damage: 42, hitstun: 18, hitstop: 4, knockback: { vx: 72, vz: 0 }, knockdown: false, staggerDamage: 15 }] },
      attack_3: { id: 'attack_3', label: 'Hất Tung', totalFrames: 20, startupFrames: 5, recoveryFrames: 7, mpCost: 0, rageGain: 10, nextCombo: 'attack_4', cancelWindow: { start: 9, end: 17 }, canCancelIntoSkill: true, hitboxes: [{ startFrame: 5, endFrame: 11, rect: { x: 12, y: -96, w: 64, h: 76 }, damage: 50, hitstun: 26, hitstop: 5, knockback: { vx: 75, vz: 450 }, knockdown: false, staggerDamage: 20 }] },
      attack_4: { id: 'attack_4', label: 'Kết Liễu', totalFrames: 22, startupFrames: 6, recoveryFrames: 9, mpCost: 0, rageGain: 12, canCancelIntoSkill: true, cancelWindow: { start: 10, end: 18 }, hitboxes: [{ startFrame: 6, endFrame: 12, rect: { x: 16, y: -90, w: 76, h: 76 }, damage: 64, hitstun: 24, hitstop: 6, knockback: { vx: 210, vz: 180 }, knockdown: true, staggerDamage: 26 }] },
      skill_u: { id: 'skill_u', label: s.skillU, totalFrames: 22, startupFrames: 6, recoveryFrames: 8, mpCost: 22, rageGain: 10, cooldownSec: 2.8, dashVelocityX: 500, hitboxes: [{ startFrame: 6, endFrame: 14, rect: { x: -6, y: -78, w: 108, h: 58 }, damage: 100, hitstun: 24, hitstop: 5, knockback: { vx: 170, vz: 170 }, knockdown: false, staggerDamage: 28 }] },
      skill_i: { id: 'skill_i', label: s.skillI, totalFrames: 28, startupFrames: 8, recoveryFrames: 10, mpCost: 30, rageGain: 13, cooldownSec: 4.5, hitboxes: [{ startFrame: 8, endFrame: 18, rect: { x: 20, y: -92, w: 220, h: 72 }, damage: 140, hitstun: 26, hitstop: 6, knockback: { vx: 280, vz: 180 }, knockdown: true, staggerDamage: 38 }] },
      skill_su: { id: 'skill_su', label: s.skillSU, totalFrames: 30, startupFrames: 8, recoveryFrames: 11, mpCost: 34, rageGain: 14, cooldownSec: 5.5, hitboxes: [{ startFrame: 8, endFrame: 20, rect: { x: -85, y: -110, w: 170, h: 110 }, damage: 150, hitstun: 28, hitstop: 7, knockback: { vx: 220, vz: 340 }, knockdown: true, staggerDamage: 42 }] },
      ultimate_o: { id: 'ultimate_o', label: s.ult, totalFrames: 42, startupFrames: 10, recoveryFrames: 14, mpCost: 0, rageCost: 100, superFreezeFrames: 20, corridorHit: true, hitboxes: [{ startFrame: 10, endFrame: 28, rect: { x: -10, y: -120, w: 360, h: 120 }, damage: 340, hitstun: 42, hitstop: 10, knockback: { vx: 340, vz: 390 }, knockdown: true, staggerDamage: 90 }] },
    },
  };
}

const CLASSIC_20: ClassicHeroSeed[] = [
  { id: 'naruto', name: 'Naruto Uzumaki', title: 'Ninja Làng Lá · Cửu Vĩ', weapon: 'martial', hp: 1000, speed: 260, p1: '#f97316', p2: '#18181b', acc: '#facc15', vfx: '#38bdf8', skillU: 'Ảnh Phân Thân Dash', skillI: 'Rasengan', skillSU: 'Rasenshuriken', ult: 'KYUUBI BIJUU DAMA', passive: 'Cửu Vĩ Chakra' },
  { id: 'freeza', name: 'Freeza', title: 'Hoàng Đế Vũ Trụ · Golden', weapon: 'sorcerer', hp: 960, speed: 255, p1: '#e2e8f0', p2: '#7e22ce', acc: '#c084fc', vfx: '#c084fc', skillU: 'Death Dash', skillI: 'Death Beam', skillSU: 'Death Saucer', ult: 'SUPERNOVA HỦY DIỆT', passive: 'Golden Form' },
  { id: 'seiya', name: 'Pegasus Seiya', title: 'Thánh Đấu Sĩ Thiên Mã', weapon: 'martial', hp: 1010, speed: 260, p1: '#e2e8f0', p2: '#dc2626', acc: '#38bdf8', vfx: '#67e8f9', skillU: 'Pegasus Dash', skillI: 'Thiên Mã Lưu Tinh Quyền', skillSU: 'Thiên Mã Tuệ Tinh', ult: 'GOLD CLOTH METEOR', passive: 'Tiểu Vũ Trụ' },
  { id: 'mario', name: 'Super Mario', title: 'Thợ Sửa Ống Nước · Bigger', weapon: 'martial', hp: 980, speed: 245, p1: '#dc2626', p2: '#1d4ed8', acc: '#facc15', vfx: '#fb923c', skillU: 'Cape Spin', skillI: 'Fireball Barrage', skillSU: 'Mega Stomp', ult: 'STARMAN BIGGER RUSH', passive: 'Nấm Khổng Lồ' },
  { id: 'sonson', name: 'SonSon', title: 'Hậu Duệ Tề Thiên', weapon: 'saber', hp: 950, speed: 265, p1: '#ec4899', p2: '#facc15', acc: '#fb923c', vfx: '#facc15', skillU: 'Như Ý Bổng Lướt', skillI: 'Hỏa Diệm Xung', skillSU: 'Cân Đẩu Vân Xoáy', ult: 'KHỔNG LỒ HẦU VƯƠNG', passive: '72 Phép Biến Hóa' },
  { id: 'hulk', name: 'The Hulk', title: 'Người Khổng Lồ Xanh', weapon: 'martial', hp: 1220, speed: 215, p1: '#15803d', p2: '#581c87', acc: '#4ade80', vfx: '#4ade80', skillU: 'Gamma Charge', skillI: 'Thunder Clap', skillSU: 'Gamma Quake', ult: 'WORLD BREAKER SMASH', passive: 'Càng Đánh Càng Trâu' },
  { id: 'ultraman', name: 'Ultraman', title: 'Chiến Binh Ánh Sáng M78', weapon: 'martial', hp: 1080, speed: 240, p1: '#dc2626', p2: '#cbd5e1', acc: '#38bdf8', vfx: '#38bdf8', skillU: 'Ultra Dash', skillI: 'Tia Specium', skillSU: 'Ultra Slash Ring', ult: 'M78 SPECIMUM NOVA', passive: 'Đèn Năng Lượng' },
  { id: 'cyclops', name: 'Cyclops', title: 'Thủ Lĩnh X-Men', weapon: 'sorcerer', hp: 960, speed: 248, p1: '#1d4ed8', p2: '#facc15', acc: '#ef4444', vfx: '#ef4444', skillU: 'Tactical Roll', skillI: 'Optic Blast', skillSU: 'Gene Splice', ult: 'MEGA OPTIC BLAST', passive: 'Tia Laser Xuyên Giáp' },
  { id: 'bob_parr', name: 'Mr. Incredible', title: 'Siêu Nhân Sức Mạnh', weapon: 'martial', hp: 1180, speed: 225, p1: '#dc2626', p2: '#18181b', acc: '#facc15', vfx: '#fb923c', skillU: 'Shoulder Tackle', skillI: 'Shockwave Slam', skillSU: 'Boulder Toss', ult: 'INCREDIBLE METEOR', passive: 'Cú Đấm Thiết Giáp' },
  { id: 'knight', name: 'Dark Knight', title: 'Hiệp Sĩ Trọng Giáp', weapon: 'greatsword', hp: 1120, speed: 220, p1: '#334155', p2: '#0f172a', acc: '#f59e0b', vfx: '#facc15', skillU: 'Shield Bash', skillI: 'Crescent Cleave', skillSU: 'Judgment Pillar', ult: 'HOLY CRUSADE SLASH', passive: 'Thiết Giáp' },
  { id: 'skullomania', name: 'Skullomania', title: 'Anh Hùng Bộ Xương', weapon: 'martial', hp: 960, speed: 270, p1: '#18181b', p2: '#f8fafc', acc: '#ef4444', vfx: '#f8fafc', skillU: 'Skullo Head', skillI: 'Skullo Slider', skillSU: 'Skullo Dive', ult: 'SUPER SKULLO DREAM', passive: 'Tốc Độ Dị Biệt' },
  { id: 'kirishima', name: 'Syo Kirishima', title: 'Võ Sĩ Hỏa Diệm', weapon: 'flame-claw', hp: 990, speed: 258, p1: '#1e293b', p2: '#f8fafc', acc: '#f97316', vfx: '#fb923c', skillU: 'Flame Rush', skillI: 'Blazing Upper', skillSU: 'Phoenix Kick', ult: 'CRIMSON INFERNO', passive: 'Hỏa Khí' },
  { id: 'dogman', name: 'Dogman', title: 'Chiến Binh Thú Nhân · Bear', weapon: 'flame-claw', hp: 1060, speed: 245, p1: '#78350f', p2: '#1c1917', acc: '#f59e0b', vfx: '#fbbf24', skillU: 'Wild Pounce', skillI: 'Howl Shockwave', skillSU: 'Bear Stance Smash', ult: 'ALPHA BEAST RAMPAGE', passive: 'Hóa Gấu BearCfg' },
  { id: 'kenji', name: 'Kenji', title: 'Nhẫn Giả Lôi Ảnh', weapon: 'saber', hp: 950, speed: 275, p1: '#1e1b4b', p2: '#312e81', acc: '#38bdf8', vfx: '#38bdf8', skillU: 'Kunai Dash', skillI: 'Neem Boom Bomb', skillSU: 'Shadow Clone Cut', ult: 'THUNDER SHINOBI STORM', passive: 'Bộc Phá Neemboom' },
  { id: 'mina', name: 'Mina Majikina', title: 'Xạ Thủ Cung Tiễn', weapon: 'rapier', hp: 920, speed: 262, p1: '#be123c', p2: '#f8fafc', acc: '#fda4af', vfx: '#fb7185', skillU: 'Backstep Shot', skillI: 'Piercing Arrow', skillSU: 'Arrow Rain', ult: 'SACRED MOON VOLLEY', passive: 'Thiện Xạ' },
  { id: 'shimo', name: 'Shimo', title: 'Kiếm Khách Băng Tuyết', weapon: 'saber', hp: 970, speed: 260, p1: '#0369a1', p2: '#e0f2fe', acc: '#67e8f9', vfx: '#67e8f9', skillU: 'Frost Dash', skillI: 'Ice Wave', skillSU: 'Absolute Blizzard', ult: 'ZERO FROST DOMAIN', passive: 'Hàn Khí' },
  { id: 'douwa', name: 'Douwa', title: 'Võ Tăng Cổ Đại', weapon: 'martial', hp: 1020, speed: 245, p1: '#b45309', p2: '#fef3c7', acc: '#f59e0b', vfx: '#facc15', skillU: 'Palm Dash', skillI: 'Chi Blast', skillSU: 'Whirlwind Kick', ult: 'GOLDEN LOTUS PALM', passive: 'Nội Công' },
  { id: 'orochi', name: 'Orochi', title: 'Ý Chí Địa Cầu', weapon: 'sorcerer', hp: 1040, speed: 248, p1: '#f8fafc', p2: '#475569', acc: '#67e8f9', vfx: '#e2e8f0', skillU: 'Void Step', skillI: 'Harai Pillar', skillSU: 'Reflector Shield', ult: 'MAROKARE · SUNLIGHT', passive: 'Thần Lực' },
  { id: 'chicken', name: 'Crazy Chicken', title: 'Chiến Kê Điên Cuồng', weapon: 'martial', hp: 900, speed: 285, p1: '#facc15', p2: '#dc2626', acc: '#ffffff', vfx: '#facc15', skillU: 'Turbo Peck', skillI: 'Egg Bomb', skillSU: 'Feather Tornado', ult: 'SUPER CHICKEN APOCALYPSE', passive: 'Nhanh Nhẹn Cực Hạn' },
  { id: 'soldier', name: 'Metal Soldier', title: 'Đặc Nhiệm Hỏa Lực', weapon: 'rapier', hp: 960, speed: 250, p1: '#3f6212', p2: '#1e293b', acc: '#facc15', vfx: '#fb923c', skillU: 'Combat Slide', skillI: 'Heavy Machine Gun', skillSU: 'Cluster Grenade', ult: 'TACTICAL AIRSTRIKE', passive: 'Kho Vũ Khí' },
];

for (const seed of CLASSIC_20) CHARACTERS.push(makeClassicHero(seed));

export function getCharacterById(id: string): CharacterConfig {
  return CHARACTERS.find(c => c.id === id) ?? CHARACTERS[0];
}
