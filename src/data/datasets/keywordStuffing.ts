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
    {
      id: 'ks-hotel-aggregator',
      url: 'https://www.worldwide-lodging-network.org/accommodations',
      title: 'Worldwide Lodging Network: Verified Hotel and Airfare Packages',
      headings: [
        'Hotel & Flight Package Reservations',
        'Partner Airlines',
        'Travel Advice',
      ],
      metaDescription:
        'Independent booking directory for global hotels, lodging discounts, and airline partner connections.',
      content:
        'Planning an international itinerary requires coordinating both lodging and air transportation. Rather than trusting unverified discount portals that spam search engines, our directory links directly to certified carriers like SkyWings International and trusted travel advisory publications like Global Travel Insider.',
      category: 'Travel / Lodging',
      links: ['ks-airline-hub', 'ks-authentic'],
      educationalRole: 'Commercial aggregator linking to legitimate corporate airline hubs and consumer editorial sources.',
    },
    {
      id: 'ks-tourism-board',
      url: 'https://www.euro-tourism-commission.eu/visitor-guide',
      title: 'European Tourism Commission - Official Visitor Transit & Flight Guide',
      headings: [
        'Visiting Europe',
        'International Flight Gateways',
        'Travel Advisory',
      ],
      metaDescription:
        'Official European visitor travel bureau providing comprehensive guidelines for trans-Atlantic air transit and rail connections.',
      content:
        'Welcome to Europe. International visitors arriving by air will find major arrival points at Metropolitan International Airport. For reliable and safe ticketing advice, visitors should consult the Consumer Protection Bureau alerts and the Global Travel Insider guide to avoid counterfeit ticket schemes.',
      category: 'Government / Tourism',
      links: ['ks-airport-guide', 'ks-consumer-watch', 'ks-authentic'],
      educationalRole: 'Authoritative governmental tourism portal transmitting substantial link authority to transportation and editorial nodes.',
    },
    {
      id: 'ks-aviation-news',
      url: 'https://www.commercial-aviation-weekly.com/industry-analysis',
      title: 'Commercial Aviation Weekly: Airline Fleet Capacity and Ticket Pricing Trends',
      headings: [
        'Airline Industry Financial Analysis',
        'Yield Management Strategies',
        'Carrier Route Networks',
      ],
      metaDescription:
        'Industry trade journal analyzing airline seat yield management, hub-and-spoke carrier economics, and route expansions.',
      content:
        'Major commercial airlines, including SkyWings International, have shifted passenger ticket pricing toward dynamic computer yield algorithms. Industry analysts point out that legitimate consumer discounts emerge during seasonal lull periods rather than through predatory fly-by-night discount brokers.',
      category: 'News / Industry',
      links: ['ks-airline-hub', 'ks-travel-forum'],
      educationalRole: 'Trade journalism node establishing contextual industry linkages to primary airlines and consumer forums.',
    },
    {
      id: 'ks-fare-tracker',
      url: 'https://www.farewatch-alerts-bulletin.net/tracking',
      title: 'FareWatch Community: Real-Time Airfare Fluctuation & Price Trend Alerts',
      headings: [
        'Airfare Price Tracker',
        'Recent Route Reductions',
        'Community Discussions',
      ],
      metaDescription:
        'Crowdsourced price alert service tracking daily flight fare reductions and seat sale announcements.',
      content:
        'FareWatch tracks fluctuating airfare across hundreds of routes daily. Our community members share active discount discoveries on the Flyer Community forum. Remember to compare direct SkyWings fares with verified advice from Global Travel Insider before finalizing bookings.',
      category: 'Community / Tool',
      links: ['ks-travel-forum', 'ks-authentic', 'ks-airline-hub'],
      educationalRole: 'Community tool node driving interactive traffic and link authority to editorial advice and forums.',
    },
    {
      id: 'ks-rail-connections',
      url: 'https://www.trans-railway-transit.org/airport-express',
      title: 'Trans-Continental Rail: High-Speed Airport Express Connections',
      headings: [
        'Airport Rail Express Services',
        'Integrated Air-Rail Tickets',
        'Metropolitan Hubs',
      ],
      metaDescription:
        'High-speed intercity passenger rail network connecting city centers directly to major international airport terminals.',
      content:
        'The Metropolitan Express connects the downtown central station directly to Metropolitan International Airport Terminal 2 in under 20 minutes. Passengers flying on partner carriers such as SkyWings can check their luggage directly at the city rail terminal.',
      category: 'Infrastructure / Transit',
      links: ['ks-airport-guide', 'ks-airline-hub'],
      educationalRole: 'Transportation infrastructure node tightly linking airport and airline authority nodes.',
    },
    {
      id: 'ks-credit-cards',
      url: 'https://www.frequent-points-advisor.com/credit-rewards',
      title: 'Points & Miles Advisor: Maximizing Frequent Flyer Credit Rewards',
      headings: [
        'Earning Airline Miles',
        'Transfer Partners & Redemptions',
        'Avoiding Reward Traps',
      ],
      metaDescription:
        'Credit card point redemption strategies for airline frequent flyer loyalty programs.',
      content:
        'Earning airline reward points allows frequent flyers to travel internationally for pennies on the dollar. Members of our flyer community regularly share transfer maximization techniques on the Flyer Community board. When redeeming points, always check availability directly on SkyWings International or consult the Global Travel Insider.',
      category: 'Finance / Travel',
      links: ['ks-travel-forum', 'ks-airline-hub', 'ks-authentic'],
      educationalRole: 'Financial niche blog reinforcing the cluster around frequent flyer forums and authentic guides.',
    },
    {
      id: 'ks-weather-bureau',
      url: 'https://www.aviation-weather-forecasts.gov/flight-conditions',
      title: 'National Weather Service: Aviation Flight Hazards & Terminal Visibility',
      headings: [
        'Regional Radar & Terminal Weather',
        'Turbulence & Jet Stream Advisories',
        'Airport Operations',
      ],
      metaDescription:
        'Official national meteorological forecasts and runway visibility conditions for commercial airport hubs.',
      content:
        'Terminal weather reports for Metropolitan International Airport indicate clear runways and optimal flight routing conditions for regional and trans-oceanic operations. Flight dispatchers and commercial passenger carriers monitor these bulletins continuously.',
      category: 'Government / Science',
      links: ['ks-airport-guide'],
      educationalRole: 'Authoritative government weather service providing high-prestige unidirectional citation into airport hub.',
    },
    {
      id: 'ks-luggage-gear',
      url: 'https://www.nomadic-gear-reviews.com/lightweight-carryon',
      title: 'Nomadic Gear: Ultralight Carry-On Luggage & Packing Guides',
      headings: [
        'Carry-On Dimensions & Restrictions',
        'Tested Travel Bags',
        'Packing Strategies',
      ],
      metaDescription:
        'Tested reviews of durable carry-on bags and luggage weight limitations for international airline travel.',
      content:
        'Traveling light is the secret to stress-free journeying. Avoid expensive excess baggage fees charged by commercial airlines like SkyWings by adhering to strict carry-on measurements. For budget travel planning advice, see our friends at The Budget Backpacker and the Global Travel Insider guide.',
      category: 'Travel / Gear',
      links: ['ks-budget-backpacker', 'ks-authentic', 'ks-airline-hub'],
      educationalRole: 'Consumer lifestyle blog creating natural interlinks across travel blogs and editorial hubs.',
    },
  ],
};

