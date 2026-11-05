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
    {
      id: 'sn-kleinberg-paper',
      url: 'https://www.cs.cornell.edu/kleinberg/hits-hub-authority.html',
      title: 'Authoritative Sources in a Hyperlinked Environment (HITS Algorithm)',
      headings: [
        'Hubs and Authorities',
        'Mutual Recursion Eigenvectors',
        'Search Engine Link Topology',
      ],
      metaDescription:
        'Jon Kleinberg’s seminal 1999 paper introducing the HITS algorithm, hubs, and authorities in web citation analysis.',
      content:
        'Hyperlink analysis of the World Wide Web reveals latent authoritative communities. By decomposing graph adjacency into mutually reinforcing hubs and authorities, search engines can isolate definitive sources. This work complements the random surfer model of the PageRank paper.',
      category: 'Computer Science / Landmark Paper',
      links: ['sn-pagerank-paper', 'sn-graph-theory'],
      educationalRole: 'Foundational paper on link-structure analysis citing the PageRank paper and spectral graph theory.',
    },
    {
      id: 'sn-salton-paper',
      url: 'https://www.cornell-ir-archives.org/salton/vector-space-model',
      title: 'Term-Weighting Approaches in Automatic Text Retrieval (Vector Space Model)',
      headings: [
        'Term Frequency and Inverted Document Frequency',
        'Cosine Similarity',
        'Text Normalization',
      ],
      metaDescription:
        'Gerard Salton and Chris Buckley’s classical foundations of TF-IDF weighting and vector space relevance scoring.',
      content:
        'Effective automatic text retrieval depends on assigning weights to search terms proportional to their occurrences in documents and inversely related to collection frequency. These term-weighting formulations provide the textual matching baseline that modern web search engines combine with hyperlink graph topology.',
      category: 'Computer Science / Landmark Paper',
      links: ['sn-citation-review', 'sn-bibliometrics'],
      educationalRole: 'Historical landmark paper representing classical pre-web information retrieval.',
    },
    {
      id: 'sn-sigir-proceedings',
      url: 'https://www.acm-sigir-archive.org/conferences/proceedings',
      title: 'ACM SIGIR: Annual Conference on Research & Development in Information Retrieval',
      headings: [
        'Keynote Addresses',
        'Evaluation Metrics & Benchmark TREC Datasets',
        'Link-Based Ranking Sessions',
      ],
      metaDescription:
        'Premier international conference on information retrieval, search engine evaluation, and index algorithms.',
      content:
        'ACM SIGIR serves as the definitive annual forum for information retrieval researchers. Proceedings detail breakthroughs in crawler design, inverted indexing, web hyperlink graphs, and classical text relevance. Several papers evaluate PageRank convergence under large-scale crawl graphs.',
      category: 'Computer Science / Conference',
      links: ['sn-pagerank-paper', 'sn-salton-paper', 'sn-conference'],
      educationalRole: 'Premier IR academic venue citing classical text matching and modern web graph algorithms.',
    },
    {
      id: 'sn-cern-archive',
      url: 'https://www.w3-historical-archive.org/history/cern-hypertext',
      title: 'W3C & CERN Historical Archives: Tim Berners-Lee’s Original Web Proposal',
      headings: [
        'Information Management: A Proposal',
        'HyperText Transfer Protocol Specs',
        'Universal Resource Identifiers',
      ],
      metaDescription:
        'Historical documentation of Tim Berners-Lee’s 1989 CERN proposal establishing the World Wide Web architecture.',
      content:
        'The World Wide Web was conceived at CERN to allow high-energy physics researchers across institutes to share and link documentation transparently. The resulting decentralized directed hyperlink topology became the foundational graph upon which hypertextual search engines operate.',
      category: 'History / Architecture',
      links: ['sn-web-survey', 'sn-pagerank-paper'],
      educationalRole: 'Historical architectural anchor documenting the origin of the World Wide Web citation graph.',
    },
    {
      id: 'sn-digital-libraries',
      url: 'https://www.ieee-computer-society.org/transactions/digital-libraries',
      title: 'IEEE Transactions on Digital Libraries: Indexing Scholarly Citations',
      headings: [
        'Digital Library Architectures',
        'Bibliographic Citation Indexing',
        'Graph Centrality in Research',
      ],
      metaDescription:
        'Scholarly journal exploring autonomous digital library indexing, citation matching, and scientific discovery.',
      content:
        'Automating scholarly discovery requires indexing research literature and evaluating citation centrality. Techniques developed for academic bibliometrics directly inspired the PageRank algorithm used in large-scale web search.',
      category: 'Computer Science / Journal',
      links: ['sn-bibliometrics', 'sn-pagerank-paper'],
      educationalRole: 'Scholarly journal connecting bibliometric citation theories to web search engine architecture.',
    },
    {
      id: 'sn-mit-ai-lab',
      url: 'https://www.ai-laboratory.mit.edu/research/information-systems',
      title: 'MIT AI Laboratory: Intelligent Information Extraction & Search Systems',
      headings: [
        'Autonomous Crawling Agents',
        'Semantic Web Representation',
        'Selected Faculty Papers',
      ],
      metaDescription:
        'Research initiatives in automated web crawler agents, graph mining, and intelligent document indexing.',
      content:
        'The MIT Information Systems group investigates autonomous web harvesting and machine learning architectures for information extraction. Our graduate syllabus references foundational literature on hypertextual web retrieval, including the Stanford PageRank algorithm.',
      category: 'University / Laboratory',
      links: ['sn-pagerank-paper', 'sn-kleinberg-paper', 'sn-author-profile'],
      educationalRole: 'Major university AI research lab citing Stanford and Cornell link ranking papers.',
    },
    {
      id: 'sn-berkeley-ir',
      url: 'https://www.ischool-berkeley.edu/research/search-and-retrieval',
      title: 'UC Berkeley School of Information: Search & Retrieval Systems Group',
      headings: [
        'Information Architecture Seminars',
        'Probabilistic Retrieval Models',
        'Stanford InfoLab Colleague Links',
      ],
      metaDescription:
        'Research into probabilistic retrieval models, Okapi BM25 ranking, and web crawl graph topologies.',
      content:
        'The Berkeley Information School conducts fundamental investigations into probabilistic retrieval models and search evaluation. Faculty members frequently collaborate with the Stanford InfoLab and reference Page & Brin’s classic web architecture papers in graduate seminars.',
      category: 'University / Research Group',
      links: ['sn-lab-page', 'sn-author-profile', 'sn-pagerank-paper'],
      educationalRole: 'Peer academic research group providing institutional citation weight into the Stanford paper and lab.',
    },
  ],
};
