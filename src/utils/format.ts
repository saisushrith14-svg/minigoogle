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
