import { useCallback, useEffect, useMemo, useState } from 'react';
import type { GameMode, Guess, Stats } from '../types';
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
}

/** Highest reveal level allowed (level 5 => 6 seconds). */
const MAX_REVEAL_LEVEL = MAX_CLIP_SECONDS - 1;

/** Compute the starting round state for a mode (pure, no side effects). */
function initRound(mode: GameMode, dateKey: string): RoundInit {
  if (mode === 'daily') {
    const daily = loadDaily();
    if (daily && daily.date === dateKey) {
      return {
        answerId: pickDailySong(dateKey),
        guesses: daily.guesses,
        locked: true,
        skips: daily.skips ?? 0,
      };
    }
    return { answerId: pickDailySong(dateKey), guesses: [], locked: false, skips: 0 };
  }
  return { answerId: pickRandomSong(), guesses: [], locked: false, skips: 0 };
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

  const { answerId, guesses, locked, skips } = round;

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

      const won = feedback === 'correct';
      const finished = won || next.length >= MAX_ATTEMPTS;

      if (finished && mode === 'daily') {
        const nextStats = applyResult(stats, won, next.length, dateKey);
        setStats(nextStats);
        saveStats(nextStats);
        saveDaily({
          date: dateKey,
          guesses: next,
          status: won ? 'won' : 'lost',
          skips,
        });
        setRound({ answerId, guesses: next, locked: true, skips });
      } else {
        setRound({ answerId, guesses: next, locked, skips });
      }

      return guess;
    },
    [answerId, dateKey, guesses, locked, mode, skips, stats, status],
  );

  /**
   * Skip: reveal the next longer clip. This CONSUMES one attempt (Deneme +1),
   * so six skips end the round as a loss. The clip grows by one second.
   */
  const skip = useCallback(() => {
    if (status !== 'playing' || locked) return;
    setRound((prev) => {
      const nextSkips = prev.skips + 1;
      const nextTurns = prev.guesses.length + nextSkips;
      const finished = nextTurns >= MAX_ATTEMPTS;

      if (finished && mode === 'daily') {
        const nextStats = applyResult(stats, false, nextTurns, dateKey);
        setStats(nextStats);
        saveStats(nextStats);
        saveDaily({
          date: dateKey,
          guesses: prev.guesses,
          status: 'lost',
          skips: nextSkips,
        });
        return { ...prev, skips: nextSkips, locked: true };
      }

      return { ...prev, skips: nextSkips };
    });
  }, [dateKey, locked, mode, stats, status]);

  const nextRound = useCallback(() => {
    setRound({
      answerId: pickRandomSong(answerId),
      guesses: [],
      locked: false,
      skips: 0,
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
    turnsUsed,
    canSkip: status === 'playing' && !locked,
    submitGuess,
    skip,
    nextRound,
    attemptsLeft: MAX_ATTEMPTS - turnsUsed,
  };
}
