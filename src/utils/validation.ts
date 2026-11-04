import { z } from 'zod';
import { Dataset, WebPage } from '../types';

/**
 * Zod schema for WebPage validation.
 */
export const WebPageSchema = z.object({
  id: z.string().min(1, 'Page ID must not be empty'),
  url: z.string().url('URL must be valid'),
  title: z.string().min(1, 'Title must not be empty'),
  headings: z.array(z.string()).min(1, 'Must have at least one heading'),
  metaDescription: z.string().min(1, 'Meta description required'),
  content: z.string().min(10, 'Content must have meaningful length'),
  category: z.string().min(1, 'Category required'),
  links: z.array(z.string()),
  publishedDate: z.string().optional(),
  educationalRole: z.string().optional(),
});

/**
 * Zod schema for Dataset validation.
 */
export const DatasetSchema = z.object({
  id: z.string().min(1, 'Dataset ID must not be empty'),
  name: z.string().min(1, 'Dataset name must not be empty'),
  description: z.string().min(10, 'Dataset description must be descriptive'),
  scenario: z.enum([
    'keyword-stuffing',
    'authority-problem',
    'link-farm',
    'new-website',
    'relevance-vs-popularity',
    'scientific-network',
  ]),
  pages: z.array(WebPageSchema).min(6, 'Dataset must have at least 6 pages').max(15, 'Dataset should not exceed 15 pages for pedagogical clarity'),
  defaultQuery: z.string().optional(),
  testQueries: z.array(z.string()).optional(),
  educationalNotes: z.string().optional(),
  keyPageIds: z.array(z.string()).optional(),
});

export interface DatasetValidationReport {
  readonly isValid: boolean;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
  readonly pageCount: number;
  readonly brokenLinksCount: number;
}

/**
 * Validates a dataset's internal graph integrity, ensuring that:
 * 1. All page IDs are unique within the dataset.
 * 2. All links point to existing page IDs within the same dataset (or explicit self-loops).
 * 3. Schema constraints are satisfied.
 */
export function validateDatasetGraph(dataset: Dataset): DatasetValidationReport {
  const errors: string[] = [];
  const warnings: string[] = [];

  const parseResult = DatasetSchema.safeParse(dataset);
  if (!parseResult.success) {
    parseResult.error.errors.forEach((err) => {
      errors.push(`[Schema] ${err.path.join('.')}: ${err.message}`);
    });
  }

  const pageIds = new Set<string>();
  const duplicates = new Set<string>();

  dataset.pages.forEach((page) => {
    if (pageIds.has(page.id)) {
      duplicates.add(page.id);
    }
    pageIds.add(page.id);
  });

  if (duplicates.size > 0) {
    errors.push(`Duplicate page IDs detected: ${Array.from(duplicates).join(', ')}`);
  }

  let brokenLinks = 0;
  dataset.pages.forEach((page: WebPage) => {
    page.links.forEach((targetId) => {
      if (!pageIds.has(targetId)) {
        brokenLinks++;
        errors.push(`Page "${page.id}" links to nonexistent target "${targetId}"`);
      }
    });

    if (page.links.length === 0) {
      warnings.push(`Page "${page.id}" is a dangling node (no outgoing hyperlinks)`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    pageCount: dataset.pages.length,
    brokenLinksCount: brokenLinks,
  };
}

