import { Dataset } from '../../types';

export const linkFarmDataset: Dataset = {
  id: 'link-farm',
  name: 'Scenario 3: Link Farms and Manufactured Authority',
  description:
    'A cluster of thin doorway pages links to a keyword-stuffed casino portal and to one another, trying to manufacture link authority without earning it. Because the network has no trusted inbound citations, PageRank largely discounts it while keyword scoring is still fooled.',
  scenario: 'link-farm',
  defaultQuery: 'online casino bonus',
  testQueries: ['online casino bonus', 'licensed casino review', 'gambling regulator', 'casino welcome offer'],
  keyPageIds: ['lf-casino-spam', 'lf-real-review', 'lf-regulator'],
  educationalNotes:
    'Keyword ranking is fooled by the casino page and doorway pages because they repeat the query and keep documents short. PageRank discounts the reciprocal island: without citations from trusted pages, the farm cannot manufacture real authority, so the regulator and independent review dominate the link-based ranking.',
  pages: [
    {
      id: 'lf-casino-spam',
      url: 'https://www.mega-casino-bonus-zone.example/online-casino-bonus',
      title: 'Online Casino Bonus - Best Online Casino Bonus - Online Casino Bonus Codes',
      headings: [
        'Online Casino Bonus Offers',
        'Claim Your Online Casino Bonus Today',
        'Online Casino Bonus Terms',
      ],
      metaDescription:
        'Online casino bonus online casino bonus codes and online casino bonus offers for every online casino bonus player.',
      content:
        'Looking for an online casino bonus? Our online casino bonus directory lists every online casino bonus, online casino bonus code, and online casino bonus offer. Claim an online casino bonus now and use your online casino bonus to play more. The best online casino bonus is the biggest online casino bonus, and our online casino bonus partners provide an online casino bonus for every player.',
      category: 'Gambling / Spam',
      links: ['lf-doorway-alpha', 'lf-doorway-beta', 'lf-doorway-gamma', 'lf-doorway-delta'],
      educationalRole: 'Keyword-stuffed money page at the centre of the manufactured link network.',
    },
    {
      id: 'lf-doorway-alpha',
      url: 'https://www.bonus-link-directory.example/alpha',
      title: 'Bonus Link Directory Alpha',
      headings: ['Recommended Bonus Links'],
      metaDescription: 'A directory of online casino bonus links and partner resources.',
      content:
        'Welcome to Bonus Link Directory Alpha. Browse our curated list of online casino bonus resources and partner directories. Our directory is updated frequently with new bonus links and promotional pages.',
      category: 'Link Farm / Doorway',
      links: [
        'lf-casino-spam',
        'lf-doorway-beta',
        'lf-doorway-gamma',
        'lf-doorway-delta',
        'lf-operator',
      ],
      educationalRole: 'Thin doorway page whose only purpose is to manufacture links.',
    },
    {
      id: 'lf-doorway-beta',
      url: 'https://www.bonus-link-directory.example/beta',
      title: 'Bonus Link Directory Beta',
      headings: ['Partner Bonus Resources'],
      metaDescription: 'Partner links for online casino bonus offers and casino directories.',
      content:
        'Bonus Link Directory Beta collects partner resources for online casino bonus promotions. Explore our partner network, compare bonus directories, and follow links to participating operators.',
      category: 'Link Farm / Doorway',
      links: [
        'lf-casino-spam',
        'lf-doorway-alpha',
        'lf-doorway-gamma',
        'lf-doorway-delta',
        'lf-operator',
      ],
      educationalRole: 'Another reciprocal doorway node inflating the casino portal PageRank.',
    },
    {
      id: 'lf-doorway-gamma',
      url: 'https://www.bonus-link-directory.example/gamma',
      title: 'Bonus Link Directory Gamma',
      headings: ['Casino Bonus Link Exchange'],
      metaDescription: 'Link exchange page for online casino bonus partners and affiliates.',
      content:
        'Join the Bonus Link Directory Gamma exchange. We link to online casino bonus partners and ask partners to link back. This casino bonus link exchange helps players discover new bonus pages.',
      category: 'Link Farm / Doorway',
      links: [
        'lf-casino-spam',
        'lf-doorway-alpha',
        'lf-doorway-beta',
        'lf-doorway-delta',
        'lf-operator',
      ],
      educationalRole: 'Reciprocal link-exchange page with negligible editorial value.',
    },
    {
      id: 'lf-doorway-delta',
      url: 'https://www.bonus-link-directory.example/delta',
      title: 'Bonus Link Directory Delta',
      headings: ['Best Bonus Links'],
      metaDescription: 'Best online casino bonus links and affiliate partner pages.',
      content:
        'Directory Delta lists the best online casino bonus links selected by our affiliate team. Browse bonus resources, partner directories, and promotional offers across the network.',
      category: 'Link Farm / Doorway',
      links: [
        'lf-casino-spam',
        'lf-doorway-alpha',
        'lf-doorway-beta',
        'lf-doorway-gamma',
        'lf-operator',
      ],
      educationalRole: 'Final doorway node completing a densely reciprocal cluster.',
    },
    {
      id: 'lf-real-review',
      url: 'https://www.gambling-watchdog.org/reviews/licensed-casino-review',
      title: 'Independent Licensed Casino Review: Bonuses, Terms, and Safety',
      headings: [
        'How We Review Licensed Casinos',
        'Understanding Online Casino Bonus Terms',
        'Responsible Gambling Resources',
      ],
      metaDescription:
        'An independent review of licensed online casino bonuses, wagering requirements, and consumer protection.',
      content:
        'Our independent reviewers compare licensed online casino bonus offers using transparent criteria: licence status, wagering requirements, withdrawal limits, complaint history, and responsible gambling tools. A large online casino bonus can be misleading when the terms require forty times wagering. We recommend checking the regulator register before depositing and reading every bonus condition.',
      category: 'Gambling / Independent Review',
      links: ['lf-regulator', 'lf-operator'],
      educationalRole: 'Trustworthy editorial page with genuine consumer guidance but few manufactured links.',
    },
    {
      id: 'lf-regulator',
      url: 'https://www.gambling-commission.gov/consumer/bonus-advertising',
      title: 'Gambling Commission: Consumer Guidance on Bonus Advertising',
      headings: ['Bonus Advertising Rules', 'Checking a Casino Licence', 'Filing a Complaint'],
      metaDescription:
        'Official guidance on online casino bonus advertising, operator licensing, and consumer complaints.',
      content:
        'The gambling regulator publishes rules for online casino bonus advertising. Operators must present significant terms clearly, including wagering requirements and eligibility. Consumers can verify a casino licence, review enforcement actions, and file complaints about misleading bonus promotions.',
      category: 'Government / Regulator',
      links: ['lf-real-review'],
      educationalRole: 'Institutional authority that cites the independent review instead of the spam network.',
    },
    {
      id: 'lf-operator',
      url: 'https://www.licensed-play.example/promotions',
      title: 'Licensed Play Casino: Promotions and Welcome Offer Terms',
      headings: ['Welcome Offer', 'Licence and Consumer Protection', 'Responsible Play'],
      metaDescription:
        'Official promotions page for a licensed casino, including welcome offer terms and responsible-play tools.',
      content:
        'Licensed Play is regulated by the national gambling commission. Our welcome offer includes transparent wagering terms, deposit limits, and cooling-off tools. Read the full bonus conditions and set a budget before playing. Licence details and complaint procedures are published on our consumer protection page.',
      category: 'Gambling / Operator',
      links: ['lf-regulator', 'lf-real-review'],
      educationalRole: 'Legitimate commercial operator that cites the regulator and independent review.',
    },
  ],
};
