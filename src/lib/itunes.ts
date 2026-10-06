import { SONG_BY_ID } from '../data/songs';
import { normalize } from './text';

/**
 * Looks up Apple's public 30-second preview for a song via the iTunes Search
 * API. Previews are streamed from Apple's CDN at runtime; no audio is bundled
 * with this app.
 *
 * NOTE: Intended for a private / educational project. See README.
 */

const CACHE_KEY = 'sezen.itunes.v1';
const API = 'https://itunes.apple.com/search';

interface ITunesTrack {
  trackName: string;
  artistName: string;
  previewUrl?: string;
  collectionName?: string;
  releaseDate?: string;
}

interface CacheEntry {
  previewUrl: string | null;
  fetchedAt: number;
}

type Cache = Record<string, CacheEntry>;

const CACHE_TTL = 1000 * 60 * 60 * 24 * 7; // 7 days

function readCache(): Cache {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) ?? '{}') as Cache;
  } catch {
    return {};
  }
}

function writeCache(cache: Cache): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // storage full / unavailable; ignore
  }
}

/** Pick the best matching track from the API results. */
function pickBest(results: ITunesTrack[], title: string): ITunesTrack | null {
  const target = normalize(title);
  const withPreview = results.filter((r) => r.previewUrl);
  if (withPreview.length === 0) return null;

  const exact = withPreview.find((r) => normalize(r.trackName) === target);
  if (exact) return exact;

  const startsWith = withPreview.find((r) =>
    normalize(r.trackName).startsWith(target),
  );
  return startsWith ?? withPreview[0];
}

/** Resolve the preview URL for a song id (cached). */
export async function getPreviewUrl(songId: string): Promise<string | null> {
  const song = SONG_BY_ID[songId];
  if (!song) return null;

  const cache = readCache();
  const cached = cache[songId];
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
    return cached.previewUrl;
  }

  const params = new URLSearchParams({
    term: `${song.title} Sezen Aksu`,
    entity: 'song',
    limit: '10',
    country: 'TR',
  });

  try {
    const res = await fetch(`${API}?${params.toString()}`);
    if (!res.ok) throw new Error(`iTunes API ${res.status}`);
    const data = (await res.json()) as { results: ITunesTrack[] };
    const best = pickBest(data.results ?? [], song.title);
    const previewUrl = best?.previewUrl ?? null;

    cache[songId] = { previewUrl, fetchedAt: Date.now() };
    writeCache(cache);
    return previewUrl;
  } catch {
    // Network/CORS failure: cache a miss briefly so we don't hammer the API.
    cache[songId] = { previewUrl: null, fetchedAt: Date.now() };
    writeCache(cache);
    return null;
  }
}
