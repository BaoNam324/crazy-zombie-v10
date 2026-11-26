import {
  Difficulty,
  EndlessMutation,
  MysticOrdealConfig,
  RoguelikeBuff,
  RunModifiers,
  VsArenaConfig,
} from '../types/game';

export const DIFFICULTY_PRESETS: Record<
  Difficulty,
  { label: string; enemyHpMult: number; enemyDmgMult: number; enemySpeedMult: number; scoreMult: number }
> = {
  easy: { label: 'DỄ (EASY)', enemyHpMult: 0.75, enemyDmgMult: 0.72, enemySpeedMult: 0.9, scoreMult: 0.8 },
  normal: { label: 'CHUẨN (NORMAL)', enemyHpMult: 1.0, enemyDmgMult: 1.0, enemySpeedMult: 1.0, scoreMult: 1.0 },
  hard: { label: 'KHÓ (HARD)', enemyHpMult: 1.35, enemyDmgMult: 1.3, enemySpeedMult: 1.12, scoreMult: 1.4 },
  eschatology: { label: 'TẬN THẾ (ESCHATOLOGY)', enemyHpMult: 1.75, enemyDmgMult: 1.65, enemySpeedMult: 1.22, scoreMult: 2.0 },
};

export function createDefaultModifiers(
  ordeals: MysticOrdealConfig = { fastEnemies: false, armoredFoes: false, manaDrain: false },
  difficulty: Difficulty = 'normal'
): RunModifiers {
  const diff = DIFFICULTY_PRESETS[difficulty];
  const activeOrdealCount =
    (ordeals.fastEnemies ? 1 : 0) +
    (ordeals.armoredFoes ? 1 : 0) +
    (ordeals.manaDrain ? 1 : 0);

  return {
    damageMult: 1,
    mpCostMult: ordeals.manaDrain ? 1.3 : 1,
    mpRegenBonus: 0,
    rageGainMult: 1,
    parryHeal: 0,
    critChance: 0.1,
    lightningOnHit: false,
    mysticOrdeal: activeOrdealCount > 0,
    ordeals: { ...ordeals },
    difficulty,
    enemyHpMult: diff.enemyHpMult * (ordeals.armoredFoes ? 1.35 : 1),
    enemyDmgMult: diff.enemyDmgMult,
    enemySpeedMult: diff.enemySpeedMult * (ordeals.fastEnemies ? 1.25 : 1),
    scoreMult: diff.scoreMult * (1 + activeOrdealCount * 0.25),
  };
}

export const ROGUELIKE_BUFFS: RoguelikeBuff[] = [
  { id: 'volt_strike', name: 'Lôi Điện Liên Hoàn', desc: 'Mỗi đòn đánh trúng phóng thêm tia sét gây +18 sát thương lan & +10% sát thương.', tag: 'ATK', apply: (m) => { m.lightningOnHit = true; m.damageMult += 0.1; } },
  { id: 'mana_flow', name: 'Huyết Mạch Vô Tận', desc: 'Giảm 35% tiêu hao MP cho mọi kỹ năng U / I / S+U và tăng hồi +3 MP/giây.', tag: 'MP', apply: (m) => { m.mpCostMult = Math.max(0.4, m.mpCostMult - 0.35); m.mpRegenBonus += 3; } },
  { id: 'parry_siphon', name: 'Phản Đòn Hấp Huyết', desc: 'Đỡ chuẩn (Parry phím L) hồi ngay 110 HP và tăng +25% tốc độ tích Rage.', tag: 'DEF', apply: (m) => { m.parryHeal += 110; m.rageGainMult += 0.25; } },
  { id: 'crit_edge', name: 'Kiếm Khí Chí Mạng', desc: 'Tăng +25% tỷ lệ chí mạng (x1.55 sát thương) và +15% sát thương gốc.', tag: 'COMBO', apply: (m) => { m.critChance += 0.25; m.damageMult += 0.15; } },
  { id: 'berserk_rage', name: 'Cuồng Nộ Bùng Nổ', desc: 'Tốc độ tích thanh Nộ (Rage) tăng +50% để kích hoạt Overdrive & Ultimate liên tục.', tag: 'COMBO', apply: (m) => { m.rageGainMult += 0.5; } },
  { id: 'titan_power', name: 'Sức Mạnh Cực Hạn', desc: 'Tăng thẳng +30% sát thương toàn bộ đòn đánh thường và tuyệt chiêu.', tag: 'ATK', apply: (m) => { m.damageMult += 0.3; } },
  { id: 'mystic_catalyst', name: 'Lõi Chú Lực Đa Vũ Trụ', desc: 'Hồi +5 MP/giây và tăng +20% sát thương kỹ năng diện rộng.', tag: 'MP', apply: (m) => { m.mpRegenBonus += 5; m.damageMult += 0.2; } },
  { id: 'iron_guard', name: 'Khiên Thép Kháng Chiến', desc: 'Giảm 20% sát thương nhận vào và Parry hồi thêm +60 HP.', tag: 'DEF', apply: (m) => { m.enemyDmgMult = Math.max(0.45, m.enemyDmgMult * 0.8); m.parryHeal += 60; } },
  { id: 'overclock_combo', name: 'Xung Nhịp Sát Thủ', desc: '+18% tỷ lệ chí mạng, +30% tốc độ tích Rage và phóng tia sét khi đánh trúng.', tag: 'COMBO', apply: (m) => { m.critChance += 0.18; m.rageGainMult += 0.3; m.lightningOnHit = true; } },
];

export const ENDLESS_MUTATIONS: EndlessMutation[] = [
  { id: 'blood_moon', name: 'HUYẾT NGUYỆT CUỒNG NỘ', desc: 'Quái tăng +20% tốc độ & +15% sát thương, nhưng người chơi tích Rage x1.5.', enemySpeedMult: 1.2, enemyDmgMult: 1.15, playerRageMult: 1.5, lowGravity: false },
  { id: 'zero_gravity', name: 'TRỌNG LỰC DỊ GIỚI', desc: 'Trọng lực giảm 30% — dễ tung combo không chiến Juggle kéo dài!', enemySpeedMult: 1.05, enemyDmgMult: 1.0, playerRageMult: 1.2, lowGravity: true },
  { id: 'overdrive_surge', name: 'XUNG ĐIỆN VÔ TẬN', desc: 'Tốc độ tích Nộ x2.0, quái hung hãn hơn +25% sát thương.', enemySpeedMult: 1.15, enemyDmgMult: 1.25, playerRageMult: 2.0, lowGravity: false },
  { id: 'eclipse_siege', name: 'PHONG TỎA ECLIPSE', desc: 'Kẻ địch di chuyển nhanh +30%, phá vỡ hàng phòng ngự cực gắt.', enemySpeedMult: 1.3, enemyDmgMult: 1.2, playerRageMult: 1.35, lowGravity: false },
];

export const VS_ARENAS: VsArenaConfig[] = [
  { id: 0, code: 'actvs_0', name: 'Đại Lộ Mưa Đêm (Neo-Ruin)', skyTop: 0x0b0d14, tint: 0x05070c, midKey: 'stage_mid_1', rain: true, hasTraps: false },
  { id: 1, code: 'actvs_1', name: 'Cổng Căn Cứ Kháng Chiến', skyTop: 0x160d0f, tint: 0x1a0b0b, midKey: 'stage_mid_5', rain: false, hasTraps: true },
  { id: 2, code: 'actvs_2', name: 'Khu Cách Ly Huyết Thanh', skyTop: 0x0c1622, tint: 0x091624, midKey: 'stage_mid_9', rain: true, hasTraps: false },
  { id: 3, code: 'actvs_3', name: 'Cầu Vượt Đổ Nát', skyTop: 0x13111c, tint: 0x140f1e, midKey: 'stage_mid_1', rain: true, hasTraps: true },
  { id: 4, code: 'actvs_4', name: 'Sân Thượng Tháp Eclipse', skyTop: 0x190b24, tint: 0x1e0a2c, midKey: 'stage_mid_5', rain: false, hasTraps: false },
  { id: 5, code: 'actvs_5', name: 'Ga Tàu Điện Ngầm Bỏ Hoang', skyTop: 0x090e14, tint: 0x0d151f, midKey: 'stage_mid_9', rain: false, hasTraps: true },
  { id: 6, code: 'actvs_6', name: 'Quảng Trường Lửa Đỏ', skyTop: 0x240b0b, tint: 0x2a0c0c, midKey: 'stage_mid_1', rain: false, hasTraps: true },
  { id: 7, code: 'actvs_7', name: 'Cảng Container Mưa Bão', skyTop: 0x08131d, tint: 0x091926, midKey: 'stage_mid_5', rain: true, hasTraps: false },
  { id: 8, code: 'actvs_8', name: 'Đấu Trường Cursed Arcade', skyTop: 0x1a0918, tint: 0x200a1d, midKey: 'stage_mid_9', rain: false, hasTraps: false },
  { id: 9, code: 'actvs_9', name: 'Phòng Thí Nghiệm Số 0', skyTop: 0x0a1919, tint: 0x091f1f, midKey: 'stage_mid_1', rain: false, hasTraps: true },
  { id: 10, code: 'actvs_10', name: 'Đồi Bóng Tối Eschatology', skyTop: 0x120a1c, tint: 0x180a26, midKey: 'stage_mid_5', rain: true, hasTraps: false },
  { id: 11, code: 'actvs_11', name: 'Hẻm Núi Vết Nứt', skyTop: 0x1c1209, tint: 0x241509, midKey: 'stage_mid_9', rain: false, hasTraps: true },
  { id: 12, code: 'actvs_12', name: 'Lãnh Địa Vô Lượng', skyTop: 0x060b1c, tint: 0x0c1638, midKey: 'stage_mid_1', rain: false, hasTraps: false },
  { id: 13, code: 'actvs_13', name: 'Hành Lang Tháp Vô Tận', skyTop: 0x140d18, tint: 0x1c0f24, midKey: 'stage_mid_5', rain: true, hasTraps: true },
  { id: 14, code: 'actvs_14', name: 'Lõi Dị Giới — Zero Point', skyTop: 0x090612, tint: 0x2c0814, midKey: 'stage_mid_9', rain: false, hasTraps: true },
];
