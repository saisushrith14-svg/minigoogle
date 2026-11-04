import { Dataset } from '../../types';

export const newWebsiteDataset: Dataset = {
  id: 'new-website',
  name: 'Scenario 4: The New Website Cold Start',
  description:
    'A brand-new baking site publishes an exceptionally useful sourdough guide, but almost nobody links to it yet. Established blogs and recipe hubs dominate PageRank despite weaker topical depth.',
  scenario: 'new-website',
  defaultQuery: 'sourdough starter guide',
  testQueries: ['sourdough starter guide', 'feeding sourdough starter', 'beginner bread baking', 'wild yeast'],
  keyPageIds: ['nw-new-guide', 'nw-established-blog'],
  educationalNotes:
    'Keyword ranking immediately rewards the new guide for its focused, practical content. PageRank cannot, because authority takes time to accrue. This is the cold-start problem that motivates freshness, quality, and behavioural signals.',
  pages: [
    {
      id: 'nw-new-guide',
      url: 'https://www.flour-and-water.example/guides/sourdough-starter-guide',
      title: 'The Complete Sourdough Starter Guide for Beginners',
      headings: [
        'Sourdough Starter Guide: Day One to First Bake',
        'Feeding Schedule and Hydration',
        'Troubleshooting a Weak Starter',
      ],
      metaDescription:
        'A practical sourdough starter guide covering flour, hydration, feeding schedules, troubleshooting, and the first bake.',
      content:
        'This sourdough starter guide walks a beginner from day one through the first loaf. Mix whole wheat flour and water, discard half each day, and feed at a predictable schedule. A healthy starter doubles within six hours, smells pleasantly sour, and bubbles throughout. The guide explains hydration ratios, temperature, troubleshooting, and how to adapt feeding when your kitchen is cold. Every step includes a clear rationale so new bakers can diagnose problems rather than follow a rigid recipe.',
      category: 'Baking / New Independent Guide',
      links: ['nw-bakery', 'nw-flour-brand'],
      publishedDate: '2026-09-14',
      educationalRole: 'Excellent new document with very few inbound links; the cold-start case.',
    },
    {
      id: 'nw-established-blog',
      url: 'https://www.veteran-baker.example/blog',
      title: 'Veteran Baker: Recipes, Techniques, and Community Favorites',
      headings: ['Ten Years of Baking', 'Most Popular Recipes', 'Baking Fundamentals'],
      metaDescription:
        'Long-running baking blog with recipes, technique guides, and a large archive of reader favorites.',
      content:
        'Veteran Baker has published recipes and baking technique articles for more than a decade. Browse popular bread recipes, pastry tutorials, seasonal menus, and reader questions. The archive includes beginner bread baking advice, equipment reviews, and interviews with professional bakers.',
      category: 'Baking / Established Blog',
      links: ['nw-forum', 'nw-bakery', 'nw-magazine', 'nw-recipe-hub'],
      publishedDate: '2014-02-01',
      educationalRole: 'Established authority with many inbound links and broad but less specific content.',
    },
    {
      id: 'nw-forum',
      url: 'https://www.breadmakers-forum.example/threads/starter-help',
      title: 'Breadmakers Forum: Sourdough Starter Help Thread',
      headings: ['Community Starter Advice', 'Reader Recommendations'],
      metaDescription:
        'Forum discussion where home bakers share sourdough starter troubleshooting and favorite guides.',
      content:
        'Community members discuss feeding schedules, mold, hooch, and sluggish sourdough starters. Several readers recommend the new Flour and Water sourdough starter guide for its clear troubleshooting section. Others share their own beginner bread baking experiments and photos.',
      category: 'Baking / Community',
      links: ['nw-established-blog', 'nw-recipe-hub', 'nw-new-guide'],
      publishedDate: '2026-10-02',
      educationalRole: 'The single organic inbound link that introduces the new guide to the network.',
    },
    {
      id: 'nw-bakery',
      url: 'https://www.city-oven-bakery.example/classes',
      title: 'City Oven Bakery: Bread Classes and Sourdough Workshops',
      headings: ['Hands-On Bread Classes', 'Sourdough Workshops', 'Visit the Bakery'],
      metaDescription:
        'Bakery classes covering sourdough, rye, and everyday bread for home bakers of all levels.',
      content:
        'City Oven Bakery teaches hands-on bread classes, including a weekend sourdough workshop. Students learn starter maintenance, shaping, scoring, and baking in a professional oven. The bakery also sells flour, starter cultures, and freshly baked loaves.',
      category: 'Baking / Commercial',
      links: ['nw-established-blog', 'nw-flour-brand'],
      publishedDate: '2018-05-20',
      educationalRole: 'Local commercial hub with accumulated citations from across the baking community.',
    },
    {
      id: 'nw-magazine',
      url: 'https://www.baking-monthly.example/issues/sourdough',
      title: 'Baking Monthly: The Sourdough Issue',
      headings: ['Inside the Sourdough Issue', 'Featured Bakers', 'Recipe Index'],
      metaDescription:
        'A magazine issue exploring sourdough baking, featured bakeries, and beginner-friendly recipes.',
      content:
        'The sourdough issue profiles established bakeries, explains wild yeast fermentation, and collects beginner bread baking recipes. Features include a starter maintenance primer and a glossary of baking terms.',
      category: 'Baking / Magazine',
      links: ['nw-established-blog', 'nw-recipe-hub', 'nw-bakery'],
      publishedDate: '2021-03-11',
      educationalRole: 'Editorial authority with an archive that accumulates links over time.',
    },
    {
      id: 'nw-recipe-hub',
      url: 'https://www.recipe-hub.example/baking/bread',
      title: 'Recipe Hub: Bread and Baking Recipes',
      headings: ['Popular Bread Recipes', 'Baking Collections', 'Submit a Recipe'],
      metaDescription:
        'A large collection of bread recipes, baking collections, and reader-submitted favorites.',
      content:
        'Recipe Hub indexes thousands of bread recipes, from sandwich loaves to sourdough boules. Browse collections by technique, browse reader favorites, and submit your own recipe. The hub links to established baking blogs and community forums.',
      category: 'Baking / Recipe Aggregator',
      links: ['nw-magazine', 'nw-established-blog', 'nw-bakery'],
      publishedDate: '2016-08-09',
      educationalRole: 'Large aggregator with substantial inbound authority but shallow topical content.',
    },
    {
      id: 'nw-flour-brand',
      url: 'https://www.stone-mill-flour.example/guides/whole-wheat',
      title: 'Stone Mill Flour: Whole Wheat Baking Guide',
      headings: ['Choosing Whole Wheat Flour', 'Protein and Hydration', 'Milling Notes'],
      metaDescription:
        'Stone Mill Flour explains whole wheat protein, hydration, milling, and baking performance.',
      content:
        'Whole wheat flour absorbs more water and ferments faster than refined flour. This guide explains protein content, extraction rate, hydration adjustments, and how freshly milled flour behaves in sourdough and yeasted breads.',
      category: 'Baking / Ingredient Brand',
      links: ['nw-bakery', 'nw-recipe-hub'],
      publishedDate: '2019-11-04',
      educationalRole: 'Commercial ingredient authority with useful technical content and accumulated links.',
    },
  ],
};
