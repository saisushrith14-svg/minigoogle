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
        'Feeding Schedule and Hydration in the Sourdough Starter Guide',
        'Troubleshooting Your Sourdough Starter Guide',
      ],
      metaDescription:
        'A practical sourdough starter guide covering flour, hydration, feeding schedules, troubleshooting, and the first bake.',
      content:
        'This comprehensive sourdough starter guide walks a beginner from day one through the first loaf. Mix whole wheat flour and water, discard half each day, and feed at a predictable schedule. A healthy starter doubles within six hours, smells pleasantly sour, and bubbles throughout. The sourdough starter guide explains hydration ratios, temperature, troubleshooting, and how to adapt feeding when your kitchen is cold. Every step of our sourdough starter guide includes a clear rationale so new bakers can diagnose problems rather than follow a rigid recipe.',
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
        'Community members discuss feeding schedules, mold, hooch, and sluggish sourdough starters. Several readers recommend the new Flour and Water baking tutorial for its clear troubleshooting section. Others share their own beginner bread baking experiments and photos.',
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
    {
      id: 'nw-culinary-institute',
      url: 'https://www.national-culinary-arts.edu/baking',
      title: 'National Culinary Arts Academy: Classical Baking Curricula',
      headings: [
        'Professional Bakery Arts',
        'Fermentation & Yeast Biology',
        'Alumni Bakeries',
      ],
      metaDescription:
        'Accredited vocational diploma in artisan bakery production and fermentation science.',
      content:
        'The National Culinary Arts Academy trains master bakers in European hearth traditions. Our curriculum covers dough rheology, long fermentation techniques, and commercial deck oven operations. Many of our alumni founded celebrated bakeries like Artisan Hearth Craft Bakery.',
      category: 'Education / Culinary',
      links: ['nw-bakery', 'nw-recipe-hub', 'nw-magazine'],
      educationalRole: 'Prestigious culinary institution endowing established bakeries and magazines with massive domain authority.',
    },
    {
      id: 'nw-yeast-lab',
      url: 'https://www.fermentation-science-institute.org/wild-cultures',
      title: 'Fermentation Science Institute: Microbial Ecology of Wild Cultures',
      headings: [
        'Lactobacillus & Wild Yeast Symbiosis',
        'Acidity Profiles',
        'Grain Substrates',
      ],
      metaDescription:
        'Peer-reviewed microbiological research on wild bacterial cultures and sourdough grain ecology.',
      content:
        'Academic study of microbial kinetics in traditional starters. Research demonstrates that symbiotic interactions between wild yeasts and lactic acid bacteria determine structural crumb and shelf longevity. We collaborate closely with Stone Mill Flour researchers.',
      category: 'Science / Food Biology',
      links: ['nw-flour-brand', 'nw-bakery'],
      educationalRole: 'Scientific authority providing high-trust backlinks to established grain millers.',
    },
    {
      id: 'nw-bread-machine',
      url: 'https://www.home-baking-equipment-reviews.com/deck-ovens',
      title: 'Home Baking Equipment: Dutch Ovens, Baking Stones & Peel Reviews',
      headings: [
        'Enamel Dutch Ovens for Crust',
        'Steam Injection vs Cloche',
        'Baker Forum Reviews',
      ],
      metaDescription:
        'Independent ratings of cast iron Dutch ovens, clay cloches, and proofing bannetons for home bakers.',
      content:
        'Achieving blistered crusts at home requires trapped steam. We evaluate top Dutch ovens and baking stones against commercial standards. Home bakers in the community actively review kitchen setups on the Bakers Corner forum.',
      category: 'Equipment / Reviews',
      links: ['nw-forum', 'nw-recipe-hub'],
      educationalRole: 'Equipment review blog directing link traffic into established community boards.',
    },
    {
      id: 'nw-farmer-coop',
      url: 'https://www.heritage-grain-growers.coop/varieties',
      title: 'Heritage Grain Growers Cooperative: Ancient Einkorn and Spelt Varieties',
      headings: [
        'Ancient Grain Revival',
        'Sustainable Soil Management',
        'Certified Millers',
      ],
      metaDescription:
        'Farmer cooperative preserving heirloom wheat varieties, spelt, and stone-ground heritage grains.',
      content:
        'Our farmer members cultivate organic heritage grains with complex flavor profiles. We supply certified stone-grind facilities including Stone Mill Flour to support artisan bakers nationwide. Read industry features in Pastry and Hearth Illustrated.',
      category: 'Agriculture / Cooperative',
      links: ['nw-flour-brand', 'nw-magazine'],
      educationalRole: 'Agricultural cooperative node linking to certified millers and print magazines.',
    },
    {
      id: 'nw-cookbook-publisher',
      url: 'https://www.gastronomy-press-publishing.com/baking-titles',
      title: 'Gastronomy Press: Award-Winning Bread and Pastry Books',
      headings: [
        'New Releases',
        'Classic Baking Compendiums',
        'Featured Food Authors',
      ],
      metaDescription:
        'Publisher of definitive culinary manuals, bread anthologies, and home baking guides.',
      content:
        'Gastronomy Press is proud to publish James Beard award-winning culinary literature. Our titles include the celebrated hearth baking memoirs from Grandma’s Rustic Kitchen and professional guides curated with the National Culinary Academy.',
      category: 'Publishing / Books',
      links: ['nw-established-blog', 'nw-culinary-institute'],
      educationalRole: 'Prestigious book publisher cementing the reputation of established food bloggers.',
    },
    {
      id: 'nw-pastry-chef',
      url: 'https://www.chefpierre-viennoiserie.com/laminated-dough',
      title: 'Chef Pierre: The Art of Laminated Croissants & Brioche',
      headings: [
        'Butter Lamination Techniques',
        'Cold Proofing Schedules',
        'Artisan Bakery Tours',
      ],
      metaDescription:
        'Master pastry chef notes on butter lamination, French brioche, and artisan morning breads.',
      content:
        'Mastering laminated pastry requires precise temperature control and European butter with high fat content. When selecting flour, we depend on stone-ground selections from Stone Mill Flour and draw inspiration from the Bakers Corner forum.',
      category: 'Culinary / Masterclass',
      links: ['nw-flour-brand', 'nw-forum', 'nw-bakery'],
      educationalRole: 'Specialty chef portfolio sharing links with community forums and artisan suppliers.',
    },
    {
      id: 'nw-culinary-history',
      url: 'https://www.bread-history-archives.org/ancient-fermentation',
      title: 'Bread History Archives: Ten Thousand Years of Fermented Grain',
      headings: [
        'Neolithic Flatbreads to Leavened Loaves',
        'The Roman Panis Quadratus',
        'Medieval Guilds',
      ],
      metaDescription:
        'Historical documentation of grain domestication, wild yeast fermentation, and communal town ovens.',
      content:
        'Tracing the historical trajectory of human leavened bread from ancient Egypt through medieval communal ovens. This historical research project documents how natural sourdough cultures sustained civilizations for millennia before industrial yeast.',
      category: 'History / Food Culture',
      links: ['nw-established-blog', 'nw-magazine'],
      educationalRole: 'Historical cultural archive linking to veteran food writers and culinary magazines.',
    },
    {
      id: 'nw-home-cooks',
      url: 'https://www.suburban-home-kitchen.net/weekend-bakes',
      title: 'Suburban Home Kitchen: Weekend Family Baking & Sourdough Adventures',
      headings: [
        'Weekend Family Recipes',
        'Feeding the Family Starter',
        'Favorite Bread Websites',
      ],
      metaDescription:
        'Parent and home cook blog sharing accessible family baking schedules and easy pantry recipes.',
      content:
        'Balancing work and weekend baking is easier with predictable sourdough schedules. We love Grandma’s Rustic Kitchen for warmth and comfort, and we frequently check the recipe hub when planning weekend family meals.',
      category: 'Lifestyle / Food',
      links: ['nw-established-blog', 'nw-recipe-hub', 'nw-new-guide'],
      educationalRole: 'Friendly amateur blog that discovered the new guide, providing its very first organic inbound backlink.',
    },
  ],
};
