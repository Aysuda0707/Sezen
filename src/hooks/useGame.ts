import { useCallback, useEffect, useMemo, useState } from 'react';
import type { GameMode, Guess, Stats, Turn } from '../types';
import {
  MAX_ATTEMPTS,
  MAX_CLIP_SECONDS,
  applyResult,
  evaluateGuess,
  pickDailySong,
  pickRandomSong,
  todayKey,
} from '../lib/game';
import { loadDaily, loadStats, saveDaily, saveStats } from '../lib/storage';

interface RoundInit {
  answerId: string;
  guesses: Guess[];
  locked: boolean;
  /** Number of skipped turns used so far (each consumes one attempt). */
  skips: number;
  /** Ordered timeline of every turn (guess or skip) for the share grid. */
  turns: Turn[];
}

/** Highest reveal level allowed (level 5 => 6 seconds). */
const MAX_REVEAL_LEVEL = MAX_CLIP_SECONDS - 1;

/**
 * Rebuild a turn timeline from a persisted record. Newer records already store
 * `turns`; older ones only have `guesses` + `skips`, so we reconstruct a
 * best-effort timeline (guesses first, then skips) for backwards compatibility.
 */
function rebuildTurns(guesses: Guess[], skips: number, turns?: Turn[]): Turn[] {
  if (turns && turns.length > 0) return turns;
  const rebuilt: Turn[] = guesses.map((guess) => ({ type: 'guess', guess }));
  for (let i = 0; i < skips; i++) rebuilt.push({ type: 'skip' });
  return rebuilt;
}

/** Compute the starting round state for a mode (pure, no side effects). */
function initRound(mode: GameMode, dateKey: string): RoundInit {
  if (mode === 'daily') {
    const daily = loadDaily();
    if (daily && daily.date === dateKey) {
      const skips = daily.skips ?? 0;
      return {
        answerId: pickDailySong(dateKey),
        guesses: daily.guesses,
        locked: true,
        skips,
        turns: rebuildTurns(daily.guesses, skips, daily.turns),
      };
    }
    return {
      answerId: pickDailySong(dateKey),
      guesses: [],
      locked: false,
      skips: 0,
      turns: [],
    };
  }
  return {
    answerId: pickRandomSong(),
    guesses: [],
    locked: false,
    skips: 0,
    turns: [],
  };
}

export function useGame(mode: GameMode) {
  const dateKey = todayKey();

  const [round, setRound] = useState<RoundInit>(() => initRound(mode, dateKey));
  const [stats, setStats] = useState<Stats>(() => loadStats());

  // Reset the round when the mode changes (event-driven, not in an effect).
  const [prevMode, setPrevMode] = useState<GameMode>(mode);
  if (prevMode !== mode) {
    setPrevMode(mode);
    setRound(initRound(mode, dateKey));
  }

  const { answerId, guesses, locked, skips, turns } = round;

  /** Total turns used = guesses + skips. Drives attempts and clip length. */
  const turnsUsed = guesses.length + skips;
  /** Clip length is driven by total turns, capped at the max clip length. */
  const revealLevel = Math.min(turnsUsed, MAX_REVEAL_LEVEL);

  const status = useMemo<'playing' | 'won' | 'lost'>(() => {
    if (guesses.some((g) => g.feedback === 'correct')) return 'won';
    if (turnsUsed >= MAX_ATTEMPTS) return 'lost';
    return 'playing';
  }, [guesses, turnsUsed]);

  const submitGuess = useCallback(
    (songId: string, raw: string): Guess | null => {
      if (status !== 'playing' || locked) return null;
      if (guesses.some((g) => g.songId === songId)) return null;

      const feedback = evaluateGuess(songId, answerId);
      const guess: Guess = { songId, raw, feedback };
      const next = [...guesses, guess];
      const nextTurns: Turn[] = [...turns, { type: 'guess', guess }];

      const won = feedback === 'correct';
      const finished = won || nextTurns.length >= MAX_ATTEMPTS;

      if (finished && mode === 'daily') {
        const nextStats = applyResult(stats, won, nextTurns.length, dateKey);
        setStats(nextStats);
        saveStats(nextStats);
        saveDaily({
          date: dateKey,
          guesses: next,
          status: won ? 'won' : 'lost',
          skips,
          turns: nextTurns,
        });
        setRound({ answerId, guesses: next, locked: true, skips, turns: nextTurns });
      } else {
        setRound({ answerId, guesses: next, locked, skips, turns: nextTurns });
      }

      return guess;
    },
    [answerId, dateKey, guesses, locked, mode, skips, stats, status, turns],
  );

  /**
   * Skip: reveal the next longer clip. This CONSUMES one attempt (Deneme +1),
   * so six skips end the round as a loss. The clip grows by one second.
   */
  const skip = useCallback(() => {
    if (status !== 'playing' || locked) return;
    setRound((prev) => {
      const nextSkips = prev.skips + 1;
      const nextTurnsList: Turn[] = [...prev.turns, { type: 'skip' }];
      const turnsUsed = nextTurnsList.length;
      const finished = turnsUsed >= MAX_ATTEMPTS;

      if (finished && mode === 'daily') {
        const nextStats = applyResult(stats, false, turnsUsed, dateKey);
        setStats(nextStats);
        saveStats(nextStats);
        saveDaily({
          date: dateKey,
          guesses: prev.guesses,
          status: 'lost',
          skips: nextSkips,
          turns: nextTurnsList,
        });
        return { ...prev, skips: nextSkips, turns: nextTurnsList, locked: true };
      }

      return { ...prev, skips: nextSkips, turns: nextTurnsList };
    });
  }, [dateKey, locked, mode, stats, status]);

  const nextRound = useCallback(() => {
    setRound({
      answerId: pickRandomSong(answerId),
      guesses: [],
      locked: false,
      skips: 0,
      turns: [],
    });
  }, [answerId]);

  // Keep stats in sync if another tab updates them.
  useEffect(() => {
    const onStorage = () => setStats(loadStats());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return {
    answerId,
    guesses,
    status,
    stats,
    locked,
    revealLevel,
    skips,
    turns,
    turnsUsed,
    canSkip: status === 'playing' && !locked,
    submitGuess,
    skip,
    nextRound,
    attemptsLeft: MAX_ATTEMPTS - turnsUsed,
  };
}
