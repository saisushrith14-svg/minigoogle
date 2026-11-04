/**
 * Extracts a readable snippet around the first query match. The snippet is
 * derived from the real document content; no synthetic summaries are used.
 */
export function buildSnippet(content: string, query: string, maxLength = 240): string {
  const trimmed = content.trim();
  if (trimmed.length <= maxLength) return trimmed;

  const rawTerms = query
    .trim()
    .split(/\s+/)
    .map((term) => term.replace(/[^a-z0-9]/gi, ''))
    .filter((term) => term.length > 1);

  const lower = trimmed.toLowerCase();
  let matchIndex = -1;
  for (const term of rawTerms) {
    const index = lower.indexOf(term.toLowerCase());
    if (index !== -1 && (matchIndex === -1 || index < matchIndex)) {
      matchIndex = index;
    }
  }

  if (matchIndex === -1) {
    const end = trimmed.lastIndexOf(' ', maxLength);
    return `${trimmed.slice(0, end === -1 ? maxLength : end).trim()}…`;
  }

  const half = Math.floor(maxLength / 2);
  let start = Math.max(0, matchIndex - half);
  let end = Math.min(trimmed.length, start + maxLength);
  if (end === trimmed.length) start = Math.max(0, end - maxLength);

  // Snap to word boundaries when possible.
  if (start > 0) {
    const nextSpace = trimmed.indexOf(' ', start);
    if (nextSpace !== -1 && nextSpace < matchIndex) start = nextSpace + 1;
  }
  if (end < trimmed.length) {
    const previousSpace = trimmed.lastIndexOf(' ', end);
    if (previousSpace > matchIndex) end = previousSpace;
  }

  return `${start > 0 ? '…' : ''}${trimmed.slice(start, end).trim()}${
    end < trimmed.length ? '…' : ''
  }`;
}

/** Splits text into highlighted and plain segments for a query. */
export interface HighlightSegment {
  readonly text: string;
  readonly highlighted: boolean;
}

export function highlightSegments(text: string, query: string): HighlightSegment[] {
  const terms = query
    .trim()
    .split(/\s+/)
    .map((term) => term.replace(/[^a-z0-9]/gi, ''))
    .filter((term) => term.length > 1)
    .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

  if (terms.length === 0) return [{ text, highlighted: false }];

  const pattern = new RegExp(`(${terms.join('|')})`, 'gi');
  const parts = text.split(pattern);
  return parts
    .filter((part) => part.length > 0)
    .map((part) => ({
      text: part,
      highlighted: terms.some((term) => new RegExp(`^${term}$`, 'i').test(part)),
    }));
}
