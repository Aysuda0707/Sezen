import { useState } from 'react';
import { GAME_URL, buildShareGrid } from '../lib/game';
import type { Turn } from '../types';

interface ShareButtonProps {
  turns: Turn[];
  won: boolean;
}

export function ShareButton({ turns, won }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const text = buildShareGrid(turns, won);
    try {
      if (navigator.share) {
        await navigator.share({ text, url: GAME_URL });
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
