import { Dataset } from '../../types';

export const relevanceVsPopularityDataset: Dataset = {
  id: 'relevance-vs-popularity',
  name: 'Scenario 5: Relevance vs Raw Popularity',
  description:
    'A celebrity news page attracts enormous attention and links, while a carefully researched climate solutions article directly answers the query. The scenario reveals how popularity signals can overwhelm topical relevance.',
  scenario: 'relevance-vs-popularity',
  defaultQuery: 'climate change solutions',
  testQueries: ['climate change solutions', 'renewable energy policy', 'carbon capture', 'celebrity news'],
  keyPageIds: ['rp-celebrity', 'rp-solutions'],
  educationalNotes:
    'The popular news portal and celebrity page dominate PageRank because entertainment outlets and the wider news ecosystem link to them. The solutions article wins keyword relevance and, once surfer telemetry exists, earns stronger engagement. Hybrid ranking exposes the trade-off explicitly.',
  pages: [
    {
      id: 'rp-celebrity',
      url: 'https://www.entertainment-daily.example/celebrity/climate-comment',
      title: 'Celebrity Makes Headlines With Climate Comment',
      headings: ['Red Carpet Reaction', 'Social Media Buzz', 'What Fans Are Saying'],
      metaDescription:
        'Entertainment news coverage of a celebrity comment, fan reactions, and red carpet photos.',
      content:
        'A celebrity sparked headlines after a brief climate comment on the red carpet. Fans debated the remark across social media while entertainment reporters covered outfits, interviews, and backstage moments. The article focuses on celebrity culture rather than policy or practical climate change solutions.',
      category: 'Entertainment / Celebrity',
      links: ['rp-news-portal', 'rp-entertainment'],
      educationalRole: 'High-popularity, low-relevance page that accumulates links from entertainment outlets.',
    },
    {
      id: 'rp-solutions',
      url: 'https://www.climate-policy-review.example/solutions/municipal-playbook',
      title: 'Climate Change Solutions: A Practical Municipal Playbook',
      headings: [
        'Climate Change Solutions That Cities Can Deploy',
        'Renewable Energy and Building Retrofits',
        'Measuring Emissions Reductions',
      ],
      metaDescription:
        'Evidence-based climate change solutions for cities, including renewable energy, retrofits, transit, and measurement.',
      content:
        'Effective climate change solutions combine renewable energy procurement, building retrofits, efficient transit, and land-use reform. This playbook reviews municipal case studies, compares carbon capture with demand reduction, and explains how cities measure emissions. Each climate change solution includes cost ranges, implementation barriers, and policy levers. The analysis prioritizes interventions with measurable near-term reductions.',
      category: 'Climate / Research Article',
      links: ['rp-science', 'rp-gov', 'rp-news-portal'],
      educationalRole: 'Directly relevant, evidence-rich article with fewer popularity links than the celebrity page.',
    },
    {
      id: 'rp-news-portal',
      url: 'https://www.daily-brief.example/',
      title: 'The Daily Brief: Breaking News, Entertainment, and Analysis',
      headings: ['Top Stories', 'Entertainment', 'Climate and Science'],
      metaDescription:
        'Breaking news across politics, entertainment, science, and climate from The Daily Brief newsroom.',
      content:
        'The Daily Brief covers breaking news, entertainment, politics, and science. Today: a celebrity climate comment dominates social media, cities publish a new climate change solutions playbook, and researchers report renewable energy progress. Our newsroom links to primary sources and partner publications.',
      category: 'News / Portal',
      links: ['rp-celebrity', 'rp-solutions', 'rp-entertainment', 'rp-science'],
      educationalRole: 'Central news authority that distributes links to both popular and relevant content.',
    },
    {
      id: 'rp-entertainment',
      url: 'https://www.star-watch.example/',
      title: 'Star Watch: Celebrity News and Photos',
      headings: ['Latest Celebrity News', 'Red Carpet Gallery', 'Fan Reactions'],
      metaDescription:
        'Celebrity news, red carpet photos, fan reactions, and entertainment features from Star Watch.',
      content:
        'Star Watch covers celebrity interviews, red carpet fashion, film premieres, and fan reactions. Today the site follows a celebrity climate comment that generated millions of views. Browse photo galleries and entertainment videos.',
      category: 'Entertainment / Celebrity',
      links: ['rp-celebrity', 'rp-news-portal'],
      educationalRole: 'Entertainment outlet that strongly reinforces the celebrity page popularity signal.',
    },
    {
      id: 'rp-science',
      url: 'https://www.earth-systems-journal.example/reviews/decarbonization',
      title: 'Earth Systems Journal: Decarbonization Pathways Review',
      headings: ['Decarbonization Pathways', 'Technology Readiness', 'Policy Evaluation'],
      metaDescription:
        'A peer-reviewed review of decarbonization pathways, renewable energy, carbon capture, and policy evaluation.',
      content:
        'This review compares decarbonization pathways across electricity, buildings, transport, and industry. Renewable energy is mature and cost-effective; carbon capture remains expensive for most applications. The authors evaluate climate change solutions using technology readiness, lifecycle emissions, and policy feasibility.',
      category: 'Climate / Academic',
      links: ['rp-solutions', 'rp-news-portal', 'rp-gov'],
      educationalRole: 'Scientific authority that cites the practical solutions article.',
    },
    {
      id: 'rp-gov',
      url: 'https://www.city-climate-office.gov/plans',
      title: 'City Climate Office: Emissions Reduction Plan',
      headings: ['Municipal Climate Plan', 'Renewable Energy Targets', 'Progress Reporting'],
      metaDescription:
        'The city climate office publishes emissions targets, renewable energy plans, and annual progress reports.',
      content:
        'The city climate office coordinates emissions reduction planning, renewable energy procurement, building retrofit programs, and transit investments. Annual reporting tracks progress against targets and links to the municipal climate change solutions playbook.',
      category: 'Government / Climate',
      links: ['rp-solutions', 'rp-science', 'rp-news-portal'],
      educationalRole: 'Institutional page that endorses the solutions article with a contextual link.',
    },
    {
      id: 'rp-blog',
      url: 'https://www.pop-culture-blog.example/celebrity-roundup',
      title: 'Pop Culture Blog: Weekly Celebrity Roundup',
      headings: ['This Week in Celebrity News', 'Viral Moments', 'Fan Polls'],
      metaDescription:
        'A weekly celebrity roundup covering viral moments, fan polls, and entertainment culture.',
      content:
        'This week in celebrity news: red carpet photos, viral clips, fan polls, and a celebrity climate comment that sparked debate. The roundup collects links to entertainment outlets and social media reactions.',
      category: 'Entertainment / Blog',
      links: ['rp-celebrity', 'rp-entertainment'],
      educationalRole: 'Long-tail entertainment blog adding another popularity link to the celebrity page.',
    },
  ],
};
