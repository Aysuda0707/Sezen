/**
 * Turkish-aware text normalisation and fuzzy matching.
 *
 * Turkish has dotted/dotless i (i/İ, ı/I) which break naive lowercasing,
 * so we fold those explicitly before comparing.
 */

const TURKISH_MAP: Record<string, string> = {
  İ: 'i',
  I: 'i',
  ı: 'i',
  i: 'i',
  Ş: 's',
  ş: 's',
  Ğ: 'g',
  ğ: 'g',
  Ç: 'c',
  ç: 'c',
  Ö: 'o',
  ö: 'o',
  Ü: 'u',
  ü: 'u',
  Â: 'a',
  â: 'a',
  Î: 'i',
  î: 'i',
  Û: 'u',
  û: 'u',
};

/**
 * Keyboard-friendly aliases: Turkish letters that are missing from most
 * non-Turkish keyboards can be typed with their ASCII equivalents.
 * Applied AFTER folding, so e.g. "sh" -> "s" and "sezen" matches "şezen".
 */
const ALIAS_MAP: Array<[RegExp, string]> = [
  [/sh/g, 's'], // ş typed as "sh"
  [/ch/g, 'c'], // ç typed as "ch"
  [/gh/g, 'g'], // ğ typed as "gh"
  [/oe/g, 'o'], // ö typed as "oe"
  [/ue/g, 'u'], // ü typed as "ue"
  [/ss/g, 's'], // German-style ş
];

/** Normalise a string for comparison: fold Turkish chars, strip punctuation. */
export function normalize(input: string): string {
  const folded = Array.from(input)
    .map((ch) => TURKISH_MAP[ch] ?? ch)
    .join('')
    .toLowerCase();

  let cleaned = folded
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip remaining diacritics
    .replace(/[^a-z0-9\s]/g, ' ') // punctuation -> space
    .replace(/\s+/g, ' ')
    .trim();

  // Apply keyboard-friendly aliases so "sh" matches "ş", "ch" matches "ç", etc.
  for (const [pattern, replacement] of ALIAS_MAP) {
    cleaned = cleaned.replace(pattern, replacement);
  }

  return cleaned.replace(/\s+/g, ' ').trim();
}

/** Levenshtein edit distance between two strings. */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  const curr = new Array<number>(b.length + 1);

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    prev = curr.slice();
  }
  return prev[b.length];
}

/**
 * Loose equality: true when normalised strings match exactly, or when the
 * edit distance is within a tolerance proportional to length (typo-friendly).
 */
export function looseEquals(a: string, b: string): boolean {
  const na = normalize(a);
  const nb = normalize(b);
  if (!na || !nb) return false;
  if (na === nb) return true;

  const maxLen = Math.max(na.length, nb.length);
  const tolerance = maxLen <= 4 ? 0 : maxLen <= 8 ? 1 : 2;
  return levenshtein(na, nb) <= tolerance;
}

/** Score how well `query` matches `target` (higher is better, 0 = no match). */
export function matchScore(query: string, target: string): number {
  const nq = normalize(query);
  const nt = normalize(target);
  if (!nq) return 0;
  if (nt === nq) return 1000;
  if (nt.startsWith(nq)) return 800 - nt.length;
  if (nt.includes(nq)) return 600 - nt.indexOf(nq);

  // token-prefix match (e.g. "kut" matches "Kutlama")
  const tokens = nt.split(' ');
  if (tokens.some((t) => t.startsWith(nq))) return 500;

  const dist = levenshtein(nq, nt);
  const maxLen = Math.max(nq.length, nt.length);
  const similarity = 1 - dist / maxLen;
  return similarity >= 0.6 ? Math.round(similarity * 400) : 0;
}
