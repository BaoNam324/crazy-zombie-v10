export interface GameSettings {
  sfxVolume: number;
  muted: boolean;
  screenShake: boolean;
  highVfx: boolean;
  defaultHitbox: boolean;
}

const STORAGE_KEY = 'cz10_settings_v10';

const DEFAULT_SETTINGS: GameSettings = {
  sfxVolume: 0.75,
  muted: false,
  screenShake: true,
  highVfx: true,
  defaultHitbox: false,
};

let cached: GameSettings | null = null;

export function getSettings(): GameSettings {
  if (cached) return cached;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<GameSettings>;
      cached = { ...DEFAULT_SETTINGS, ...parsed };
      return cached;
    }
  } catch { /* ignore storage errors */ }
  cached = { ...DEFAULT_SETTINGS };
  return cached;
}

export function updateSettings(patch: Partial<GameSettings>): GameSettings {
  const next = { ...getSettings(), ...patch };
  cached = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch { /* ignore storage errors */ }
  return next;
}
