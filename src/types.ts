export type GameMode = 'daily' | 'endless';

/** A single song in the catalog. */
export interface Song {
  /** Stable unique id, also used as the clip filename stem. */
  id: string;
  /** Display title, e.g. "Kutlama". */
  title: string;
  /** Album / release the song belongs to. */
  album: string;
  /** Release year of the album. */
  year: number;
  /**
   * Offset (in seconds) inside the source audio where the 6-second clip starts.
   * The clip file itself is pre-cut; this is kept for reference / re-cutting.
   */
  clipStart: number;
}

/** Feedback colour for a single guess. */
export type Feedback = 'correct' | 'partial' | 'wrong';

/** A single guess made by the player. */
export interface Guess {
  /** The song the player selected from the catalog. */
  songId: string;
  /** The raw text the player typed. */
  raw: string;
  /** Result of evaluating this guess against the answer. */
  feedback: Feedback;
}

/** Persisted statistics for the daily mode. */
export interface Stats {
  played: number;
  wins: number;
  currentStreak: number;
  maxStreak: number;
  /** guessDistribution[0] = wins on attempt 1, ... [5] = wins on attempt 6. */
  guessDistribution: number[];
  /** ISO date (YYYY-MM-DD) of the last completed daily game. */
  lastPlayedDate: string | null;
}

/** Full state of a single round. */
export interface GameState {
  mode: GameMode;
  answerId: string;
  guesses: Guess[];
  status: 'playing' | 'won' | 'lost';
}
