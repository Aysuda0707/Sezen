import type { Guess, Stats } from '../types';
import { EMPTY_STATS } from './game';

const STATS_KEY = 'sezen.stats.v1';
const DAILY_KEY = 'sezen.daily.v1';

export interface DailyRecord {
  date: string;
  guesses: Guess[];
  status: 'won' | 'lost';
}

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function loadStats(): Stats {
  const parsed = safeParse<Stats>(localStorage.getItem(STATS_KEY));
  if (!parsed) return { ...EMPTY_STATS, guessDistribution: [0, 0, 0, 0, 0, 0] };
  return {
    ...EMPTY_STATS,
    ...parsed,
    guessDistribution:
      parsed.guessDistribution?.length === 6
        ? parsed.guessDistribution
        : [0, 0, 0, 0, 0, 0],
  };
}

export function saveStats(stats: Stats): void {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export function loadDaily(): DailyRecord | null {
  return safeParse<DailyRecord>(localStorage.getItem(DAILY_KEY));
}

export function saveDaily(record: DailyRecord): void {
  localStorage.setItem(DAILY_KEY, JSON.stringify(record));
}
