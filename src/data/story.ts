import { ChapterConfig } from '../types/game';

export const STORY_CHAPTERS: ChapterConfig[] = [
  {
    id: 1,
    code: 'act_0',
    title: 'CHƯƠNG 1: THÀNH PHỐ THẤT THỦ',
    subtitle: 'Outbreak Zero — Dị Thể Vết Nứt & Quản Ngục Dịch Hạch Krox',
    skyTop: 0x0b0d14,
    skyBottom: 0x221624,
    rain: true,
    hasCursedArcade: true,
    introDialogue: [
      { speaker: 'HỆ THỐNG RADIO', color: '#67e8f9', text: 'Tín hiệu khẩn cấp! Vết nứt đa vũ trụ vừa xé toạc Neo-Ruin! Dị Thể Bò Vết Nứt và Cảnh Vệ Khiên Thép biến dị đang phong tỏa đại lộ!' },
      { speaker: 'CHIẾN BINH', color: '#ff947d', text: 'Không phải lũ xác sống bình thường nữa... Phải phá vỡ phòng tuyến này và tìm máy Cursed Arcade ẩn!' },
    ],
    bossDialogue: [
      { speaker: 'WARDEN KROX · QUẢN NGỤC DỊCH HẠCH', color: '#84cc16', text: 'Khu cách ly Neo-Ruin đã bị niêm phong! Chùy Xích Lõi Độc của ta sẽ nghiền nát mọi kẻ xâm nhập!' },
    ],
    waves: [
      [{ type: 'rift_crawler', count: 4 }],
      [{ type: 'rift_crawler', count: 3 }, { type: 'riot_brute', count: 2 }],
    ],
    bossType: 'boss_plague_warden',
    bossName: 'WARDEN KROX · QUẢN NGỤC DỊCH HẠCH',
    bossBars: 3,
  },
  {
    id: 2,
    code: 'actz_0',
    title: 'CHƯƠNG 2: PHÒNG TUYẾN CĂN CỨ',
    subtitle: 'Base Under Siege — Quân Đoàn Đánh Thuê Eclipse & Tướng Quân Vex',
    skyTop: 0x140d0f,
    skyBottom: 0x2d1814,
    rain: false,
    hasCursedArcade: false,
    introDialogue: [
      { speaker: 'ĐỘI TRƯỞNG CĂN CỨ', color: '#facc15', text: 'Xạ Thủ Xung Điện và Cảnh Vệ Thiết Giáp của tổ chức Eclipse Syndicate đang áp sát cổng căn cứ! Tận dụng mìn & hàng rào điện!' },
      { speaker: 'RORONOA ZORO', color: '#34d399', text: 'Bọn lính giáp sắt này dám chặn đường ta lạc lối sao? Cứ để Tam Kiếm Phái chém đôi pháo của chúng!' },
    ],
    bossDialogue: [
      { speaker: 'TƯỚNG QUÂN VEX · THIẾT GIÁP ECLIPSE', color: '#f59e0b', text: 'Mục tiêu đã vào tầm ngắm! Pháo Xung Nhịp và Rìu Nhiệt kích hoạt — san phẳng căn cứ kháng chiến!' },
    ],
    waves: [
      [{ type: 'syndicate_gunner', count: 3 }, { type: 'riot_brute', count: 2 }],
      [{ type: 'syndicate_gunner', count: 4 }, { type: 'rift_crawler', count: 2 }],
    ],
    bossType: 'boss_iron_vanguard',
    bossName: 'TƯỚNG QUÂN VEX · THIẾT GIÁP ECLIPSE',
    bossBars: 3,
  },
  {
    id: 3,
    code: 'actsb_0',
    title: 'CHƯƠNG 3: GIẢI CỨU TỬ NHU',
    subtitle: 'Search for Zirou — Phòng Thí Nghiệm Huyết Thanh & Chimera-09',
    skyTop: 0x0c131d,
    skyBottom: 0x1e293b,
    rain: true,
    hasCursedArcade: true,
    introDialogue: [
      { speaker: 'TỬ NHU (ZIROU)', color: '#c084fc', text: 'Cầu cứu... Eclipse Syndicate đã cướp công thức huyết thanh của tôi để tạo ra Thợ Săn Huyết Thanh và quái vật Chimera-09!' },
      { speaker: 'CHIẾN BINH', color: '#ff947d', text: 'Cố giữ vững nhé Tử Nhu! Chúng tôi đang xuyên qua khu thí nghiệm bị cô lập để giải cứu cô ngay!' },
    ],
    bossDialogue: [
      { speaker: 'CHIMERA-09 · MẪU VẬT TỐI THƯỢNG', color: '#34d399', text: 'GRAAAH!! 4 cánh tay năng lượng huyết thanh đã hoàn thiện — xé nát kẻ xâm nhập!' },
    ],
    waves: [
      [{ type: 'serum_stalker', count: 4 }, { type: 'syndicate_gunner', count: 2 }],
      [{ type: 'serum_stalker', count: 3 }, { type: 'riot_brute', count: 3 }],
    ],
    bossType: 'boss_chimera_alpha',
    bossName: 'CHIMERA-09 · THÍ NGHIỆM HUYẾT THANH',
    bossBars: 4,
  },
  {
    id: 4,
    code: 'actx_0',
    title: 'CHƯƠNG 4: TRUY ĐUỔI BÓNG TỐI',
    subtitle: 'Eschatology · Story X — Tu Sĩ Hư Không & Chấp Pháp Quan Archon Nyx',
    skyTop: 0x160a1e,
    skyBottom: 0x2e1042,
    rain: true,
    hasCursedArcade: false,
    hasBranchChoice: true,
    introDialogue: [
      { speaker: 'TỬ NHU (ZIROU)', color: '#c084fc', text: 'Phía trước là điện thờ của Tu Sĩ Hư Không! Có 2 nhánh rẽ: Tuyến Ngắn đột kích thẳng hoặc Tuyến Dài qua kho tiếp tế!' },
      { speaker: 'GOJO SATORU', color: '#38bdf8', text: 'Yên tâm đi, lũ Tu Sĩ Hư Không này cứ để tôi lo. Các cậu chuẩn bị đối đầu Chấp Pháp Quan Archon Nyx!' },
    ],
    bossDialogue: [
      { speaker: 'ARCHON NYX · CHẤP PHÁP QUAN BÓNG TỐI', color: '#c084fc', text: 'Lưỡi Hái Hư Không sẽ cắt đứt dòng thời gian của các ngươi trước khi chạm được vào Lõi Dị Giới!' },
    ],
    waves: [
      [{ type: 'void_acolyte', count: 4 }, { type: 'serum_stalker', count: 3 }],
      [{ type: 'void_acolyte', count: 4 }, { type: 'syndicate_gunner', count: 3 }],
    ],
    bossType: 'boss_eclipse_archon',
    bossName: 'ARCHON NYX · CHẤP PHÁP QUAN BÓNG TỐI',
    bossBars: 4,
  },
  {
    id: 5,
    code: 'act10_0',
    title: 'CHƯƠNG 5: LÕI DỊ GIỚI — ZERO POINT',
    subtitle: 'Hồi kết Đa vũ trụ — Vệ Binh Thời Không & Zero Point Overlord (3 Pha)',
    skyTop: 0x07070f,
    skyBottom: 0x3b0a18,
    rain: false,
    hasCursedArcade: true,
    introDialogue: [
      { speaker: 'ZERO POINT OVERLORD', color: '#ff5733', text: 'Vệ Binh Thời Không của ta sẽ nghiền nát các ngươi! Năng lượng từ 27 chiều không gian sẽ hợp nhất vào Lõi Nhật Thực!' },
      { speaker: 'CHIẾN BINH', color: '#67e8f9', text: 'Đêm nay tổ chức Eclipse và Lõi Dị Giới sẽ chấm dứt tại đây! Toàn lực tiến công!' },
    ],
    bossDialogue: [
      { speaker: 'ZERO POINT OVERLORD · 3 PHA', color: '#ff5733', text: 'PHA 1: Giáp Nhật Thực → PHA 2: Tia Xung Hư Không & Nhát Chém Lõi → PHA 3: Vỡ Lõi Cực Hạn!' },
    ],
    waves: [
      [{ type: 'chrono_sentinel', count: 4 }, { type: 'void_acolyte', count: 3 }],
    ],
    bossType: 'boss_zeropoint',
    bossName: 'ZERO POINT OVERLORD · LÕI THỰC TẠI',
    bossBars: 5,
  },
];
