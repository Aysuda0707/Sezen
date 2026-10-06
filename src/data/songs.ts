import type { Song } from '../types';

/**
 * Sezen Aksu song catalog.
 *
 * `id` is a URL-safe slug and doubles as the clip filename stem:
 *   public/clips/<id>.mp3
 *
 * `clipStart` is the offset (seconds) in the original recording where the
 * 6-second clip should begin. Adjust these after listening to each source file.
 *
 * NOTE: This catalog is intended for a private / educational project.
 * See README for copyright guidance.
 */
export const SONGS: Song[] = [
  { id: 'kutlama', title: 'Kutlama', album: 'Deliveren', year: 1998, clipStart: 45 },
  { id: 'hadi-bakalim', title: 'Hadi Bakalım', album: 'Gülün Adı', year: 1996, clipStart: 30 },
  { id: 'sultan-suleyman', title: 'Sultan Süleyman', album: 'Deliveren', year: 1998, clipStart: 52 },
  { id: 'erkekler', title: 'Erkekler', album: 'Deliveren', year: 1998, clipStart: 40 },
  { id: 'sen-aglama', title: 'Sen Ağlama', album: 'Sen Ağlama', year: 1984, clipStart: 35 },
  { id: 'gercek-seven', title: 'Gerçek Seven', album: 'Sen Ağlama', year: 1984, clipStart: 48 },
  { id: 'tukenecegiz', title: 'Tükeneceğiz', album: 'Tükeneceğiz', year: 1989, clipStart: 42 },
  { id: 'sevgilim', title: 'Sevgilim', album: 'Tükeneceğiz', year: 1989, clipStart: 38 },
  { id: 'gidiyorum', title: 'Gidiyorum', album: 'Gidiyorum', year: 1991, clipStart: 44 },
  { id: 'deli-kiz', title: 'Deli Kız', album: 'Gidiyorum', year: 1991, clipStart: 36 },
  { id: 'yalnizlik', title: 'Yalnızlık', album: 'Düş Bahçeleri', year: 1996, clipStart: 50 },
  { id: 'dus-bahceleri', title: 'Düş Bahçeleri', album: 'Düş Bahçeleri', year: 1996, clipStart: 33 },
  { id: 'kirmizi-bisiklet', title: 'Kırmızı Bisiklet', album: 'Düş Bahçeleri', year: 1996, clipStart: 41 },
  { id: 'sarkici', title: 'Şarkıcı', album: 'Deliveren', year: 1998, clipStart: 47 },
  { id: 'kac-yasindasin', title: 'Kaç Yaşındasın', album: 'Deliveren', year: 1998, clipStart: 39 },
  { id: 'beni-unutma', title: 'Beni Unutma', album: 'Sen Ağlama', year: 1984, clipStart: 46 },
  { id: 'firuze', title: 'Firuze', album: 'Firuze', year: 1982, clipStart: 34 },
  { id: 'haydi-gel', title: 'Haydi Gel', album: 'Firuze', year: 1982, clipStart: 43 },
  { id: 'unutmam', title: 'Unutmam', album: 'Gidiyorum', year: 1991, clipStart: 37 },
  { id: 'bosver', title: 'Boşver', album: 'Tükeneceğiz', year: 1989, clipStart: 49 },
  { id: 'kavak-yelleri', title: 'Kavak Yelleri', album: 'Düş Bahçeleri', year: 1996, clipStart: 32 },
  { id: 'son-bahar', title: 'Son Bahar', album: 'Gülün Adı', year: 1996, clipStart: 45 },
  { id: 'ay-isiginda', title: 'Ay Işığında', album: 'Firuze', year: 1982, clipStart: 40 },
  { id: 'gitme', title: 'Gitme', album: 'Sen Ağlama', year: 1984, clipStart: 51 },
];

/** Fast lookup by id. */
export const SONG_BY_ID: Record<string, Song> = Object.fromEntries(
  SONGS.map((s) => [s.id, s]),
);
