import { describe, expect, it } from 'vitest';
import { datasets, getDatasetById, getDatasetMetas } from '../../data/datasets';
import { DatasetSchema, validateDatasetGraph, WebPageSchema } from '../../utils/validation';
import type { DatasetScenario } from '../../types';

const EXPECTED_SCENARIOS: DatasetScenario[] = [
  'keyword-stuffing',
  'authority-problem',
  'link-farm',
  'new-website',
  'relevance-vs-popularity',
  'scientific-network',
];

describe('dataset registry', () => {
  it('contains exactly six datasets with unique IDs', () => {
    expect(datasets).toHaveLength(6);
    expect(new Set(datasets.map((dataset) => dataset.id)).size).toBe(6);
  });

  it('covers every supported scenario exactly once', () => {
    expect(datasets.map((dataset) => dataset.scenario).sort()).toEqual(
      EXPECTED_SCENARIOS.slice().sort(),
    );
  });

  it('looks datasets up by ID and exposes metadata', () => {
    datasets.forEach((dataset) => {
      expect(getDatasetById(dataset.id)).toBe(dataset);
    });
    expect(getDatasetById('does-not-exist')).toBeUndefined();
    const metas = getDatasetMetas();
    expect(metas).toHaveLength(6);
    metas.forEach((meta, index) => {
      expect(meta.pageCount).toBe(datasets[index].pages.length);
    });
  });
});

describe('dataset integrity', () => {
  datasets.forEach((dataset) => {
    describe(dataset.name, () => {
      it('passes the Zod schema', () => {
        const result = DatasetSchema.safeParse(dataset);
        if (!result.success) {
          throw new Error(
            result.error.errors.map((error) => error.message).join(', '),
          );
        }
        expect(result.success).toBe(true);
      });

      it('has a valid graph with no broken links', () => {
        const report = validateDatasetGraph(dataset);
        expect(report.errors).toEqual([]);
        expect(report.isValid).toBe(true);
        expect(report.brokenLinksCount).toBe(0);
        expect(report.pageCount).toBeGreaterThanOrEqual(6);
        expect(report.pageCount).toBeLessThanOrEqual(30);
      });

      it('has unique page IDs and valid URLs', () => {
        const ids = dataset.pages.map((page) => page.id);
        expect(new Set(ids).size).toBe(ids.length);
        const urls = dataset.pages.map((page) => page.url);
        expect(new Set(urls).size).toBe(urls.length);
        dataset.pages.forEach((page) => {
          const parsed = WebPageSchema.safeParse(page);
          expect(parsed.success).toBe(true);
        });
      });

      it('provides a default query, test queries, and existing key pages', () => {
        expect(dataset.defaultQuery).toBeTruthy();
        expect((dataset.testQueries ?? []).length).toBeGreaterThanOrEqual(2);
        const ids = new Set(dataset.pages.map((page) => page.id));
        (dataset.keyPageIds ?? []).forEach((id) => {
          expect(ids.has(id)).toBe(true);
        });
        expect((dataset.keyPageIds ?? []).length).toBeGreaterThanOrEqual(2);
      });

      it('provides educational notes and roles for every page', () => {
        expect(dataset.educationalNotes?.length).toBeGreaterThan(40);
        dataset.pages.forEach((page) => {
          expect(page.educationalRole?.length).toBeGreaterThan(20);
        });
      });

      it('has no duplicate outgoing links', () => {
        dataset.pages.forEach((page) => {
          expect(new Set(page.links).size).toBe(page.links.length);
        });
      });
    });
  });
});
