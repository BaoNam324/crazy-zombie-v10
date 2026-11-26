import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface LeaderboardEntry {
  player_name: string;
  hero_id: string;
  floor_reached: number;
  max_combo: number;
  score: number;
  mystic_ordeal: boolean;
}

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const client: SupabaseClient | null = url && key ? createClient(url, key) : null;
const LOCAL_KEY = 'cz10_local_leaderboard';

export async function submitTowerScore(entry: LeaderboardEntry): Promise<void> {
  try {
    const prev: LeaderboardEntry[] = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
    prev.push(entry);
    prev.sort((a, b) => b.score - a.score);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(prev.slice(0, 20)));
  } catch { /* ignore storage restrictions */ }

  if (!client) return;
  try {
    await client.from('tower_leaderboard').insert(entry);
  } catch { /* offline fallback already saved */ }
}

export async function fetchTopScores(): Promise<LeaderboardEntry[]> {
  if (client) {
    try {
      const { data } = await client
        .from('tower_leaderboard')
        .select('player_name,hero_id,floor_reached,max_combo,score,mystic_ordeal')
        .order('score', { ascending: false })
        .limit(10);
      if (data && data.length > 0) return data as LeaderboardEntry[];
    } catch { /* fallback to local */ }
  }
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
  } catch {
    return [];
  }
}
