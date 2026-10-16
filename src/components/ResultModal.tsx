import { useEffect } from 'react';
import { ShareButton } from './ShareButton';
import type { GameMode, Song, Turn } from '../types';

interface ResultModalProps {
  open: boolean;
  won: boolean;
  answer?: Song;
  mode: GameMode;
  turns: Turn[];
  onClose: () => void;
  onNextRound: () => void;
}

/**
 * Full-screen modal that announces the round result (win or lose).
 * Closes on Escape, on backdrop click, or via the close button.
 */
export function ResultModal({
  open,
  won,
  answer,
  mode,
  turns,
  onClose,
  onNextRound,
}: ResultModalProps) {
  // Close on Escape and lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="result-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 animate-fade-in bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Card */}
      <div
        className={`relative w-full max-w-sm animate-pop-in rounded-2xl border p-6 text-center shadow-2xl ${
          won
            ? 'border-correct bg-slate-900/95'
            : 'border-wrong bg-slate-900/95'
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Kapat"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center
            rounded-full text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
        >
          ✕
        </button>

        <div className="text-5xl">{won ? '🎉' : '😔'}</div>
        <h2
          id="result-modal-title"
          className={`mt-3 text-2xl font-extrabold ${
            won ? 'text-correct' : 'text-wrong'
          }`}
        >
          {won ? 'Bildin!' : 'Bilemedin'}
        </h2>

        <p className="mt-3 text-sm text-slate-300">Cevap</p>
        <p className="mt-1 text-lg font-bold text-white">{answer?.title}</p>
        <p className="text-sm text-slate-400">
          {answer?.album} · {answer?.year}
        </p>

        <div className="mt-6 flex flex-col gap-2">
          {mode === 'daily' && <ShareButton turns={turns} won={won} />}
          {mode === 'endless' && (
            <button
              type="button"
              className="btn-primary w-full"
              onClick={onNextRound}
            >
              Sonraki Şarkı
            </button>
          )}
          <button type="button" className="btn-ghost w-full" onClick={onClose}>
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
