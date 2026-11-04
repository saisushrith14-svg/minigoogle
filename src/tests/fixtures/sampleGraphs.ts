import type { WebPage } from '../../types';

/**
 * Standard test fixtures representing various graph topologies for PageRank validation.
 */

/**
 * 1. Simple Directed 4-node Graph:
 * A -> B, A -> C
 * B -> C
 * C -> A
 * D -> C
 */
export const simpleDirectedGraph: readonly WebPage[] = [
  {
    id: 'page-a',
    url: 'https://example.com/a',
    title: 'Page A',
    headings: ['Page A Header'],
    metaDescription: 'Description of page A',
    content: 'Content on page A referencing B and C.',
    category: 'General',
    links: ['page-b', 'page-c'],
  },
  {
    id: 'page-b',
    url: 'https://example.com/b',
    title: 'Page B',
    headings: ['Page B Header'],
    metaDescription: 'Description of page B',
    content: 'Content on page B referencing C.',
    category: 'General',
    links: ['page-c'],
  },
  {
    id: 'page-c',
    url: 'https://example.com/c',
    title: 'Page C',
    headings: ['Page C Header'],
    metaDescription: 'Description of page C',
    content: 'Content on page C referencing A.',
    category: 'General',
    links: ['page-a'],
  },
  {
    id: 'page-d',
    url: 'https://example.com/d',
    title: 'Page D',
    headings: ['Page D Header'],
    metaDescription: 'Description of page D',
    content: 'Content on page D referencing C.',
    category: 'General',
    links: ['page-c'],
  },
];

/**
 * 2. Dangling Node Graph:
 * Node C has zero outgoing links.
 * A -> B, B -> C, C -> []
 */
export const danglingNodeGraph: readonly WebPage[] = [
  {
    id: 'node-a',
    url: 'https://example.com/node-a',
    title: 'Node A',
    headings: ['Node A Heading'],
    metaDescription: 'Node A meta',
    content: 'Node A links to B.',
    category: 'Test',
    links: ['node-b'],
  },
  {
    id: 'node-b',
    url: 'https://example.com/node-b',
    title: 'Node B',
    headings: ['Node B Heading'],
    metaDescription: 'Node B meta',
    content: 'Node B links to C.',
    category: 'Test',
    links: ['node-c'],
  },
  {
    id: 'node-c',
    url: 'https://example.com/node-c',
    title: 'Node C (Dangling Sink)',
    headings: ['Node C Heading'],
    metaDescription: 'Node C meta',
    content: 'Node C has no outbound links.',
    category: 'Test',
    links: [],
  },
];

/**
 * 3. Cyclic Graph:
 * Pure ring: A -> B -> C -> A
 */
export const cyclicGraph: readonly WebPage[] = [
  {
    id: 'cycle-1',
    url: 'https://example.com/cycle-1',
    title: 'Cycle 1',
    headings: ['Cycle 1'],
    metaDescription: 'Cycle 1 meta',
    content: 'Ring node 1 links to 2.',
    category: 'Ring',
    links: ['cycle-2'],
  },
  {
    id: 'cycle-2',
    url: 'https://example.com/cycle-2',
    title: 'Cycle 2',
    headings: ['Cycle 2'],
    metaDescription: 'Cycle 2 meta',
    content: 'Ring node 2 links to 3.',
    category: 'Ring',
    links: ['cycle-3'],
  },
  {
    id: 'cycle-3',
    url: 'https://example.com/cycle-3',
    title: 'Cycle 3',
    headings: ['Cycle 3'],
    metaDescription: 'Cycle 3 meta',
    content: 'Ring node 3 links to 1.',
    category: 'Ring',
    links: ['cycle-1'],
  },
];

/**
 * 4. Single Node Graph:
 * Isolated self or non-self link.
 */
export const singleNodeGraph: readonly WebPage[] = [
  {
    id: 'single-node',
    url: 'https://example.com/lonely',
    title: 'Single Node',
    headings: ['Lonely Heading'],
    metaDescription: 'Only node in graph',
    content: 'Unique page in universe.',
    category: 'Single',
    links: [],
  },
];

/**
 * 5. Disconnected Graph:
 * Component 1: D1 <-> D2
 * Component 2: D3 <-> D4
 */
export const disconnectedGraph: readonly WebPage[] = [
  {
    id: 'disc-1',
    url: 'https://example.com/disc-1',
    title: 'Island 1 Node 1',
    headings: ['Island 1'],
    metaDescription: 'Island 1 meta',
    content: 'Island 1 node 1.',
    category: 'Component A',
    links: ['disc-2'],
  },
  {
    id: 'disc-2',
    url: 'https://example.com/disc-2',
    title: 'Island 1 Node 2',
    headings: ['Island 1'],
    metaDescription: 'Island 1 meta',
    content: 'Island 1 node 2.',
    category: 'Component A',
    links: ['disc-1'],
  },
  {
    id: 'disc-3',
    url: 'https://example.com/disc-3',
    title: 'Island 2 Node 1',
    headings: ['Island 2'],
    metaDescription: 'Island 2 meta',
    content: 'Island 2 node 1.',
    category: 'Component B',
    links: ['disc-4'],
  },
  {
    id: 'disc-4',
    url: 'https://example.com/disc-4',
    title: 'Island 2 Node 2',
    headings: ['Island 2'],
    metaDescription: 'Island 2 meta',
    content: 'Island 2 node 2.',
    category: 'Component B',
    links: ['disc-3'],
  },
];

