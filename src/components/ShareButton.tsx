import { useState } from 'react';
import { buildShareGrid } from '../lib/game';
import type { Guess } from '../types';

interface ShareButtonProps {
  guesses: Guess[];
  won: boolean;
  skips?: number;
}

export function ShareButton({ guesses, won, skips = 0 }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const text = buildShareGrid(guesses, won, skips);
    try {
      if (navigator.share) {
        await navigator.share({ text });
      } else {
        await navigator.clipboard.writeText(text);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // User cancelled or clipboard blocked; ignore.
    }
  };

  return (
    <button type="button" className="btn-primary w-full" onClick={share}>
      {copied ? 'Kopyalandı!' : 'Sonucu Paylaş'}
    </button>
  );
}
