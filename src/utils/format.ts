import type { RankingMode, DatasetScenario } from '../types';

export const MODE_LABELS: Readonly<Record<RankingMode, string>> = {
  keyword: 'Keyword (1997)',
  pagerank: 'PageRank (1998)',
  hybrid: 'Hybrid',
  experimental: 'Behavioural',
};

export const MODE_SHORT_LABELS: Readonly<Record<RankingMode, string>> = {
  keyword: 'Keyword',
  pagerank: 'PageRank',
  hybrid: 'Hybrid',
  experimental: 'Behaviour',
};

export const MODE_DESCRIPTIONS: Readonly<Record<RankingMode, string>> = {
  keyword: 'Pre-1998 content matching: term frequency, density, titles, headings, metadata, phrase and proximity signals.',
  pagerank: 'Link authority only: iterative PageRank over the directed hyperlink graph.',
  hybrid: 'Configurable blend of content relevance and normalized PageRank.',
  experimental: 'Keyword + PageRank + observed surfer engagement from the deterministic simulation.',
};

export const SCENARIO_LABELS: Readonly<Record<DatasetScenario, string>> = {
  'keyword-stuffing': 'Keyword stuffing',
  'authority-problem': 'Authority problem',
  'link-farm': 'Link farm',
  'new-website': 'New website',
  'relevance-vs-popularity': 'Relevance vs popularity',
  'scientific-network': 'Scientific network',
};

export function formatPercent(value: number, digits = 0): string {
  if (!Number.isFinite(value)) return '—';
  return `${(value * 100).toFixed(digits)}%`;
}

export function formatScore(value: number, digits = 3): string {
  if (!Number.isFinite(value)) return '—';
  return value.toFixed(digits);
}

export function formatNumber(value: number, digits = 1): string {
  if (!Number.isFinite(value)) return '—';
  return value.toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0s';
  if (seconds < 60) return `${seconds.toFixed(seconds < 10 ? 1 : 0)}s`;
  const minutes = Math.floor(seconds / 60);
  const remaining = Math.round(seconds % 60);
  return `${minutes}m ${remaining}s`;
}

export function formatClock(ms: number): string {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural ?? `${singular}s`);
}

export interface RatingLevel {
  readonly label: string;
  readonly badgeColor: string;
  readonly textColor: string;
  readonly explanation: string;
}

export function getPageRankQuality(score: number, maxScore: number): RatingLevel {
  const ratio = maxScore > 0 ? score / maxScore : 0;
  if (ratio >= 0.65) {
    return {
      label: 'High Importance',
      badgeColor: '#E6F4EA',
      textColor: '#137333',
      explanation: 'Receives direct links from multiple key websites in this network.',
    };
  }
  if (ratio >= 0.30) {
    return {
      label: 'Moderate Importance',
      badgeColor: '#FEF7E0',
      textColor: '#B06000',
      explanation: 'Linked by a few pages in this network.',
    };
  }
  return {
    label: 'Low Importance',
    badgeColor: '#FCE8E6',
    textColor: '#C5221F',
    explanation: 'Has few or no incoming links from other websites.',
  };
}

export function getKeywordQuality(score: number): RatingLevel {
  if (score >= 0.65) {
    return {
      label: 'Strong Match',
      badgeColor: '#E6F4EA',
      textColor: '#137333',
      explanation: 'Contains search words in the title, headings, and main content.',
    };
  }
  if (score >= 0.30) {
    return {
      label: 'Moderate Match',
      badgeColor: '#FEF7E0',
      textColor: '#B06000',
      explanation: 'Mentions search words in some sections of the page.',
    };
  }
  return {
    label: 'Weak Match',
    badgeColor: '#FCE8E6',
    textColor: '#C5221F',
    explanation: 'Contains few or no matching words.',
  };
}

export const CONCEPT_EXPLANATIONS: Readonly<Record<string, string>> = {
  pagerank: 'An algorithm that estimates the importance of webpages based on how they link to each other.',
  dataset: 'A small collection of example webpages used in this experiment (not the live internet).',
  keyword: 'A method that scores webpages based on how well their words match your search terms.',
  hybrid: 'A balanced search that combines text matching with link importance.',
  damping: 'A number (usually 0.85) modeling how likely a web surfer is to follow a link rather than jump to another page.',
  ctr: 'Click-Through Rate: The percentage of search result impressions that visitors clicked on.',
  bounce: 'Bounce Rate: The percentage of visitors who left after reading only a single page.',
  inlinks: 'Inbound links: Other webpages that link directly to this webpage.',
  outlinks: 'Outbound links: Links on this page leading to other webpages.',
};
