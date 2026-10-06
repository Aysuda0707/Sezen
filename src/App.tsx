import { useEffect, useState } from 'react';
import { GuessInput } from './components/GuessInput';
import { GuessList } from './components/GuessList';
import { ShareButton } from './components/ShareButton';
import { StatsPanel } from './components/StatsPanel';
import { SONG_BY_ID } from './data/songs';
import { useClipPlayer } from './hooks/useClipPlayer';
import { useGame } from './hooks/useGame';
import { MAX_ATTEMPTS, revealSeconds } from './lib/game';
import type { GameMode, Song } from './types';

export default function App() {
  const [mode, setMode] = useState<GameMode>('daily');
  const game = useGame(mode);
  const player = useClipPlayer();

  const attemptIndex = game.guesses.length;
  const seconds = revealSeconds(attemptIndex);
  const finished = game.status !== 'playing';

  // Stop audio when the round ends or the mode changes.
  useEffect(() => {
    player.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, game.status]);

  const handlePlay = () => {
    if (finished) return;
    player.play(game.answerId, seconds);
  };

  const handleGuess = (song: Song) => {
    player.stop();
    game.submitGuess(song.id, song.title);
  };

  const answer = SONG_BY_ID[game.answerId];

  return (
    <div className="mx-auto flex min-h-full max-w-2xl flex-col gap-5 px-4 py-6">
      <header className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Sezen Aksu <span className="text-fuchsia-400">Şarkı Tahmin</span>
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Klibi dinle, şarkıyı tahmin et. 6 hakkın var.
        </p>
      </header>

      <div className="flex justify-center gap-2">
        <button
          type="button"
          className={mode === 'daily' ? 'btn-primary' : 'btn-ghost'}
          onClick={() => setMode('daily')}
        >
          Günün Şarkısı
        </button>
        <button
          type="button"
          className={mode === 'endless' ? 'btn-primary' : 'btn-ghost'}
          onClick={() => setMode('endless')}
        >
          Sınırsız
        </button>
      </div>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="mb-3 flex items-center justify-between text-sm text-slate-300">
          <span>
            Deneme{' '}
            <strong className="text-white">
              {Math.min(attemptIndex + 1, MAX_ATTEMPTS)}
            </strong>{' '}
            / {MAX_ATTEMPTS}
          </span>
          <span>
            Klip süresi: <strong className="text-white">{seconds}s</strong>
          </span>
        </div>

        <button
          type="button"
          className="btn-primary w-full text-lg"
          onClick={handlePlay}
          disabled={finished || player.isPlaying}
        >
          {player.isPlaying ? 'Çalıyor...' : `▶ ${seconds} saniye dinle`}
        </button>

        {player.missing && (
          <p className="mt-3 rounded-lg bg-wrong/15 px-3 py-2 text-center text-xs text-wrong">
            Klip dosyası bulunamadı. public/clips/{game.answerId}.mp3 ekleyin.
          </p>
        )}

        <div className="mt-4">
          <GuessInput
            disabled={finished}
            usedIds={game.guesses.map((g) => g.songId)}
            onSubmit={handleGuess}
          />
        </div>
      </section>

      {finished && (
        <section
          className={`animate-pop-in rounded-2xl border p-5 text-center ${
            game.status === 'won'
              ? 'border-correct bg-correct/10'
              : 'border-wrong bg-wrong/10'
          }`}
        >
          <p className="text-lg font-bold text-white">
            {game.status === 'won' ? '🎉 Bildin!' : '😔 Bilemedin'}
          </p>
          <p className="mt-1 text-slate-200">
            Cevap: <strong>{answer?.title}</strong> — {answer?.album} (
            {answer?.year})
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            {mode === 'daily' && (
              <ShareButton
                guesses={game.guesses}
                won={game.status === 'won'}
              />
            )}
            {mode === 'endless' && (
              <button
                type="button"
                className="btn-primary w-full"
                onClick={game.nextRound}
              >
                Sonraki Şarkı
              </button>
            )}
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">
          Tahminler
        </h2>
        <GuessList guesses={game.guesses} />
      </section>

      {mode === 'daily' && <StatsPanel stats={game.stats} />}

      <footer className="mt-auto pt-4 text-center text-xs text-slate-500">
        <p>
          <span className="text-correct">Yeşil</span> doğru şarkı ·{' '}
          <span className="text-partial">Sarı</span> aynı albüm ·{' '}
          <span className="text-wrong">Kırmızı</span> yanlış
        </p>
        <p className="mt-1">Özel / eğitim amaçlı proje.</p>
      </footer>
    </div>
  );
}
