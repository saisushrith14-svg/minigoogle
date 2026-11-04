import type { Dataset, DatasetMeta } from '../../types';
import { authorityProblemDataset } from './authorityProblem';
import { keywordStuffingDataset } from './keywordStuffing';
import { linkFarmDataset } from './linkFarm';
import { newWebsiteDataset } from './newWebsite';
import { relevanceVsPopularityDataset } from './relevanceVsPopularity';
import { scientificNetworkDataset } from './scientificNetwork';

/** All six curated educational scenarios, in teaching order. */
export const datasets: readonly Dataset[] = [
  keywordStuffingDataset,
  authorityProblemDataset,
  linkFarmDataset,
  newWebsiteDataset,
  relevanceVsPopularityDataset,
  scientificNetworkDataset,
];

export {
  authorityProblemDataset,
  keywordStuffingDataset,
  linkFarmDataset,
  newWebsiteDataset,
  relevanceVsPopularityDataset,
  scientificNetworkDataset,
};

export function getDatasetById(id: string): Dataset | undefined {
  return datasets.find((dataset) => dataset.id === id);
}

export function toDatasetMeta(dataset: Dataset): DatasetMeta {
  return {
    id: dataset.id,
    name: dataset.name,
    description: dataset.description,
    scenario: dataset.scenario,
    defaultQuery: dataset.defaultQuery,
    pageCount: dataset.pages.length,
  };
}

export function getDatasetMetas(): DatasetMeta[] {
  return datasets.map(toDatasetMeta);
}

export const DEFAULT_DATASET = keywordStuffingDataset;
