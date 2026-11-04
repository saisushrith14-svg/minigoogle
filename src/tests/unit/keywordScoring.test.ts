import { describe, expect, it } from 'vitest';
import {
  DEFAULT_KEYWORD_WEIGHTS,
  normalizeKeywordWeights,
  scoreKeywordCorpus,
  scoreKeywordPage,
} from '../../algorithms/keywordScoring';
import { keywordStuffingDataset } from '../../data/datasets';
import type { KeywordFactors, WebPage } from '../../types';

function page(overrides: Partial<WebPage>): WebPage {
  return {
    id: 'p1',
    url: 'https://example.com/p1',
    title: 'Example Page',
    headings: ['Example Heading'],
    metaDescription: 'An example page.',
    content: 'An example page with enough content to be meaningful.',
    category: 'Test',
    links: [],
    ...overrides,
  };
}

describe('normalizeKeywordWeights', () => {
  it('merges defaults and clamps negatives', () => {
    const weights = normalizeKeywordWeights({ titleMatch: 3, metaMatch: -2 });
    expect(weights.titleMatch).toBe(3);
    expect(weights.metaMatch).toBe(0);
    expect(weights.termFrequency).toBe(DEFAULT_KEYWORD_WEIGHTS.termFrequency);
  });

  it('falls back to defaults when every weight is zero', () => {
    const zero = {
      termFrequency: 0,
      keywordDensity: 0,
      titleMatch: 0,
      headingMatch: 0,
      metaMatch: 0,
      exactPhraseMatch: 0,
      proximity: 0,
    };
    expect(normalizeKeywordWeights(zero)).toEqual(DEFAULT_KEYWORD_WEIGHTS);
  });
});

describe('scoreKeywordPage', () => {
  it('returns zero relevance for an empty query', () => {
    const result = scoreKeywordPage(page({}), '');
    expect(result.score).toBe(0);
    expect(result.factors.exactPhraseMatch).toBe(0);
  });

  it('keeps every factor inside [0, 1]', () => {
    const result = scoreKeywordPage(
      keywordStuffingDataset.pages[0],
      keywordStuffingDataset.defaultQuery ?? '',
    );
    Object.values(result.factors).forEach((value) => {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(1);
    });
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(1);
  });

  it('scores a keyword-stuffed page above an authentic article for the spam query', () => {
    const scores = scoreKeywordCorpus(
      keywordStuffingDataset.pages,
      'cheap flights',
    );
    const spam = scores.find((item) => item.pageId === 'ks-spam');
    const authentic = scores.find((item) => item.pageId === 'ks-authentic');
    expect(spam).toBeDefined();
    expect(authentic).toBeDefined();
    expect(spam?.score ?? 0).toBeGreaterThan(authentic?.score ?? 0);
    expect(spam?.factors.titleMatch).toBe(1);
    expect(spam?.factors.keywordDensity).toBeGreaterThan(
      authentic?.factors.keywordDensity ?? 0,
    );
  });

  it('rewards title and heading matches', () => {
    const content = 'A long article about sourdough and bread baking for beginners.';
    const without = page({ id: 'without', content, title: 'Baking Notes', headings: ['Notes'] });
    const withMatch = page({
      id: 'with',
      content,
      title: 'Sourdough Guide',
      headings: ['Sourdough Basics'],
    });
    const plain = scoreKeywordPage(without, 'sourdough');
    const matched = scoreKeywordPage(withMatch, 'sourdough');
    expect(matched.factors.titleMatch).toBeGreaterThan(plain.factors.titleMatch);
    expect(matched.factors.headingMatch).toBeGreaterThan(plain.factors.headingMatch);
    expect(matched.score).toBeGreaterThan(plain.score);
  });

  it('rewards exact phrases and term proximity', () => {
    const adjacent = page({
      id: 'adjacent',
      content: 'Our cheap flights guide explains how to book cheap flights early.',
    });
    const separated = page({
      id: 'separated',
      content: 'Our cheap guide contains many pages and later discusses flights in detail.',
    });
    const adjacentScore = scoreKeywordPage(adjacent, 'cheap flights');
    const separatedScore = scoreKeywordPage(separated, 'cheap flights');
    expect(adjacentScore.factors.exactPhraseMatch).toBe(1);
    expect(separatedScore.factors.exactPhraseMatch).toBe(0);
    expect(adjacentScore.factors.proximity).toBeGreaterThan(
      separatedScore.factors.proximity,
    );
  });

  it('applies a length-normalization penalty to extremely long documents', () => {
    const normal = page({ content: 'research '.repeat(120) });
    const huge = page({ content: 'research '.repeat(5000) });
    const normalResult = scoreKeywordPage(normal, 'research', { averageTokenCount: 140 });
    const hugeResult = scoreKeywordPage(huge, 'research', { averageTokenCount: 140 });
    expect(hugeResult.factors.lengthNormalization).toBeLessThan(
      normalResult.factors.lengthNormalization,
    );
  });

  it('respects configurable weights', () => {
    const target = page({
      title: 'Cheap Flights Guide',
      content: 'Travel advice for planning a summer holiday.',
    });
    const titleOnly = scoreKeywordPage(target, 'cheap flights', {
      weights: {
        termFrequency: 0,
        keywordDensity: 0,
        titleMatch: 1,
        headingMatch: 0,
        metaMatch: 0,
        exactPhraseMatch: 0,
        proximity: 0,
      },
    });
    const densityOnly = scoreKeywordPage(target, 'cheap flights', {
      weights: {
        termFrequency: 0,
        keywordDensity: 1,
        titleMatch: 0,
        headingMatch: 0,
        metaMatch: 0,
        exactPhraseMatch: 0,
        proximity: 0,
      },
    });
    expect(titleOnly.score).toBeGreaterThan(0);
    expect(densityOnly.score).toBe(0);
  });

  it('is deterministic', () => {
    const first = scoreKeywordPage(keywordStuffingDataset.pages[0], 'cheap flights');
    const second = scoreKeywordPage(keywordStuffingDataset.pages[0], 'cheap flights');
    expect(first).toEqual(second);
  });

  it('exposes all eight documented factors', () => {
    const factors = scoreKeywordPage(keywordStuffingDataset.pages[0], 'cheap flights')
      .factors;
    const keys: (keyof KeywordFactors)[] = [
      'termFrequency',
      'keywordDensity',
      'titleMatch',
      'headingMatch',
      'metaMatch',
      'exactPhraseMatch',
      'proximity',
      'lengthNormalization',
    ];
    keys.forEach((key) => expect(typeof factors[key]).toBe('number'));
  });
});
