import { useMemo, useRef, useState } from 'react';
import { SONGS } from '../data/songs';
import { matchScore } from '../lib/text';
import type { Song } from '../types';

interface GuessInputProps {
  disabled: boolean;
  usedIds: string[];
  onSubmit: (song: Song) => void;
}

export function GuessInput({ disabled, usedIds, onSubmit }: GuessInputProps) {
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState(0);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = useMemo(() => {
    const q = query.trim();
    const pool = SONGS.filter((s) => !usedIds.includes(s.id));
    if (!q) return pool.slice(0, 8);
    return pool
      .map((s) => ({ song: s, score: matchScore(q, s.title) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((x) => x.song);
  }, [query, usedIds]);

  const choose = (song: Song) => {
    onSubmit(song);
    setQuery('');
    setOpen(false);
    setHighlight(0);
    inputRef.current?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setHighlight((h) => Math.min(h + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const pick = suggestions[highlight];
      if (pick) choose(pick);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        value={query}
        disabled={disabled}
        placeholder="Şarkı adını yaz..."
        aria-label="Şarkı tahmini"
        autoComplete="off"
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setHighlight(0);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 120)}
        onKeyDown={onKeyDown}
        className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3
          text-lg text-white placeholder-slate-400 outline-none
          focus:border-accent focus:ring-2 focus:ring-accent/40
          disabled:opacity-50"
      />

      {open && !disabled && suggestions.length > 0 && (
        <ul
          role="listbox"
          className="absolute z-20 mt-2 max-h-72 w-full overflow-auto rounded-xl
            border border-white/10 bg-slate-900/95 shadow-2xl backdrop-blur"
        >
          {suggestions.map((song, i) => (
            <li key={song.id} role="option" aria-selected={i === highlight}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(song)}
                onMouseEnter={() => setHighlight(i)}
                className={`flex w-full items-center justify-between px-4 py-2.5 text-left
                  ${i === highlight ? 'bg-accent/30' : 'hover:bg-white/10'}`}
              >
                <span className="font-medium text-white">{song.title}</span>
                <span className="text-xs text-slate-400">
                  {song.album} · {song.year}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
