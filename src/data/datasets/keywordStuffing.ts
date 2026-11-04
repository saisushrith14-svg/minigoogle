import { Dataset } from '../../types';

export const keywordStuffingDataset: Dataset = {
  id: 'keyword-stuffing',
  name: 'Scenario 1: Keyword Stuffing vs Authority',
  description:
    'Demonstrates how 1990s keyword-based search was manipulated by repeating search terms artificially, and how PageRank neutralizes stuffing by measuring inbound link authority.',
  scenario: 'keyword-stuffing',
  defaultQuery: 'cheap flights',
  testQueries: ['cheap flights', 'flight deals', 'airline travel', 'cheap airfare'],
  keyPageIds: ['ks-spam', 'ks-authentic', 'ks-airline-hub'],
  educationalNotes:
    'In pure Keyword Ranking, "Cheap Flights Spammer" ranks #1 due to extreme keyword frequency and density. However, under PageRank, the page drops to the bottom because nobody links to spam, while the authentic travel guide and airline hub dominate.',
  pages: [
    {
      id: 'ks-spam',
      url: 'https://www.super-discount-flights-portal.xyz/cheap-flights',
      title: 'Cheap Flights! Cheap Flights - Cheap Flight Deals & Cheap Tickets',
      headings: [
        'Cheap Flights Everywhere',
        'Book Cheap Flights Now for Ultra Cheap Flight Prices',
        'Cheap Flights, Cheap Airline Flights, Best Cheap Flights',
      ],
      metaDescription:
        'Cheap flights cheap flights cheap flights! Find cheap flights and cheap flight tickets right here with cheap flights guaranteed.',
      content:
        'Cheap flights are here. If you need cheap flights, we offer cheap flights cheap flights cheap flights. Every day we scan cheap flights for cheap flight lovers looking for cheap flights to Europe, cheap flights to Asia, and cheap flights worldwide. Why pay more when cheap flights are cheap flights? Cheap flights discount cheap flights search cheap flights engine cheap flights portal. Booking cheap flights has never been this filled with cheap flights.',
      category: 'Travel / Spam',
      links: [], // Spammer has zero incoming links and no valid outgoing links
      educationalRole: 'Manipulative keyword-stuffed webpage exploiting pre-1998 term-frequency scoring.',
    },
    {
      id: 'ks-authentic',
      url: 'https://www.traveler-insider.org/guides/finding-affordable-airfare',
      title: 'Global Travel Insider: Comprehensive Guide to Finding Affordable Airfare',
      headings: [
        'How to Find Affordable Airfare',
        'Timing Your Ticket Purchases',
        'Budget Airlines vs Full Service Carriers',
      ],
      metaDescription:
        'Expert guidance on booking economical international and domestic air travel, fare calendars, and airline rewards.',
      content:
        'Traveling on a budget requires patience, flexibility, and understanding airline revenue management. Rather than chasing elusive cheap flights on suspicious aggregator sites, seasoned travelers monitor fare trends across major alliances, leverage seasonal discount windows, and compare airport hubs. This definitive resource outlines proven strategies for securing low cost seats without hidden luggage penalties.',
      category: 'Travel / Editorial',
      links: ['ks-airline-hub', 'ks-consumer-watch'],
      educationalRole: 'High-quality editorial article with balanced natural language and strong incoming reputation.',
    },
    {
      id: 'ks-airline-hub',
      url: 'https://www.skywings-international.com/flights',
      title: 'SkyWings International Airlines - Flight Schedules & Destinations',
      headings: [
        'SkyWings Flight Network',
        'Book Direct for Guaranteed Lowest Fares',
        'Frequent Flyer Rewards Program',
      ],
      metaDescription:
        'Official website of SkyWings International. Search passenger routes, manage flight reservations, and access exclusive travel benefits.',
      content:
        'Welcome to SkyWings International Airlines. We operate direct scheduled flights connecting 120 global destinations across North America, Europe, and Asia. Book flight tickets directly through our verified booking engine for flexible fare options, complimentary seat selection, and tier points.',
      category: 'Airlines / Commercial',
      links: ['ks-authentic', 'ks-airport-guide'],
      educationalRole: 'Major commercial brand serving as an authoritative domain hub with high backlink count.',
    },
    {
      id: 'ks-travel-forum',
      url: 'https://www.flyer-community.net/forum/best-airfare-tactics',
      title: 'Flyer Community Discussion: Reliable Tactics for Low Fare Travel',
      headings: [
        'Community Forum: Flight Deals & Recommendations',
        'Vetted Travel Booking Resources',
      ],
      metaDescription:
        'Community discussion threads discussing safe booking practices, airfare trackers, and recommended travel guides.',
      content:
        'Discussion thread: Where do experienced travelers find genuine flight savings? Members consistently recommend reading the Global Travel Insider guide before booking. Always steer clear of generic search doorway pages that spam cheap flights without providing real customer support.',
      category: 'Community Forum',
      links: ['ks-authentic', 'ks-consumer-watch', 'ks-airline-hub'],
      educationalRole: 'Grassroots community portal directing PageRank toward trusted authorities.',
    },
    {
      id: 'ks-consumer-watch',
      url: 'https://www.consumer-travel-defense.gov/advisories/ticket-scams',
      title: 'Bureau of Consumer Protection: Airline Ticket Scams and Deceptive Sites',
      headings: [
        'Consumer Travel Advisory',
        'Identifying Deceptive Ticket Gateways',
        'Official Resources for Safe Travel Booking',
      ],
      metaDescription:
        'Official consumer defense bulletin warning against keyword-stuffed clone booking portals and highlighting verified guides.',
      content:
        'The Consumer Protection Agency issues guidance on counterfeit flight ticketing websites. Fraudulent portals frequently repeat search keywords like cheap flights to game early search indexes. Consumers are urged to verify airfare through direct airline platforms and vetted editorial resources such as Global Travel Insider.',
      category: 'Government / Regulatory',
      links: ['ks-authentic', 'ks-airline-hub'],
      educationalRole: 'High-authority institutional regulator whose outgoing citations confer immense PageRank prestige.',
    },
    {
      id: 'ks-airport-guide',
      url: 'https://www.metro-metropolitan-airport.com/airlines',
      title: 'Metropolitan International Airport - Airline Carriers and Terminals',
      headings: [
        'Terminal Directory',
        'Participating Airline Carriers',
        'Passenger Ground Transportation',
      ],
      metaDescription:
        'Terminal maps, check-in gates, and airline operator listings for Metropolitan International Airport.',
      content:
        'Metropolitan Airport serves 40 million travelers annually. Operating airlines include SkyWings International at Terminal 2. Passengers arriving for domestic or international flights should arrive three hours prior to departure.',
      category: 'Infrastructure',
      links: ['ks-airline-hub'],
      educationalRole: 'Supporting structural node linking directly to primary corporate authority.',
    },
    {
      id: 'ks-budget-backpacker',
      url: 'https://www.budget-backpacker-journal.com/planning',
      title: 'The Budget Backpacker: How to Travel the World on $30 a Day',
      headings: [
        'Long Term Travel Logistics',
        'Saving Money on Intercontinental Flights',
      ],
      metaDescription:
        'Backpacker diary detailing budget transportation, train passes, and strategic flight booking.',
      content:
        'Backpacking long term requires ruthless budget discipline. Securing budget flights between continents is often your largest single expense. We recommend reading the Global Travel Insider handbook and checking flyer forums before reserving seats.',
      category: 'Travel / Blog',
      links: ['ks-authentic', 'ks-travel-forum'],
      educationalRole: 'Independent blog contributing an organic inbound link to the authentic guide.',
    },
  ],
};

