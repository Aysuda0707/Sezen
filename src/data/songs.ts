import type { Song } from '../types';

/**
 * Sezen Aksu song catalog.
 *
 * Audio is NOT bundled. At runtime the app looks up each song on the public
 * iTunes Search API (see src/lib/itunes.ts) and plays Apple's 30-second
 * preview from a chosen offset. `previewStart` is the offset (seconds) inside
 * that preview where the 6-second clip begins.
 *
 * `album` / `year` are used for the green/yellow/red feedback rules.
 *
 * NOTE: Intended for a private / educational project. See README.
 */
export const SONGS: Song[] = [
  { id: 'tukenecegiz', title: 'Tükeneceğiz', album: 'Sen Ağlama', year: 1984, clipStart: 8 },
  { id: 'sen-aglama', title: 'Sen Ağlama', album: 'Sen Ağlama', year: 1984, clipStart: 10 },
  { id: 'gercek-seven', title: 'Gerçek Seven', album: 'Sen Ağlama', year: 1984, clipStart: 12 },
  { id: 'firuze', title: 'Firuze', album: 'Firuze', year: 1982, clipStart: 9 },
  { id: 'haydi-gel', title: 'Haydi Gel', album: 'Firuze', year: 1982, clipStart: 11 },
  { id: 'kutlama', title: 'Kutlama', album: 'Deliveren', year: 1998, clipStart: 10 },
  { id: 'hadi-bakalim', title: 'Hadi Bakalım', album: 'Gülün Adı', year: 1996, clipStart: 8 },
  { id: 'sultan-suleyman', title: 'Sultan Süleyman', album: 'Deliveren', year: 1998, clipStart: 12 },
  { id: 'erkekler', title: 'Erkekler', album: 'Deliveren', year: 1998, clipStart: 9 },
  { id: 'gidiyorum', title: 'Gidiyorum', album: 'Gidiyorum', year: 1991, clipStart: 10 },
  { id: 'deli-kiz', title: 'Deli Kız', album: 'Gidiyorum', year: 1991, clipStart: 11 },
  { id: 'unutmam', title: 'Unutmam', album: 'Gidiyorum', year: 1991, clipStart: 8 },
  { id: 'yalnizlik', title: 'Yalnızlık', album: 'Düş Bahçeleri', year: 1996, clipStart: 12 },
  { id: 'dus-bahceleri', title: 'Düş Bahçeleri', album: 'Düş Bahçeleri', year: 1996, clipStart: 9 },
  { id: 'kirmizi-bisiklet', title: 'Kırmızı Bisiklet', album: 'Düş Bahçeleri', year: 1996, clipStart: 10 },
  { id: 'bosver', title: 'Boşver', album: 'Tükeneceğiz', year: 1989, clipStart: 11 },
  { id: 'sevgilim', title: 'Sevgilim', album: 'Tükeneceğiz', year: 1989, clipStart: 8 },
  { id: 'son-bakis', title: 'Son Bakış', album: 'Sezen Aksu Söylüyor', year: 1989, clipStart: 10 },
  { id: 'ey-ask', title: 'Ey Aşk', album: 'Paşa Gönül Şarkıları', year: 2025, clipStart: 9 },
  { id: 'gitme', title: 'Gitme', album: 'Sen Ağlama', year: 1984, clipStart: 12 },
];

/** Fast lookup by id. */
export const SONG_BY_ID: Record<string, Song> = Object.fromEntries(
  SONGS.map((s) => [s.id, s]),
);
