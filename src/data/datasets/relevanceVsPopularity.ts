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
    {
      id: 'rp-sports-network',
      url: 'https://www.global-sports-broadcast.example/scores',
      title: 'Global Sports Network: Live Scores, Highlights and Match Reports',
      headings: [
        'Match Day Scores',
        'Championship Highlights',
        'Entertainment News',
      ],
      metaDescription:
        'Live real-time sports ticker, league tables, player interviews, and sports culture.',
      content:
        'Catch live scores across premier soccer, basketball, and tennis tournaments. Watch post-game press conferences and read commentary on athlete lifestyle features in the Entertainment Daily gazette.',
      category: 'Sports / Media',
      links: ['rp-news-portal', 'rp-entertainment'],
      educationalRole: 'Massive popularity hub linking to mainstream news and entertainment portals.',
    },
    {
      id: 'rp-music-charts',
      url: 'https://www.top40-music-bulletin.example/charts',
      title: 'Top 40 Music Bulletin: Weekly Single Charts & Artist Interviews',
      headings: [
        'Top 40 Single Countdown',
        'Music Video Premieres',
        'Red Carpet Fashion',
      ],
      metaDescription:
        'Official weekly music rankings, album reviews, streaming numbers, and artist features.',
      content:
        'This week’s single charts celebrate breakout pop hits and record-breaking streaming records. Read our exclusive interview with chart-topping artists and check red carpet coverage on Celebrity Headlines.',
      category: 'Music / Entertainment',
      links: ['rp-celebrity', 'rp-news-portal'],
      educationalRole: 'Pop culture media node adding link weight to the celebrity headline page.',
    },
    {
      id: 'rp-viral-memes',
      url: 'https://www.viral-buzz-feed.example/trending',
      title: 'Viral Buzz Feed: Trending Clips, Memes, and Internet Culture',
      headings: [
        'Trending Now',
        'Internet Culture Watch',
        'Daily Celebrity Gossip',
      ],
      metaDescription:
        'The fastest growing viral videos, internet culture memes, and trending celebrity moments.',
      content:
        'From hilarious backstage blunders to trending red carpet memes, our editors aggregate the web’s most shared video moments. See what pop culture blogs and entertainment news sites are saying.',
      category: 'Internet / Viral Media',
      links: ['rp-blog', 'rp-celebrity', 'rp-entertainment'],
      educationalRole: 'High-traffic viral site channeling user attention and backlinks into the entertainment cluster.',
    },
    {
      id: 'rp-shopping-mall',
      url: 'https://www.consumer-lifestyle-deals.example/home',
      title: 'Consumer Lifestyle Deals: Smart Home Tech & Seasonal Savings',
      headings: [
        'Flash Deals',
        'Smart Appliances',
        'Celebrity Style Picks',
      ],
      metaDescription:
        'Online shopping reviews, home appliance deals, and popular lifestyle recommendations.',
      content:
        'Upgrade your kitchen with energy-saving smart appliances and eco-friendly home products. Discover affordable style picks featured by celebrity influencers in Entertainment Daily and mainstream wire news.',
      category: 'Ecommerce / Lifestyle',
      links: ['rp-news-portal', 'rp-celebrity'],
      educationalRole: 'Commercial consumer lifestyle site linking to top-level news and celebrity portals.',
    },
    {
      id: 'rp-weather-channel',
      url: 'https://www.national-weather-wire.example/forecast',
      title: 'National Weather Wire: Severe Weather Radar & Climate Trends',
      headings: [
        'National Radar Map',
        'Severe Storm Watches',
        'Long Range Climate Data',
      ],
      metaDescription:
        'Official meteorological forecasts, regional satellite radar, and climate pattern analyses.',
      content:
        'Severe weather radar updates show winter storm systems moving across the Midwest. For detailed environmental reports on global atmospheric warming and climate solutions, consult the Federal Environmental Agency and Applied Climate Science.',
      category: 'Science / Weather',
      links: ['rp-gov', 'rp-science'],
      educationalRole: 'Authoritative meteorology service directing link equity toward scientific and governmental research.',
    },
    {
      id: 'rp-solar-tech',
      url: 'https://www.clean-solar-innovations.example/photovoltaic',
      title: 'Clean Solar Innovations: Next-Generation Photovoltaic Cells',
      headings: [
        'High-Efficiency Solar Materials',
        'Perovskite Technology',
        'Grid Interconnection',
      ],
      metaDescription:
        'Engineering advances in commercial photovoltaic efficiency, grid storage, and clean power generation.',
      content:
        'Next-generation perovskite-silicon tandem cells demonstrate energy conversion efficiencies exceeding 30 percent in laboratory tests. These solar breakthroughs provide vital engineering foundations for practical climate change solutions. Research details appear in Applied Climate Science.',
      category: 'Technology / Clean Energy',
      links: ['rp-solutions', 'rp-science'],
      educationalRole: 'Technical engineering page providing a direct, highly-relevant inlink to the climate solutions paper.',
    },
    {
      id: 'rp-wind-consortium',
      url: 'https://www.offshore-wind-alliance.example/turbines',
      title: 'Offshore Wind Alliance: Deep-Water Marine Turbine Engineering',
      headings: [
        'Floating Wind Turbines',
        'Marine Ecology Impact',
        'Clean Energy Grid Integration',
      ],
      metaDescription:
        'Deep-water wind energy deployment, turbine aerodynamics, and coastal clean energy integration.',
      content:
        'Offshore floating wind installations capture steady maritime wind resources. Our engineering consortium collaborates with federal energy regulators to integrate massive clean electricity into the national grid, as outlined in the Comprehensive Climate Solutions overview.',
      category: 'Energy / Infrastructure',
      links: ['rp-solutions', 'rp-gov'],
      educationalRole: 'Infrastructure engineering consortium reinforcing the climate solutions document.',
    },
    {
      id: 'rp-climate-coalition',
      url: 'https://www.global-reforestation-network.org/restoration',
      title: 'Global Reforestation Network: Nature-Based Carbon Sinks',
      headings: [
        'Forest Landscape Restoration',
        'Biodiversity Corridors',
        'Carbon Sequestration Models',
      ],
      metaDescription:
        'Ecological restoration initiatives, forest conservation projects, and nature-based carbon sequestration.',
      content:
        'Reforesting degraded ecological corridors offers one of the most cost-effective nature-based carbon capture mechanisms available today. Our international field programs follow protocols published in Applied Climate Science and endorsed by the Federal Environmental Agency.',
      category: 'Non-Profit / Conservation',
      links: ['rp-science', 'rp-gov', 'rp-solutions'],
      educationalRole: 'Conservation non-profit linking to environmental science and the solutions paper.',
    },
  ],
};
