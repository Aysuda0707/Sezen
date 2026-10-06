import { useCallback, useEffect, useRef, useState } from 'react';
import { SONG_BY_ID } from '../data/songs';
import { getPreviewUrl } from '../lib/itunes';

interface UseClipPlayerResult {
  isPlaying: boolean;
  isLoading: boolean;
  /** Play the clip from the song's start offset for `seconds` seconds. */
  play: (songId: string, seconds: number) => void;
  stop: () => void;
  /** True when no preview could be resolved for the song. */
  unavailable: boolean;
}

/**
 * Streams Apple's 30-second preview for a song and plays a growing segment
 * from the same start point (cumulative reveal: 1s, 2s, ... 6s).
 */
export function useClipPlayer(): UseClipPlayerResult {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [unavailable, setUnavailable] = useState(false);

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
    }
    setIsPlaying(false);
  }, [clearTimer]);

  const play = useCallback(
    async (songId: string, seconds: number) => {
      clearTimer();
      setUnavailable(false);
      setIsLoading(true);

      const song = SONG_BY_ID[songId];
      const previewUrl = await getPreviewUrl(songId);

      if (!previewUrl) {
        setIsLoading(false);
        setUnavailable(true);
        return;
      }

      let audio = audioRef.current;
      if (!audio) {
        audio = new Audio();
        audio.preload = 'auto';
        audio.crossOrigin = 'anonymous';
        audioRef.current = audio;
      }

      if (audio.src !== previewUrl) {
        audio.src = previewUrl;
      }

      const startAt = song?.clipStart ?? 0;

      const begin = () => {
        audio!.currentTime = startAt;
        const promise = audio!.play();
        if (promise) {
          promise.catch(() => {
            setIsPlaying(false);
          });
        }
        setIsLoading(false);
        setIsPlaying(true);
        timerRef.current = window.setTimeout(() => {
          audio!.pause();
          setIsPlaying(false);
        }, seconds * 1000);
      };

      // Wait until enough data is buffered to seek reliably.
      if (audio.readyState >= 1) {
        begin();
      } else {
        audio.onloadedmetadata = begin;
        audio.onerror = () => {
          setIsLoading(false);
          setUnavailable(true);
        };
      }
    },
    [clearTimer],
  );

  useEffect(() => {
    return () => {
      clearTimer();
      audioRef.current?.pause();
    };
  }, [clearTimer]);

  return { isPlaying, isLoading, play, stop, unavailable };
}
