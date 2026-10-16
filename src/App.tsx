import { useEffect, useState } from 'react';
import { GuessInput } from './components/GuessInput';
import { GuessList } from './components/GuessList';
import { ResultModal } from './components/ResultModal';
import { StatsPanel } from './components/StatsPanel';
import { SONG_BY_ID } from './data/songs';
import { useClipPlayer } from './hooks/useClipPlayer';
import { useGame } from './hooks/useGame';
import { MAX_ATTEMPTS, revealSeconds } from './lib/game';
import type { GameMode, Song } from './types';

export default function App() {
  const [mode, setMode] = useState<GameMode>('daily');
  const [resultOpen, setResultOpen] = useState(false);
  const game = useGame(mode);
  const player = useClipPlayer();

  const attemptIndex = game.turnsUsed;
  const seconds = revealSeconds(game.revealLevel);
  const finished = game.status !== 'playing';

  // Stop audio when the round ends or the mode changes.
  useEffect(() => {
    player.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, game.status]);

  // Open the result modal automatically when the round finishes.
  useEffect(() => {
    if (finished) setResultOpen(true);
  }, [finished]);

  // Warm up the answer's audio as soon as the round starts so the very first
  // play is instant (fixes the slow first-play / sub-second playback bug).
  useEffect(() => {
    if (!finished) player.preload(game.answerId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.answerId, mode]);

  const handlePlay = () => {
    if (finished) return;
    player.play(game.answerId, seconds);
  };

  const handleSkip = () => {
    if (!game.canSkip) return;
    player.stop();
    game.skip();
    // Play the newly revealed (longer) clip immediately after skipping.
    const nextLevel = Math.min(game.turnsUsed + 1, MAX_ATTEMPTS - 1);
    player.play(game.answerId, revealSeconds(nextLevel));
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
          Sezen<span className="text-accent">el</span>
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Klibi dinle, şarkıyı tahmin et. 6 hakkın var.{' '}
          <span className="text-accent">Atla</span> daha uzun klibi açar ama
          bir hakkını harcar.
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
            Süre: <strong className="text-white">{seconds}s</strong>
          </span>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            className="btn-primary w-full text-lg"
            onClick={handlePlay}
            disabled={finished || player.isPlaying || player.isLoading}
          >
            {player.isLoading
              ? 'Yükleniyor...'
              : player.isPlaying
                ? 'Çalıyor...'
                : `▶ ${seconds} saniye dinle`}
          </button>

          <button
            type="button"
            className="btn-ghost w-full whitespace-nowrap sm:w-auto"
            onClick={handleSkip}
            disabled={!game.canSkip || player.isPlaying || player.isLoading}
            title="Daha uzun klibi aç (1 hak harcar)"
          >
            ⏭ Atla
          </button>
        </div>

        {player.unavailable && (
          <p className="mt-3 rounded-lg bg-wrong/15 px-3 py-2 text-center text-xs text-wrong">
            Bu şarkı için önizleme bulunamadı. İnternet bağlantını kontrol et.
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

      {finished && !resultOpen && (
        <button
          type="button"
          className="btn-ghost w-full"
          onClick={() => setResultOpen(true)}
        >
          Sonucu göster
        </button>
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

      <ResultModal
        open={finished && resultOpen}
        won={game.status === 'won'}
        answer={answer}
        mode={mode}
        turns={game.turns}
        onClose={() => setResultOpen(false)}
        onNextRound={() => {
          setResultOpen(false);
          game.nextRound();
        }}
      />
    </div>
  );
}
