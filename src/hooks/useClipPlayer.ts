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
  /**
   * Warm up the audio for a song ahead of time: resolve the preview URL and
   * buffer the first bytes so the very first `play()` starts instantly.
   */
  preload: (songId: string) => void;
}

/**
 * Streams Apple's 30-second preview for a song and plays a growing segment
 * from the same start point (cumulative reveal: 1s, 2s, ... 6s).
 */
export function useClipPlayer(): UseClipPlayerResult {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);
  /** Song id currently loaded into the audio element. */
  const loadedSongRef = useRef<string | null>(null);
  /** Guards against overlapping async play() calls. */
  const playTokenRef = useRef(0);
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
    // Invalidate any in-flight play() so it doesn't start after we stopped.
    playTokenRef.current += 1;
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
    }
    setIsPlaying(false);
    setIsLoading(false);
  }, [clearTimer]);

  /** Lazily create the shared <audio> element. */
  const getAudio = useCallback((): HTMLAudioElement => {
    let audio = audioRef.current;
    if (!audio) {
      audio = new Audio();
      audio.preload = 'auto';
      audio.crossOrigin = 'anonymous';
      audioRef.current = audio;
    }
    return audio;
  }, []);

  /**
   * Resolve the preview URL and attach it to the audio element so the browser
   * starts buffering. Safe to call repeatedly; only reloads when the song
   * actually changes.
   */
  const preload = useCallback(
    (songId: string) => {
      void (async () => {
        const previewUrl = await getPreviewUrl(songId);
        if (!previewUrl) return;
        const audio = getAudio();
        if (loadedSongRef.current !== songId || audio.src !== previewUrl) {
          audio.src = previewUrl;
          loadedSongRef.current = songId;
          // Kick off buffering without playing.
          audio.load();
        }
      })();
    },
    [getAudio],
  );

  const play = useCallback(
    async (songId: string, seconds: number) => {
      clearTimer();
      setUnavailable(false);
      setIsLoading(true);

      const token = ++playTokenRef.current;
      const song = SONG_BY_ID[songId];
      const previewUrl = await getPreviewUrl(songId);

      // A newer play()/stop() happened while we were awaiting the URL.
      if (token !== playTokenRef.current) return;

      if (!previewUrl) {
        setIsLoading(false);
        setUnavailable(true);
        return;
      }

      const audio = getAudio();

      if (loadedSongRef.current !== songId || audio.src !== previewUrl) {
        audio.src = previewUrl;
        loadedSongRef.current = songId;
      }

      const startAt = song?.clipStart ?? 0;

      const begin = () => {
        if (token !== playTokenRef.current) return;
        try {
          audio.currentTime = startAt;
        } catch {
          // Seeking before metadata is ready can throw; ignore and play.
        }
        const promise = audio.play();
        const onStarted = () => {
          if (token !== playTokenRef.current) return;
          setIsLoading(false);
          setIsPlaying(true);
          // Start the stop timer only once playback has actually begun, so the
          // clip always plays for the full requested duration.
          clearTimer();
          timerRef.current = window.setTimeout(() => {
            audio.pause();
            setIsPlaying(false);
          }, seconds * 1000);
        };
        if (promise) {
          promise.then(onStarted).catch(() => {
            if (token !== playTokenRef.current) return;
            setIsLoading(false);
            setIsPlaying(false);
          });
        } else {
          onStarted();
        }
      };

      // Wait until enough data is buffered to seek reliably.
      if (audio.readyState >= 1) {
        begin();
      } else {
        audio.onloadedmetadata = begin;
        audio.onerror = () => {
          if (token !== playTokenRef.current) return;
          setIsLoading(false);
          setUnavailable(true);
        };
      }
    },
    [clearTimer, getAudio],
  );

  useEffect(() => {
    return () => {
      clearTimer();
      audioRef.current?.pause();
    };
  }, [clearTimer]);

  return { isPlaying, isLoading, play, stop, unavailable, preload };
}
