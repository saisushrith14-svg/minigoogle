/**
 * Text normalization, tokenization, and phrase utilities used by every ranking
 * model. The implementation is deliberately transparent (no hidden stemming
 * libraries) so the behaviour can be explained in the Learn section and tested
 * independently from the UI.
 */

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'been', 'but', 'by', 'for', 'from',
  'had', 'has', 'have', 'he', 'her', 'his', 'how', 'i', 'in', 'into', 'is', 'it',
  'its', 'me', 'my', 'of', 'on', 'or', 'our', 'she', 'so', 'than', 'that', 'the',
  'their', 'them', 'then', 'there', 'these', 'they', 'this', 'those', 'to', 'was',
  'we', 'were', 'what', 'when', 'where', 'which', 'who', 'why', 'will', 'with',
  'you', 'your',
]);

/**
 * Case-folds and removes punctuation while preserving intra-word apostrophes.
 * Accented characters are decomposed and their diacritics removed so that
 * "café" and "cafe" match.
 */
export function normalizeText(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/**
 * Lightweight, deterministic English suffix normalization. It intentionally
 * handles only high-confidence inflections so that "flights", "flight", and
 * "flight's" converge without conflating unrelated words.
 */
export function stemToken(token: string): string {
  const word = token.toLowerCase();
  if (word.length <= 3 || /^\d+$/.test(word)) return word;

  if (word.endsWith('ies') && word.length > 4) return `${word.slice(0, -3)}y`;
  if (word.endsWith('sses')) return word.slice(0, -2);
  if (word.endsWith('xes') || word.endsWith('ches') || word.endsWith('shes')) {
    return word.slice(0, -2);
  }
  if (word.endsWith('s') && !word.endsWith('ss') && !word.endsWith('us')) {
    return word.slice(0, -1);
  }
  return word;
}

/**
 * Splits arbitrary text into normalized, stemmed tokens. If
 * `removeStopWords` is true, common function words are discarded.
 */
export function tokenize(
  text: string,
  options: { readonly removeStopWords?: boolean } = {},
): string[] {
  const raw = normalizeText(text).split(' ').filter((token) => token.length > 0);
  const tokens = raw.map(stemToken);
  if (!options.removeStopWords) return tokens;
  return tokens.filter((token) => !STOP_WORDS.has(token));
}

/**
 * Returns the meaningful, unique, stemmed terms of a query. If a query consists
 * solely of stop words, the raw normalized terms are returned rather than an
 * empty query.
 */
export function extractQueryTerms(query: string): string[] {
  const meaningful = Array.from(new Set(tokenize(query, { removeStopWords: true })));
  if (meaningful.length > 0) return meaningful;
  return Array.from(new Set(tokenize(query)));
}

/**
 * Returns the normalized phrase tokens of a query, including stop words, for
 * exact-phrase matching.
 */
export function extractPhraseTerms(query: string): string[] {
  return tokenize(query);
}

export function isStopWord(token: string): boolean {
  return STOP_WORDS.has(token);
}

/** Counts occurrences of a stemmed term in a token sequence. */
export function countTerm(tokens: readonly string[], term: string): number {
  let count = 0;
  for (const token of tokens) {
    if (token === term) count += 1;
  }
  return count;
}

/**
 * Tests whether a contiguous phrase occurs in a token sequence.
 */
export function containsPhrase(
  tokens: readonly string[],
  phraseTerms: readonly string[],
): boolean {
  if (phraseTerms.length === 0 || tokens.length < phraseTerms.length) return false;
  const limit = tokens.length - phraseTerms.length;
  for (let start = 0; start <= limit; start += 1) {
    let matched = true;
    for (let offset = 0; offset < phraseTerms.length; offset += 1) {
      if (tokens[start + offset] !== phraseTerms[offset]) {
        matched = false;
        break;
      }
    }
    if (matched) return true;
  }
  return false;
}

/**
 * Computes the smallest window in `tokens` that contains every query term.
 * Returns `null` when at least one term is absent.
 */
export function minimumTermWindow(
  tokens: readonly string[],
  terms: readonly string[],
): { readonly start: number; readonly end: number; readonly span: number } | null {
  if (terms.length === 0 || tokens.length === 0) return null;

  const required = new Set(terms);
  for (const term of required) {
    if (!tokens.includes(term)) return null;
  }

  const counts = new Map<string, number>();
  let matched = 0;
  let bestStart = 0;
  let bestEnd = tokens.length - 1;
  let left = 0;

  for (let right = 0; right < tokens.length; right += 1) {
    const rightToken = tokens[right];
    if (required.has(rightToken)) {
      const next = (counts.get(rightToken) ?? 0) + 1;
      counts.set(rightToken, next);
      if (next === 1) matched += 1;
    }

    while (matched === required.size && left <= right) {
      if (right - left < bestEnd - bestStart) {
        bestStart = left;
        bestEnd = right;
      }
      const leftToken = tokens[left];
      if (required.has(leftToken)) {
        const next = (counts.get(leftToken) ?? 0) - 1;
        counts.set(leftToken, next);
        if (next === 0) matched -= 1;
      }
      left += 1;
    }
  }

  return { start: bestStart, end: bestEnd, span: bestEnd - bestStart + 1 };
}
