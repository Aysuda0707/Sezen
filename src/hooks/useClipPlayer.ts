import { useCallback, useEffect, useRef, useState } from 'react';
import { clipUrl } from '../lib/game';

interface UseClipPlayerResult {
  isPlaying: boolean;
  /** Play the clip from the start for `seconds` seconds. */
  play: (songId: string, seconds: number) => void;
  stop: () => void;
  /** True when the clip file could not be loaded (missing asset). */
  missing: boolean;
}

/**
 * Plays a pre-cut clip from its beginning for a given number of seconds.
 * Each call restarts from the same start point (cumulative reveal).
 */
export function useClipPlayer(): UseClipPlayerResult {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [missing, setMissing] = useState(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    clearTimer();
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setIsPlaying(false);
  }, [clearTimer]);

  const play = useCallback(
    (songId: string, seconds: number) => {
      clearTimer();
      setMissing(false);

      let audio = audioRef.current;
      if (!audio) {
        audio = new Audio();
        audio.preload = 'auto';
        audioRef.current = audio;
      }

      const url = clipUrl(songId);
      if (audio.src !== url) {
        audio.src = url;
      }

      audio.onerror = () => {
        setMissing(true);
        setIsPlaying(false);
      };

      audio.currentTime = 0;
      const promise = audio.play();
      if (promise) {
        promise.catch(() => {
          // Autoplay blocked or file missing; UI shows a Start button.
          setIsPlaying(false);
        });
      }

      setIsPlaying(true);
      timerRef.current = window.setTimeout(() => {
        audio.pause();
        audio.currentTime = 0;
        setIsPlaying(false);
      }, seconds * 1000);
    },
    [clearTimer],
  );

  useEffect(() => {
    return () => {
      clearTimer();
      audioRef.current?.pause();
    };
  }, [clearTimer]);

  return { isPlaying, play, stop, missing };
}
