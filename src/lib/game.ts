import { SONGS, SONG_BY_ID } from '../data/songs';
import type { Feedback, GameMode, Guess, Stats } from '../types';

export const MAX_ATTEMPTS = 6;
export const MAX_CLIP_SECONDS = 6;

/** Duration (seconds) revealed on a given 0-based attempt index. */
export function revealSeconds(attemptIndex: number): number {
  return Math.min(attemptIndex + 1, MAX_CLIP_SECONDS);
}

/** Deterministic 32-bit hash of a string (FNV-1a). */
function hashString(str: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** Today's date as YYYY-MM-DD in the user's local timezone. */
export function todayKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Pick the daily song deterministically from the date. */
export function pickDailySong(dateKey = todayKey()): string {
  const index = hashString(`sezen-${dateKey}`) % SONGS.length;
  return SONGS[index].id;
}

/** Pick a random song, avoiding the given id when possible. */
export function pickRandomSong(excludeId?: string): string {
  const pool = SONGS.filter((s) => s.id !== excludeId);
  const list = pool.length > 0 ? pool : SONGS;
  return list[Math.floor(Math.random() * list.length)].id;
}

/**
 * Evaluate a guess against the answer.
 * - correct: same song
 * - partial: different song but same album
 * - wrong:   everything else
 */
export function evaluateGuess(guessId: string, answerId: string): Feedback {
  if (guessId === answerId) return 'correct';
  const guess = SONG_BY_ID[guessId];
  const answer = SONG_BY_ID[answerId];
  if (guess && answer && guess.album === answer.album) return 'partial';
  return 'wrong';
}

/** Build the emoji grid for sharing (daily mode). */
export function buildShareGrid(guesses: Guess[], won: boolean): string {
  const emoji: Record<Feedback, string> = {
    correct: '🟩',
    partial: '🟨',
    wrong: '🟥',
  };
  const rows = guesses.map((g) => emoji[g.feedback]).join('');
  const score = won ? `${guesses.length}/${MAX_ATTEMPTS}` : `X/${MAX_ATTEMPTS}`;
  return `Sezen Aksu Şarkı Tahmin Oyunu ${todayKey()}\n${score}\n${rows}`;
}

export const EMPTY_STATS: Stats = {
  played: 0,
  wins: 0,
  currentStreak: 0,
  maxStreak: 0,
  guessDistribution: [0, 0, 0, 0, 0, 0],
  lastPlayedDate: null,
};

/** Apply a finished daily game to the stats object (pure). */
export function applyResult(
  stats: Stats,
  won: boolean,
  attempts: number,
  dateKey: string,
): Stats {
  const next: Stats = {
    ...stats,
    guessDistribution: [...stats.guessDistribution],
    played: stats.played + 1,
    lastPlayedDate: dateKey,
  };

  if (won) {
    next.wins += 1;
    next.guessDistribution[attempts - 1] += 1;
    const yesterday = new Date(dateKey);
    yesterday.setDate(yesterday.getDate() - 1);
    const yKey = todayKey(yesterday);
    next.currentStreak =
      stats.lastPlayedDate === yKey ? stats.currentStreak + 1 : 1;
    next.maxStreak = Math.max(next.maxStreak, next.currentStreak);
  } else {
    next.currentStreak = 0;
  }

  return next;
}

export type { GameMode };
