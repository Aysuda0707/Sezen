import { SONG_BY_ID } from '../data/songs';
import type { Feedback, Guess } from '../types';

const FEEDBACK_STYLES: Record<Feedback, string> = {
  correct: 'bg-correct/20 border-correct text-correct',
  partial: 'bg-partial/20 border-partial text-partial',
  wrong: 'bg-wrong/20 border-wrong text-wrong',
};

const FEEDBACK_LABEL: Record<Feedback, string> = {
  correct: 'Doğru şarkı',
  partial: 'Aynı albüm',
  wrong: 'Yanlış',
};

export function GuessList({ guesses }: { guesses: Guess[] }) {
  if (guesses.length === 0) {
    return (
      <p className="text-center text-sm text-slate-400">
        Henüz tahmin yok. Klibi dinle ve bir şarkı yaz.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {guesses.map((g, i) => {
        const song = SONG_BY_ID[g.songId];
        return (
          <li
            key={`${g.songId}-${i}`}
            className={`flex animate-pop-in items-center justify-between rounded-xl
              border px-4 py-2.5 ${FEEDBACK_STYLES[g.feedback]}`}
          >
            <div className="flex flex-col">
              <span className="font-semibold">{song?.title ?? g.raw}</span>
              <span className="text-xs opacity-80">
                {song ? `${song.album} · ${song.year}` : ''}
              </span>
            </div>
            <span className="text-xs font-medium uppercase tracking-wide">
              {FEEDBACK_LABEL[g.feedback]}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
