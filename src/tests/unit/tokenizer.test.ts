import { describe, expect, it } from 'vitest';
import {
  containsPhrase,
  countTerm,
  extractPhraseTerms,
  extractQueryTerms,
  minimumTermWindow,
  normalizeText,
  stemToken,
  tokenize,
} from '../../algorithms/tokenizer';

describe('normalizeText', () => {
  it('case-folds, removes punctuation, and strips diacritics', () => {
    expect(normalizeText('  Café, CRÈME—brûlée!  ')).toBe('cafe creme brulee');
  });

  it('keeps numbers and collapses separators', () => {
    expect(normalizeText('PageRank 2.0 / 1998')).toBe('pagerank 2 0 1998');
  });
});

describe('stemToken', () => {
  it('normalizes regular plurals', () => {
    expect(stemToken('flights')).toBe('flight');
    expect(stemToken('studies')).toBe('study');
    expect(stemToken('classes')).toBe('class');
  });

  it('does not strip double-s or short words', () => {
    expect(stemToken('glass')).toBe('glass');
    expect(stemToken('bus')).toBe('bus');
    expect(stemToken('is')).toBe('is');
  });
});

describe('tokenize', () => {
  it('produces normalized stemmed tokens', () => {
    expect(tokenize('Cheap Flights & Flight Deals!')).toEqual([
      'cheap',
      'flight',
      'flight',
      'deal',
    ]);
  });

  it('removes stop words on request', () => {
    expect(tokenize('the best of the web', { removeStopWords: true })).toEqual([
      'best',
      'web',
    ]);
  });
});

describe('extractQueryTerms', () => {
  it('returns unique meaningful terms', () => {
    expect(extractQueryTerms('the cheap flights and cheap tickets')).toEqual([
      'cheap',
      'flight',
      'ticket',
    ]);
  });

  it('falls back to raw tokens when the query is all stop words', () => {
    expect(extractQueryTerms('the and of')).toEqual(['the', 'and', 'of']);
  });

  it('returns an empty array for an empty query', () => {
    expect(extractQueryTerms('')).toEqual([]);
  });
});

describe('phrase and proximity helpers', () => {
  it('finds contiguous exact phrases', () => {
    const tokens = tokenize('A guide to cheap flights in Europe');
    expect(containsPhrase(tokens, extractPhraseTerms('cheap flights'))).toBe(true);
    expect(containsPhrase(tokens, extractPhraseTerms('flights cheap'))).toBe(false);
  });

  it('counts stemmed term occurrences', () => {
    const tokens = tokenize('flight flights flying');
    expect(countTerm(tokens, 'flight')).toBe(2);
  });

  it('finds the minimum window containing all query terms', () => {
    const tokens = tokenize('cancer laboratory research and cancer research outcomes');
    const window = minimumTermWindow(tokens, ['cancer', 'research']);
    expect(window).not.toBeNull();
    expect(window?.span).toBe(2);
  });

  it('returns null when a term is missing', () => {
    const tokens = tokenize('cancer laboratory research');
    expect(minimumTermWindow(tokens, ['cancer', 'flights'])).toBeNull();
  });
});
