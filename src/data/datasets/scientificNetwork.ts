import { Dataset } from '../../types';

export const scientificNetworkDataset: Dataset = {
  id: 'scientific-network',
  name: 'Scenario 6: Scientific Citation Network',
  description:
    'A citation network around the original PageRank paper. Later papers cite the seminal work, surveys cite both foundations and applications, and a lab page links to its own publications. This is the cleanest demonstration of link authority as scholarly prestige.',
  scenario: 'scientific-network',
  defaultQuery: 'pagerank citation analysis',
  testQueries: ['pagerank citation analysis', 'link analysis survey', 'bibliometrics', 'graph theory web search'],
  keyPageIds: ['sn-pagerank-paper', 'sn-citation-review'],
  educationalNotes:
    'The seminal PageRank paper accumulates citations from every part of the network, so PageRank and relevance agree strongly. The citation review is the second authority. Compare this with the authority-problem dataset where hub authority and topical relevance diverge.',
  pages: [
    {
      id: 'sn-pagerank-paper',
      url: 'https://www.stanford.example/papers/pagerank-citation-ranking',
      title: 'The PageRank Citation Ranking: Bringing Order to the Web',
      headings: [
        'PageRank Citation Ranking',
        'Link Analysis and the Random Surfer',
        'Convergence and Implementation',
      ],
      metaDescription:
        'The original PageRank paper describing citation analysis, link analysis, the random surfer model, and iterative ranking.',
      content:
        'This paper introduces the PageRank citation ranking, a link analysis method for ordering web pages by authority. The PageRank score models a random surfer who follows links and occasionally teleports. We describe the iterative computation, convergence properties, citation analysis background, and early web search experiments. PageRank treats hyperlinks as citations and aggregates prestige across the graph.',
      category: 'Computer Science / Seminal Paper',
      links: ['sn-citation-review', 'sn-graph-theory', 'sn-web-survey'],
      publishedDate: '1998-01-29',
      educationalRole: 'Seminal paper with the highest citation authority in the network.',
    },
    {
      id: 'sn-citation-review',
      url: 'https://www.bibliometrics-review.example/articles/citation-analysis',
      title: 'Citation Analysis and the Science of Bibliometrics',
      headings: [
        'Citation Analysis Foundations',
        'From Bibliometrics to Web Link Analysis',
        'Measuring Scholarly Impact',
      ],
      metaDescription:
        'A review of citation analysis, bibliometrics, scholarly impact measurement, and the transition to web link analysis.',
      content:
        'Citation analysis studies how scholarly works reference one another. Bibliometrics uses citation counts, co-citation networks, and impact factors to measure influence. This review traces citation analysis from library science to web link analysis, including PageRank and modern graph-based ranking. We discuss limitations such as citation cartels and field-normalized indicators.',
      category: 'Bibliometrics / Review',
      links: ['sn-pagerank-paper', 'sn-bibliometrics', 'sn-graph-theory', 'sn-author-profile'],
      publishedDate: '2005-06-12',
      educationalRole: 'Highly cited review connecting citation analysis to PageRank.',
    },
    {
      id: 'sn-web-survey',
      url: 'https://www.web-search-survey.example/link-analysis',
      title: 'A Survey of Web Search and Link Analysis',
      headings: ['Web Search Architectures', 'Link Analysis Methods', 'Evaluation and Challenges'],
      metaDescription:
        'A survey of web search architectures, link analysis, PageRank, HITS, and evaluation methods.',
      content:
        'This survey reviews web search architectures, crawling, indexing, and link analysis. We compare PageRank, HITS, and citation-based ranking, then discuss spam, evaluation, and query-dependent authority. The survey includes an extensive bibliography covering graph theory and bibliometrics.',
      category: 'Computer Science / Survey',
      links: ['sn-pagerank-paper', 'sn-citation-review', 'sn-graph-theory'],
      publishedDate: '2004-09-03',
      educationalRole: 'Broad survey with citations to both the seminal paper and citation-analysis literature.',
    },
    {
      id: 'sn-graph-theory',
      url: 'https://www.graph-foundations.example/lectures/link-analysis',
      title: 'Graph Theory Foundations for Link Analysis',
      headings: ['Directed Graphs and Adjacency', 'Markov Chains and Stationary Distributions', 'Spectral Bounds'],
      metaDescription:
        'Lecture notes on directed graphs, adjacency matrices, Markov chains, and the mathematical foundations of link analysis.',
      content:
        'These lecture notes cover directed graphs, adjacency matrices, stochastic transitions, Markov chains, and stationary distributions. We derive the PageRank power iteration, analyze convergence, and discuss dangling nodes. Applications include citation analysis, web search, and network centrality.',
      category: 'Mathematics / Lecture Notes',
      links: ['sn-pagerank-paper', 'sn-citation-review', 'sn-web-survey'],
      publishedDate: '2003-02-18',
      educationalRole: 'Mathematical foundation that repeatedly cites the seminal PageRank work.',
    },
    {
      id: 'sn-bibliometrics',
      url: 'https://www.scholarly-metrics.example/topics/bibliometrics',
      title: 'Bibliometrics: Measuring Scholarly Impact',
      headings: ['Citation Counts and Indices', 'Field Normalization', 'Responsible Metrics'],
      metaDescription:
        'An overview of bibliometrics, citation indices, field normalization, and responsible research evaluation.',
      content:
        'Bibliometrics quantifies scholarly impact through citation counts, h-indices, co-citation networks, and field-normalized indicators. This overview explains responsible metric use, the difference between popularity and quality, and how citation analysis informs research evaluation.',
      category: 'Bibliometrics / Overview',
      links: ['sn-pagerank-paper', 'sn-citation-review', 'sn-author-profile', 'sn-conference'],
      publishedDate: '2010-07-22',
      educationalRole: 'Applied bibliometrics page that links to the citation review and author network.',
    },
    {
      id: 'sn-author-profile',
      url: 'https://www.research-profiles.example/authors/link-analysis-group',
      title: 'Author Profile: The Link Analysis Research Group',
      headings: ['Research Interests', 'Selected Publications', 'Collaborators'],
      metaDescription:
        'Profile of a research group working on link analysis, citation networks, and web search.',
      content:
        'The Link Analysis Research Group studies citation networks, web search, graph ranking, and scholarly impact. Selected publications include work on PageRank, citation analysis, and bibliometrics. The group collaborates with information scientists and graph theorists.',
      category: 'Computer Science / Author Profile',
      links: ['sn-pagerank-paper', 'sn-bibliometrics'],
      publishedDate: '2012-04-05',
      educationalRole: 'Author hub that consolidates citations toward foundational papers.',
    },
    {
      id: 'sn-conference',
      url: 'https://www.websearch-conference.example/2026/proceedings',
      title: 'International Conference on Web Search: Proceedings',
      headings: ['Accepted Papers', 'Keynotes', 'Workshops'],
      metaDescription:
        'Proceedings of the International Conference on Web Search, including link analysis and ranking papers.',
      content:
        'The International Conference on Web Search publishes proceedings on ranking, link analysis, citation networks, and evaluation. This year includes papers on graph neural ranking, PageRank variants, and bibliometric fairness.',
      category: 'Computer Science / Conference',
      links: ['sn-pagerank-paper', 'sn-web-survey', 'sn-author-profile'],
      publishedDate: '2026-05-30',
      educationalRole: 'Venue page that cites foundational and survey work.',
    },
    {
      id: 'sn-lab-page',
      url: 'https://www.network-science-lab.example/publications',
      title: 'Network Science Lab: Publications on Graph Ranking',
      headings: ['Selected Publications', 'Datasets and Code', 'Collaborations'],
      metaDescription:
        'Publications and resources from a network science lab studying graph ranking, citation networks, and web search.',
      content:
        'The Network Science Lab publishes research on graph ranking, citation networks, and web search. Selected papers cover PageRank convergence, citation analysis, and bibliometric evaluation. The lab releases datasets and reference implementations for reproducible research.',
      category: 'Computer Science / Laboratory',
      links: ['sn-pagerank-paper', 'sn-citation-review', 'sn-graph-theory', 'sn-conference'],
      publishedDate: '2024-10-16',
      educationalRole: 'Laboratory hub that adds citations to the foundational literature.',
    },
  ],
};
