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
  /** 0-based reveal level: how many times the clip has been extended. */
  revealLevel: number;
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
        revealLevel: Math.min(daily.guesses.length, MAX_REVEAL_LEVEL),
      };
    }
    return { answerId: pickDailySong(dateKey), guesses: [], locked: false, revealLevel: 0 };
  }
  return { answerId: pickRandomSong(), guesses: [], locked: false, revealLevel: 0 };
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

  const { answerId, guesses, locked, revealLevel } = round;

  const status = useMemo<'playing' | 'won' | 'lost'>(() => {
    if (guesses.some((g) => g.feedback === 'correct')) return 'won';
    if (guesses.length >= MAX_ATTEMPTS) return 'lost';
    return 'playing';
  }, [guesses]);

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
        });
        setRound({ answerId, guesses: next, locked: true, revealLevel });
      } else {
        setRound({ answerId, guesses: next, locked, revealLevel });
      }

      return guess;
    },
    [answerId, dateKey, guesses, locked, mode, revealLevel, stats, status],
  );

  /**
   * Skip: reveal the next longer clip WITHOUT consuming a guess attempt.
   * Advances the reveal level by one, capped at the maximum clip length.
   */
  const skip = useCallback(() => {
    if (status !== 'playing' || locked) return;
    setRound((prev) => ({
      ...prev,
      revealLevel: Math.min(prev.revealLevel + 1, MAX_REVEAL_LEVEL),
    }));
  }, [locked, status]);

  const nextRound = useCallback(() => {
    setRound({
      answerId: pickRandomSong(answerId),
      guesses: [],
      locked: false,
      revealLevel: 0,
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
    canSkip: status === 'playing' && !locked && revealLevel < MAX_REVEAL_LEVEL,
    submitGuess,
    skip,
    nextRound,
    attemptsLeft: MAX_ATTEMPTS - guesses.length,
  };
}
